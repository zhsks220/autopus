import { AUTOPUS_PROVIDER_INDEX } from "./autopus-provider-index.js";
import { normalizeAutopusProviderIndex } from "./normalize.js";
import type { AutopusProviderIndex } from "./types.js";

export function loadAutopusProviderIndex(
  source: unknown = AUTOPUS_PROVIDER_INDEX,
): AutopusProviderIndex {
  return normalizeAutopusProviderIndex(source) ?? { version: 1, providers: {} };
}
