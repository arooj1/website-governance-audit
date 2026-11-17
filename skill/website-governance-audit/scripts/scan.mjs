#!/usr/bin/env node
// Website governance evidence scanner.
//
// Loads a site the way a first-time visitor would, clicks nothing, and records
// what the site does before anyone has agreed to anything: cookies and storage,
// third-party requests, security headers, policy pages, forms, media, AI-content
// labels, crawler files and accessibility problems.
//
// It collects EVIDENCE only. Deciding which laws apply and whether something is a
// breach is the job of the skill (SKILL.md), which reads this file's output.
//
// Usage: node scan.mjs <url> [--out dir] [--max-pages 12]

import { chromium, devices } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
import path from "node:path";

const VERSION = "1.0.0";

const args = process.argv.slice(2);
const target = args.find((a) => !a.startsWith("--"));
const opt = (name, dflt) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : dflt;
};
if (!target) {
  console.error("Usage: node scan.mjs <url> [--out dir] [--max-pages 12]");
  process.exit(2);
}
const startUrl = new URL(target.includes("://") ? target : `https://${target}`);
const outDir = opt("out", path.join("evidence", startUrl.hostname));
const maxPages = Number(opt("max-pages", 12));
fs.mkdirSync(outDir, { recursive: true });

// Known third parties, grouped by what they mean for governance.
// Category drives the skill's analysis: "analytics" and "advertising" usually need consent
// in the EU/UK/Quebec; "fonts" and "cdn" send the visitor's IP address to a third party.
const VENDORS = [
  [/google-analytics\.com|analytics\.google\.com/, "Google Analytics", "analytics"],
  [/googletagmanager\.com/, "Google Tag Manager", "tag-manager"],
  [/doubleclick\.net|googlesyndication\.com|googleadservices\.com/, "Google Ads", "advertising"],
  [/facebook\.(net|com)|fbcdn\.net/, "Meta (Facebook) Pixel", "advertising"],
  [/connect\.facebook\.net/, "Meta (Facebook) Pixel", "advertising"],
  [/linkedin\.com\/(px|li)|licdn\.com|snap\.licdn\.com|px\.ads\.linkedin\.com/, "LinkedIn Insight", "advertising"],
  [/analytics\.tiktok\.com|tiktok\.com\/i18n\/pixel/, "TikTok Pixel", "advertising"],
  [/hotjar\.(com|io)/, "Hotjar", "session-recording"],
  [/clarity\.ms/, "Microsoft Clarity", "session-recording"],
  [/fullstory\.com/, "FullStory", "session-recording"],
  [/plausible\.io/, "Plausible", "analytics-cookieless"],
  [/cloudflareinsights\.com|static\.cloudflareinsights\.com/, "Cloudflare Web Analytics", "analytics-cookieless"],
  [/fonts\.googleapis\.com|fonts\.gstatic\.com/, "Google Fonts", "fonts"],
  [/use\.typekit\.net|p\.typekit\.net/, "Adobe Fonts", "fonts"],
  [/youtube\.com|youtube-nocookie\.com|ytimg\.com/, "YouTube", "embedded-media"],
  [/vimeo\.com|vimeocdn\.com/, "Vimeo", "embedded-media"],
  [/calendly\.com/, "Calendly", "booking"],
  [/stripe\.com|stripe\.network/, "Stripe", "payments"],
  [/paypal\.com|paypalobjects\.com/, "PayPal", "payments"],
  [/hubspot\.com|hs-scripts\.com|hs-analytics\.net|hsforms\.(com|net)/, "HubSpot", "marketing-automation"],
  [/mailchimp\.com|list-manage\.com|chimpstatic\.com/, "Mailchimp", "email-marketing"],
  [/intercom\.io|intercomcdn\.com/, "Intercom", "chat"],
  [/tawk\.to/, "Tawk.to", "chat"],
  [/crisp\.chat/, "Crisp", "chat"],
  [/zdassets\.com|zendesk\.com/, "Zendesk", "chat"],
  [/recaptcha\.net|google\.com\/recaptcha|gstatic\.com\/recaptcha/, "Google reCAPTCHA", "security-captcha"],
  [/challenges\.cloudflare\.com/, "Cloudflare Turnstile", "security-captcha"],
  [/wixstatic\.com|parastorage\.com|wix\.com/, "Wix platform", "platform"],
  [/squarespace(-cdn)?\.com/, "Squarespace platform", "platform"],
  [/shopify\.com|shopifycdn\.com|cdn\.shopify\.com/, "Shopify platform", "platform"],
  [/wp\.com|wordpress\.com/, "WordPress.com", "platform"],
  [/jsdelivr\.net|unpkg\.com|cdnjs\.cloudflare\.com/, "Public CDN", "cdn"],
  [/cookiebot\.com|consensu\.org|onetrust\.com|cookielaw\.org|cookieyes\.com|termly\.io|iubenda\.com|usercentrics\.eu/, "Consent management platform", "consent"],
];
const classify = (host, url) => {
  for (const [re, name, cat] of VENDORS) if (re.test(host) || re.test(url)) return { name, category: cat };
  return { name: null, category: "unknown-third-party" };
};

