# Fochus — Agent Guide

## Project structure

Monorepo with two independent Node.js packages:

| Directory | Role | Tech | Dev port |
|-----------|------|------|----------|
| root `./` | Frontend SPA | React 19 + Vite 8 + Tailwind 4 + React Query | `:5173` |
| `backend/` | REST API | Express 5 + Prisma + SQLite | `:3001` |
| Docker Compose | Full stack | nginx → backend | `:3000` → `:3001` |

## Commands

### Frontend (root)
- `npm run dev` — Vite dev server (`:5173`)
- `npm run build` — `vite build` → `dist/`
- `npm run lint` — ESLint on `.ts,.tsx`, max-warnings 150

### Backend
- `npm run dev` — `tsx watch src/index.ts`
- `npm run build` — `tsc` → `dist/`
- `npm run start` — `node dist/index.js`
- `npx prisma db push` — sync schema (used in production Docker entrypoint)
- `npx prisma migrate dev` — dev migration workflow
- `npx prisma generate` — required before build/start

### Root
- `npm run setup` — one-command setup (installs deps, creates DB, generates Prisma)
- `npm start` — runs backend + frontend concurrently

### Self-hosted (Linux)
- `bash install.sh` or `curl -sSL .../install.sh | bash` — one-line setup
- `bash uninstall.sh` — removes container, volume, and image
- Builds and runs single Docker image with SQLite

### Docker Compose
- `docker-compose up -d --build` — full stack at `localhost:3000`
- Copy `.env.example` → `.env` (root) first

## Architecture notes

- Frontend entry: `src/main.tsx` → `App.tsx` (hash-based routing, no react-router)
- Backend entry: `backend/src/index.ts`
- All API endpoints under `/api/*`, token via `Authorization: Bearer <fokus_token>`
- JWT stored in `localStorage` key `fokus_token`
- 401 response auto-clears token and dispatches `auth:logout` event
- i18n: Turkish (`tr`) and English (`en`) via i18next; default reads from `localStorage i18nextLng`
- Background images toggle between `/light.png` and `/dark.png` or user-uploaded custom
- Spotlight feature (global search, triggered by `/` key)
- Sidebar modes: `open` / `hover` / `closed`, persisted in `localStorage sidebarMode`

## Code conventions

- TypeScript strict mode, `noUnusedLocals`, `noUnusedParameters`
- Frontend uses `"moduleResolution": "bundler"` with `@/` path alias → `src/`
- Backend uses `"moduleResolution": "NodeNext"` with explicit `.js` extensions in imports
- Prettier: semicolons, single quotes, no trailing commas, 100 printWidth, 2 spaces
- ESLint ignores `backend/` from root, must be run in `backend/` independently
- Tailwind dark mode via `class` strategy (use `dark:` variants)
- Custom breakpoints: `xxs: 350px`, `xs: 475px`
- Custom color tokens: `primary-{50..900}` (slate-based), `gray-900: rgb(32,32,32)`

## Testing

- **Frontend:** Vitest (`npm test` in root) — tests in `src/**/*.test.ts`
- **Backend:** Vitest (`npm test` in `backend/`) — tests in `backend/src/**/*.test.ts`
- CI runs `npm test` for both frontend and backend

## Prisma

- Single schema: `prisma/schema.prisma` — SQLite for all environments
- Uses `engineType = "library"` with `binaryTargets = ["native"]` for reliable cross-platform engine downloads
- Production Dockerfile runs `npx prisma db push` (not migrate) on container start
- `npx prisma generate` generates the Prisma client

## Deployment

- Release: tag `v*.*.*` → GitHub Actions builds Docker images, pushes to `ghcr.io`, creates release
- Frontend served via nginx, SPA fallback (`try_files $uri /index.html`)
- Dockerfiles are Coolify-compatible

## Important localStorage keys

| Key | Purpose |
|-----|---------|
| `fokus_token` | Auth JWT |
| `activeView` | Last active view (hash routing) |
| `sidebarMode` | `"open"`, `"hover"`, or `"closed"` |
| `theme` | `"light"`, `"dark"`, or `"system"` |
| `bgImage` / `isGlobalBg` | Background image settings |
| `i18nextLng` | Language preference |
| `fokus_onboarding_pending` / `fokus_onboarding_done_{uid}` | Onboarding state |

## Rate limiting

Global: 100 requests per 15 minutes per IP.
