import type { Command } from "commander";
import { danger } from "../globals.js";
import { t } from "../i18n/cli/translate.js";
import { defaultRuntime } from "../runtime.js";
import { normalizeOptionalString } from "../shared/string-coerce.js";
import { formatDocsLink } from "../terminal/links.js";
import { theme } from "../terminal/theme.js";
import { formatCliCommand } from "./command-format.js";
import type { GatewayRpcOpts } from "./gateway-rpc.js";
import { addGatewayClientOptions, callGatewayFromCli } from "./gateway-rpc.js";

type SystemEventOpts = GatewayRpcOpts & {
  text?: string;
  mode?: string;
  sessionKey?: string;
  json?: boolean;
};
type SystemGatewayOpts = GatewayRpcOpts & { json?: boolean };

const normalizeWakeMode = (raw: unknown) => {
  const mode = normalizeOptionalString(raw) ?? "";
  if (!mode) {
    return "next-heartbeat" as const;
  }
  if (mode === "now" || mode === "next-heartbeat") {
    return mode;
  }
  throw new Error("--mode must be now or next-heartbeat");
};

async function runSystemGatewayCommand(
  opts: SystemGatewayOpts,
  action: () => Promise<unknown>,
  successText?: string,
): Promise<void> {
  try {
    const result = await action();
    if (opts.json || successText === undefined) {
      defaultRuntime.writeJson(result);
    } else {
      defaultRuntime.log(successText);
    }
  } catch (err) {
    defaultRuntime.error(danger(String(err)));
    defaultRuntime.exit(1);
  }
}

export function registerSystemCli(program: Command) {
  const system = program
    .command("system")
    .description(t("desc.system_tools_events_heartbeat_presence"))
    .addHelpText(
      "after",
      () =>
        `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/system", "docs.autopus.ai/cli/system")}\n`,
    );

  addGatewayClientOptions(
    system
      .command("event")
      .description(t("desc.enqueue_a_system_event_and_optionally_trigger_a_heartbeat"))
      .requiredOption("--text <text>", "System event text")
      .option("--mode <mode>", t("opt.wake_mode_now_next_heartbeat"), "next-heartbeat")
      .option(
        "--session-key <sessionKey>",
        "Target a specific session for the event (defaults to the agent's main session)",
      )
      .option("--json", t("opt.output_json"), false),
  ).action(async (opts: SystemEventOpts) => {
    await runSystemGatewayCommand(
      opts,
      async () => {
        const text = normalizeOptionalString(opts.text) ?? "";
        if (!text) {
          throw new Error(
            `--text is required. Example: ${formatCliCommand('autopus system event --text "deploy finished"')}.`,
          );
        }
        const mode = normalizeWakeMode(opts.mode);
        const sessionKey = normalizeOptionalString(opts.sessionKey);
        return await callGatewayFromCli(
          "wake",
          opts,
          sessionKey ? { mode, text, sessionKey } : { mode, text },
          { expectFinal: false },
        );
      },
      "ok",
    );
  });

  const heartbeat = system.command("heartbeat").description(t("desc.heartbeat_controls"));

  addGatewayClientOptions(
    heartbeat
      .command("last")
      .description(t("desc.show_the_last_heartbeat_event"))
      .option("--json", t("opt.output_json"), false),
  ).action(async (opts: SystemGatewayOpts) => {
    await runSystemGatewayCommand(opts, async () => {
      return await callGatewayFromCli("last-heartbeat", opts, undefined, {
        expectFinal: false,
      });
    });
  });

  addGatewayClientOptions(
    heartbeat
      .command("enable")
      .description(t("desc.enable_heartbeats"))
      .option("--json", t("opt.output_json"), false),
  ).action(async (opts: SystemGatewayOpts) => {
    await runSystemGatewayCommand(opts, async () => {
      return await callGatewayFromCli(
        "set-heartbeats",
        opts,
        { enabled: true },
        { expectFinal: false },
      );
    });
  });

  addGatewayClientOptions(
    heartbeat
      .command("disable")
      .description(t("desc.disable_heartbeats"))
      .option("--json", t("opt.output_json"), false),
  ).action(async (opts: SystemGatewayOpts) => {
    await runSystemGatewayCommand(opts, async () => {
      return await callGatewayFromCli(
        "set-heartbeats",
        opts,
        { enabled: false },
        { expectFinal: false },
      );
    });
  });

  addGatewayClientOptions(
    system
      .command("presence")
      .description(t("desc.list_system_presence_entries"))
      .option("--json", t("opt.output_json"), false),
  ).action(async (opts: SystemGatewayOpts) => {
    await runSystemGatewayCommand(opts, async () => {
      return await callGatewayFromCli("system-presence", opts, undefined, {
        expectFinal: false,
      });
    });
  });
}
