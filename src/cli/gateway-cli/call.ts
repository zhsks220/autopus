import type { Command } from "commander";
import type { AutopusConfig } from "../../config/types.autopus.js";
import { callGateway } from "../../gateway/call.js";
import { GATEWAY_CLIENT_MODES, GATEWAY_CLIENT_NAMES } from "../../gateway/protocol/client-info.js";
import { t } from "../../i18n/cli/translate.js";
import { withProgress } from "../progress.js";

export type GatewayRpcOpts = {
  config?: AutopusConfig;
  url?: string;
  token?: string;
  password?: string;
  timeout?: string;
  expectFinal?: boolean;
  json?: boolean;
};

export const gatewayCallOpts = (cmd: Command) =>
  cmd
    .option(
      "--url <url>",
      t("opt.gateway_websocket_url_defaults_to_gateway_remote_url_when_configured"),
    )
    .option("--token <token>", t("opt.gateway_token_if_required"))
    .option("--password <password>", t("opt.gateway_password_password_auth"))
    .option("--timeout <ms>", t("opt.timeout_in_ms"), "10000")
    .option("--expect-final", t("opt.wait_for_final_response_agent"), false)
    .option("--json", t("opt.output_json"), false);

export const callGatewayCli = async (method: string, opts: GatewayRpcOpts, params?: unknown) =>
  withProgress(
    {
      label: `Gateway ${method}`,
      indeterminate: true,
      enabled: opts.json !== true,
    },
    async () =>
      await callGateway({
        config: opts.config,
        url: opts.url,
        token: opts.token,
        password: opts.password,
        method,
        params,
        expectFinal: Boolean(opts.expectFinal),
        timeoutMs: Number(opts.timeout ?? 10_000),
        clientName: GATEWAY_CLIENT_NAMES.CLI,
        mode: GATEWAY_CLIENT_MODES.CLI,
      }),
  );
