import { normalizeOptionalString } from "autopus/plugin-sdk/string-coerce-runtime";
import type { Command } from "commander";
import { t } from "../../../../src/i18n/cli/translate.js";
import { runCommandWithRuntime } from "../core-api.js";
import { callBrowserRequest, type BrowserParentOpts } from "./browser-cli-shared.js";
import { danger, defaultRuntime, shortenHomePath } from "./core-api.js";

function runBrowserObserve(action: () => Promise<void>) {
  return runCommandWithRuntime(defaultRuntime, action, (err) => {
    defaultRuntime.error(danger(String(err)));
    defaultRuntime.exit(1);
  });
}

export function registerBrowserActionObserveCommands(
  browser: Command,
  parentOpts: (cmd: Command) => BrowserParentOpts,
) {
  browser
    .command("console")
    .description(t("desc.get_recent_console_messages"))
    .option("--level <level>", t("opt.filter_by_level_error_warn_info"))
    .option("--target-id <id>", t("opt.cdp_target_id_or_unique_prefix"))
    .action(async (opts, cmd) => {
      const parent = parentOpts(cmd);
      const profile = parent?.browserProfile;
      await runBrowserObserve(async () => {
        const result = await callBrowserRequest<{ messages: unknown[] }>(
          parent,
          {
            method: "GET",
            path: "/console",
            query: {
              level: normalizeOptionalString(opts.level),
              targetId: normalizeOptionalString(opts.targetId),
              profile,
            },
          },
          { timeoutMs: 20000 },
        );
        if (parent?.json) {
          defaultRuntime.writeJson(result);
          return;
        }
        defaultRuntime.writeJson(result.messages);
      });
    });

  browser
    .command("pdf")
    .description(t("desc.save_page_as_pdf"))
    .option("--target-id <id>", t("opt.cdp_target_id_or_unique_prefix"))
    .action(async (opts, cmd) => {
      const parent = parentOpts(cmd);
      const profile = parent?.browserProfile;
      await runBrowserObserve(async () => {
        const result = await callBrowserRequest<{ path: string }>(
          parent,
          {
            method: "POST",
            path: "/pdf",
            query: profile ? { profile } : undefined,
            body: { targetId: normalizeOptionalString(opts.targetId) },
          },
          { timeoutMs: 20000 },
        );
        if (parent?.json) {
          defaultRuntime.writeJson(result);
          return;
        }
        defaultRuntime.log(`PDF: ${shortenHomePath(result.path)}`);
      });
    });

  browser
    .command("responsebody")
    .description(t("desc.wait_for_a_network_response_and_return_its_body"))
    .argument("<url>", "URL (exact, substring, or glob like **/api)")
    .option("--target-id <id>", t("opt.cdp_target_id_or_unique_prefix"))
    .option(
      "--timeout-ms <ms>",
      "How long to wait for the response (default: 20000)",
      (v: string) => Number(v),
    )
    .option("--max-chars <n>", t("opt.max_body_chars_to_return_default_200000"), (v: string) =>
      Number(v),
    )
    .action(async (url: string, opts, cmd) => {
      const parent = parentOpts(cmd);
      const profile = parent?.browserProfile;
      await runBrowserObserve(async () => {
        const timeoutMs = Number.isFinite(opts.timeoutMs) ? opts.timeoutMs : undefined;
        const maxChars = Number.isFinite(opts.maxChars) ? opts.maxChars : undefined;
        const result = await callBrowserRequest<{ response: { body: string } }>(
          parent,
          {
            method: "POST",
            path: "/response/body",
            query: profile ? { profile } : undefined,
            body: {
              url,
              targetId: normalizeOptionalString(opts.targetId),
              timeoutMs,
              maxChars,
            },
          },
          { timeoutMs: timeoutMs ?? 20000 },
        );
        if (parent?.json) {
          defaultRuntime.writeJson(result);
          return;
        }
        defaultRuntime.log(result.response.body);
      });
    });
}
