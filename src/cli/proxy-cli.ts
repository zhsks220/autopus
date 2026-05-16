import type { Command } from "commander";
import { t } from "../i18n/cli/translate.js";
import type { CaptureQueryPreset } from "../proxy-capture/types.js";
import { createLazyImportLoader } from "../shared/lazy-promise.js";

type ProxyCliRuntime = typeof import("./proxy-cli.runtime.js");

const proxyCliRuntimeLoader = createLazyImportLoader<ProxyCliRuntime>(
  () => import("./proxy-cli.runtime.js"),
);

async function loadProxyCliRuntime(): Promise<ProxyCliRuntime> {
  return await proxyCliRuntimeLoader.load();
}

function parseOptionalNumber(value: string | undefined): number | undefined {
  if (!value) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function collectOption(value: string, previous: string[] | undefined): string[] {
  return [...(previous ?? []), value];
}

export function registerProxyCli(program: Command) {
  const proxy = program
    .command("proxy")
    .description(t("desc.run_the_autopus_debug_proxy_and_inspect_captured_traffic"));

  proxy
    .command("start")
    .description(t("desc.start_the_local_explicit_debug_proxy"))
    .option("--host <host>", t("opt.bind_host"), "127.0.0.1")
    .option("--port <port>", t("opt.bind_port"), parseOptionalNumber)
    .action(async (opts: { host?: string; port?: number }) => {
      const runtime = await loadProxyCliRuntime();
      await runtime.runDebugProxyStartCommand(opts);
    });

  proxy
    .command("run")
    .description(t("desc.run_a_child_command_with_autopus_debug_proxy_capture_enabled"))
    .allowUnknownOption(true)
    .allowExcessArguments(true)
    .option("--host <host>", t("opt.bind_host"), "127.0.0.1")
    .option("--port <port>", t("opt.bind_port"), parseOptionalNumber)
    .argument("[cmd...]", "Command to run after --")
    .action(async (cmd: string[], opts: { host?: string; port?: number }) => {
      const runtime = await loadProxyCliRuntime();
      await runtime.runDebugProxyRunCommand({
        host: opts.host,
        port: opts.port,
        commandArgs: cmd,
      });
    });

  proxy
    .command("validate")
    .description(t("desc.validate_the_operator_managed_network_proxy"))
    .option("--json", t("opt.print_machine_readable_json"))
    .option("--proxy-url <url>", t("opt.proxy_url_to_validate_instead_of_config_env"))
    .option(
      "--allowed-url <url>",
      "Destination expected to succeed through the proxy",
      collectOption,
    )
    .option(
      "--denied-url <url>",
      t("opt.destination_expected_to_be_blocked_by_the_proxy"),
      collectOption,
    )
    .option(
      "--apns-reachable",
      t("opt.also_verify_sandbox_apns_http_2_is_reachable_through_the_proxy"),
    )
    .option("--apns-authority <url>", t("opt.apns_authority_to_probe_with_apns_reachable"))
    .option("--timeout-ms <ms>", t("opt.per_request_timeout_in_milliseconds"), parseOptionalNumber)
    .action(
      async (opts: {
        json?: boolean;
        proxyUrl?: string;
        allowedUrl?: string[];
        deniedUrl?: string[];
        apnsReachable?: boolean;
        apnsAuthority?: string;
        timeoutMs?: number;
      }) => {
        const runtime = await loadProxyCliRuntime();
        await runtime.runProxyValidateCommand({
          json: opts.json,
          proxyUrl: opts.proxyUrl,
          allowedUrls: opts.allowedUrl,
          deniedUrls: opts.deniedUrl,
          apnsReachability: opts.apnsReachable,
          apnsAuthority: opts.apnsAuthority,
          timeoutMs: opts.timeoutMs,
        });
      },
    );

  proxy
    .command("coverage")
    .description(t("desc.report_current_debug_proxy_transport_coverage_and_remaining_gaps"))
    .action(async () => {
      const runtime = await loadProxyCliRuntime();
      await runtime.runDebugProxyCoverageCommand();
    });

  proxy
    .command("sessions")
    .description(t("desc.list_recent_capture_sessions"))
    .option("--limit <count>", t("opt.maximum_sessions_to_show"), parseOptionalNumber)
    .action(async (opts: { limit?: number }) => {
      const runtime = await loadProxyCliRuntime();
      await runtime.runDebugProxySessionsCommand(opts);
    });

  proxy
    .command("query")
    .description(t("desc.run_a_built_in_query_preset_against_captured_traffic"))
    .requiredOption(
      "--preset <name>",
      "Query preset: double-sends, retry-storms, cache-busting, ws-duplicate-frames, missing-ack, error-bursts",
    )
    .option("--session <id>", t("opt.restrict_to_a_capture_session_id"))
    .action(async (opts: { preset: CaptureQueryPreset; session?: string }) => {
      const runtime = await loadProxyCliRuntime();
      await runtime.runDebugProxyQueryCommand({
        preset: opts.preset,
        sessionId: opts.session,
      });
    });

  proxy
    .command("blob")
    .description(t("desc.read_a_captured_payload_blob_by_id"))
    .requiredOption("--id <blobId>", "Blob id")
    .action(async (opts: { id: string }) => {
      const runtime = await loadProxyCliRuntime();
      await runtime.readDebugProxyBlobCommand({ blobId: opts.id });
    });

  proxy
    .command("purge")
    .description(t("desc.delete_all_captured_traffic_metadata_and_blobs"))
    .action(async () => {
      const runtime = await loadProxyCliRuntime();
      await runtime.runDebugProxyPurgeCommand();
    });
}
