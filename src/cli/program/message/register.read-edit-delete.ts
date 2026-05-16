import type { Command } from "commander";
import { t } from "../../../i18n/cli/translate.js";
import type { MessageCliHelpers } from "./helpers.js";

export function registerMessageReadEditDeleteCommands(
  message: Command,
  helpers: MessageCliHelpers,
) {
  helpers
    .withMessageBase(
      helpers.withRequiredMessageTarget(
        message.command("read").description(t("desc.read_recent_messages")),
      ),
    )
    .option("--limit <n>", t("opt.result_limit"))
    .option("--message-id <id>", t("opt.read_a_specific_message_id"))
    .option("--before <id>", t("opt.read_search_before_id"))
    .option("--after <id>", t("opt.read_search_after_id"))
    .option("--around <id>", t("opt.read_around_id"))
    .option("--thread-id <id>", t("opt.thread_id_slack_thread_timestamp"))
    .option("--include-thread", t("opt.include_thread_replies_discord"), false)
    .action(async (opts) => {
      await helpers.runMessageAction("read", opts);
    });

  helpers
    .withMessageBase(
      helpers.withRequiredMessageTarget(
        message
          .command("edit")
          .description(t("desc.edit_a_message"))
          .requiredOption("--message-id <id>", "Message id")
          .requiredOption("-m, --message <text>", "Message body"),
      ),
    )
    .option("--thread-id <id>", t("opt.thread_id_telegram_forum_thread"))
    .action(async (opts) => {
      await helpers.runMessageAction("edit", opts);
    });

  helpers
    .withMessageBase(
      helpers.withRequiredMessageTarget(
        message
          .command("delete")
          .description(t("desc.delete_a_message"))
          .requiredOption("--message-id <id>", "Message id"),
      ),
    )
    .action(async (opts) => {
      await helpers.runMessageAction("delete", opts);
    });
}
