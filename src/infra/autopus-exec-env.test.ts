import { describe, expect, it } from "vitest";
import {
  ensureAutopusExecMarkerOnProcess,
  markAutopusExecEnv,
  AUTOPUS_CLI_ENV_VALUE,
  AUTOPUS_CLI_ENV_VAR,
} from "./autopus-exec-env.js";

describe("markAutopusExecEnv", () => {
  it("returns a cloned env object with the exec marker set", () => {
    const env = { PATH: "/usr/bin", AUTOPUS_CLI: "0" };
    const marked = markAutopusExecEnv(env);

    expect(marked).toEqual({
      PATH: "/usr/bin",
      AUTOPUS_CLI: AUTOPUS_CLI_ENV_VALUE,
    });
    expect(marked).not.toBe(env);
    expect(env.AUTOPUS_CLI).toBe("0");
  });
});

describe("ensureAutopusExecMarkerOnProcess", () => {
  it.each([
    {
      name: "mutates and returns the provided process env",
      env: { PATH: "/usr/bin" } as NodeJS.ProcessEnv,
    },
    {
      name: "overwrites an existing marker on the provided process env",
      env: { PATH: "/usr/bin", [AUTOPUS_CLI_ENV_VAR]: "0" } as NodeJS.ProcessEnv,
    },
  ])("$name", ({ env }) => {
    expect(ensureAutopusExecMarkerOnProcess(env)).toBe(env);
    expect(env[AUTOPUS_CLI_ENV_VAR]).toBe(AUTOPUS_CLI_ENV_VALUE);
  });

  it("defaults to mutating process.env when no env object is provided", () => {
    const previous = process.env[AUTOPUS_CLI_ENV_VAR];
    delete process.env[AUTOPUS_CLI_ENV_VAR];

    try {
      expect(ensureAutopusExecMarkerOnProcess()).toBe(process.env);
      expect(process.env[AUTOPUS_CLI_ENV_VAR]).toBe(AUTOPUS_CLI_ENV_VALUE);
    } finally {
      if (previous === undefined) {
        delete process.env[AUTOPUS_CLI_ENV_VAR];
      } else {
        process.env[AUTOPUS_CLI_ENV_VAR] = previous;
      }
    }
  });
});
