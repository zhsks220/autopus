import type { Command } from "commander";
import {
  migrateApplyCommand,
  migrateDefaultCommand,
  migrateListCommand,
  migratePlanCommand,
} from "../../commands/migrate.js";
import { t } from "../../i18n/cli/translate.js";
import { defaultRuntime } from "../../runtime.js";
import { theme } from "../../terminal/theme.js";
import { runCommandWithRuntime } from "../cli-utils.js";
import { formatHelpExamples } from "../help-format.js";

function collectMigrationSkill(value: string, previous: string[] | undefined): string[] {
  return [...(previous ?? []), value];
}

function collectMigrationPlugin(value: string, previous: string[] | undefined): string[] {
  return [...(previous ?? []), value];
}

function readMigrationSkills(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }
  const skills = value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
  return skills.length > 0 ? skills : undefined;
}

function readMigrationPlugins(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }
  const plugins = value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
  return plugins.length > 0 ? plugins : undefined;
}

function addMigrationSkillOption(command: Command): Command {
  return command.option(
    "--skill <name>",
    "Select one skill to migrate by name or item id; repeat for multiple skills",
    collectMigrationSkill,
  );
}

function addMigrationPluginOption(command: Command): Command {
  return command.option(
    "--plugin <name>",
    "Select one Codex plugin to migrate by name or item id; repeat for multiple plugins",
    collectMigrationPlugin,
  );
}

function addVerifyPluginAppsOption(command: Command): Command {
  return command.option(
    "--verify-plugin-apps",
    "Codex only: verify source plugin app accessibility with app/list before planning native plugin activation",
    false,
  );
}

function addMigrationOptions(command: Command): Command {
  return addVerifyPluginAppsOption(
    addMigrationPluginOption(
      addMigrationSkillOption(
        command
          .option("--from <path>", t("opt.source_directory_to_migrate_from"))
          .option("--include-secrets", t("opt.import_supported_credentials_and_secrets"), false)
          .option(
            "--overwrite",
            "Overwrite conflicting target files after item-level backups",
            false,
          )
          .option("--json", t("opt.output_json"), false),
      ),
    ),
  );
}

function readVerifyPluginApps(value: unknown): boolean {
  return value === true;
}

export function registerMigrateCommand(program: Command) {
  const migrate = addVerifyPluginAppsOption(
    program
      .command("migrate")
      .description(t("desc.import_state_from_another_agent_system"))
      .argument("[provider]", "Migration provider id, for example hermes")
      .option("--from <path>", t("opt.source_directory_to_migrate_from"))
      .option("--include-secrets", t("opt.import_supported_credentials_and_secrets"), false)
      .option(
        "--overwrite",
        t("opt.overwrite_conflicting_target_files_after_item_level_backups"),
        false,
      )
      .option("--dry-run", t("opt.preview_only_do_not_apply_changes"), false)
      .option("--yes", t("opt.apply_without_prompting_after_preview"), false)
      .option(
        "--skill <name>",
        "Select one skill to migrate by name or item id; repeat for multiple skills",
        collectMigrationSkill,
      )
      .option(
        "--plugin <name>",
        "Select one Codex plugin to migrate by name or item id; repeat for multiple plugins",
        collectMigrationPlugin,
      )
      .option("--backup-output <path>", t("opt.pre_migration_backup_archive_path_or_directory"))
      .option("--no-backup", t("opt.skip_the_pre_migration_autopus_backup"))
      .option("--force", t("opt.allow_dangerous_options_such_as_no_backup"), false)
      .option("--json", t("opt.output_json"), false),
  )
    .addHelpText(
      "after",
      () =>
        `\n${theme.heading("Examples:")}\n${formatHelpExamples([
          ["autopus migrate list", "Show available migration providers."],
          ["autopus migrate hermes", "Preview Hermes migration, then prompt before applying."],
          ["autopus migrate hermes --dry-run", "Preview Hermes migration only."],
          [
            "autopus migrate apply hermes --yes",
            "Apply Hermes migration non-interactively after writing a verified backup.",
          ],
          [
            "autopus migrate apply hermes --include-secrets --yes",
            "Include supported credentials in the migration.",
          ],
        ])}`,
    )
    .action(async (provider, opts) => {
      await runCommandWithRuntime(defaultRuntime, async () => {
        await migrateDefaultCommand(defaultRuntime, {
          provider: provider as string | undefined,
          source: opts.from as string | undefined,
          includeSecrets: Boolean(opts.includeSecrets),
          overwrite: Boolean(opts.overwrite),
          skills: readMigrationSkills(opts.skill),
          plugins: readMigrationPlugins(opts.plugin),
          verifyPluginApps: readVerifyPluginApps(opts.verifyPluginApps),
          dryRun: Boolean(opts.dryRun),
          yes: Boolean(opts.yes),
          backupOutput: opts.backupOutput as string | undefined,
          noBackup: opts.backup === false,
          force: Boolean(opts.force),
          json: Boolean(opts.json),
        });
      });
    });

  migrate
    .command("list")
    .description(t("desc.list_migration_providers"))
    .option("--json", t("opt.output_json"), false)
    .action(async (opts) => {
      await runCommandWithRuntime(defaultRuntime, async () => {
        await migrateListCommand(defaultRuntime, { json: Boolean(opts.json) });
      });
    });

  addMigrationOptions(
    migrate
      .command("plan <provider>")
      .description(t("desc.preview_a_migration_without_changing_autopus_state")),
  ).action(async (provider, opts) => {
    await runCommandWithRuntime(defaultRuntime, async () => {
      await migratePlanCommand(defaultRuntime, {
        provider: provider as string,
        source: opts.from as string | undefined,
        includeSecrets: Boolean(opts.includeSecrets),
        overwrite: Boolean(opts.overwrite),
        skills: readMigrationSkills(opts.skill),
        plugins: readMigrationPlugins(opts.plugin),
        verifyPluginApps: readVerifyPluginApps(opts.verifyPluginApps),
        json: Boolean(opts.json),
      });
    });
  });

  addMigrationOptions(
    migrate
      .command("apply <provider>")
      .description(t("desc.apply_a_migration_after_a_verified_backup")),
  )
    .option("--yes", t("opt.apply_without_prompting"), false)
    .option("--backup-output <path>", t("opt.pre_migration_backup_archive_path_or_directory"))
    .option("--no-backup", t("opt.skip_the_pre_migration_autopus_backup"))
    .option("--force", t("opt.allow_dangerous_options_such_as_no_backup"), false)
    .action(async (provider, opts) => {
      await runCommandWithRuntime(defaultRuntime, async () => {
        await migrateApplyCommand(defaultRuntime, {
          provider: provider as string,
          source: opts.from as string | undefined,
          includeSecrets: Boolean(opts.includeSecrets),
          overwrite: Boolean(opts.overwrite),
          skills: readMigrationSkills(opts.skill),
          plugins: readMigrationPlugins(opts.plugin),
          verifyPluginApps: readVerifyPluginApps(opts.verifyPluginApps),
          yes: Boolean(opts.yes),
          backupOutput: opts.backupOutput as string | undefined,
          noBackup: opts.backup === false,
          force: Boolean(opts.force),
          json: Boolean(opts.json),
        });
      });
    });
}
