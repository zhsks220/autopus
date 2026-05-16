import type { Command } from "commander";
import { t } from "../../../i18n/cli/translate.js";
import { collectOption } from "../helpers.js";
import type { MessageCliHelpers } from "./helpers.js";

export function registerMessagePermissionsCommand(message: Command, helpers: MessageCliHelpers) {
  helpers
    .withMessageBase(
      helpers.withRequiredMessageTarget(
        message.command("permissions").description(t("desc.fetch_channel_permissions")),
      ),
    )
    .action(async (opts) => {
      await helpers.runMessageAction("permissions", opts);
    });
}

export function registerMessageSearchCommand(message: Command, helpers: MessageCliHelpers) {
  helpers
    .withMessageBase(message.command("search").description(t("desc.search_discord_messages")))
    .requiredOption("--guild-id <id>", "Guild id")
    .requiredOption("--query <text>", "Search query")
    .option("--channel-id <id>", t("opt.channel_id"))
    .option("--channel-ids <id>", t("opt.channel_id_repeat"), collectOption, [] as string[])
    .option("--author-id <id>", t("opt.author_id"))
    .option("--author-ids <id>", t("opt.author_id_repeat"), collectOption, [] as string[])
    .option("--limit <n>", t("opt.result_limit"))
    .action(async (opts) => {
      await helpers.runMessageAction("search", opts);
    });
}
