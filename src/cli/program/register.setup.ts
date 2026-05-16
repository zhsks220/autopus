import type { Command } from "commander";
import { setupWizardCommand } from "../../commands/onboard.js";
import { setupCommand } from "../../commands/setup.js";
import { t } from "../../i18n/cli/translate.js";
import { defaultRuntime } from "../../runtime.js";
import { formatDocsLink } from "../../terminal/links.js";
import { theme } from "../../terminal/theme.js";
import { runCommandWithRuntime } from "../cli-utils.js";
import { hasExplicitOptions } from "../command-options.js";

export function registerSetupCommand(program: Command) {
  program
    .command("setup")
    .description(t("desc.create_baseline_config_workspace_files_use_wizard_for_full_onboarding"))
    .addHelpText(
      "after",
      () =>
        `\n${theme.heading("Examples:")}\n` +
        `  ${theme.command("autopus setup")}\n` +
        `    ${theme.muted("Create config, workspace, and session folders.")}\n` +
        `  ${theme.command("autopus setup --wizard")}\n` +
        `    ${theme.muted("Run full onboarding for auth, models, Gateway, and channels.")}\n\n` +
        `${theme.muted("Docs:")} ${formatDocsLink("/cli/setup", "docs.autopus.ai/cli/setup")}\n`,
    )
    .option(
      "--workspace <dir>",
      "Agent workspace directory (default: ~/.autopus/workspace; stored as agents.defaults.workspace)",
    )
    .option("--wizard", t("opt.run_interactive_onboarding"), false)
    .option("--non-interactive", t("opt.run_onboarding_without_prompts"), false)
    .option("--mode <mode>", t("opt.onboard_mode_local_remote"))
    .option("--import-from <provider>", t("opt.migration_provider_to_run_during_onboarding"))
    .option("--import-source <path>", t("opt.source_agent_home_for_import_from"))
    .option(
      "--import-secrets",
      t("opt.import_supported_secrets_during_onboarding_migration"),
      false,
    )
    .option("--remote-url <url>", t("opt.remote_gateway_websocket_url"))
    .option("--remote-token <token>", t("opt.remote_gateway_token_optional"))
    .action(async (opts, command) => {
      await runCommandWithRuntime(defaultRuntime, async () => {
        const hasWizardFlags = hasExplicitOptions(command, [
          "wizard",
          "nonInteractive",
          "mode",
          "importFrom",
          "importSource",
          "importSecrets",
          "remoteUrl",
          "remoteToken",
        ]);
        if (opts.wizard || hasWizardFlags) {
          await setupWizardCommand(
            {
              workspace: opts.workspace as string | undefined,
              nonInteractive: Boolean(opts.nonInteractive),
              mode: opts.mode as "local" | "remote" | undefined,
              importFrom: opts.importFrom as string | undefined,
              importSource: opts.importSource as string | undefined,
              importSecrets: Boolean(opts.importSecrets),
              remoteUrl: opts.remoteUrl as string | undefined,
              remoteToken: opts.remoteToken as string | undefined,
            },
            defaultRuntime,
          );
          return;
        }
        await setupCommand({ workspace: opts.workspace as string | undefined }, defaultRuntime);
      });
    });
}
