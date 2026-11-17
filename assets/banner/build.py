#!/usr/bin/env python3
"""Build assets/banner.svg: the animated README banner, in Arooj Qureshi's Sketch Bold design system.

Fonts are subset to the characters used and embedded as base64 WOFF2, so the banner renders
the same inside GitHub's <img> sandbox, which blocks external font requests.

Run:  pip install fonttools brotli && python3 assets/banner/build.py
"""
import base64
import io
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont

HERE = Path(__file__).parent
OUT = HERE.parent / "banner.svg"

# Sketch Bold tokens (dark theme)
SURFACE, RAISED = "#111214", "#1C1D21"
INK, INK_MUTED, INK_SUBTLE = "#FAFAFA", "#D4D4D8", "#A1A1AA"
HIGHLIGHTER, ON_HIGHLIGHTER, ACCENT = "#FDE047", "#111214", "#FDE047"

W, H = 1280, 440

# ---- Copy -------------------------------------------------------------------
LABEL = "WEBSITE GOVERNANCE AUDIT"
NOTE = "scanned like a first-time visitor"
HEAD_1 = "Your website is already"
HEAD_2 = "making legal promises."  # the one highlighted phrase
SUB_1 = "Every finding cites a clause and proposes a fix,"
SUB_2 = "for the laws where you are and where your visitors are."
NAME, ROLE = "Arooj Qureshi", "AI engineering leader · educator"
SITE = "first visit · no consent given"
ROWS = [  # (clause, status)
    ("COOKIES BEFORE CONSENT", "0"),
    ("PIPEDA 4.8 · PRIVACY", "FIXED"),
    ("GDPR ART. 3(2)", "NOT TRIGGERED"),
    ("AI ACT ART. 50(4)", "LABELLED"),
    ("WCAG 2.5.3", "PASS"),
]

# ---- Fonts: subset + embed -------------------------------------------------
FONTS = {
    "AQ Display 900": ("inter-tight-latin-900-normal.woff2", HEAD_1 + HEAD_2 + "AQ"),
    "AQ Display 800": ("inter-tight-latin-800-normal.woff2", NAME),
    "AQ Display 600": ("inter-tight-latin-600-normal.woff2", SUB_1 + SUB_2 + ROLE),
    "AQ Hand": ("caveat-latin-700-normal.woff2", NOTE),
    "AQ Mono": ("jetbrains-mono-latin-600-normal.woff2", LABEL + SITE.upper() + "".join(a + b for a, b in ROWS)),
}


def subset_b64(file, text):
    font = TTFont(HERE / file)
    opts = subset.Options()
    opts.flavor = "woff2"
    opts.layout_features = ["kern", "liga"]
    opts.name_IDs = []
    s = subset.Subsetter(opts)
    s.populate(text=text + " .")
    s.subset(font)
    buf = io.BytesIO()
    font.flavor = "woff2"
    font.save(buf)
    return base64.b64encode(buf.getvalue()).decode()


def measure(file, text, size, letter_spacing=0.0):
    f = TTFont(HERE / file)
    cmap, hm, upm = f.getBestCmap(), f["hmtx"], f["head"].unitsPerEm
    w = sum(hm[cmap[ord(c)]][0] for c in text if ord(c) in cmap)
    return w / upm * size + letter_spacing * size * (len(text) - 1)


faces = "\n".join(
    f"@font-face{{font-family:'{name}';src:url(data:font/woff2;base64,{subset_b64(file, text)}) format('woff2');}}"
    for name, (file, text) in FONTS.items()
)

# ---- Layout -----------------------------------------------------------------
M = 64
HEAD_SIZE = 58
note_w = measure("caveat-latin-700-normal.woff2", NOTE, 34)
head2_w = measure("inter-tight-latin-900-normal.woff2", HEAD_2, HEAD_SIZE, -0.04)
label_w = measure("jetbrains-mono-latin-600-normal.woff2", LABEL, 15, 0.06) + 36

CARD_X, CARD_Y, CARD_W, CARD_H = 776, 52, 440, 336
ROW_Y0, ROW_STEP = CARD_Y + 96, 50
SCAN_FROM, SCAN_TO = CARD_Y + 64, CARD_Y + CARD_H - 24
CYCLE = 4.6  # the whole animation plays once and ends inside 5 s (WCAG 2.2.2 Pause, Stop, Hide)

