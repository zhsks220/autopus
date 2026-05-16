import { Command } from "commander";
import { t } from "../../../../src/i18n/cli/translate.js";
import { createCliRuntimeCapture } from "../../test-support.js";
import type { CliRuntimeCapture } from "../../test-support.js";
import type { BrowserParentOpts } from "./browser-cli-shared.js";

export function createBrowserProgram(params?: { withGatewayUrl?: boolean }): {
  program: Command;
  browser: Command;
  parentOpts: (cmd: Command) => BrowserParentOpts;
} {
  const program = new Command();
  const browser = program
    .command("browser")
    .option("--browser-profile <name>", t("opt.browser_profile"))
    .option("--json", t("opt.output_json"), false);
  if (params?.withGatewayUrl) {
    browser.option("--url <url>", t("opt.gateway_websocket_url"));
  }
  const parentOpts = (cmd: Command): BrowserParentOpts => cmd.parent?.opts?.() as BrowserParentOpts;
  return { program, browser, parentOpts };
}

const browserCliRuntimeState: { capture?: CliRuntimeCapture } = {};

export function getBrowserCliRuntimeCapture(): CliRuntimeCapture {
  browserCliRuntimeState.capture ??= createCliRuntimeCapture();
  return browserCliRuntimeState.capture;
}

export function getBrowserCliRuntime() {
  return getBrowserCliRuntimeCapture().defaultRuntime;
}

export async function mockBrowserCliDefaultRuntime() {
  browserCliRuntimeState.capture ??= createCliRuntimeCapture();
  return { defaultRuntime: browserCliRuntimeState.capture.defaultRuntime };
}

export async function runCommandWithRuntimeMock(
  _runtime: unknown,
  action: () => Promise<void>,
  onError: (err: unknown) => void,
) {
  return await action().catch(onError);
}

export async function createBrowserCliUtilsMockModule() {
  return { runCommandWithRuntime: runCommandWithRuntimeMock };
}

export async function createBrowserCliRuntimeMockModule() {
  return await mockBrowserCliDefaultRuntime();
}
