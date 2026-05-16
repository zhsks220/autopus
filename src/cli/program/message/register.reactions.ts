import type { Command } from "commander";
import { t } from "../../../i18n/cli/translate.js";
import type { MessageCliHelpers } from "./helpers.js";

export function registerMessageReactionsCommands(message: Command, helpers: MessageCliHelpers) {
  helpers
    .withMessageBase(
      helpers.withRequiredMessageTarget(
        message.command("react").description(t("desc.add_or_remove_a_reaction")),
      ),
    )
    .requiredOption("--message-id <id>", "Message id")
    .option("--emoji <emoji>", t("opt.emoji_for_reactions"))
    .option("--remove", t("opt.remove_reaction"), false)
    .option("--participant <id>", t("opt.whatsapp_reaction_participant"))
    .option("--from-me", t("opt.whatsapp_reaction_fromme"), false)
    .option("--target-author <id>", t("opt.signal_reaction_target_author_uuid_or_phone"))
    .option("--target-author-uuid <uuid>", t("opt.signal_reaction_target_author_uuid"))
    .action(async (opts) => {
      await helpers.runMessageAction("react", opts);
    });

  helpers
    .withMessageBase(
      helpers.withRequiredMessageTarget(
        message.command("reactions").description(t("desc.list_reactions_on_a_message")),
      ),
    )
    .requiredOption("--message-id <id>", "Message id")
    .option("--limit <n>", t("opt.result_limit"))
    .action(async (opts) => {
      await helpers.runMessageAction("reactions", opts);
    });
}
