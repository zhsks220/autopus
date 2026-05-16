import type { Command } from "commander";
import { formatAuthChoiceChoicesForCli } from "../../commands/auth-choice-options.js";
import type { GatewayDaemonRuntime } from "../../commands/daemon-runtime.js";
import { CORE_ONBOARD_AUTH_FLAGS } from "../../commands/onboard-core-auth-flags.js";
import type {
  AuthChoice,
  GatewayAuthChoice,
  GatewayBind,
  NodeManagerChoice,
  ResetScope,
  SecretInputMode,
  TailscaleMode,
} from "../../commands/onboard-types.js";
import { setupWizardCommand } from "../../commands/onboard.js";
import { t } from "../../i18n/cli/translate.js";
import { resolveManifestProviderOnboardAuthFlags } from "../../plugins/provider-auth-choices.js";
import { defaultRuntime } from "../../runtime.js";
import { formatDocsLink } from "../../terminal/links.js";
import { theme } from "../../terminal/theme.js";
import { runCommandWithRuntime } from "../cli-utils.js";

function resolveInstallDaemonFlag(
  command: unknown,
  opts: { installDaemon?: boolean },
): boolean | undefined {
  if (!command || typeof command !== "object") {
    return undefined;
  }
  const getOptionValueSource =
    "getOptionValueSource" in command ? command.getOptionValueSource : undefined;
  if (typeof getOptionValueSource !== "function") {
    return undefined;
  }

  // Commander doesn't support option conflicts natively; keep original behavior.
  // If --skip-daemon is explicitly passed, it wins.
  if (getOptionValueSource.call(command, "skipDaemon") === "cli") {
    return false;
  }
  if (getOptionValueSource.call(command, "installDaemon") === "cli") {
    return Boolean(opts.installDaemon);
  }
  return undefined;
}

const AUTH_CHOICE_HELP = formatAuthChoiceChoicesForCli({
  includeLegacyAliases: true,
  includeSkip: true,
});

type OnboardAuthFlag = {
  readonly cliOption: string;
  readonly description: string;
  readonly optionKey: string;
};

function extractCliFlags(cliOption: string): string[] {
  return cliOption
    .split(/[ ,|]+/)
    .filter((part) => part.startsWith("-"))
    .map((part) => {
      const equalsIndex = part.indexOf("=");
      return equalsIndex === -1 ? part : part.slice(0, equalsIndex);
    });
}

function resolveOnboardAuthFlags(): OnboardAuthFlag[] {
  const seenCliFlags = new Set<string>();
  const flags: OnboardAuthFlag[] = [];
  for (const flag of [...CORE_ONBOARD_AUTH_FLAGS, ...resolveManifestProviderOnboardAuthFlags()]) {
    const cliFlags = extractCliFlags(flag.cliOption);
    if (cliFlags.some((cliFlag) => seenCliFlags.has(cliFlag))) {
      continue;
    }
    for (const cliFlag of cliFlags) {
      seenCliFlags.add(cliFlag);
    }
    flags.push(flag);
  }
  return flags;
}

const ONBOARD_AUTH_FLAGS = resolveOnboardAuthFlags();

function pickOnboardProviderAuthOptionValues(
  opts: Record<string, unknown>,
): Partial<Record<string, string | undefined>> {
  return Object.fromEntries(
    ONBOARD_AUTH_FLAGS.map((flag) => [flag.optionKey, opts[flag.optionKey] as string | undefined]),
  );
}

