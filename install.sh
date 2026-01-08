#!/usr/bin/env bash

set -e

BINARY_NAME="noodle"
SRC_BINARY="./dist/noodle-linux"
SRC_GRAMMARS="./dist/noodle.ohm ./dist/bowls.ohm"
DEST="/usr/local/bin/$BINARY_NAME"

echo "Installing $BINARY_NAME..."

sudo cp "$SRC_BINARY" "$DEST"
sudo chmod +x "$DEST"

# Copy grammars to same folder as binary
for f in $SRC_GRAMMARS; do
  sudo cp "$f" "/usr/local/bin/"
done

echo "Installation complete! Binary and grammars are ready."
