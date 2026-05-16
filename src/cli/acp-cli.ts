import type { Command } from "commander";
import { runAcpClientInteractive } from "../acp/client.js";
import { serveAcpGateway } from "../acp/server.js";
import { normalizeAcpProvenanceMode } from "../acp/types.js";
import { t } from "../i18n/cli/translate.js";
import { formatErrorMessage } from "../infra/errors.js";
import { defaultRuntime } from "../runtime.js";
import { formatDocsLink } from "../terminal/links.js";
import { theme } from "../terminal/theme.js";
import { inheritOptionFromParent } from "./command-options.js";
import { resolveGatewayAuthOptions } from "./gateway-secret-options.js";

export function registerAcpCli(program: Command) {
  const acp = program.command("acp").description(t("desc.run_an_acp_bridge_backed_by_the_gateway"));

  acp
    .option(
      "--url <url>",
      t("opt.gateway_websocket_url_defaults_to_gateway_remote_url_when_configured"),
    )
    .option("--token <token>", t("opt.gateway_token_if_required"))
    .option("--token-file <path>", t("opt.read_gateway_token_from_file"))
    .option("--password <password>", t("opt.gateway_password_if_required"))
    .option("--password-file <path>", t("opt.read_gateway_password_from_file"))
    .option("--session <key>", t("opt.default_session_key_e_g_agent_main_main"))
    .option("--session-label <label>", t("opt.default_session_label_to_resolve"))
    .option("--require-existing", t("opt.fail_if_the_session_key_label_does_not_exist"), false)
    .option("--reset-session", t("opt.reset_the_session_key_before_first_use"), false)
    .option("--no-prefix-cwd", t("opt.do_not_prefix_prompts_with_the_working_directory"), false)
    .option("--provenance <mode>", t("opt.acp_provenance_mode_off_meta_or_meta_receipt"))
    .option("-v, --verbose", t("opt.verbose_logging_to_stderr"), false)
    .addHelpText(
      "after",
      () => `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/acp", "docs.autopus.ai/cli/acp")}\n`,
    )
    .action(async (opts) => {
      try {
        const { gatewayToken, gatewayPassword } = resolveGatewayAuthOptions(opts);
        const provenanceMode = normalizeAcpProvenanceMode(opts.provenance as string | undefined);
        if (opts.provenance && !provenanceMode) {
          throw new Error('Invalid --provenance. Use "off", "meta", or "meta+receipt".');
        }
        await serveAcpGateway({
          gatewayUrl: opts.url as string | undefined,
          gatewayToken,
          gatewayPassword,
          defaultSessionKey: opts.session as string | undefined,
          defaultSessionLabel: opts.sessionLabel as string | undefined,
          requireExistingSession: Boolean(opts.requireExisting),
          resetSession: Boolean(opts.resetSession),
          prefixCwd: !opts.noPrefixCwd,
          provenanceMode,
          verbose: Boolean(opts.verbose),
        });
      } catch (err) {
        defaultRuntime.error(`ACP bridge failed: ${formatErrorMessage(err)}`);
        defaultRuntime.exit(1);
      }
    });

  acp
    .command("client")
    .description(t("desc.run_an_interactive_acp_client_against_the_local_acp_bridge"))
    .option("--cwd <dir>", t("opt.working_directory_for_the_acp_session"))
    .option("--server <command>", t("opt.acp_server_command_default_autopus"))
    .option("--server-args <args...>", t("opt.extra_arguments_for_the_acp_server"))
    .option("--server-verbose", t("opt.enable_verbose_logging_on_the_acp_server"), false)
    .option("-v, --verbose", t("opt.verbose_client_logging"), false)
    .action(async (opts, command) => {
      const inheritedVerbose = inheritOptionFromParent<boolean>(command, "verbose");
      try {
        await runAcpClientInteractive({
          cwd: opts.cwd as string | undefined,
          serverCommand: opts.server as string | undefined,
          serverArgs: opts.serverArgs as string[] | undefined,
          serverVerbose: Boolean(opts.serverVerbose),
          verbose: Boolean(opts.verbose || inheritedVerbose),
        });
      } catch (err) {
        defaultRuntime.error(String(err));
        defaultRuntime.exit(1);
      }
    });
}
