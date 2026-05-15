#!/usr/bin/env bash
set -euo pipefail

cd /repo

export AUTOPUS_STATE_DIR="/tmp/autopus-test"
export AUTOPUS_CONFIG_PATH="${AUTOPUS_STATE_DIR}/autopus.json"

echo "==> Build"
if ! pnpm build >/tmp/autopus-cleanup-build.log 2>&1; then
  cat /tmp/autopus-cleanup-build.log
  exit 1
fi

echo "==> Seed state"
mkdir -p "${AUTOPUS_STATE_DIR}/credentials"
mkdir -p "${AUTOPUS_STATE_DIR}/agents/main/sessions"
echo '{}' >"${AUTOPUS_CONFIG_PATH}"
echo 'creds' >"${AUTOPUS_STATE_DIR}/credentials/marker.txt"
echo 'session' >"${AUTOPUS_STATE_DIR}/agents/main/sessions/sessions.json"

echo "==> Reset (config+creds+sessions)"
if ! pnpm autopus reset --scope config+creds+sessions --yes --non-interactive >/tmp/autopus-cleanup-reset.log 2>&1; then
  cat /tmp/autopus-cleanup-reset.log
  exit 1
fi

test ! -f "${AUTOPUS_CONFIG_PATH}"
test ! -d "${AUTOPUS_STATE_DIR}/credentials"
test ! -d "${AUTOPUS_STATE_DIR}/agents/main/sessions"

echo "==> Recreate minimal config"
mkdir -p "${AUTOPUS_STATE_DIR}/credentials"
echo '{}' >"${AUTOPUS_CONFIG_PATH}"

echo "==> Uninstall (state only)"
if ! pnpm autopus uninstall --state --yes --non-interactive >/tmp/autopus-cleanup-uninstall.log 2>&1; then
  cat /tmp/autopus-cleanup-uninstall.log
  exit 1
fi

test ! -d "${AUTOPUS_STATE_DIR}"

echo "OK"
