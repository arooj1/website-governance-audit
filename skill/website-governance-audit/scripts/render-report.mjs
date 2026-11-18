#!/usr/bin/env node
// Render an audit report (report.json, see references/report-schema.md) into one
// self-contained HTML page: table-first, colour-coded by severity, readable on a phone,
// printable. Fonts are embedded, so the file looks the same wherever it is opened.
//
// Usage: node render-report.mjs report.json [--out report.html]

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const input = args.find((a) => !a.startsWith("--"));
if (!input) {
  console.error("Usage: node render-report.mjs report.json [--out report.html]");
  process.exit(2);
}
const outIdx = args.indexOf("--out");
const out = outIdx >= 0 ? args[outIdx + 1] : input.replace(/\.json$/i, "") + ".html";
const r = JSON.parse(fs.readFileSync(input, "utf8"));

// ---------- helpers ----------
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
// Small inline markdown: `code`, **bold**, [text](https://url)
const md = (s) =>
  esc(s)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2">$1</a>');
const font = (file) => {
  const p = path.join(here, "..", "assets", "fonts", file);
  return fs.existsSync(p) ? `url(data:font/woff2;base64,${fs.readFileSync(p).toString("base64")}) format('woff2')` : "local('Arial')";
};

const SEV = {
  high: { label: "High", note: "Likely breach of a law that applies" },
  medium: { label: "Medium", note: "Gap under a law that likely applies, or a weak control" },
  low: { label: "Low", note: "Best practice, or a law not yet triggered" },
  pass: { label: "Pass", note: "Checked and met" },
};
const SCOPE = {
  applies: "Applies",
  likely: "Likely applies",
  not_triggered: "Not triggered",
  best_practice: "Best practice only",
};
const FLAG = { ok: "OK", warn: "Check", bad: "Issue", info: "Info" };
const STATUS = { open: "Open", fixed: "Fixed", confirmed: "Closed", accepted: "Risk accepted" };

const chip = (cls, text) => `<span class="chip ${cls}">${esc(text)}</span>`;
const sevChip = (s) => chip(`sev-${s}`, SEV[s]?.label || s);
const findings = r.findings || [];
const byId = Object.fromEntries(findings.map((f) => [f.id, f]));
const order = { high: 0, medium: 1, low: 2 };
const sorted = [...findings].sort((a, b) => (order[a.severity] ?? 9) - (order[b.severity] ?? 9));
const count = (s) => findings.filter((f) => f.severity === s).length;
const closed = findings.filter((f) => ["fixed", "confirmed"].includes(f.status)).length;

const table = (headers, rows, cls = "") =>
  `<div class="table-wrap"><table class="${cls}"><thead><tr>${headers.map((h) => `<th scope="col">${esc(h)}</th>`).join("")}</tr></thead><tbody>${rows.join("")}</tbody></table></div>`;
const td = (label, html, cls = "") => `<td data-label="${esc(label)}"${cls ? ` class="${cls}"` : ""}>${html}</td>`;

// ---------- sections ----------
const topRows = (r.top_fixes || []).map((id, i) => {
  const f = byId[id];
  if (!f) return "";
  return `<tr class="row-${f.severity}">${td("#", `<span class="num">${i + 1}</span>`, "c-num")}${td("Finding", `<strong>${esc(f.title)}</strong><div class="muted">${esc(f.id)}</div>`)}${td("Severity", sevChip(f.severity), "short")}${td("Fix", md(f.fix_short || f.fix))}${td("Effort", esc(f.effort), "short")}${td("Status", chip(`st-${f.status || "open"}`, STATUS[f.status || "open"]), "short")}</tr>`;
});

const scopeRows = (r.scope || []).map((s) => `<tr>${td("Framework", `<strong>${esc(s.framework)}</strong>`)}${td("Status", chip(`sc-${s.status}`, SCOPE[s.status] || s.status), "short")}${td("Why", md(s.why))}</tr>`);

const visitRows = (r.first_visit || []).map((v) => `<tr>${td("Check", esc(v.check))}${td("Result", md(v.result))}${td("Flag", chip(`fl-${v.flag}`, FLAG[v.flag] || v.flag), "short")}</tr>`);

