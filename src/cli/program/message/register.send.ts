import type { Command } from "commander";
import { t } from "../../../i18n/cli/translate.js";
import type { MessageCliHelpers } from "./helpers.js";

export function registerMessageSendCommand(message: Command, helpers: MessageCliHelpers) {
  helpers
    .withMessageBase(
      helpers
        .withRequiredMessageTarget(
          message
            .command("send")
            .description(t("desc.send_a_message"))
            .option("-m, --message <text>", t("opt.message_body_required_unless_media_is_set")),
        )
        .option(
          "--media <path-or-url>",
          "Attach media (image/audio/video/document). Accepts local paths or URLs.",
        )
        .option(
          "--presentation <json>",
          "Shared presentation payload as JSON (text, context, dividers, buttons, selects)",
        )
        .option("--delivery <json>", t("opt.shared_delivery_preferences_as_json"))
        .option(
          "--pin",
          t("opt.request_that_the_delivered_message_be_pinned_when_supported"),
          false,
        )
        .option("--reply-to <id>", t("opt.reply_to_message_id"))
        .option("--thread-id <id>", t("opt.thread_id_telegram_forum_thread"))
        .option("--gif-playback", t("opt.treat_video_media_as_gif_playback_whatsapp_only"), false)
        .option(
          "--force-document",
          "Send media as document to avoid Telegram compression (Telegram only). Applies to images and GIFs.",
          false,
        )
        .option(
          "--silent",
          "Send message silently without notification (Telegram + Discord)",
          false,
        ),
    )
    .action(async (opts) => {
      await helpers.runMessageAction("send", opts);
    });
}
