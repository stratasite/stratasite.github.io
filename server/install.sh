#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════
# Strata Enterprise — Installer
# ═══════════════════════════════════════════════════════════════════
#
# Install:   curl -fsSL https://strata.do/server/install.sh | bash
# Upgrade:   re-run the same command in the install directory
# Env file:  curl -fsSL https://strata.do/server/env.sh | bash -s -- ./.env
#
# What this script does:
#   1. Checks Docker and Docker Compose are installed and recent enough
#   2. Authenticates with the Strata container registry
#   3. Prompts for database connection and license key
#   4. Writes docker-compose.yml and .env
#   5. Pulls the Strata image and starts the containers
#
# On re-run (upgrade):
#   - Keeps your existing .env (only prompts for missing keys)
#   - Updates docker-compose.yml to the latest version
#   - Pulls the new image and restarts containers
# ═══════════════════════════════════════════════════════════════════

set -euo pipefail

# ── Colours and formatting ────────────────────────────────────────

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
DIM='\033[2m'
RESET='\033[0m'

INSTALL_DIR="${STRATA_INSTALL_DIR:-$(pwd)/strata}"
REGISTRY="registry.gitlab.com"
IMAGE="registry.gitlab.com/stratado/server"
MIN_DOCKER_VERSION="24"
MIN_COMPOSE_VERSION="2.20"
LOG_CMD="cd $INSTALL_DIR && docker compose logs -f"

# ── Helpers ───────────────────────────────────────────────────────

info()    { echo -e "${BLUE}[strata]${RESET} $*"; }
success() { echo -e "${GREEN}[strata]${RESET} $*"; }
warn()    { echo -e "${YELLOW}[strata]${RESET} $*"; }
fail() {
  echo -e "${RED}[strata]${RESET} $*"
  echo -e "${DIM}  To see what went wrong: ${LOG_CMD}${RESET}"
  exit 1
}

prompt() {
  local var_name="$1" description="$2" default="${3:-}" required="${4:-false}"
  local value=""

  echo "" >&2
  echo -e "  ${BOLD}${var_name}${RESET}" >&2
  echo -e "  ${DIM}${description}${RESET}" >&2

  if [ "$required" = "true" ]; then
    while [ -z "$value" ]; do
      if [ -n "$default" ]; then
        read -rp "  Enter value [${default}]: " value < /dev/tty
        value="${value:-$default}"
      else
        read -rp "  Enter value: " value < /dev/tty
      fi
      if [ -z "$value" ]; then
        echo -e "  ${RED}This field is required.${RESET}" >&2
      fi
    done
  else
    if [ -n "$default" ]; then
      read -rp "  Enter value [${default}]: " value < /dev/tty
    else
      read -rp "  Enter value (leave empty to skip): " value < /dev/tty
    fi
    value="${value:-$default}"
  fi

  echo "$value"
}

prompt_secret() {
  local var_name="$1" description="$2" required="${3:-false}"
  local value=""

  echo "" >&2
  echo -e "  ${BOLD}${var_name}${RESET}" >&2
  echo -e "  ${DIM}${description}${RESET}" >&2

  if [ "$required" = "true" ]; then
    while [ -z "$value" ]; do
      read -rsp "  Enter value: " value < /dev/tty
      echo "" >&2
      if [ -z "$value" ]; then
        echo -e "  ${RED}This field is required.${RESET}" >&2
      fi
    done
  else
    read -rsp "  Enter value (leave empty to skip): " value < /dev/tty
    echo "" >&2
  fi

  echo "$value"
}

# Write a key=value to .env safely (handles special chars in values)
write_env() {
  local key="$1" value="$2" file="$3"

  if grep -q "^${key}=" "$file" 2>/dev/null; then
    tmpfile=$(mktemp)
    while IFS= read -r line; do
      if [[ "$line" == "${key}="* ]]; then
        echo "${key}=${value}" >> "$tmpfile"
      else
        echo "$line" >> "$tmpfile"
      fi
    done < "$file"
    mv "$tmpfile" "$file"
  else
    echo "${key}=${value}" >> "$file"
  fi
}

# Resolve config value with precedence:
#   1) .env file
#   2) current shell environment
# Returns empty string if neither is set.
resolve_config_value() {
  local key="$1" file="$2"
  local file_value=""
  local shell_value=""

  file_value=$(grep "^${key}=" "$file" 2>/dev/null | head -1 | cut -d'=' -f2- || true)
  if [ -n "$file_value" ]; then
    echo "$file_value"
    return
  fi

  shell_value="${!key-}"
  if [ -n "$shell_value" ]; then
    echo "$shell_value"
    return
  fi

  echo ""
}

