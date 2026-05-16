import type { PluginManifestRegistry } from "../plugins/manifest-registry.js";
import {
  resolveConfiguredPluginAutoEnableCandidates,
  resolvePluginAutoEnableReadiness,
  resolvePluginAutoEnableManifestRegistry,
} from "./plugin-auto-enable.shared.js";
import type { PluginAutoEnableCandidate } from "./plugin-auto-enable.types.js";
import type { AutopusConfig } from "./types.autopus.js";

export function detectPluginAutoEnableCandidates(params: {
  config?: AutopusConfig;
  env?: NodeJS.ProcessEnv;
  manifestRegistry?: PluginManifestRegistry;
}): PluginAutoEnableCandidate[] {
  const env = params.env ?? process.env;
  const config = params.config ?? ({} as AutopusConfig);
  const readiness = resolvePluginAutoEnableReadiness(config, env);
  if (!readiness.mayNeedAutoEnable) {
    return [];
  }
  const registry = resolvePluginAutoEnableManifestRegistry({
    config,
    env,
    manifestRegistry: params.manifestRegistry,
  });
  return resolveConfiguredPluginAutoEnableCandidates({
    config,
    env,
    registry,
    configuredChannelIds: readiness.configuredChannelIds,
  });
}
