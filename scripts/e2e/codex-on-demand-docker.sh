#!/usr/bin/env bash
# Installs a prepared Autopus npm tarball in Docker, runs OpenAI onboarding,
# and verifies the Codex plugin plus @openai/codex dependency are downloaded on demand.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
source "$ROOT_DIR/scripts/lib/docker-e2e-image.sh"
source "$ROOT_DIR/scripts/lib/docker-e2e-package.sh"

IMAGE_NAME="$(docker_e2e_resolve_image "autopus-codex-on-demand-e2e" AUTOPUS_CODEX_ON_DEMAND_E2E_IMAGE)"
DOCKER_TARGET="${AUTOPUS_CODEX_ON_DEMAND_DOCKER_TARGET:-bare}"
HOST_BUILD="${AUTOPUS_CODEX_ON_DEMAND_HOST_BUILD:-1}"
PACKAGE_TGZ="${AUTOPUS_CURRENT_PACKAGE_TGZ:-}"

docker_e2e_build_or_reuse "$IMAGE_NAME" codex-on-demand "$ROOT_DIR/scripts/e2e/Dockerfile" "$ROOT_DIR" "$DOCKER_TARGET"

prepare_package_tgz() {
  if [ -n "$PACKAGE_TGZ" ]; then
    PACKAGE_TGZ="$(docker_e2e_prepare_package_tgz codex-on-demand "$PACKAGE_TGZ")"
    return 0
  fi
  if [ "$HOST_BUILD" = "0" ] && [ -z "${AUTOPUS_CURRENT_PACKAGE_TGZ:-}" ]; then
    echo "AUTOPUS_CODEX_ON_DEMAND_HOST_BUILD=0 requires AUTOPUS_CURRENT_PACKAGE_TGZ" >&2
    exit 1
  fi
  PACKAGE_TGZ="$(docker_e2e_prepare_package_tgz codex-on-demand)"
}

prepare_package_tgz

docker_e2e_package_mount_args "$PACKAGE_TGZ"
run_log="$(docker_e2e_run_log codex-on-demand)"
AUTOPUS_TEST_STATE_SCRIPT_B64="$(docker_e2e_test_state_shell_b64 codex-on-demand empty)"

echo "Running Codex on-demand Docker E2E..."
if ! docker_e2e_run_with_harness \
  -e COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
  -e "AUTOPUS_TEST_STATE_SCRIPT_B64=$AUTOPUS_TEST_STATE_SCRIPT_B64" \
  "${DOCKER_E2E_PACKAGE_ARGS[@]}" \
  -i "$IMAGE_NAME" bash -s >"$run_log" 2>&1 <<'EOF'; then
set -euo pipefail

source scripts/lib/autopus-e2e-instance.sh
autopus_e2e_eval_test_state_from_b64 "${AUTOPUS_TEST_STATE_SCRIPT_B64:?missing AUTOPUS_TEST_STATE_SCRIPT_B64}"
export NPM_CONFIG_PREFIX="$HOME/.npm-global"
export npm_config_prefix="$NPM_CONFIG_PREFIX"
export XDG_CACHE_HOME="${XDG_CACHE_HOME:-$HOME/.cache}"
export NPM_CONFIG_CACHE="${NPM_CONFIG_CACHE:-$XDG_CACHE_HOME/npm}"
export npm_config_cache="$NPM_CONFIG_CACHE"
export PATH="$NPM_CONFIG_PREFIX/bin:$PATH"
export OPENAI_API_KEY="sk-autopus-codex-on-demand-e2e"

dump_debug_logs() {
  local status="$1"
  echo "Codex on-demand scenario failed with exit code $status" >&2
  autopus_e2e_dump_logs \
    /tmp/autopus-install.log \
    /tmp/autopus-onboard.json \
    /tmp/autopus-plugins-list.json \
    /tmp/autopus-codex-inspect.json
}
trap 'status=$?; dump_debug_logs "$status"; exit "$status"' ERR

mkdir -p "$NPM_CONFIG_PREFIX" "$XDG_CACHE_HOME" "$NPM_CONFIG_CACHE"
chmod 700 "$XDG_CACHE_HOME" "$NPM_CONFIG_CACHE" || true

autopus_e2e_install_package /tmp/autopus-install.log
command -v autopus >/dev/null

autopus_e2e_assert_dep_absent "@autopus/codex" "$HOME/.autopus" "$NPM_CONFIG_PREFIX"
autopus_e2e_assert_dep_absent "@openai/codex" "$HOME/.autopus" "$NPM_CONFIG_PREFIX"

echo "Running non-interactive OpenAI onboarding; Codex should install on demand..."
autopus onboard --non-interactive --accept-risk \
  --mode local \
  --auth-choice openai-api-key \
  --secret-input-mode ref \
  --skip-daemon \
  --skip-ui \
  --skip-channels \
  --skip-skills \
  --skip-health \
  --json >/tmp/autopus-onboard.json

autopus plugins list --json >/tmp/autopus-plugins-list.json
autopus plugins inspect codex --runtime --json >/tmp/autopus-codex-inspect.json
node scripts/e2e/lib/codex-on-demand/assertions.mjs

echo "Codex on-demand Docker E2E passed"
EOF
  docker_e2e_print_log "$run_log"
  rm -f "$run_log"
  exit 1
fi

rm -f "$run_log"
echo "Codex on-demand Docker E2E passed"
