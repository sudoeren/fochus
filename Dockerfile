# Frontend Dockerfile for Fokus App
# Coolify compatible - Multi-stage build with nginx

FROM node:26-alpine AS base

# Dependencies stage
FROM base AS deps
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Build stage
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build arguments
ARG VITE_API_URL=/api
ARG VITE_GOOGLE_CLIENT_ID
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

RUN npm run build

# Production stage with nginx
FROM nginx:alpine AS runner

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1/health || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
