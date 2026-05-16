import type { Command } from "commander";
import { backupVerifyCommand } from "../../commands/backup-verify.js";
import { backupCreateCommand } from "../../commands/backup.js";
import { t } from "../../i18n/cli/translate.js";
import { defaultRuntime } from "../../runtime.js";
import { formatDocsLink } from "../../terminal/links.js";
import { theme } from "../../terminal/theme.js";
import { runCommandWithRuntime } from "../cli-utils.js";
import { formatHelpExamples } from "../help-format.js";

export function registerBackupCommand(program: Command) {
  const backup = program
    .command("backup")
    .description(t("desc.create_and_verify_local_backup_archives_for_autopus_state"))
    .addHelpText(
      "after",
      () =>
        `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/backup", "docs.autopus.ai/cli/backup")}\n`,
    );

  backup
    .command("create")
    .description(t("desc.write_a_backup_archive_for_config_credentials_sessions_and_workspaces"))
    .option("--output <path>", t("opt.archive_path_or_destination_directory"))
    .option("--json", t("opt.output_json"), false)
    .option("--dry-run", t("opt.print_the_backup_plan_without_writing_the_archive"), false)
    .option("--verify", t("opt.verify_the_archive_after_writing_it"), false)
    .option("--only-config", t("opt.back_up_only_the_active_json_config_file"), false)
    .option("--no-include-workspace", t("opt.exclude_workspace_directories_from_the_backup"))
    .addHelpText(
      "after",
      () =>
        `\n${theme.heading("Examples:")}\n${formatHelpExamples([
          ["autopus backup create", "Create a timestamped backup in the current directory."],
          [
            "autopus backup create --output ~/Backups",
            "Write the archive into an existing backup directory.",
          ],
          [
            "autopus backup create --dry-run --json",
            "Preview the archive plan without writing any files.",
          ],
          [
            "autopus backup create --verify",
            "Create the archive and immediately validate its manifest and payload layout.",
          ],
          [
            "autopus backup create --no-include-workspace",
            "Back up state/config without agent workspace files.",
          ],
          ["autopus backup create --only-config", "Back up only the active JSON config file."],
        ])}`,
    )
    .action(async (opts) => {
      await runCommandWithRuntime(defaultRuntime, async () => {
        await backupCreateCommand(defaultRuntime, {
          output: opts.output as string | undefined,
          json: Boolean(opts.json),
          dryRun: Boolean(opts.dryRun),
          verify: Boolean(opts.verify),
          onlyConfig: Boolean(opts.onlyConfig),
          includeWorkspace: opts.includeWorkspace as boolean,
        });
      });
    });

  backup
    .command("verify <archive>")
    .description(t("desc.validate_a_backup_archive_and_its_embedded_manifest"))
    .option("--json", t("opt.output_json"), false)
    .addHelpText(
      "after",
      () =>
        `\n${theme.heading("Examples:")}\n${formatHelpExamples([
          [
            "autopus backup verify ./2026-03-09T00-00-00.000Z-autopus-backup.tar.gz",
            "Check that the archive structure and manifest are intact.",
          ],
          [
            "autopus backup verify ~/Backups/latest.tar.gz --json",
            "Emit machine-readable verification output.",
          ],
        ])}`,
    )
    .action(async (archive, opts) => {
      await runCommandWithRuntime(defaultRuntime, async () => {
        await backupVerifyCommand(defaultRuntime, {
          archive: archive as string,
          json: Boolean(opts.json),
        });
      });
    });
}
