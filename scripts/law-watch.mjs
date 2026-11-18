#!/usr/bin/env node
// Law watch: checks every official source in references/sources.json for a change, and
// opens a GitHub issue for each one that needs a person to re-read it.
//
// A source needs review when:
//   - its change signal (e.g. "Last amended on ...", the latest eCFR amendment date, the
//     current consolidated version, a bill's stage) differs from verified_signal;
//   - its last_verified date is older than review_after_days;
//   - a watch date has arrived and is not marked done;
//   - the signal can no longer be read (the page layout changed, so the watcher is blind).
//
// It never edits the clause libraries. A person (or a drafted pull request a person
// approves) does that after reading the source.
//
// Usage:
//   node scripts/law-watch.mjs              report, and open issues if GITHUB_TOKEN is set
//   node scripts/law-watch.mjs --seed       write the current signals into sources.json as
//                                           verified (only right after a full manual review)

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const REG = path.join(root, "skill/website-governance-audit/references/sources.json");
const reg = JSON.parse(fs.readFileSync(REG, "utf8"));
const SEED = process.argv.includes("--seed");
const UA = "website-governance-audit-law-watch/1.0 (+https://github.com/arooj1/website-governance-audit)";
const today = new Date().toISOString().slice(0, 10);
const daysSince = (d) => Math.floor((Date.parse(today) - Date.parse(d)) / 86400000);

function htmlToText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

async function get(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 45000);
  try {
    const r = await fetch(url, { headers: { "user-agent": UA, accept: "text/html,application/json;q=0.9,*/*;q=0.8" }, signal: ctrl.signal, redirect: "follow" });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.text();
  } finally {
    clearTimeout(t);
  }
}

async function signalFor(src) {
  const body = await get(src.url);
  switch (src.method) {
    case "regex": {
      const re = new RegExp(src.pattern);
      const m = htmlToText(body).match(re) || body.match(re);
      if (!m) throw new Error(`pattern not found: ${src.pattern}`);
      return m[1].trim();
    }
    case "hash": {
      const text = htmlToText(body);
      return "sha256:" + crypto.createHash("sha256").update(text).digest("hex").slice(0, 16);
    }
    case "ecfr": {
      const j = JSON.parse(body);
      const dates = (j.content_versions || []).map((v) => v.amendment_date || v.date).filter(Boolean).sort();
      if (!dates.length) throw new Error("no content_versions in eCFR response");
      return dates[dates.length - 1];
    }
    case "legisinfo": {
      const j = JSON.parse(body);
      const bill = Array.isArray(j) ? j[0] : j;
      const parts = Object.entries(bill)
        .filter(([k, v]) => /status|stage/i.test(k) && /en$|^[A-Za-z]+Name$|Status$/i.test(k) && typeof v === "string" && v && !/fr$/i.test(k))
        .map(([k, v]) => `${k}=${v}`)
        .sort();
      if (!parts.length) throw new Error("no status fields in LEGISinfo response");
      return parts.join("; ");
    }
    default:
      throw new Error(`unknown method ${src.method}`);
  }
}

const results = [];
for (const src of [...reg.sources, ...(reg.pending || [])]) {
  const res = { id: src.id, name: src.name, url: src.url, entries: src.entries, verified_signal: src.verified_signal, last_verified: src.last_verified, pending: (reg.pending || []).includes(src) };
  try {
    res.signal = await signalFor(src);
    if (src.verified_signal === null) res.state = "unseeded";
    else if (res.signal !== src.verified_signal) res.state = "changed";
    else if (daysSince(src.last_verified) > reg.review_after_days) res.state = "stale";
    else res.state = "ok";
  } catch (e) {
    res.state = "blind";
    res.error = String(e.message || e);
  }
  results.push(res);
  console.log(`${res.state.padEnd(9)} ${src.id.padEnd(24)} ${res.signal ?? res.error}`);
}
for (const w of reg.watch_dates || []) {
  if (!w.done && w.date <= today) {
    results.push({ id: w.id, name: w.note, entries: w.entries, state: "due", date: w.date });
    console.log(`due       ${w.id.padEnd(24)} ${w.date}`);
  }
}

