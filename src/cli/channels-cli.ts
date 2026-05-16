import type { Command } from "commander";
import { danger } from "../globals.js";
import { t } from "../i18n/cli/translate.js";
import { defaultRuntime } from "../runtime.js";
import { createLazyImportLoader } from "../shared/lazy-promise.js";
import { formatDocsLink } from "../terminal/links.js";
import { theme } from "../terminal/theme.js";
import { resolveCliArgvInvocation } from "./argv-invocation.js";
import { runChannelLogin, runChannelLogout } from "./channel-auth.js";
import { formatCliChannelOptions } from "./channel-options.js";
import { runCommandWithRuntime } from "./cli-utils.js";
import { hasExplicitOptions } from "./command-options.js";
import { formatHelpExamples } from "./help-format.js";
import { applyParentDefaultHelpAction } from "./program/parent-default-help.js";
import { normalizeWindowsArgv } from "./windows-argv.js";

type ChannelsCommandsModule = typeof import("../commands/channels.js");
type BundledPackageChannelMetadataModule =
  typeof import("../plugins/bundled-package-channel-metadata.js");

const optionNamesRemove = ["channel", "account", "delete"] as const;

type RegisterChannelsCliOptions = {
  includeSetupOptions?: boolean;
};

const channelsCommandsLoader = createLazyImportLoader<ChannelsCommandsModule>(
  () => import("../commands/channels.js"),
);
const bundledPackageChannelMetadataLoader =
  createLazyImportLoader<BundledPackageChannelMetadataModule>(
    () => import("../plugins/bundled-package-channel-metadata.js"),
  );

function loadChannelsCommands(): Promise<ChannelsCommandsModule> {
  return channelsCommandsLoader.load();
}

function runChannelsCommand(action: () => Promise<void>) {
  return runCommandWithRuntime(defaultRuntime, action);
}

function runChannelsCommandWithDanger(action: () => Promise<void>, label: string) {
  return runCommandWithRuntime(defaultRuntime, action, (err) => {
    defaultRuntime.error(danger(`${label}: ${String(err)}`));
    defaultRuntime.exit(1);
  });
}

function getOptionNames(command: Command): string[] {
  return command.options.map((option) => option.attributeName());
}

function shouldRegisterChannelSetupOptions(
  argv: string[] = process.argv,
  options: RegisterChannelsCliOptions = {},
): boolean {
  if (options.includeSetupOptions) {
    return true;
  }
  const { commandPath } = resolveCliArgvInvocation(normalizeWindowsArgv(argv));
  return commandPath[0] === "channels" && commandPath[1] === "add";
}

async function addChannelSetupOptions(command: Command): Promise<Command> {
  const { listBundledPackageChannelMetadata } = await bundledPackageChannelMetadataLoader.load();
  const seenFlags = new Set(command.options.map((option) => option.flags));
  const channels = listBundledPackageChannelMetadata().toSorted((left, right) => {
    const leftOrder = left.order ?? Number.MAX_SAFE_INTEGER;
    const rightOrder = right.order ?? Number.MAX_SAFE_INTEGER;
    return leftOrder === rightOrder
      ? (left.id ?? "").localeCompare(right.id ?? "")
      : leftOrder - rightOrder;
  });
  for (const channel of channels) {
    for (const option of channel.cliAddOptions ?? []) {
      if (seenFlags.has(option.flags)) {
        continue;
      }
      seenFlags.add(option.flags);
      if (option.defaultValue !== undefined) {
        command.option(option.flags, option.description, option.defaultValue);
      } else {
        command.option(option.flags, option.description);
      }
    }
  }
  return command;
}