version_gte() {
  printf '%s\n%s\n' "$2" "$1" | sort -V -C
}

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
echo -e "  ${DIM}Enterprise Installer${RESET}"
echo ""

# ── Step 1: Check Docker ─────────────────────────────────────────

info "Checking prerequisites..."

if ! command -v docker &>/dev/null; then
  echo -e "${RED}[strata]${RESET} Docker is not installed."
  echo -e "  Install it from ${BOLD}https://docs.docker.com/get-docker/${RESET} and re-run this script."
  exit 1
fi

docker_version=$(docker version --format '{{.Server.Version}}' 2>/dev/null || echo "0.0.0")
docker_major=$(echo "$docker_version" | cut -d. -f1)

if [ "$docker_major" -lt "$MIN_DOCKER_VERSION" ]; then
  echo -e "${RED}[strata]${RESET} Docker $docker_version is too old. Strata requires Docker $MIN_DOCKER_VERSION+."
  echo -e "  Upgrade at ${BOLD}https://docs.docker.com/get-docker/${RESET}"
  exit 1
fi
success "Docker $docker_version"

# ── Step 2: Check Docker Compose ─────────────────────────────────

if docker compose version &>/dev/null; then
  compose_version=$(docker compose version --short 2>/dev/null | sed 's/^v//')
else
  echo -e "${RED}[strata]${RESET} Docker Compose (v2) is not available."
  echo -e "  It ships with Docker Desktop, or install the plugin: ${BOLD}https://docs.docker.com/compose/install/${RESET}"
  exit 1
fi

if ! version_gte "$compose_version" "$MIN_COMPOSE_VERSION"; then
  echo -e "${RED}[strata]${RESET} Docker Compose $compose_version is too old. Strata requires Compose $MIN_COMPOSE_VERSION+."
  exit 1
fi
success "Docker Compose $compose_version"

# ── Step 3: Check if this is a fresh install or upgrade ──────────

is_upgrade=false
if [ -d "$INSTALL_DIR" ] && [ -f "$INSTALL_DIR/.env" ]; then
  is_upgrade=true
fi

if [ "$is_upgrade" = true ]; then
  echo ""
  info "Existing Strata installation detected at ${BOLD}$INSTALL_DIR${RESET}"
  info "This will upgrade your installation (your .env is preserved)."
  echo ""
  read -rp "  Continue with upgrade? [Y/n]: " confirm < /dev/tty
  confirm="${confirm:-Y}"
  if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
    info "Aborted."
    exit 0
  fi
else
  echo ""
  info "Installing Strata to ${BOLD}$INSTALL_DIR${RESET}"
  echo ""
  read -rp "  Continue? [Y/n]: " confirm < /dev/tty
  confirm="${confirm:-Y}"
  if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
    info "Aborted."
    exit 0
  fi
fi

mkdir -p "$INSTALL_DIR"
LOG_CMD="cd $INSTALL_DIR && docker compose logs -f"


# ── Step 4: Registry authentication ──────────────────────────────

echo ""
info "Registry authentication"

if docker pull "$IMAGE:latest" --quiet &>/dev/null 2>&1; then
  success "Already authenticated with $REGISTRY"
else
  echo -e "  ${DIM}You need your GitLab container registry credentials to pull the Strata image.${RESET}"
  echo -e "  ${DIM}These were provided with your license purchase.${RESET}"
  echo ""

  registry_username=$(prompt "REGISTRY_USERNAME" "Your GitLab registry username (user or deploy token username)" "" "true")
  registry_token=$(prompt_secret "REGISTRY_TOKEN" "Your GitLab registry token/password" "true")

  echo "$registry_token" | docker login "$REGISTRY" -u "$registry_username" --password-stdin 2>/dev/null \
    || fail "Authentication failed. Check your registry username/token and try again."

  success "Authenticated with $REGISTRY"
fi

# ── Step 5: Write docker-compose.yml ─────────────────────────────

info "Writing docker-compose.yml..."

cat > "$INSTALL_DIR/docker-compose.yml" << 'COMPOSE_EOF'
# Strata Enterprise - Docker Compose
# Managed by the Strata installer. All configuration belongs in .env.

services:
  web:
    image: registry.gitlab.com/stratado/server:${STRATA_VERSION:-latest}
    ports:
      - "${PORT:-3000}:80"
    env_file: .env
    environment:
      RAILS_ENV: production
      STRATA_PROCESS_TYPE: web
    volumes:
      - strata_storage:/rails/storage
    restart: unless-stopped

  worker:
    image: registry.gitlab.com/stratado/server:${STRATA_VERSION:-latest}
    env_file: .env
    environment:
      RAILS_ENV: production
      STRATA_PROCESS_TYPE: worker
    volumes:
      - strata_storage:/rails/storage
    restart: unless-stopped

