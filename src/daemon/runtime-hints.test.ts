import { describe, expect, it } from "vitest";
import { buildPlatformRuntimeLogHints, buildPlatformServiceStartHints } from "./runtime-hints.js";

describe("buildPlatformRuntimeLogHints", () => {
  it("renders launchd log hints on darwin", () => {
    expect(
      buildPlatformRuntimeLogHints({
        platform: "darwin",
        env: {
          AUTOPUS_STATE_DIR: "/tmp/autopus-state",
          AUTOPUS_LOG_PREFIX: "gateway",
        },
        systemdServiceName: "autopus-gateway",
        windowsTaskName: "Autopus Gateway",
      }),
    ).toEqual([
      "Launchd stdout (if installed): /tmp/autopus-state/logs/gateway.log",
      "Launchd stderr (if installed): suppressed",
      "Restart attempts: /tmp/autopus-state/logs/gateway-restart.log",
    ]);
  });

  it("renders systemd and windows hints by platform", () => {
    expect(
      buildPlatformRuntimeLogHints({
        platform: "linux",
        env: {
          AUTOPUS_STATE_DIR: "/tmp/autopus-state",
        },
        systemdServiceName: "autopus-gateway",
        windowsTaskName: "Autopus Gateway",
      }),
    ).toEqual([
      "Logs: journalctl --user -u autopus-gateway.service -n 200 --no-pager",
      "Restart attempts: /tmp/autopus-state/logs/gateway-restart.log",
    ]);
    expect(
      buildPlatformRuntimeLogHints({
        platform: "win32",
        env: {
          AUTOPUS_STATE_DIR: "/tmp/autopus-state",
        },
        systemdServiceName: "autopus-gateway",
        windowsTaskName: "Autopus Gateway",
      }),
    ).toEqual([
      'Logs: schtasks /Query /TN "Autopus Gateway" /V /FO LIST',
      "Restart attempts: /tmp/autopus-state/logs/gateway-restart.log",
    ]);
  });
});

describe("buildPlatformServiceStartHints", () => {
  it("builds platform-specific service start hints", () => {
    expect(
      buildPlatformServiceStartHints({
        platform: "darwin",
        installCommand: "autopus gateway install",
        startCommand: "autopus gateway",
        launchAgentPlistPath: "~/Library/LaunchAgents/com.autopus.gateway.plist",
        systemdServiceName: "autopus-gateway",
        windowsTaskName: "Autopus Gateway",
      }),
    ).toEqual([
      "autopus gateway install",
      "autopus gateway",
      "launchctl bootstrap gui/$UID ~/Library/LaunchAgents/com.autopus.gateway.plist",
    ]);
    expect(
      buildPlatformServiceStartHints({
        platform: "linux",
        installCommand: "autopus gateway install",
        startCommand: "autopus gateway",
        launchAgentPlistPath: "~/Library/LaunchAgents/com.autopus.gateway.plist",
        systemdServiceName: "autopus-gateway",
        windowsTaskName: "Autopus Gateway",
      }),
    ).toEqual([
      "autopus gateway install",
      "autopus gateway",
      "systemctl --user start autopus-gateway.service",
    ]);
  });
});