const findingRows = sorted.map((f) => `<tr class="row-${f.severity}" id="${esc(f.id)}">
  ${td("Severity", `${sevChip(f.severity)}<span class="muted id">${esc(f.id)}</span>`, "c-sev short")}
  ${td("Finding", `<strong class="ftitle">${esc(f.title)}</strong><p><span class="k">Seen:</span> ${md(f.saw)}</p><p><span class="k">Why it applies:</span> ${md(f.why)}</p>${f.risk ? `<p><span class="k">Risk:</span> ${md(f.risk)}</p>` : ""}`)}
  ${td("Clause", f.clause?.url ? `<a href="${esc(f.clause.url)}">${esc(f.clause.text)}</a>` : esc(f.clause?.text))}
  ${td("Fix", md(f.fix))}
  ${td("Effort", esc(f.effort), "short")}
  ${td("Status", `${chip(`st-${f.status || "open"}`, STATUS[f.status || "open"])}${f.status_note ? `<span class="muted">${md(f.status_note)}</span>` : ""}`, "short")}
</tr>`);

const passRows = (r.passes || []).map((p) => `<tr class="row-pass">${td("Result", sevChip("pass"))}${td("What's right", md(p.item))}${td("Clause", md(p.clause))}</tr>`);

const confirmRows = (r.owner_to_confirm || []).map((q) => `<tr>${td("Question", md(q.question))}${td("Answer", q.answer ? md(q.answer) : '<span class="muted">Waiting</span>')}${td("Status", chip(q.answer ? "st-confirmed" : "st-open", q.answer ? "Answered" : "Open"))}</tr>`);

