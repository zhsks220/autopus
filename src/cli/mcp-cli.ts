import { Command } from "commander";
import { parseConfigValue } from "../auto-reply/reply/config-value.js";
import {
  listConfiguredMcpServers,
  setConfiguredMcpServer,
  unsetConfiguredMcpServer,
} from "../config/mcp-config.js";
import { t } from "../i18n/cli/translate.js";
import { formatErrorMessage } from "../infra/errors.js";
import { serveAutopusChannelMcp } from "../mcp/channel-server.js";
import { defaultRuntime } from "../runtime.js";
import {
  normalizeLowercaseStringOrEmpty,
  normalizeStringifiedOptionalString,
} from "../shared/string-coerce.js";
import { formatCliCommand } from "./command-format.js";
import { resolveGatewayAuthOptions } from "./gateway-secret-options.js";
import { applyParentDefaultHelpAction } from "./program/parent-default-help.js";

function fail(message: string): never {
  defaultRuntime.error(message);
  defaultRuntime.exit(1);
  throw new Error(message);
}

function printJson(value: unknown): void {
  defaultRuntime.writeJson(value);
}

export function registerMcpCli(program: Command) {
  const mcp = program
    .command("mcp")
    .description(t("desc.manage_autopus_mcp_config_and_channel_bridge"));

  mcp
    .command("serve")
    .description(t("desc.expose_autopus_channels_over_mcp_stdio"))
    .option(
      "--url <url>",
      t("opt.gateway_websocket_url_defaults_to_gateway_remote_url_when_configured"),
    )
    .option("--token <token>", t("opt.gateway_token_if_required"))
    .option("--token-file <path>", t("opt.read_gateway_token_from_file"))
    .option("--password <password>", t("opt.gateway_password_if_required"))
    .option("--password-file <path>", t("opt.read_gateway_password_from_file"))
    .option(
      "--claude-channel-mode <mode>",
      "Claude channel notification mode: auto, on, or off",
      "auto",
    )
    .option("-v, --verbose", t("opt.verbose_logging_to_stderr"), false)
    .action(async (opts) => {
      try {
        const { gatewayToken, gatewayPassword } = resolveGatewayAuthOptions(opts);
        const claudeChannelMode = normalizeLowercaseStringOrEmpty(
          normalizeStringifiedOptionalString(opts.claudeChannelMode) ?? "auto",
        );
        if (
          claudeChannelMode !== "auto" &&
          claudeChannelMode !== "on" &&
          claudeChannelMode !== "off"
        ) {
          throw new Error('Invalid --claude-channel-mode value. Use "auto", "on", or "off".');
        }
        await serveAutopusChannelMcp({
          gatewayUrl: opts.url as string | undefined,
          gatewayToken,
          gatewayPassword,
          claudeChannelMode,
          verbose: Boolean(opts.verbose),
        });
      } catch (err) {
        defaultRuntime.error(
          `MCP server failed to start: ${formatErrorMessage(err)}. Run ${formatCliCommand("autopus mcp list")} to inspect configured servers.`,
        );
        defaultRuntime.exit(1);
      }
    });

  mcp
    .command("list")
    .description(t("desc.list_configured_mcp_servers"))
    .option("--json", t("opt.print_json"))
    .action(async (opts: { json?: boolean }) => {
      const loaded = await listConfiguredMcpServers();
      if (!loaded.ok) {
        fail(loaded.error);
      }
      if (opts.json) {
        printJson(loaded.mcpServers);
        return;
      }
      const names = Object.keys(loaded.mcpServers).toSorted();
      if (names.length === 0) {
        defaultRuntime.log(
          `No MCP servers configured in ${loaded.path}. Add one with ${formatCliCommand('autopus mcp set <name> \'{"command":"uvx","args":["context7-mcp"]}\'')}.`,
        );
        return;
      }
      defaultRuntime.log(`MCP servers (${loaded.path}):`);
      for (const name of names) {
        defaultRuntime.log(`- ${name}`);
      }
    });

  mcp
    .command("show")
    .description(t("desc.show_one_configured_mcp_server_or_the_full_mcp_config"))
    .argument("[name]", "MCP server name")
    .option("--json", t("opt.print_json"))
    .action(async (name: string | undefined, opts: { json?: boolean }) => {
      const loaded = await listConfiguredMcpServers();
      if (!loaded.ok) {
        fail(loaded.error);
      }
      const value = name ? loaded.mcpServers[name] : loaded.mcpServers;
      if (name && !value) {
        fail(
          `No MCP server named "${name}" in ${loaded.path}. Run ${formatCliCommand("autopus mcp list")} to see configured servers.`,
        );
      }
      if (opts.json) {
        printJson(value ?? {});
        return;
      }
      if (name) {
        defaultRuntime.log(`MCP server "${name}" (${loaded.path}):`);
      } else {
        defaultRuntime.log(`MCP servers (${loaded.path}):`);
      }
      printJson(value ?? {});
    });

  mcp
    .command("set")
    .description(t("desc.set_one_configured_mcp_server_from_a_json_object"))
    .argument("<name>", "MCP server name")
    .argument("<value>", 'JSON object, for example {"command":"uvx","args":["context7-mcp"]}')
    .action(async (name: string, rawValue: string) => {
      const parsed = parseConfigValue(rawValue);
      if (parsed.error) {
        fail(parsed.error);
      }
      const result = await setConfiguredMcpServer({ name, server: parsed.value });
      if (!result.ok) {
        fail(result.error);
      }
      defaultRuntime.log(`Saved MCP server "${name}" to ${result.path}.`);
    });

  mcp
    .command("unset")
    .description(t("desc.remove_one_configured_mcp_server"))
    .argument("<name>", "MCP server name")
    .action(async (name: string) => {
      const result = await unsetConfiguredMcpServer({ name });
      if (!result.ok) {
        fail(result.error);
      }
      if (!result.removed) {
        fail(
          `No MCP server named "${name}" in ${result.path}. Run ${formatCliCommand("autopus mcp list")} to see configured servers.`,
        );
      }
      defaultRuntime.log(`Removed MCP server "${name}" from ${result.path}.`);
    });

  applyParentDefaultHelpAction(mcp);
}
