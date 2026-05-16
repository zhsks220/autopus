---
summary: "Run Autopus in a rootless Podman container"
read_when:
  - You want a containerized gateway with Podman instead of Docker
title: "Podman"
---

Run the Autopus Gateway in a rootless Podman container, managed by your current non-root user.

The intended model is:

- Podman runs the gateway container.
- Your host `autopus` CLI is the control plane.
- Persistent state lives on the host under `~/.autopus` by default.
- Day-to-day management uses `autopus --container <name> ...` instead of `sudo -u autopus`, `podman exec`, or a separate service user.

## Prerequisites

- **Podman** in rootless mode
- **Autopus CLI** installed on the host
- **Optional:** `systemd --user` if you want Quadlet-managed auto-start
- **Optional:** `sudo` only if you want `loginctl enable-linger "$(whoami)"` for boot persistence on a headless host

## Quick start

<Steps>
  <Step title="One-time setup">
    From the repo root, run `./scripts/podman/setup.sh`.
  </Step>

  <Step title="Start the Gateway container">
    Start the container with `./scripts/run-autopus-podman.sh launch`.
  </Step>

  <Step title="Run onboarding inside the container">
    Run `./scripts/run-autopus-podman.sh launch setup`, then open `http://127.0.0.1:18789/`.
  </Step>

  <Step title="Manage the running container from the host CLI">
    Set `AUTOPUS_CONTAINER=autopus`, then use normal `autopus` commands from the host.
  </Step>
</Steps>

Setup details:

- `./scripts/podman/setup.sh` builds `autopus:local` in your rootless Podman store by default, or uses `AUTOPUS_IMAGE` / `AUTOPUS_PODMAN_IMAGE` if you set one.
- It creates `~/.autopus/autopus.json` with `gateway.mode: "local"` if missing.
- It creates `~/.autopus/.env` with `AUTOPUS_GATEWAY_TOKEN` if missing.
- For manual launches, the helper reads only a small allowlist of Podman-related keys from `~/.autopus/.env` and passes explicit runtime env vars to the container; it does not hand the full env file to Podman.

Quadlet-managed setup:

```bash
./scripts/podman/setup.sh --quadlet
```

Quadlet is a Linux-only option because it depends on systemd user services.

You can also set `AUTOPUS_PODMAN_QUADLET=1`.

Optional build/setup env vars:

- `AUTOPUS_IMAGE` or `AUTOPUS_PODMAN_IMAGE` -- use an existing/pulled image instead of building `autopus:local`
- `AUTOPUS_DOCKER_APT_PACKAGES` -- install extra apt packages during image build
- `AUTOPUS_EXTENSIONS` -- pre-install plugin dependencies at build time
- `AUTOPUS_INSTALL_BROWSER` -- pre-install Chromium and Xvfb for browser automation (set to `1` to enable)

Container start:

```bash
./scripts/run-autopus-podman.sh launch
```

The script starts the container as your current uid/gid with `--userns=keep-id` and bind-mounts your Autopus state into the container.

Onboarding:

```bash
./scripts/run-autopus-podman.sh launch setup
```

Then open `http://127.0.0.1:18789/` and use the token from `~/.autopus/.env`.

Host CLI default:

```bash
export AUTOPUS_CONTAINER=autopus
```

Then commands such as these will run inside that container automatically:

```bash
autopus dashboard --no-open
autopus gateway status --deep   # includes extra service scan
autopus doctor
autopus channels login
```

