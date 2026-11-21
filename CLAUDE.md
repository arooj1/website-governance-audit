# website-governance-audit

A public, MIT-licensed Claude skill plus scanner that audits a website's governance
(privacy, cookies, anti-spam, advertising claims, copyright, accessibility, AI-content
disclosure) against the laws of the owner's country and the visitors' regions. Every
finding cites a clause and proposes a fix. Author: Arooj Qureshi.

This repo is public: keep private business details, client names and anything confidential
out of it, including this file.

## Layout

- `skill/website-governance-audit/`: the skill. `SKILL.md` (the five steps), `scripts/scan.mjs`
  (Playwright + axe-core scanner), `scripts/render-report.mjs` (report data to one HTML
  page), `references/` (clause libraries by region, `jurisdictions.md`, `report-schema.md`,
  `sources.json`), `assets/fonts/`.
- `scripts/law-watch.mjs` and `.github/workflows/law-watch.yml`: weekly law watch.
- `.github/workflows/ci.yml` (checks), `scan.yml` (manual "Governance scan" run).
- `test/run.mjs` and `test/fixtures/`: scans two local fixture sites and renders the example
  report. No network access to real sites.
- `examples/aroojqureshi.com.report.json`: sample report data from her own site.
- `docs/article/`: images and carousel PDF for the accompanying article.

## Commands

- `npm ci`, `npx playwright install chromium`
- `npm test` (CI runs the same, plus `node --check` on the scripts; Node 22)
- `npm run scan -- https://example.com --out evidence/example.com --max-pages 12`
- `npm run report -- examples/aroojqureshi.com.report.json --out report.html`

## Rules that are never broken

1. **Evidence first.** Every finding has what was seen (with page URL), the clause with a
   link to official text, why it applies here, the fix, and the effort. No finding without
   evidence.
2. **Never say a site "is compliant".** Report what the evidence shows against each clause.
   It is a governance review against published laws, not legal advice.
3. **Applicability comes from two directions:** the owner's origin and the audience. Each
   framework gets one status: Applies, Likely applies, Not triggered (say what would
   trigger it), or Best practice only.
4. **The scanner has manners.** It identifies itself in its user agent
   (`website-governance-audit/<version>`), obeys robots.txt (stops if blocked), runs only with
   `--owner-authorized`, and never accepts a consent banner, submits a form or creates an
   account.
5. **Law data stays current by review.** Every clause-library file has a "Last verified"
   date and each entry is tied to its official source in `sources.json`. A person reviews
   every change; draft updates cite the official text. Do not work around LegisQuebec or
   Ontario e-Laws (they get a human re-read every 90 days).
6. **README animations** play once and settle within five seconds (WCAG 2.2.2). No endless
   loops.

## Status

Tested first on aroojqureshi.com: 9 findings, 8 fixed the same day, the ninth closed on
confirmation; a re-scan of the live site verified the fixes.

## Keeping this file current

When a rule, layout or status changes, update this CLAUDE.md in the same change.