if (SEED) {
  for (const src of [...reg.sources, ...(reg.pending || [])]) {
    const r = results.find((x) => x.id === src.id);
    if (r && r.signal) { src.verified_signal = r.signal; src.last_verified = today; }
  }
  fs.writeFileSync(REG, JSON.stringify(reg, null, 2) + "\n");
  console.log(`\nSeeded ${results.filter((r) => r.signal).length} signals into sources.json. Only do this after a full manual review.`);
}

fs.writeFileSync(path.join(root, "law-watch-results.json"), JSON.stringify({ date: today, results }, null, 2));

// ---------- Issues ----------
const token = process.env.GITHUB_TOKEN;
const repo = process.env.GITHUB_REPOSITORY;
const actionable = results.filter((r) => ["changed", "stale", "blind", "due"].includes(r.state));
const titleFor = (r) => ({
  changed: `Law watch: ${r.name} has changed`,
  stale: `Law watch: ${r.name} not re-verified in ${reg.review_after_days} days`,
  blind: `Law watch: can't read the change signal for ${r.name}`,
  due: `Law watch: date reached (${r.date}) for ${r.id}`,
}[r.state]);

function bodyFor(r) {
  const lines = [];
  if (r.state === "changed") lines.push(`The official source's change signal moved.`, "", `| | |`, `|---|---|`, `| Verified signal | \`${r.verified_signal}\` (verified ${r.last_verified}) |`, `| Current signal | \`${r.signal}\` |`);
  if (r.state === "stale") lines.push(`Last verified ${r.last_verified}, more than ${reg.review_after_days} days ago. The text may not have changed, but guidance and readings may have.`);
  if (r.state === "blind") lines.push(`The watcher could not read this source's change signal, so a change would go unnoticed.`, "", `Error: \`${r.error}\``, "", `Fix the \`pattern\` or \`method\` for \`${r.id}\` in \`references/sources.json\`.`);
  if (r.state === "due") lines.push(r.name);
  if (r.url) lines.push("", `Source: ${r.url.replace(/\/json$/, "")}`);
  lines.push("", `Entries that rely on it: ${(r.entries || []).map((e) => "`" + e + "`").join(", ")}`, "",
    "### To close this", "",
    "- [ ] Re-read the official text (and any new regulator guidance) for the parts these entries cite",
    "- [ ] Update the entries if the law or our reading of it changed; proposed changes go under Coming changes, not into checks",
    "- [ ] Set `verified_signal` and `last_verified` for this source in `references/sources.json` (and `done: true` for a watch date)",
    "- [ ] Update the library file's \"Last verified\" date", "",
    "_Opened by the weekly law-watch job. It never edits the clause libraries itself._");
  return lines.join("\n");
}

async function gh(method, url, body) {
  const r = await fetch(`https://api.github.com${url}`, {
    method,
    headers: { authorization: `Bearer ${token}`, accept: "application/vnd.github+json", "user-agent": UA, "content-type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!r.ok && r.status !== 422) throw new Error(`${method} ${url}: HTTP ${r.status} ${await r.text()}`);
  return r.status === 204 ? null : r.json().catch(() => null);
}

if (token && repo && !SEED) {
  await gh("POST", `/repos/${repo}/labels`, { name: "law-watch", color: "FDE047", description: "A legal source needs re-verification" });
  const open = await gh("GET", `/repos/${repo}/issues?state=open&labels=law-watch&per_page=100`);
  const openTitles = new Set((open || []).map((i) => i.title));
  for (const r of actionable) {
    const title = titleFor(r);
    if (openTitles.has(title)) { console.log(`issue exists: ${title}`); continue; }
    await gh("POST", `/repos/${repo}/issues`, { title, body: bodyFor(r), labels: ["law-watch"] });
    console.log(`opened issue: ${title}`);
  }
}

const unseeded = results.filter((r) => r.state === "unseeded").length;
console.log(`\n${actionable.length} need review · ${results.filter((r) => r.state === "ok").length} ok · ${unseeded} unseeded`);
