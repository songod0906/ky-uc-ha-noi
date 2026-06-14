#!/usr/bin/env python3
"""
batch_process.py — select every 3rd shot from each sequence folder,
resize to 4096×2048, patch nadir, output to public/tours/{story}/{slug}/
"""

import sys, os
from pathlib import Path
from PIL import Image
import numpy as np

TARGET_W, TARGET_H = 4096, 2048
QUALITY = 85
NADIR_FADE_FRAC = 0.12

SEQUENCES = [
    # (story, slug, input_folder_name)
    ("ltk",   "truoc-cong-truong",    "Trước cổng trường"),
    ("ltk",   "quan-an-vat",          "đi sang quán ăn vặt đối diện cổng trường"),
    ("ltk",   "duong-den-quan-net",   "Từ trường học đi sang quán net"),
    ("ltk",   "trong-quan-net",       "Trong quán net"),
    ("ltk",   "ho-thanh-cong",        "Hồ thành công"),
    ("trang", "playground",           "playground nhà trang"),
    ("trang", "di-hoc-them",          "đi từ playground ra chỗ học thêm"),
    ("trang", "quan-oc-oanh",         "quán ốc oanh"),
    ("essy",  "de-la-thanh",          "Dọc đường đê la thành đã bị giải toả"),
    ("essy",  "duong-vao-nha",        "đường từ ngõ 33 Văn Cao vào nhà Essy"),
    ("essy",  "playground",           "New Folder With Items"),
]

def build_nadir_mask(w, h):
    fade_start = int(h * (1 - NADIR_FADE_FRAC))
    fade_rows = h - fade_start
    alpha = np.zeros((h, w), dtype=np.uint8)
    for y in range(fade_start, h):
        t = (y - fade_start) / fade_rows
        t_smooth = t * t * (3 - 2 * t)
        alpha[y, :] = int(255 * t_smooth)
    mask = Image.fromarray(alpha, mode="L")
    overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    overlay.putalpha(mask)
    return overlay

_mask_cache = None
def get_mask():
    global _mask_cache
    if _mask_cache is None:
        _mask_cache = build_nadir_mask(TARGET_W, TARGET_H)
    return _mask_cache

def process_file(src, dst):
    img = Image.open(src).convert("RGB")
    if img.size != (TARGET_W, TARGET_H):
        img = img.resize((TARGET_W, TARGET_H), Image.LANCZOS)
    result = Image.alpha_composite(img.convert("RGBA"), get_mask()).convert("RGB")
    result.save(dst, "JPEG", quality=QUALITY)

def main():
    base_in  = Path("/Users/sonhoangnguyen/Downloads/Digi Huma/FInal project/assets/DJI")
    base_out = Path("/Users/sonhoangnguyen/Downloads/Digi Huma/FInal project/public/tours")

    total_in = total_out = 0
    manifest = []

    for story, slug, folder_name in SEQUENCES:
        src_dir = base_in / folder_name
        jpgs = sorted([f for f in src_dir.iterdir() if f.suffix.upper() in (".JPG", ".JPEG")])
        if not jpgs:
            print(f"  [SKIP] no JPGs in {folder_name}")
            continue

        # every 3rd shot (indices 0, 3, 6, ...)
        selected = jpgs[::3]

        out_dir = base_out / story / slug
        out_dir.mkdir(parents=True, exist_ok=True)

        print(f"\n{story}/{slug}  ({len(jpgs)} → {len(selected)} shots)")
        shot_paths = []
        for i, src in enumerate(selected, 1):
            dst = out_dir / f"shot-{i:02d}.jpg"
            process_file(src, dst)
            rel = f"/tours/{story}/{slug}/shot-{i:02d}.jpg"
            shot_paths.append(rel)
            print(f"  [{i:02d}] {src.name}")

        manifest.append({"story": story, "slug": slug, "shots": shot_paths})
        total_in  += len(jpgs)
        total_out += len(selected)

    # Write a JSON manifest so stories.ts wiring is easy
    import json
    manifest_path = base_out / "manifest.json"
    with open(manifest_path, "w") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)

    print(f"\n{'='*50}")
    print(f"Done: {total_out} shots processed (from {total_in} total)")
    print(f"Manifest written to public/tours/manifest.json")

if __name__ == "__main__":
    main()