On macOS, Podman machine may make the browser appear non-local to the gateway.
If the Control UI reports device-auth errors after launch, use the Tailscale guidance in
[Podman and Tailscale](#podman--tailscale).

<a id="podman--tailscale"></a>

## Podman and Tailscale

For HTTPS or remote browser access, follow the main Tailscale docs.

Podman-specific note:

- Keep the Podman publish host at `127.0.0.1`.
- Prefer host-managed `tailscale serve` over `autopus gateway --tailscale serve`.
- On macOS, if local browser device-auth context is unreliable, use Tailscale access instead of ad hoc local tunnel workarounds.

See:

- [Tailscale](/gateway/tailscale)
- [Control UI](/web/control-ui)

## Systemd (Quadlet, optional)

If you ran `./scripts/podman/setup.sh --quadlet`, setup installs a Quadlet file at:

```bash
~/.config/containers/systemd/autopus.container
```

Useful commands:

- **Start:** `systemctl --user start autopus.service`
- **Stop:** `systemctl --user stop autopus.service`
- **Status:** `systemctl --user status autopus.service`
- **Logs:** `journalctl --user -u autopus.service -f`

After editing the Quadlet file:

```bash
systemctl --user daemon-reload
systemctl --user restart autopus.service
```

For boot persistence on SSH/headless hosts, enable lingering for your current user:

```bash
sudo loginctl enable-linger "$(whoami)"
```

## Config, env, and storage

- **Config dir:** `~/.autopus`
- **Workspace dir:** `~/.autopus/workspace`
- **Token file:** `~/.autopus/.env`
- **Launch helper:** `./scripts/run-autopus-podman.sh`

The launch script and Quadlet bind-mount host state into the container:

- `AUTOPUS_CONFIG_DIR` -> `/home/node/.autopus`
- `AUTOPUS_WORKSPACE_DIR` -> `/home/node/.autopus/workspace`

By default those are host directories, not anonymous container state, so
`autopus.json`, per-agent `auth-profiles.json`, channel/provider state,
sessions, and workspace survive container replacement.
The Podman setup also seeds `gateway.controlUi.allowedOrigins` for `127.0.0.1` and `localhost` on the published gateway port so the local dashboard works with the container's non-loopback bind.

Useful env vars for the manual launcher:

- `AUTOPUS_PODMAN_CONTAINER` -- container name (`autopus` by default)
- `AUTOPUS_PODMAN_IMAGE` / `AUTOPUS_IMAGE` -- image to run
- `AUTOPUS_PODMAN_GATEWAY_HOST_PORT` -- host port mapped to container `18789`
- `AUTOPUS_PODMAN_BRIDGE_HOST_PORT` -- host port mapped to container `18790`
- `AUTOPUS_PODMAN_PUBLISH_HOST` -- host interface for published ports; default is `127.0.0.1`
- `AUTOPUS_GATEWAY_BIND` -- gateway bind mode inside the container; default is `lan`
- `AUTOPUS_PODMAN_USERNS` -- `keep-id` (default), `auto`, or `host`

The manual launcher reads `~/.autopus/.env` before finalizing container/image defaults, so you can persist these there.

If you use a non-default `AUTOPUS_CONFIG_DIR` or `AUTOPUS_WORKSPACE_DIR`, set the same variables for both `./scripts/podman/setup.sh` and later `./scripts/run-autopus-podman.sh launch` commands. The repo-local launcher does not persist custom path overrides across shells.

Quadlet note:

- The generated Quadlet service intentionally keeps a fixed, hardened default shape: `127.0.0.1` published ports, `--bind lan` inside the container, and `keep-id` user namespace.
- It pins `AUTOPUS_NO_RESPAWN=1`, `Restart=on-failure`, and `TimeoutStartSec=300`.
- It publishes both `127.0.0.1:18789:18789` (gateway) and `127.0.0.1:18790:18790` (bridge).
- It reads `~/.autopus/.env` as a runtime `EnvironmentFile` for values such as `AUTOPUS_GATEWAY_TOKEN`, but it does not consume the manual launcher's Podman-specific override allowlist.
- If you need custom publish ports, publish host, or other container-run flags, use the manual launcher or edit `~/.config/containers/systemd/autopus.container` directly, then reload and restart the service.

## Useful commands

- **Container logs:** `podman logs -f autopus`
- **Stop container:** `podman stop autopus`
- **Remove container:** `podman rm -f autopus`
- **Open dashboard URL from host CLI:** `autopus dashboard --no-open`
- **Health/status via host CLI:** `autopus gateway status --deep` (RPC probe + extra
  service scan)

## Troubleshooting

- **Permission denied (EACCES) on config or workspace:** The container runs with `--userns=keep-id` and `--user <your uid>:<your gid>` by default. Ensure the host config/workspace paths are owned by your current user.
- **Gateway start blocked (missing `gateway.mode=local`):** Ensure `~/.autopus/autopus.json` exists and sets `gateway.mode="local"`. `scripts/podman/setup.sh` creates this if missing.
- **Container CLI commands hit the wrong target:** Use `autopus --container <name> ...` explicitly, or export `AUTOPUS_CONTAINER=<name>` in your shell.
- **`autopus update` fails with `--container`:** Expected. Rebuild/pull the image, then restart the container or the Quadlet service.
- **Quadlet service does not start:** Run `systemctl --user daemon-reload`, then `systemctl --user start autopus.service`. On headless systems you may also need `sudo loginctl enable-linger "$(whoami)"`.
- **SELinux blocks bind mounts:** Leave the default mount behavior alone; the launcher auto-adds `:Z` on Linux when SELinux is enforcing or permissive.

## Related

- [Docker](/install/docker)
- [Gateway background process](/gateway/background-process)
- [Gateway troubleshooting](/gateway/troubleshooting)
