# Clause library: Canada

Last verified: 2026-11-17. Official texts:
PIPEDA https://laws-lois.justice.gc.ca/eng/acts/P-8.6/ ·
Quebec Law 25 (CQLR c P-39.1) https://www.legisquebec.gouv.qc.ca/en/document/cs/P-39.1 ·
CASL https://laws-lois.justice.gc.ca/eng/acts/E-1.6/ ·
Competition Act https://laws-lois.justice.gc.ca/eng/acts/C-34/ ·
Copyright Act https://laws-lois.justice.gc.ca/eng/acts/C-42/ ·
AODA Integrated Accessibility Standards (O. Reg. 191/11) https://www.ontario.ca/laws/regulation/110191

Each entry: **Clause** · **Test** (against the scanner evidence and the site) · **Fix**.

---

## PIPEDA (federal private-sector privacy)

### CA-PIPEDA-01 · Privacy information is readily available
- **Clause:** Schedule 1, Principle 4.8 (Openness). Organisations must make specific information about their policies and practices relating to personal information readily available, including the name or title and address of the person accountable (4.8.1, 4.8.2).
- **Test:** The site collects personal information (any form, a `mailto:` contact, a booking link, analytics, server logs) and `summary.policy_pages_found` has no privacy page, or the privacy page does not name an accountable person and contact.
- **Fix:** Publish a plain-language privacy notice linked from the footer and next to every contact point. Minimum contents: who is accountable and how to reach them; what is collected (including emails sent to you and technical logs kept by the host); why; who it is shared with (host, email provider, scheduling tool); where it is stored (country); how long it is kept; how to access or correct it; how to complain, including to the Office of the Privacy Commissioner of Canada.

### CA-PIPEDA-02 · Purposes identified at or before collection
- **Clause:** Principle 4.2 (Identifying purposes) and 4.3 (Consent); s. 6.1 (valid consent requires that the individual would reasonably understand the nature, purpose and consequences).
- **Test:** A form or sign-up collects data with no statement of purpose near it, or the purpose stated differs from the use (for example, a contact form whose entries go to a newsletter).
- **Fix:** One sentence next to the submit button: what you will do with the data, and a link to the privacy notice. Do not reuse contact-form data for marketing without separate consent (see CASL).

### CA-PIPEDA-03 · Third-party tracking and online behavioural advertising
- **Clause:** Principle 4.3 (Consent); OPC *Guidelines on privacy and online behavioural advertising*: implied consent for behavioural advertising is acceptable only if people are told clearly at the time, can opt out easily, and sensitive information is not used.
- **Test:** `third_parties` contains `advertising`, `session-recording` or `analytics` vendors, or `cookies_before_consent` has third-party cookies, and there is no notice or opt-out.
- **Fix:** Remove trackers you do not use. For the rest, a notice at first visit with an opt-out, and the vendors listed in the privacy notice. If the site also serves Quebec, see CA-QC-02, which is stricter.

