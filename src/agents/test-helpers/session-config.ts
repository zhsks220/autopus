import type { AutopusConfig } from "../../config/types.autopus.js";

export function createPerSenderSessionConfig(
  overrides: Partial<NonNullable<AutopusConfig["session"]>> = {},
): NonNullable<AutopusConfig["session"]> {
  return {
    mainKey: "main",
    scope: "per-sender",
    ...overrides,
  };
}
