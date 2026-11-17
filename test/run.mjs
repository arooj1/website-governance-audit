// End-to-end checks for the scanner and the report renderer, run in CI on every push.
// Serves two local fixture sites, scans them, and checks the evidence and the rendered report.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";

// Run a child process without blocking the event loop (the fixture servers live in this process).
function run(cmd, args) {
  return new Promise((ok) => {
    const c = spawn(cmd, args);
    let stdout = "", stderr = "";
    c.stdout.on("data", (d) => (stdout += d));
    c.stderr.on("data", (d) => (stderr += d));
    c.on("close", (status) => ok({ status, stdout, stderr }));
  });
}
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const repo = path.join(root, "..");
const scanner = path.join(repo, "skill/website-governance-audit/scripts/scan.mjs");
const renderer = path.join(repo, "skill/website-governance-audit/scripts/render-report.mjs");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "wga-"));
let failures = 0;

function serve(dir) {
  const server = http.createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
    let file = path.join(dir, p === "/" ? "index.html" : p);
    if (!fs.existsSync(file) && fs.existsSync(file + ".html")) file += ".html";
    if (!file.startsWith(dir) || !fs.existsSync(file)) { res.writeHead(404); return res.end("not found"); }
    const type = file.endsWith(".html") ? "text/html" : "text/plain";
    res.writeHead(200, { "content-type": type });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((ok) => server.listen(0, "127.0.0.1", () => ok(server)));
}

function test(name, fn) {
  try { fn(); console.log(`ok   ${name}`); }
  catch (e) { failures++; console.log(`FAIL ${name}\n     ${e.message}`); }
}

const open = await serve(path.join(root, "fixtures/open"));
const blocked = await serve(path.join(root, "fixtures/blocked"));
const openUrl = `http://127.0.0.1:${open.address().port}/`;
const blockedUrl = `http://127.0.0.1:${blocked.address().port}/`;

// 1. Scan the open fixture.
const outOpen = path.join(tmp, "open");
const r1 = await run("node", [scanner, openUrl, "--out", outOpen, "--max-pages", "3"]);
test("scanner exits 0 on an open site", () => assert.equal(r1.status, 0, r1.stderr || r1.stdout));
const ev = JSON.parse(fs.readFileSync(path.join(outOpen, "evidence.json"), "utf8"));
const home = ev.pages[0];
test("records the cookie set before consent", () => assert.ok(ev.cookies_before_consent.some((c) => c.name === "fixture_tracker")));
test("flags the pre-ticked consent box", () => assert.ok(home.forms[0].fields.some((f) => f.name === "marketing" && f.prechecked === true)));
test("finds the privacy page and keeps its text", () => {
  const pol = ev.pages.find((p) => p.is_policy_page);
  assert.ok(pol, "no policy page found");
  assert.match(pol.full_text, /email address/);
});
test("detects the AI-content label", () => assert.equal(ev.summary.ai_label_found_anywhere, true));
test("counts the image with no alt text", () => assert.equal(home.images.missing_alt, 1));
test("counts the testimonial once", () => assert.equal(home.testimonials.length, 1));
test("reads robots.txt and is allowed", () => assert.equal(ev.robots.allowed, true));
test("identifies itself in its user agent", () => assert.match(ev.user_agent_token, /^website-governance-audit\//));
test("runs accessibility checks", () => assert.ok(ev.accessibility.length >= 1));

// 2. A site that blocks crawlers must stop the scan.
const outBlocked = path.join(tmp, "blocked");
const r2 = await run("node", [scanner, blockedUrl, "--out", outBlocked]);
test("stops with exit code 3 when robots.txt disallows", () => assert.equal(r2.status, 3, r2.stdout));
test("records why it stopped and loaded no pages", () => {
  const evB = JSON.parse(fs.readFileSync(path.join(outBlocked, "evidence.json"), "utf8"));
  assert.match(evB.stopped, /robots\.txt/);
  assert.equal(evB.pages.length, 0);
});

// 3. Render the example report.
const example = path.join(repo, "examples/aroojqureshi.com.report.json");
const html = path.join(tmp, "report.html");
const r3 = await run("node", [renderer, example, "--out", html]);
test("renderer exits 0", () => assert.equal(r3.status, 0, r3.stderr));
const page = fs.readFileSync(html, "utf8");
test("report has every section", () => {
  for (const h of ["Fix these first", "Who's in scope", "What a first-time visitor gets", "All findings", "What's already right"]) assert.ok(page.includes(h), `missing ${h}`);
});
test("every severity chip carries its word", () => {
  assert.match(page, /class="chip sev-high">High</);
  assert.match(page, /class="chip sev-medium">Medium</);
  assert.match(page, /class="chip sev-low">Low</);
});
const evilJson = JSON.parse(fs.readFileSync(example, "utf8"));
evilJson.findings[0].saw = "<script>alert(1)</script>";
fs.writeFileSync(path.join(tmp, "evil.json"), JSON.stringify(evilJson));
await run("node", [renderer, path.join(tmp, "evil.json"), "--out", path.join(tmp, "evil.html")]);
test("site text is escaped, not rendered as HTML", () => {
  const out = fs.readFileSync(path.join(tmp, "evil.html"), "utf8");
  assert.ok(!out.includes("<script>alert(1)</script>") && out.includes("&lt;script&gt;"));
});

open.close(); blocked.close();
console.log(failures ? `\n${failures} test(s) failed` : "\nAll tests passed");
process.exit(failures ? 1 : 0);
