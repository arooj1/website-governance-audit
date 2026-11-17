# Website governance audit

A Claude skill and an evidence scanner that audit a website the way a regulator, or a careful customer, meets it: as a first-time visitor who has agreed to nothing.

Every finding in the report:

- rests on evidence from the scan or the page,
- cites the clause it engages, with a link to the official text,
- says **why that law applies to this site**, from the owner's country *and* the visitors' regions,
- and proposes a concrete fix.

It covers privacy and cookies, anti-spam consent, advertising claims and testimonials, copyright, accessibility, and disclosure of AI-generated content.

> This is a governance review against published laws and standards, not legal advice.

## Why "origin and audience"

A website is reachable from everywhere, but laws are not triggered by reachability. Canadian law applies to a Canadian owner. The EU GDPR applies to that owner only if the site **offers** services to people in the EU or **monitors** them (for example with tracking cookies). The EU AI Act's disclosure rules apply when AI-generated **output is used in the EU**. The skill records each framework as *Applies*, *Likely applies*, *Not triggered* or *Best practice only*, and explains the trigger, so the owner also learns what would bring a law into play.

## Frameworks in the clause library

| Region | Frameworks |
|---|---|
| Canada | PIPEDA, Quebec Law 25, CASL, Competition Act (deceptive marketing, testimonials), Copyright Act, AODA |
| EU | GDPR, ePrivacy Directive (cookies), EU AI Act Art. 50 (AI-content transparency), European Accessibility Act |
| UK | UK GDPR, PECR as amended by the Data (Use and Access) Act 2025 |
| US | FTC Act s. 5, Endorsement Guides (16 CFR 255), Consumer Reviews and Testimonials Rule (16 CFR 465), CCPA/CPRA, COPPA, CAN-SPAM, ADA (risk) |
| Standards | WCAG 2.2 AA, C2PA content credentials, RFC 9116 security.txt, AI-crawler policy |

Each library file carries a "Last verified" date. Laws move; check before relying on an entry.

## How it works

1. **Intake**: owner location, size, audiences, data collected, and which media are AI-generated.
2. **Scan**: `scripts/scan.mjs` opens the site in a fresh browser, clicks nothing, and records cookies and storage set before consent, every third-party host, security headers, policy pages and their text, forms and consent wording, media and embeds, AI-content labels, testimonials, structured data, robots.txt / llms.txt / security.txt, first-visit screenshots, and axe-core accessibility results.
3. **Applicability**: `references/jurisdictions.md` decides which laws apply.
4. **Checks**: the clause libraries in `references/` test the evidence.
5. **Report**: `references/report-template.md`, with the three fixes that matter most at the top, passes as well as failures, and a list of facts the owner must confirm.

## Use it

### As a Claude skill

Copy `skill/website-governance-audit/` into your skills folder (or upload it as a skill), then ask Claude: *"Run a website governance audit on https://example.com."*

### Run the scanner yourself

```bash
npm ci
npx playwright install chromium
npm run scan -- https://example.com --out evidence/example.com --max-pages 12
```

### Run it in GitHub Actions

Actions → **Governance scan** → *Run workflow*, enter one or more URLs (comma-separated). The evidence is uploaded as an artifact kept for 7 days.

## Ground rules

- Scan only sites you own or have permission to review. Do not publish findings about someone else's site without their permission.
- The first-visit scan never accepts a consent banner, submits a form or creates an account.
- The skill never states that a site "is compliant". It reports what the evidence shows against each clause.

## Licence

MIT © 2026 Arooj Qureshi
