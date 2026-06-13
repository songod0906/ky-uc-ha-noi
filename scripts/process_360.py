#!/usr/bin/env python3
"""
process_360.py — resize DJI 360 photos and patch the nadir.

Usage:
  python3 scripts/process_360.py <input_folder> <output_folder>

  Input:  folder of raw DJI JPGs (any resolution)
  Output: 4096×2048 equirectangular JPGs with nadir gradient applied

Example:
  python3 scripts/process_360.py assets/DJI public/tours/essy
  python3 scripts/process_360.py assets/DJI public/tours/ltk
  python3 scripts/process_360.py assets/DJI public/tours/trang
"""

import sys
import os
from pathlib import Path
from PIL import Image, ImageFilter
import numpy as np

TARGET_W, TARGET_H = 4096, 2048
QUALITY = 85

# How much of the image height to fade from the bottom (nadir cap)
# 0.12 = bottom 12% of image (~245px at 2048h) — covers a DJI Osmo ball
NADIR_FADE_FRAC = 0.12


def build_nadir_mask(w: int, h: int) -> Image.Image:
    """
    Returns an RGBA mask: fully transparent at top, fades to black at the nadir.
    The fade starts at (1 - NADIR_FADE_FRAC) * h and is fully black at h.
    """
    fade_start = int(h * (1 - NADIR_FADE_FRAC))
    fade_rows = h - fade_start

    alpha = np.zeros((h, w), dtype=np.uint8)
    for y in range(fade_start, h):
        t = (y - fade_start) / fade_rows          # 0 → 1 as we approach nadir
        # Use a smooth curve so the transition isn't harsh
        t_smooth = t * t * (3 - 2 * t)            # smoothstep
        alpha[y, :] = int(255 * t_smooth)

    mask = Image.fromarray(alpha, mode="L")
    black_overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    black_overlay.putalpha(mask)
    return black_overlay


def process(src: Path, dst: Path) -> None:
    img = Image.open(src).convert("RGB")

    if img.size != (TARGET_W, TARGET_H):
        img = img.resize((TARGET_W, TARGET_H), Image.LANCZOS)

    # Composite nadir patch over resized image
    base = img.convert("RGBA")
    overlay = build_nadir_mask(TARGET_W, TARGET_H)
    composited = Image.alpha_composite(base, overlay).convert("RGB")

    composited.save(dst, "JPEG", quality=QUALITY)
    print(f"  {src.name} → {dst.name}")


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)

    in_dir = Path(sys.argv[1])
    out_dir = Path(sys.argv[2])
    out_dir.mkdir(parents=True, exist_ok=True)

    jpgs = sorted([f for f in in_dir.iterdir() if f.suffix.upper() in (".JPG", ".JPEG")])
    if not jpgs:
        print(f"No JPG files found in {in_dir}")
        sys.exit(1)

    print(f"Processing {len(jpgs)} files → {out_dir}/")
    for i, src in enumerate(jpgs, 1):
        dst = out_dir / f"shot-{i:02d}.jpg"
        process(src, dst)

    print(f"\nDone — {len(jpgs)} shots written to {out_dir}/")


if __name__ == "__main__":
    main()