volumes:
  strata_storage:
COMPOSE_EOF

success "docker-compose.yml written"

# ── Step 6: Create / update .env ─────────────────────────────────

ENV_FILE="$INSTALL_DIR/.env"

if [ ! -f "$ENV_FILE" ]; then
  touch "$ENV_FILE"
fi

# ── Step 7: Prompt for required values ────────────────────────────
#
# Only essential config is prompted. Advanced settings (SSL, S3,
# log level, etc.) are written with sensible defaults and can be edited
# in .env later.

echo ""
info "Database & license configuration"
echo -e "  ${DIM}Press Enter to accept the default shown in [brackets].${RESET}"

# Format: key|description|default|required|secret
PROMPTS=(
  "LICENSE_KEY|Your Strata license key (JWT token issued for your organization)||true|secret"
  "DB_HOST|PostgreSQL hostname or IP||true|"
  "DB_PORT|PostgreSQL port|5432|true|"
  "DB_USERNAME|PostgreSQL username||true|"
  "DB_PASSWORD|PostgreSQL password||true|secret"
  "PORT|Port for the Strata web UI|3000|false|"
)

prompted=false

for entry in "${PROMPTS[@]}"; do
  IFS='|' read -r key description default_value required secret <<< "$entry"

  current_value=$(resolve_config_value "$key" "$ENV_FILE")

  # If the value already exists in .env or shell env, persist to .env and skip prompt.
  if [ -n "$current_value" ]; then
    write_env "$key" "$current_value" "$ENV_FILE"
    continue
  fi

  prompted=true

  if [ "$secret" = "secret" ]; then
    new_value=$(prompt_secret "$key" "$description" "$required")
  else
    new_value=$(prompt "$key" "$description" "$default_value" "$required")
  fi

  write_env "$key" "$new_value" "$ENV_FILE"
done

# Write sensible defaults for non-prompted keys (only if missing)
DEFAULTS=(
  "RAILS_LOG_LEVEL|info"
  "APP_HOST|localhost"
  "APP_PROTOCOL|http"
  "ASSUME_SSL|false"
  "FORCE_SSL|false"
)

for entry in "${DEFAULTS[@]}"; do
  IFS='|' read -r key default_value <<< "$entry"
  current_value=$(resolve_config_value "$key" "$ENV_FILE")
  value_to_write="${current_value:-$default_value}"
  write_env "$key" "$value_to_write" "$ENV_FILE"
done

# Generate Strata encryption secrets if not already set
if [ -z "$(resolve_config_value "STRATA_SECRET_KEY_BASE" "$ENV_FILE")" ]; then
  secret=$(openssl rand -hex 64)
  write_env "STRATA_SECRET_KEY_BASE" "$secret" "$ENV_FILE"
  success "Generated STRATA_SECRET_KEY_BASE"
else
  write_env "STRATA_SECRET_KEY_BASE" "$(resolve_config_value "STRATA_SECRET_KEY_BASE" "$ENV_FILE")" "$ENV_FILE"
fi

if [ -z "$(resolve_config_value "STRATA_ENCRYPTION_PRIMARY_KEY" "$ENV_FILE")" ]; then
  secret=$(openssl rand -hex 16)
  write_env "STRATA_ENCRYPTION_PRIMARY_KEY" "$secret" "$ENV_FILE"
  success "Generated STRATA_ENCRYPTION_PRIMARY_KEY"
else
  write_env "STRATA_ENCRYPTION_PRIMARY_KEY" "$(resolve_config_value "STRATA_ENCRYPTION_PRIMARY_KEY" "$ENV_FILE")" "$ENV_FILE"
fi

if [ -z "$(resolve_config_value "STRATA_ENCRYPTION_DETERMINISTIC_KEY" "$ENV_FILE")" ]; then
  secret=$(openssl rand -hex 16)
  write_env "STRATA_ENCRYPTION_DETERMINISTIC_KEY" "$secret" "$ENV_FILE"
  success "Generated STRATA_ENCRYPTION_DETERMINISTIC_KEY"
else
  write_env "STRATA_ENCRYPTION_DETERMINISTIC_KEY" "$(resolve_config_value "STRATA_ENCRYPTION_DETERMINISTIC_KEY" "$ENV_FILE")" "$ENV_FILE"
fi

if [ -z "$(resolve_config_value "STRATA_ENCRYPTION_KEY_DERIVATION_SALT" "$ENV_FILE")" ]; then
  secret=$(openssl rand -hex 16)
  write_env "STRATA_ENCRYPTION_KEY_DERIVATION_SALT" "$secret" "$ENV_FILE"
  success "Generated STRATA_ENCRYPTION_KEY_DERIVATION_SALT"
