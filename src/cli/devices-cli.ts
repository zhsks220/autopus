import type { Command } from "commander";
import { t } from "../i18n/cli/translate.js";
import { applyParentDefaultHelpAction } from "./program/parent-default-help.js";

type DevicesRpcOpts = {
  url?: string;
  token?: string;
  password?: string;
  timeout?: string;
  json?: boolean;
  latest?: boolean;
  yes?: boolean;
  pending?: boolean;
  device?: string;
  role?: string;
  scope?: string[];
};

const DEFAULT_DEVICES_TIMEOUT_MS = 10_000;

const devicesCallOpts = (cmd: Command, defaults?: { timeoutMs?: number }) =>
  cmd
    .option(
      "--url <url>",
      t("opt.gateway_websocket_url_defaults_to_gateway_remote_url_when_configured"),
    )
    .option("--token <token>", t("opt.gateway_token_if_required"))
    .option("--password <password>", t("opt.gateway_password_password_auth"))
    .option(
      "--timeout <ms>",
      "Timeout in ms",
      String(defaults?.timeoutMs ?? DEFAULT_DEVICES_TIMEOUT_MS),
    )
    .option("--json", t("opt.output_json"), false);

export function registerDevicesCli(program: Command) {
  const devices = program.command("devices").description(t("desc.device_pairing_and_auth_tokens"));

  devicesCallOpts(
    devices
      .command("list")
      .description(t("desc.list_pending_and_paired_devices"))
      .action(async (opts: DevicesRpcOpts) => {
        const { runDevicesListCommand } = await import("./devices-cli.runtime.js");
        await runDevicesListCommand(opts);
      }),
  );

  devicesCallOpts(
    devices
      .command("remove")
      .description(t("desc.remove_a_paired_device_entry"))
      .argument("<deviceId>", "Paired device id")
      .action(async (deviceId: string, opts: DevicesRpcOpts) => {
        const { runDevicesRemoveCommand } = await import("./devices-cli.runtime.js");
        await runDevicesRemoveCommand(deviceId, opts);
      }),
  );

  devicesCallOpts(
    devices
      .command("clear")
      .description(t("desc.clear_paired_devices_from_the_gateway_table"))
      .option("--pending", t("opt.also_reject_all_pending_pairing_requests"), false)
      .option("--yes", t("opt.confirm_destructive_clear"), false)
      .action(async (opts: DevicesRpcOpts) => {
        const { runDevicesClearCommand } = await import("./devices-cli.runtime.js");
        await runDevicesClearCommand(opts);
      }),
  );

  devicesCallOpts(
    devices
      .command("approve")
      .description(t("desc.approve_a_pending_device_pairing_request"))
      .argument("[requestId]", "Pending request id")
      .option(
        "--latest",
        t("opt.show_the_most_recent_pending_request_to_approve_explicitly"),
        false,
      )
      .action(async (requestId: string | undefined, opts: DevicesRpcOpts) => {
        const { runDevicesApproveCommand } = await import("./devices-cli.runtime.js");
        await runDevicesApproveCommand(requestId, opts);
      }),
  );

  devicesCallOpts(
    devices
      .command("reject")
      .description(t("desc.reject_a_pending_device_pairing_request"))
      .argument("<requestId>", "Pending request id")
      .action(async (requestId: string, opts: DevicesRpcOpts) => {
        const { runDevicesRejectCommand } = await import("./devices-cli.runtime.js");
        await runDevicesRejectCommand(requestId, opts);
      }),
  );

  devicesCallOpts(
    devices
      .command("rotate")
      .description(t("desc.rotate_a_device_token_for_a_role"))
      .requiredOption("--device <id>", "Device id")
      .requiredOption("--role <role>", "Role name")
      .option("--scope <scope...>", t("opt.scopes_to_attach_to_the_token_repeatable"))
      .action(async (opts: DevicesRpcOpts) => {
        const { runDevicesRotateCommand } = await import("./devices-cli.runtime.js");
        await runDevicesRotateCommand(opts);
      }),
  );

  devicesCallOpts(
    devices
      .command("revoke")
      .description(t("desc.revoke_a_device_token_for_a_role"))
      .requiredOption("--device <id>", "Device id")
      .requiredOption("--role <role>", "Role name")
      .action(async (opts: DevicesRpcOpts) => {
        const { runDevicesRevokeCommand } = await import("./devices-cli.runtime.js");
        await runDevicesRevokeCommand(opts);
      }),
  );

  applyParentDefaultHelpAction(devices);
}
