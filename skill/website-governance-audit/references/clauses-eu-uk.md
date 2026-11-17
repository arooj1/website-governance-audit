# Clause library: European Union and United Kingdom

Last verified: 2026-11-17. Official texts:
GDPR https://eur-lex.europa.eu/eli/reg/2016/679/oj ·
ePrivacy Directive https://eur-lex.europa.eu/eli/dir/2002/58/oj ·
EU AI Act https://eur-lex.europa.eu/eli/reg/2024/1689/oj ·
European Accessibility Act https://eur-lex.europa.eu/eli/dir/2019/882/oj ·
UK PECR reg. 6 https://www.legislation.gov.uk/uksi/2003/2426/regulation/6 ·
ICO guidance on cookies https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/

Apply only per `jurisdictions.md`. For a non-EU owner, start every GDPR entry by stating which Art. 3(2) limb is met; if neither, the GDPR entries are **Not triggered** and only ePrivacy (device-based) and the AI Act (output-based) can still apply.

---

## GDPR / UK GDPR

### EU-GDPR-01 · Territorial trigger (always record)
- **Clause:** Art. 3(2)(a) offering goods or services to data subjects in the Union; Art. 3(2)(b) monitoring their behaviour in the Union; Recital 23 (mere accessibility is insufficient); Recital 24 (tracking on the internet, including profiling, is monitoring).
- **Test:** Offering signals (EU languages, euro prices, EU delivery, EU clients) and monitoring signals (`tracking_vendors`, third-party cookies, fingerprinting).
- **Fix:** Not a fix but a decision: state which limb is met and why. If none, write what would trigger it.

### EU-GDPR-02 · Information at collection
- **Clause:** Art. 13 (information to provide where data are collected from the data subject: identity and contact, purposes and legal basis, recipients, transfers, retention, rights, right to complain).
- **Test:** GDPR applies and the privacy notice lacks Art. 13 items, or no notice is linked at the point of collection.
- **Fix:** Extend the privacy notice with the Art. 13 list; one notice can serve PIPEDA, Law 25 and GDPR if it covers the union of their requirements.

### EU-GDPR-03 · Lawful basis and consent quality
- **Clause:** Art. 6(1) (lawful basis); Art. 7 (conditions for consent: demonstrable, distinguishable, withdrawable as easily as given); Recital 32 (silence, pre-ticked boxes or inactivity are not consent).
- **Test:** Consent banner without a reject option as easy as accept (`consent_banner.has_reject` false); pre-ticked boxes; tracking before choice.
- **Fix:** Equal-weight Accept and Reject on the first layer; nothing non-essential before a choice; a persistent link to change the choice.

### EU-GDPR-04 · EU representative
- **Clause:** Art. 27 (controllers under Art. 3(2) must designate a representative in the Union), with the Art. 27(2)(a) exemption for occasional, low-risk processing that does not include large-scale special categories.
- **Test:** Only when Art. 3(2) is met. A small consultancy's occasional enquiries are usually within the exemption; record the reasoning.
- **Fix:** If the exemption does not fit, appoint a representative service and name it in the privacy notice.

