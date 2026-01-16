#!/usr/bin/env bash

set -e

BINARY_NAME="noodle"

# Resolve script directory (works on Linux & macOS)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Detect OS
OS="$(uname -s | tr '[:upper:]' '[:lower:]')"
ARCH="$(uname -m)"

case "$OS" in
  linux)
    OS_NAME="linux"
    ;;
  darwin)
    OS_NAME="darwin"
    ;;
  *)
    echo "Unsupported OS: $OS"
    exit 1
    ;;
esac

# Source binary path
SRC_BINARY="$SCRIPT_DIR/dist/${BINARY_NAME}-${OS_NAME}"

# Grammar files
SRC_GRAMMARS=(
  "$SCRIPT_DIR/grammar/noodle.ohm"
  "$SCRIPT_DIR/grammar/bowls.ohm"
)

DEST_DIR="/usr/local/bin"
DEST_BINARY="$DEST_DIR/$BINARY_NAME"

echo "Installing $BINARY_NAME for $OS_NAME ($ARCH_NAME)..."

# Validate binary exists
if [[ ! -f "$SRC_BINARY" ]]; then
  echo "Error: binary not found at $SRC_BINARY"
  exit 1
fi

# Ensure destination exists
sudo mkdir -p "$DEST_DIR"

# Install binary
sudo cp "$SRC_BINARY" "$DEST_BINARY"
sudo chmod +x "$DEST_BINARY"

# Install grammars alongside the binary
for f in "${SRC_GRAMMARS[@]}"; do
  sudo cp "$f" "$DEST_DIR/"
done

echo "Installation complete."
echo "Run 'noodle --help' to get started."
