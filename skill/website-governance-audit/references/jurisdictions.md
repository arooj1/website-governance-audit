# Which laws apply: origin and audience

Last verified: 2026-11-17. Re-verify entries marked **watch**.

Two directions bring a law into play:

- **Origin**: the owner's place of establishment. Its laws apply to the owner whatever the audience.
- **Audience**: where visitors and customers are. A foreign law applies only when its own trigger is met: offering to, targeting, monitoring, or sending messages to people there. Being reachable is not a trigger.

Record each framework as Applies / Likely applies / Not triggered / Best practice only, with the trigger and the evidence.

---

## Canada (origin: any Canadian business; audience: visitors in Canada)

| Framework | Trigger | Notes |
|---|---|---|
| **PIPEDA** (S.C. 2000, c. 5, Part 1) | A private-sector organisation collects, uses or discloses personal information in the course of commercial activity. Ontario has no general private-sector privacy law, so PIPEDA governs Ontario businesses. Alberta, B.C. and Quebec have their own laws for activity inside those provinces; PIPEDA still governs cross-border and interprovincial flows. | Receiving an email from a prospect through a website is collecting personal information. So is logging IP addresses. **Watch:** Bill C-36 (Protecting Privacy and Consumer Data Act), introduced 15 June 2026, would replace Part 1 of PIPEDA. It is a bill, not law. |
| **Quebec Law 25** (Act respecting the protection of personal information in the private sector, CQLR c P-39.1, as amended) | The enterprise collects personal information about people in Quebec. Treat as **Likely applies** when the site serves "Canada" or "Canada-wide", has French content, or the owner has Quebec clients; **Applies** when Quebec residents' data is confirmed collected. | Strictest cookie rule in North America (s. 8.1: identification, location and profiling technologies off until activated). Requires a published privacy policy for collection by technological means (s. 8.2) and the published title and contact details of the person in charge of personal information (s. 3.1). |
| **CASL** (S.C. 2010, c. 23) | Commercial electronic messages sent from or to computers in Canada. For a website: newsletter or marketing sign-ups, contact forms that feed marketing, and auto-replies that promote. | The site is where consent is collected, so the consent wording is audited here. |
| **Competition Act** (R.S.C. 1985, c. C-34), deceptive marketing provisions | Representations to the public in Canada promoting a product, service or business interest. | Covers claims, testimonials, "years of experience", performance claims and drip pricing. |
| **Copyright Act** (R.S.C. 1985, c. C-42) | Any work reproduced on the site. | Photos, video, fonts, quoted text, AI tool terms. |
| **AODA** (S.O. 2005, c. 11) and Integrated Accessibility Standards, O. Reg. 191/11 | Organisation with at least one employee in Ontario. Website conformance to **WCAG 2.0 AA** (s. 14) is required for designated public-sector organisations and for private organisations with **50+ employees in Ontario**. Under 50: **Best practice only** for the website, though general accessibility duties still apply. | **Watch:** commentary expects Ontario to move to WCAG 2.2; not yet in the regulation as of the verified date. |
| **Accessible Canada Act** | Federally regulated organisations only (banks, telecom, airlines, federal Crown). | Usually Not triggered for small businesses. |

## European Union (audience: people in the EU)

