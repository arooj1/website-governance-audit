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
- `docs/article/`: images and carousel PDF for her LinkedIn article on website governance.

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

## Status and open items

- Tested first on aroojqureshi.com (9 findings, 8 fixed the same day, the ninth closed on
  confirmation; re-scan verified). getintech.ca was wanted as a second test.
- To do: list this project under featured projects on her GitHub profile README
  (`arooj1/arooj1`); it backs her planned LinkedIn article on website governance from an AI
  perspective.

## Standing rules (all of Arooj's projects)

- **Secrets** live only in GitHub Actions Secrets and variables or Cloudflare secrets, or a
  git-ignored `.env`. Never in the repo, a log or a commit.
- **Free tier only.** Do not add a paid service. The account's GitHub budgets are
  deliberately $0 (usage blocks once the free allowance is used); do not suggest raising
  them. Codespaces is not used: do not create codespaces or prebuilds.
- **Working style.** Verify what is actually available before proposing, push back with
  reasons instead of agreeing, and prefer quality over speed.
- **Keep this file current.** When a decision, status or constraint changes, update this
  CLAUDE.md in the same change.
