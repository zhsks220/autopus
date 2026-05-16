#!/usr/bin/env bash
set -euo pipefail

SCRIPT_ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ROOT_DIR="${AUTOPUS_LIVE_DOCKER_REPO_ROOT:-$SCRIPT_ROOT_DIR}"
ROOT_DIR="$(cd "$ROOT_DIR" && pwd)"
TRUSTED_HARNESS_DIR="${AUTOPUS_LIVE_DOCKER_TRUSTED_HARNESS_DIR:-${AUTOPUS_LIVE_CODEX_TRUSTED_HARNESS_DIR:-$SCRIPT_ROOT_DIR}}"
if [[ -z "$TRUSTED_HARNESS_DIR" || ! -d "$TRUSTED_HARNESS_DIR" ]]; then
  echo "ERROR: trusted Codex harness directory not found: ${TRUSTED_HARNESS_DIR:-<empty>}." >&2
  exit 1
fi
TRUSTED_HARNESS_DIR="$(cd "$TRUSTED_HARNESS_DIR" && pwd)"
source "$TRUSTED_HARNESS_DIR/scripts/lib/live-docker-auth.sh"
IMAGE_NAME="${AUTOPUS_IMAGE:-autopus:local}"
LIVE_IMAGE_NAME="${AUTOPUS_LIVE_IMAGE:-${IMAGE_NAME}-live}"
CONFIG_DIR="${AUTOPUS_CONFIG_DIR:-$HOME/.autopus}"
WORKSPACE_DIR="${AUTOPUS_WORKSPACE_DIR:-$HOME/.autopus/workspace}"
PROFILE_FILE="$(autopus_live_default_profile_file)"
CODEX_HARNESS_AUTH_MODE="${AUTOPUS_LIVE_CODEX_HARNESS_AUTH:-codex-auth}"
TEMP_DIRS=()
DOCKER_USER="${AUTOPUS_DOCKER_USER:-node}"
DOCKER_HOME_MOUNT=()
DOCKER_TRUSTED_HARNESS_MOUNT=()
DOCKER_TRUSTED_HARNESS_CONTAINER_DIR=""
DOCKER_CACHE_CONTAINER_DIR="/tmp/autopus-cache"
DOCKER_CLI_TOOLS_CONTAINER_DIR="/tmp/autopus-npm-global"
DOCKER_EXTRA_ENV_FILES=()
DOCKER_AUTH_PRESTAGED=0

autopus_live_codex_harness_is_ci() {
  [[ -n "${CI:-}" && "${CI:-}" != "false" ]] || [[ -n "${GITHUB_ACTIONS:-}" && "${GITHUB_ACTIONS:-}" != "false" ]]
}

autopus_live_codex_harness_append_build_extension() {
  local extension="${1:?extension required}"
  local current="${AUTOPUS_DOCKER_BUILD_EXTENSIONS:-${AUTOPUS_EXTENSIONS:-}}"
  case " $current " in
    *" $extension "*)
      ;;
    *)
      export AUTOPUS_DOCKER_BUILD_EXTENSIONS="${current:+$current }$extension"
      ;;
  esac
}

case "$CODEX_HARNESS_AUTH_MODE" in
  codex-auth | api-key)
    ;;
  *)
    echo "ERROR: AUTOPUS_LIVE_CODEX_HARNESS_AUTH must be one of: codex-auth, api-key." >&2
    exit 1
    ;;
esac