export async function registerChannelsCli(
  program: Command,
  argv: string[] = process.argv,
  options: RegisterChannelsCliOptions = {},
) {
  const channelNames = formatCliChannelOptions();
  const channels = program
    .command("channels")
    .description(t("desc.manage_connected_chat_channels_and_accounts"))
    .addHelpText(
      "after",
      () =>
        `\n${theme.heading("Examples:")}\n${formatHelpExamples([
          ["autopus channels list", "List configured channels."],
          ["autopus channels list --all", "Show configured, bundled, and installable channels."],
          ["autopus channels add", "Open guided channel setup."],
          ["autopus channels status --probe", "Run channel status checks and probes."],
          [
            "autopus channels add --channel telegram --token <token>",
            "Add or update a channel account non-interactively.",
          ],
          ["autopus channels login --channel whatsapp", "Link a WhatsApp Web account."],
        ])}\n\n${theme.muted("Docs:")} ${formatDocsLink(
          "/cli/channels",
          "docs.autopus.ai/cli/channels",
        )}\n`,
    );

  channels
    .command("list")
    .description(
      t("desc.list_chat_channels_configured_by_default_pass_all_for_installable_catalog"),
    )
    .option("--all", t("opt.include_bundled_and_installable_catalog_channels"), false)
    .option("--json", t("opt.output_json"), false)
    .action(async (opts) => {
      await runChannelsCommand(async () => {
        const { channelsListCommand } = await import("../commands/channels/list.js");
        await channelsListCommand(opts, defaultRuntime);
      });
    });

  channels
    .command("status")
    .description(t("desc.show_gateway_channel_status_use_status_deep_for_local"))
    .option("--channel <name>", `Only show one channel (${formatCliChannelOptions(["all"])})`)
    .option("--probe", t("opt.probe_channel_credentials"), false)
    .option("--timeout <ms>", t("opt.timeout_in_ms"), "10000")
    .option("--json", t("opt.output_json"), false)
    .action(async (opts) => {
      await runChannelsCommand(async () => {
        const { channelsStatusCommand } = await import("../commands/channels/status.js");
        await channelsStatusCommand(opts, defaultRuntime);
      });
    });

  channels
    .command("capabilities")
    .description(t("desc.show_provider_capabilities_intents_scopes_supported_features"))
    .option("--channel <name>", `Channel (${formatCliChannelOptions(["all"])})`)
    .option("--account <id>", t("opt.account_id_only_with_channel"))
    .option("--target <dest>", t("opt.channel_target_for_permission_audit_discord_channel_id"))
    .option("--timeout <ms>", t("opt.timeout_in_ms"), "10000")
    .option("--json", t("opt.output_json"), false)
    .action(async (opts) => {
      await runChannelsCommand(async () => {
        const { channelsCapabilitiesCommand } = await loadChannelsCommands();
        await channelsCapabilitiesCommand(opts, defaultRuntime);
      });
    });

  channels
    .command("resolve")
    .description(t("desc.resolve_channel_user_names_to_ids"))
    .argument("<entries...>", "Entries to resolve (names or ids)")
    .option("--channel <name>", `Channel (${channelNames})`)
    .option("--account <id>", t("opt.account_id_accountid"))
    .option("--kind <kind>", t("opt.target_kind_auto_user_group"), "auto")
    .option("--json", t("opt.output_json"), false)
    .action(async (entries, opts) => {
      await runChannelsCommand(async () => {
        const { channelsResolveCommand } = await loadChannelsCommands();
        await channelsResolveCommand(
          {
            channel: opts.channel as string | undefined,
            account: opts.account as string | undefined,
            kind: opts.kind as "auto" | "user" | "group",
            json: Boolean(opts.json),
            entries: Array.isArray(entries) ? entries : [String(entries)],
          },
          defaultRuntime,
        );
      });
    });

  channels
    .command("logs")
    .description(t("desc.show_recent_channel_logs_from_the_gateway_log_file"))
    .option("--channel <name>", `Channel (${formatCliChannelOptions(["all"])})`, "all")
    .option("--lines <n>", t("opt.number_of_lines_default_200"), "200")
    .option("--json", t("opt.output_json"), false)
    .action(async (opts) => {
      await runChannelsCommand(async () => {
        const { channelsLogsCommand } = await loadChannelsCommands();
        await channelsLogsCommand(opts, defaultRuntime);
      });
    });

  const addCommand = channels
    .command("add")
    .description(t("desc.add_or_update_a_channel_account"))
    .addHelpText(
      "after",
      () =>
        `\n${theme.heading("Examples:")}\n${formatHelpExamples([
          ["autopus channels add", "Open guided setup for available chat channels."],
          [
            "autopus channels add --channel telegram --token <token>",
            "Add or update Telegram non-interactively.",
          ],
          ["autopus channels list --all", "Find channel ids before using --channel."],
        ])}\n`,
    )
    .option("--channel <name>", `Channel (${channelNames})`)
    .option("--account <id>", t("opt.account_id_default_when_omitted"))
    .option("--name <name>", t("opt.display_name_for_this_account"))
    .option("--token <token>", t("opt.channel_token_or_credential_payload"))
    .option("--token-file <path>", t("opt.read_channel_token_or_credential_payload_from_file"))
    .option("--secret <secret>", t("opt.channel_shared_secret"))
    .option("--secret-file <path>", t("opt.read_channel_shared_secret_from_file"))
    .option("--bot-token <token>", t("opt.bot_token"))
    .option("--app-token <token>", t("opt.app_token"))
    .option("--password <password>", t("opt.channel_password_or_login_secret"))
    .option("--cli-path <path>", t("opt.channel_cli_path"))
    .option("--url <url>", t("opt.channel_setup_url"))
    .option("--base-url <url>", t("opt.channel_base_url"))
    .option("--http-url <url>", t("opt.channel_http_service_url"))
    .option("--auth-dir <path>", t("opt.channel_auth_directory_override"))
    .option("--use-env", t("opt.use_env_backed_credentials_when_supported"), false);

  if (shouldRegisterChannelSetupOptions(argv, options)) {
    await addChannelSetupOptions(addCommand);
  }

  addCommand.action(async (opts, command) => {
    await runChannelsCommand(async () => {
      const { channelsAddCommand } = await loadChannelsCommands();
      const hasFlags = hasExplicitOptions(command, getOptionNames(command));
      await channelsAddCommand(opts, defaultRuntime, { hasFlags });
    });
  });

  channels
    .command("remove")
    .description(t("desc.disable_or_delete_a_channel_account"))
    .option("--channel <name>", `Channel (${channelNames})`)
    .option("--account <id>", t("opt.account_id_default_when_omitted"))
    .option("--delete", t("opt.delete_config_entries_no_prompt"), false)
    .action(async (opts, command) => {
      await runChannelsCommand(async () => {
        const { channelsRemoveCommand } = await loadChannelsCommands();
        const hasFlags = hasExplicitOptions(command, optionNamesRemove);
        await channelsRemoveCommand(opts, defaultRuntime, { hasFlags });
      });
    });

  channels
    .command("login")
    .description(t("desc.link_a_channel_account_if_supported"))
    .option("--channel <channel>", t("opt.channel_alias_auto_when_only_one_is_configured"))
    .option("--account <id>", t("opt.account_id_accountid"))
    .option("--verbose", t("opt.verbose_connection_logs"), false)
    .action(async (opts) => {
      await runChannelsCommandWithDanger(async () => {
        await runChannelLogin(
          {
            channel: opts.channel as string | undefined,
            account: opts.account as string | undefined,
            verbose: Boolean(opts.verbose),
          },
          defaultRuntime,
        );
      }, "Channel login failed");
    });

  channels
    .command("logout")
    .description(t("desc.log_out_of_a_channel_session_if_supported"))
    .option("--channel <channel>", t("opt.channel_alias_auto_when_only_one_is_configured"))
    .option("--account <id>", t("opt.account_id_accountid"))
    .action(async (opts) => {
      await runChannelsCommandWithDanger(async () => {
        await runChannelLogout(
          {
            channel: opts.channel as string | undefined,
            account: opts.account as string | undefined,
          },
          defaultRuntime,
        );
      }, "Channel logout failed");
    });

  applyParentDefaultHelpAction(channels);
}
