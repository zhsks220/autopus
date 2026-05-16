import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  repairManagedNpmRootAutopusPeer,
  removeManagedNpmRootDependency,
  readManagedNpmRootInstalledDependency,
  readAutopusManagedNpmRootOverrides,
  resolveManagedNpmRootDependencySpec,
  upsertManagedNpmRootDependency,
} from "./npm-managed-root.js";

const tempDirs: string[] = [];

const successfulSpawn = {
  code: 0,
  stdout: "",
  stderr: "",
  signal: null,
  killed: false,
  termination: "exit" as const,
};

async function makeTempRoot(): Promise<string> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "autopus-npm-managed-root-"));
  tempDirs.push(dir);
  return dir;
}

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => fs.rm(dir, { recursive: true, force: true })));
});

async function expectPathMissing(targetPath: string): Promise<void> {
  try {
    await fs.lstat(targetPath);
  } catch (error) {
    expect(error).toBeInstanceOf(Error);
    const statError = error as NodeJS.ErrnoException;
    expect({
      code: statError.code,
      path: statError.path,
      syscall: statError.syscall,
    }).toEqual({
      code: "ENOENT",
      path: targetPath,
      syscall: "lstat",
    });
    return;
  }
  throw new Error(`Expected path to be missing: ${targetPath}`);
}

function requireFirstMockCall<T>(mock: { mock: { calls: T[][] } }, label: string): T[] {
  const call = mock.mock.calls[0];
  if (!call) {
    throw new Error(`expected ${label} call`);
  }
  return call;
}

