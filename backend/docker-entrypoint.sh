#!/bin/sh
set -e

# Auto-generate JWT_SECRET if not set or still the placeholder
if [ -z "$JWT_SECRET" ] || [ "$JWT_SECRET" = "your-super-secret-jwt-key" ] || [ "$JWT_SECRET" = "your-super-secret-jwt-key-change-in-production" ] || [ "$JWT_SECRET" = "your-super-secret-jwt-key-change-in-production-please" ]; then
  JWT_SECRET=$(openssl rand -base64 48)
  export JWT_SECRET
  echo "🔑 Auto-generated JWT_SECRET"
fi

# Detect database type and pick the right Prisma schema
case "$DATABASE_URL" in
  postgresql://*|postgres://*)
    SCHEMA="prisma/schema.prisma"
    ;;
  *)
    SCHEMA="prisma/schema.sqlite.prisma"
    # Ensure the data directory exists for SQLite
    DB_PATH="${DATABASE_URL#file:}"
    DB_DIR=$(dirname "$DB_PATH")
    if [ "$DB_DIR" != "." ]; then
      mkdir -p "$DB_DIR"
    fi
    ;;
esac

echo "📦 Running prisma db push ($SCHEMA)..."
npx prisma db push --schema="$SCHEMA"

echo "🚀 Starting Fokus API..."
exec node dist/index.js
