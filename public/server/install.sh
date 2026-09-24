#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════
# Strata Server — Installer
# ═══════════════════════════════════════════════════════════════════
#
# Install:   curl -fsSL https://strata.do/server/install.sh | bash
# Upgrade:   re-run the same command
#
# The Strata image is self-contained: it bundles PostgreSQL, generates its
# own secrets on first boot, and persists everything to the strata_data
# volume. This script is the documented `docker run` with a health check
# around it, nothing more:
#
#   docker run -d -p 8080:80 -v strata_data:/data --name strata \
#     ghcr.io/stratasite/server:latest
#
# Options (environment variables):
#   PORT             Host port for the web UI (default: 8080)
#   STRATA_VERSION   Image tag to run (default: latest)
#   STRATA_NAME      Container name (default: strata)
#
# For an external PostgreSQL, SSL, or multi-container deployments, see the
# production guide: https://strata.do/developer-docs/self-hosting
# ═══════════════════════════════════════════════════════════════════

set -euo pipefail

IMAGE="ghcr.io/stratasite/server"
MIN_DOCKER_VERSION="24"
NAME="${STRATA_NAME:-strata}"
VOLUME="strata_data"
TAG="${STRATA_VERSION:-latest}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
DIM='\033[2m'
RESET='\033[0m'

info()    { echo -e "${BLUE}[strata]${RESET} $*"; }
success() { echo -e "${GREEN}[strata]${RESET} $*"; }
warn()    { echo -e "${YELLOW}[strata]${RESET} $*"; }
fail()    { echo -e "${RED}[strata]${RESET} $*"; exit 1; }

# ── Banner ────────────────────────────────────────────────────────

echo ""
echo -e "${BOLD}"
echo "  ███████╗████████╗██████╗  █████╗ ████████╗ █████╗ "
echo "  ██╔════╝╚══██╔══╝██╔══██╗██╔══██╗╚══██╔══╝██╔══██╗"
echo "  ███████╗   ██║   ██████╔╝███████║   ██║   ███████║"
echo "  ╚════██║   ██║   ██╔══██╗██╔══██║   ██║   ██╔══██║"
echo "  ███████║   ██║   ██║  ██║██║  ██║   ██║   ██║  ██║"
echo "  ╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝"
echo -e "${RESET}"
echo -e "  ${DIM}Server Installer${RESET}"
echo ""

# ── Docker ────────────────────────────────────────────────────────

info "Checking Docker..."

if ! command -v docker &>/dev/null; then
  echo -e "${RED}[strata]${RESET} Docker is not installed."
  echo -e "  Install it from ${BOLD}https://docs.docker.com/get-docker/${RESET} and re-run this script."
  exit 1
fi

# The daemon has to be reachable before a version check means anything. A
# stopped Docker Desktop or a user outside the docker group both make
# `docker version` fail, which must not be reported as "too old".
if ! docker_err=$(docker info 2>&1 >/dev/null); then
  if echo "$docker_err" | grep -qi "permission denied"; then
    echo -e "${RED}[strata]${RESET} Docker is installed but this user cannot talk to it. Re-run with sudo:"
    echo -e "    ${BOLD}curl -fsSL https://strata.do/server/install.sh | sudo bash${RESET}"
  else
    echo -e "${RED}[strata]${RESET} Docker is installed but not running."
    echo -e "  Start Docker Desktop (or ${BOLD}sudo systemctl start docker${RESET} on Linux) and re-run this script."
  fi
  exit 1
fi

docker_version=$(docker version --format '{{.Server.Version}}' 2>/dev/null | tr -d '[:space:]' || true)
[ -n "$docker_version" ] || docker_version=$(docker version --format '{{.Client.Version}}' 2>/dev/null | tr -d '[:space:]' || true)
docker_major=$(echo "$docker_version" | cut -d. -f1)

if ! [[ "$docker_major" =~ ^[0-9]+$ ]]; then
  warn "Could not read the Docker version (got '${docker_version:-nothing}'). Continuing; Strata requires Docker $MIN_DOCKER_VERSION+."
elif [ "$docker_major" -lt "$MIN_DOCKER_VERSION" ]; then
  echo -e "${RED}[strata]${RESET} Docker $docker_version is too old. Strata requires Docker $MIN_DOCKER_VERSION+."
  echo -e "  Upgrade at ${BOLD}https://docs.docker.com/get-docker/${RESET}"
  exit 1
