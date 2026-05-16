import { normalizeOptionalString } from "autopus/plugin-sdk/string-coerce-runtime";
import type { Command } from "commander";
import { t } from "../../../../src/i18n/cli/translate.js";
import { runCommandWithRuntime } from "../core-api.js";
import { callBrowserRequest, type BrowserParentOpts } from "./browser-cli-shared.js";
import { danger, defaultRuntime, shortenHomePath } from "./core-api.js";

const BROWSER_DEBUG_TIMEOUT_MS = 20000;

type BrowserRequestParams = Parameters<typeof callBrowserRequest>[1];

type DebugContext = {
  parent: BrowserParentOpts;
  profile?: string;
};

function runBrowserDebug(action: () => Promise<void>) {
  return runCommandWithRuntime(defaultRuntime, action, (err) => {
    defaultRuntime.error(danger(String(err)));
    defaultRuntime.exit(1);
  });
}

async function withDebugContext(
  cmd: Command,
  parentOpts: (cmd: Command) => BrowserParentOpts,
  action: (context: DebugContext) => Promise<void>,
) {
  const parent = parentOpts(cmd);
  await runBrowserDebug(() =>
    action({
      parent,
      profile: parent.browserProfile,
    }),
  );
}

function printJsonResult(parent: BrowserParentOpts, result: unknown): boolean {
  if (!parent.json) {
    return false;
  }
  defaultRuntime.writeJson(result);
  return true;
}

async function callDebugRequest<T>(
  parent: BrowserParentOpts,
  params: BrowserRequestParams,
): Promise<T> {
  return callBrowserRequest<T>(parent, params, { timeoutMs: BROWSER_DEBUG_TIMEOUT_MS });
}

function resolveProfileQuery(profile?: string) {
  return profile ? { profile } : undefined;
}

function resolveDebugQuery(params: {
  targetId?: unknown;
  clear?: unknown;
  profile?: string;
  filter?: unknown;
}) {
  return {
    targetId: normalizeOptionalString(params.targetId),
    filter: normalizeOptionalString(params.filter),
    clear: Boolean(params.clear),
    profile: params.profile,
  };
}

export function registerBrowserDebugCommands(
  browser: Command,
  parentOpts: (cmd: Command) => BrowserParentOpts,
) {
  browser
    .command("highlight")
    .description(t("desc.highlight_an_element_by_ref"))
    .argument("<ref>", "Ref id from snapshot")
    .option("--target-id <id>", t("opt.cdp_target_id_or_unique_prefix"))
    .action(async (ref: string, opts, cmd) => {
      await withDebugContext(cmd, parentOpts, async ({ parent, profile }) => {
        const result = await callDebugRequest(parent, {
          method: "POST",
          path: "/highlight",
          query: resolveProfileQuery(profile),
          body: {
            ref: ref.trim(),
            targetId: normalizeOptionalString(opts.targetId),
          },
        });
        if (printJsonResult(parent, result)) {
          return;
        }
        defaultRuntime.log(`highlighted ${ref.trim()}`);
      });
    });

  browser
    .command("errors")
    .description(t("desc.get_recent_page_errors"))
    .option("--clear", t("opt.clear_stored_errors_after_reading"), false)
    .option("--target-id <id>", t("opt.cdp_target_id_or_unique_prefix"))
    .action(async (opts, cmd) => {
      await withDebugContext(cmd, parentOpts, async ({ parent, profile }) => {
        const result = await callDebugRequest<{
          errors: Array<{ timestamp: string; name?: string; message: string }>;
        }>(parent, {
          method: "GET",
          path: "/errors",
          query: resolveDebugQuery({
            targetId: opts.targetId,
            clear: opts.clear,
            profile,
          }),
        });
        if (printJsonResult(parent, result)) {
          return;
        }
        if (!result.errors.length) {
          defaultRuntime.log("No page errors.");
          return;
        }
        defaultRuntime.log(
          result.errors
            .map((e) => `${e.timestamp} ${e.name ? `${e.name}: ` : ""}${e.message}`)
            .join("\n"),
        );
      });
    });

  browser
    .command("requests")
    .description(t("desc.get_recent_network_requests_best_effort"))
    .option("--filter <text>", t("opt.only_show_urls_that_contain_this_substring"))
    .option("--clear", t("opt.clear_stored_requests_after_reading"), false)
    .option("--target-id <id>", t("opt.cdp_target_id_or_unique_prefix"))
    .action(async (opts, cmd) => {
      await withDebugContext(cmd, parentOpts, async ({ parent, profile }) => {
        const result = await callDebugRequest<{
          requests: Array<{
            timestamp: string;
            method: string;
            status?: number;
            ok?: boolean;
            url: string;
            failureText?: string;
          }>;
        }>(parent, {
          method: "GET",
          path: "/requests",
          query: resolveDebugQuery({
            targetId: opts.targetId,
            filter: opts.filter,
            clear: opts.clear,
            profile,
          }),
        });
        if (printJsonResult(parent, result)) {
          return;
        }
        if (!result.requests.length) {
          defaultRuntime.log("No requests recorded.");
          return;
        }
        defaultRuntime.log(
          result.requests
            .map((r) => {
              const status = typeof r.status === "number" ? ` ${r.status}` : "";
              const ok = r.ok === true ? " ok" : r.ok === false ? " fail" : "";
              const fail = r.failureText ? ` (${r.failureText})` : "";
              return `${r.timestamp} ${r.method}${status}${ok} ${r.url}${fail}`;
            })
            .join("\n"),
        );
      });
    });

  const trace = browser.command("trace").description(t("desc.record_a_playwright_trace"));

  trace
    .command("start")
    .description(t("desc.start_trace_recording"))
    .option("--target-id <id>", t("opt.cdp_target_id_or_unique_prefix"))
    .option("--no-screenshots", t("opt.disable_screenshots"))
    .option("--no-snapshots", t("opt.disable_snapshots"))
    .option("--sources", t("opt.include_sources_bigger_traces"), false)
    .action(async (opts, cmd) => {
      await withDebugContext(cmd, parentOpts, async ({ parent, profile }) => {
        const result = await callDebugRequest(parent, {
          method: "POST",
          path: "/trace/start",
          query: resolveProfileQuery(profile),
          body: {
            targetId: normalizeOptionalString(opts.targetId),
            screenshots: Boolean(opts.screenshots),
            snapshots: Boolean(opts.snapshots),
            sources: Boolean(opts.sources),
          },
        });
        if (printJsonResult(parent, result)) {
          return;
        }
        defaultRuntime.log("trace started");
      });
    });

  trace
    .command("stop")
    .description(t("desc.stop_trace_recording_and_write_a_zip"))
    .option(
      "--out <path>",
      "Output path within autopus temp dir (e.g. trace.zip or /tmp/autopus/trace.zip)",
    )
    .option("--target-id <id>", t("opt.cdp_target_id_or_unique_prefix"))
    .action(async (opts, cmd) => {
      await withDebugContext(cmd, parentOpts, async ({ parent, profile }) => {
        const result = await callDebugRequest<{ path: string }>(parent, {
          method: "POST",
          path: "/trace/stop",
          query: resolveProfileQuery(profile),
          body: {
            targetId: normalizeOptionalString(opts.targetId),
            path: normalizeOptionalString(opts.out),
          },
        });
        if (printJsonResult(parent, result)) {
          return;
        }
        defaultRuntime.log(`TRACE:${shortenHomePath(result.path)}`);
      });
    });
}
