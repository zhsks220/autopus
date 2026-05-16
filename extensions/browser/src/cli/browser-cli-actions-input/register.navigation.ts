import { normalizeOptionalString } from "autopus/plugin-sdk/string-coerce-runtime";
import type { Command } from "commander";
import { t } from "../../../../../src/i18n/cli/translate.js";
import { runBrowserResizeWithOutput } from "../browser-cli-resize.js";
import { callBrowserRequest, type BrowserParentOpts } from "../browser-cli-shared.js";
import { danger, defaultRuntime } from "../core-api.js";
import { requireRef, resolveBrowserActionContext } from "./shared.js";

export function registerBrowserNavigationCommands(
  browser: Command,
  parentOpts: (cmd: Command) => BrowserParentOpts,
) {
  browser
    .command("navigate")
    .description(t("desc.navigate_the_current_tab_to_a_url"))
    .argument("<url>", "URL to navigate to")
    .option("--target-id <id>", t("opt.cdp_target_id_or_unique_prefix"))
    .action(async (url: string, opts, cmd) => {
      const { parent, profile } = resolveBrowserActionContext(cmd, parentOpts);
      try {
        const result = await callBrowserRequest<{ url?: string }>(
          parent,
          {
            method: "POST",
            path: "/navigate",
            query: profile ? { profile } : undefined,
            body: {
              url,
              targetId: normalizeOptionalString(opts.targetId),
            },
          },
          { timeoutMs: 20000 },
        );
        if (parent?.json) {
          defaultRuntime.writeJson(result);
          return;
        }
        defaultRuntime.log(`navigated to ${result.url ?? url}`);
      } catch (err) {
        defaultRuntime.error(danger(String(err)));
        defaultRuntime.exit(1);
      }
    });

  browser
    .command("resize")
    .description(t("desc.resize_the_viewport"))
    .argument("<width>", "Viewport width", (v: string) => Number(v))
    .argument("<height>", "Viewport height", (v: string) => Number(v))
    .option("--target-id <id>", t("opt.cdp_target_id_or_unique_prefix"))
    .action(async (width: number, height: number, opts, cmd) => {
      const { parent, profile } = resolveBrowserActionContext(cmd, parentOpts);
      try {
        await runBrowserResizeWithOutput({
          parent,
          profile,
          width,
          height,
          targetId: opts.targetId,
          timeoutMs: 20000,
          successMessage: `resized to ${width}x${height}`,
        });
      } catch (err) {
        defaultRuntime.error(danger(String(err)));
        defaultRuntime.exit(1);
      }
    });

  // Keep `requireRef` reachable; shared utilities are intended for other modules too.
  void requireRef;
}
