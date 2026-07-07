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

# Sync database schema (use local Prisma)
./node_modules/.bin/prisma db push --skip-generate 2>/dev/null || ./node_modules/.bin/prisma db push

# Start server in background
export PORT=5800
nohup node --env-file="$SCRIPT_DIR/backend/.env" dist/index.js > "$SCRIPT_DIR/fochus.log" 2>&1 &
echo $! > "$SCRIPT_DIR/fochus.pid"

echo ""
echo "  Fochus is running at http://localhost:5800"
echo ""
echo "  To stop: run ./stop.sh or kill \$(cat $SCRIPT_DIR/fochus.pid)"
echo ""
