#!/usr/bin/env python3
"""Build assets/scope.svg: the "reachable everywhere is not governed everywhere" diagram,
in Arooj Qureshi's Sketch Bold design system. Plays once and settles inside 5 seconds.

Run:  pip install fonttools brotli && python3 assets/banner/build_scope.py
"""
import base64
import io
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont

HERE = Path(__file__).parent
OUT = HERE.parent / "scope.svg"

SURFACE, RAISED = "#111214", "#1C1D21"
INK, INK_MUTED, INK_SUBTLE = "#FAFAFA", "#D4D4D8", "#A1A1AA"
HIGHLIGHTER, ON_HIGHLIGHTER, ACCENT = "#FDE047", "#111214", "#FDE047"
W, H = 1280, 540

LABEL = "ORIGIN + AUDIENCE"
NOTE = "reachable is not a trigger"
NOTE2 = "one tracking pixel changes that"
SITE_KICKER = "ONE WEBSITE"
SITE_LINES = ["Owner in Ontario,", "Canada"]
SITE_SUB = "LOADS IN EVERY COUNTRY"
# (title, trigger, status, kind) kind: applies | likely | not
REGIONS = [
    ("Canada · PIPEDA, CASL", "THE OWNER IS HERE", "APPLIES", "applies"),
    ("United States · FTC Act", "THE SITE MARKETS TO US CLIENTS", "APPLIES", "applies"),
    ("EU · AI Act Art. 50", "AI VIDEO SEEN BY EU VISITORS", "LIKELY APPLIES", "likely"),
    ("EU · GDPR and cookie rules", "NO OFFERING, NO TRACKING", "NOT TRIGGERED", "not"),
]

FONTS = {
    "AQ Display 900": ("inter-tight-latin-900-normal.woff2", "".join(SITE_LINES)),
    "AQ Display 800": ("inter-tight-latin-800-normal.woff2", "".join(r[0] for r in REGIONS)),
    "AQ Hand": ("caveat-latin-700-normal.woff2", NOTE + NOTE2),
    "AQ Mono": ("jetbrains-mono-latin-600-normal.woff2", LABEL + SITE_KICKER + SITE_SUB + "".join(r[1] + r[2] for r in REGIONS)),
}


def subset_b64(file, text):
    font = TTFont(HERE / file)
    opts = subset.Options()
    opts.flavor = "woff2"
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
    return sum(hm[cmap[ord(c)]][0] for c in text if ord(c) in cmap) / upm * size + letter_spacing * size * (len(text) - 1)


faces = "\n".join(
    f"@font-face{{font-family:'{n}';src:url(data:font/woff2;base64,{subset_b64(f, t)}) format('woff2');}}"
    for n, (f, t) in FONTS.items()
)

M = 64
label_w = measure("jetbrains-mono-latin-600-normal.woff2", LABEL, 15, 0.06) + 36

# Site card
SX, SY, SW, SH = M, 196, 330, 196
anchor = (SX + SW, SY + SH / 2)

# Region cards
RX, RW, RH, RGAP, RY0 = 700, 516, 84, 20, 72
MONO_PILL = 14

parts, css = [], []
for i, (title, trigger, status, kind) in enumerate(REGIONS):
    y = RY0 + i * (RH + RGAP)
    cy = y + RH / 2
    delay = 0.35 + i * 0.4
    pill_w = measure("jetbrains-mono-latin-600-normal.woff2", status, MONO_PILL, 0.06) + 28
    px = RX + RW - 20 - pill_w
    # connector
    x0, y0 = anchor
    x1 = RX - 6
    path = f"M{x0 + 6:.0f} {y0:.0f} C {x0 + 150:.0f} {y0:.0f}, {x1 - 150:.0f} {cy:.0f}, {x1:.0f} {cy:.0f}"
    if kind == "applies":
        line = f'<path class="ln l{i}" d="{path}" fill="none" stroke="{ACCENT}" stroke-width="3" stroke-linecap="round"/>'
    elif kind == "likely":
        line = f'<path class="ln l{i}" d="{path}" fill="none" stroke="{ACCENT}" stroke-width="3" stroke-linecap="round" stroke-dasharray="2 9"/>'
    else:
        line = f'<path class="ln l{i}" d="{path}" fill="none" stroke="{INK_SUBTLE}" stroke-width="2" stroke-linecap="round" stroke-dasharray="10 10" opacity=".55"/>'
    parts.append(line)
    css.append(f".l{i}{{animation:fade .5s ease-out {delay:.2f}s both}}.c{i}{{animation:slide .5s cubic-bezier(.2,.7,.2,1) {delay + 0.15:.2f}s both}}")

    # status pill
    if kind == "not":
        pill = (f'<rect class="hl" x="{px:.0f}" y="{cy - 16:.0f}" width="{pill_w:.0f}" height="32" fill="{HIGHLIGHTER}"/>'
                f'<text x="{px + pill_w / 2:.0f}" y="{cy + 5:.0f}" class="mono pill hl-text" fill="{ON_HIGHLIGHTER}" text-anchor="middle">{status}</text>')
    else:
        dash = ' stroke-dasharray="4 5"' if kind == "likely" else ""
        pill = (f'<rect x="{px:.0f}" y="{cy - 16:.0f}" width="{pill_w:.0f}" height="32" rx="16" fill="none" stroke="{ACCENT}" stroke-width="2"{dash}/>'
                f'<text x="{px + pill_w / 2:.0f}" y="{cy + 5:.0f}" class="mono pill" fill="{ACCENT}" text-anchor="middle">{status}</text>')
    parts.append(
        f'<g class="c{i}">'
        f'<rect x="{RX}" y="{y}" width="{RW}" height="{RH}" rx="20" fill="{RAISED}"/>'
        f'<text x="{RX + 24}" y="{y + 36}" class="title" fill="{INK}">{title}</text>'
        f'<text x="{RX + 24}" y="{y + 61}" class="mono small" fill="{INK_SUBTLE}">{trigger}</text>'
        f"{pill}</g>"
    )