row_svg, row_css = [], []
for i, (clause, status) in enumerate(ROWS):
    y = ROW_Y0 + i * ROW_STEP
    # The row appears when the scan line reaches it.
    t = round((y - 12 - SCAN_FROM) / (SCAN_TO - SCAN_FROM) * 70, 1)
    row_css.append(
        f"@keyframes r{i}{{0%,{t}%{{opacity:0;transform:translateX(-8px)}}{t + 6}%,100%{{opacity:1;transform:none}}}}"
        f"@keyframes c{i}{{0%,{t + 3}%{{stroke-dashoffset:30}}{t + 10}%,100%{{stroke-dashoffset:0}}}}"
        f".row{i}{{animation:r{i} {CYCLE}s linear .3s both}}.row{i} .tick{{animation:c{i} {CYCLE}s linear .3s both}}"
    )
    sep = "" if i == len(ROWS) - 1 else f'<line x1="{CARD_X + 24}" x2="{CARD_X + CARD_W - 24}" y1="{y + 22}" y2="{y + 22}" stroke="{SURFACE}" stroke-width="2"/>'
    row_svg.append(
        f'<g class="row row{i}">'
        f'<path class="tick" d="M{CARD_X + 26} {y - 6} l6 7 l13 -16" fill="none" stroke="{ACCENT}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="30"/>'
        f'<text x="{CARD_X + 56}" y="{y}" class="mono" fill="{INK}">{clause}</text>'
        f'<text x="{CARD_X + CARD_W - 24}" y="{y}" class="mono" fill="{ACCENT}" text-anchor="end">{status}</text>'
        f"{sep}</g>"
    )

svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" role="img" aria-labelledby="t d">
<title id="t">Website governance audit</title>
<desc id="d">Your website is already making legal promises. Every finding cites a clause and proposes a fix, for the laws where you are and where your visitors are. An animated scan checks cookies before consent, PIPEDA 4.8, GDPR Article 3(2), EU AI Act Article 50(4) and WCAG 2.5.3.</desc>
<style>
{faces}
.display{{font-family:'AQ Display 900','Inter Tight',Inter,system-ui,sans-serif;font-weight:900;font-size:{HEAD_SIZE}px;letter-spacing:-0.04em}}
.sub{{font-family:'AQ Display 600','Inter Tight',Inter,system-ui,sans-serif;font-weight:600;font-size:22px}}
.name{{font-family:'AQ Display 800','Inter Tight',Inter,system-ui,sans-serif;font-weight:800;font-size:19px}}
.role{{font-family:'AQ Display 600','Inter Tight',Inter,system-ui,sans-serif;font-weight:600;font-size:15px}}
.hand{{font-family:'AQ Hand',Caveat,'Segoe Print',cursive;font-weight:700;font-size:34px}}
.mono{{font-family:'AQ Mono','JetBrains Mono',ui-monospace,monospace;font-weight:600;font-size:15px;letter-spacing:0.04em}}
.badge{{font-family:'AQ Display 900','Inter Tight',Inter,system-ui,sans-serif;font-weight:900;font-size:15px}}
/* One-time entrance: the highlighter swipes in, then the text turns dark on it. */
.hl{{transform-box:fill-box;transform-origin:left center;animation:swipe .7s cubic-bezier(.2,.7,.2,1) .5s both}}
@keyframes swipe{{from{{transform:scaleX(0)}}to{{transform:scaleX(1)}}}}
.hl-text{{animation:ink .25s linear .95s both}}
@keyframes ink{{from{{fill:{INK}}}to{{fill:{ON_HIGHLIGHTER}}}}}
.draw{{stroke-dasharray:240;animation:draw .9s ease-out 1.3s both}}
@keyframes draw{{from{{stroke-dashoffset:240}}to{{stroke-dashoffset:0}}}}
/* One scan over the checklist; everything has settled by about 4.9 s. */
.scan{{animation:scan {CYCLE}s linear .3s both}}
@keyframes scan{{0%{{transform:translateY(0);opacity:0}}3%{{opacity:1}}70%{{transform:translateY({SCAN_TO - SCAN_FROM}px);opacity:1}}80%,100%{{transform:translateY({SCAN_TO - SCAN_FROM}px);opacity:0}}}}
{''.join(row_css)}
@media (prefers-reduced-motion: reduce){{*{{animation:none!important}}.scan{{opacity:0}}}}
</style>
<rect width="{W}" height="{H}" fill="{SURFACE}"/>

