import type { Command } from "commander";
import { t } from "../../../i18n/cli/translate.js";
import type { MessageCliHelpers } from "./helpers.js";

export function registerMessagePinCommands(message: Command, helpers: MessageCliHelpers) {
  const pins = [
    helpers
      .withMessageBase(
        helpers.withRequiredMessageTarget(
          message.command("pin").description(t("desc.pin_a_message")),
        ),
      )
      .requiredOption("--message-id <id>", "Message id")
      .action(async (opts) => {
        await helpers.runMessageAction("pin", opts);
      }),
    helpers
      .withMessageBase(
        helpers.withRequiredMessageTarget(
          message.command("unpin").description(t("desc.unpin_a_message")),
        ),
      )
      .requiredOption("--message-id <id>", "Message id (or pinned message resource id for MSTeams)")
      .option(
        "--pinned-message-id <id>",
        "Pinned message resource id (MSTeams: from pin or list-pins, not the chat message id)",
      )
      .action(async (opts) => {
        await helpers.runMessageAction("unpin", opts);
      }),
    helpers
      .withMessageBase(
        helpers.withRequiredMessageTarget(
          message.command("pins").description(t("desc.list_pinned_messages")),
        ),
      )
      .option("--limit <n>", t("opt.result_limit"))
      .action(async (opts) => {
        await helpers.runMessageAction("list-pins", opts);
      }),
  ] as const;

  void pins;
}
