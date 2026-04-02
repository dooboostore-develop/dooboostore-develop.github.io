#!/usr/bin/env python3
"""
Generate per-package OG images by overlaying a Twemoji on the base PNG.

- Base: assets/dooboostore.png (1024x1024 RGBA)
- Output: assets/images/<package-id>-og.png (1024x1024 RGBA)
- Emoji: Twemoji 72x72 PNGs, resized to 170x170, overlaid left at (107, 330)
  with subtle drop shadow (offset 7px, blur 9, opacity 90)

Usage:
  python3 scripts/generate-og-images.py           # generate all
  python3 scripts/generate-og-images.py --check   # just verify existing
"""
import argparse
import os
import sys
from pathlib import Path

try:
    from PIL import Image, ImageFilter
except ImportError:
    print("Pillow required: pip install Pillow")
    sys.exit(1)

ROOT = Path(__file__).resolve().parents[1]
BASE_PATH = ROOT / "assets" / "dooboostore.png"
OUT_DIR = ROOT / "assets" / "images"
CACHE_DIR = Path("/tmp")  # twemoji cache

# package-id -> (twemoji code, emoji char)
MAPPING = [
    ("simple-web-component", "1f9e9", "🧩"),
    ("simple-boot-http-server-ssr", "26a1", "⚡"),
    ("simple-boot-http-server", "1f4e1", "📡"),
    ("simple-boot", "2699", "⚙️"),
    ("simple-boot-front", "1fa9f", "🪟"),
    ("dom-parser", "1f4c4", "📄"),
    ("dom-render", "2728", "✨"),
    ("core", "1f48e", "💎"),
    ("core-web", "1f30d", "🌍"),
    ("core-node", "1f5a5", "🖥️"),
    ("simple-web-component-library", "1f4ca", "📊"),
    ("algorithm", "1f4c8", "📈"),
    ("lib-web", "1f3a8", "🎨"),
    ("lib-node", "1f4e6", "📦"),
    ("examples", "25b6", "▶️"),
]

TWEMOJI_BASE = "https://raw.githubusercontent.com/twitter/twemoji/master/assets/72x72/{code}.png"


def fetch_emoji(code: str) -> Path:
    cached = CACHE_DIR / f"emoji_{code}.png"
    if cached.exists() and cached.stat().st_size > 0:
        return cached
    url = TWEMOJI_BASE.format(code=code)
    rc = os.system(f"curl -sL {url} -o {cached} >/dev/null 2>&1")
    if rc != 0 or not cached.exists():
        raise RuntimeError(f"failed to fetch emoji {code} from {url}")
    return cached


def gen(size: int = 170, px: int = 107, py: int = 330,
        shadow: bool = True, shadow_offset: int = 7,
        shadow_blur: int = 9, shadow_opacity: int = 90):
    if not BASE_PATH.exists():
        raise FileNotFoundError(f"base not found: {BASE_PATH}")
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    base = Image.open(BASE_PATH).convert("RGBA")
    print(f"base {BASE_PATH} {base.size} corner={base.getpixel((0, 0))}")

    for pkg_id, code, emoji_char in MAPPING:
        variant = base.copy()
        emoji = Image.open(fetch_emoji(code)).convert("RGBA")
        emoji_up = emoji.resize((size, size), Image.LANCZOS)

        if shadow:
            alpha = emoji_up.split()[3]
            shadow_img = Image.new("RGBA", emoji_up.size, (0, 0, 0, 0))
            shadow_fill = Image.new("RGBA", emoji_up.size, (0, 0, 0, shadow_opacity))
            shadow_img.paste(shadow_fill, (0, 0), mask=alpha)
            shadow_img = shadow_img.filter(ImageFilter.GaussianBlur(radius=shadow_blur))
            variant.paste(shadow_img, (px + shadow_offset, py + shadow_offset), shadow_img)
        variant.paste(emoji_up, (px, py), emoji_up)
        out = OUT_DIR / f"{pkg_id}-og.png"
        variant.save(out, "PNG")
        print(f"saved {out.name} {emoji_char} ({code}) -> {os.path.getsize(out)} bytes")


def check():
    print(f"ROOT={ROOT}")
    print(f"BASE={BASE_PATH} exists={BASE_PATH.exists()}")
    for pkg_id, code, ch in MAPPING:
        p = OUT_DIR / f"{pkg_id}-og.png"
        exists = p.exists()
        size = p.stat().st_size if exists else 0
        print(f"{'OK' if exists else 'MISSING'} {p.name} {ch} {code} {size} bytes")


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description="Generate per-package OG images")
    ap.add_argument("--check", action="store_true", help="verify existing images")
    args = ap.parse_args()
    if args.check:
        check()
    else:
        gen()
