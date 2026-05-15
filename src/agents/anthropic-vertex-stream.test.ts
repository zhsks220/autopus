import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  clearRuntimeConfigSnapshot,
  setRuntimeConfigSnapshot,
} from "../config/runtime-snapshot.js";
import { resetFacadeRuntimeStateForTest } from "../plugin-sdk/facade-runtime.js";
import { setBundledPluginsDirOverrideForTest } from "../plugins/bundled-dir.js";
import { writePersistedInstalledPluginIndexInstallRecordsSync } from "../plugins/installed-plugin-index-records.js";

const originalBundledPluginsDir = process.env.AUTOPUS_BUNDLED_PLUGINS_DIR;
const originalDisableBundledPlugins = process.env.AUTOPUS_DISABLE_BUNDLED_PLUGINS;
const originalStateDir = process.env.AUTOPUS_STATE_DIR;
const tempDirs: string[] = [];

function makeTempDir(prefix: string): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  tempDirs.push(dir);
  return dir;
}

function writeExternalAnthropicVertexPlugin(rootDir: string): void {
  fs.mkdirSync(rootDir, { recursive: true });
  fs.writeFileSync(
    path.join(rootDir, "package.json"),
    JSON.stringify({
      name: "@autopus/anthropic-vertex-provider",
      version: "0.0.0",
      type: "module",
      autopus: {
        extensions: ["./index.js", "./api.js"],
      },
    }),
    "utf8",
  );
  fs.writeFileSync(
    path.join(rootDir, "autopus.plugin.json"),
    JSON.stringify({
      id: "anthropic-vertex",
      providers: ["anthropic-vertex"],
      configSchema: { type: "object", additionalProperties: false, properties: {} },
    }),
    "utf8",
  );
  fs.writeFileSync(
    path.join(rootDir, "api.js"),
    [
      "export function createAnthropicVertexStreamFnForModel(model, env) {",
      "  return async () => ({ marker: 'external-vertex', baseUrl: model.baseUrl, envMarker: env.AUTOPUS_TEST_MARKER });",
      "}",
      "",
    ].join("\n"),
    "utf8",
  );
  fs.writeFileSync(path.join(rootDir, "index.js"), "export default {};\n", "utf8");
}

afterEach(() => {
  vi.resetModules();
  clearRuntimeConfigSnapshot();
  resetFacadeRuntimeStateForTest();
  setBundledPluginsDirOverrideForTest(undefined);
  if (originalBundledPluginsDir === undefined) {
    delete process.env.AUTOPUS_BUNDLED_PLUGINS_DIR;
  } else {
    process.env.AUTOPUS_BUNDLED_PLUGINS_DIR = originalBundledPluginsDir;
  }
  if (originalDisableBundledPlugins === undefined) {
    delete process.env.AUTOPUS_DISABLE_BUNDLED_PLUGINS;
  } else {
    process.env.AUTOPUS_DISABLE_BUNDLED_PLUGINS = originalDisableBundledPlugins;
  }
  if (originalStateDir === undefined) {
    delete process.env.AUTOPUS_STATE_DIR;
  } else {
    process.env.AUTOPUS_STATE_DIR = originalStateDir;
  }
  for (const dir of tempDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe("anthropic-vertex stream facade", () => {
  it("loads the stream facade from an installed external provider when bundled surfaces are absent", async () => {
    const bundledDir = makeTempDir("autopus-empty-bundled-vertex-");
    const stateDir = makeTempDir("autopus-state-vertex-");
    const pluginRoot = makeTempDir("autopus-external-vertex-");
    writeExternalAnthropicVertexPlugin(pluginRoot);
    writePersistedInstalledPluginIndexInstallRecordsSync(
      {
        "anthropic-vertex": {
          source: "npm",
          spec: "@autopus/anthropic-vertex-provider",
          installPath: pluginRoot,
          resolvedName: "@autopus/anthropic-vertex-provider",
          resolvedVersion: "0.0.0",
        },
      },
      { stateDir },
    );
    process.env.AUTOPUS_BUNDLED_PLUGINS_DIR = bundledDir;
    process.env.AUTOPUS_DISABLE_BUNDLED_PLUGINS = "1";
    process.env.AUTOPUS_STATE_DIR = stateDir;
    setBundledPluginsDirOverrideForTest(bundledDir);
    setRuntimeConfigSnapshot({});

    const { createAnthropicVertexStreamFnForModel } = await import("./anthropic-vertex-stream.js");
    const streamFn = createAnthropicVertexStreamFnForModel(
      { baseUrl: "https://us-central1-aiplatform.googleapis.com" },
      { AUTOPUS_TEST_MARKER: "registry" },
    );

    await expect(streamFn({} as never, {} as never, {} as never)).resolves.toEqual({
      marker: "external-vertex",
      baseUrl: "https://us-central1-aiplatform.googleapis.com",
      envMarker: "registry",
    });
  });
});
