import {
  applyAgentDefaultModelPrimary,
  type AutopusConfig,
} from "autopus/plugin-sdk/provider-onboard";

export const OPENCODE_GO_DEFAULT_MODEL_REF = "opencode-go/kimi-k2.6";

export function applyOpencodeGoProviderConfig(cfg: AutopusConfig): AutopusConfig {
  return cfg;
}

export function applyOpencodeGoConfig(cfg: AutopusConfig): AutopusConfig {
  return applyAgentDefaultModelPrimary(
    applyOpencodeGoProviderConfig(cfg),
    OPENCODE_GO_DEFAULT_MODEL_REF,
  );
}
