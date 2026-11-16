#!/usr/bin/env bash
# Turns guides-src/*.html into PDFs in assets/guides/ using headless Chrome.
# Usage (Git Bash on Windows): bash tools/make-guides.sh
set -e
cd "$(dirname "$0")/.."
CHROME="${CHROME:-/c/Program Files/Google/Chrome/Application/chrome.exe}"
mkdir -p assets/guides
for f in guides-src/*.html; do
  name=$(basename "$f" .html)
  "$CHROME" --headless=new --disable-gpu --no-pdf-header-footer \
    --print-to-pdf="$(pwd -W 2>/dev/null || pwd)/assets/guides/$name.pdf" \
    "file:///$(pwd -W 2>/dev/null || pwd)/$f" 2>/dev/null
  echo "wrote assets/guides/$name.pdf"
done