if [[ -f "$PROFILE_FILE" && -r "$PROFILE_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$PROFILE_FILE"
  set +a
fi

if [[ "$CODEX_HARNESS_AUTH_MODE" == "api-key" && -z "${OPENAI_API_KEY:-}" ]]; then
  echo "ERROR: AUTOPUS_LIVE_CODEX_HARNESS_AUTH=api-key requires OPENAI_API_KEY." >&2
  exit 1
fi
if [[ "$CODEX_HARNESS_AUTH_MODE" != "api-key" && ! -s "$HOME/.codex/auth.json" ]]; then
  echo "ERROR: AUTOPUS_LIVE_CODEX_HARNESS_AUTH=codex-auth requires ~/.codex/auth.json before building the live Docker image." >&2
  if [[ -n "${OPENAI_API_KEY:-}" ]]; then
    echo "If this is a Testbox/API-key run, set AUTOPUS_LIVE_CODEX_HARNESS_AUTH=api-key and run through autopus-testbox-env." >&2
  fi
  exit 1
fi

cleanup_temp_dirs() {
  if ((${#TEMP_DIRS[@]} > 0)); then
    rm -rf "${TEMP_DIRS[@]}"
  fi
}
trap cleanup_temp_dirs EXIT

if [[ -n "${AUTOPUS_DOCKER_CLI_TOOLS_DIR:-}" ]]; then
  CLI_TOOLS_DIR="${AUTOPUS_DOCKER_CLI_TOOLS_DIR}"
elif autopus_live_codex_harness_is_ci; then
  CLI_TOOLS_DIR="$(mktemp -d "${RUNNER_TEMP:-/tmp}/autopus-docker-cli-tools.XXXXXX")"
  TEMP_DIRS+=("$CLI_TOOLS_DIR")
else
  CLI_TOOLS_DIR="$HOME/.cache/autopus/docker-cli-tools"
fi
if [[ -n "${AUTOPUS_DOCKER_CACHE_HOME_DIR:-}" ]]; then
  CACHE_HOME_DIR="${AUTOPUS_DOCKER_CACHE_HOME_DIR}"
elif autopus_live_codex_harness_is_ci; then
  CACHE_HOME_DIR="$(mktemp -d "${RUNNER_TEMP:-/tmp}/autopus-docker-cache.XXXXXX")"
  TEMP_DIRS+=("$CACHE_HOME_DIR")
else
  CACHE_HOME_DIR="$HOME/.cache/autopus/docker-cache"
fi

mkdir -p "$CLI_TOOLS_DIR"
mkdir -p "$CACHE_HOME_DIR"
if autopus_live_codex_harness_is_ci; then
  chmod 0777 "$CLI_TOOLS_DIR" "$CACHE_HOME_DIR" || true
fi
if autopus_live_codex_harness_is_ci; then
  DOCKER_USER="$(id -u):$(id -g)"
  DOCKER_HOME_DIR="$(mktemp -d "${RUNNER_TEMP:-/tmp}/autopus-docker-home.XXXXXX")"
  TEMP_DIRS+=("$DOCKER_HOME_DIR")
  DOCKER_HOME_MOUNT=(-v "$DOCKER_HOME_DIR":/home/node)
fi

PROFILE_MOUNT=()
PROFILE_STATUS="none"
if [[ -f "$PROFILE_FILE" && -r "$PROFILE_FILE" ]]; then
  PROFILE_MOUNT=(-v "$PROFILE_FILE":/home/node/.profile:ro)
  PROFILE_STATUS="$PROFILE_FILE"
fi

DOCKER_TRUSTED_HARNESS_CONTAINER_DIR="/trusted-harness"
DOCKER_TRUSTED_HARNESS_MOUNT=(-v "$TRUSTED_HARNESS_DIR":"$DOCKER_TRUSTED_HARNESS_CONTAINER_DIR":ro)

AUTH_FILES=()
if [[ "$CODEX_HARNESS_AUTH_MODE" != "api-key" ]]; then
  while IFS= read -r auth_file; do
    [[ -n "$auth_file" ]] || continue
    AUTH_FILES+=("$auth_file")
  done < <(autopus_live_collect_auth_files_from_csv "openai-codex")
fi

AUTH_FILES_CSV=""
if ((${#AUTH_FILES[@]} > 0)); then
  AUTH_FILES_CSV="$(autopus_live_join_csv "${AUTH_FILES[@]}")"
fi

if [[ -n "${DOCKER_HOME_DIR:-}" ]]; then
  autopus_live_stage_auth_into_home "$DOCKER_HOME_DIR" --files "${AUTH_FILES[@]}"
  DOCKER_AUTH_PRESTAGED=1
fi

EXTERNAL_AUTH_MOUNTS=()
if ((${#AUTH_FILES[@]} > 0)); then
  for auth_file in "${AUTH_FILES[@]}"; do
    auth_file="$(autopus_live_validate_relative_home_path "$auth_file")"
    host_path="$HOME/$auth_file"
    if [[ -f "$host_path" ]]; then
      EXTERNAL_AUTH_MOUNTS+=(-v "$host_path":/host-auth-files/"$auth_file":ro)
    fi
  done
fi

DOCKER_AUTH_ENV=()
if [[ "$CODEX_HARNESS_AUTH_MODE" == "api-key" ]]; then
  docker_env_dir="$(mktemp -d "${RUNNER_TEMP:-/tmp}/autopus-codex-harness-env.XXXXXX")"
  TEMP_DIRS+=("$docker_env_dir")
  docker_env_file="$docker_env_dir/openai.env"
  {
    printf 'OPENAI_API_KEY=%s\n' "${OPENAI_API_KEY}"
    if [[ -n "${OPENAI_BASE_URL:-}" ]]; then
      printf 'OPENAI_BASE_URL=%s\n' "${OPENAI_BASE_URL}"
    fi
  } >"$docker_env_file"
  DOCKER_EXTRA_ENV_FILES+=(--env-file "$docker_env_file")
fi

read -r -d '' LIVE_TEST_CMD <<'EOF' || true
set -euo pipefail
[ -f "$HOME/.profile" ] && [ -r "$HOME/.profile" ] && source "$HOME/.profile" || true
export NPM_CONFIG_PREFIX="${NPM_CONFIG_PREFIX:-$HOME/.npm-global}"
export npm_config_prefix="$NPM_CONFIG_PREFIX"
export XDG_CACHE_HOME="${XDG_CACHE_HOME:-$HOME/.cache}"
export COREPACK_HOME="${COREPACK_HOME:-$XDG_CACHE_HOME/node/corepack}"
export NPM_CONFIG_CACHE="${NPM_CONFIG_CACHE:-$XDG_CACHE_HOME/npm}"
export npm_config_cache="$NPM_CONFIG_CACHE"
if [ "${AUTOPUS_LIVE_CODEX_HARNESS_DEBUG:-}" = "1" ]; then
  id
  mount | grep -E 'autopus-cache|autopus-npm|/home/node' || true
  ls -ld "$HOME" "$XDG_CACHE_HOME" "$NPM_CONFIG_PREFIX" 2>/dev/null || true
fi
# Force the Codex harness to use the staged `~/.codex` auth files. This lane
# is not meant to exercise raw OpenAI API-key routing unless the lane
# explicitly opts into API-key auth for CI.
if [ "${AUTOPUS_LIVE_CODEX_HARNESS_AUTH:-codex-auth}" != "api-key" ]; then
  unset OPENAI_API_KEY OPENAI_BASE_URL
fi
mkdir -p "$NPM_CONFIG_PREFIX" "$XDG_CACHE_HOME" "$COREPACK_HOME" "$NPM_CONFIG_CACHE"
chmod 700 "$XDG_CACHE_HOME" "$COREPACK_HOME" "$NPM_CONFIG_CACHE" || true
export PATH="$NPM_CONFIG_PREFIX/bin:$PATH"
if [ "${AUTOPUS_DOCKER_AUTH_PRESTAGED:-0}" != "1" ]; then
  IFS=',' read -r -a auth_files <<<"${AUTOPUS_DOCKER_AUTH_FILES_RESOLVED:-}"
  if ((${#auth_files[@]} > 0)); then
    for auth_file in "${auth_files[@]}"; do
      [ -n "$auth_file" ] || continue
      if [ -f "/host-auth-files/$auth_file" ]; then
        mkdir -p "$(dirname "$HOME/$auth_file")"
        cp "/host-auth-files/$auth_file" "$HOME/$auth_file"
        chmod u+rw "$HOME/$auth_file" || true
      fi
    done
  fi
fi
if [ "${AUTOPUS_LIVE_CODEX_HARNESS_AUTH:-codex-auth}" != "api-key" ] && [ ! -s "$HOME/.codex/auth.json" ]; then
  echo "ERROR: missing ~/.codex/auth.json for Codex harness live test." >&2
  exit 1
fi
trusted_scripts_dir="${AUTOPUS_LIVE_DOCKER_SCRIPTS_DIR:-/src/scripts}"
if [ "${AUTOPUS_LIVE_CODEX_HARNESS_AUTH:-codex-auth}" != "api-key" ]; then
  node --import tsx "$trusted_scripts_dir/prepare-codex-ci-auth.ts" "$HOME/.codex/auth.json"
fi
if [ ! -x "$NPM_CONFIG_PREFIX/bin/codex" ]; then
  npm install -g @openai/codex
fi
if [ "${AUTOPUS_LIVE_CODEX_HARNESS_AUTH:-codex-auth}" = "api-key" ]; then
  printf '%s\n' "$OPENAI_API_KEY" | "$NPM_CONFIG_PREFIX/bin/codex" login --with-api-key >/dev/null
fi
tmp_dir="$(mktemp -d)"
source "$trusted_scripts_dir/lib/live-docker-stage.sh"
autopus_live_stage_source_tree "$tmp_dir"
autopus_live_stage_node_modules "$tmp_dir"
autopus_live_link_runtime_tree "$tmp_dir"
if [ -d /app/dist-runtime/extensions/codex ]; then
  export AUTOPUS_BUNDLED_PLUGINS_DIR=/app/dist-runtime/extensions
elif [ -d /app/dist/extensions/codex ]; then
  export AUTOPUS_BUNDLED_PLUGINS_DIR=/app/dist/extensions
elif [ -f "$tmp_dir/extensions/codex/autopus.plugin.json" ]; then
  export AUTOPUS_BUNDLED_PLUGINS_DIR="$tmp_dir/extensions"
else
  echo "ERROR: staged Codex plugin not found for live harness." >&2
  exit 1
fi
autopus_live_stage_state_dir "$tmp_dir/.autopus-state"
if [ -n "${AUTOPUS_LIVE_CODEX_TRUSTED_HARNESS_DIR:-}" ] && [ -d "$AUTOPUS_LIVE_CODEX_TRUSTED_HARNESS_DIR" ]; then
  for harness_file in src/gateway/gateway-codex-harness.live-helpers.ts; do
    if [ -f "$AUTOPUS_LIVE_CODEX_TRUSTED_HARNESS_DIR/$harness_file" ]; then
      mkdir -p "$(dirname "$tmp_dir/$harness_file")"
      cp "$AUTOPUS_LIVE_CODEX_TRUSTED_HARNESS_DIR/$harness_file" "$tmp_dir/$harness_file"
    fi
  done
fi
autopus_live_prepare_staged_config
cd "$tmp_dir"
if [ "${AUTOPUS_LIVE_CODEX_HARNESS_USE_CI_SAFE_CODEX_CONFIG:-1}" = "1" ]; then
  node --import tsx "$trusted_scripts_dir/prepare-codex-ci-config.ts" "$HOME/.codex/config.toml" "$tmp_dir"
fi
codex_preflight_log="$tmp_dir/codex-preflight.log"
codex_preflight_token="CODEX-PREFLIGHT-OK"
if ! "$NPM_CONFIG_PREFIX/bin/codex" exec \
  --json \
  --color never \
  --skip-git-repo-check \
  "Reply exactly: $codex_preflight_token" >"$codex_preflight_log" 2>&1; then
  if grep -q "Failed to extract accountId from token" "$codex_preflight_log"; then
    echo "SKIP: Codex auth cannot extract accountId from the available token; skipping live Codex harness lane."
    exit 0
  fi
  cat "$codex_preflight_log" >&2
  exit 1
fi
node scripts/test-live.mjs -- ${AUTOPUS_LIVE_CODEX_TEST_FILES:-src/gateway/gateway-codex-harness.live.test.ts}
EOF

autopus_live_codex_harness_append_build_extension codex
# The release package image intentionally excludes externalized plugins such as
# Codex. This lane must rebuild the live image so the plugin-owned harness is
# present under the bundled plugin runtime directory.
AUTOPUS_SKIP_DOCKER_BUILD=0
export AUTOPUS_SKIP_DOCKER_BUILD
AUTOPUS_LIVE_DOCKER_REPO_ROOT="$ROOT_DIR" "$TRUSTED_HARNESS_DIR/scripts/test-live-build-docker.sh"

echo "==> Run Codex harness live test in Docker"
echo "==> Model: ${AUTOPUS_LIVE_CODEX_HARNESS_MODEL:-codex/gpt-5.5}"
echo "==> Image probe: ${AUTOPUS_LIVE_CODEX_HARNESS_IMAGE_PROBE:-1}"
echo "==> MCP probe: ${AUTOPUS_LIVE_CODEX_HARNESS_MCP_PROBE:-1}"
echo "==> Subagent probe: ${AUTOPUS_LIVE_CODEX_HARNESS_SUBAGENT_PROBE:-1}"
echo "==> Subagent-only fast path: ${AUTOPUS_LIVE_CODEX_HARNESS_SUBAGENT_ONLY:-auto}"
echo "==> Guardian probe: ${AUTOPUS_LIVE_CODEX_HARNESS_GUARDIAN_PROBE:-1}"
echo "==> Auth mode: $CODEX_HARNESS_AUTH_MODE"
echo "==> Profile file: $PROFILE_STATUS"
echo "==> CI-safe Codex config: ${AUTOPUS_LIVE_CODEX_HARNESS_USE_CI_SAFE_CODEX_CONFIG:-1}"
echo "==> Test files: ${AUTOPUS_LIVE_CODEX_TEST_FILES:-src/gateway/gateway-codex-harness.live.test.ts}"
echo "==> Harness fallback: none"
echo "==> Auth files: ${AUTH_FILES_CSV:-none}"
DOCKER_RUN_ARGS=(docker run --rm -t \
  -u "$DOCKER_USER" \
  --entrypoint bash \
  -e COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
  -e HOME=/home/node \
  -e NPM_CONFIG_PREFIX="$DOCKER_CLI_TOOLS_CONTAINER_DIR" \
  -e npm_config_prefix="$DOCKER_CLI_TOOLS_CONTAINER_DIR" \
  -e XDG_CACHE_HOME="$DOCKER_CACHE_CONTAINER_DIR" \
  -e COREPACK_HOME="$DOCKER_CACHE_CONTAINER_DIR/node/corepack" \
  -e NPM_CONFIG_CACHE="$DOCKER_CACHE_CONTAINER_DIR/npm" \
  -e npm_config_cache="$DOCKER_CACHE_CONTAINER_DIR/npm" \
  -e NODE_OPTIONS=--disable-warning=ExperimentalWarning \
  -e AUTOPUS_AGENT_HARNESS_FALLBACK=none \
  -e AUTOPUS_DOCKER_AUTH_PRESTAGED="$DOCKER_AUTH_PRESTAGED" \
  -e AUTOPUS_CODEX_APP_SERVER_BIN="${AUTOPUS_CODEX_APP_SERVER_BIN:-codex}" \
  -e AUTOPUS_DOCKER_AUTH_FILES_RESOLVED="$AUTH_FILES_CSV" \
  -e AUTOPUS_LIVE_DOCKER_SOURCE_STAGE_MODE="${AUTOPUS_LIVE_DOCKER_SOURCE_STAGE_MODE:-copy}" \
  -e AUTOPUS_LIVE_CODEX_HARNESS_AUTH="$CODEX_HARNESS_AUTH_MODE" \
  -e AUTOPUS_LIVE_CODEX_HARNESS=1 \
  -e AUTOPUS_LIVE_CODEX_HARNESS_DEBUG="${AUTOPUS_LIVE_CODEX_HARNESS_DEBUG:-}" \
  -e AUTOPUS_LIVE_CODEX_HARNESS_GUARDIAN_PROBE="${AUTOPUS_LIVE_CODEX_HARNESS_GUARDIAN_PROBE:-1}" \
  -e AUTOPUS_LIVE_CODEX_HARNESS_IMAGE_PROBE="${AUTOPUS_LIVE_CODEX_HARNESS_IMAGE_PROBE:-1}" \
  -e AUTOPUS_LIVE_CODEX_HARNESS_MCP_PROBE="${AUTOPUS_LIVE_CODEX_HARNESS_MCP_PROBE:-1}" \
  -e AUTOPUS_LIVE_CODEX_HARNESS_MODEL="${AUTOPUS_LIVE_CODEX_HARNESS_MODEL:-codex/gpt-5.5}" \
  -e AUTOPUS_LIVE_CODEX_HARNESS_REQUIRE_GUARDIAN_EVENTS="${AUTOPUS_LIVE_CODEX_HARNESS_REQUIRE_GUARDIAN_EVENTS:-1}" \
  -e AUTOPUS_LIVE_CODEX_HARNESS_REQUEST_TIMEOUT_MS="${AUTOPUS_LIVE_CODEX_HARNESS_REQUEST_TIMEOUT_MS:-}" \
  -e AUTOPUS_LIVE_CODEX_HARNESS_SUBAGENT_ONLY="${AUTOPUS_LIVE_CODEX_HARNESS_SUBAGENT_ONLY:-}" \
  -e AUTOPUS_LIVE_CODEX_HARNESS_SUBAGENT_PROBE="${AUTOPUS_LIVE_CODEX_HARNESS_SUBAGENT_PROBE:-1}" \
  -e AUTOPUS_LIVE_CODEX_HARNESS_USE_CI_SAFE_CODEX_CONFIG="${AUTOPUS_LIVE_CODEX_HARNESS_USE_CI_SAFE_CODEX_CONFIG:-1}" \
  -e AUTOPUS_CLI_BACKEND_LOG_OUTPUT="${AUTOPUS_CLI_BACKEND_LOG_OUTPUT:-}" \
  -e AUTOPUS_TEST_CONSOLE="${AUTOPUS_TEST_CONSOLE:-}" \
  -e AUTOPUS_LIVE_DOCKER_SCRIPTS_DIR="${DOCKER_TRUSTED_HARNESS_CONTAINER_DIR}/scripts" \
  -e AUTOPUS_LIVE_DOCKER_TRUSTED_HARNESS_DIR="$DOCKER_TRUSTED_HARNESS_CONTAINER_DIR" \
  -e AUTOPUS_LIVE_CODEX_TRUSTED_HARNESS_DIR="$DOCKER_TRUSTED_HARNESS_CONTAINER_DIR" \
  -e AUTOPUS_LIVE_CODEX_BIND="${AUTOPUS_LIVE_CODEX_BIND:-}" \
  -e AUTOPUS_LIVE_CODEX_BIND_MODEL="${AUTOPUS_LIVE_CODEX_BIND_MODEL:-}" \
  -e AUTOPUS_LIVE_CODEX_TEST_FILES="${AUTOPUS_LIVE_CODEX_TEST_FILES:-}" \
  -e AUTOPUS_LIVE_TEST=1 \
  -e AUTOPUS_VITEST_FS_MODULE_CACHE=0)
autopus_live_append_array DOCKER_RUN_ARGS DOCKER_AUTH_ENV
autopus_live_append_array DOCKER_RUN_ARGS DOCKER_EXTRA_ENV_FILES
autopus_live_append_array DOCKER_RUN_ARGS DOCKER_HOME_MOUNT
autopus_live_append_array DOCKER_RUN_ARGS DOCKER_TRUSTED_HARNESS_MOUNT
DOCKER_RUN_ARGS+=(\
  -v "$CACHE_HOME_DIR":"$DOCKER_CACHE_CONTAINER_DIR" \
  -v "$ROOT_DIR":/src:ro \
  -v "$CONFIG_DIR":/home/node/.autopus \
  -v "$WORKSPACE_DIR":/home/node/.autopus/workspace \
  -v "$CLI_TOOLS_DIR":"$DOCKER_CLI_TOOLS_CONTAINER_DIR")
autopus_live_append_array DOCKER_RUN_ARGS EXTERNAL_AUTH_MOUNTS
autopus_live_append_array DOCKER_RUN_ARGS PROFILE_MOUNT
DOCKER_RUN_ARGS+=(\
  "$LIVE_IMAGE_NAME" \
  -lc "$LIVE_TEST_CMD")
if [[ "${AUTOPUS_LIVE_CODEX_HARNESS_DEBUG:-}" == "1" ]]; then
  echo "==> Docker debug: host ids and mounted dirs"
  id
  ls -ld "$CACHE_HOME_DIR" "$CLI_TOOLS_DIR" "${DOCKER_HOME_DIR:-$HOME}" 2>/dev/null || true
  printf '==> Docker debug args:'
  printf ' %q' "${DOCKER_RUN_ARGS[@]}"
  printf '\n'
fi
"${DOCKER_RUN_ARGS[@]}"