const legend = ["high", "medium", "low", "pass"].map((s) => `<li>${sevChip(s)} <span>${esc(SEV[s].note)}</span></li>`).join("");

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Governance audit: ${esc(r.site)}</title>
<style>
@font-face{font-family:'IT';font-weight:500;src:${font("inter-tight-latin-500-normal.woff2")}}
@font-face{font-family:'IT';font-weight:800;src:${font("inter-tight-latin-800-normal.woff2")}}
@font-face{font-family:'IT';font-weight:900;src:${font("inter-tight-latin-900-normal.woff2")}}
@font-face{font-family:'Hand';font-weight:700;src:${font("caveat-latin-700-normal.woff2")}}
@font-face{font-family:'Mono';font-weight:600;src:${font("jetbrains-mono-latin-600-normal.woff2")}}
:root{
  /* Sketch Bold, light theme (long reads) */
  --surface:#fff;--raised:#F3F4F6;--ink:#0A0A0A;--muted:#374151;--subtle:#4B5563;--line:#E5E7EB;
  --hl:#FDE047;--on-hl:#0A0A0A;--accent:#4338CA;
  /* Severity: never colour alone; every chip carries its word */
  --high:#991B1B;--high-bg:#FEE2E2;--high-bar:#DC2626;
  --med:#92400E;--med-bg:#FEF3C7;--med-bar:#D97706;
  --low:#1E40AF;--low-bg:#DBEAFE;--low-bar:#2563EB;
  --pass:#166534;--pass-bg:#DCFCE7;--pass-bar:#16A34A;
}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%;print-color-adjust:exact;-webkit-print-color-adjust:exact}
body{margin:0;background:var(--surface);color:var(--ink);font:500 16px/1.55 'IT','Inter Tight',Inter,system-ui,sans-serif}
.wrap{max-width:1180px;margin:0 auto;padding:40px 24px 64px}
a{color:var(--accent)}
code{font:600 .86em 'Mono',ui-monospace,monospace;background:var(--raised);padding:.08em .35em;border-radius:6px;word-break:break-word}
.pill{display:inline-block;font:600 13px 'Mono',ui-monospace,monospace;letter-spacing:.06em;color:var(--accent);border:2px solid var(--accent);border-radius:999px;padding:5px 14px}
.hand{font:700 30px/1.1 'Hand',Caveat,cursive;color:var(--accent);transform:rotate(-3deg);transform-origin:left;margin:18px 0 4px}
h1{font-weight:900;font-size:clamp(34px,5vw,60px);line-height:1.05;letter-spacing:-.035em;margin:8px 0 10px}
h1 .mark{background:var(--hl);color:var(--on-hl);padding:0 .12em;box-decoration-break:clone;-webkit-box-decoration-break:clone}
h2{font-weight:900;font-size:clamp(24px,3vw,32px);letter-spacing:-.02em;margin:48px 0 6px}
h2 + .lead-s{margin-top:0}
.meta{font:600 13px 'Mono',ui-monospace,monospace;letter-spacing:.03em;color:var(--subtle);margin:0 0 18px}
.lead{font-size:clamp(18px,2vw,21px);color:var(--muted);max-width:52em;margin:0 0 10px}
.lead-s{color:var(--subtle);margin:0 0 14px;max-width:60em}
.disclaimer{font-size:14px;color:var(--subtle);border-left:4px solid var(--hl);padding:6px 12px;background:#FEFCE8;max-width:60em}

/* Scorecard */
.score{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px;margin:26px 0 8px}
.tile{border-radius:16px;padding:16px 18px;border:1px solid var(--line)}
.tile .n{font-weight:900;font-size:40px;line-height:1}
.tile .t{font:600 12px 'Mono',ui-monospace,monospace;letter-spacing:.06em;text-transform:uppercase;margin-top:6px}
.tile.high{background:var(--high-bg);color:var(--high);border-color:transparent}
.tile.medium{background:var(--med-bg);color:var(--med);border-color:transparent}
.tile.low{background:var(--low-bg);color:var(--low);border-color:transparent}
.tile.pass{background:var(--pass-bg);color:var(--pass);border-color:transparent}
.tile.done{background:var(--raised)}
.bar{height:10px;border-radius:999px;background:var(--raised);overflow:hidden;margin-top:12px}
.bar i{display:block;height:100%;background:var(--pass-bar)}
.legend{list-style:none;padding:0;margin:14px 0 0;display:flex;flex-wrap:wrap;gap:8px 22px;font-size:14px;color:var(--subtle)}
.legend li{display:flex;align-items:center;gap:8px}

/* Chips */
.chip{display:inline-block;font:600 12px/1 'Mono',ui-monospace,monospace;letter-spacing:.05em;text-transform:uppercase;padding:6px 10px;border-radius:999px;white-space:nowrap;border:1.5px solid transparent}
.sev-high{background:var(--high-bg);color:var(--high);border-color:var(--high-bar)}
.sev-medium{background:var(--med-bg);color:var(--med);border-color:var(--med-bar)}
.sev-low{background:var(--low-bg);color:var(--low);border-color:var(--low-bar)}
.sev-pass{background:var(--pass-bg);color:var(--pass);border-color:var(--pass-bar)}
.sc-applies{background:#E0E7FF;color:#3730A3}
.sc-likely{background:#fff;color:#3730A3;border:1.5px dashed #4338CA}
.sc-not_triggered{background:var(--raised);color:var(--subtle)}
.sc-best_practice{background:#fff;color:var(--subtle);border-color:#D1D5DB}
.fl-ok{background:var(--pass-bg);color:var(--pass)}
.fl-warn{background:var(--med-bg);color:var(--med)}
.fl-bad{background:var(--high-bg);color:var(--high)}
.fl-info{background:var(--raised);color:var(--subtle)}
.st-open{background:#fff;color:var(--ink);border-color:var(--ink)}
.st-fixed,.st-confirmed{background:var(--pass-bar);color:#fff}
.st-accepted{background:var(--raised);color:var(--subtle)}

/* Tables */
.table-wrap{overflow-x:auto;border:1px solid var(--line);border-radius:16px}
table{width:100%;border-collapse:collapse;font-size:15px}
th{font:600 12px 'Mono',ui-monospace,monospace;letter-spacing:.06em;text-transform:uppercase;color:var(--subtle);text-align:left;background:var(--raised);padding:12px 14px;border-bottom:1px solid var(--line)}
td{padding:14px;vertical-align:top;border-bottom:1px solid var(--line)}
tbody tr:last-child td{border-bottom:0}
td p{margin:6px 0 0}
.k{font-weight:800;color:var(--ink)}
.muted{color:var(--subtle);font-size:13px;margin-top:6px}
span.muted{display:block}
.c-sev .id{display:block}.id{font-family:'Mono',ui-monospace,monospace}
.ftitle{font-size:16px}
.num{display:inline-grid;place-items:center;width:30px;height:30px;border-radius:999px;background:var(--hl);color:var(--on-hl);font-weight:900}
tr.row-high td:first-child{box-shadow:inset 6px 0 0 var(--high-bar)}
tr.row-medium td:first-child{box-shadow:inset 6px 0 0 var(--med-bar)}
tr.row-low td:first-child{box-shadow:inset 6px 0 0 var(--low-bar)}
tr.row-pass td:first-child{box-shadow:inset 6px 0 0 var(--pass-bar)}
tr.row-high{background:#FFFAFA}tr.row-medium{background:#FFFDF7}tr.row-low{background:#FAFCFF}
.findings td:nth-child(1){width:110px}.findings td:nth-child(3){width:190px}.findings td:nth-child(5){width:110px}.findings td:nth-child(6){width:120px}
ul.plain{margin:6px 0 0;padding-left:1.2em;color:var(--muted)}
.foot{margin-top:48px;font-size:13px;color:var(--subtle);border-top:1px solid var(--line);padding-top:16px}

/* Phones: each row becomes a card, labels shown beside values */
@media (max-width:760px){
  .wrap{padding:28px 16px 48px}
  .score{grid-template-columns:repeat(2,minmax(0,1fr))}
  .tile.done{grid-column:span 2}
  .table-wrap{border:0;border-radius:0;overflow:visible}
  table,thead,tbody,tr,td{display:block;width:auto!important}
  thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
  tr{border:1px solid var(--line);border-radius:14px;margin:0 0 12px;padding:6px 0;background:#fff}
  tr.row-high{border-left:6px solid var(--high-bar)}tr.row-medium{border-left:6px solid var(--med-bar)}tr.row-low{border-left:6px solid var(--low-bar)}tr.row-pass{border-left:6px solid var(--pass-bar)}
  tr td:first-child{box-shadow:none!important}
  td{border:0;padding:8px 14px}
  td.short{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
  td.short::before{margin:0;min-width:64px}
  td.short .muted,td.short .id{display:inline;margin:0}
  td::before{content:attr(data-label);display:block;font:600 11px 'Mono',ui-monospace,monospace;letter-spacing:.06em;text-transform:uppercase;color:var(--subtle);margin-bottom:4px}
}
@media print{.wrap{padding:0}a{color:inherit}tr{break-inside:avoid}}
</style>
</head>
<body>
<main class="wrap">
  <span class="pill">WEBSITE GOVERNANCE AUDIT</span>
  <p class="hand">scanned as a first-time visitor</p>
  <h1><span class="mark">${esc(r.site)}</span></h1>
  <p class="meta">${esc(r.date)} · ${esc(r.scanner || "")} · Owner: ${esc(r.owner?.origin || "")} · Audience: ${esc(r.owner?.audience || "")}${r.owner?.confirmed ? "" : " (inferred)"}</p>
  <p class="lead">${md(r.summary)}</p>
  <p class="disclaimer">A governance review against published laws and standards, not legal advice. Items marked “Owner to confirm” depend on facts only the owner knows.</p>

  <div class="score" role="list" aria-label="Findings by severity">
    <div class="tile high" role="listitem"><div class="n">${count("high")}</div><div class="t">High</div></div>
    <div class="tile medium" role="listitem"><div class="n">${count("medium")}</div><div class="t">Medium</div></div>
    <div class="tile low" role="listitem"><div class="n">${count("low")}</div><div class="t">Low</div></div>
    <div class="tile pass" role="listitem"><div class="n">${(r.passes || []).length}</div><div class="t">Passes</div></div>
    <div class="tile done" role="listitem"><div class="n">${closed}<span style="font-size:22px;color:var(--subtle)">/${findings.length}</span></div><div class="t">Findings closed</div><div class="bar" aria-hidden="true"><i style="width:${findings.length ? Math.round((closed / findings.length) * 100) : 0}%"></i></div></div>
  </div>
  <ul class="legend">${legend}</ul>

  <h2>Fix these first</h2>
  <p class="lead-s">${topRows.filter(Boolean).length === 1 ? "The one finding to act on." : `The ${["", "", "two", "three", "four", "five"][topRows.filter(Boolean).length] || topRows.filter(Boolean).length} findings that matter most.`}</p>
  ${table(["#", "Finding", "Severity", "Fix", "Effort", "Status"], topRows)}

  <h2>Who's in scope</h2>
  <p class="lead-s">Laws apply from where the owner is and where the visitors are. Being reachable from a country is not a trigger.</p>
  ${table(["Framework", "Status", "Why"], scopeRows)}

  <h2>What a first-time visitor gets</h2>
  <p class="lead-s">Observed before any choice was made: no clicks, no consent.</p>
  ${table(["Check", "Result", "Flag"], visitRows)}

  <h2>All findings</h2>
  <p class="lead-s">Highest severity first. Each cites the clause it engages and the fix.</p>
  ${table(["Severity", "Finding", "Clause", "Fix", "Effort", "Status"], findingRows, "findings")}

  <h2>What's already right</h2>
  ${table(["Result", "What's right", "Clause"], passRows)}

  ${confirmRows.length ? `<h2>Owner to confirm</h2>${table(["Question", "Answer", "Status"], confirmRows)}` : ""}

  ${(r.coming_changes || []).length ? `<h2>Coming changes</h2><ul class="plain">${r.coming_changes.map((c) => `<li>${md(c)}</li>`).join("")}</ul>` : ""}

  <p class="foot"><strong>Method and limits.</strong> ${md(r.method || "")}<br>Generated by <a href="https://github.com/arooj1/website-governance-audit">website-governance-audit</a>.</p>
</main>
</body>
</html>
`;

fs.writeFileSync(out, html);
console.log(`Report written to ${out} (${Math.round(html.length / 1024)} KB)`);
