import { beforeAll, describe, expect, it, vi } from "vitest";

const resolveGatewayLogPathsMock = vi.fn(() => ({
  logDir: "C:\\tmp\\autopus-state\\logs",
  stdoutPath: "C:\\tmp\\autopus-state\\logs\\gateway.log",
  stderrPath: "C:\\tmp\\autopus-state\\logs\\gateway.err.log",
}));
const resolveGatewayRestartLogPathMock = vi.fn(
  () => "C:\\tmp\\autopus-state\\logs\\gateway-restart.log",
);

vi.mock("./restart-logs.js", () => ({
  resolveGatewayLogPaths: resolveGatewayLogPathsMock,
  resolveGatewayRestartLogPath: resolveGatewayRestartLogPathMock,
}));

let buildPlatformRuntimeLogHints: typeof import("./runtime-hints.js").buildPlatformRuntimeLogHints;

describe("buildPlatformRuntimeLogHints", () => {
  beforeAll(async () => {
    ({ buildPlatformRuntimeLogHints } = await import("./runtime-hints.js"));
  });

  it("strips windows drive prefixes from darwin display paths", () => {
    expect(
      buildPlatformRuntimeLogHints({
        platform: "darwin",
        systemdServiceName: "autopus-gateway",
        windowsTaskName: "Autopus Gateway",
      }),
    ).toEqual([
      "Launchd stdout (if installed): /tmp/autopus-state/logs/gateway.log",
      "Launchd stderr (if installed): suppressed",
      "Restart attempts: /tmp/autopus-state/logs/gateway-restart.log",
    ]);
  });
});
