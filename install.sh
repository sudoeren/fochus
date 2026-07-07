#!/usr/bin/env bash
set -e

REPO="https://github.com/sudoeren/fochus.git"
CONTAINER="fochus"
IMAGE="fochus"
PORT=5800
VOLUME="fochus_data"

# Colors
RED='\033[0;31m'; GREEN='\033[0;32m'; CYAN='\033[0;36m'; NC='\033[0m'
info()  { echo -e "${CYAN}→${NC} $1"; }
ok()    { echo -e "${GREEN}✓${NC} $1"; }
err()   { echo -e "${RED}✗${NC} $1"; exit 1; }

# ── Check prerequisites ────────────────────────
info "Checking prerequisites..."

command -v git  >/dev/null 2>&1 || err "Git is required: apt install git"
command -v docker >/dev/null 2>&1 || err "Docker is required: https://docs.docker.com/engine/install/"

# Docker daemon running?
docker info >/dev/null 2>&1 || err "Docker daemon is not running"

ok "Prerequisites met"

# ── Clone ──────────────────────────────────────
TEMP_DIR=$(mktemp -d)
trap 'rm -rf "$TEMP_DIR"' EXIT

info "Downloading Fochus..."
git clone --depth=1 "$REPO" "$TEMP_DIR" 2>/dev/null || err "Failed to clone repository"
ok "Downloaded"

# ── Build ──────────────────────────────────────
info "Building Docker image (this may take a few minutes)..."
(cd "$TEMP_DIR" && docker build -f Dockerfile.selfhost -t "$IMAGE" .) >/dev/null 2>&1 || err "Build failed"
ok "Image built"

# ── Run ────────────────────────────────────────
info "Starting container..."

docker stop "$CONTAINER" >/dev/null 2>&1 && docker rm "$CONTAINER" >/dev/null 2>&1 || true
docker run -d \
  --name "$CONTAINER" \
  --restart unless-stopped \
  -p "$PORT:5800" \
  -v "$VOLUME:/app/data" \
  "$IMAGE" >/dev/null || err "Failed to start container"

ok "Container started"

# ── Firewall ───────────────────────────────────
if command -v ufw >/dev/null 2>&1; then
  if ! ufw status | grep -q "$PORT.*ALLOW"; then
    info "Opening port $PORT in firewall..."
    ufw allow "$PORT/tcp" >/dev/null 2>&1 || true
  fi
fi

# ── Done ───────────────────────────────────────
IP=$(curl -s ifconfig.me 2>/dev/null || hostname -I 2>/dev/null | awk '{print $1}' || echo "localhost")

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║           Fochus is running!                    ║${NC}"
echo -e "${GREEN}╠══════════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║${NC}  Local:    http://localhost:$PORT               "
echo -e "${GREEN}║${NC}  Network:  http://$IP:$PORT              "
echo -e "${GREEN}║${NC}                                              "
echo -e "${GREEN}║${NC}  To stop:  docker stop fochus                 "
echo -e "${GREEN}║${NC}  To uninstall:  bash uninstall.sh             "
echo -e "${GREEN}╚══════════════════════════════════════════════════╝${NC}"
echo ""
