# Backend Dockerfile for Fokus API
# Coolify compatible

FROM node:20-alpine AS base

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# Build stage
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build TypeScript
RUN npm run build

# Production stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 fokus

# Copy necessary files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

# Set ownership
RUN chown -R fokus:nodejs /app

USER fokus

EXPOSE 3001

ENV PORT=3001

# Apply migrations if present; fall back safely for DBs bootstrapped via db push
CMD ["sh", "-c", "set -e; if [ -d prisma/migrations ] && [ \"$(ls -A prisma/migrations 2>/dev/null)\" ]; then if npx prisma migrate deploy; then :; else echo 'migrate deploy failed; attempting baseline (db push + migrate resolve)'; npx prisma db push; LATEST=\"$(ls -1d prisma/migrations/*/ 2>/dev/null | sed 's#.*/##' | sed 's#/$##' | sort | tail -n 1)\"; if [ -n \"$LATEST\" ]; then npx prisma migrate resolve --applied \"$LATEST\" || true; fi; npx prisma migrate deploy; fi; else npx prisma db push; fi; node dist/index.js"]
