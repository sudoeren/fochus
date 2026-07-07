#!/usr/bin/env bash
set -e

CONTAINER="fochus"
IMAGE="fochus"
VOLUME="fochus_data"

RED='\033[0;31m'; GREEN='\033[0;32m'; CYAN='\033[0;36m'; YELLOW='\033[1;33m'; NC='\033[0m'
info()  { echo -e "${CYAN}→${NC} $1"; }
ok()    { echo -e "${GREEN}✓${NC} $1"; }
warn()  { echo -e "${YELLOW}⚠${NC} $1"; }

# ── Confirm ────────────────────────────────────
echo -e "${YELLOW}This will remove Fochus and all its data.${NC}"
echo ""

# Check if Docker is available and has fochus resources
HAS_DOCKER=false
if command -v docker >/dev/null 2>&1; then
  if docker ps -a --format '{{.Names}}' 2>/dev/null | grep -q "^$CONTAINER$"; then
    HAS_DOCKER=true
  fi
fi

# Check if running from a portable installation
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
IS_PORTABLE=false
if [ -f "$SCRIPT_DIR/start.sh" ] && [ -d "$SCRIPT_DIR/backend" ]; then
  IS_PORTABLE=true
fi

if [ "$HAS_DOCKER" = false ] && [ "$IS_PORTABLE" = false ]; then
  echo "No Fochus installation found."
  echo "If you installed it manually, simply delete the fochus directory."
  exit 0
fi

if [ "$1" != "-y" ] && [ "$1" != "--yes" ]; then
  read -rp "Continue? [y/N] " confirm
  if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    echo "Aborted."
    exit 0
  fi
fi

# ── Remove Docker container ────────────────────
if [ "$HAS_DOCKER" = true ]; then
  info "Stopping container..."
  docker stop "$CONTAINER" >/dev/null 2>&1 || true
  info "Removing container..."
  docker rm "$CONTAINER" >/dev/null 2>&1 || true
  ok "Container removed"
fi

# ── Remove Docker volume ───────────────────────
if docker volume ls --format '{{.Name}}' 2>/dev/null | grep -q "^$VOLUME$"; then
  info "Removing volume ($VOLUME)..."
  docker volume rm "$VOLUME" >/dev/null 2>&1 || true
  ok "Volume removed"
fi

# ── Remove Docker image ────────────────────────
if docker image ls --format '{{.Repository}}' 2>/dev/null | grep -q "^$IMAGE$"; then
  info "Removing image..."
  docker rmi "$IMAGE" >/dev/null 2>&1 || warn "Image in use by other containers, skipping"
  ok "Image removed"
fi

# ── Firewall ───────────────────────────────────
if command -v ufw >/dev/null 2>&1; then
  if ufw status | grep -q "5800.*ALLOW"; then
    info "Closing port 5800 in firewall..."
    ufw delete allow 5800/tcp >/dev/null 2>&1 || true
  fi
fi

# ── Portable installation ──────────────────────
if [ "$IS_PORTABLE" = true ]; then
  echo ""
  info "Portable installation detected at: $SCRIPT_DIR"
  echo "  You can delete this directory manually to complete removal:"
  echo "    rm -rf \"$SCRIPT_DIR\""
fi

echo ""
echo -e "${GREEN}✓ Fochus has been removed.${NC}"
echo ""
