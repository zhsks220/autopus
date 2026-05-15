import type { Command } from "commander";
import { t } from "../i18n/cli/translate.js";
import { defaultRuntime } from "../runtime.js";
import { formatDocsLink } from "../terminal/links.js";
import { theme } from "../terminal/theme.js";
import { parseTimeoutMs } from "./parse-timeout.js";

export function registerTuiCli(program: Command) {
  program
    .command("tui")
    .alias("terminal")
    .alias("chat")
    .description(t("desc.open_a_terminal_ui_connected_to_the_gateway"))
    .option("--local", t("opt.run_against_the_local_embedded_agent_runtime"), false)
    .option(
      "--url <url>",
      t("opt.gateway_websocket_url_defaults_to_gateway_remote_url_when_configured"),
    )
    .option("--token <token>", t("opt.gateway_token_if_required"))
    .option("--password <password>", t("opt.gateway_password_if_required"))
    .option("--session <key>", 'Session key (default: "main", or "global" when scope is global)')
    .option("--deliver", t("opt.deliver_assistant_replies"), false)
    .option("--thinking <level>", t("opt.thinking_level_override"))
    .option("--message <text>", t("opt.send_an_initial_message_after_connecting"))
    .option(
      "--timeout-ms <ms>",
      t("opt.agent_timeout_in_ms_defaults_to_agents_defaults_timeoutseconds"),
    )
    .option("--history-limit <n>", t("opt.history_entries_to_load"), "200")
    .addHelpText(
      "after",
      () => `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/tui", "docs.autopus.ai/cli/tui")}\n`,
    )
    .action(async (opts, cmd) => {
      try {
        // `cmd.name()` always returns the canonical subcommand name (`tui`).
        // Use the parsed parent args to see which alias the user actually typed.
        const invokedSubcommand = cmd.parent?.args[0];
        const invokedAsLocalAlias =
          invokedSubcommand === "terminal" || invokedSubcommand === "chat";
        const isLocal = Boolean(opts.local) || invokedAsLocalAlias;
        if (isLocal && (opts.url || opts.token || opts.password)) {
          throw new Error("--local cannot be combined with --url, --token, or --password");
        }
        const timeoutMs = parseTimeoutMs(opts.timeoutMs);
        if (opts.timeoutMs !== undefined && timeoutMs === undefined) {
          defaultRuntime.error(
            `warning: invalid --timeout-ms "${String(opts.timeoutMs)}"; ignoring`,
          );
        }
        const historyLimit = Number.parseInt(String(opts.historyLimit ?? "200"), 10);
        const { runTui } = await import("../tui/tui.js");
        await runTui({
          local: isLocal,
          url: opts.url as string | undefined,
          token: opts.token as string | undefined,
          password: opts.password as string | undefined,
          session: opts.session as string | undefined,
          deliver: Boolean(opts.deliver),
          thinking: opts.thinking as string | undefined,
          message: opts.message as string | undefined,
          timeoutMs,
          historyLimit: Number.isNaN(historyLimit) ? undefined : historyLimit,
        });
      } catch (err) {
        defaultRuntime.error(String(err));
        defaultRuntime.exit(1);
      }
    });
}