### CA-PIPEDA-04 · Safeguards
- **Clause:** Principle 4.7 (Safeguards): security appropriate to the sensitivity of the information.
- **Test:** `transport.https` false, `http_redirects_to` not https, or forms post over http. Missing HSTS and security headers are a weaker signal, reported as Low.
- **Fix:** Force HTTPS; add `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, a `Content-Security-Policy`, and `Permissions-Policy`. On Cloudflare Workers or Pages these are a `_headers` file or a few lines in the Worker.

---

## Quebec Law 25

Applies or likely applies only per `jurisdictions.md`. Cite sections of CQLR c P-39.1.

### CA-QC-01 · Person in charge, published
- **Clause:** s. 3.1. The person exercising the highest authority is responsible for the protection of personal information (may delegate in writing); their title and contact information must be published on the enterprise's website.
- **Test:** No page publishes the title and contact details of the person in charge of personal information.
- **Fix:** Add to the privacy notice: "Person in charge of the protection of personal information: [title], [email]."

### CA-QC-02 · Identification, location and profiling technologies off by default
- **Clause:** s. 8.1. Before using technology that can identify, locate or profile a person, the enterprise must inform them of its use and of the means to activate those functions. Read with s. 9.1 (highest level of confidentiality by default) and s. 14 (consent: manifest, free, enlightened, specific).
- **Test:** `cookies_before_consent` or `third_parties` show analytics, advertising, session-recording or profiling running before any choice.
- **Fix:** Block those scripts until the visitor opts in; a banner whose "Accept" and "Reject" are equally prominent; no pre-ticked boxes; no "by continuing to browse you agree".

### CA-QC-03 · Privacy policy for technological collection
- **Clause:** s. 8.2. An enterprise that collects personal information by technological means must publish on its website a confidentiality policy drafted in clear and simple terms.
- **Test:** As CA-PIPEDA-01, judged against "clear and simple terms".
- **Fix:** Same notice; keep it short, use headings, avoid legal boilerplate. A French version is expected for a Quebec audience (Charter of the French language); flag, do not assert.

### CA-QC-04 · Governance policies published
- **Clause:** s. 3.2. The enterprise must establish governance policies for personal information and publish detailed information about them on its website in clear and simple terms.
- **Test:** No statement of retention, destruction, roles and complaint handling.
- **Fix:** A short "How we handle personal information" section: retention periods, who has access, how complaints are handled.

---

## CASL (anti-spam)

### CA-CASL-01 · Express consent wording at sign-up
- **Clause:** s. 6(1)(a) (consent required to send a commercial electronic message); s. 10(1) (when seeking express consent, state the purpose, identify the person seeking consent, and any prescribed information: contact details and a statement that consent can be withdrawn). CRTC guidance: pre-checked boxes are not express consent.
- **Test:** A newsletter or marketing sign-up exists (`forms` with an email field and marketing wording), and the wording lacks purpose, sender identity, contact details or the withdrawal statement; or a consent checkbox has `prechecked: true`.
- **Fix:** Unticked checkbox: "Yes, send me [what] from [legal name], [mailing address or email]. You can unsubscribe at any time." Keep a record of when and how each consent was given.

### CA-CASL-02 · Contact forms are not marketing consent
- **Clause:** s. 6(1); implied consent is limited to s. 10(9) situations (existing business or non-business relationship; conspicuously published address with a message relevant to the person's role and no statement refusing messages).
- **Test:** A contact form exists and the privacy text or form implies submissions will be added to a mailing list.
- **Fix:** Separate the two: the contact form answers the enquiry; a separate, unticked box asks for marketing consent.

### CA-CASL-03 · Unsubscribe mechanism (if the site sends email)
- **Clause:** s. 6(2)(c) and s. 11 (unsubscribe mechanism; give effect within 10 business days).
- **Test:** Owner confirms marketing email is sent; check a sample email, not just the site.
- **Fix:** Every message carries a working unsubscribe link or reply instruction and the sender's mailing address.

---

## Competition Act (deceptive marketing)

### CA-COMP-01 · Claims must be accurate in a material respect
- **Clause:** s. 74.01(1)(a) (civil reviewable conduct: a representation to the public that is false or misleading in a material respect); s. 52 (criminal, if made knowingly or recklessly). The general impression and the literal meaning both count (s. 74.03(5) / s. 52(4)).
- **Test:** Quantified claims on the site ("13+ years", "trained 10,000+", "taught 830+ executives", client counts, "certified", rankings) that the owner cannot document, or that conflict with each other across pages.
- **Fix:** Keep a one-page evidence file for each number. Where two numbers count different things, make the label say what is counted ("13+ years of production AI").

### CA-COMP-02 · Testimonials are real, accurate and authorised
- **Clause:** s. 74.02 (a representation that purports to be a testimonial about a product's performance or use is reviewable unless it was previously made or published by the person, or made with their permission); s. 74.01(1)(a) for edits that change meaning.
- **Test:** `testimonials` present. Check: is each attributed to a real, identifiable person; is there an ellipsis or a bracketed insertion that changes meaning; does the owner hold permission (a public LinkedIn recommendation counts as published by the person, but quoting it on another site is safest with consent).
- **Fix:** Keep the source link and the permission for each quote; mark edits honestly with ellipses and brackets, never in a way that changes the meaning; link to the original where possible (good: "All recommendations on LinkedIn").

### CA-COMP-03 · Performance claims need adequate and proper testing
- **Clause:** s. 74.01(1)(b): a representation about performance, efficacy or length of life not based on an adequate and proper test.
- **Test:** Claims such as "cuts errors by 40%", "guaranteed results", "99% accurate".
- **Fix:** Remove the number or publish what it is based on (the test, sample and date).

---

## Copyright Act

### CA-COPY-01 · Rights in every image, video, font and quoted text
- **Clause:** s. 3 (copyright owner's exclusive rights); s. 27(1) (infringement).
- **Test:** List each media asset and font. Self-hosted fonts need their licence (for example SIL Open Font License files shipped with the fonts). Stock images need the licence. AI-generated media: check the AI tool's terms for ownership and commercial use. Photos of people: permission.
- **Fix:** Keep a `CREDITS` or `LICENSES` file in the repo and a credits line in the footer where a licence requires attribution.

### CA-COPY-02 · Third-party trade-marks and logos
- **Clause:** Trademarks Act (R.S.C. 1985, c. T-13), s. 22 (depreciation of goodwill) and s. 7 (confusion). Cite without section numbers in the report unless confirmed.
- **Test:** Client or university logos displayed as endorsements.
- **Fix:** Use names in plain text, describe the relationship accurately ("taught at"), and use logos only with permission.

---

## AODA (Ontario accessibility)

### CA-AODA-01 · Website conformance (50+ employees or public sector)
- **Clause:** O. Reg. 191/11, s. 14: new and refreshed public websites and web content must conform to WCAG 2.0 Level AA (live captions and pre-recorded audio description excepted).
- **Test:** Only if the organisation has 50+ employees in Ontario or is a designated public-sector organisation. Otherwise mark **Best practice only** and use the WCAG findings from `clauses-accessibility-ai.md`.
- **Fix:** Remediate axe violations; add manual keyboard and screen-reader checks; publish an accessibility statement with a feedback contact.

### CA-AODA-02 · Feedback process
- **Clause:** O. Reg. 191/11, s. 11 (feedback processes must be accessible).
- **Test:** No accessible way to give feedback or request an alternative format.
- **Fix:** One line in the footer or accessibility statement: how to request an accessible format, with an email address.
