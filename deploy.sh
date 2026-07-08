#!/usr/bin/env bash
set -euo pipefail

rm -rf dist
mkdir -p dist

# Copy only website assets from repo root into dist.
# No rsync required. Excludes node_modules automatically.
find . -maxdepth 1 -type f \( \
  -name "*.html" -o \
  -name "*.css" -o \
  -name "*.js" -o \
  -name "*.png" -o \
  -name "*.jpg" -o \
  -name "*.jpeg" -o \
  -name "*.webp" -o \
  -name "*.svg" -o \
  -name "*.ico" -o \
  -name "CNAME" \
\) -exec cp -f {} dist/ \;

cat > wrangler.jsonc <<'JSON'
{
  "name": "501elite-production",
  "compatibility_date": "2026-07-08",
  "assets": {
    "directory": "dist"
  },
  "observability": {
    "enabled": true
  },
  "compatibility_flags": [
    "nodejs_compat"
  ]
}
JSON

npx wrangler deploy --config wrangler.jsonc
