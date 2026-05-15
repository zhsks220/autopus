import type { Command } from "commander";
import { t } from "../../i18n/cli/translate.js";
import { defaultRuntime } from "../../runtime.js";
import { shortenHomePath } from "../../utils.js";
import {
  parseScreenRecordPayload,
  screenRecordTempPath,
  writeScreenRecordToFile,
} from "../nodes-screen.js";
import { parseDurationMs } from "../parse-duration.js";
import { runNodesCommand } from "./cli-utils.js";
import { buildNodeInvokeParams, callGatewayCli, nodesCallOpts, resolveNodeId } from "./rpc.js";
import type { NodesRpcOpts } from "./types.js";

export function registerNodesScreenCommands(nodes: Command) {
  const screen = nodes
    .command("screen")
    .description(t("desc.capture_screen_recordings_from_a_paired_node"));

  nodesCallOpts(
    screen
      .command("record")
      .description(t("desc.capture_a_short_screen_recording_from_a_node_prints_media_path"))
      .requiredOption("--node <idOrNameOrIp>", "Node id, name, or IP")
      .option("--screen <index>", t("opt.screen_index_0_primary"), "0")
      .option("--duration <ms|10s>", t("opt.clip_duration_ms_or_10s"), "10000")
      .option("--fps <fps>", t("opt.frames_per_second"), "10")
      .option("--no-audio", t("opt.disable_microphone_audio_capture"))
      .option("--out <path>", t("opt.output_path"))
      .option("--invoke-timeout <ms>", t("opt.node_invoke_timeout_in_ms_default_120000"), "120000")
      .action(async (opts: NodesRpcOpts & { out?: string }) => {
        await runNodesCommand("screen record", async () => {
          const nodeId = await resolveNodeId(opts, opts.node ?? "");
          const durationMs = parseDurationMs(opts.duration ?? "");
          const screenIndex = Number.parseInt(opts.screen ?? "0", 10);
          const fps = Number.parseFloat(opts.fps ?? "10");
          const timeoutMs = opts.invokeTimeout
            ? Number.parseInt(opts.invokeTimeout, 10)
            : undefined;

          const invokeParams = buildNodeInvokeParams({
            nodeId,
            command: "screen.record",
            params: {
              durationMs: Number.isFinite(durationMs) ? durationMs : undefined,
              screenIndex: Number.isFinite(screenIndex) ? screenIndex : undefined,
              fps: Number.isFinite(fps) ? fps : undefined,
              format: "mp4",
              includeAudio: opts.audio !== false,
            },
            timeoutMs,
          });

          const raw = await callGatewayCli("node.invoke", opts, invokeParams);
          const res = typeof raw === "object" && raw !== null ? (raw as { payload?: unknown }) : {};
          const parsed = parseScreenRecordPayload(res.payload);
          const filePath = opts.out ?? screenRecordTempPath({ ext: parsed.format || "mp4" });
          const written = await writeScreenRecordToFile(filePath, parsed.base64);

          if (opts.json) {
            defaultRuntime.writeJson({
              file: {
                path: written.path,
                durationMs: parsed.durationMs,
                fps: parsed.fps,
                screenIndex: parsed.screenIndex,
                hasAudio: parsed.hasAudio,
              },
            });
            return;
          }
          defaultRuntime.log(`MEDIA:${shortenHomePath(written.path)}`);
        });
      }),
    { timeoutMs: 180_000 },
  );
}
