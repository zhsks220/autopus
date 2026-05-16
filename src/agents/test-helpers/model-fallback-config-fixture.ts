import type { AutopusConfig } from "../../config/types.autopus.js";

export function makeModelFallbackCfg(overrides: Partial<AutopusConfig> = {}): AutopusConfig {
  return {
    agents: {
      defaults: {
        model: {
          primary: "openai/gpt-4.1-mini",
          fallbacks: ["anthropic/claude-haiku-3-5"],
        },
      },
    },
    ...overrides,
  } as AutopusConfig;
}
