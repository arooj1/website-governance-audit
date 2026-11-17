# Report template

What each section of the report is for. The report itself is produced from `report.json` (see `report-schema.md`) by `scripts/render-report.mjs`, which lays these sections out as colour-coded tables in this order. Plain language; the reader is a business owner, not a lawyer.

---

# Website governance audit: {site}

{date} · Scanned as a first-time visitor who agreed to nothing · Scanner v{version}

> This is a governance review against published laws and standards, not legal advice. Where a finding depends on a fact only the owner knows, it is marked "Owner to confirm".

## The three things to fix first

Three short items, each: what to change, why (clause), and effort.

## Who's in scope

One table: Framework · Status (Applies / Likely applies / Not triggered / Best practice only) · Why (the trigger, with the evidence).

Under the table, two lines: the owner's origin and the audience regions used, and whether they were confirmed or inferred.

## What a first-time visitor gets

Facts only, from the scan: cookies set before any choice (count, first/third party, names), third-party hosts contacted and their categories, whether a consent banner appeared, forms and what they collect, media and embeds, crawler files present. Include the first-visit screenshot if the format allows.

## Findings

One block per finding, highest severity first:

### {ID} · {short title} · {High | Medium | Low}
- **What we saw:** evidence, with page URL. Quote verbatim where text is the evidence.
- **Clause:** law, section, link to the official text.
- **Why it applies here:** the trigger, in one sentence.
- **Risk:** one sentence.
- **Fix:** specific steps, wording or code.
- **Effort:** minutes / hours / days.

## What's already right

Bulleted passes with the clause each satisfies. Keep it honest; do not pad.

## Owner to confirm

Questions whose answers would change a finding's status or severity.

## Coming changes

Laws that are proposed or not yet in force (for example Canada's Bill C-36) and dates to watch.

## Method and limits

What was scanned (pages, date, user agent), what automation cannot see (server-side analytics and logs, emails sent, consent records, contracts with processors), and that automated accessibility testing finds only part of the problems.
