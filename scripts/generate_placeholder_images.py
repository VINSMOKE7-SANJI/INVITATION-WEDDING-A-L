import os, random, math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

OUT = "assets/images"
os.makedirs(OUT, exist_ok=True)
random.seed(7)

CREAM = (247, 238, 220)
CREAM_2 = (236, 217, 194)
MAROON = (107, 31, 33)
MAROON_DEEP = (74, 15, 17)
MAROON_MID = (95, 19, 21)
GOLD = (184, 132, 60)
GOLD_LIGHT = (217, 183, 108)
OLIVE = (122, 108, 66)

def find_font(paths, size):
    for p in paths:
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()

SERIF_BOLD = ["/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"]
SERIF = ["/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf"]

def vgrad(w, h, top, bottom):
    img = Image.new("RGB", (w, h), top)
    px = img.load()
    for y in range(h):
        t = y / max(h - 1, 1)
        r = int(top[0] + (bottom[0]-top[0])*t)
        g = int(top[1] + (bottom[1]-top[1])*t)
        b = int(top[2] + (bottom[2]-top[2])*t)
        for x in range(w):
            px[x, y] = (r, g, b)
    return img

def leaf_blob(draw, cx, cy, size, color, n=14):
    ang = random.uniform(0, math.pi*2)
    for i in range(n):
        t = i / n
        a = ang + t * random.uniform(1.2, 2.2)
        dist = size * (0.15 + t*0.85)
        x = cx + math.cos(a) * dist
        y = cy + math.sin(a) * dist
        r = size * (0.22 * (1 - t*0.6)) * random.uniform(0.6, 1.15)
        bbox = [x-r, y-r*1.6, x+r, y+r*1.6]
        draw.ellipse(bbox, fill=color)

def botanical_bg(w, h, fname, corner_scale=1.0):
    img = vgrad(w, h, CREAM, CREAM_2)
    layer = Image.new("RGB", (w, h), CREAM)
    d = ImageDraw.Draw(layer)
    corners = [(0,0),(w,0),(0,h),(w,h)]
    size = min(w,h) * 0.55 * corner_scale
    for (cx, cy) in corners:
        for _ in range(3):
            col = random.choice([MAROON, MAROON, OLIVE])
            leaf_blob(d, cx + random.uniform(-30,30), cy + random.uniform(-30,30),
                      size * random.uniform(0.55, 1.0), col, n=16)
    layer = layer.filter(ImageFilter.GaussianBlur(3))
    img = Image.blend(img, layer, 0.9)
    overlay = Image.new("L", (w, h), 0)
    od = ImageDraw.Draw(overlay)
    od.ellipse([w*0.05, h*0.28, w*0.95, h*0.78], fill=140)
    overlay = overlay.filter(ImageFilter.GaussianBlur(80))
    cream_layer = Image.new("RGB", (w, h), CREAM)
    img = Image.composite(cream_layer, img, overlay)
    img.save(os.path.join(OUT, fname), quality=90)

def dark_placeholder(fname, w, h, label, sub=""):
    img = vgrad(w, h, MAROON_MID, MAROON_DEEP)
    d = ImageDraw.Draw(img)
    margin = int(min(w, h) * 0.045)
    d.rectangle([margin, margin, w-margin, h-margin], outline=GOLD, width=3)
    d.rectangle([margin+8, margin+8, w-margin-8, h-margin-8], outline=GOLD_LIGHT, width=1)
    fsize = int(min(w, h) * 0.14)
    font = find_font(SERIF_BOLD, fsize)
    text = "A & L"
    bbox = d.textbbox((0,0), text, font=font)
    tw, th = bbox[2]-bbox[0], bbox[3]-bbox[1]
    d.text(((w-tw)/2, (h-th)/2 - h*0.03), text, font=font, fill=GOLD_LIGHT)
    fsize2 = int(min(w, h) * 0.055)
    font2 = find_font(SERIF, fsize2)
    bbox2 = d.textbbox((0,0), label, font=font2)
    tw2 = bbox2[2]-bbox2[0]
    d.text(((w-tw2)/2, h*0.62), label, font=font2, fill=CREAM)
    if sub:
        fsize3 = int(min(w, h) * 0.035)
        font3 = find_font(SERIF, fsize3)
        bbox3 = d.textbbox((0,0), sub, font=font3)
        tw3 = bbox3[2]-bbox3[0]
        d.text(((w-tw3)/2, h*0.70), sub, font=font3, fill=GOLD)
    img.save(os.path.join(OUT, fname), quality=90)

def cream_portrait(fname, w, h, label, sub=""):
    img = vgrad(w, h, CREAM, CREAM_2)
    d = ImageDraw.Draw(img)
    margin = int(min(w, h) * 0.05)
    d.ellipse([margin, margin, w-margin, h-margin], outline=MAROON, width=4)
    fsize = int(min(w, h) * 0.13)
    font = find_font(SERIF_BOLD, fsize)
    text = "A & L"
    bbox = d.textbbox((0,0), text, font=font)
    tw, th = bbox[2]-bbox[0], bbox[3]-bbox[1]
    d.text(((w-tw)/2, (h-th)/2 - h*0.05), text, font=font, fill=MAROON)
    fsize2 = int(min(w, h) * 0.05)
    font2 = find_font(SERIF, fsize2)
    bbox2 = d.textbbox((0,0), label, font=font2)
    tw2 = bbox2[2]-bbox2[0]
    d.text(((w-tw2)/2, h*0.60), label, font=font2, fill=MAROON)
    img.save(os.path.join(OUT, fname), quality=90)

botanical_bg(1080, 1920, "bg-open.jpg", corner_scale=1.0)
botanical_bg(1080, 1440, "cover.jpg", corner_scale=0.9)

cream_portrait("groom.jpg", 900, 1125, "Alfaber", "Mempelai Pria")
cream_portrait("bride.jpg", 900, 1125, "Lenny", "Mempelai Wanita")

for i in range(1, 17):
    dark_placeholder(f"gallery-{i:02d}.jpg", 900, 1125, f"Foto {i:02d}", "Ganti dengan foto asli")

dark_placeholder("og-image.jpg", 1200, 630, "Alfa & Lenny", "25 Oktober 2026")

fav = Image.new("RGB", (128,128), MAROON_DEEP)
fd = ImageDraw.Draw(fav)
fd.ellipse([4,4,124,124], outline=GOLD, width=4)
ffont = find_font(SERIF_BOLD, 38)
fd.text((64,64), "A&L", font=ffont, fill=GOLD_LIGHT, anchor="mm")
fav.save(os.path.join(OUT, "favicon.png"))

print("done:", sorted(os.listdir(OUT)))

