# Security Policy

website-governance-audit runs a real browser against websites and writes down what it finds. Evidence can include page text, email addresses and cookie names from the sites it scans. Please treat security issues seriously.

## Reporting a vulnerability

Do **not** open a public issue. Use GitHub's **Report a vulnerability** button (Security tab → Advisories) so the report stays private. You'll get a response within 7 days.

## Design rules

- **Evidence stays out of the repo.** `evidence/` is git-ignored. In GitHub Actions, evidence is uploaded as an artifact kept for 7 days, not committed.
- **Logs are public on a public repo.** The workflow's `print_to_log` option writes evidence into the run log, which anyone can read here. It is off by default; use it only for your own sites.
- **The workflow holds no secrets.** It runs with `contents: read` only, and needs no tokens or keys.
- **Inputs are never pasted into shell code.** URLs and options reach the scan step through environment variables, so a crafted URL can't inject commands into the workflow.
- **The scanner identifies itself and obeys robots.txt.** It announces `website-governance-audit/<version>` in its user agent. If a site disallows crawlers, the scan stops unless the site's owner has given permission (`--owner-authorized`).
- **The scanner only observes.** It never accepts consent banners, submits forms, logs in, or works around a bot check, a login or a paywall.
- **Each scan uses a fresh browser profile** with no saved cookies or sign-ins, so it can't act as you on any site.
- **Pinned dependencies.** Playwright and axe-core versions are locked in `package-lock.json`; CI installs with `npm ci`.

## If evidence leaks

If evidence about a site that isn't yours ended up somewhere public (a commit, a log, an issue), delete it there: remove the commit from history, delete the workflow run, or edit the issue. Then tell the site's owner what was exposed.