const sameSite = (a, b) => {
  const base = (h) => h.split(".").slice(-2).join(".");
  return base(a) === base(b);
};

const POLICY_WORDS = /privacy|cookie|terms|legal|accessib|disclaimer|imprint|impressum|policy|confidential|politique|refund|ai[-\s]?(use|policy|statement)/i;
const AI_LABEL_WORDS = /\b(ai[-\s]generated|generated (by|with) (ai|artificial)|made with ai|created with ai|synthetic (video|image|media)|ai[-\s]assisted|artificially generated|created using (runway|sora|midjourney|dall|firefly|veo|kling|pika))\b/i;

const evidence = {
  scanner: { name: "website-governance-audit", version: VERSION },
  target: startUrl.href,
  scanned_at: new Date().toISOString(),
  method: "Fresh browser profile, no clicks, no consent given. Cookies and requests below are what a first-time visitor gets before making any choice.",
  transport: {},
  crawler_files: {},
  pages: [],
  cookies_before_consent: [],
  storage_before_consent: {},
  third_parties: [],
  consent_banner: null,
  accessibility: [],
  errors: [],
};

const browser = await chromium.launch();
try {
  // ---------- Transport: does http redirect to https? ----------
  const ctxPlain = await browser.newContext();
  try {
    const httpUrl = new URL(startUrl.href);
    httpUrl.protocol = "http:";
    const r = await ctxPlain.request.get(httpUrl.href, { maxRedirects: 0, failOnStatusCode: false, timeout: 20000 });
    evidence.transport.http_status = r.status();
    evidence.transport.http_redirects_to = r.headers()["location"] || null;
  } catch (e) {
    evidence.transport.http_error = String(e.message || e).slice(0, 200);
  }

  // ---------- Crawler and policy files ----------
  for (const f of ["/robots.txt", "/llms.txt", "/ai.txt", "/sitemap.xml", "/.well-known/security.txt"]) {
    try {
      const r = await ctxPlain.request.get(new URL(f, startUrl).href, { failOnStatusCode: false, timeout: 20000 });
      const body = r.ok() ? (await r.text()).slice(0, 6000) : null;
      const ct = r.headers()["content-type"] || "";
      // Some hosts answer every path with the homepage; don't count HTML as a real robots/llms file.
      const looksReal = r.ok() && !(f !== "/sitemap.xml" && /text\/html/i.test(ct));
      evidence.crawler_files[f] = { status: r.status(), present: looksReal, content_type: ct, content: looksReal ? body : null };
    } catch (e) {
      evidence.crawler_files[f] = { error: String(e.message || e).slice(0, 200) };
    }
  }
  await ctxPlain.close();

  // ---------- First visit: cookies, storage, requests, banner ----------
  const ctx = await browser.newContext({ ...devices["Desktop Chrome"], locale: "en-CA" });
  const requests = new Map(); // host -> {count, sample, classify, pages:Set}
  let currentPage = startUrl.href;
  ctx.on("request", (req) => {
    try {
      const u = new URL(req.url());
      if (!/^https?:$/.test(u.protocol)) return;
      const host = u.hostname;
      if (!requests.has(host)) requests.set(host, { host, count: 0, sample_urls: [], first_seen_on: currentPage, resource_types: new Set() });
      const e = requests.get(host);
      e.count++;
      e.resource_types.add(req.resourceType());
      if (e.sample_urls.length < 3) e.sample_urls.push(req.url().slice(0, 200));
    } catch {}
  });

  const page = await ctx.newPage();
  const resp = await page.goto(startUrl.href, { waitUntil: "load", timeout: 45000 });
  await page.waitForTimeout(4000); // let late scripts and trackers fire
  const finalUrl = new URL(page.url());
  evidence.final_url = finalUrl.href;
  evidence.transport.https = finalUrl.protocol === "https:";
  const h = resp ? resp.headers() : {};
  evidence.security_headers = {
    "strict-transport-security": h["strict-transport-security"] || null,
    "content-security-policy": h["content-security-policy"] ? h["content-security-policy"].slice(0, 400) : null,
    "x-content-type-options": h["x-content-type-options"] || null,
    "referrer-policy": h["referrer-policy"] || null,
    "permissions-policy": h["permissions-policy"] ? h["permissions-policy"].slice(0, 300) : null,
    "x-frame-options": h["x-frame-options"] || null,
    server: h["server"] || null,
  };

  // Screenshot of what a first-time visitor sees (shows whether a consent banner exists).
  await page.screenshot({ path: path.join(outDir, "first-visit-desktop.png") });

  // Consent banner heuristic: a visible element mentioning cookies/consent, and its buttons.
  evidence.consent_banner = await page.evaluate(() => {
    const words = /cookie|consent|privacy choices|we use .*(cookies|tracking)|accept all|reject all|manage preferences/i;
    const els = Array.from(document.querySelectorAll("body *")).filter((el) => {
      if (el.children.length > 30) return false;
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      if (r.width < 200 || r.height < 30 || s.visibility === "hidden" || s.display === "none") return false;
      const fixed = ["fixed", "sticky"].includes(s.position) || el.getAttribute("role") === "dialog";
      return fixed && words.test(el.innerText || "");
    });
    if (!els.length) return { detected: false };
    const el = els[0];
    const buttons = Array.from(el.querySelectorAll("button, a, [role=button]")).map((b) => (b.innerText || "").trim()).filter(Boolean).slice(0, 8);
    return {
      detected: true,
      text: (el.innerText || "").trim().slice(0, 600),
      buttons,
      has_reject: buttons.some((b) => /reject|decline|refuse|necessary only|deny/i.test(b)),
      has_accept: buttons.some((b) => /accept|agree|allow|ok|got it/i.test(b)),
    };
  });

  // ---------- Crawl a handful of same-site pages, policy pages first ----------
  const links = await page.$$eval("a[href]", (as) => as.map((a) => ({ href: a.href, text: (a.innerText || a.getAttribute("aria-label") || "").trim().slice(0, 80) })));
  const seen = new Set([finalUrl.origin + finalUrl.pathname]);
  const queue = [];
  for (const l of links) {
    try {
      const u = new URL(l.href);
      if (u.origin !== finalUrl.origin) continue;
      const key = u.origin + u.pathname;
      if (seen.has(key) || /\.(pdf|jpg|jpeg|png|webp|mp4|zip)$/i.test(u.pathname)) continue;
      seen.add(key);
      queue.push({ url: key, text: l.text, policy: POLICY_WORDS.test(u.pathname + " " + l.text) });
    } catch {}
  }
  queue.sort((a, b) => Number(b.policy) - Number(a.policy));
  const toVisit = [{ url: finalUrl.href, text: "home", policy: false }, ...queue].slice(0, maxPages);

  for (const [i, item] of toVisit.entries()) {
    currentPage = item.url;
    const p = i === 0 ? page : await ctx.newPage();
    try {
      if (i > 0) {
        await p.goto(item.url, { waitUntil: "load", timeout: 45000 });
        await p.waitForTimeout(1500);
      }
      const data = await p.evaluate(({ AI_SRC, POLICY_SRC }) => {
        const AI = new RegExp(AI_SRC, "i");
        const POLICY = new RegExp(POLICY_SRC, "i");
        const text = document.body ? document.body.innerText : "";
        const abs = (u) => { try { return new URL(u, location.href).href; } catch { return u; } };
        const imgs = Array.from(document.images);
        const forms = Array.from(document.forms).map((f) => ({
          action: f.getAttribute("action") ? abs(f.getAttribute("action")) : null,
          method: (f.getAttribute("method") || "get").toLowerCase(),
          fields: Array.from(f.elements).filter((e) => e.name || e.id).map((e) => ({
            name: e.name || e.id, type: e.type || e.tagName.toLowerCase(), required: !!e.required,
            prechecked: e.type === "checkbox" ? !!e.defaultChecked : undefined,
            label: (e.labels && e.labels[0] ? e.labels[0].innerText : e.getAttribute("aria-label") || e.placeholder || "").trim().slice(0, 120),
          })).slice(0, 25),
          nearby_text: (f.innerText || "").trim().slice(0, 500),
          links_privacy: Array.from(f.querySelectorAll("a")).some((a) => /privacy/i.test(a.innerText + a.href)),
        }));
        const videos = Array.from(document.querySelectorAll("video")).map((v) => ({
          src: abs(v.currentSrc || (v.querySelector("source") || {}).src || v.src || ""),
          autoplay: v.autoplay, muted: v.muted, loop: v.loop, controls: v.controls,
          has_captions_track: !!v.querySelector("track[kind=captions], track[kind=subtitles]"),
          aria_hidden: v.getAttribute("aria-hidden"),
          label_nearby: (() => { const box = v.closest("section, figure, div"); return box ? AI.test(box.innerText || "") : false; })(),
        }));
        const iframes = Array.from(document.querySelectorAll("iframe")).map((f) => ({ src: abs(f.src || ""), title: f.title || null }));
        const testimonials = Array.from(document.querySelectorAll("blockquote, [class*=testimonial], [class*=review], figure.quote")).map((q) => ({
          text: (q.innerText || "").trim().slice(0, 300),
        })).slice(0, 12);
        const ld = Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map((s) => {
          try { const j = JSON.parse(s.textContent); const g = j["@graph"] || [j]; return g.map((x) => x["@type"]); } catch { return ["(invalid JSON-LD)"]; }
        }).flat();
        const footer = document.querySelector("footer");
        return {
          title: document.title,
          lang: document.documentElement.lang || null,
          hreflang: Array.from(document.querySelectorAll('link[rel=alternate][hreflang]')).map((l) => l.hreflang),
          meta_generator: (document.querySelector('meta[name=generator]') || {}).content || null,
          meta_robots: (document.querySelector('meta[name=robots]') || {}).content || null,
          policy_links: Array.from(document.querySelectorAll("a[href]")).filter((a) => POLICY.test(a.innerText + " " + a.getAttribute("href"))).map((a) => ({ text: a.innerText.trim().slice(0, 60), href: abs(a.getAttribute("href")) })).slice(0, 20),
          mailto: Array.from(document.querySelectorAll('a[href^="mailto:"]')).map((a) => a.getAttribute("href").split("?")[0]).filter((v, i, s) => s.indexOf(v) === i),
          tel: Array.from(document.querySelectorAll('a[href^="tel:"]')).map((a) => a.getAttribute("href")).filter((v, i, s) => s.indexOf(v) === i),
          images: { total: imgs.length, missing_alt: imgs.filter((im) => !im.hasAttribute("alt")).length },
          forms, videos, iframes, testimonials,
          ai_label_found: AI.test(text),
          ai_label_snippets: (text.match(new RegExp(".{0,60}" + AI_SRC + ".{0,60}", "gi")) || []).slice(0, 5),
          structured_data_types: ld,
          footer_text: footer ? footer.innerText.trim().slice(0, 400) : null,
          copyright_line: (text.match(/(©|\(c\)|copyright)[^\n]{0,140}/i) || [null])[0],
          text_excerpt: text.slice(0, 1500),
          word_count: text.split(/\s+/).filter(Boolean).length,
        };
      }, { AI_SRC: AI_LABEL_WORDS.source, POLICY_SRC: POLICY_WORDS.source });
      const isPolicy = i > 0 && (item.policy || POLICY_WORDS.test(data.title || ""));
      if (isPolicy) {
        // Keep full policy text so the skill can check what the policy actually says.
        data.full_text = (await p.evaluate(() => document.body.innerText)).slice(0, 30000);
      }
      evidence.pages.push({ url: item.url, link_text: item.text, is_policy_page: isPolicy, ...data });

      // Accessibility: automated checks on the first few pages only (automated tools catch roughly a third of issues).
      if (i < 4) {
        const axe = await new AxeBuilder({ page: p }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
        evidence.accessibility.push({
          url: item.url,
          violations: axe.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, wcag: v.tags.filter((t) => /^wcag\d/.test(t)), nodes: v.nodes.length, example: v.nodes[0] ? v.nodes[0].target.join(" ") : null, helpUrl: v.helpUrl })),
          passes: axe.passes.length,
          incomplete: axe.incomplete.map((v) => v.id),
        });
      }
    } catch (e) {
      evidence.errors.push({ url: item.url, error: String(e.message || e).slice(0, 300) });
    } finally {
      if (i > 0) await p.close();
    }
  }

  // Mobile first-visit screenshot.
  const mctx = await browser.newContext({ ...devices["iPhone 13"] });
  const mp = await mctx.newPage();
  try {
    await mp.goto(finalUrl.href, { waitUntil: "load", timeout: 45000 });
    await mp.waitForTimeout(2500);
    await mp.screenshot({ path: path.join(outDir, "first-visit-mobile.png") });
  } catch (e) { evidence.errors.push({ url: "mobile screenshot", error: String(e.message || e).slice(0, 200) }); }
  await mctx.close();

  // ---------- Cookies and storage after browsing, still without consent ----------
  const cookies = await ctx.cookies();
  evidence.cookies_before_consent = cookies.map((c) => {
    const host = c.domain.replace(/^\./, "");
    return {
      name: c.name, domain: c.domain, party: sameSite(host, finalUrl.hostname) ? "first" : "third",
      expires: c.expires > 0 ? new Date(c.expires * 1000).toISOString() : "session",
      lifetime_days: c.expires > 0 ? Math.round((c.expires * 1000 - Date.now()) / 86400000) : 0,
      secure: c.secure, httpOnly: c.httpOnly, sameSite: c.sameSite,
      vendor: classify(host, "").name,
    };
  });
  evidence.storage_before_consent = await page.evaluate(() => ({
    localStorage: Object.keys(localStorage),
    sessionStorage: Object.keys(sessionStorage),
  })).catch(() => ({}));

  evidence.third_parties = Array.from(requests.values())
    .filter((r) => !sameSite(r.host, finalUrl.hostname))
    .map((r) => ({ ...r, resource_types: Array.from(r.resource_types), ...classify(r.host, r.sample_urls.join(" ")) }));
  evidence.first_party_hosts = Array.from(requests.keys()).filter((hst) => sameSite(hst, finalUrl.hostname));

  await ctx.close();
} catch (e) {
  evidence.errors.push({ url: startUrl.href, error: String(e.stack || e).slice(0, 800) });
} finally {
  await browser.close();
}