| Framework | Trigger | Notes |
|---|---|---|
| **GDPR** (Regulation (EU) 2016/679), Art. 3(2) | Owner not established in the EU, but (a) **offers goods or services** to people in the EU (signals: EU languages, euro prices, EU delivery, EU clients named, "worldwide" with EU marketing), or (b) **monitors behaviour** of people in the EU (tracking or profiling cookies, analytics with identifiers, session recording, ad pixels). | Recital 23: mere accessibility of the website, an email address or the language commonly used in the owner's country is not enough. A site with no tracking and no EU targeting is usually **Not triggered**, and the report should say exactly what would trigger it. |
| **ePrivacy Directive** (2002/58/EC) Art. 5(3), via national law | Storing or reading information on the device of a user in the EU (cookies, localStorage, pixels, fingerprinting), unless strictly necessary for the service the user asked for. | Applies on the device, not on establishment. If the site sets non-essential cookies for every visitor, EU visitors are included. |
| **EU AI Act** (Regulation (EU) 2024/1689) Art. 50 | Art. 2(1)(c): applies to deployers outside the EU where the AI system's **output is used in the EU**. Art. 50 transparency obligations apply from **2 August 2026**; the Digital Omnibus (Reg. (EU) 2026/1744) did not delay them, except a grace period to 2 December 2026 for the providers' machine-readable marking duty (Art. 50(2)) on systems already on the market. | For a website: AI-generated or manipulated images, audio or video that are deep fakes (Art. 3(60)) need a disclosure by the deployer (Art. 50(4)); evidently artistic, creative or fictional work gets a lighter, non-intrusive disclosure. A chatbot must tell people they are talking to AI (Art. 50(1)). **Likely applies** when the site has EU visitors and AI-generated media; confirm the audience. |
| **European Accessibility Act** (Directive (EU) 2019/882) | E-commerce and certain other services to EU consumers, from 28 June 2025. | **Microenterprises providing services are exempt** (fewer than 10 staff and annual turnover or balance sheet of at most EUR 2 million). Most sole consultancies are Not triggered. |

## United Kingdom (audience: people in the UK)

| Framework | Trigger | Notes |
|---|---|---|
| **UK GDPR** Art. 3(2) | Same targeting/monitoring test as the EU GDPR. | |
| **PECR** reg. 6, as amended by the **Data (Use and Access) Act 2025** (s. 112, Sch. A1) | Storing or accessing information on a UK user's device. | From 5 February 2026, narrow exemptions from consent for first-party statistical analytics (with an opt-out), appearance/functionality, security and software updates. Advertising and cross-site tracking still need consent. A UK exemption does not cover EU visitors. |

## United States (audience: people in the US)

| Framework | Trigger | Notes |
|---|---|---|
| **FTC Act s. 5** (15 U.S.C. 45) with **Endorsement Guides** (16 CFR Part 255) and **Consumer Reviews and Testimonials Rule** (16 CFR Part 465, in force 21 Oct 2024) | Advertising or marketing to US consumers or businesses, including a foreign business marketing into the US. | Testimonials, endorsements, "AI-powered" claims, fake social proof. Part 465 carries civil penalties for knowing violations. |
| **CCPA/CPRA** (Cal. Civ. Code 1798.100 et seq.) | For-profit business doing business in California **and** one of: annual gross revenue over the inflation-adjusted threshold (USD 26.625 million for 2025–2026, measured globally), buying/selling/sharing personal information of 100,000+ California consumers or households, or 50%+ of revenue from selling or sharing personal information. | Most sole consultancies are **Not triggered**. Other state privacy laws use similar or higher thresholds. |
| **COPPA** (16 CFR Part 312) | Site or service directed to children under 13, or actual knowledge of collecting their data. | Check for kids' courses, games, or school products. |
| **CAN-SPAM** (15 U.S.C. 7701 et seq.) | Commercial email to US recipients. | Website relevance: what the sign-up promises. |
| **ADA Title III** | No federal website regulation for private businesses; courts are split on websites. | Report as litigation risk and **Best practice only** (WCAG 2.1/2.2 AA), never as a legal requirement. |

## Everywhere (best practice, no single law)

WCAG 2.2 AA; HTTPS with HSTS; security headers; a published accessibility statement; an AI-use statement; C2PA content credentials on AI media; a deliberate AI-crawler policy in robots.txt. Tie each to the closest legal hook where one exists (for example, safeguards in PIPEDA Principle 4.7 or GDPR Art. 32), and otherwise mark it Best practice only.
