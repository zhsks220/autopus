import { randomUUID } from "node:crypto";
import type { Command } from "commander";
import { t } from "../../i18n/cli/translate.js";
import { createLazyImportLoader } from "../../shared/lazy-promise.js";
import { resolveNodeFromNodeList } from "../../shared/node-resolve.js";
import { normalizeLowercaseStringOrEmpty } from "../../shared/string-coerce.js";
import { parseNodeList, parsePairingList } from "./format.js";
import type { NodeListNode, NodesRpcOpts } from "./types.js";

type NodesCliRpcRuntimeModule = typeof import("./rpc.runtime.js");

const nodesCliRpcRuntimeLoader = createLazyImportLoader<NodesCliRpcRuntimeModule>(
  () => import("./rpc.runtime.js"),
);

async function loadNodesCliRpcRuntime(): Promise<NodesCliRpcRuntimeModule> {
  return nodesCliRpcRuntimeLoader.load();
}

export const nodesCallOpts = (cmd: Command, defaults?: { timeoutMs?: number }) =>
  cmd
    .option(
      "--url <url>",
      t("opt.gateway_websocket_url_defaults_to_gateway_remote_url_when_configured"),
    )
    .option("--token <token>", t("opt.gateway_token_if_required"))
    .option("--timeout <ms>", t("opt.timeout_in_ms"), String(defaults?.timeoutMs ?? 10_000))
    .option("--json", t("opt.output_json"), false);

export const callGatewayCli = async (
  method: string,
  opts: NodesRpcOpts,
  params?: unknown,
  callOpts?: { transportTimeoutMs?: number },
) => {
  const runtime = await loadNodesCliRpcRuntime();
  return await runtime.callGatewayCliRuntime(method, opts, params, callOpts);
};

export function buildNodeInvokeParams(params: {
  nodeId: string;
  command: string;
  params?: Record<string, unknown>;
  timeoutMs?: number;
  idempotencyKey?: string;
}): Record<string, unknown> {
  const invokeParams: Record<string, unknown> = {
    nodeId: params.nodeId,
    command: params.command,
    params: params.params,
    idempotencyKey: params.idempotencyKey ?? randomUUID(),
  };
  if (typeof params.timeoutMs === "number" && Number.isFinite(params.timeoutMs)) {
    invokeParams.timeoutMs = params.timeoutMs;
  }
  return invokeParams;
}

export function unauthorizedHintForMessage(message: string): string | null {
  const haystack = normalizeLowercaseStringOrEmpty(message);
  if (
    haystack.includes("unauthorizedclient") ||
    haystack.includes("bridge client is not authorized") ||
    haystack.includes("unsigned bridge clients are not allowed")
  ) {
    return [
      "peekaboo bridge rejected the client.",
      "sign the peekaboo CLI (TeamID Y5PE65HELJ) or launch the host with",
      "PEEKABOO_ALLOW_UNSIGNED_SOCKET_CLIENTS=1 for local dev.",
    ].join(" ");
  }
  return null;
}

export async function resolveNodeId(opts: NodesRpcOpts, query: string) {
  return (await resolveNode(opts, query)).nodeId;
}

export async function resolveNode(opts: NodesRpcOpts, query: string): Promise<NodeListNode> {
  let nodes: NodeListNode[] = [];
  try {
    const res = await callGatewayCli("node.list", opts, {});
    nodes = parseNodeList(res);
  } catch {
    const res = await callGatewayCli("node.pair.list", opts, {});
    const { paired } = parsePairingList(res);
    nodes = paired.map((n) => ({
      nodeId: n.nodeId,
      displayName: n.displayName,
      platform: n.platform,
      version: n.version,
      remoteIp: n.remoteIp,
    }));
  }
  return resolveNodeFromNodeList(nodes, query);
}
