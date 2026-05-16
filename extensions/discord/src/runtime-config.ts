import {
  getRuntimeConfigSnapshot,
  getRuntimeConfigSourceSnapshot,
  selectApplicableRuntimeConfig,
} from "autopus/plugin-sdk/runtime-config-snapshot";
import type { AutopusConfig } from "./runtime-api.js";

export function selectDiscordRuntimeConfig(inputConfig: AutopusConfig): AutopusConfig {
  return (
    selectApplicableRuntimeConfig({
      inputConfig,
      runtimeConfig: getRuntimeConfigSnapshot(),
      runtimeSourceConfig: getRuntimeConfigSourceSnapshot(),
    }) ?? inputConfig
  );
}
