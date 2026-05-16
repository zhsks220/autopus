import { normalizeOptionalString } from "autopus/plugin-sdk/string-coerce-runtime";
import type { Command } from "commander";
import { t } from "../../../../../src/i18n/cli/translate.js";
import type { BrowserParentOpts } from "../browser-cli-shared.js";
import { danger, defaultRuntime } from "../core-api.js";
import {
  callBrowserAct,
  logBrowserActionResult,
  requireRef,
  resolveBrowserActionContext,
} from "./shared.js";

export function registerBrowserElementCommands(
  browser: Command,
  parentOpts: (cmd: Command) => BrowserParentOpts,
) {
  const runElementAction = async (params: {
    cmd: Command;
    body: Record<string, unknown>;
    successMessage: string | ((result: unknown) => string);
    timeoutMs?: number;
  }): Promise<void> => {
    const { parent, profile } = resolveBrowserActionContext(params.cmd, parentOpts);
    try {
      const result = await callBrowserAct({
        parent,
        profile,
        body: params.body,
        timeoutMs: params.timeoutMs,
      });
      const successMessage =
        typeof params.successMessage === "function"
          ? params.successMessage(result)
          : params.successMessage;
      logBrowserActionResult(parent, result, successMessage);
    } catch (err) {
      defaultRuntime.error(danger(String(err)));
      defaultRuntime.exit(1);
    }
  };

  browser
    .command("click")
    .description(t("desc.click_an_element_by_ref_from_snapshot"))
    .argument("<ref>", "Ref id from snapshot")
    .option("--target-id <id>", t("opt.cdp_target_id_or_unique_prefix"))
    .option("--double", t("opt.double_click"), false)
    .option("--button <left|right|middle>", t("opt.mouse_button_to_use"))
    .option("--modifiers <list>", t("opt.comma_separated_modifiers_shift_alt_meta"))
    .action(async (ref: string | undefined, opts, cmd) => {
      const refValue = requireRef(ref);
      if (!refValue) {
        return;
      }
      const modifiers = opts.modifiers
        ? String(opts.modifiers)
            .split(",")
            .map((v: string) => v.trim())
            .filter(Boolean)
        : undefined;
      await runElementAction({
        cmd,
        body: {
          kind: "click",
          ref: refValue,
          targetId: normalizeOptionalString(opts.targetId),
          doubleClick: Boolean(opts.double),
          button: normalizeOptionalString(opts.button),
          modifiers,
        },
        successMessage: (result) => {
          const url = (result as { url?: unknown }).url;
          const suffix = typeof url === "string" && url ? ` on ${url}` : "";
          return `clicked ref ${refValue}${suffix}`;
        },
      });
    });

  browser
    .command("click-coords")
    .description(t("desc.click_viewport_coordinates"))
    .argument("<x>", "Viewport x coordinate")
    .argument("<y>", "Viewport y coordinate")
    .option("--target-id <id>", t("opt.cdp_target_id_or_unique_prefix"))
    .option("--double", t("opt.double_click"), false)
    .option("--button <left|right|middle>", t("opt.mouse_button_to_use"))
    .option("--delay-ms <ms>", t("opt.delay_between_mouse_down_up"), (v: string) => Number(v))
    .action(async (xRaw: string, yRaw: string, opts, cmd) => {
      const x = Number(xRaw);
      const y = Number(yRaw);
      await runElementAction({
        cmd,
        body: {
          kind: "clickCoords",
          x,
          y,
          targetId: normalizeOptionalString(opts.targetId),
          doubleClick: Boolean(opts.double),
          button: normalizeOptionalString(opts.button),
          delayMs: Number.isFinite(opts.delayMs) ? opts.delayMs : undefined,
        },
        successMessage: (result) => {
          const url = (result as { url?: unknown }).url;
          const suffix = typeof url === "string" && url ? ` on ${url}` : "";
          return `clicked ${x},${y}${suffix}`;
        },
      });
    });

  browser
    .command("type")
    .description(t("desc.type_into_an_element_by_ref_from_snapshot"))
    .argument("<ref>", "Ref id from snapshot")
    .argument("<text>", "Text to type")
    .option("--submit", t("opt.press_enter_after_typing"), false)
    .option("--slowly", t("opt.type_slowly_human_like"), false)
    .option("--target-id <id>", t("opt.cdp_target_id_or_unique_prefix"))
    .action(async (ref: string | undefined, text: string, opts, cmd) => {
      const refValue = requireRef(ref);
      if (!refValue) {
        return;
      }
      await runElementAction({
        cmd,
        body: {
          kind: "type",
          ref: refValue,
          text,
          submit: Boolean(opts.submit),
          slowly: Boolean(opts.slowly),
          targetId: normalizeOptionalString(opts.targetId),
        },
        successMessage: `typed into ref ${refValue}`,
      });
    });

  browser
    .command("press")
    .description(t("desc.press_a_key"))
    .argument("<key>", "Key to press (e.g. Enter)")
    .option("--target-id <id>", t("opt.cdp_target_id_or_unique_prefix"))
    .action(async (key: string, opts, cmd) => {
      await runElementAction({
        cmd,
        body: { kind: "press", key, targetId: normalizeOptionalString(opts.targetId) },
        successMessage: `pressed ${key}`,
      });
    });

  browser
    .command("hover")
    .description(t("desc.hover_an_element_by_ai_ref"))
    .argument("<ref>", "Ref id from snapshot")
    .option("--target-id <id>", t("opt.cdp_target_id_or_unique_prefix"))
    .action(async (ref: string, opts, cmd) => {
      await runElementAction({
        cmd,
        body: { kind: "hover", ref, targetId: normalizeOptionalString(opts.targetId) },
        successMessage: `hovered ref ${ref}`,
      });
    });

  browser
    .command("scrollintoview")
    .description(t("desc.scroll_an_element_into_view_by_ref_from_snapshot"))
    .argument("<ref>", "Ref id from snapshot")
    .option("--target-id <id>", t("opt.cdp_target_id_or_unique_prefix"))
    .option("--timeout-ms <ms>", t("opt.how_long_to_wait_for_scroll_default_20000"), (v: string) =>
      Number(v),
    )
    .action(async (ref: string | undefined, opts, cmd) => {
      const refValue = requireRef(ref);
      if (!refValue) {
        return;
      }
      const timeoutMs = Number.isFinite(opts.timeoutMs) ? opts.timeoutMs : undefined;
      await runElementAction({
        cmd,
        body: {
          kind: "scrollIntoView",
          ref: refValue,
          targetId: normalizeOptionalString(opts.targetId),
          timeoutMs,
        },
        timeoutMs,
        successMessage: `scrolled into view: ${refValue}`,
      });
    });

  browser
    .command("drag")
    .description(t("desc.drag_from_one_ref_to_another"))
    .argument("<startRef>", "Start ref id")
    .argument("<endRef>", "End ref id")
    .option("--target-id <id>", t("opt.cdp_target_id_or_unique_prefix"))
    .action(async (startRef: string, endRef: string, opts, cmd) => {
      await runElementAction({
        cmd,
        body: {
          kind: "drag",
          startRef,
          endRef,
          targetId: normalizeOptionalString(opts.targetId),
        },
        successMessage: `dragged ${startRef} → ${endRef}`,
      });
    });

  browser
    .command("select")
    .description(t("desc.select_option_s_in_a_select_element"))
    .argument("<ref>", "Ref id from snapshot")
    .argument("<values...>", "Option values to select")
    .option("--target-id <id>", t("opt.cdp_target_id_or_unique_prefix"))
    .action(async (ref: string, values: string[], opts, cmd) => {
      await runElementAction({
        cmd,
        body: {
          kind: "select",
          ref,
          values,
          targetId: normalizeOptionalString(opts.targetId),
        },
        successMessage: `selected ${values.join(", ")}`,
      });
    });
}
