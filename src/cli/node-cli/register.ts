import type { Command } from "commander";
import { t } from "../../i18n/cli/translate.js";
import { loadNodeHostConfig } from "../../node-host/config.js";
import { runNodeHost } from "../../node-host/runner.js";
import { normalizeOptionalString } from "../../shared/string-coerce.js";
import { formatDocsLink } from "../../terminal/links.js";
import { theme } from "../../terminal/theme.js";
import { parsePort } from "../daemon-cli/shared.js";
import { formatHelpExamples } from "../help-format.js";
import {
  runNodeDaemonInstall,
  runNodeDaemonRestart,
  runNodeDaemonStart,
  runNodeDaemonStatus,
  runNodeDaemonStop,
  runNodeDaemonUninstall,
} from "./daemon.js";

function parsePortWithFallback(value: unknown, fallback: number): number {
  const parsed = parsePort(value);
  return parsed ?? fallback;
}

export function registerNodeCli(program: Command) {
  const node = program
    .command("node")
    .description(t("desc.run_and_manage_the_headless_node_host_service"))
    .addHelpText(
      "after",
      () =>
        `\n${theme.heading("Examples:")}\n${formatHelpExamples([
          [
            "autopus node run --host 127.0.0.1 --port 18789",
            "Run the node host in the foreground.",
          ],
          ["autopus node status", "Check node host service status."],
          ["autopus node install", "Install the node host service."],
          ["autopus node start", "Start the installed node host service."],
          ["autopus node restart", "Restart the installed node host service."],
        ])}\n\n${theme.muted("Docs:")} ${formatDocsLink("/cli/node", "docs.autopus.ai/cli/node")}\n`,
    );

  node
    .command("run")
    .description(t("desc.run_the_headless_node_host_foreground"))
    .option("--host <host>", t("opt.gateway_host"))
    .option("--port <port>", t("opt.gateway_port"))
    .option("--tls", t("opt.use_tls_for_the_gateway_connection"), false)
    .option("--tls-fingerprint <sha256>", t("opt.expected_tls_certificate_fingerprint_sha256"))
    .option("--node-id <id>", t("opt.override_node_id_clears_pairing_token"))
    .option("--display-name <name>", t("opt.override_node_display_name"))
    .action(async (opts) => {
      const existing = await loadNodeHostConfig();
      const host =
        normalizeOptionalString(opts.host as string | undefined) ||
        existing?.gateway?.host ||
        "127.0.0.1";
      const port = parsePortWithFallback(opts.port, existing?.gateway?.port ?? 18789);
      await runNodeHost({
        gatewayHost: host,
        gatewayPort: port,
        gatewayTls: Boolean(opts.tls) || Boolean(opts.tlsFingerprint),
        gatewayTlsFingerprint: opts.tlsFingerprint,
        nodeId: opts.nodeId,
        displayName: opts.displayName,
      });
    });

  node
    .command("status")
    .description(t("desc.show_node_host_status"))
    .option("--json", t("opt.output_json"), false)
    .action(async (opts) => {
      await runNodeDaemonStatus(opts);
    });

  node
    .command("install")
    .description(t("desc.install_the_node_host_service_launchd_systemd_schtasks"))
    .option("--host <host>", t("opt.gateway_host"))
    .option("--port <port>", t("opt.gateway_port"))
    .option("--tls", t("opt.use_tls_for_the_gateway_connection"), false)
    .option("--tls-fingerprint <sha256>", t("opt.expected_tls_certificate_fingerprint_sha256"))
    .option("--node-id <id>", t("opt.override_node_id_clears_pairing_token"))
    .option("--display-name <name>", t("opt.override_node_display_name"))
    .option("--runtime <runtime>", t("opt.service_runtime_node_bun_default_node"))
    .option("--force", t("opt.reinstall_overwrite_if_already_installed"), false)
    .option("--json", t("opt.output_json"), false)
    .action(async (opts) => {
      await runNodeDaemonInstall(opts);
    });

  node
    .command("uninstall")
    .description(t("desc.uninstall_the_node_host_service_launchd_systemd_schtasks"))
    .option("--json", t("opt.output_json"), false)
    .action(async (opts) => {
      await runNodeDaemonUninstall(opts);
    });

  node
    .command("stop")
    .description(t("desc.stop_the_node_host_service_launchd_systemd_schtasks"))
    .option("--json", t("opt.output_json"), false)
    .action(async (opts) => {
      await runNodeDaemonStop(opts);
    });

  node
    .command("start")
    .description(t("desc.start_the_node_host_service_launchd_systemd_schtasks"))
    .option("--json", t("opt.output_json"), false)
    .action(async (opts) => {
      await runNodeDaemonStart(opts);
    });

  node
    .command("restart")
    .description(t("desc.restart_the_node_host_service_launchd_systemd_schtasks"))
    .option("--json", t("opt.output_json"), false)
    .action(async (opts) => {
      await runNodeDaemonRestart(opts);
    });
}