else
  write_env "STRATA_ENCRYPTION_KEY_DERIVATION_SALT" "$(resolve_config_value "STRATA_ENCRYPTION_KEY_DERIVATION_SALT" "$ENV_FILE")" "$ENV_FILE"
fi

if [ "$prompted" = false ]; then
  success "All configuration values are set"
else
  echo ""
  success "Configuration saved to .env"
fi

# ── Step 8: Pull image ───────────────────────────────────────────

echo ""
info "Pulling Strata image..."

strata_version=$(resolve_config_value "STRATA_VERSION" "$ENV_FILE")
pull_tag="${strata_version:-latest}"

docker pull "$IMAGE:$pull_tag" || fail "Failed to pull image. Check your network and registry access."
success "Image pulled: $IMAGE:$pull_tag"

# ── Step 9: Start containers ─────────────────────────────────────

echo ""
if [ "$is_upgrade" = true ]; then
  info "Restarting Strata with the new version..."
else
  info "Starting Strata..."
fi

cd "$INSTALL_DIR"
docker compose up -d || fail "Failed to start containers."

# ── Step 10: Wait for health check ───────────────────────────────

port=$(resolve_config_value "PORT" "$ENV_FILE")
port="${port:-3000}"
health_url="http://localhost:${port}/up"

info "Waiting for Strata to be ready..."

healthy=false
for i in $(seq 1 30); do
  # Check if either service container has crashed
  web_status=$(docker compose ps web --format '{{.State}}' 2>/dev/null || echo "")
  worker_status=$(docker compose ps worker --format '{{.State}}' 2>/dev/null || echo "")
  if [ "$web_status" = "exited" ] || [ "$web_status" = "dead" ] || [ "$worker_status" = "exited" ] || [ "$worker_status" = "dead" ]; then
    echo ""
    echo -e "${RED}═══════════════════════════════════════════════════════${RESET}"
    echo -e "${RED}  Strata failed to start.${RESET}"
    echo -e "${RED}═══════════════════════════════════════════════════════${RESET}"
    echo ""
    echo -e "  ${BOLD}Recent logs:${RESET}"
    echo ""
    docker compose logs --tail 20 web worker 2>/dev/null
    echo ""
    echo -e "  ${BOLD}How to fix:${RESET}"
    echo -e "  1. Edit the config:          ${BOLD}nano $INSTALL_DIR/.env${RESET}"
    echo -e "     ${DIM}(check DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD)${RESET}"
    echo -e "  2. Restart:                  ${BOLD}cd $INSTALL_DIR && docker compose up -d${RESET}"
    echo -e "  3. Watch logs:               ${BOLD}${LOG_CMD}${RESET}"
    echo ""
    exit 1
  fi

  # Check the health endpoint
  if curl -sf "$health_url" -o /dev/null 2>/dev/null; then
    healthy=true
    break
  fi

  sleep 2
done

if [ "$healthy" = false ]; then
  echo ""
  echo -e "${YELLOW}═══════════════════════════════════════════════════════${RESET}"
  echo -e "${YELLOW}  Strata is still starting up.${RESET}"
  echo -e "${YELLOW}═══════════════════════════════════════════════════════${RESET}"
  echo ""
  echo -e "  ${BOLD}Recent logs:${RESET}"
  echo ""
  docker compose logs --tail 15 web worker 2>/dev/null
  echo ""
  echo -e "  The container is running but hasn't passed the health check yet."
  echo -e "  This can be normal on first run (database setup takes time)."
  echo ""
  echo -e "  ${BOLD}Watch progress:${RESET}  ${LOG_CMD}"
  echo -e "  ${BOLD}Check health:${RESET}    curl ${health_url}"
  echo ""
  exit 1
fi

# ── Done ──────────────────────────────────────────────────────────

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════${RESET}"

if [ "$is_upgrade" = true ]; then
  echo -e "${GREEN}  Strata has been upgraded successfully.${RESET}"
else
  echo -e "${GREEN}  Strata is running.${RESET}"
  echo ""
  echo -e "  Open ${BOLD}http://localhost:${port}${RESET} to create your admin account."
fi

echo ""
echo -e "  ${DIM}View logs:${RESET}   ${LOG_CMD}"
echo -e "  ${DIM}Stop:${RESET}        cd $INSTALL_DIR && docker compose down"
echo -e "  ${DIM}Config:${RESET}      $INSTALL_DIR/.env"
echo -e "  ${DIM}Upgrade:${RESET}     re-run this installer"
echo -e "${GREEN}═══════════════════════════════════════════════════════${RESET}"
echo ""
