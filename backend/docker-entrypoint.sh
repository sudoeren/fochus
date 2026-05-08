#!/bin/sh
set -e

# Auto-generate JWT_SECRET if not set or still the placeholder
if [ -z "$JWT_SECRET" ] || [ "$JWT_SECRET" = "your-super-secret-jwt-key" ] || [ "$JWT_SECRET" = "your-super-secret-jwt-key-change-in-production" ] || [ "$JWT_SECRET" = "your-super-secret-jwt-key-change-in-production-please" ]; then
  JWT_SECRET=$(openssl rand -base64 48)
  export JWT_SECRET
  echo "🔑 Auto-generated JWT_SECRET"
fi

# Ensure the data directory exists for SQLite
DB_PATH="${DATABASE_URL#file:}"
DB_DIR=$(dirname "$DB_PATH")
if [ "$DB_DIR" != "." ]; then
  mkdir -p "$DB_DIR"
fi

echo "📦 Running prisma db push..."
npx prisma db push

echo "🚀 Starting Fokus API..."
exec node dist/index.js
