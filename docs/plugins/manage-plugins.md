---
summary: "Quick examples for installing, listing, uninstalling, updating, and publishing Autopus plugins"
read_when:
  - You want quick plugin install, list, update, or uninstall examples
  - You want to choose between ClawHub and npm plugin distribution
  - You are publishing a plugin package
title: "Manage plugins"
sidebarTitle: "Manage plugins"
---

Most plugin workflows are a few commands: search, install, restart the Gateway,
verify, and uninstall when you no longer need the plugin.

## List plugins

```bash
autopus plugins list
autopus plugins list --enabled
autopus plugins list --verbose
autopus plugins list --json
```

Use `--json` for scripts. It includes registry diagnostics and each plugin's
static `dependencyStatus` when the plugin package declares `dependencies` or
`optionalDependencies`.

```bash
autopus plugins list --json \
  | jq '.plugins[] | {id, enabled, format, source, dependencyStatus}'
```

`plugins list` is a cold inventory check. It shows what Autopus can discover
from config, manifests, and the plugin registry; it does not prove that an
already-running Gateway process imported the plugin runtime.

## Install plugins

```bash
# Search ClawHub for plugin packages.
autopus plugins search "calendar"

# Bare package specs try ClawHub first, then npm fallback.
autopus plugins install <package>

# Force one source.
autopus plugins install clawhub:<package>
autopus plugins install npm:<package>

# Install a specific version or dist-tag.
autopus plugins install clawhub:<package>@1.2.3
autopus plugins install clawhub:<package>@beta
autopus plugins install npm:@scope/autopus-plugin@1.2.3
autopus plugins install npm:@autopus/codex

# Install from git or a local development checkout.
autopus plugins install git:github.com/acme/autopus-plugin@v1.0.0
autopus plugins install ./my-plugin
autopus plugins install --link ./my-plugin
```

After installing plugin code, restart the Gateway that serves your channels:

```bash
autopus gateway restart
autopus plugins inspect <plugin-id> --runtime --json
```

Use `inspect --runtime` when you need proof that the plugin registered runtime
surfaces such as tools, hooks, services, Gateway methods, or plugin-owned CLI
commands.

## Update plugins

```bash
autopus plugins update <plugin-id>
autopus plugins update <npm-package-or-spec>
autopus plugins update --all
```

If a plugin was installed from an npm dist-tag such as `@beta`, later
`update <plugin-id>` calls reuse that recorded tag. Passing an explicit npm spec
switches the tracked install to that spec for future updates.

```bash
autopus plugins update @scope/autopus-plugin@beta
autopus plugins update @scope/autopus-plugin
```

The second command moves a plugin back to the registry's default release line
when it was previously pinned to an exact version or tag.

When `autopus update` runs on the beta channel, default-line npm and ClawHub
plugin records try the matching plugin `@beta` release first. If that beta
release does not exist, Autopus falls back to the recorded default/latest spec.
For npm plugins, Autopus also falls back when the beta package exists but fails
install validation. Exact versions and explicit tags such as `@rc` or `@beta`
are preserved.

## Uninstall plugins

```bash
autopus plugins uninstall <plugin-id> --dry-run
autopus plugins uninstall <plugin-id>
autopus plugins uninstall <plugin-id> --keep-files
autopus gateway restart
```

Uninstall removes the plugin's config entry, plugin index record, allow/deny list
entries, and linked load paths when applicable. Managed install directories are
removed unless you pass `--keep-files`.

In Nix mode (`AUTOPUS_NIX_MODE=1`), plugin install, update, uninstall, enable,
and disable commands are disabled. Manage those choices in the Nix source for
the install instead; for nix-autopus, use the agent-first
[Quick Start](https://github.com/autopus/nix-autopus#quick-start).

## Publish plugins

You can publish external plugins to [ClawHub](https://clawhub.ai), npmjs.com, or
both.

### Publish to ClawHub

ClawHub is the primary public discovery surface for Autopus plugins. It gives
users searchable metadata, version history, and registry scan results before
install.

```bash
npm i -g clawhub
clawhub login
clawhub package publish your-org/your-plugin --dry-run
clawhub package publish your-org/your-plugin
clawhub package publish your-org/your-plugin@v1.0.0
```

Users install from ClawHub with:

```bash
autopus plugins install clawhub:<package>
autopus plugins install <package>
```

The bare form still checks ClawHub first.

### Publish to npmjs.com

Native npm plugins must include a plugin manifest and `package.json` Autopus
entrypoint metadata.

```json package.json
{
  "name": "@acme/autopus-plugin",
  "version": "1.0.0",
  "type": "module",
  "autopus": {
    "extensions": ["./dist/index.js"]
  }
}
```

```bash
npm publish --access public
```

Users install npm-only with:

```bash
autopus plugins install npm:@acme/autopus-plugin
autopus plugins install npm:@acme/autopus-plugin@beta
autopus plugins install npm:@acme/autopus-plugin@1.0.0
```

If the same package is also available on ClawHub, `npm:` skips ClawHub lookup and
forces npm resolution.

## Source choice

- **ClawHub**: use when you want Autopus-native discovery, scan summaries,
  versions, and install hints.
- **npmjs.com**: use when you already ship JavaScript packages or need npm
  dist-tags/private registry workflows.
- **Git**: use when you want to install directly from a branch, tag, or commit.
- **Local path**: use when you are developing or testing a plugin on the same
  machine.

## Related

- [Plugins](/tools/plugin) - overview and troubleshooting
- [`autopus plugins`](/cli/plugins) - full CLI reference
- [ClawHub](/clawhub/cli) - publish and registry operations
- [Building plugins](/plugins/building-plugins) - create a plugin package
- [Plugin manifest](/plugins/manifest) - manifest and package metadata
