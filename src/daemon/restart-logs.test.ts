import { describe, expect, it } from "vitest";
import {
  GATEWAY_RESTART_LOG_FILENAME,
  renderCmdRestartLogSetup,
  renderPosixRestartLogSetup,
  resolveGatewayLogPaths,
  resolveGatewayRestartLogPath,
} from "./restart-logs.js";

describe("restart log conventions", () => {
  it("resolves profile-aware gateway logs and restart attempts together", () => {
    const env = {
      HOME: "/Users/test",
      AUTOPUS_PROFILE: "work",
    };

    expect(resolveGatewayLogPaths(env)).toEqual({
      logDir: "/Users/test/.autopus-work/logs",
      stdoutPath: "/Users/test/.autopus-work/logs/gateway.log",
      stderrPath: "/Users/test/.autopus-work/logs/gateway.err.log",
    });
    expect(resolveGatewayRestartLogPath(env)).toBe(
      `/Users/test/.autopus-work/logs/${GATEWAY_RESTART_LOG_FILENAME}`,
    );
  });

  it("honors AUTOPUS_STATE_DIR for restart attempts", () => {
    const env = {
      HOME: "/Users/test",
      AUTOPUS_STATE_DIR: "/tmp/autopus-state",
    };

    expect(resolveGatewayRestartLogPath(env)).toBe(
      `/tmp/autopus-state/logs/${GATEWAY_RESTART_LOG_FILENAME}`,
    );
  });

  it("renders best-effort POSIX log setup with escaped paths", () => {
    const setup = renderPosixRestartLogSetup({
      HOME: "/Users/test's",
    });

    expect(setup).toContain(
      "if mkdir -p '/Users/test'\\''s/.autopus/logs' 2>/dev/null && : >>'/Users/test'\\''s/.autopus/logs/gateway-restart.log' 2>/dev/null; then",
    );
    expect(setup).toContain("exec >>'/Users/test'\\''s/.autopus/logs/gateway-restart.log' 2>&1");
  });

  it("renders CMD log setup with quoted paths", () => {
    const setup = renderCmdRestartLogSetup({
      USERPROFILE: "C:\\Users\\Test User",
    });

    expect(setup.quotedLogPath).toBe('"C:\\Users\\Test User/.autopus/logs/gateway-restart.log"');
    expect(setup.lines).toContain(
      'if not exist "C:\\Users\\Test User/.autopus/logs" mkdir "C:\\Users\\Test User/.autopus/logs" >nul 2>&1',
    );
  });
});
