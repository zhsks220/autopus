import type { Command } from "commander";
import { randomIdempotencyKey } from "../../gateway/call.js";
import { t } from "../../i18n/cli/translate.js";
import { defaultRuntime } from "../../runtime.js";
import { normalizeOptionalString } from "../../shared/string-coerce.js";
import { getNodesTheme, runNodesCommand } from "./cli-utils.js";
import { callGatewayCli, nodesCallOpts, resolveNodeId } from "./rpc.js";
import type { NodesRpcOpts } from "./types.js";

export function registerNodesNotifyCommand(nodes: Command) {
  nodesCallOpts(
    nodes
      .command("notify")
      .description(t("desc.send_a_local_notification_on_a_node_mac_only"))
      .requiredOption("--node <idOrNameOrIp>", "Node id, name, or IP")
      .option("--title <text>", t("opt.notification_title"))
      .option("--body <text>", t("opt.notification_body"))
      .option("--sound <name>", t("opt.notification_sound"))
      .option("--priority <passive|active|timeSensitive>", t("opt.notification_priority"))
      .option("--delivery <system|overlay|auto>", t("opt.delivery_mode"), "system")
      .option("--invoke-timeout <ms>", t("opt.node_invoke_timeout_in_ms_default_15000"), "15000")
      .action(async (opts: NodesRpcOpts) => {
        await runNodesCommand("notify", async () => {
          const nodeId = await resolveNodeId(opts, normalizeOptionalString(opts.node) ?? "");
          const title = normalizeOptionalString(opts.title) ?? "";
          const body = normalizeOptionalString(opts.body) ?? "";
          if (!title && !body) {
            throw new Error("missing --title or --body");
          }
          const invokeTimeout = opts.invokeTimeout
            ? Number.parseInt(opts.invokeTimeout, 10)
            : undefined;
          const invokeParams: Record<string, unknown> = {
            nodeId,
            command: "system.notify",
            params: {
              title,
              body,
              sound: opts.sound,
              priority: opts.priority,
              delivery: opts.delivery,
            },
            idempotencyKey: opts.idempotencyKey ?? randomIdempotencyKey(),
          };
          if (typeof invokeTimeout === "number" && Number.isFinite(invokeTimeout)) {
            invokeParams.timeoutMs = invokeTimeout;
          }

          const result = await callGatewayCli("node.invoke", opts, invokeParams);
          if (opts.json) {
            defaultRuntime.writeJson(result);
            return;
          }
          const { ok } = getNodesTheme();
          defaultRuntime.log(ok("notify ok"));
        });
      }),
  );
}
