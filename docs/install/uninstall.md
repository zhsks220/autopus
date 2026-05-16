---
summary: "Uninstall Autopus completely (CLI, service, state, workspace)"
read_when:
  - You want to remove Autopus from a machine
  - The gateway service is still running after uninstall
title: "Uninstall"
---

Two paths:

- **Easy path** if `autopus` is still installed.
- **Manual service removal** if the CLI is gone but the service is still running.

## Easy path (CLI still installed)

Recommended: use the built-in uninstaller:

```bash
autopus uninstall
```

Non-interactive (automation / npx):

```bash
autopus uninstall --all --yes --non-interactive
npx -y autopus uninstall --all --yes --non-interactive
```

Manual steps (same result):

1. Stop the gateway service:

```bash
autopus gateway stop
```

2. Uninstall the gateway service (launchd/systemd/schtasks):

```bash
autopus gateway uninstall
```

3. Delete state + config:

```bash
rm -rf "${AUTOPUS_STATE_DIR:-$HOME/.autopus}"
```

If you set `AUTOPUS_CONFIG_PATH` to a custom location outside the state dir, delete that file too.

4. Delete your workspace (optional, removes agent files):

```bash
rm -rf ~/.autopus/workspace
```

5. Remove the CLI install (pick the one you used):

```bash
npm rm -g autopus
pnpm remove -g autopus
bun remove -g autopus
```

6. If you installed the macOS app:

```bash
rm -rf /Applications/Autopus.app
```

Notes:

- If you used profiles (`--profile` / `AUTOPUS_PROFILE`), repeat step 3 for each state dir (defaults are `~/.autopus-<profile>`).
- In remote mode, the state dir lives on the **gateway host**, so run steps 1-4 there too.

## Manual service removal (CLI not installed)

Use this if the gateway service keeps running but `autopus` is missing.

### macOS (launchd)

Default label is `ai.autopus.gateway` (or `ai.autopus.<profile>`; legacy `com.autopus.*` may still exist):

```bash
launchctl bootout gui/$UID/ai.autopus.gateway
rm -f ~/Library/LaunchAgents/ai.autopus.gateway.plist
```

If you used a profile, replace the label and plist name with `ai.autopus.<profile>`. Remove any legacy `com.autopus.*` plists if present.

### Linux (systemd user unit)

Default unit name is `autopus-gateway.service` (or `autopus-gateway-<profile>.service`):

```bash
systemctl --user disable --now autopus-gateway.service
rm -f ~/.config/systemd/user/autopus-gateway.service
systemctl --user daemon-reload
```

### Windows (Scheduled Task)

Default task name is `Autopus Gateway` (or `Autopus Gateway (<profile>)`).
The task script lives under your state dir.

```powershell
schtasks /Delete /F /TN "Autopus Gateway"
Remove-Item -Force "$env:USERPROFILE\.autopus\gateway.cmd"
```

If you used a profile, delete the matching task name and `~\.autopus-<profile>\gateway.cmd`.

## Normal install vs source checkout

### Normal install (install.sh / npm / pnpm / bun)

If you used `https://autopus.ai/install.sh` or `install.ps1`, the CLI was installed with `npm install -g autopus@latest`.
Remove it with `npm rm -g autopus` (or `pnpm remove -g` / `bun remove -g` if you installed that way).

### Source checkout (git clone)

If you run from a repo checkout (`git clone` + `autopus ...` / `bun run autopus ...`):

1. Uninstall the gateway service **before** deleting the repo (use the easy path above or manual service removal).
2. Delete the repo directory.
3. Remove state + workspace as shown above.

## Related

- [Install overview](/install)
- [Migration guide](/install/migrating)
