import type { Command } from "commander";
import { agentCliCommand } from "../../commands/agent-via-gateway.js";
import {
  agentsAddCommand,
  agentsBindingsCommand,
  agentsBindCommand,
  agentsDeleteCommand,
  agentsListCommand,
  agentsSetIdentityCommand,
  agentsUnbindCommand,
} from "../../commands/agents.js";
import { setVerbose } from "../../globals.js";
import { t } from "../../i18n/cli/translate.js";
import { defaultRuntime } from "../../runtime.js";
import { normalizeLowercaseStringOrEmpty } from "../../shared/string-coerce.js";
import { formatDocsLink } from "../../terminal/links.js";
import { theme } from "../../terminal/theme.js";
import { runCommandWithRuntime } from "../cli-utils.js";
import { hasExplicitOptions } from "../command-options.js";
import { createDefaultDeps } from "../deps.js";
import { formatHelpExamples } from "../help-format.js";
import { collectOption } from "./helpers.js";

export function registerAgentCommands(program: Command, args: { agentChannelOptions: string }) {
  program
    .command("agent")
    .description(t("desc.run_an_agent_turn_via_the_gateway_use_local_for_embedded"))
    .requiredOption("-m, --message <text>", "Message body for the agent")
    .option("-t, --to <number>", t("opt.recipient_number_in_e_164_used_to_derive_the_session_key"))
    .option("--session-id <id>", t("opt.use_an_explicit_session_id"))
    .option("--agent <id>", t("opt.agent_id_overrides_routing_bindings"))
    .option("--model <id>", t("opt.model_override_for_this_run_provider_model_or_model_id"))
    .option(
      "--thinking <level>",
      "Thinking level: off | minimal | low | medium | high | xhigh | adaptive | max where supported",
    )
    .option("--verbose <on|off>", t("opt.persist_agent_verbose_level_for_the_session"))
    .option(
      "--channel <channel>",
      `Delivery channel: ${args.agentChannelOptions} (omit to use the main session channel)`,
    )
    .option("--reply-to <target>", t("opt.delivery_target_override_separate_from_session_routing"))
    .option("--reply-channel <channel>", t("opt.delivery_channel_override_separate_from_routing"))
    .option("--reply-account <id>", t("opt.delivery_account_id_override"))
    .option(
      "--local",
      "Run the embedded agent locally (requires model provider API keys in your shell)",
      false,
    )
    .option("--deliver", t("opt.send_the_agent_s_reply_back_to_the_selected_channel"), false)
    .option("--json", t("opt.output_result_as_json"), false)
    .option(
      "--timeout <seconds>",
      "Override agent command timeout (seconds, default 600 or config value)",
    )
    .addHelpText(
      "after",
      () =>
        `
${theme.heading("Examples:")}
${formatHelpExamples([
  ['autopus agent --to +15555550123 --message "status update"', "Start a new session."],
  ['autopus agent --agent ops --message "Summarize logs"', "Use a specific agent."],
  [
    'autopus agent --session-id 1234 --message "Summarize inbox" --thinking medium',
    "Target a session with explicit thinking level.",
  ],
  [
    'autopus agent --to +15555550123 --message "Trace logs" --verbose on --json',
    "Enable verbose logging and JSON output.",
  ],
  ['autopus agent --to +15555550123 --message "Summon reply" --deliver', "Deliver reply."],
  [
    'autopus agent --agent ops --message "Generate report" --deliver --reply-channel slack --reply-to "#reports"',
    "Send reply to a different channel/target.",
  ],
])}

${theme.muted("Docs:")} ${formatDocsLink("/cli/agent", "docs.autopus.ai/cli/agent")}`,
    )
    .action(async (opts) => {
      const verboseLevel =
        typeof opts.verbose === "string" ? normalizeLowercaseStringOrEmpty(opts.verbose) : "";
      setVerbose(verboseLevel === "on");
      // Build default deps (keeps parity with other commands; future-proofing).
      const deps = createDefaultDeps();
      await runCommandWithRuntime(defaultRuntime, async () => {
        await agentCliCommand(opts, defaultRuntime, deps);
      });
    });

  const agents = program
    .command("agents")
    .description(t("desc.manage_isolated_agents_workspaces_auth_routing"))
    .addHelpText(
      "after",
      () =>
        `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/agents", "docs.autopus.ai/cli/agents")}\n`,
    );

  agents
    .command("list")
    .description(t("desc.list_configured_agents"))
    .option("--json", t("opt.output_json_instead_of_text"), false)
    .option("--bindings", t("opt.include_routing_bindings"), false)
    .action(async (opts) => {
      await runCommandWithRuntime(defaultRuntime, async () => {
        await agentsListCommand(
          { json: Boolean(opts.json), bindings: Boolean(opts.bindings) },
          defaultRuntime,
        );
      });
    });

  agents
    .command("bindings")
    .description(t("desc.list_routing_bindings"))
    .option("--agent <id>", t("opt.filter_by_agent_id"))
    .option("--json", t("opt.output_json_instead_of_text"), false)
    .action(async (opts) => {
      await runCommandWithRuntime(defaultRuntime, async () => {
        await agentsBindingsCommand(
          {
            agent: opts.agent as string | undefined,
            json: Boolean(opts.json),
          },
          defaultRuntime,
        );
      });
    });

  agents
    .command("bind")
    .description(t("desc.add_routing_bindings_for_an_agent"))
    .option("--agent <id>", t("opt.agent_id_defaults_to_current_default_agent"))
    .option(
      "--bind <channel[:accountId]>",
      "Binding to add (repeatable). If omitted, accountId is resolved by channel defaults/hooks.",
      collectOption,
      [],
    )
    .option("--json", t("opt.output_json_summary"), false)
    .action(async (opts) => {
      await runCommandWithRuntime(defaultRuntime, async () => {
        await agentsBindCommand(
          {
            agent: opts.agent as string | undefined,
            bind: Array.isArray(opts.bind) ? (opts.bind as string[]) : undefined,
            json: Boolean(opts.json),
          },
          defaultRuntime,
        );
      });
    });

  agents
    .command("unbind")
    .description(t("desc.remove_routing_bindings_for_an_agent"))
    .option("--agent <id>", t("opt.agent_id_defaults_to_current_default_agent"))
    .option(
      "--bind <channel[:accountId]>",
      t("opt.binding_to_remove_repeatable"),
      collectOption,
      [],
    )
    .option("--all", t("opt.remove_all_bindings_for_this_agent"), false)
    .option("--json", t("opt.output_json_summary"), false)
    .action(async (opts) => {
      await runCommandWithRuntime(defaultRuntime, async () => {
        await agentsUnbindCommand(
          {
            agent: opts.agent as string | undefined,
            bind: Array.isArray(opts.bind) ? (opts.bind as string[]) : undefined,
            all: Boolean(opts.all),
            json: Boolean(opts.json),
          },
          defaultRuntime,
        );
      });
    });

  agents
    .command("add [name]")
    .description(t("desc.add_a_new_isolated_agent"))
    .option("--workspace <dir>", t("opt.workspace_directory_for_the_new_agent"))
    .option("--model <id>", t("opt.model_id_for_this_agent"))
    .option("--agent-dir <dir>", t("opt.agent_state_directory_for_this_agent"))
    .option(
      "--bind <channel[:accountId]>",
      t("opt.route_channel_binding_repeatable"),
      collectOption,
      [],
    )
    .option("--non-interactive", t("opt.disable_prompts_requires_workspace"), false)
    .option("--json", t("opt.output_json_summary"), false)
    .action(async (name, opts, command) => {
      await runCommandWithRuntime(defaultRuntime, async () => {
        const hasFlags = hasExplicitOptions(command, [
          "workspace",
          "model",
          "agentDir",
          "bind",
          "nonInteractive",
        ]);
        await agentsAddCommand(
          {
            name: typeof name === "string" ? name : undefined,
            workspace: opts.workspace as string | undefined,
            model: opts.model as string | undefined,
            agentDir: opts.agentDir as string | undefined,
            bind: Array.isArray(opts.bind) ? (opts.bind as string[]) : undefined,
            nonInteractive: Boolean(opts.nonInteractive),
            json: Boolean(opts.json),
          },
          defaultRuntime,
          { hasFlags },
        );
      });
    });

  agents
    .command("set-identity")
    .description(t("desc.update_an_agent_identity_name_theme_emoji_avatar"))
    .option("--agent <id>", t("opt.agent_id_to_update"))
    .option("--workspace <dir>", t("opt.workspace_directory_used_to_locate_the_agent_identity_md"))
    .option("--identity-file <path>", t("opt.explicit_identity_md_path_to_read"))
    .option("--from-identity", t("opt.read_values_from_identity_md"), false)
    .option("--name <name>", t("opt.identity_name"))
    .option("--theme <theme>", t("opt.identity_theme"))
    .option("--emoji <emoji>", t("opt.identity_emoji"))
    .option("--avatar <value>", t("opt.identity_avatar_workspace_path_http_s_url_or_data_uri"))
    .option("--json", t("opt.output_json_summary"), false)
    .addHelpText(
      "after",
      () =>
        `
${theme.heading("Examples:")}
${formatHelpExamples([
  ['autopus agents set-identity --agent main --name "Autopus" --emoji "🐙"', "Set name + emoji."],
  ["autopus agents set-identity --agent main --avatar avatars/autopus.png", "Set avatar path."],
  [
    "autopus agents set-identity --workspace ~/.autopus/workspace --from-identity",
    "Load from IDENTITY.md.",
  ],
  [
    "autopus agents set-identity --identity-file ~/.autopus/workspace/IDENTITY.md --agent main",
    "Use a specific IDENTITY.md.",
  ],
])}
`,
    )
    .action(async (opts) => {
      await runCommandWithRuntime(defaultRuntime, async () => {
        await agentsSetIdentityCommand(
          {
            agent: opts.agent as string | undefined,
            workspace: opts.workspace as string | undefined,
            identityFile: opts.identityFile as string | undefined,
            fromIdentity: Boolean(opts.fromIdentity),
            name: opts.name as string | undefined,
            theme: opts.theme as string | undefined,
            emoji: opts.emoji as string | undefined,
            avatar: opts.avatar as string | undefined,
            json: Boolean(opts.json),
          },
          defaultRuntime,
        );
      });
    });

  agents
    .command("delete <id>")
    .description(t("desc.delete_an_agent_and_prune_workspace_state"))
    .option("--force", t("opt.skip_confirmation"), false)
    .option("--json", t("opt.output_json_summary"), false)
    .action(async (id, opts) => {
      await runCommandWithRuntime(defaultRuntime, async () => {
        await agentsDeleteCommand(
          {
            id: String(id),
            force: Boolean(opts.force),
            json: Boolean(opts.json),
          },
          defaultRuntime,
        );
      });
    });

  agents.action(async () => {
    await runCommandWithRuntime(defaultRuntime, async () => {
      await agentsListCommand({}, defaultRuntime);
    });
  });
}
