# Clause library: United States

Last verified: 2026-11-17. Official texts:
FTC Endorsement Guides, 16 CFR Part 255 https://www.ecfr.gov/current/title-16/chapter-I/subchapter-B/part-255 ·
Consumer Reviews and Testimonials Rule, 16 CFR Part 465 https://www.ftc.gov/legal-library/browse/federal-register-notices/16-cfr-part-465-trade-regulation-rule-use-consumer-reviews-testimonials-final-rule ·
CCPA (California Privacy Protection Agency) https://cppa.ca.gov/ ·
COPPA https://www.ftc.gov/legal-library/browse/rules/childrens-online-privacy-protection-rule-coppa

Apply only per `jurisdictions.md`.

---

## FTC Act s. 5 (advertising to US audiences)

### US-FTC-01 · Testimonials reflect honest, current views and are not fabricated
- **Clause:** 16 CFR 255.1 (endorsements must reflect the honest opinions and experience of the endorser and may not convey a representation the advertiser could not make itself); 16 CFR 465.2 (no fake or false consumer or celebrity testimonials, including AI-generated ones, where the business knew or should have known).
- **Test:** `testimonials` present. Is each from a real, identifiable person who used the service? Has any been edited in a way that changes meaning? Is any AI-written?
- **Fix:** As CA-COMP-02. Keep source and permission for each.

### US-FTC-02 · Material connections are disclosed
- **Clause:** 16 CFR 255.5 (disclose any material connection between endorser and advertiser that the audience would not expect, such as payment, employment, family relationship, free services); 16 CFR 465.5 (reviews or testimonials by officers, managers, employees or agents need the relationship disclosed).
- **Test:** Testimonials from employees, relatives, paid partners, or people who received free services, without the relationship stated.
- **Fix:** State the relationship in the attribution ("former student", "former manager"). Good existing practice counts as a **Pass**.

### US-FTC-03 · Claims about AI and results are substantiated
- **Clause:** FTC Act s. 5, 15 U.S.C. 45 (unfair or deceptive acts); FTC enforcement against unsupported AI claims (for example the 2024 "Operation AI Comply" actions). Substantiation: objective claims need a reasonable basis before they are made.
- **Test:** "AI-powered", "guaranteed", "X% more revenue", "replace your team" claims without support.
- **Fix:** Remove or qualify; keep the basis on file.

---

## Privacy

### US-CCPA-01 · Applicability check (record every time)
- **Clause:** Cal. Civ. Code 1798.140(d) (definition of "business": for-profit, doing business in California, and one of: annual gross revenue over the inflation-adjusted threshold, currently USD 26,625,000 measured globally; buying, selling or sharing personal information of 100,000+ California consumers or households; or 50%+ of revenue from selling or sharing personal information).
- **Test:** Owner's revenue band and data volumes.
- **Fix:** If none met: **Not triggered**, and say so. If met: privacy notice at collection, "Do Not Sell or Share" link if applicable, honour Global Privacy Control signals.

### US-COPPA-01 · Children under 13
- **Clause:** 16 CFR Part 312 (verifiable parental consent before collecting personal information from children under 13 on sites directed to children or with actual knowledge).
- **Test:** Site directed to children (kids' courses, games, school-age content) and collects any personal information, including persistent identifiers.
- **Fix:** Do not collect from children; route sign-ups through parents; remove trackers from child-directed pages.

### US-SPAM-01 · Commercial email promised at sign-up
- **Clause:** CAN-SPAM Act, 15 U.S.C. 7704 (no deceptive headers or subject lines, identify as advertisement, valid physical postal address, working opt-out honoured within 10 business days).
- **Test:** A sign-up that leads to marketing email to US recipients; check one sample email.
- **Fix:** Postal address and opt-out in every email footer.

---

## Accessibility (risk, not regulation)

### US-ADA-01 · Litigation risk for inaccessible websites
- **Clause:** Americans with Disabilities Act, Title III (places of public accommodation). There is no Title III website regulation; courts differ on whether and how it covers websites. The DOJ's 2024 rule (WCAG 2.1 AA) covers state and local governments under Title II, not private businesses.
- **Test:** US audience and accessibility violations.
- **Fix:** Report as **Best practice only** with litigation risk; point to the WCAG findings.
