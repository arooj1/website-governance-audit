# Clause library: accessibility, AI content and technical governance

Last verified: 2026-11-17. WCAG 2.2: https://www.w3.org/TR/WCAG22/ · C2PA: https://c2pa.org/

These are standards and practices rather than statutes. Tie each finding to the legal hook that applies to this site (AODA, EAA, ADA risk, PIPEDA 4.7, GDPR Art. 32, EU AI Act Art. 50) and otherwise mark it **Best practice only**.

---

## Accessibility (WCAG 2.2 AA)

### ACC-01 · Automated WCAG violations
- **Standard:** WCAG 2.2 Level AA success criteria. The scanner's axe-core results carry WCAG tags (for example `wcag253` = 2.5.3 Label in Name; `wcag143` = 1.4.3 Contrast (Minimum); `wcag111` = 1.1.1 Non-text Content; `wcag412` = 4.1.2 Name, Role, Value; `wcag258` = 2.5.8 Target Size (Minimum), new in 2.2).
- **Test:** Each item in `accessibility[].violations`. Group by rule; report the success criterion, impact, number of elements, one example selector, and the fix.
- **Fix:** Rule-specific. Example: `label-content-name-mismatch` (2.5.3) means an element's `aria-label` does not contain its visible text, which breaks voice control ("click Book a map check" fails). Make the accessible name start with the visible text, or remove the `aria-label`.

### ACC-02 · Manual checks automation cannot do
- **Standard:** WCAG 2.1.1 Keyboard, 2.4.7 Focus Visible, 2.4.11 Focus Not Obscured (new in 2.2), 2.2.2 Pause, Stop, Hide (moving content over 5 seconds needs a pause control), 1.2.x Media alternatives.
- **Test:** Tab through the page: is focus visible and never hidden under a sticky header? Is there an autoplaying, looping video or animation longer than 5 seconds without a pause control? Does a decorative video carry information that needs a text alternative?
- **Fix:** Visible focus styles; `scroll-padding-top` equal to the sticky header height; a pause button for looping background video, and respect `prefers-reduced-motion`.

### ACC-03 · Accessibility statement and feedback route
- **Standard:** Expected under EAA and good practice everywhere; AODA requires accessible feedback processes (O. Reg. 191/11 s. 11).
- **Test:** No accessibility page or statement.
- **Fix:** A short statement: the standard targeted (WCAG 2.2 AA), known gaps, and how to report a problem.

---

## AI content governance

### AI-01 · AI-use disclosure on the site
- **Hook:** EU AI Act Art. 50(4) where it applies (see EU-AI-01); otherwise honesty in advertising (Competition Act s. 74.01, FTC Act s. 5) if undisclosed AI content could mislead, and the owner's own credibility as an AI-governance practitioner.
- **Test:** Owner-confirmed AI media or text without a visible label or AI statement.
- **Fix:** Label on the asset plus a short "How I use AI on this site" note in the footer or about page: which assets are AI-generated, with which tools, and that a human reviewed them.

### AI-02 · Provenance is preserved
- **Hook:** Supports Art. 50(2)/(4); C2PA content credentials.
- **Test:** Owner re-encoded AI media (compression, trimming) and may have stripped metadata.
- **Fix:** Keep the original file's content credentials when exporting; check with a C2PA verifier.

### AI-03 · Deliberate policy for AI crawlers
- **Hook:** No law requires it. Copyright Act and terms of use are the relevant backdrop. Make the choice explicit either way.
- **Test:** `crawler_files["/robots.txt"]`: does it address AI crawlers (for example GPTBot, ClaudeBot, Google-Extended, PerplexityBot, CCBot)? Is there an `llms.txt` that matches the site's actual content?
- **Fix:** State the choice in robots.txt (allow for visibility in AI answers, or disallow training crawlers) and keep llms.txt accurate; an outdated llms.txt is a misleading representation to AI systems about your business.

### AI-04 · Structured data says only what the page says
- **Hook:** Competition Act s. 74.01 / FTC Act s. 5 (representations include machine-readable claims that surface in search and AI answers).
- **Test:** Compare `structured_data_types` and the JSON-LD claims (credentials, FAQ answers, offers, prices, ratings) with the visible page.
- **Fix:** Keep JSON-LD generated from the same source as the visible text; never add ratings or reviews that are not on the page.

---

## Technical governance

### TECH-01 · HTTPS and security headers
- **Hook:** PIPEDA 4.7; GDPR Art. 32.
- **Test:** `transport`, `security_headers`.
- **Fix:** See CA-PIPEDA-04. Severity Low when HTTPS is enforced and only headers are missing.

### TECH-02 · security.txt
- **Standard:** RFC 9116.
- **Test:** `crawler_files["/.well-known/security.txt"].present`.
- **Fix:** Publish `/.well-known/security.txt` with a contact and an expiry date, so people can report a vulnerability.
