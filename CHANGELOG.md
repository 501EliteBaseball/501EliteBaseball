# Patch 001C — Sponsor Card Path Fix

## Changed
- Updated `sponsors.html` image paths from `images/sponsors/...` to root-level sponsor assets.

## Why
- GitHub mobile upload placed sponsor image files in the repo root, not in nested folders.
- This patch fixes the broken image icons without requiring folder uploads.

## Upload Instructions
- Upload only `sponsors.html` to the GitHub repo root and overwrite the existing file.
- The sponsor image files already in the root should then load correctly.
