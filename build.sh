#!/usr/bin/env bash
set -euo pipefail

echo "====================================="
echo " Building language + modified Ohm-JS "
echo "====================================="

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
OHM_DIR="$ROOT_DIR/src/ohm"

echo
echo "→ Building OhmJS"

if [ -d "$OHM_DIR/node_modules" ]; then
  echo "Ohm has node_modules"
else
  cd "$OHM_DIR"
  npm install
  echo "-> installed ohm dependencies"
fi


cd "$OHM_DIR"
npm run build
cd "$ROOT_DIR"
sudo mv "$OHM_DIR/dist/ohm.min.js" "$ROOT_DIR/js/ohm.js"

echo
echo "→ Installing root dependencies"
npm install

echo
echo "→ Building TypeScript → JavaScript"
npm run build

echo
echo "→ Verifying Ohm-JS output"
if [ ! -d "$ROOT_DIR/js/ohm" ]; then
  echo "ERROR: Ohm-JS JS output not found in ./js/ohm"
  exit 1
fi

echo
echo "→ Bundling executable"
npm run bundle

echo
echo "====================================="
echo " Build complete ✅"
echo "====================================="
