---
summary: "CLI reference for `autopus browser` (lifecycle, profiles, tabs, actions, state, and debugging)"
read_when:
  - You use `autopus browser` and want examples for common tasks
  - You want to control a browser running on another machine via a node host
  - You want to attach to your local signed-in Chrome via Chrome MCP
title: "Browser"
---

# `autopus browser`

Manage Autopus's browser control surface and run browser actions (lifecycle, profiles, tabs, snapshots, screenshots, navigation, input, state emulation, and debugging).

Related:

- Browser tool + API: [Browser tool](/tools/browser)

## Common flags

- `--url <gatewayWsUrl>`: Gateway WebSocket URL (defaults to config).
- `--token <token>`: Gateway token (if required).
- `--timeout <ms>`: request timeout (ms).
- `--expect-final`: wait for a final Gateway response.
- `--browser-profile <name>`: choose a browser profile (default from config).
- `--json`: machine-readable output (where supported).

## Quick start (local)

```bash
autopus browser profiles
autopus browser --browser-profile autopus start
autopus browser --browser-profile autopus open https://example.com
autopus browser --browser-profile autopus snapshot
```

Agents can run the same readiness check with `browser({ action: "doctor" })`.

## Quick troubleshooting

If `start` fails with `not reachable after start`, troubleshoot CDP readiness first. If `start` and `tabs` succeed but `open` or `navigate` fails, the browser control plane is healthy and the failure is usually navigation SSRF policy.

Minimal sequence:

```bash
autopus browser --browser-profile autopus doctor
autopus browser --browser-profile autopus start
autopus browser --browser-profile autopus tabs
autopus browser --browser-profile autopus open https://example.com
```

