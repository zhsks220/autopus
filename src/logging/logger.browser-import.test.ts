import { importFreshModule } from "autopus/plugin-sdk/test-fixtures";
import { afterEach, describe, expect, it, vi } from "vitest";

type LoggerModule = typeof import("./logger.js");

const originalGetBuiltinModule = (
  process as NodeJS.Process & { getBuiltinModule?: (id: string) => unknown }
).getBuiltinModule;

async function importBrowserSafeLogger(params?: {
  resolvePreferredAutopusTmpDir?: ReturnType<typeof vi.fn>;
}): Promise<{
  module: LoggerModule;
  resolvePreferredAutopusTmpDir: ReturnType<typeof vi.fn>;
}> {
  const resolvePreferredAutopusTmpDir =
    params?.resolvePreferredAutopusTmpDir ??
    vi.fn(() => {
      throw new Error("resolvePreferredAutopusTmpDir should not run during browser-safe import");
    });

  vi.doMock("../infra/tmp-autopus-dir.js", async () => {
    const actual = await vi.importActual<typeof import("../infra/tmp-autopus-dir.js")>(
      "../infra/tmp-autopus-dir.js",
    );
    return {
      ...actual,
      resolvePreferredAutopusTmpDir,
    };
  });

  Object.defineProperty(process, "getBuiltinModule", {
    configurable: true,
    value: undefined,
  });

  const module = await importFreshModule<LoggerModule>(
    import.meta.url,
    "./logger.js?scope=browser-safe",
  );
  return { module, resolvePreferredAutopusTmpDir };
}

describe("logging/logger browser-safe import", () => {
  afterEach(() => {
    vi.doUnmock("../infra/tmp-autopus-dir.js");
    Object.defineProperty(process, "getBuiltinModule", {
      configurable: true,
      value: originalGetBuiltinModule,
    });
  });

  it("does not resolve the preferred temp dir at import time when node fs is unavailable", async () => {
    const { module, resolvePreferredAutopusTmpDir } = await importBrowserSafeLogger();

    expect(resolvePreferredAutopusTmpDir).not.toHaveBeenCalled();
    expect(module.DEFAULT_LOG_DIR).toBe("/tmp/autopus");
    expect(module.DEFAULT_LOG_FILE).toBe("/tmp/autopus/autopus.log");
  });

  it("disables file logging when imported in a browser-like environment", async () => {
    const { module, resolvePreferredAutopusTmpDir } = await importBrowserSafeLogger();

    expect(module.getResolvedLoggerSettings()).toStrictEqual({
      level: "silent",
      file: "/tmp/autopus/autopus.log",
      maxFileBytes: 100 * 1024 * 1024,
    });
    expect(module.isFileLogLevelEnabled("info")).toBe(false);
    expect(module.getLogger().info("browser-safe")).toBeUndefined();
    expect(resolvePreferredAutopusTmpDir).not.toHaveBeenCalled();
  });
});
