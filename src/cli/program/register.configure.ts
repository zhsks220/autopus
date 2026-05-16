import type { Command } from "commander";
import {
  CONFIGURE_WIZARD_SECTIONS,
  configureCommandFromSectionsArg,
} from "../../commands/configure.js";
import { t } from "../../i18n/cli/translate.js";
import { defaultRuntime } from "../../runtime.js";
import { formatDocsLink } from "../../terminal/links.js";
import { theme } from "../../terminal/theme.js";
import { runCommandWithRuntime } from "../cli-utils.js";

export function registerConfigureCommand(program: Command) {
  program
    .command("configure")
    .description(
      t("desc.interactive_configuration_for_credentials_channels_gateway_and_agent_defaults"),
    )
    .addHelpText(
      "after",
      () =>
        `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/configure", "docs.autopus.ai/cli/configure")}\n`,
    )
    .option(
      "--section <section>",
      `Configuration sections (repeatable). Options: ${CONFIGURE_WIZARD_SECTIONS.join(", ")}`,
      (value: string, previous: string[]) => [...previous, value],
      [] as string[],
    )
    .action(async (opts) => {
      await runCommandWithRuntime(defaultRuntime, async () => {
        await configureCommandFromSectionsArg(opts.section, defaultRuntime);
      });
    });
}
