"""Generate assets/og.png — the 1200x630 social card.

Run once (or after changing the copy); the PNG is committed and build.mjs
just copies it, so deploying never needs Python.

    python tools/make-og.py

Caprasimo isn't installed system-wide, so the display line falls back to
Georgia Bold — the closest warm serif on Windows. Swap FONT_DISPLAY for a
local Caprasimo .ttf if you install one.
"""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "og.png"

W, H = 1200, 630
BG = "#f5ead8"
ACCENT = "#c67139"
ACCENT_2 = "#7a8a5e"
ACCENT_200 = "#ffe1d0"
TEXT = "#201e1d"
MUTED = "#645c50"

FONT_DISPLAY = "C:/Windows/Fonts/georgiab.ttf"
FONT_BODY = "C:/Windows/Fonts/segoeui.ttf"
FONT_BODY_BOLD = "C:/Windows/Fonts/segoeuib.ttf"


def font(path, size):
    try:
        return ImageFont.truetype(path, size)
    except OSError:
        return ImageFont.load_default()


img = Image.new("RGB", (W, H), BG)
d = ImageDraw.Draw(img)

# Soft shapes, bleeding off the edges the way the site's blobs do.
d.ellipse([W - 210, -150, W + 250, 310], fill=ACCENT_200)
d.ellipse([W - 300, H - 210, W - 60, H + 30], fill=ACCENT_2)
d.ellipse([-120, H - 170, 120, H + 70], fill=ACCENT_200)

# Brand mark
d.ellipse([80, 74, 188, 182], fill=ACCENT)
mark = font(FONT_DISPLAY, 40)
d.text((134, 126), "MK", font=mark, fill=BG, anchor="mm")

name = font(FONT_BODY_BOLD, 30)
d.text((212, 128), "Meet Kapadia", font=name, fill=TEXT, anchor="lm")

# Headline
display = font(FONT_DISPLAY, 78)
d.text((80, 262), "Software developer,", font=display, fill=TEXT)
d.text((80, 352), "systems builder.", font=display, fill=ACCENT)

# Standfirst
body = font(FONT_BODY, 27)
d.text(
    (80, 470),
    "Full-stack web apps, AI tooling and local-first systems —",
    font=body,
    fill=MUTED,
)
d.text((80, 508), "shipped end to end.", font=body, fill=MUTED)

# Pill rule, echoing the site's rounded language
d.rounded_rectangle([80, 566, 320, 578], radius=6, fill=ACCENT)

OUT.parent.mkdir(parents=True, exist_ok=True)
img.save(OUT, "PNG", optimize=True)
print(f"wrote {OUT.relative_to(ROOT)} ({OUT.stat().st_size // 1024} KB)")
