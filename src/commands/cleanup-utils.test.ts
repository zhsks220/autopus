import path from "node:path";
import { describe, expect, it, test, vi } from "vitest";
import type { AutopusConfig } from "../config/config.js";
import { applyAgentDefaultPrimaryModel } from "../plugins/provider-model-primary.js";
import type { RuntimeEnv } from "../runtime.js";
import {
  buildCleanupPlan,
  removeStateAndLinkedPaths,
  removeWorkspaceDirs,
} from "./cleanup-utils.js";

describe("buildCleanupPlan", () => {
  test("resolves inside-state flags and workspace dirs", () => {
    const tmpRoot = path.join(path.parse(process.cwd()).root, "tmp");
    const cfg = {
      agents: {
        defaults: { workspace: path.join(tmpRoot, "autopus-workspace-1") },
        list: [{ workspace: path.join(tmpRoot, "autopus-workspace-2") }],
      },
    };
    const plan = buildCleanupPlan({
      cfg: cfg as unknown as AutopusConfig,
      stateDir: path.join(tmpRoot, "autopus-state"),
      configPath: path.join(tmpRoot, "autopus-state", "autopus.json"),
      oauthDir: path.join(tmpRoot, "autopus-oauth"),
    });

    expect(plan.configInsideState).toBe(true);
    expect(plan.oauthInsideState).toBe(false);
    expect(new Set(plan.workspaceDirs)).toEqual(
      new Set([
        path.join(tmpRoot, "autopus-workspace-1"),
        path.join(tmpRoot, "autopus-workspace-2"),
      ]),
    );
  });
});

describe("applyAgentDefaultPrimaryModel", () => {
  it("does not mutate when already set", () => {
    const cfg = { agents: { defaults: { model: { primary: "a/b" } } } } as AutopusConfig;
    const result = applyAgentDefaultPrimaryModel({ cfg, model: "a/b" });
    expect(result.changed).toBe(false);
    expect(result.next).toBe(cfg);
  });

  it("normalizes legacy models", () => {
    const cfg = { agents: { defaults: { model: { primary: "legacy" } } } } as AutopusConfig;
    const result = applyAgentDefaultPrimaryModel({
      cfg,
      model: "a/b",
      legacyModels: new Set(["legacy"]),
    });
    expect(result.changed).toBe(false);
    expect(result.next).toBe(cfg);
  });

  it("normalizes retired Google Gemini primary models before writing config", () => {
    const cfg = { agents: { defaults: {} } } as AutopusConfig;
    const result = applyAgentDefaultPrimaryModel({
      cfg,
      model: "google/gemini-3-pro-preview",
    });
    expect(result.changed).toBe(true);
    expect(result.next.agents?.defaults?.model).toEqual({
      primary: "google/gemini-3.1-pro-preview",
    });
  });
});

describe("cleanup path removals", () => {
  function createRuntimeMock() {
    return {
      log: vi.fn<(message: string) => void>(),
      error: vi.fn<(message: string) => void>(),
    } as unknown as RuntimeEnv & {
      log: ReturnType<typeof vi.fn<(message: string) => void>>;
      error: ReturnType<typeof vi.fn<(message: string) => void>>;
    };
  }

  it("removes state and only linked paths outside state", async () => {
    const runtime = createRuntimeMock();
    const tmpRoot = path.join(path.parse(process.cwd()).root, "tmp", "autopus-cleanup");
    await removeStateAndLinkedPaths(
      {
        stateDir: path.join(tmpRoot, "state"),
        configPath: path.join(tmpRoot, "state", "autopus.json"),
        oauthDir: path.join(tmpRoot, "oauth"),
        configInsideState: true,
        oauthInsideState: false,
      },
      runtime,
      { dryRun: true },
    );

    expect(runtime.log.mock.calls.map(([line]) => line.replaceAll("\\", "/"))).toEqual([
      "[dry-run] remove /tmp/autopus-cleanup/state",
      "[dry-run] remove /tmp/autopus-cleanup/oauth",
    ]);
  });

  it("removes every workspace directory", async () => {
    const runtime = createRuntimeMock();
    const workspaces = ["/tmp/autopus-workspace-1", "/tmp/autopus-workspace-2"];

    await removeWorkspaceDirs(workspaces, runtime, { dryRun: true });

    const logs = runtime.log.mock.calls.map(([line]) => line);
    expect(logs).toEqual([
      "[dry-run] remove /tmp/autopus-workspace-1",
      "[dry-run] remove /tmp/autopus-workspace-2",
    ]);
  });
});
