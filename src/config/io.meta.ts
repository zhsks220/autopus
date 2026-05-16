import { VERSION } from "../version.js";
import type { AutopusConfig } from "./types.autopus.js";

export const AUTO_MANAGED_CONFIG_META_FIELDS = {
  lastTouchedVersion: "lastTouchedVersion",
  lastTouchedAt: "lastTouchedAt",
} as const;

export const AUTO_MANAGED_CONFIG_META_PATHS = [
  ["meta", AUTO_MANAGED_CONFIG_META_FIELDS.lastTouchedVersion],
  ["meta", AUTO_MANAGED_CONFIG_META_FIELDS.lastTouchedAt],
] as const;

export function stampConfigWriteMetadata(
  cfg: AutopusConfig,
  now: string = new Date().toISOString(),
): AutopusConfig {
  return {
    ...cfg,
    meta: {
      ...cfg.meta,
      [AUTO_MANAGED_CONFIG_META_FIELDS.lastTouchedVersion]: VERSION,
      [AUTO_MANAGED_CONFIG_META_FIELDS.lastTouchedAt]: now,
    },
  };
}
