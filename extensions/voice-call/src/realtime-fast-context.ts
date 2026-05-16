import type { AutopusConfig } from "autopus/plugin-sdk/config-contracts";
import {
  resolveRealtimeVoiceFastContextConsult,
  type RealtimeVoiceFastContextConsultResult,
  type RealtimeVoiceFastContextConfig,
} from "autopus/plugin-sdk/realtime-voice";

type Logger = {
  debug?: (message: string) => void;
};

export async function resolveRealtimeFastContextConsult(params: {
  cfg: AutopusConfig;
  agentId: string;
  sessionKey: string;
  config: RealtimeVoiceFastContextConfig;
  args: unknown;
  logger: Logger;
}): Promise<RealtimeVoiceFastContextConsultResult> {
  return await resolveRealtimeVoiceFastContextConsult({
    ...params,
    labels: {
      audienceLabel: "caller",
      contextName: "Autopus memory or session context",
    },
  });
}
