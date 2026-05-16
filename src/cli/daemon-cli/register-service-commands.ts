import type { Command } from "commander";
import { t } from "../../i18n/cli/translate.js";
import { createLazyImportLoader } from "../../shared/lazy-promise.js";
import { inheritOptionFromParent } from "../command-options.js";
import type { DaemonInstallOptions, DaemonLifecycleOptions, GatewayRpcOpts } from "./types.js";

const daemonInstallModuleLoader = createLazyImportLoader(() => import("./install.runtime.js"));
const daemonLifecycleModuleLoader = createLazyImportLoader(() => import("./lifecycle.runtime.js"));
const daemonStatusModuleLoader = createLazyImportLoader(() => import("./status.runtime.js"));

function loadDaemonInstallModule() {
  return daemonInstallModuleLoader.load();
}

function loadDaemonLifecycleModule() {
  return daemonLifecycleModuleLoader.load();
}

function loadDaemonStatusModule() {
  return daemonStatusModuleLoader.load();
}

function resolveInstallOptions(
  cmdOpts: DaemonInstallOptions,
  command?: Command,
): DaemonInstallOptions {
  const parentForce = inheritOptionFromParent<boolean>(command, "force");
  const parentPort = inheritOptionFromParent<string>(command, "port");
  const parentToken = inheritOptionFromParent<string>(command, "token");
  return {
    ...cmdOpts,
    force: Boolean(cmdOpts.force || parentForce),
    port: cmdOpts.port ?? parentPort,
    token: cmdOpts.token ?? parentToken,
  };
}

function resolveRpcOptions(cmdOpts: GatewayRpcOpts, command?: Command): GatewayRpcOpts {
  const parentToken = inheritOptionFromParent<string>(command, "token");
  const parentPassword = inheritOptionFromParent<string>(command, "password");
  return {
    ...cmdOpts,
    token: cmdOpts.token ?? parentToken,
    password: cmdOpts.password ?? parentPassword,
  };
}

function resolveRestartOptions(cmdOpts: DaemonLifecycleOptions, command?: Command) {
  const parentForce = inheritOptionFromParent<boolean>(command, "force");
  return {
    ...cmdOpts,
    force: Boolean(cmdOpts.force || parentForce),
    safe: Boolean(cmdOpts.safe),
  };
}

export function addGatewayServiceCommands(parent: Command, opts?: { statusDescription?: string }) {
  parent
    .command("status")
    .description(
      opts?.statusDescription ?? "Show gateway service status + probe connectivity/capability",
    )
    .option("--url <url>", t("opt.gateway_websocket_url_defaults_to_config_remote_local"))
    .option("--token <token>", t("opt.gateway_token_if_required"))
    .option("--password <password>", t("opt.gateway_password_password_auth"))
    .option("--timeout <ms>", t("opt.timeout_in_ms"), "10000")
    .option("--no-probe", t("opt.skip_rpc_probe"))
    .option("--require-rpc", t("opt.exit_non_zero_when_the_rpc_probe_fails"), false)
    .option("--deep", t("opt.scan_system_level_services"), false)
    .option("--json", t("opt.output_json"), false)
    .action(async (cmdOpts, command) => {
      const { runDaemonStatus } = await loadDaemonStatusModule();
      await runDaemonStatus({
        rpc: resolveRpcOptions(cmdOpts, command),
        probe: Boolean(cmdOpts.probe),
        requireRpc: Boolean(cmdOpts.requireRpc),
        deep: Boolean(cmdOpts.deep),
        json: Boolean(cmdOpts.json),
      });
    });

  parent
    .command("install")
    .description(t("desc.install_the_gateway_service_launchd_systemd_schtasks"))
    .option("--port <port>", t("opt.gateway_port"))
    .option("--runtime <runtime>", t("opt.daemon_runtime_node_bun_default_node"))
    .option("--token <token>", t("opt.gateway_token_token_auth"))
    .option("--wrapper <path>", t("opt.executable_wrapper_for_generated_service_programarguments"))
    .option("--force", t("opt.reinstall_overwrite_if_already_installed"), false)
    .option("--json", t("opt.output_json"), false)
    .action(async (cmdOpts, command) => {
      const { runDaemonInstall } = await loadDaemonInstallModule();
      await runDaemonInstall(resolveInstallOptions(cmdOpts, command));
    });

  parent
    .command("uninstall")
    .description(t("desc.uninstall_the_gateway_service_launchd_systemd_schtasks"))
    .option("--json", t("opt.output_json"), false)
    .action(async (cmdOpts) => {
      const { runDaemonUninstall } = await loadDaemonLifecycleModule();
      await runDaemonUninstall(cmdOpts);
    });

  parent
    .command("start")
    .description(t("desc.start_the_gateway_service_launchd_systemd_schtasks"))
    .option("--json", t("opt.output_json"), false)
    .action(async (cmdOpts) => {
      const { runDaemonStart } = await loadDaemonLifecycleModule();
      await runDaemonStart(cmdOpts);
    });

  parent
    .command("stop")
    .description(t("desc.stop_the_gateway_service_launchd_systemd_schtasks"))
    .option("--json", t("opt.output_json"), false)
    .option(
      "--disable",
      "Persistently suppress KeepAlive/RunAtLoad so the gateway does not respawn until next start (launchd only)",
      false,
    )
    .action(async (cmdOpts) => {
      const { runDaemonStop } = await loadDaemonLifecycleModule();
      await runDaemonStop(cmdOpts);
    });

  parent
    .command("restart")
    .description(t("desc.restart_the_gateway_service_launchd_systemd_schtasks"))
    .option("--force", t("opt.restart_immediately_without_waiting_for_active_gateway_work"), false)
    .option("--safe", t("opt.request_an_autopus_aware_restart_after_active_work_drains"), false)
    .option("--skip-deferral", t("opt.bypass_the_safe_restart_deferral_gate_requires_safe"), false)
    .option(
      "--wait <duration>",
      "Wait duration before forcing restart (ms, 10s, 5m; 0 waits indefinitely)",
    )
    .option("--json", t("opt.output_json"), false)
    .action(async (cmdOpts, command) => {
      const { runDaemonRestart } = await loadDaemonLifecycleModule();
      await runDaemonRestart(resolveRestartOptions(cmdOpts, command));
    });
}
