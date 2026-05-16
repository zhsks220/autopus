import type { Command } from "commander";
import { t } from "../../../i18n/cli/translate.js";
import { collectOption } from "../helpers.js";
import type { MessageCliHelpers } from "./helpers.js";

export function registerMessagePollCommand(message: Command, helpers: MessageCliHelpers) {
  helpers
    .withMessageBase(
      helpers.withRequiredMessageTarget(message.command("poll").description(t("desc.send_a_poll"))),
    )
    .requiredOption("--poll-question <text>", "Poll question")
    .option(
      "--poll-option <choice>",
      "Poll option (repeat 2-12 times)",
      collectOption,
      [] as string[],
    )
    .option("--poll-multi", t("opt.allow_multiple_selections"), false)
    .option("--poll-duration-hours <n>", t("opt.poll_duration_in_hours_discord"))
    .option("--poll-duration-seconds <n>", t("opt.poll_duration_in_seconds_telegram_5_600"))
    .option("--poll-anonymous", t("opt.send_an_anonymous_poll_telegram"), false)
    .option("--poll-public", t("opt.send_a_non_anonymous_poll_telegram"), false)
    .option("-m, --message <text>", t("opt.optional_message_body"))
    .option(
      "--silent",
      "Send poll silently without notification (Telegram + Discord where supported)",
      false,
    )
    .option("--thread-id <id>", t("opt.thread_id_telegram_forum_topic_slack_thread_ts"))
    .action(async (opts) => {
      await helpers.runMessageAction("poll", opts);
    });
}
