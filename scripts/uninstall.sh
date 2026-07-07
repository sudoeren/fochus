#!/bin/sh
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Removing Fochus data..."
rm -rf "$SCRIPT_DIR/data"

echo "Removing Fochus..."
rm -rf "$SCRIPT_DIR"

echo "Done."
