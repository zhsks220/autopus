import type { AutopusConfig } from "../config/types.autopus.js";

export function isGatewayModelPricingEnabled(config: AutopusConfig): boolean {
  return config.models?.pricing?.enabled !== false;
}
