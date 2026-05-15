import { resolveDefaultModelForAgent } from "../agents/model-selection.js";
import type { AutopusConfig } from "../config/config.js";

export function resolveCommitmentDefaultModelRef(params: {
  cfg: AutopusConfig;
  agentId?: string;
}): { provider: string; model: string } {
  return resolveDefaultModelForAgent(params);
}
