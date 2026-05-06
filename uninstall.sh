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
if [ "$1" != "-y" ] && [ "$1" != "--yes" ]; then
  echo -e "${YELLOW}This will remove Fochus and all its data.${NC}"
  read -rp "Continue? [y/N] " confirm
  if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    echo "Aborted."
    exit 0
  fi
fi

# ── Stop & remove container ────────────────────
if docker ps -a --format '{{.Names}}' | grep -q "^$CONTAINER$"; then
  info "Stopping container..."
  docker stop "$CONTAINER" >/dev/null 2>&1
  info "Removing container..."
  docker rm "$CONTAINER" >/dev/null 2>&1
  ok "Container removed"
else
  info "No running container found"
fi

# ── Remove volume ──────────────────────────────
if docker volume ls --format '{{.Name}}' | grep -q "^$VOLUME$"; then
  info "Removing volume ($VOLUME)..."
  docker volume rm "$VOLUME" >/dev/null 2>&1
  ok "Volume removed"
fi

# ── Remove image ───────────────────────────────
if docker image ls --format '{{.Repository}}' | grep -q "^$IMAGE$"; then
  info "Removing image..."
  docker rmi "$IMAGE" >/dev/null 2>&1 || warn "Image in use by other containers, skipping"
  ok "Image removed"
fi

# ── Firewall ───────────────────────────────────
if command -v ufw >/dev/null 2>&1; then
  if ufw status | grep -q "3000.*ALLOW"; then
    info "Closing port 3000 in firewall..."
    ufw delete allow 3000/tcp >/dev/null 2>&1 || true
  fi
fi

echo ""
echo -e "${GREEN}✓ Fochus has been removed.${NC}"
echo ""