last_y = RY0 + 3 * (RH + RGAP)
pill_w_last = measure("jetbrains-mono-latin-600-normal.woff2", REGIONS[3][2], MONO_PILL, 0.06) + 28
pill_cx = RX + RW - 20 - pill_w_last / 2
note2_w = measure("caveat-latin-700-normal.woff2", NOTE2, 30)
note2_x = pill_cx - 70 - note2_w

svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" role="img" aria-labelledby="st sd">
<title id="st">Reachable everywhere is not governed everywhere</title>
<desc id="sd">One website, owned in Ontario, Canada, loads in every country. Canadian law applies because the owner is there. US advertising law applies because the site markets to US clients. The EU AI Act's Article 50 likely applies because EU visitors see an AI-generated video. The EU GDPR and cookie rules are not triggered, because the site neither offers services to the EU nor tracks visitors; one tracking pixel would change that.</desc>
<style>
{faces}
.big{{font-family:'AQ Display 900','Inter Tight',Inter,system-ui,sans-serif;font-weight:900;font-size:34px;letter-spacing:-0.035em}}
.title{{font-family:'AQ Display 800','Inter Tight',Inter,system-ui,sans-serif;font-weight:800;font-size:22px;letter-spacing:-0.01em}}
.hand{{font-family:'AQ Hand',Caveat,'Segoe Print',cursive;font-weight:700;font-size:32px}}
.mono{{font-family:'AQ Mono','JetBrains Mono',ui-monospace,monospace;font-weight:600;font-size:15px;letter-spacing:0.06em}}
.small{{font-size:12.5px;letter-spacing:0.05em}}
.pill{{font-size:{MONO_PILL}px}}
@keyframes fade{{from{{opacity:0}}to{{opacity:1}}}}
@keyframes slide{{from{{opacity:0;transform:translateX(16px)}}to{{opacity:1;transform:none}}}}
.site{{animation:fade .5s ease-out .1s both}}
.hl{{transform-box:fill-box;transform-origin:left center;animation:swipe .6s cubic-bezier(.2,.7,.2,1) 2.3s both}}
@keyframes swipe{{from{{transform:scaleX(0)}}to{{transform:scaleX(1)}}}}
.hl-text{{animation:ink .2s linear 2.7s both}}
@keyframes ink{{from{{fill:{INK_SUBTLE}}}to{{fill:{ON_HIGHLIGHTER}}}}}
.note2{{animation:fade .4s ease-out 3s both}}
.draw{{stroke-dasharray:200;animation:draw .7s ease-out 3.2s both}}
@keyframes draw{{from{{stroke-dashoffset:200}}to{{stroke-dashoffset:0}}}}
{''.join(css)}
@media (prefers-reduced-motion: reduce){{*{{animation:none!important}}}}
</style>
<rect width="{W}" height="{H}" fill="{SURFACE}"/>

<rect x="{M}" y="40" width="{label_w:.0f}" height="36" rx="18" fill="none" stroke="{ACCENT}" stroke-width="2"/>
<text x="{M + 18}" y="63" class="mono" fill="{ACCENT}">{LABEL}</text>
<text x="{M}" y="138" class="hand" fill="{ACCENT}" transform="rotate(-3 {M} 130)">{NOTE}</text>

{''.join(parts[i] for i in range(0, len(parts), 2))}

<g class="site">
  <rect x="{SX}" y="{SY}" width="{SW}" height="{SH}" rx="20" fill="{RAISED}" stroke="{ACCENT}" stroke-width="3"/>
  <text x="{SX + 28}" y="{SY + 44}" class="mono small" fill="{INK_SUBTLE}">{SITE_KICKER}</text>
  <text x="{SX + 28}" y="{SY + 96}" class="big" fill="{INK}">{SITE_LINES[0]}</text>
  <text x="{SX + 28}" y="{SY + 138}" class="big" fill="{INK}">{SITE_LINES[1]}</text>
  <text x="{SX + 28}" y="{SY + 172}" class="mono small" fill="{INK_SUBTLE}">{SITE_SUB}</text>
  <circle cx="{anchor[0]}" cy="{anchor[1]}" r="7" fill="{ACCENT}"/>
</g>

{''.join(parts[i] for i in range(1, len(parts), 2))}

<g class="note2">
  <text x="{note2_x:.0f}" y="{last_y + RH + 44}" class="hand" fill="{ACCENT}" style="font-size:30px">{NOTE2}</text>
</g>
<path class="draw" d="M{note2_x + note2_w + 10:.0f} {last_y + RH + 30} C {pill_cx - 20:.0f} {last_y + RH + 30}, {pill_cx:.0f} {last_y + RH + 18}, {pill_cx:.0f} {last_y + RH / 2 + 24} m -9 9 l 9 -9 l 9 9" fill="none" stroke="{ACCENT}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
"""
OUT.write_text(svg)
print(f"Wrote {OUT} ({OUT.stat().st_size / 1024:.0f} KB)")
