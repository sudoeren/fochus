#!/bin/sh
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

if [ -f "$SCRIPT_DIR/fochus.pid" ]; then
  PID=$(cat "$SCRIPT_DIR/fochus.pid")
  kill $PID 2>/dev/null && echo "Fochus stopped." || echo "Fochus is not running."
  rm -f "$SCRIPT_DIR/fochus.pid"
else
  echo "No PID file found. Try: pkill -f 'node dist/index.js'"
fi