describe("managed npm root", () => {
  it("keeps existing plugin dependencies when adding another managed plugin", async () => {
    const npmRoot = await makeTempRoot();
    await fs.writeFile(
      path.join(npmRoot, "package.json"),
      `${JSON.stringify(
        {
          private: true,
          dependencies: {
            "@autopus/discord": "2026.5.2",
          },
          devDependencies: {
            fixture: "1.0.0",
          },
        },
        null,
        2,
      )}\n`,
    );

    await upsertManagedNpmRootDependency({
      npmRoot,
      packageName: "@autopus/feishu",
      dependencySpec: "2026.5.2",
    });

    await expect(
      fs.readFile(path.join(npmRoot, "package.json"), "utf8").then((raw) => JSON.parse(raw)),
    ).resolves.toEqual({
      private: true,
      dependencies: {
        "@autopus/discord": "2026.5.2",
        "@autopus/feishu": "2026.5.2",
      },
      devDependencies: {
        fixture: "1.0.0",
      },
    });
  });

  it("syncs Autopus-owned overrides without dropping unrelated local overrides", async () => {
    const npmRoot = await makeTempRoot();
    await fs.writeFile(
      path.join(npmRoot, "package.json"),
      `${JSON.stringify(
        {
          private: true,
          dependencies: {
            "@autopus/discord": "2026.5.2",
          },
          overrides: {
            axios: "1.13.6",
            "left-pad": "1.3.0",
            qs: "6.14.0",
          },
          autopus: {
            managedOverrides: ["axios", "qs"],
          },
        },
        null,
        2,
      )}\n`,
    );

    await upsertManagedNpmRootDependency({
      npmRoot,
      packageName: "@autopus/feishu",
      dependencySpec: "2026.5.4",
      managedOverrides: {
        axios: "1.16.0",
        "node-domexception": "npm:@nolyfill/domexception@1.0.28",
        nested: {
          semver: "1.2.3",
          alias: "npm:@scope/alias@1.0.0",
        },
      },
    });

    await expect(
      fs.readFile(path.join(npmRoot, "package.json"), "utf8").then((raw) => JSON.parse(raw)),
    ).resolves.toEqual({
      private: true,
      dependencies: {
        "@autopus/discord": "2026.5.2",
        "@autopus/feishu": "2026.5.4",
      },
      overrides: {
        "left-pad": "1.3.0",
        axios: "1.16.0",
        "node-domexception": "npm:@nolyfill/domexception@1.0.28",
        nested: {
          alias: "npm:@scope/alias@1.0.0",
          semver: "1.2.3",
        },
      },
      autopus: {
        managedOverrides: ["axios", "nested", "node-domexception"],
      },
    });
  });

  it("can omit npm alias overrides for npm versions that reject them", async () => {
    const npmRoot = await makeTempRoot();

    await upsertManagedNpmRootDependency({
      npmRoot,
      packageName: "@autopus/feishu",
      dependencySpec: "2026.5.4",
      omitUnsupportedManagedOverrides: true,
      managedOverrides: {
        axios: "1.16.0",
        "node-domexception": "npm:@nolyfill/domexception@1.0.28",
        nested: {
          alias: "npm:@scope/alias@1.0.0",
          semver: "1.2.3",
        },
      },
    });

    await expect(
      fs.readFile(path.join(npmRoot, "package.json"), "utf8").then((raw) => JSON.parse(raw)),
    ).resolves.toMatchObject({
      overrides: {
        axios: "1.16.0",
        nested: {
          semver: "1.2.3",
        },
      },
      autopus: {
        managedOverrides: ["axios", "nested"],
      },
    });
  });

  it("reads package-level npm overrides for managed plugin installs", async () => {
    await expect(readAutopusManagedNpmRootOverrides()).resolves.toEqual({
      axios: "1.16.0",
      "fast-uri": "3.1.2",
      "follow-redirects": "1.16.0",
      "ip-address": "10.2.0",
      "node-domexception": "npm:@nolyfill/domexception@1.0.28",
      uuid: "14.0.0",
    });
  });

  it("resolves package-level npm overrides from packaged dist chunks", async () => {
    const packageRoot = await makeTempRoot();
    await fs.mkdir(path.join(packageRoot, "dist"), { recursive: true });
    await fs.writeFile(
      path.join(packageRoot, "package.json"),
      `${JSON.stringify(
        {
          name: "autopus",
          overrides: {
            axios: "1.16.0",
          },
        },
        null,
        2,
      )}\n`,
    );

    await expect(
      readAutopusManagedNpmRootOverrides({
        moduleUrl: pathToFileURL(path.join(packageRoot, "dist", "install-AbCdEf.js")).toString(),
        cwd: path.join(packageRoot, "dist"),
      }),
    ).resolves.toEqual({
      axios: "1.16.0",
    });
  });

  it("resolves npm override dependency references from the host package manifest", async () => {
    const packageRoot = await makeTempRoot();
    await fs.writeFile(
      path.join(packageRoot, "package.json"),
      `${JSON.stringify(
        {
          name: "autopus",
          dependencies: {
            "@aws-sdk/client-bedrock-runtime": "3.1024.0",
            "node-domexception": "npm:@nolyfill/domexception@1.0.28",
          },
          optionalDependencies: {
            "optional-runtime": "2.0.0",
          },
          overrides: {
            "@aws-sdk/client-bedrock-runtime": "$@aws-sdk/client-bedrock-runtime",
            nested: {
              "optional-runtime": "$optional-runtime",
              alias: "$node-domexception",
            },
            axios: "1.16.0",
            "node-domexception": "$node-domexception",
          },
        },
        null,
        2,
      )}\n`,
    );

    await expect(readAutopusManagedNpmRootOverrides({ packageRoot })).resolves.toEqual({
      "@aws-sdk/client-bedrock-runtime": "3.1024.0",
      nested: {
        "optional-runtime": "2.0.0",
        alias: "npm:@nolyfill/domexception@1.0.28",
      },
      axios: "1.16.0",
      "node-domexception": "npm:@nolyfill/domexception@1.0.28",
    });
  });

  it("does not overwrite a present malformed package manifest", async () => {
    const npmRoot = await makeTempRoot();
    const manifestPath = path.join(npmRoot, "package.json");
    await fs.writeFile(manifestPath, "{not-json", "utf8");

    await expect(
      upsertManagedNpmRootDependency({
        npmRoot,
        packageName: "@autopus/feishu",
        dependencySpec: "2026.5.2",
      }),
    ).rejects.toThrow(/JSON|package\.json|not-json/i);

    await expect(fs.readFile(manifestPath, "utf8")).resolves.toBe("{not-json");
  });

  it("pins managed dependencies to the resolved version", () => {
    expect(
      resolveManagedNpmRootDependencySpec({
        parsedSpec: {
          name: "@autopus/discord",
          raw: "@autopus/discord@stable",
          selector: "stable",
          selectorKind: "tag",
          selectorIsPrerelease: false,
        },
        resolution: {
          name: "@autopus/discord",
          version: "2026.5.2",
          resolvedSpec: "@autopus/discord@2026.5.2",
          resolvedAt: "2026-05-03T00:00:00.000Z",
        },
      }),
    ).toBe("2026.5.2");

    expect(
      resolveManagedNpmRootDependencySpec({
        parsedSpec: {
          name: "@autopus/discord",
          raw: "@autopus/discord",
          selectorKind: "none",
          selectorIsPrerelease: false,
        },
        resolution: {
          name: "@autopus/discord",
          version: "2026.5.2",
          resolvedSpec: "@autopus/discord@2026.5.2",
          resolvedAt: "2026-05-03T00:00:00.000Z",
        },
      }),
    ).toBe("2026.5.2");
  });

  it("reads installed dependency metadata from package-lock", async () => {
    const npmRoot = await makeTempRoot();
    await fs.writeFile(
      path.join(npmRoot, "package-lock.json"),
      `${JSON.stringify(
        {
          lockfileVersion: 3,
          packages: {
            "node_modules/@autopus/discord": {
              version: "2026.5.2",
              resolved: "https://registry.npmjs.org/@autopus/discord/-/discord-2026.5.2.tgz",
              integrity: "sha512-discord",
            },
          },
        },
        null,
        2,
      )}\n`,
    );

    await expect(
      readManagedNpmRootInstalledDependency({
        npmRoot,
        packageName: "@autopus/discord",
      }),
    ).resolves.toEqual({
      version: "2026.5.2",
      resolved: "https://registry.npmjs.org/@autopus/discord/-/discord-2026.5.2.tgz",
      integrity: "sha512-discord",
    });
  });

  it("removes one managed dependency without dropping unrelated metadata", async () => {
    const npmRoot = await makeTempRoot();
    await fs.writeFile(
      path.join(npmRoot, "package.json"),
      `${JSON.stringify(
        {
          private: true,
          dependencies: {
            "@autopus/discord": "2026.5.2",
            "@autopus/voice-call": "2026.5.2",
          },
          devDependencies: {
            fixture: "1.0.0",
          },
        },
        null,
        2,
      )}\n`,
    );

    await removeManagedNpmRootDependency({
      npmRoot,
      packageName: "@autopus/voice-call",
    });

    await expect(
      fs.readFile(path.join(npmRoot, "package.json"), "utf8").then((raw) => JSON.parse(raw)),
    ).resolves.toEqual({
      private: true,
      dependencies: {
        "@autopus/discord": "2026.5.2",
      },
      devDependencies: {
        fixture: "1.0.0",
      },
    });
  });

  it("repairs stale managed autopus peer state without dropping plugin packages", async () => {
    const npmRoot = await makeTempRoot();
    await fs.mkdir(path.join(npmRoot, "node_modules", "autopus"), { recursive: true });
    await fs.writeFile(
      path.join(npmRoot, "package.json"),
      `${JSON.stringify(
        {
          private: true,
          dependencies: {
            autopus: "2026.5.4",
            "@autopus/discord": "2026.5.4",
          },
        },
        null,
        2,
      )}\n`,
    );
    await fs.writeFile(
      path.join(npmRoot, "package-lock.json"),
      `${JSON.stringify(
        {
          lockfileVersion: 3,
          packages: {
            "": {
              dependencies: {
                autopus: "2026.5.4",
                "@autopus/discord": "2026.5.4",
              },
            },
            "node_modules/autopus": {
              version: "2026.5.4",
            },
            "node_modules/@autopus/discord": {
              version: "2026.5.4",
            },
          },
          dependencies: {
            autopus: {
              version: "2026.5.4",
            },
          },
        },
        null,
        2,
      )}\n`,
    );
    await fs.writeFile(
      path.join(npmRoot, "node_modules", "autopus", "package.json"),
      `${JSON.stringify({ name: "autopus", version: "2026.5.4" })}\n`,
    );
    await fs.mkdir(path.join(npmRoot, "node_modules", ".bin"), { recursive: true });
    await fs.writeFile(path.join(npmRoot, "node_modules", ".bin", "autopus"), "shim");
    await fs.writeFile(path.join(npmRoot, "node_modules", ".bin", "autopus.cmd"), "cmd shim");
    await fs.writeFile(path.join(npmRoot, "node_modules", ".bin", "autopus.ps1"), "ps1 shim");
    await fs.writeFile(
      path.join(npmRoot, "node_modules", ".package-lock.json"),
      `${JSON.stringify(
        {
          lockfileVersion: 3,
          packages: {
            "node_modules/autopus": {
              version: "2026.5.4",
            },
          },
        },
        null,
        2,
      )}\n`,
    );

    const runCommand = vi.fn().mockResolvedValue(successfulSpawn);
    await expect(repairManagedNpmRootAutopusPeer({ npmRoot, runCommand })).resolves.toBe(true);
    expect(runCommand).toHaveBeenCalledTimes(1);
    const [repairArgs, repairOptions] = requireFirstMockCall(runCommand, "repair command");
    expect(repairArgs).toEqual([
      "npm",
      "uninstall",
      "--loglevel=error",
      "--legacy-peer-deps",
      "--ignore-scripts",
      "--no-audit",
      "--no-fund",
      "autopus",
    ]);
    expect(repairOptions?.cwd).toBe(npmRoot);
    expect(repairOptions?.timeoutMs).toBe(300_000);
    expect(repairOptions?.env?.npm_config_legacy_peer_deps).toBe("true");

    const manifest = JSON.parse(await fs.readFile(path.join(npmRoot, "package.json"), "utf8")) as {
      dependencies?: Record<string, string>;
    };
    expect(manifest.dependencies).toEqual({
      "@autopus/discord": "2026.5.4",
    });
    const lockfile = JSON.parse(
      await fs.readFile(path.join(npmRoot, "package-lock.json"), "utf8"),
    ) as {
      packages?: Record<string, { dependencies?: Record<string, string>; version?: string }>;
      dependencies?: Record<string, unknown>;
    };
    expect(lockfile.packages?.[""]?.dependencies).toEqual({
      "@autopus/discord": "2026.5.4",
    });
    expect(lockfile.packages?.["node_modules/autopus"]).toBeUndefined();
    expect(lockfile.packages?.["node_modules/@autopus/discord"]?.version).toBe("2026.5.4");
    expect(lockfile.dependencies?.autopus).toBeUndefined();
    await expectPathMissing(path.join(npmRoot, "node_modules", "autopus"));
    for (const binName of ["autopus", "autopus.cmd", "autopus.ps1"]) {
      await expectPathMissing(path.join(npmRoot, "node_modules", ".bin", binName));
    }
    await expectPathMissing(path.join(npmRoot, "node_modules", ".package-lock.json"));
  });
});
