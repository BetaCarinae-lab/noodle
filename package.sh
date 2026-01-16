#!/usr/bin/env bash

set -e

npm run build

LINUX_PKG_DIR="./zipped/noodle1.0.0-linux"
MACOS_PKG_DIR="./zipped/noodle1.0.0-macos"

mkdir -v "$LINUX_PKG_DIR"
mkdir -v "$MACOS_PKG_DIR"
echo "Made folders"


sudo cp "./install.sh" "$LINUX_PKG_DIR"
sudo cp "./install.sh" "$MACOS_PKG_DIR"
echo "Copied install.sh"

sudo cp "./uninstall.sh" "$LINUX_PKG_DIR"
sudo cp "./uninstall.sh" "$MACOS_PKG_DIR"
echo "Copied uninstall.sh"

sudo cp "./dist/noodle-linux" "$LINUX_PKG_DIR"
sudo cp "./dist/noodle-macos" "$MACOS_PKG_DIR"
echo "Copied executable"

sudo cp "./grammar/bowls.ohm" "$LINUX_PKG_DIR"
sudo cp "./grammar/bowls.ohm" "$MACOS_PKG_DIR"
sudo cp "./grammar/noodle.ohm" "$LINUX_PKG_DIR"
sudo cp "./grammar/noodle.ohm" "$MACOS_PKG_DIR"
echo "Copied Grammars"

zip -r "noodle1.0.0-linux.zip" "$LINUX_PKG_DIR"
zip -r "noodle1.0.0-macos.zip" "$MACOS_PKG_DIR"

sudo mv "./noodle1.0.0-linux.zip" "./zipped/noodle1.0.0-linux.zip"
sudo mv "./noodle1.0.0-macos.zip" "./zipped/noodle1.0.0-macos.zip"

sudo rm -r "$LINUX_PKG_DIR"
sudo rm -r "$MACOS_PKG_DIR"

echo "Done"