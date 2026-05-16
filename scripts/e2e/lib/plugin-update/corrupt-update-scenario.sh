#!/usr/bin/env bash
set -euo pipefail

source scripts/lib/autopus-e2e-instance.sh
source scripts/e2e/lib/plugins/fixtures.sh

autopus_e2e_eval_test_state_from_b64 "${AUTOPUS_TEST_STATE_SCRIPT_B64:?missing AUTOPUS_TEST_STATE_SCRIPT_B64}"

export npm_config_loglevel=error
export npm_config_fund=false
export npm_config_audit=false
export npm_config_prefix=/tmp/npm-prefix
export NPM_CONFIG_PREFIX=/tmp/npm-prefix
export PATH="/tmp/npm-prefix/bin:$PATH"
export CI=true
export AUTOPUS_DISABLE_BUNDLED_PLUGINS=1
export AUTOPUS_NO_ONBOARD=1
export AUTOPUS_NO_PROMPT=1

baseline="${AUTOPUS_UPDATE_CORRUPT_PLUGIN_BASELINE:-autopus@latest}"
echo "Installing baseline Autopus package: $baseline"
if ! npm install -g --prefix /tmp/npm-prefix --omit=optional "$baseline" >/tmp/autopus-update-corrupt-baseline-install.log 2>&1; then
  cat /tmp/autopus-update-corrupt-baseline-install.log >&2 || true
  exit 1
fi

package_root="$(autopus_e2e_package_root /tmp/npm-prefix)"
entry="$(autopus_e2e_package_entrypoint "$package_root")"
export AUTOPUS_ENTRY="$entry"

npm_pack_dir="$(mktemp -d "/tmp/autopus-corrupt-plugin-pack.XXXXXX")"
npm_registry_dir="$(mktemp -d "/tmp/autopus-corrupt-plugin-registry.XXXXXX")"
pack_fixture_plugin "$npm_pack_dir" /tmp/demo-corrupt-plugin.tgz demo-corrupt-plugin 0.0.1 demo.corrupt "Demo Corrupt Plugin"
start_npm_fixture_registry "@autopus/demo-corrupt-plugin" "0.0.1" /tmp/demo-corrupt-plugin.tgz "$npm_registry_dir"

echo "Installing managed external plugin..."
node "$entry" plugins install "npm:@autopus/demo-corrupt-plugin@0.0.1" >/tmp/autopus-corrupt-plugin-install.log 2>&1
node "$entry" plugins inspect demo-corrupt-plugin --runtime --json >/tmp/autopus-corrupt-plugin-before.json
unset NPM_CONFIG_REGISTRY npm_config_registry

plugin_dir="$(
  node -e '
    const fs = require("node:fs");
    const payload = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
    const installPath = payload.install?.installPath ?? payload.plugin?.rootDir;
    if (!installPath) {
      throw new Error("missing plugin install path in inspect output");
    }
    process.stdout.write(installPath);
  ' /tmp/autopus-corrupt-plugin-before.json
)"
rm -f "$plugin_dir/package.json"
if [ -f "$plugin_dir/package.json" ]; then
  echo "Expected corrupt plugin package.json to be removed before update." >&2
  exit 1
fi

echo "Updating Autopus with corrupt plugin present..."
set +e
node "$entry" update --channel beta --tag "${AUTOPUS_CURRENT_PACKAGE_TGZ:?missing AUTOPUS_CURRENT_PACKAGE_TGZ}" --yes --no-restart --json >/tmp/autopus-update-corrupt-plugin.json 2>/tmp/autopus-update-corrupt-plugin.err
update_status=$?
set -e
if [ "$update_status" -ne 0 ]; then
  if ! node scripts/e2e/lib/plugin-update/probe.mjs assert-legacy-post-update-plugin-failure /tmp/autopus-update-corrupt-plugin.json; then
    echo "autopus update failed with corrupt plugin present" >&2
    cat /tmp/autopus-update-corrupt-plugin.err >&2 || true
    cat /tmp/autopus-update-corrupt-plugin.json >&2 || true
    exit "$update_status"
  fi
  echo "Legacy updater reported post-update plugin failure after installing the new core; verifying updated entrypoint..."
  set +e
  AUTOPUS_UPDATE_POST_CORE=1 \
    AUTOPUS_UPDATE_POST_CORE_CHANNEL=beta \
    AUTOPUS_UPDATE_POST_CORE_RESULT_PATH=/tmp/autopus-update-corrupt-plugin-post-core.json \
    node "$entry" update --yes --no-restart --json >/tmp/autopus-update-corrupt-plugin-post-core.stdout 2>/tmp/autopus-update-corrupt-plugin-post-core.err
  post_core_status=$?
  set -e
  if [ "$post_core_status" -ne 0 ]; then
    echo "updated Autopus entry failed post-core plugin verification" >&2
    cat /tmp/autopus-update-corrupt-plugin-post-core.err >&2 || true
    cat /tmp/autopus-update-corrupt-plugin-post-core.stdout >&2 || true
    cat /tmp/autopus-update-corrupt-plugin-post-core.json >&2 || true
    exit "$post_core_status"
  fi
  node scripts/e2e/lib/plugin-update/probe.mjs assert-corrupt-plugin-result /tmp/autopus-update-corrupt-plugin-post-core.json demo-corrupt-plugin
  exit 0
fi

if ! node scripts/e2e/lib/plugin-update/probe.mjs assert-corrupt-update /tmp/autopus-update-corrupt-plugin.json demo-corrupt-plugin; then
  echo "corrupt update JSON payload:" >&2
  cat /tmp/autopus-update-corrupt-plugin.json >&2 || true
  echo "corrupt update stderr:" >&2
  cat /tmp/autopus-update-corrupt-plugin.err >&2 || true
  exit 1
fi