else
  success "Docker $docker_version"
fi

# ── Existing install? ─────────────────────────────────────────────
# A container with our name means this is an upgrade: keep its port, replace
# the container, keep the volume (and therefore the data).

is_upgrade=false
existing_port=""
if docker container inspect "$NAME" &>/dev/null; then
  is_upgrade=true
  existing_port=$(docker container inspect "$NAME" \
    --format '{{range $p, $conf := .HostConfig.PortBindings}}{{(index $conf 0).HostPort}}{{end}}' 2>/dev/null | head -1 || true)
  info "Found an existing '$NAME' container. This will upgrade it in place; your data is kept."
fi

# ── Port ──────────────────────────────────────────────────────────
# Prompt only when there is a terminal to prompt on. `curl | bash` keeps the
# terminal on /dev/tty even though stdin is the pipe.

port="${PORT:-${existing_port:-8080}}"
if [ -z "${PORT:-}" ] && [ -r /dev/tty ]; then
  echo ""
  echo -e "  ${BOLD}Port for the Strata web UI${RESET} ${DIM}[${port}]${RESET}"
  read -r -p "  > " answer < /dev/tty || answer=""
  port="${answer:-$port}"
fi
[[ "$port" =~ ^[0-9]+$ ]] || fail "Port must be a number, got '$port'."

# ── Pull ──────────────────────────────────────────────────────────

echo ""
info "Pulling $IMAGE:$TAG..."
docker pull "$IMAGE:$TAG" || fail "Failed to pull the image. Check your network and try again."
success "Image ready"

# ── Run ───────────────────────────────────────────────────────────

echo ""
if [ "$is_upgrade" = true ]; then
  info "Replacing the running container..."
  docker rm -f "$NAME" >/dev/null
else
  info "Starting Strata..."
fi

docker run -d \
  -p "${port}:80" \
  -v "${VOLUME}:/data" \
  --name "$NAME" \
  --restart unless-stopped \
  "$IMAGE:$TAG" >/dev/null || fail "Failed to start the container. Is port $port free? Set PORT=<other> and re-run."

# ── Health check ──────────────────────────────────────────────────
# First boot prepares the bundled database, which can take a minute.

health_url="http://localhost:${port}/up"
if ! command -v curl &>/dev/null; then
  warn "curl is not installed, so this script cannot wait for the health check."
  echo -e "  Give it a minute, then open ${BOLD}http://localhost:${port}${RESET}"
  exit 0
fi
info "Waiting for Strata to be ready (first boot can take up to a minute)..."

healthy=false
for _ in $(seq 1 60); do
  state=$(docker container inspect "$NAME" --format '{{.State.Status}}' 2>/dev/null || echo "")
  if [ "$state" = "exited" ] || [ "$state" = "dead" ]; then
    echo ""
    echo -e "${RED}  Strata failed to start.${RESET} Recent logs:"
    echo ""
    docker logs --tail 30 "$NAME" 2>&1 || true
    echo ""
    echo -e "  Watch logs:   ${BOLD}docker logs -f $NAME${RESET}"
    echo -e "  Try again:    ${BOLD}docker rm -f $NAME${RESET} then re-run this script"
    exit 1
  fi
  if curl -fs "$health_url" >/dev/null 2>&1; then
    healthy=true
    break
  fi
  sleep 3
done

echo ""
if [ "$healthy" = true ]; then
  echo -e "${GREEN}═══════════════════════════════════════════════════════${RESET}"
  echo -e "${GREEN}  Strata is running.${RESET}"
  echo -e "${GREEN}═══════════════════════════════════════════════════════${RESET}"
  echo ""
  echo -e "  Open ${BOLD}http://localhost:${port}${RESET} and create your admin account."
else
  warn "Strata is still starting. Give it another minute, then open http://localhost:${port}"
fi
echo ""
echo -e "  Logs:     ${BOLD}docker logs -f $NAME${RESET}"
echo -e "  Stop:     ${BOLD}docker stop $NAME${RESET}   Start again: ${BOLD}docker start $NAME${RESET}"
echo -e "  Upgrade:  re-run this script"
echo -e "  Remove:   ${BOLD}docker rm -f $NAME${RESET}   Wipe data too: ${BOLD}docker volume rm $VOLUME${RESET}"
echo ""