### EU-GDPR-05 · Transfers caused by third-party resources (fonts, CDNs, embeds)
- **Clause:** Art. 6(1) and Chapter V (transfers); illustrative case: Landgericht München I, 20 January 2022, 3 O 17493/20 (dynamically loading Google Fonts transmitted visitors' IP addresses to Google without a legal basis).
- **Test:** `third_parties` with category `fonts`, `cdn` or `embedded-media` loaded on first visit.
- **Fix:** Self-host fonts and scripts; use privacy-enhanced embeds (for example `youtube-nocookie.com`) behind a click-to-load placeholder.

### EU-GDPR-06 · Security of processing
- **Clause:** Art. 32.
- **Test:** As CA-PIPEDA-04.
- **Fix:** As CA-PIPEDA-04.

---

## ePrivacy (cookies and device storage)

### EU-EPR-01 · Consent before non-essential storage or access
- **Clause:** Directive 2002/58/EC, Art. 5(3): storing information, or gaining access to information already stored, in the terminal equipment of a user requires consent with clear and comprehensive information, except where strictly necessary for a service explicitly requested by the user. Implemented in each member state's law.
- **Test:** `cookies_before_consent` (any non-essential) or `storage_before_consent` keys written by analytics/advertising scripts, or tracking pixels firing (`third_parties` advertising/analytics) before a choice.
- **Fix:** Load nothing non-essential until consent. If the only storage is strictly necessary (session, load balancing, security, consent record), no banner is needed; say so in the privacy notice.

### UK-PECR-01 · UK cookie rule with the 2026 exemptions
- **Clause:** PECR reg. 6 as amended by the Data (Use and Access) Act 2025 (s. 112 and Sch. A1, in force 5 February 2026): consent for storage/access unless strictly necessary or within the new exemptions (statistical analytics to improve the service, with a simple free opt-out; appearance/functionality adaptation; security; software updates).
- **Test:** UK visitors and non-essential cookies. Check whether any analytics in use fits the statistical exemption (first-party purpose, no sharing for advertising, opt-out offered).
- **Fix:** Either fit the exemption precisely (clear information plus opt-out) or ask for consent. Note that an exemption valid in the UK does not cover EU visitors.

---

## EU AI Act

### EU-AI-01 · Disclosure of AI-generated or manipulated media (deep fakes)
- **Clause:** Art. 50(4), first subparagraph: deployers of an AI system that generates or manipulates image, audio or video content constituting a deep fake shall disclose that the content has been artificially generated or manipulated. Where the content forms part of an evidently artistic, creative, satirical, fictional or analogous work, the obligation is limited to disclosing the existence of such content in an appropriate manner that does not hamper the display or enjoyment of the work. Definition of deep fake: Art. 3(60) (AI-generated or manipulated image, audio or video content that resembles existing persons, objects, places, entities or events and would falsely appear to a person to be authentic or truthful). Timing of the information: Art. 50(5) (clear and distinguishable, at the latest at the time of first interaction or exposure). Applies from 2 August 2026. Territorial reach: Art. 2(1)(c).
- **Test:** Owner confirms AI-generated media (scanner cannot tell). Then: is it realistic enough to appear authentic (photorealistic people, places, vehicles, events)? Is there a disclosure (`ai_label_found`, `videos[].label_nearby`)?
- **Fix:** A small visible label on or beside the asset ("AI-generated video"), plus an AI-use line in the footer or an AI statement page. Keep the provider's machine-readable marks (C2PA/content credentials, watermark) intact: do not strip metadata when re-encoding.

### EU-AI-02 · Chatbots and AI interaction
- **Clause:** Art. 50(1): providers shall ensure AI systems intended to interact directly with people are designed so that people are informed they are interacting with an AI system, unless obvious from the context.
- **Test:** `third_parties` category `chat`, or a chat widget on the page; owner confirms whether it is AI.
- **Fix:** First message of the widget states it is an AI assistant; offer a human route.

### EU-AI-03 · Machine-readable marking is the tool provider's duty
- **Clause:** Art. 50(2) (providers of systems generating synthetic content must mark outputs in a machine-readable format); grace period to 2 December 2026 for systems already on the market (Digital Omnibus, Reg. (EU) 2026/1744).
- **Test:** Informational. The site owner is a deployer; the duty sits with the generator (for example Runway, Sora, Midjourney).
- **Fix:** Do not remove provenance metadata when optimising media; prefer tools that emit C2PA content credentials.

---

## European Accessibility Act

### EU-EAA-01 · Accessibility of consumer e-commerce services
- **Clause:** Directive (EU) 2019/882, applying from 28 June 2025 via national laws; harmonised standard EN 301 549 (which incorporates WCAG 2.1 AA for web). Microenterprises providing services are exempt (Art. 4(5)).
- **Test:** Owner sells to EU consumers online and is not a microenterprise. Otherwise **Not triggered**.
- **Fix:** WCAG 2.1 AA (2.2 recommended), an accessibility statement, and a feedback route.
