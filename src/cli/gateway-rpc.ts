import type { Command } from "commander";
import type { OperatorScope } from "../gateway/operator-scopes.js";
import type { GatewayClientMode, GatewayClientName } from "../gateway/protocol/client-info.js";
import { t } from "../i18n/cli/translate.js";
import type { DeviceIdentity } from "../infra/device-identity.js";
import { createLazyImportLoader } from "../shared/lazy-promise.js";
import type { GatewayRpcOpts } from "./gateway-rpc.types.js";
export type { GatewayRpcOpts } from "./gateway-rpc.types.js";

type GatewayRpcRuntimeModule = typeof import("./gateway-rpc.runtime.js");

const gatewayRpcRuntimeLoader = createLazyImportLoader<GatewayRpcRuntimeModule>(
  () => import("./gateway-rpc.runtime.js"),
);

async function loadGatewayRpcRuntime(): Promise<GatewayRpcRuntimeModule> {
  return gatewayRpcRuntimeLoader.load();
}

export function addGatewayClientOptions(cmd: Command) {
  return cmd
    .option(
      "--url <url>",
      t("opt.gateway_websocket_url_defaults_to_gateway_remote_url_when_configured"),
    )
    .option("--token <token>", t("opt.gateway_token_if_required"))
    .option("--timeout <ms>", t("opt.timeout_in_ms"), "30000")
    .option("--expect-final", t("opt.wait_for_final_response_agent"), false);
}

export async function callGatewayFromCli(
  method: string,
  opts: GatewayRpcOpts,
  params?: unknown,
  extra?: {
    clientName?: GatewayClientName;
    mode?: GatewayClientMode;
    deviceIdentity?: DeviceIdentity | null;
    expectFinal?: boolean;
    progress?: boolean;
    scopes?: OperatorScope[];
  },
) {
  const runtime = await loadGatewayRpcRuntime();
  return await runtime.callGatewayFromCliRuntime(method, opts, params, extra);
}
