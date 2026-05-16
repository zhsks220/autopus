import { normalizeOptionalString } from "autopus/plugin-sdk/string-coerce-runtime";
import type { Command } from "commander";
import { t } from "../../../../../src/i18n/cli/translate.js";
import { callBrowserRequest, type BrowserParentOpts } from "../browser-cli-shared.js";
import {
  danger,
  DEFAULT_UPLOAD_DIR,
  defaultRuntime,
  resolveExistingPathsWithinRoot,
  shortenHomePath,
} from "../core-api.js";
import { resolveBrowserActionContext } from "./shared.js";

async function normalizeUploadPaths(paths: string[]): Promise<string[]> {
  const result = await resolveExistingPathsWithinRoot({
    rootDir: DEFAULT_UPLOAD_DIR,
    requestedPaths: paths,
    scopeLabel: `uploads directory (${DEFAULT_UPLOAD_DIR})`,
  });
  if (!result.ok) {
    throw new Error(result.error);
  }
  return result.paths;
}

// oxlint-disable-next-line typescript/no-unnecessary-type-parameters -- Browser request result type is shared between request and success formatter.
async function runBrowserPostAction<T>(params: {
  parent: BrowserParentOpts;
  profile: string | undefined;
  path: string;
  body: Record<string, unknown>;
  timeoutMs: number;
  describeSuccess: (result: T) => string;
}): Promise<void> {
  try {
    const result = await callBrowserRequest<T>(
      params.parent,
      {
        method: "POST",
        path: params.path,
        query: params.profile ? { profile: params.profile } : undefined,
        body: params.body,
      },
      { timeoutMs: params.timeoutMs },
    );
    if (params.parent?.json) {
      defaultRuntime.writeJson(result);
      return;
    }
    defaultRuntime.log(params.describeSuccess(result));
  } catch (err) {
    defaultRuntime.error(danger(String(err)));
    defaultRuntime.exit(1);
  }
}

export function registerBrowserFilesAndDownloadsCommands(
  browser: Command,
  parentOpts: (cmd: Command) => BrowserParentOpts,
) {
  const resolveTimeoutAndTarget = (opts: { timeoutMs?: unknown; targetId?: unknown }) => {
    const timeoutMs = Number.isFinite(opts.timeoutMs) ? Number(opts.timeoutMs) : undefined;
    const targetId = normalizeOptionalString(opts.targetId);
    return { timeoutMs, targetId };
  };

  const runDownloadCommand = async (
    cmd: Command,
    opts: { timeoutMs?: unknown; targetId?: unknown },
    request: { path: string; body: Record<string, unknown> },
  ) => {
    const { parent, profile } = resolveBrowserActionContext(cmd, parentOpts);
    const { timeoutMs, targetId } = resolveTimeoutAndTarget(opts);
    await runBrowserPostAction<{ download: { path: string } }>({
      parent,
      profile,
      path: request.path,
      body: {
        ...request.body,
        targetId,
        timeoutMs,
      },
      timeoutMs: timeoutMs ?? 20000,
      describeSuccess: (result) => `downloaded: ${shortenHomePath(result.download.path)}`,
    });
  };

  browser
    .command("upload")
    .description(t("desc.arm_file_upload_for_the_next_file_chooser"))
    .argument(
      "<paths...>",
      "File paths to upload (must be within Autopus temp uploads dir, e.g. /tmp/autopus/uploads/file.pdf)",
    )
    .option("--ref <ref>", t("opt.ref_id_from_snapshot_to_click_after_arming"))
    .option("--input-ref <ref>", t("opt.ref_id_for_input_type_file_to_set_directly"))
    .option("--element <selector>", t("opt.css_selector_for_input_type_file"))
    .option("--target-id <id>", t("opt.cdp_target_id_or_unique_prefix"))
    .option(
      "--timeout-ms <ms>",
      "How long to wait for the next file chooser (default: 120000)",
      (v: string) => Number(v),
    )
    .action(async (paths: string[], opts, cmd) => {
      const { parent, profile } = resolveBrowserActionContext(cmd, parentOpts);
      const normalizedPaths = await normalizeUploadPaths(paths);
      const { timeoutMs, targetId } = resolveTimeoutAndTarget(opts);
      await runBrowserPostAction({
        parent,
        profile,
        path: "/hooks/file-chooser",
        body: {
          paths: normalizedPaths,
          ref: normalizeOptionalString(opts.ref),
          inputRef: normalizeOptionalString(opts.inputRef),
          element: normalizeOptionalString(opts.element),
          targetId,
          timeoutMs,
        },
        timeoutMs: timeoutMs ?? 20000,
        describeSuccess: () => `upload armed for ${paths.length} file(s)`,
      });
    });

  browser
    .command("waitfordownload")
    .description(t("desc.wait_for_the_next_download_and_save_it"))
    .argument(
      "[path]",
      "Save path within autopus temp downloads dir (default: /tmp/autopus/downloads/...; fallback: os.tmpdir()/autopus/downloads/...)",
    )
    .option("--target-id <id>", t("opt.cdp_target_id_or_unique_prefix"))
    .option(
      "--timeout-ms <ms>",
      "How long to wait for the next download (default: 120000)",
      (v: string) => Number(v),
    )
    .action(async (outPath: string | undefined, opts, cmd) => {
      await runDownloadCommand(cmd, opts, {
        path: "/wait/download",
        body: {
          path: normalizeOptionalString(outPath),
        },
      });
    });

  browser
    .command("download")
    .description(t("desc.click_a_ref_and_save_the_resulting_download"))
    .argument("<ref>", "Ref id from snapshot to click")
    .argument(
      "<path>",
      "Save path within autopus temp downloads dir (e.g. report.pdf or /tmp/autopus/downloads/report.pdf)",
    )
    .option("--target-id <id>", t("opt.cdp_target_id_or_unique_prefix"))
    .option(
      "--timeout-ms <ms>",
      "How long to wait for the download to start (default: 120000)",
      (v: string) => Number(v),
    )
    .action(async (ref: string, outPath: string, opts, cmd) => {
      await runDownloadCommand(cmd, opts, {
        path: "/download",
        body: {
          ref,
          path: outPath,
        },
      });
    });

  browser
    .command("dialog")
    .description(t("desc.arm_the_next_modal_dialog_alert_confirm_prompt"))
    .option("--accept", t("opt.accept_the_dialog"), false)
    .option("--dismiss", t("opt.dismiss_the_dialog"), false)
    .option("--prompt <text>", t("opt.prompt_response_text"))
    .option("--target-id <id>", t("opt.cdp_target_id_or_unique_prefix"))
    .option(
      "--timeout-ms <ms>",
      "How long to wait for the next dialog (default: 120000)",
      (v: string) => Number(v),
    )
    .action(async (opts, cmd) => {
      const { parent, profile } = resolveBrowserActionContext(cmd, parentOpts);
      const accept = opts.accept ? true : opts.dismiss ? false : undefined;
      if (accept === undefined) {
        defaultRuntime.error(danger("Specify --accept or --dismiss"));
        defaultRuntime.exit(1);
        return;
      }
      const { timeoutMs, targetId } = resolveTimeoutAndTarget(opts);
      await runBrowserPostAction({
        parent,
        profile,
        path: "/hooks/dialog",
        body: {
          accept,
          promptText: normalizeOptionalString(opts.prompt),
          targetId,
          timeoutMs,
        },
        timeoutMs: timeoutMs ?? 20000,
        describeSuccess: () => "dialog armed",
      });
    });
}
