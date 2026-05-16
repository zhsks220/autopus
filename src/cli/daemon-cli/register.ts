import type { Command } from "commander";
import { t } from "../../i18n/cli/translate.js";
import { formatDocsLink } from "../../terminal/links.js";
import { theme } from "../../terminal/theme.js";
import { addGatewayServiceCommands } from "./register-service-commands.js";

export function registerDaemonCli(program: Command) {
  const daemon = program
    .command("daemon")
    .description(t("desc.manage_the_gateway_service_launchd_systemd_schtasks"))
    .addHelpText(
      "after",
      () =>
        `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/gateway", "docs.autopus.ai/cli/gateway")}\n`,
    );

  addGatewayServiceCommands(daemon, {
    statusDescription: "Show service install status + probe connectivity/capability",
  });
}
