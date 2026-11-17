---
name: website-governance-audit
description: Audit a website for governance and compliance (privacy, cookies, anti-spam, advertising claims, copyright, accessibility and AI-content disclosure) against the laws of the owner's country and the visitors' regions, and produce a report where every finding cites a clause and proposes a fix. Use when asked to audit, review or check a website for compliance, privacy, cookies, GDPR, PIPEDA, Law 25, CASL, AODA/WCAG, FTC or EU AI Act issues.
---

# Website governance audit

You audit a website the way a regulator or a careful customer would meet it: as a first-time visitor who has agreed to nothing. Every finding must rest on evidence you can show, cite the specific clause it engages, say why that law applies to this site, and propose a concrete fix.

This is a governance review, not legal advice. Say so once in the report, plainly, and never soften a finding to compensate.

## The five steps

### 1. Intake: who owns the site, and who visits it

Laws apply from two directions: the **owner's origin** (where the business is established) and the **audience** (where its visitors and customers are). Collect both before deciding anything.

Ask the owner, or infer from the site and mark it "inferred":

- Owner: country and province/state of establishment; legal entity; number of employees (AODA and the EU accessibility rules turn on headcount); annual revenue band (CCPA turns on it).
- Audience: where visitors and customers are. Best evidence is the owner's own analytics. Otherwise use the site's signals: stated service areas, languages, currencies, shipping countries, hreflang, phone formats, testimonials' locations.
- Purpose: what the site sells or does, and whether it is directed at children.
- Data: forms, newsletter, bookings, payments, chat, analytics the owner runs server-side (the scanner cannot see server-side analytics or logs).
- AI: which images, video, audio or text on the site were generated or substantially edited by AI, and with which tool. The scanner cannot reliably tell. Ask.
- Email: whether the site's contacts feed marketing emails.

If the owner is not available, proceed on inferences and list every inference in the report's "Owner to confirm" section.

### 2. Collect evidence

Run the scanner. It loads the site in a fresh browser, clicks nothing, and records cookies and storage set before consent, every third-party host contacted, security headers, policy pages and their full text, forms and their consent wording, videos and iframes, AI-content labels, testimonials, structured data, crawler files (robots.txt, llms.txt, ai.txt, sitemap, security.txt), first-visit screenshots, and automated accessibility results (axe-core, WCAG 2.0–2.2 A/AA).

```bash
npm ci && npx playwright install chromium
node scripts/scan.mjs https://example.com --out evidence/example.com --max-pages 12
```

The scanner identifies itself in its user agent and obeys robots.txt. If a site disallows crawlers, the scan stops with exit code 3. Do not work around that: ask the site's owner for permission, and only then re-run with `--owner-authorized`, recording who gave permission in the report's "Method and limits". A robots.txt that blocks all automated access is itself worth a line in the report (see AI-03).

If the session cannot reach the public internet, run the repository's GitHub Action "Governance scan" (workflow_dispatch, input `urls`) and download the `evidence` artifact.

Then read the site yourself: the homepage, every policy page the scanner found, and the footer. Automated tools catch roughly a third of accessibility problems and none of the meaning of a privacy policy.

### 3. Decide which laws apply

Read `references/jurisdictions.md`. For each framework, record one of:

- **Applies**: the trigger is met on the evidence.
- **Likely applies**: the trigger probably is met, but depends on a fact the owner must confirm.
- **Not triggered**: say which trigger is missing. This is a finding in its own right, because it tells the owner what would bring the law into play (for example, "adding Google Analytics would start monitoring EU visitors and bring the GDPR into play").
- **Best practice only**: no legal trigger, but the standard is the sensible benchmark (for example, WCAG 2.2 for a business under 50 employees in Ontario).

Never apply a law because a site is merely reachable from a country. The GDPR itself says accessibility of a website is not enough (Recital 23); look for offering, targeting or monitoring.

### 4. Check each applicable control

Use the clause libraries:

- `references/clauses-canada.md`: PIPEDA, Quebec Law 25, CASL, Competition Act, Copyright Act, AODA
- `references/clauses-eu-uk.md`: GDPR, ePrivacy Directive, UK GDPR and PECR (as amended by the Data (Use and Access) Act 2025), EU AI Act Article 50, European Accessibility Act
- `references/clauses-us.md`: FTC Act s.5 with the Endorsement Guides and the Consumer Reviews Rule, CCPA/CPRA, COPPA, CAN-SPAM, ADA risk
- `references/clauses-accessibility-ai.md`: WCAG 2.2 mapping for axe results, AI-content provenance, AI crawler policy, security headers

Each library entry has an ID, the clause, the test against the evidence, and the standard fix. Use the entry's wording for the clause; do not paraphrase a clause into something stronger than it says.

Record passes as well as failures. A report that only lists failures cannot be trusted, and the owner needs to know what to keep.

### 5. Write the report

Follow `references/report-template.md` exactly. Rules:

- Every finding has: ID, severity, what we saw (evidence with URL), the clause (law, section, official link), why it applies to this site, the risk in one sentence, the fix (specific enough to implement, with code or wording where useful), and the effort (minutes, hours, days).
- Severity: **High**: likely non-compliance with a law that applies. **Medium**: a gap under a law that likely applies, or a weak control. **Low**: best practice, a law not yet triggered, or a law that is coming. Never mark a finding High under a law marked "likely applies"; it is Medium until the owner confirms the trigger.
- Separate what the scanner observed from what you inferred. Inferences go under "Owner to confirm".
- Quote site text verbatim when it is the evidence. Do not quote more than needed.
- Lead with the three findings that matter most. Owners act on the top of the report.
- If the site is someone else's, the report is private to the person who asked. Do not publish findings about a third party's site without that owner's permission; anonymise if writing about it.

## Things this skill must never do

- Never state that a site "is compliant" or "is non-compliant" with a law as a legal conclusion. Say what the evidence shows against the clause.
- Never invent a clause, a section number, a fine amount or a deadline. If you are not certain of a section number, cite the law and the official link without the number, and say the section must be confirmed.
- Never bypass robots.txt, a login, a paywall or a bot check. Stop and ask.
- Never click "accept" on a consent banner during the first-visit scan. A second, consenting scan is allowed only if labelled as such.
- Never submit forms, create accounts or send email through the audited site.
- Never treat laws in `jurisdictions.md` marked "proposed" (for example Canada's Bill C-36) as in force. Mention them under "Coming changes" only.

## Keeping the libraries current

Laws move. Each library file has a "Last verified" date. If it is more than six months old, or the audit date is past a "watch" date in the file, verify the entries you rely on against the official source before writing the report, and update the file.