Detailed guidance: [Browser troubleshooting](/tools/browser#cdp-startup-failure-vs-navigation-ssrf-block)

## Lifecycle

```bash
autopus browser status
autopus browser doctor
autopus browser doctor --deep
autopus browser start
autopus browser start --headless
autopus browser stop
autopus browser --browser-profile autopus reset-profile
```

Notes:

- `doctor --deep` adds a live snapshot probe. It is useful when basic CDP
  readiness is green but you want proof that the current tab can be inspected.
- For `attachOnly` and remote CDP profiles, `autopus browser stop` closes the
  active control session and clears temporary emulation overrides even when
  Autopus did not launch the browser process itself.
- For local managed profiles, `autopus browser stop` stops the spawned browser
  process.
- `autopus browser start --headless` applies only to that start request and
  only when Autopus launches a local managed browser. It does not rewrite
  `browser.headless` or profile config, and it is a no-op for an already-running
  browser.
- On Linux hosts without `DISPLAY` or `WAYLAND_DISPLAY`, local managed profiles
  run headless automatically unless `AUTOPUS_BROWSER_HEADLESS=0`,
  `browser.headless=false`, or `browser.profiles.<name>.headless=false`
  explicitly requests a visible browser.

## If the command is missing

If `autopus browser` is an unknown command, check `plugins.allow` in
`~/.autopus/autopus.json`.

When `plugins.allow` is present, list the bundled browser plugin explicitly
unless the config already has a root `browser` block:

```json5
{
  plugins: {
    allow: ["telegram", "browser"],
  },
}
```

An explicit root `browser` block, for example `browser.enabled=true` or
`browser.profiles.<name>`, also activates the bundled browser plugin under a
restrictive plugin allowlist.

Related: [Browser tool](/tools/browser#missing-browser-command-or-tool)

## Profiles

Profiles are named browser routing configs. In practice:

- `autopus`: launches or attaches to a dedicated Autopus-managed Chrome instance (isolated user data dir).
- `user`: controls your existing signed-in Chrome session via Chrome DevTools MCP.
- custom CDP profiles: point at a local or remote CDP endpoint.

```bash
autopus browser profiles
autopus browser create-profile --name work --color "#FF5A36"
autopus browser create-profile --name chrome-live --driver existing-session
autopus browser create-profile --name remote --cdp-url https://browser-host.example.com
autopus browser delete-profile --name work
```

Use a specific profile:

```bash
autopus browser --browser-profile work tabs
```

## Tabs

```bash
autopus browser tabs
autopus browser tab new --label docs
autopus browser tab label t1 docs
autopus browser tab select 2
autopus browser tab close 2
autopus browser open https://docs.autopus.ai --label docs
autopus browser focus docs
autopus browser close t1
```

`tabs` returns `suggestedTargetId` first, then the stable `tabId` such as `t1`,
the optional label, and the raw `targetId`. Agents should pass
`suggestedTargetId` back into `focus`, `close`, snapshots, and actions. You can
assign a label with `open --label`, `tab new --label`, or `tab label`; labels,
tab ids, raw target ids, and unique target-id prefixes are all accepted.
When Chromium replaces the underlying raw target during a navigation or form
submit, Autopus keeps the stable `tabId`/label attached to the replacement tab
when it can prove the match. Raw target ids remain volatile; prefer
`suggestedTargetId`.

## Snapshot / screenshot / actions

Snapshot:

```bash
autopus browser snapshot
autopus browser snapshot --urls
```

Screenshot:

```bash
autopus browser screenshot
autopus browser screenshot --full-page
autopus browser screenshot --ref e12
autopus browser screenshot --labels
```

Notes:

- `--full-page` is for page captures only; it cannot be combined with `--ref`
  or `--element`.
- `existing-session` / `user` profiles support page screenshots and `--ref`
  screenshots from snapshot output, but not CSS `--element` screenshots.
- `--labels` overlays current snapshot refs on the screenshot.
- `snapshot --urls` appends discovered link destinations to AI snapshots so
  agents can choose direct navigation targets instead of guessing from link
  text alone.

Navigate/click/type (ref-based UI automation):

```bash
autopus browser navigate https://example.com
autopus browser click <ref>
autopus browser click-coords 120 340
autopus browser type <ref> "hello"
autopus browser press Enter
autopus browser hover <ref>
autopus browser scrollintoview <ref>
autopus browser drag <startRef> <endRef>
autopus browser select <ref> OptionA OptionB
autopus browser fill --fields '[{"ref":"1","value":"Ada"}]'
autopus browser wait --text "Done"
autopus browser evaluate --fn '(el) => el.textContent' --ref <ref>
```

Action responses return the current raw `targetId` after action-triggered page
replacement when Autopus can prove the replacement tab. Scripts should still
store and pass `suggestedTargetId`/labels for long-lived workflows.

File + dialog helpers:

```bash
autopus browser upload /tmp/autopus/uploads/file.pdf --ref <ref>
autopus browser waitfordownload
autopus browser download <ref> report.pdf
autopus browser dialog --accept
```

Managed Chrome profiles save ordinary click-triggered downloads into the Autopus
downloads directory (`/tmp/autopus/downloads` by default, or the configured temp
root). Use `waitfordownload` or `download` when the agent needs to wait for a
specific file and return its path; those explicit waiters own the next download.

## State and storage

Viewport + emulation:

```bash
autopus browser resize 1280 720
autopus browser set viewport 1280 720
autopus browser set offline on
autopus browser set media dark
autopus browser set timezone Europe/London
autopus browser set locale en-GB
autopus browser set geo 51.5074 -0.1278 --accuracy 25
autopus browser set device "iPhone 14"
autopus browser set headers '{"x-test":"1"}'
autopus browser set credentials myuser mypass
```

Cookies + storage:

```bash
autopus browser cookies
autopus browser cookies set session abc123 --url https://example.com
autopus browser cookies clear
autopus browser storage local get
autopus browser storage local set token abc123
autopus browser storage session clear
```

## Debugging

```bash
autopus browser console --level error
autopus browser pdf
autopus browser responsebody "**/api"
autopus browser highlight <ref>
autopus browser errors --clear
autopus browser requests --filter api
autopus browser trace start
autopus browser trace stop --out trace.zip
```

## Existing Chrome via MCP

Use the built-in `user` profile, or create your own `existing-session` profile:

```bash
autopus browser --browser-profile user tabs
autopus browser create-profile --name chrome-live --driver existing-session
autopus browser create-profile --name brave-live --driver existing-session --user-data-dir "~/Library/Application Support/BraveSoftware/Brave-Browser"
autopus browser --browser-profile chrome-live tabs
```

This path is host-only. For Docker, headless servers, Browserless, or other remote setups, use a CDP profile instead.

Current existing-session limits:

- snapshot-driven actions use refs, not CSS selectors
- `browser.actionTimeoutMs` defaults supported `act` requests to 60000 ms when
  callers omit `timeoutMs`; per-call `timeoutMs` still wins.
- `click` is left-click only
- `type` does not support `slowly=true`
- `press` does not support `delayMs`
- `hover`, `scrollintoview`, `drag`, `select`, `fill`, and `evaluate` reject
  per-call timeout overrides
- `select` supports one value only
- `wait --load networkidle` is not supported
- file uploads require `--ref` / `--input-ref`, do not support CSS
  `--element`, and currently support one file at a time
- dialog hooks do not support `--timeout`
- screenshots support page captures and `--ref`, but not CSS `--element`
- `responsebody`, download interception, PDF export, and batch actions still
  require a managed browser or raw CDP profile

## Remote browser control (node host proxy)

If the Gateway runs on a different machine than the browser, run a **node host** on the machine that has Chrome/Brave/Edge/Chromium. The Gateway will proxy browser actions to that node (no separate browser control server required).

Use `gateway.nodes.browser.mode` to control auto-routing and `gateway.nodes.browser.node` to pin a specific node if multiple are connected.

Security + remote setup: [Browser tool](/tools/browser), [Remote access](/gateway/remote), [Tailscale](/gateway/tailscale), [Security](/gateway/security)

## Related

- [CLI reference](/cli)
- [Browser](/tools/browser)
