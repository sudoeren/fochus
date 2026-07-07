#!/bin/sh
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Prefer bundled Node.js if available
if [ -x "$SCRIPT_DIR/node/bin/node" ]; then
  export PATH="$SCRIPT_DIR/node/bin:$PATH"
fi

# Create .env with defaults if missing
if [ ! -f "$SCRIPT_DIR/backend/.env" ]; then
  mkdir -p "$SCRIPT_DIR/data"
  {
    echo "DATABASE_URL=\"file:$SCRIPT_DIR/data/fochus.db\""
    echo "JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")"
    echo "NODE_ENV=production"
  } > "$SCRIPT_DIR/backend/.env"
fi

cd "$SCRIPT_DIR/backend"

# Sync database schema (use local Prisma, not npx to avoid pulling latest)
./node_modules/.bin/prisma db push --skip-generate 2>/dev/null || ./node_modules/.bin/prisma db push

echo ""
echo ""
echo "  Fochus is starting at http://localhost:5800"
echo "Press Ctrl+C to stop."
echo ""

export PORT=5800
node --env-file="$SCRIPT_DIR/backend/.env" dist/index.js &
PID=$!
echo "  Fochus is running at http://localhost:5800"
echo "  Press Ctrl+C to stop."
wait $PID