<!-- Left: label pill, hand note, headline with one highlighted phrase, subhead, byline -->
<rect x="{M}" y="52" width="{label_w:.0f}" height="36" rx="18" fill="none" stroke="{ACCENT}" stroke-width="2"/>
<text x="{M + 18}" y="75" class="mono" fill="{ACCENT}" style="letter-spacing:0.06em">{LABEL}</text>

<g transform="rotate(-3 {M} 132)">
  <text x="{M}" y="138" class="hand" fill="{ACCENT}">{NOTE}</text>
  <path class="draw" d="M{M + note_w + 28:.0f} 118 c 2 9 1 18 -1 26 m -8 -9 l 8 10 l 7 -10" fill="none" stroke="{ACCENT}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</g>

<text x="{M}" y="212" class="display" fill="{INK}">{HEAD_1}</text>
<rect class="hl" x="{M - 6}" y="226" width="{head2_w + 14:.0f}" height="68" fill="{HIGHLIGHTER}"/>
<text x="{M}" y="280" class="display hl-text" fill="{ON_HIGHLIGHTER}">{HEAD_2}</text>

<text x="{M}" y="334" class="sub" fill="{INK_MUTED}">{SUB_1}</text>
<text x="{M}" y="364" class="sub" fill="{INK_MUTED}">{SUB_2}</text>

<circle cx="{M + 17}" cy="{H - 34}" r="17" fill="{HIGHLIGHTER}"/>
<text x="{M + 17}" y="{H - 29}" class="badge" fill="{ON_HIGHLIGHTER}" text-anchor="middle">AQ</text>
<text x="{M + 46}" y="{H - 29}" class="name" fill="{INK}">{NAME}</text>
<text x="{M + 46 + measure('inter-tight-latin-800-normal.woff2', NAME, 19) + 12:.0f}" y="{H - 29}" class="role" fill="{INK_SUBTLE}">{ROLE}</text>

<!-- Hand-drawn arrow from the headline to the scan -->
<path class="draw" d="M{M + head2_w + 22:.0f} 252 C {M + head2_w + 50:.0f} 236, {CARD_X - 40} 214, {CARD_X - 14} 196 m -14 -2 l 14 2 l -5 13" fill="none" stroke="{ACCENT}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>

<!-- Right: the scan card -->
<rect x="{CARD_X}" y="{CARD_Y}" width="{CARD_W}" height="{CARD_H}" rx="20" fill="{RAISED}"/>
<circle cx="{CARD_X + 30}" cy="{CARD_Y + 30}" r="6" fill="{INK_SUBTLE}" opacity=".5"/>
<circle cx="{CARD_X + 50}" cy="{CARD_Y + 30}" r="6" fill="{INK_SUBTLE}" opacity=".5"/>
<circle cx="{CARD_X + 70}" cy="{CARD_Y + 30}" r="6" fill="{INK_SUBTLE}" opacity=".5"/>
<text x="{CARD_X + CARD_W - 24}" y="{CARD_Y + 35}" class="mono" fill="{INK_SUBTLE}" text-anchor="end" style="font-size:13px">{SITE.upper()}</text>
<line x1="{CARD_X}" x2="{CARD_X + CARD_W}" y1="{CARD_Y + 56}" y2="{CARD_Y + 56}" stroke="{SURFACE}" stroke-width="2"/>
{''.join(row_svg)}
<g class="scan">
  <rect x="{CARD_X + 16}" y="{SCAN_FROM - 26}" width="{CARD_W - 32}" height="26" fill="{ACCENT}" opacity=".07"/>
  <line x1="{CARD_X + 16}" x2="{CARD_X + CARD_W - 16}" y1="{SCAN_FROM}" y2="{SCAN_FROM}" stroke="{ACCENT}" stroke-width="2" stroke-linecap="round"/>
</g>
</svg>
"""

OUT.write_text(svg)
print(f"Wrote {OUT} ({OUT.stat().st_size / 1024:.0f} KB)")
