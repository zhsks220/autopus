import type { Command } from "commander";
import { sandboxExplainCommand } from "../commands/sandbox-explain.js";
import { sandboxListCommand, sandboxRecreateCommand } from "../commands/sandbox.js";
import { t } from "../i18n/cli/translate.js";
import { defaultRuntime } from "../runtime.js";
import { formatDocsLink } from "../terminal/links.js";
import { theme } from "../terminal/theme.js";
import { formatHelpExamples } from "./help-format.js";

// --- Types ---

type CommandOptions = Record<string, unknown>;

// --- Helpers ---

const SANDBOX_EXAMPLES = {
  main: [
    ["autopus sandbox list", "List all sandbox containers."],
    ["autopus sandbox list --browser", "List only browser containers."],
    ["autopus sandbox recreate --all", "Recreate all containers."],
    ["autopus sandbox recreate --session main", "Recreate a specific session."],
    ["autopus sandbox recreate --agent mybot", "Recreate agent containers."],
    ["autopus sandbox explain", "Explain effective sandbox config."],
  ],
  list: [
    ["autopus sandbox list", "List all sandbox containers."],
    ["autopus sandbox list --browser", "List only browser containers."],
    ["autopus sandbox list --json", "JSON output."],
  ],
  recreate: [
    ["autopus sandbox recreate --all", "Recreate all containers."],
    ["autopus sandbox recreate --session main", "Recreate a specific session."],
    ["autopus sandbox recreate --agent mybot", "Recreate a specific agent (includes sub-agents)."],
    ["autopus sandbox recreate --browser --all", "Recreate only browser containers."],
    ["autopus sandbox recreate --all --force", "Skip confirmation."],
  ],
  explain: [
    ["autopus sandbox explain", "Show effective sandbox config."],
    ["autopus sandbox explain --session agent:main:main", "Explain a specific session."],
    ["autopus sandbox explain --agent work", "Explain an agent sandbox."],
    ["autopus sandbox explain --json", "JSON output."],
  ],
} as const;

function createRunner(
  commandFn: (opts: CommandOptions, runtime: typeof defaultRuntime) => Promise<void>,
) {
  return async (opts: CommandOptions) => {
    try {
      await commandFn(opts, defaultRuntime);
    } catch (err) {
      defaultRuntime.error(String(err));
      defaultRuntime.exit(1);
    }
  };
}

// --- Registration ---

export function registerSandboxCli(program: Command) {
  const sandbox = program
    .command("sandbox")
    .description(t("desc.manage_sandbox_containers_docker_based_agent_isolation"))
    .addHelpText(
      "after",
      () => `\n${theme.heading("Examples:")}\n${formatHelpExamples(SANDBOX_EXAMPLES.main)}\n`,
    )
    .addHelpText(
      "after",
      () =>
        `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/sandbox", "docs.autopus.ai/cli/sandbox")}\n`,
    )
    .action(() => {
      sandbox.help({ error: true });
    });

  // --- List Command ---

  sandbox
    .command("list")
    .description(t("desc.list_sandbox_containers_and_their_status"))
    .option("--json", t("opt.output_result_as_json"), false)
    .option("--browser", t("opt.list_browser_containers_only"), false)
    .addHelpText(
      "after",
      () =>
        `\n${theme.heading("Examples:")}\n${formatHelpExamples(SANDBOX_EXAMPLES.list)}\n\n${theme.heading(
          "Output includes:",
        )}\n${theme.muted("- Container name and status (running/stopped)")}\n${theme.muted(
          "- Docker image and whether it matches current config",
        )}\n${theme.muted("- Age (time since creation)")}\n${theme.muted(
          "- Idle time (time since last use)",
        )}\n${theme.muted("- Associated session/agent ID")}`,
    )
    .action(
      createRunner((opts) =>
        sandboxListCommand(
          {
            browser: Boolean(opts.browser),
            json: Boolean(opts.json),
          },
          defaultRuntime,
        ),
      ),
    );

  // --- Recreate Command ---

  sandbox
    .command("recreate")
    .description(t("desc.remove_containers_to_force_recreation_with_updated_config"))
    .option("--all", t("opt.recreate_all_sandbox_containers"), false)
    .option("--session <key>", t("opt.recreate_container_for_specific_session"))
    .option("--agent <id>", t("opt.recreate_containers_for_specific_agent"))
    .option("--browser", t("opt.only_recreate_browser_containers"), false)
    .option("--force", t("opt.skip_confirmation_prompt"), false)
    .addHelpText(
      "after",
      () =>
        `\n${theme.heading("Examples:")}\n${formatHelpExamples(SANDBOX_EXAMPLES.recreate)}\n\n${theme.heading(
          "Why use this?",
        )}\n${theme.muted(
          "After updating Docker images or sandbox configuration, existing containers continue running with old settings.",
        )}\n${theme.muted(
          "This command removes them so they'll be recreated automatically with current config when next needed.",
        )}\n\n${theme.heading("Filter options:")}\n${theme.muted(
          "  --all          Remove all sandbox containers",
        )}\n${theme.muted(
          "  --session      Remove container for specific session key",
        )}\n${theme.muted(
          "  --agent        Remove containers for agent (includes agent:id:* variants)",
        )}\n\n${theme.heading("Modifiers:")}\n${theme.muted(
          "  --browser      Only affect browser containers (not regular sandbox)",
        )}\n${theme.muted("  --force        Skip confirmation prompt")}`,
    )
    .action(
      createRunner((opts) =>
        sandboxRecreateCommand(
          {
            all: Boolean(opts.all),
            session: opts.session as string | undefined,
            agent: opts.agent as string | undefined,
            browser: Boolean(opts.browser),
            force: Boolean(opts.force),
          },
          defaultRuntime,
        ),
      ),
    );

  // --- Explain Command ---

  sandbox
    .command("explain")
    .description(t("desc.explain_effective_sandbox_tool_policy_for_a_session_agent"))
    .option("--session <key>", t("opt.session_key_to_inspect_defaults_to_agent_main"))
    .option("--agent <id>", t("opt.agent_id_to_inspect_defaults_to_derived_agent"))
    .option("--json", t("opt.output_result_as_json"), false)
    .addHelpText(
      "after",
      () => `\n${theme.heading("Examples:")}\n${formatHelpExamples(SANDBOX_EXAMPLES.explain)}\n`,
    )
    .action(
      createRunner((opts) =>
        sandboxExplainCommand(
          {
            session: opts.session as string | undefined,
            agent: opts.agent as string | undefined,
            json: Boolean(opts.json),
          },
          defaultRuntime,
        ),
      ),
    );
}
