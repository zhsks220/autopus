import type { Command } from "commander";
import { t } from "../../i18n/cli/translate.js";
import { formatDocsLink } from "../../terminal/links.js";
import { theme } from "../../terminal/theme.js";
import { applyParentDefaultHelpAction } from "../program/parent-default-help.js";
import {
  registerCronAddCommand,
  registerCronListCommand,
  registerCronStatusCommand,
} from "./register.cron-add.js";
import { registerCronEditCommand } from "./register.cron-edit.js";
import { registerCronSimpleCommands } from "./register.cron-simple.js";

export function registerCronCli(program: Command) {
  const cron = program
    .command("cron")
    .description(t("desc.manage_cron_jobs_via_gateway"))
    .addHelpText(
      "after",
      () =>
        `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/cron", "docs.autopus.ai/cli/cron")}\n${theme.muted("Upgrade tip:")} run \`autopus doctor --fix\` to normalize legacy cron job storage.\n`,
    );

  registerCronStatusCommand(cron);
  registerCronListCommand(cron);
  registerCronAddCommand(cron);
  registerCronSimpleCommands(cron);
  registerCronEditCommand(cron);

  applyParentDefaultHelpAction(cron);
}
