import type { Command } from "commander";
import { t } from "../i18n/cli/translate.js";
import { formatDocsLink } from "../terminal/links.js";
import { theme } from "../terminal/theme.js";
import { registerQrCli } from "./qr-cli.js";

export function registerClawbotCli(program: Command) {
  const clawbot = program
    .command("clawbot")
    .description(t("desc.legacy_clawbot_command_aliases"))
    .addHelpText(
      "after",
      () =>
        `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/clawbot", "docs.autopus.ai/cli/clawbot")}\n`,
    );
  registerQrCli(clawbot);
}
