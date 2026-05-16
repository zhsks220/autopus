import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { cleanupTempDirs, makeTempDir } from "../test/helpers/temp-dir.js";

const tempRoots: string[] = [];
const installerPath = path.join(process.cwd(), "scripts", "install.sh");
const installerSource = fs.readFileSync(installerPath, "utf-8");
const versionHelperStart = installerSource.indexOf("load_install_version_helpers() {");
const versionHelperEnd = installerSource.indexOf("\nis_gateway_daemon_loaded() {");

if (versionHelperStart < 0 || versionHelperEnd < 0) {
  throw new Error("install.sh version helper block not found");
}

const versionHelperSource = installerSource.slice(versionHelperStart, versionHelperEnd);

function resolveInstallerVersionCases(params: { stdinCwd: string }): string[] {
  const output = execFileSync(
    "bash",
    [
      "-c",
      `${versionHelperSource}
fake_autopus_decorated() { printf '%s\\n' 'Autopus 2026.3.10 (abcdef0)'; }
fake_autopus_raw() { printf '%s\\n' "Autopus dev's build"; }
AUTOPUS_BIN=fake_autopus_decorated resolve_autopus_version
AUTOPUS_BIN=fake_autopus_raw resolve_autopus_version
(
  cd "$1"
  source /dev/stdin <<'AUTOPUS_STDIN_INSTALLER'
${versionHelperSource}
fake_autopus_stdin() { printf '%s\\n' 'Autopus 2026.3.10 (abcdef0)'; }
AUTOPUS_BIN=fake_autopus_stdin
resolve_autopus_version
AUTOPUS_STDIN_INSTALLER
)`,
      "autopus-version-test",
      params.stdinCwd,
    ],
    {
      cwd: process.cwd(),
      encoding: "utf-8",
      env: {
        ...process.env,
        AUTOPUS_INSTALL_SH_NO_RUN: "1",
      },
    },
  );
  return output.trimEnd().split("\n");
}

describe("install.sh version resolution", () => {
  afterEach(() => {
    cleanupTempDirs(tempRoots);
  });

  it.runIf(process.platform !== "win32")(
    "parses CLI versions and keeps stdin helpers isolated from cwd",
    () => {
      const hostileCwd = makeTempDir(tempRoots, "autopus-install-stdin-");
      const hostileHelper = path.join(
        hostileCwd,
        "docker",
        "install-sh-common",
        "version-parse.sh",
      );
      fs.mkdirSync(path.dirname(hostileHelper), { recursive: true });
      fs.writeFileSync(
        hostileHelper,
        `#!/usr/bin/env bash
extract_autopus_semver() {
  printf '%s' 'poisoned'
}
`,
        "utf-8",
      );

      expect(
        resolveInstallerVersionCases({
          stdinCwd: hostileCwd,
        }),
      ).toEqual(["2026.3.10", "Autopus dev's build", "2026.3.10"]);
    },
  );
});
