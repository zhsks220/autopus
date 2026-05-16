import type { Command } from "commander";
import { randomIdempotencyKey } from "../../gateway/call.js";
import { t } from "../../i18n/cli/translate.js";
import { defaultRuntime } from "../../runtime.js";
import {
  normalizeLowercaseStringOrEmpty,
  normalizeOptionalString,
} from "../../shared/string-coerce.js";
import { getNodesTheme, runNodesCommand } from "./cli-utils.js";
import { callGatewayCli, nodesCallOpts, resolveNodeId } from "./rpc.js";
import type { NodesRpcOpts } from "./types.js";

const BLOCKED_NODE_INVOKE_COMMANDS = new Set(["system.run", "system.run.prepare"]);

export function registerNodesInvokeCommands(nodes: Command) {
  nodesCallOpts(
    nodes
      .command("invoke")
      .description(t("desc.invoke_a_command_on_a_paired_node"))
      .requiredOption("--node <idOrNameOrIp>", "Node id, name, or IP")
      .requiredOption("--command <command>", "Command (e.g. canvas.eval)")
      .option("--params <json>", t("opt.json_object_string_for_params"), "{}")
      .option("--invoke-timeout <ms>", t("opt.node_invoke_timeout_in_ms_default_15000"), "15000")
      .option("--idempotency-key <key>", t("opt.idempotency_key_optional"))
      .action(async (opts: NodesRpcOpts) => {
        await runNodesCommand("invoke", async () => {
          const nodeId = await resolveNodeId(opts, normalizeOptionalString(opts.node) ?? "");
          const command = normalizeOptionalString(opts.command) ?? "";
          if (!nodeId || !command) {
            const { error } = getNodesTheme();
            defaultRuntime.error(error("--node and --command required"));
            defaultRuntime.exit(1);
            return;
          }
          if (BLOCKED_NODE_INVOKE_COMMANDS.has(normalizeLowercaseStringOrEmpty(command))) {
            throw new Error(
              `command "${command}" is reserved for shell execution; use the exec tool with host=node instead`,
            );
          }
          const params = JSON.parse(opts.params ?? "{}") as unknown;
          const timeoutMs = opts.invokeTimeout
            ? Number.parseInt(opts.invokeTimeout, 10)
            : undefined;

          const invokeParams: Record<string, unknown> = {
            nodeId,
            command,
            params,
            idempotencyKey: opts.idempotencyKey ?? randomIdempotencyKey(),
          };
          if (typeof timeoutMs === "number" && Number.isFinite(timeoutMs)) {
            invokeParams.timeoutMs = timeoutMs;
          }

          const result = await callGatewayCli("node.invoke", opts, invokeParams);
          defaultRuntime.writeJson(result);
        });
      }),
    { timeoutMs: 30_000 },
  );
}
