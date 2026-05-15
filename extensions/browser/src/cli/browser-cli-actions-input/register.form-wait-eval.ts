import { normalizeOptionalString } from "autopus/plugin-sdk/string-coerce-runtime";
import type { Command } from "commander";
import { t } from "../../../../../src/i18n/cli/translate.js";
import type { BrowserParentOpts } from "../browser-cli-shared.js";
import { danger, defaultRuntime } from "../core-api.js";
import {
  callBrowserAct,
  logBrowserActionResult,
  readFields,
  resolveBrowserActionContext,
} from "./shared.js";

export function registerBrowserFormWaitEvalCommands(
  browser: Command,
  parentOpts: (cmd: Command) => BrowserParentOpts,
) {
  browser
    .command("fill")
    .description(t("desc.fill_a_form_with_json_field_descriptors"))
    .option("--fields <json>", t("opt.json_array_of_field_objects"))
    .option("--fields-file <path>", t("opt.read_json_array_from_a_file"))
    .option("--target-id <id>", t("opt.cdp_target_id_or_unique_prefix"))
    .action(async (opts, cmd) => {
      const { parent, profile } = resolveBrowserActionContext(cmd, parentOpts);
      try {
        const fields = await readFields({
          fields: opts.fields,
          fieldsFile: opts.fieldsFile,
        });
        const result = await callBrowserAct<{ result?: unknown }>({
          parent,
          profile,
          body: {
            kind: "fill",
            fields,
            targetId: normalizeOptionalString(opts.targetId),
          },
        });
        logBrowserActionResult(parent, result, `filled ${fields.length} field(s)`);
      } catch (err) {
        defaultRuntime.error(danger(String(err)));
        defaultRuntime.exit(1);
      }
    });

  browser
    .command("wait")
    .description(t("desc.wait_for_time_selector_url_load_state_or_js_conditions"))
    .argument("[selector]", "CSS selector to wait for (visible)")
    .option("--time <ms>", t("opt.wait_for_n_milliseconds"), (v: string) => Number(v))
    .option("--text <value>", t("opt.wait_for_text_to_appear"))
    .option("--text-gone <value>", t("opt.wait_for_text_to_disappear"))
    .option("--url <pattern>", t("opt.wait_for_url_supports_globs_like_dash"))
    .option("--load <load|domcontentloaded|networkidle>", t("opt.wait_for_load_state"))
    .option("--fn <js>", t("opt.wait_for_js_condition_passed_to_waitforfunction"))
    .option(
      "--timeout-ms <ms>",
      "How long to wait for each condition (default: 20000)",
      (v: string) => Number(v),
    )
    .option("--target-id <id>", t("opt.cdp_target_id_or_unique_prefix"))
    .action(async (selector: string | undefined, opts, cmd) => {
      const { parent, profile } = resolveBrowserActionContext(cmd, parentOpts);
      try {
        const sel = normalizeOptionalString(selector);
        const load =
          opts.load === "load" || opts.load === "domcontentloaded" || opts.load === "networkidle"
            ? (opts.load as "load" | "domcontentloaded" | "networkidle")
            : undefined;
        const timeoutMs = Number.isFinite(opts.timeoutMs) ? opts.timeoutMs : undefined;
        const result = await callBrowserAct<{ result?: unknown }>({
          parent,
          profile,
          body: {
            kind: "wait",
            timeMs: Number.isFinite(opts.time) ? opts.time : undefined,
            text: normalizeOptionalString(opts.text),
            textGone: normalizeOptionalString(opts.textGone),
            selector: sel,
            url: normalizeOptionalString(opts.url),
            loadState: load,
            fn: normalizeOptionalString(opts.fn),
            targetId: normalizeOptionalString(opts.targetId),
            timeoutMs,
          },
          timeoutMs,
        });
        logBrowserActionResult(parent, result, "wait complete");
      } catch (err) {
        defaultRuntime.error(danger(String(err)));
        defaultRuntime.exit(1);
      }
    });

  browser
    .command("evaluate")
    .description(t("desc.evaluate_a_function_against_the_page_or_a_ref"))
    .option("--fn <code>", t("opt.function_source_e_g_el_el_textcontent"))
    .option("--ref <id>", t("opt.ref_from_snapshot"))
    .option("--target-id <id>", t("opt.cdp_target_id_or_unique_prefix"))
    .action(async (opts, cmd) => {
      const { parent, profile } = resolveBrowserActionContext(cmd, parentOpts);
      if (!opts.fn) {
        defaultRuntime.error(danger("Missing --fn"));
        defaultRuntime.exit(1);
        return;
      }
      try {
        const result = await callBrowserAct<{ result?: unknown }>({
          parent,
          profile,
          body: {
            kind: "evaluate",
            fn: opts.fn,
            ref: normalizeOptionalString(opts.ref),
            targetId: normalizeOptionalString(opts.targetId),
          },
        });
        if (parent?.json) {
          defaultRuntime.writeJson(result);
          return;
        }
        defaultRuntime.writeJson(result.result ?? null);
      } catch (err) {
        defaultRuntime.error(danger(String(err)));
        defaultRuntime.exit(1);
      }
    });
}
