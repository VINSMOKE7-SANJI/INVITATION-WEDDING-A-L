import os
from PIL import Image, ImageDraw, ImageFont

OUT = "assets/images"
os.makedirs(OUT, exist_ok=True)

DARK1 = (18, 40, 33)      # deep forest green
DARK2 = (27, 58, 47)      # forest green
GOLD = (201, 169, 97)     # gold
GOLD_LIGHT = (224, 199, 140)
CREAM = (245, 240, 230)

def find_font(paths, size):
    for p in paths:
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()

SERIF_BOLD = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf",
]
SERIF = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf",
]

def vgrad(w, h, top, bottom):
    img = Image.new("RGB", (w, h), top)
    px = img.load()
    for y in range(h):
        t = y / max(h - 1, 1)
        r = int(top[0] + (bottom[0] - top[0]) * t)
        g = int(top[1] + (bottom[1] - top[1]) * t)
        b = int(top[2] + (bottom[2] - top[2]) * t)
        for x in range(w):
            px[x, y] = (r, g, b)
    return img

def corner_ornament(draw, x, y, size, flip_x=1, flip_y=1, color=GOLD):
    # simple filigree-like corner using arcs and lines
    for i in range(3):
        r = size - i * size // 4
        bbox = [x - r*flip_x if flip_x<0 else x, y - r*flip_y if flip_y<0 else y,
                x + r if flip_x>0 else x, y + r if flip_y>0 else y]
        try:
            draw.arc([min(bbox[0],bbox[2]), min(bbox[1],bbox[3]), max(bbox[0],bbox[2]), max(bbox[1],bbox[3])],
                      start=0, end=90, fill=color, width=2)
        except Exception:
            pass

def make_placeholder(fname, w, h, label, sub=""):
    img = vgrad(w, h, DARK2, DARK1)
    d = ImageDraw.Draw(img)
    # gold frame border
    margin = int(min(w, h) * 0.045)
    d.rectangle([margin, margin, w - margin, h - margin], outline=GOLD, width=3)
    d.rectangle([margin + 8, margin + 8, w - margin - 8, h - margin - 8], outline=GOLD_LIGHT, width=1)
    # corner flourishes
    for (cx, cy, fx, fy) in [(margin, margin, 1, 1), (w - margin, margin, -1, 1),
                              (margin, h - margin, 1, -1), (w - margin, h - margin, -1, -1)]:
        corner_ornament(d, cx, cy, int(min(w,h)*0.09), fx, fy)
    # center monogram
    fsize = int(min(w, h) * 0.14)
    font = find_font(SERIF_BOLD, fsize)
    text = "A & L"
    bbox = d.textbbox((0, 0), text, font=font)
    tw, th = bbox[2]-bbox[0], bbox[3]-bbox[1]
    d.text(((w - tw) / 2, (h - th) / 2 - h*0.03), text, font=font, fill=GOLD_LIGHT)
    # label
    fsize2 = int(min(w, h) * 0.055)
    font2 = find_font(SERIF, fsize2)
    bbox2 = d.textbbox((0, 0), label, font=font2)
    tw2 = bbox2[2]-bbox2[0]
    d.text(((w - tw2) / 2, h * 0.62), label, font=font2, fill=CREAM)
    if sub:
        fsize3 = int(min(w, h) * 0.035)
        font3 = find_font(SERIF, fsize3)
        bbox3 = d.textbbox((0, 0), sub, font=font3)
        tw3 = bbox3[2]-bbox3[0]
        d.text(((w - tw3) / 2, h * 0.70), sub, font=font3, fill=GOLD)
    img.save(os.path.join(OUT, fname), quality=90)

# Gallery: 16 images
for i in range(1, 17):
    make_placeholder(f"gallery-{i:02d}.jpg", 900, 1125, f"Foto {i:02d}", "Ganti dengan foto asli")

# Cover / hero photo (portrait)
make_placeholder("cover.jpg", 1080, 1440, "Alfa & Lenny", "25 . 10 . 2026")

# Couple portraits
make_placeholder("groom.jpg", 900, 1125, "Alfaber", "Mempelai Pria")
make_placeholder("bride.jpg", 900, 1125, "Lenny", "Mempelai Wanita")

# Opening/loading background
make_placeholder("bg-open.jpg", 1080, 1920, "The Wedding of", "Alfa & Lenny")

# Og/share image
make_placeholder("og-image.jpg", 1200, 630, "Alfa & Lenny", "25 Oktober 2026")

print("done", os.listdir(OUT))
