# Octopus (plugin)

Adds the `octopus` agent tool as an **optional** plugin tool.

## What this is

- Octopus is a standalone workflow shell (typed JSON-first pipelines + approvals/resume).
- This plugin integrates Octopus with Autopus _without core changes_.

## Enable

Because this tool can trigger side effects (via workflows), it is registered with `optional: true`.

Enable it in an agent allowlist:

```json
{
  "agents": {
    "list": [
      {
        "id": "main",
        "tools": {
          "allow": [
            "octopus" // plugin id (enables all tools from this plugin)
          ]
        }
      }
    ]
  }
}
```

## Using `autopus.invoke` (Octopus → Autopus tools)

Some Octopus pipelines may include a `autopus.invoke` step to call back into Autopus tools/plugins (for example: `gog` for Google Workspace, `gh` for GitHub, `message.send`, etc.).

For this to work, the Autopus Gateway must expose the tool bridge endpoint and the target tool must be allowed by policy:

- Autopus provides an HTTP endpoint: `POST /tools/invoke`.
- The request is gated by **gateway auth** (e.g. `Authorization: Bearer …` when token auth is enabled).
- The invoked tool is gated by **tool policy** (global + per-agent + provider + group policy). If the tool is not allowed, Autopus returns `404 Tool not available`.

### Allowlisting recommended

To avoid letting workflows call arbitrary tools, set a tight allowlist on the agent that will be used by `autopus.invoke`.

Example (allow only a small set of tools):

```jsonc
{
  "agents": {
    "list": [
      {
        "id": "main",
        "tools": {
          "allow": ["octopus", "web_fetch", "web_search", "gog", "gh"],
          "deny": ["gateway"],
        },
      },
    ],
  },
}
```

Notes:

- If `tools.allow` is omitted or empty, it behaves like "allow everything (except denied)". For a real allowlist, set a **non-empty** `allow`.
- Tool names depend on which plugins you have installed/enabled.

## Security

- Runs Octopus in process via the published `@clawdbot/lobster/core` runtime.
- Does not manage OAuth/tokens.
- Uses timeouts, stdout caps, and strict JSON envelope parsing.
