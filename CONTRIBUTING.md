# Contributing to website-governance-audit

Thanks for helping. This project tells people what the law says about their website, so a wrong clause does more harm than a missing one. A few ground rules keep it trustworthy:

1. **Every clause has a source.** A clause-library entry cites the law, the section, and a link to the official text (a government or EUR-Lex page, not a blog). If you can't confirm a section number, cite the law without it and say so.
2. **Every library file keeps its "Last verified" date honest.** Change an entry, update the date. Don't bump the date without checking.
3. **Proposed laws stay proposed.** Bills, drafts and consultations go under "Coming changes" or a **watch** note, never into a check that can fail a site.
4. **The scanner collects evidence. It doesn't act.** It never accepts a consent banner, submits a form, logs in, or works around robots.txt, a paywall or a bot check. Pull requests that add any of these will be closed.
5. **No overclaiming.** The skill reports what the evidence shows against a clause. It never declares a site "compliant" or "non-compliant".

## Getting started

```bash
git clone https://github.com/arooj1/website-governance-audit && cd website-governance-audit
npm ci
npx playwright install chromium
npm run scan -- https://your-own-site.example --out evidence/your-own-site --max-pages 5
```

The scanner is [`skill/website-governance-audit/scripts/scan.mjs`](skill/website-governance-audit/scripts/scan.mjs). The skill's instructions are in [`SKILL.md`](skill/website-governance-audit/SKILL.md), and the clause libraries and report template are in [`references/`](skill/website-governance-audit/references).

Run the tests before you open a pull request; CI runs the same:

```bash
npm test
```

They scan two local fixture sites in `test/fixtures/` (one open, one whose robots.txt blocks crawlers) and render the example report. A scanner change that adds an evidence field should add a fixture element and a check for it in `test/run.mjs`.

## Pull requests

- Keep each PR to one change, with a short description of *why*.
- **Clause changes:** link the official text you checked, and say what changed in the law or in our reading of it.
- **Scanner changes:** say which evidence fields you added or changed, add a test for them, and show a before/after `summary` from a real run.
- **New jurisdictions:** add the trigger to `jurisdictions.md` first (what brings the law into play for a foreign site), then the checks.
- Never commit scan evidence about sites you don't own. `evidence/` is git-ignored for that reason.

## Reporting problems

- **A clause is wrong or out of date:** open an issue with the entry ID (for example `EU-AI-01`), what it says, what the law says, and a link to the official text.
- **Bugs and ideas:** open an issue with the command you ran, what you expected, and what happened. Leave out anything personal the scan picked up.
- **Security issues:** don't open a public issue; see [SECURITY.md](SECURITY.md).

By contributing, you agree your contributions are licensed under the [MIT License](LICENSE).
