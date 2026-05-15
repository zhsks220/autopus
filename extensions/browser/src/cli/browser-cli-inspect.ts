import fs from "node:fs/promises";
import { normalizeOptionalString } from "autopus/plugin-sdk/string-coerce-runtime";
import type { Command } from "commander";
import { t } from "../../../../src/i18n/cli/translate.js";
import { callBrowserRequest, type BrowserParentOpts } from "./browser-cli-shared.js";
import {
  danger,
  defaultRuntime,
  getRuntimeConfig,
  shortenHomePath,
  type SnapshotResult,
} from "./core-api.js";

export function registerBrowserInspectCommands(
  browser: Command,
  parentOpts: (cmd: Command) => BrowserParentOpts,
) {
  browser
    .command("screenshot")
    .description(t("desc.capture_a_screenshot_media_path"))
    .argument("[targetId]", "CDP target id (or unique prefix)")
    .option("--full-page", t("opt.capture_full_scrollable_page"), false)
    .option("--ref <ref>", t("opt.aria_ref_from_ai_snapshot"))
    .option("--element <selector>", t("opt.css_selector_for_element_screenshot"))
    .option("--labels", t("opt.overlay_role_refs_on_the_screenshot"), false)
    .option("--type <png|jpeg>", t("opt.output_type_default_png"), "png")
    .action(async (targetId: string | undefined, opts, cmd) => {
      const parent = parentOpts(cmd);
      const profile = parent?.browserProfile;
      try {
        const result = await callBrowserRequest<{ path: string }>(
          parent,
          {
            method: "POST",
            path: "/screenshot",
            query: profile ? { profile } : undefined,
            body: {
              targetId: normalizeOptionalString(targetId),
              fullPage: Boolean(opts.fullPage),
              ref: normalizeOptionalString(opts.ref),
              element: normalizeOptionalString(opts.element),
              labels: Boolean(opts.labels),
              type: opts.type === "jpeg" ? "jpeg" : "png",
            },
          },
          { timeoutMs: 20000 },
        );
        if (parent?.json) {
          defaultRuntime.writeJson(result);
          return;
        }
        defaultRuntime.log(`MEDIA:${shortenHomePath(result.path)}`);
      } catch (err) {
        defaultRuntime.error(danger(String(err)));
        defaultRuntime.exit(1);
      }
    });

  browser
    .command("snapshot")
    .description(t("desc.capture_a_snapshot_default_ai_aria_is_the_accessibility_tree"))
    .option("--format <aria|ai>", t("opt.snapshot_format_default_ai"), "ai")
    .option("--target-id <id>", t("opt.cdp_target_id_or_unique_prefix"))
    .option("--limit <n>", t("opt.max_nodes_default_500_800"), (v: string) => Number(v))
    .option("--mode <efficient>", t("opt.snapshot_preset_efficient"))
    .option("--efficient", t("opt.use_the_efficient_snapshot_preset"), false)
    .option("--interactive", t("opt.role_snapshot_interactive_elements_only"), false)
    .option("--compact", t("opt.role_snapshot_compact_output"), false)
    .option("--depth <n>", t("opt.role_snapshot_max_depth"), (v: string) => Number(v))
    .option("--selector <sel>", t("opt.role_snapshot_scope_to_css_selector"))
    .option("--frame <sel>", t("opt.role_snapshot_scope_to_an_iframe_selector"))
    .option("--labels", t("opt.include_viewport_label_overlay_screenshot"), false)
    .option("--urls", t("opt.append_discovered_link_urls_to_ai_snapshots"), false)
    .option("--out <path>", t("opt.write_snapshot_to_a_file"))
    .action(async (opts, cmd) => {
      const parent = parentOpts(cmd);
      const profile = parent?.browserProfile;
      const format = opts.format === "aria" ? "aria" : "ai";
      const formatWasExplicit =
        typeof cmd.getOptionValueSource === "function" &&
        cmd.getOptionValueSource("format") === "cli";
      const configMode =
        !formatWasExplicit &&
        format === "ai" &&
        getRuntimeConfig().browser?.snapshotDefaults?.mode === "efficient"
          ? "efficient"
          : undefined;
      const mode = opts.efficient === true || opts.mode === "efficient" ? "efficient" : configMode;
      try {
        const query: Record<string, string | number | boolean | undefined> = {
          format,
          targetId: normalizeOptionalString(opts.targetId),
          limit: Number.isFinite(opts.limit) ? opts.limit : undefined,
          interactive: opts.interactive ? true : undefined,
          compact: opts.compact ? true : undefined,
          depth: Number.isFinite(opts.depth) ? opts.depth : undefined,
          selector: normalizeOptionalString(opts.selector),
          frame: normalizeOptionalString(opts.frame),
          labels: opts.labels ? true : undefined,
          urls: opts.urls ? true : undefined,
          mode,
          profile,
        };
        const result = await callBrowserRequest<SnapshotResult>(
          parent,
          {
            method: "GET",
            path: "/snapshot",
            query,
          },
          { timeoutMs: 20000 },
        );

        if (opts.out) {
          if (result.format === "ai") {
            await fs.writeFile(opts.out, result.snapshot, "utf8");
          } else {
            const payload = JSON.stringify(result, null, 2);
            await fs.writeFile(opts.out, payload, "utf8");
          }
          if (parent?.json) {
            defaultRuntime.writeJson({
              ok: true,
              out: opts.out,
              ...(result.format === "ai" && result.imagePath
                ? { imagePath: result.imagePath }
                : {}),
            });
          } else {
            defaultRuntime.log(shortenHomePath(opts.out));
            if (result.format === "ai" && result.imagePath) {
              defaultRuntime.log(`MEDIA:${shortenHomePath(result.imagePath)}`);
            }
          }
          return;
        }

        if (parent?.json) {
          defaultRuntime.writeJson(result);
          return;
        }

        if (result.format === "ai") {
          defaultRuntime.log(result.snapshot);
          if (result.imagePath) {
            defaultRuntime.log(`MEDIA:${shortenHomePath(result.imagePath)}`);
          }
          return;
        }

        const nodes = "nodes" in result ? result.nodes : [];
        defaultRuntime.log(
          nodes
            .map((n) => {
              const indent = "  ".repeat(Math.min(20, n.depth));
              const name = n.name ? ` "${n.name}"` : "";
              const value = n.value ? ` = "${n.value}"` : "";
              return `${indent}- ${n.role}${name}${value}`;
            })
            .join("\n"),
        );
      } catch (err) {
        defaultRuntime.error(danger(String(err)));
        defaultRuntime.exit(1);
      }
    });
}
