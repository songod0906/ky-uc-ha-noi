#!/usr/bin/env python3
"""
process_all_shots.py — process EVERY shot from every sequence into
public/tours/{story}/{slug}/all/shot-NNN.jpg

These are the "reserve" shots available to add in calibration mode.
The current curated sequence stays in public/tours/{story}/{slug}/shot-NN.jpg.
"""

from pathlib import Path
from PIL import Image
import numpy as np, json

TARGET_W, TARGET_H = 4096, 2048
QUALITY = 85
NADIR_FADE_FRAC = 0.12

SEQUENCES = [
    ("ltk",   "truoc-cong-truong",  "Trước cổng trường"),
    ("ltk",   "quan-an-vat",        "đi sang quán ăn vặt đối diện cổng trường"),
    ("ltk",   "duong-den-quan-net", "Từ trường học đi sang quán net"),
    ("ltk",   "trong-quan-net",     "Trong quán net"),
    ("ltk",   "ho-thanh-cong",      "Hồ thành công"),
    ("trang", "playground",         "playground nhà trang"),
    ("trang", "di-hoc-them",        "đi từ playground ra chỗ học thêm"),
    ("trang", "quan-oc-oanh",       "quán ốc oanh"),
    ("essy",  "de-la-thanh",        "Dọc đường đê la thành đã bị giải toả"),
    ("essy",  "duong-vao-nha",      "đường từ ngõ 33 Văn Cao vào nhà Essy"),
    ("essy",  "playground",         "New Folder With Items"),
]

def build_nadir_mask(w, h):
    fade_start = int(h * (1 - NADIR_FADE_FRAC))
    alpha = np.zeros((h, w), dtype=np.uint8)
    for y in range(fade_start, h):
        t = (y - fade_start) / (h - fade_start)
        alpha[y, :] = int(255 * t * t * (3 - 2 * t))
    overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    overlay.putalpha(Image.fromarray(alpha, "L"))
    return overlay

mask = build_nadir_mask(TARGET_W, TARGET_H)

def process_file(src, dst):
    img = Image.open(src).convert("RGB")
    if img.size != (TARGET_W, TARGET_H):
        img = img.resize((TARGET_W, TARGET_H), Image.LANCZOS)
    Image.alpha_composite(img.convert("RGBA"), mask).convert("RGB").save(dst, "JPEG", quality=QUALITY)

base_in  = Path("assets/DJI")
base_out = Path("public/tours")
full_manifest = []
total = 0

for story, slug, folder_name in SEQUENCES:
    src_dir = base_in / folder_name
    jpgs = sorted(f for f in src_dir.iterdir() if f.suffix.upper() in (".JPG", ".JPEG"))
    out_dir = base_out / story / slug / "all"
    out_dir.mkdir(parents=True, exist_ok=True)

    print(f"\n{story}/{slug}/all  ({len(jpgs)} shots)")
    paths = []
    for i, src in enumerate(jpgs, 1):
        dst = out_dir / f"shot-{i:03d}.jpg"
        if not dst.exists():   # skip already-processed
            process_file(src, dst)
            print(f"  [{i:03d}] {src.name}")
        else:
            print(f"  [{i:03d}] skip (exists)")
        paths.append(f"/tours/{story}/{slug}/all/shot-{i:03d}.jpg")
        total += 1

    full_manifest.append({"story": story, "slug": slug, "allShots": paths})

manifest_path = base_out / "full_manifest.json"
with open(manifest_path, "w") as f:
    json.dump(full_manifest, f, indent=2, ensure_ascii=False)

print(f"\n{'='*50}")
print(f"Done — {total} total shots in all/ subfolders")
print(f"Full manifest → public/tours/full_manifest.json")
