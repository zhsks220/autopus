import type { Command } from "commander";
import { getChannelPlugin } from "../../../channels/plugins/index.js";
import type { ChannelMessageActionName } from "../../../channels/plugins/types.public.js";
import { t } from "../../../i18n/cli/translate.js";
import { normalizeLowercaseStringOrEmpty } from "../../../shared/string-coerce.js";
import type { MessageCliHelpers } from "./helpers.js";

function resolveThreadCreateRequest(opts: Record<string, unknown>) {
  const channel = normalizeLowercaseStringOrEmpty(opts.channel);
  if (channel) {
    const request = getChannelPlugin(channel)?.actions?.resolveCliActionRequest?.({
      action: "thread-create",
      args: opts,
    });
    if (request) {
      return {
        action: request.action,
        params: request.args,
      };
    }
  }
  return {
    action: "thread-create" as ChannelMessageActionName,
    params: opts,
  };
}

export function registerMessageThreadCommands(message: Command, helpers: MessageCliHelpers) {
  const thread = message.command("thread").description(t("desc.thread_actions"));

  helpers
    .withMessageBase(
      helpers.withRequiredMessageTarget(
        thread
          .command("create")
          .description(t("desc.create_a_thread"))
          .requiredOption("--thread-name <name>", "Thread name"),
      ),
    )
    .option("--message-id <id>", t("opt.message_id_optional"))
    .option("-m, --message <text>", t("opt.initial_thread_message_text"))
    .option("--auto-archive-min <n>", t("opt.thread_auto_archive_minutes"))
    .action(async (opts) => {
      const request = resolveThreadCreateRequest(opts);
      await helpers.runMessageAction(request.action, request.params);
    });

  helpers
    .withMessageBase(
      thread
        .command("list")
        .description(t("desc.list_threads"))
        .requiredOption("--guild-id <id>", "Guild id"),
    )
    .option("--channel-id <id>", t("opt.channel_id"))
    .option("--include-archived", t("opt.include_archived_threads"), false)
    .option("--before <id>", t("opt.read_search_before_id"))
    .option("--limit <n>", t("opt.result_limit"))
    .action(async (opts) => {
      await helpers.runMessageAction("thread-list", opts);
    });

  helpers
    .withMessageBase(
      helpers.withRequiredMessageTarget(
        thread
          .command("reply")
          .description(t("desc.reply_in_a_thread"))
          .requiredOption("-m, --message <text>", "Message body"),
      ),
    )
    .option(
      "--media <path-or-url>",
      "Attach media (image/audio/video/document). Accepts local paths or URLs.",
    )
    .option("--reply-to <id>", t("opt.reply_to_message_id"))
    .action(async (opts) => {
      await helpers.runMessageAction("thread-reply", opts);
    });
}
