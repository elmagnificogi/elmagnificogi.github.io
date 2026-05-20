#!/usr/bin/env bash
# Local build: Jekyll + Pagefind full-text search index
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

echo "==> jekyll build"
jekyll build

echo "==> pagefind index"
if [[ -f package-lock.json ]]; then
  npm ci
else
  npm install
fi
npx pagefind

echo "==> done. Preview: npx pagefind --site _site --serve"
