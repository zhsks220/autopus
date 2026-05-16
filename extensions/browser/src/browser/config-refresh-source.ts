import {
  getRuntimeConfig,
  getRuntimeConfigSourceSnapshot,
  type AutopusConfig,
} from "../config/config.js";

export function loadBrowserConfigForRuntimeRefresh(): AutopusConfig {
  return getRuntimeConfigSourceSnapshot() ?? getRuntimeConfig();
}
