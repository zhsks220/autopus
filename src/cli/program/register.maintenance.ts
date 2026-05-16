import type { Command } from "commander";
import { dashboardCommand } from "../../commands/dashboard.js";
import { doctorCommand } from "../../commands/doctor.js";
import { resetCommand } from "../../commands/reset.js";
import { uninstallCommand } from "../../commands/uninstall.js";
import { t } from "../../i18n/cli/translate.js";
import { defaultRuntime } from "../../runtime.js";
import { formatDocsLink } from "../../terminal/links.js";
import { theme } from "../../terminal/theme.js";
import { runCommandWithRuntime } from "../cli-utils.js";

export function registerMaintenanceCommands(program: Command) {
  program
    .command("doctor")
    .description(t("desc.health_checks_quick_fixes_for_the_gateway_and_channels"))
    .addHelpText(
      "after",
      () =>
        `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/doctor", "docs.autopus.ai/cli/doctor")}\n`,
    )
    .option(
      "--no-workspace-suggestions",
      t("opt.disable_workspace_memory_system_suggestions"),
      false,
    )
    .option("--yes", t("opt.accept_defaults_without_prompting"), false)
    .option("--repair", t("opt.apply_recommended_repairs_without_prompting"), false)
    .option("--fix", t("opt.apply_recommended_repairs_alias_for_repair"), false)
    .option("--force", t("opt.apply_aggressive_repairs_overwrites_custom_service_config"), false)
    .option("--non-interactive", t("opt.run_without_prompts_safe_migrations_only"), false)
    .option("--generate-gateway-token", t("opt.generate_and_configure_a_gateway_token"), false)
    .option("--deep", t("opt.scan_system_services_for_extra_gateway_installs"), false)
    .action(async (opts) => {
      await runCommandWithRuntime(defaultRuntime, async () => {
        await doctorCommand(defaultRuntime, {
          workspaceSuggestions: opts.workspaceSuggestions,
          yes: Boolean(opts.yes),
          repair: Boolean(opts.repair) || Boolean(opts.fix),
          force: Boolean(opts.force),
          nonInteractive: Boolean(opts.nonInteractive),
          generateGatewayToken: Boolean(opts.generateGatewayToken),
          deep: Boolean(opts.deep),
        });
        defaultRuntime.exit(0);
      });
    });

  program
    .command("dashboard")
    .description(t("desc.open_the_control_ui_with_your_current_token"))
    .addHelpText(
      "after",
      () =>
        `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/dashboard", "docs.autopus.ai/cli/dashboard")}\n`,
    )
    .option("--no-open", t("opt.print_url_but_do_not_launch_a_browser"))
    .action(async (opts) => {
      await runCommandWithRuntime(defaultRuntime, async () => {
        await dashboardCommand(defaultRuntime, {
          noOpen: opts.open === false,
        });
      });
    });

  program
    .command("reset")
    .description(t("desc.reset_local_config_state_keeps_the_cli_installed"))
    .addHelpText(
      "after",
      () =>
        `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/reset", "docs.autopus.ai/cli/reset")}\n`,
    )
    .option(
      "--scope <scope>",
      t("opt.config_config_creds_sessions_full_default_interactive_prompt"),
    )
    .option("--yes", t("opt.skip_confirmation_prompts"), false)
    .option("--non-interactive", t("opt.disable_prompts_requires_scope_yes"), false)
    .option("--dry-run", t("opt.print_actions_without_removing_files"), false)
    .action(async (opts) => {
      await runCommandWithRuntime(defaultRuntime, async () => {
        await resetCommand(defaultRuntime, {
          scope: opts.scope,
          yes: Boolean(opts.yes),
          nonInteractive: Boolean(opts.nonInteractive),
          dryRun: Boolean(opts.dryRun),
        });
      });
    });

  program
    .command("uninstall")
    .description(t("desc.uninstall_the_gateway_service_local_data_cli_remains"))
    .addHelpText(
      "after",
      () =>
        `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/uninstall", "docs.autopus.ai/cli/uninstall")}\n`,
    )
    .option("--service", t("opt.remove_the_gateway_service"), false)
    .option("--state", t("opt.remove_state_config"), false)
    .option("--workspace", t("opt.remove_workspace_dirs"), false)
    .option("--app", t("opt.remove_the_macos_app"), false)
    .option("--all", t("opt.remove_service_state_workspace_app"), false)
    .option("--yes", t("opt.skip_confirmation_prompts"), false)
    .option("--non-interactive", t("opt.disable_prompts_requires_yes"), false)
    .option("--dry-run", t("opt.print_actions_without_removing_files"), false)
    .action(async (opts) => {
      await runCommandWithRuntime(defaultRuntime, async () => {
        await uninstallCommand(defaultRuntime, {
          service: Boolean(opts.service),
          state: Boolean(opts.state),
          workspace: Boolean(opts.workspace),
          app: Boolean(opts.app),
          all: Boolean(opts.all),
          yes: Boolean(opts.yes),
          nonInteractive: Boolean(opts.nonInteractive),
          dryRun: Boolean(opts.dryRun),
        });
      });
    });
}
