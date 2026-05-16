import type { Command } from "commander";
import { t } from "../../../i18n/cli/translate.js";
import type { MessageCliHelpers } from "./helpers.js";

export function registerMessageDiscordAdminCommands(message: Command, helpers: MessageCliHelpers) {
  const role = message.command("role").description(t("desc.role_actions"));
  helpers
    .withMessageBase(
      role
        .command("info")
        .description(t("desc.list_roles"))
        .requiredOption("--guild-id <id>", "Guild id"),
    )
    .action(async (opts) => {
      await helpers.runMessageAction("role-info", opts);
    });

  helpers
    .withMessageBase(
      role
        .command("add")
        .description(t("desc.add_role_to_a_member"))
        .requiredOption("--guild-id <id>", "Guild id")
        .requiredOption("--user-id <id>", "User id")
        .requiredOption("--role-id <id>", "Role id"),
    )
    .action(async (opts) => {
      await helpers.runMessageAction("role-add", opts);
    });

  helpers
    .withMessageBase(
      role
        .command("remove")
        .description(t("desc.remove_role_from_a_member"))
        .requiredOption("--guild-id <id>", "Guild id")
        .requiredOption("--user-id <id>", "User id")
        .requiredOption("--role-id <id>", "Role id"),
    )
    .action(async (opts) => {
      await helpers.runMessageAction("role-remove", opts);
    });

  const channel = message.command("channel").description(t("desc.channel_actions"));
  helpers
    .withMessageBase(
      helpers.withRequiredMessageTarget(
        channel.command("info").description(t("desc.fetch_channel_info")),
      ),
    )
    .action(async (opts) => {
      await helpers.runMessageAction("channel-info", opts);
    });

  helpers
    .withMessageBase(
      channel
        .command("list")
        .description(t("desc.list_channels"))
        .requiredOption("--guild-id <id>", "Guild id"),
    )
    .action(async (opts) => {
      await helpers.runMessageAction("channel-list", opts);
    });

  const member = message.command("member").description(t("desc.member_actions"));
  helpers
    .withMessageBase(
      member
        .command("info")
        .description(t("desc.fetch_member_info"))
        .requiredOption("--user-id <id>", "User id"),
    )
    .option("--guild-id <id>", t("opt.guild_id_discord"))
    .action(async (opts) => {
      await helpers.runMessageAction("member-info", opts);
    });

  const voice = message.command("voice").description(t("desc.voice_actions"));
  helpers
    .withMessageBase(
      voice
        .command("status")
        .description(t("desc.fetch_voice_status"))
        .requiredOption("--guild-id <id>", "Guild id")
        .requiredOption("--user-id <id>", "User id"),
    )
    .action(async (opts) => {
      await helpers.runMessageAction("voice-status", opts);
    });

  const event = message.command("event").description(t("desc.event_actions"));
  helpers
    .withMessageBase(
      event
        .command("list")
        .description(t("desc.list_scheduled_events"))
        .requiredOption("--guild-id <id>", "Guild id"),
    )
    .action(async (opts) => {
      await helpers.runMessageAction("event-list", opts);
    });

  helpers
    .withMessageBase(
      event
        .command("create")
        .description(t("desc.create_a_scheduled_event"))
        .requiredOption("--guild-id <id>", "Guild id")
        .requiredOption("--event-name <name>", "Event name")
        .requiredOption("--start-time <iso>", "Event start time"),
    )
    .option("--end-time <iso>", t("opt.event_end_time"))
    .option("--desc <text>", t("opt.event_description"))
    .option("--channel-id <id>", t("opt.channel_id"))
    .option("--location <text>", t("opt.event_location"))
    .option("--event-type <stage|external|voice>", t("opt.event_type"))
    .option("--image <url>", t("opt.cover_image_url_or_local_file_path"))
    .action(async (opts) => {
      await helpers.runMessageAction("event-create", opts);
    });

  helpers
    .withMessageBase(
      message
        .command("timeout")
        .description(t("desc.timeout_a_member"))
        .requiredOption("--guild-id <id>", "Guild id")
        .requiredOption("--user-id <id>", "User id"),
    )
    .option("--duration-min <n>", t("opt.timeout_duration_minutes"))
    .option("--until <iso>", t("opt.timeout_until"))
    .option("--reason <text>", t("opt.moderation_reason"))
    .action(async (opts) => {
      await helpers.runMessageAction("timeout", opts);
    });

  helpers
    .withMessageBase(
      message
        .command("kick")
        .description(t("desc.kick_a_member"))
        .requiredOption("--guild-id <id>", "Guild id")
        .requiredOption("--user-id <id>", "User id"),
    )
    .option("--reason <text>", t("opt.moderation_reason"))
    .action(async (opts) => {
      await helpers.runMessageAction("kick", opts);
    });

  helpers
    .withMessageBase(
      message
        .command("ban")
        .description(t("desc.ban_a_member"))
        .requiredOption("--guild-id <id>", "Guild id")
        .requiredOption("--user-id <id>", "User id"),
    )
    .option("--reason <text>", t("opt.moderation_reason"))
    .option("--delete-days <n>", t("opt.ban_delete_message_days"))
    .action(async (opts) => {
      await helpers.runMessageAction("ban", opts);
    });
}