export function registerOnboardCommand(program: Command) {
  const command = program
    .command("onboard")
    .description(t("desc.guided_setup_for_auth_models_gateway_workspace_channels_and_skills"))
    .addHelpText(
      "after",
      () =>
        `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/onboard", "docs.autopus.ai/cli/onboard")}\n`,
    )
    .option("--workspace <dir>", t("opt.agent_workspace_directory_default_autopus_workspace"))
    .option(
      "--reset",
      "Reset config + credentials + sessions before running onboard (workspace only with --reset-scope full)",
    )
    .option("--reset-scope <scope>", t("opt.reset_scope_config_config_creds_sessions_full"))
    .option("--non-interactive", t("opt.run_without_prompts"), false)
    .option("--modern", t("opt.use_the_conversational_setup_repair_assistant"), false)
    .option(
      "--accept-risk",
      "Acknowledge that agents are powerful and full system access is risky (required for --non-interactive)",
      false,
    )
    .option("--flow <flow>", t("opt.onboard_flow_quickstart_advanced_manual_import"))
    .option("--mode <mode>", t("opt.onboard_mode_local_remote"))
    .option("--auth-choice <choice>", `Auth: ${AUTH_CHOICE_HELP}`)
    .option(
      "--token-provider <id>",
      "Token provider id (non-interactive; used with --auth-choice token)",
    )
    .option("--token <token>", t("opt.token_value_non_interactive_used_with_auth_choice_token"))
    .option(
      "--token-profile-id <id>",
      "Auth profile id (non-interactive; default: <provider>:manual)",
    )
    .option("--token-expires-in <duration>", t("opt.optional_token_expiry_duration_e_g_365d_12h"))
    .option(
      "--secret-input-mode <mode>",
      "API key persistence mode: plaintext|ref (default: plaintext)",
    )
    .option("--cloudflare-ai-gateway-account-id <id>", t("opt.cloudflare_account_id"))
    .option("--cloudflare-ai-gateway-gateway-id <id>", t("opt.cloudflare_ai_gateway_id"));

  for (const providerFlag of ONBOARD_AUTH_FLAGS) {
    command.option(providerFlag.cliOption, providerFlag.description);
  }

  command
    .option("--custom-base-url <url>", t("opt.custom_provider_base_url"))
    .option("--custom-api-key <key>", t("opt.custom_provider_api_key_optional"))
    .option("--custom-model-id <id>", t("opt.custom_provider_model_id"))
    .option(
      "--custom-provider-id <id>",
      t("opt.custom_provider_id_optional_auto_derived_by_default"),
    )
    .option(
      "--custom-compatibility <mode>",
      "Custom provider API compatibility: openai|anthropic (default: openai)",
    )
    .option("--custom-image-input", t("opt.mark_the_custom_provider_model_as_image_capable"))
    .option("--custom-text-input", t("opt.mark_the_custom_provider_model_as_text_only"))
    .option("--gateway-port <port>", t("opt.gateway_port"))
    .option("--gateway-bind <mode>", t("opt.gateway_bind_loopback_tailnet_lan_auto_custom"))
    .option("--gateway-auth <mode>", t("opt.gateway_auth_token_password"))
    .option("--gateway-token <token>", t("opt.gateway_token_token_auth"))
    .option(
      "--gateway-token-ref-env <name>",
      "Gateway token SecretRef env var name (token auth; e.g. AUTOPUS_GATEWAY_TOKEN)",
    )
    .option("--gateway-password <password>", t("opt.gateway_password_password_auth"))
    .option("--remote-url <url>", t("opt.remote_gateway_websocket_url"))
    .option("--remote-token <token>", t("opt.remote_gateway_token_optional"))
    .option("--tailscale <mode>", t("opt.tailscale_off_serve_funnel"))
    .option("--tailscale-reset-on-exit", t("opt.reset_tailscale_serve_funnel_on_exit"))
    .option("--install-daemon", t("opt.install_gateway_service"))
    .option("--no-install-daemon", t("opt.skip_gateway_service_install"))
    .option("--skip-daemon", t("opt.skip_gateway_service_install"))
    .option("--daemon-runtime <runtime>", t("opt.daemon_runtime_node_bun"))
    .option("--skip-channels", t("opt.skip_channel_setup"))
    .option("--skip-skills", t("opt.skip_skills_setup"))
    .option("--skip-bootstrap", t("opt.skip_creating_default_agent_workspace_files"))
    .option("--skip-search", t("opt.skip_search_provider_setup"))
    .option("--skip-health", t("opt.skip_health_check"))
    .option("--skip-ui", t("opt.skip_control_ui_tui_prompts"))
    .option("--skip-hooks", t("opt.skip_hook_setup"))
    .option("--node-manager <name>", t("opt.node_manager_for_skills_npm_pnpm_bun"))
    .option("--import-from <provider>", t("opt.migration_provider_to_run_during_onboarding"))
    .option("--import-source <path>", t("opt.source_agent_home_for_import_from"))
    .option(
      "--import-secrets",
      t("opt.import_supported_secrets_during_onboarding_migration"),
      false,
    )
    .option("--json", t("opt.output_json_summary"), false);

  command.action(async (opts, commandRuntime) => {
    await runCommandWithRuntime(defaultRuntime, async () => {
      if (opts.modern) {
        const { runCrestodian } = await import("../../crestodian/crestodian.js");
        await runCrestodian({
          message: opts.nonInteractive ? "overview" : undefined,
          yes: false,
          json: Boolean(opts.json),
          interactive: !opts.nonInteractive,
        });
        return;
      }
      const installDaemon = resolveInstallDaemonFlag(commandRuntime, {
        installDaemon: Boolean(opts.installDaemon),
      });
      const gatewayPort =
        typeof opts.gatewayPort === "string" ? Number.parseInt(opts.gatewayPort, 10) : undefined;
      const providerAuthOptionValues = pickOnboardProviderAuthOptionValues(
        opts as Record<string, unknown>,
      );
      await setupWizardCommand(
        {
          workspace: opts.workspace as string | undefined,
          nonInteractive: Boolean(opts.nonInteractive),
          acceptRisk: Boolean(opts.acceptRisk),
          flow: opts.flow as "quickstart" | "advanced" | "manual" | "import" | undefined,
          mode: opts.mode as "local" | "remote" | undefined,
          authChoice: opts.authChoice as AuthChoice | undefined,
          tokenProvider: opts.tokenProvider as string | undefined,
          token: opts.token as string | undefined,
          tokenProfileId: opts.tokenProfileId as string | undefined,
          tokenExpiresIn: opts.tokenExpiresIn as string | undefined,
          secretInputMode: opts.secretInputMode as SecretInputMode | undefined,
          ...providerAuthOptionValues,
          cloudflareAiGatewayAccountId: opts.cloudflareAiGatewayAccountId as string | undefined,
          cloudflareAiGatewayGatewayId: opts.cloudflareAiGatewayGatewayId as string | undefined,
          customBaseUrl: opts.customBaseUrl as string | undefined,
          customApiKey: opts.customApiKey as string | undefined,
          customModelId: opts.customModelId as string | undefined,
          customProviderId: opts.customProviderId as string | undefined,
          customCompatibility: opts.customCompatibility as "openai" | "anthropic" | undefined,
          customImageInput:
            opts.customTextInput === true
              ? false
              : opts.customImageInput === true
                ? true
                : undefined,
          gatewayPort:
            typeof gatewayPort === "number" && Number.isFinite(gatewayPort)
              ? gatewayPort
              : undefined,
          gatewayBind: opts.gatewayBind as GatewayBind | undefined,
          gatewayAuth: opts.gatewayAuth as GatewayAuthChoice | undefined,
          gatewayToken: opts.gatewayToken as string | undefined,
          gatewayTokenRefEnv: opts.gatewayTokenRefEnv as string | undefined,
          gatewayPassword: opts.gatewayPassword as string | undefined,
          remoteUrl: opts.remoteUrl as string | undefined,
          remoteToken: opts.remoteToken as string | undefined,
          tailscale: opts.tailscale as TailscaleMode | undefined,
          tailscaleResetOnExit: Boolean(opts.tailscaleResetOnExit),
          reset: Boolean(opts.reset),
          resetScope: opts.resetScope as ResetScope | undefined,
          installDaemon,
          daemonRuntime: opts.daemonRuntime as GatewayDaemonRuntime | undefined,
          skipChannels: Boolean(opts.skipChannels),
          skipSkills: Boolean(opts.skipSkills),
          skipBootstrap: Boolean(opts.skipBootstrap),
          skipSearch: Boolean(opts.skipSearch),
          skipHealth: Boolean(opts.skipHealth),
          skipUi: Boolean(opts.skipUi),
          skipHooks: Boolean(opts.skipHooks),
          nodeManager: opts.nodeManager as NodeManagerChoice | undefined,
          importFrom: opts.importFrom as string | undefined,
          importSource: opts.importSource as string | undefined,
          importSecrets: Boolean(opts.importSecrets),
          json: Boolean(opts.json),
        },
        defaultRuntime,
      );
    });
  });
}