// Short summary for humans and for the skill's first read.
evidence.summary = {
  pages_scanned: evidence.pages.length,
  policy_pages_found: evidence.pages.filter((p) => p.is_policy_page).map((p) => p.url),
  cookies_before_consent: evidence.cookies_before_consent.length,
  third_party_cookies_before_consent: evidence.cookies_before_consent.filter((c) => c.party === "third").length,
  third_party_hosts: evidence.third_parties.length,
  tracking_vendors: [...new Set(evidence.third_parties.filter((t) => ["analytics", "advertising", "session-recording", "tag-manager"].includes(t.category)).map((t) => t.name))],
  consent_banner_detected: evidence.consent_banner ? evidence.consent_banner.detected : null,
  forms: evidence.pages.reduce((n, p) => n + (p.forms ? p.forms.length : 0), 0),
  videos: evidence.pages.reduce((n, p) => n + (p.videos ? p.videos.length : 0), 0),
  ai_label_found_anywhere: evidence.pages.some((p) => p.ai_label_found),
  accessibility_violations: evidence.accessibility.reduce((n, a) => n + a.violations.length, 0),
  errors: evidence.errors.length,
};

const file = path.join(outDir, "evidence.json");
fs.writeFileSync(file, JSON.stringify(evidence, null, 2));
console.log(JSON.stringify(evidence.summary, null, 2));
console.log(`Evidence written to ${file}`);
