import fs from "node:fs";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { withTempDir } from "./test-helpers/temp-dir.js";
import {
  ensureDir,
  resolveConfigDir,
  resolveHomeDir,
  resolveUserPath,
  shortenHomeInString,
  shortenHomePath,
  sleep,
} from "./utils.js";

describe("ensureDir", () => {
  it("creates nested directory", async () => {
    await withTempDir({ prefix: "autopus-test-" }, async (tmp) => {
      const target = path.join(tmp, "nested", "dir");
      await ensureDir(target);
      expect(fs.existsSync(target)).toBe(true);
    });
  });
});

describe("sleep", () => {
  it("resolves after delay using fake timers", async () => {
    vi.useFakeTimers();
    try {
      const promise = sleep(1000);
      vi.advanceTimersByTime(1000);
      await expect(promise).resolves.toBeUndefined();
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("resolveConfigDir", () => {
  it("prefers ~/.autopus when legacy dir is missing", async () => {
    await withTempDir({ prefix: "autopus-config-dir-" }, async (root) => {
      const newDir = path.join(root, ".autopus");
      await fs.promises.mkdir(newDir, { recursive: true });
      const resolved = resolveConfigDir({} as NodeJS.ProcessEnv, () => root);
      expect(resolved).toBe(newDir);
    });
  });

  it("expands AUTOPUS_STATE_DIR using the provided env", () => {
    const env = {
      HOME: "/tmp/autopus-home",
      AUTOPUS_STATE_DIR: "~/state",
    } as NodeJS.ProcessEnv;

    expect(resolveConfigDir(env)).toBe(path.resolve("/tmp/autopus-home", "state"));
  });

  it("falls back to the config file directory when only AUTOPUS_CONFIG_PATH is set", () => {
    const env = {
      HOME: "/tmp/autopus-home",
      AUTOPUS_CONFIG_PATH: "~/profiles/dev/autopus.json",
    } as NodeJS.ProcessEnv;

    expect(resolveConfigDir(env)).toBe(path.resolve("/tmp/autopus-home", "profiles", "dev"));
  });
});

describe("resolveHomeDir", () => {
  it("prefers AUTOPUS_HOME over HOME", () => {
    vi.stubEnv("AUTOPUS_HOME", "/srv/autopus-home");
    vi.stubEnv("HOME", "/home/other");
    try {
      expect(resolveHomeDir()).toBe(path.resolve("/srv/autopus-home"));
    } finally {
      vi.unstubAllEnvs();
    }
  });
});

describe("shortenHomePath", () => {
  it("uses $AUTOPUS_HOME prefix when AUTOPUS_HOME is set", () => {
    vi.stubEnv("AUTOPUS_HOME", "/srv/autopus-home");
    vi.stubEnv("HOME", "/home/other");
    try {
      expect(shortenHomePath(`${path.resolve("/srv/autopus-home")}/.autopus/autopus.json`)).toBe(
        "$AUTOPUS_HOME/.autopus/autopus.json",
      );
    } finally {
      vi.unstubAllEnvs();
    }
  });
});

describe("shortenHomeInString", () => {
  it("uses $AUTOPUS_HOME replacement when AUTOPUS_HOME is set", () => {
    vi.stubEnv("AUTOPUS_HOME", "/srv/autopus-home");
    vi.stubEnv("HOME", "/home/other");
    try {
      expect(
        shortenHomeInString(`config: ${path.resolve("/srv/autopus-home")}/.autopus/autopus.json`),
      ).toBe("config: $AUTOPUS_HOME/.autopus/autopus.json");
    } finally {
      vi.unstubAllEnvs();
    }
  });
});

describe("resolveUserPath", () => {
  it("expands ~ to home dir", () => {
    expect(resolveUserPath("~", {}, () => "/Users/thoffman")).toBe(path.resolve("/Users/thoffman"));
  });

  it("expands ~/ to home dir", () => {
    expect(resolveUserPath("~/autopus", {}, () => "/Users/thoffman")).toBe(
      path.resolve("/Users/thoffman", "autopus"),
    );
  });

  it("resolves relative paths", () => {
    expect(resolveUserPath("tmp/dir")).toBe(path.resolve("tmp/dir"));
  });

  it("prefers AUTOPUS_HOME for tilde expansion", () => {
    vi.stubEnv("AUTOPUS_HOME", "/srv/autopus-home");
    vi.stubEnv("HOME", "/home/other");
    try {
      expect(resolveUserPath("~/autopus")).toBe(path.resolve("/srv/autopus-home", "autopus"));
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it("uses the provided env for tilde expansion", () => {
    const env = {
      HOME: "/tmp/autopus-home",
      AUTOPUS_HOME: "/srv/autopus-home",
    } as NodeJS.ProcessEnv;

    expect(resolveUserPath("~/autopus", env)).toBe(path.resolve("/srv/autopus-home", "autopus"));
  });

  it("keeps blank paths blank", () => {
    expect(resolveUserPath("")).toBe("");
    expect(resolveUserPath("   ")).toBe("");
  });

  it("returns empty string for undefined/null input", () => {
    expect(resolveUserPath(undefined as unknown as string)).toBe("");
    expect(resolveUserPath(null as unknown as string)).toBe("");
  });
});
