#!/usr/bin/env bash
set -euo pipefail
trap "" PIPE
export TERM=xterm-256color
export NO_COLOR=1

source scripts/lib/autopus-e2e-instance.sh

autopus_e2e_eval_test_state_from_b64 "${AUTOPUS_TEST_STATE_SCRIPT_B64:?missing AUTOPUS_TEST_STATE_SCRIPT_B64}"
autopus_e2e_install_trash_shim

export NPM_CONFIG_PREFIX="$HOME/.npm-global"
export PATH="$NPM_CONFIG_PREFIX/bin:$PATH"
export npm_config_loglevel=error
export npm_config_fund=false
export npm_config_audit=false
export OPENAI_API_KEY="sk-autopus-release-media-memory"
export AUTOPUS_QA_ALLOW_LOCAL_IMAGE_PROVIDER=1

PORT="18789"
MOCK_PORT="44200"
SUCCESS_MARKER="AUTOPUS_E2E_OK_MEDIA_MEMORY"
MEMORY_MARKER="release-media-memory-saffron-$(date +%s)"
MOCK_REQUEST_LOG="/tmp/autopus-release-media-memory-openai.jsonl"
export SUCCESS_MARKER MOCK_REQUEST_LOG

mock_pid=""
gateway_pid=""
cleanup() {
  autopus_e2e_terminate_gateways "${gateway_pid:-}"
  autopus_e2e_stop_process "${mock_pid:-}"
}
trap cleanup EXIT

dump_debug_logs() {
  local status="$1"
  echo "release media memory failed with exit code $status" >&2
  autopus_e2e_dump_logs \
    /tmp/autopus-release-media-memory-install.log \
    /tmp/autopus-release-media-memory-onboard.log \
    /tmp/autopus-release-media-memory-openai.log \
    "$MOCK_REQUEST_LOG" \
    /tmp/autopus-release-media-memory-describe.json \
    /tmp/autopus-release-media-memory-generate.json \
    /tmp/autopus-release-media-memory-index.log \
    /tmp/autopus-release-media-memory-search-before.json \
    /tmp/autopus-release-media-memory-search-after.json \
    /tmp/autopus-release-media-memory-gateway-1.log \
    /tmp/autopus-release-media-memory-gateway-2.log
}
trap 'status=$?; dump_debug_logs "$status"; exit "$status"' ERR

start_gateway() {
  local log_path="$1"
  gateway_pid="$(autopus_e2e_start_gateway "$entry" "$PORT" "$log_path")"
  autopus_e2e_wait_gateway_ready "$gateway_pid" "$log_path"
}

stop_gateway() {
  autopus_e2e_terminate_gateways "${gateway_pid:-}"
  gateway_pid=""
}

autopus_e2e_install_package /tmp/autopus-release-media-memory-install.log
command -v autopus >/dev/null
package_root="$(autopus_e2e_package_root)"
entry="$(autopus_e2e_package_entrypoint "$package_root")"

mock_pid="$(autopus_e2e_start_mock_openai "$MOCK_PORT" /tmp/autopus-release-media-memory-openai.log)"
autopus_e2e_wait_mock_openai "$MOCK_PORT"

autopus onboard \
  --non-interactive \
  --accept-risk \
  --flow quickstart \
  --mode local \
  --auth-choice skip \
  --gateway-port "$PORT" \
  --gateway-bind loopback \
  --skip-daemon \
  --skip-ui \
  --skip-channels \
  --skip-skills \
  --skip-health >/tmp/autopus-release-media-memory-onboard.log 2>&1
node scripts/e2e/lib/release-scenarios/assertions.mjs configure-mock-openai "$MOCK_PORT"

mkdir -p "$AUTOPUS_STATE_DIR/workspace/memory" /tmp/autopus-release-media-memory
printf '%s' 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+yf7kAAAAASUVORK5CYII=' | base64 -d > /tmp/autopus-release-media-memory/input.png

autopus infer image describe \
  --file /tmp/autopus-release-media-memory/input.png \
  --model openai/gpt-5.5 \
  --prompt "Describe this image and return marker $SUCCESS_MARKER" \
  --json >/tmp/autopus-release-media-memory-describe.json 2>&1
node scripts/e2e/lib/release-scenarios/assertions.mjs assert-image-describe /tmp/autopus-release-media-memory-describe.json "$MOCK_REQUEST_LOG"

autopus infer image generate \
  --model openai/gpt-image-1 \
  --prompt "Generate a tiny test image for $SUCCESS_MARKER" \
  --output /tmp/autopus-release-media-memory/generated.png \
  --json >/tmp/autopus-release-media-memory-generate.json 2>&1
node scripts/e2e/lib/release-scenarios/assertions.mjs assert-image-generate /tmp/autopus-release-media-memory-generate.json "$MOCK_REQUEST_LOG"

cat >"$AUTOPUS_STATE_DIR/workspace/MEMORY.md" <<EOF
# Long-term memory

- The release media memory marker is $MEMORY_MARKER.
EOF

autopus memory index --force >/tmp/autopus-release-media-memory-index.log 2>&1 || true
autopus memory search "$MEMORY_MARKER" --json >/tmp/autopus-release-media-memory-search-before.json 2>&1
node scripts/e2e/lib/release-scenarios/assertions.mjs assert-memory-search /tmp/autopus-release-media-memory-search-before.json "$MEMORY_MARKER"

start_gateway /tmp/autopus-release-media-memory-gateway-1.log
stop_gateway
start_gateway /tmp/autopus-release-media-memory-gateway-2.log
autopus memory search "$MEMORY_MARKER" --json >/tmp/autopus-release-media-memory-search-after.json 2>&1
node scripts/e2e/lib/release-scenarios/assertions.mjs assert-memory-search /tmp/autopus-release-media-memory-search-after.json "$MEMORY_MARKER"
stop_gateway

echo "Release media memory scenario passed."
