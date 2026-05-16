---
summary: "CLI reference for `autopus skills` (search/install/update/list/info/check)"
read_when:
  - You want to see which skills are available and ready to run
  - You want to search, install, or update skills from ClawHub
  - You want to debug missing binaries/env/config for skills
title: "Skills"
---

# `autopus skills`

Inspect local skills and install/update skills from ClawHub.

Related:

- Skills system: [Skills](/tools/skills)
- Skills config: [Skills config](/tools/skills-config)
- ClawHub installs: [ClawHub](/clawhub/cli)

## Commands

```bash
autopus skills search "calendar"
autopus skills search --limit 20 --json
autopus skills install <slug>
autopus skills install <slug> --version <version>
autopus skills install <slug> --force
autopus skills install <slug> --agent <id>
autopus skills update <slug>
autopus skills update --all
autopus skills update --all --agent <id>
autopus skills list
autopus skills list --eligible
autopus skills list --json
autopus skills list --verbose
autopus skills list --agent <id>
autopus skills info <name>
autopus skills info <name> --json
autopus skills info <name> --agent <id>
autopus skills check
autopus skills check --agent <id>
autopus skills check --json
```

`search`/`install`/`update` use ClawHub directly and install into the active
workspace `skills/` directory. `list`/`info`/`check` still inspect the local
skills visible to the current workspace and config. Workspace-backed commands
resolve the target workspace from `--agent <id>`, then the current working
directory when it is inside a configured agent workspace, then the default
agent.

This CLI `install` command downloads skill folders from ClawHub. Gateway-backed
skill dependency installs triggered from onboarding or Skills settings use the
separate `skills.install` request path instead.

Notes:

- `search [query...]` accepts an optional query; omit it to browse the default
  ClawHub search feed.
- `search --limit <n>` caps returned results.
- `install --force` overwrites an existing workspace skill folder for the same
  slug.
- `--agent <id>` targets one configured agent workspace and overrides current
  working directory inference.
- `update --all` only updates tracked ClawHub installs in the active workspace.
- `check --agent <id>` checks the selected agent's workspace and reports which
  ready skills are actually visible to that agent's prompt or command surface.
- `list` is the default action when no subcommand is provided.
- `list`, `info`, and `check` write their rendered output to stdout. With
  `--json`, that means the machine-readable payload stays on stdout for pipes
  and scripts.

## Related

- [CLI reference](/cli)
- [Skills](/tools/skills)
