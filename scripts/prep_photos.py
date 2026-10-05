"""Publish the photos listed in scripts/photos.yml to assets/img/keycaps/."""
import os

import yaml
from PIL import Image, ImageOps

SRC, DST = "keyboard_pics", "assets/img/keycaps"
SIZES = {"": 1600, "-sm": 800}

for original, name in yaml.safe_load(open("scripts/photos.yml")).items():
    im = ImageOps.exif_transpose(Image.open(os.path.join(SRC, original))).convert("RGB")
    for suffix, edge in SIZES.items():
        copy = im.copy()
        copy.thumbnail((edge, edge), Image.LANCZOS)
        out = os.path.join(DST, f"{name}{suffix}.jpg")
        # Saving without exif= drops all metadata, GPS included.
        copy.save(out, "JPEG", quality=82, optimize=True, progressive=True)
    print(f"{original} -> {name}")
