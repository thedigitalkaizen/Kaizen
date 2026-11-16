"""Make branded blog cover images (1200x750 WebP) for posts without a photo.

Usage: python tools/make-covers.py
Edit COVERS below, then run. Output goes to assets/img/blog-<slug>.webp
"""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FONT_B = "C:/Windows/Fonts/segoeuib.ttf"
FONT_S = "C:/Windows/Fonts/seguisb.ttf"

COVERS = [
    ("study-abroad-lead-cost-meta-ads", "EDUCATION", ["What should a", "study-abroad lead", "cost on Meta?"], (47, 107, 255)),
    ("ramadan-umrah-marketing-calendar", "TRAVEL", ["The Ramadan Umrah", "marketing calendar", "for 2027"], (16, 185, 129)),
    ("bahrain-training-centres-fill-batches", "TRAINING", ["How Bahrain", "training centres fill", "every batch"], (124, 92, 255)),
]

W, H = 1200, 750
for slug, kicker, lines, accent in COVERS:
    img = Image.new("RGB", (W, H), (11, 18, 38))
    glow = Image.new("RGB", (W, H), (0, 0, 0))
    g = ImageDraw.Draw(glow)
    g.ellipse((700, -200, 1400, 500), fill=accent)
    g.ellipse((-300, 450, 400, 1100), fill=(124, 92, 255))
    glow = glow.filter(ImageFilter.GaussianBlur(160))
    img = Image.blend(img, glow, 0.55)
    d = ImageDraw.Draw(img)
    for x in range(0, W, 60):
        d.line([(x, 0), (x, H)], fill=(34, 44, 74), width=1)
    img = Image.blend(img, Image.new("RGB", (W, H), (11, 18, 38)), 0.35)
    d = ImageDraw.Draw(img)
    fk = ImageFont.truetype(FONT_S, 30)
    d.rounded_rectangle((80, 90, 80 + d.textlength(kicker, font=fk) + 48, 146), radius=28, fill=accent)
    d.text((104, 99), kicker, font=fk, fill=(255, 255, 255))
    ft = ImageFont.truetype(FONT_B, 76)
    y = 220
    for ln in lines:
        d.text((80, y), ln, font=ft, fill=(255, 255, 255))
        y += 96
    fb = ImageFont.truetype(FONT_S, 28)
    d.text((80, H - 90), "The Kaizen Agency  ·  Kaizen Journal", font=fb, fill=(190, 200, 225))
    out = ROOT / "assets" / "img" / f"blog-{slug}.webp"
    img.save(out, "WEBP", quality=80)
    img.save(out.with_suffix(".jpg"), "JPEG", quality=82)
    print("wrote", out.name)
