import type { Command } from "commander";
import { t } from "../../../i18n/cli/translate.js";
import { CHANNEL_TARGETS_DESCRIPTION } from "../../../infra/outbound/channel-target.js";
import type { MessageCliHelpers } from "./helpers.js";

export function registerMessageBroadcastCommand(message: Command, helpers: MessageCliHelpers) {
  helpers
    .withMessageBase(
      message.command("broadcast").description(t("desc.broadcast_a_message_to_multiple_targets")),
    )
    .requiredOption("--targets <target...>", CHANNEL_TARGETS_DESCRIPTION)
    .option("--message <text>", t("opt.message_to_send"))
    .option("--media <url>", t("opt.media_url"))
    .action(async (options: Record<string, unknown>) => {
      await helpers.runMessageAction("broadcast", options);
    });
}
