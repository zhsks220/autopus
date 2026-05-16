import { resolveActiveTalkProviderConfig } from "../../config/talk.js";
import type { AutopusConfig } from "../../config/types.js";

export { resolveActiveTalkProviderConfig };

export function getRuntimeConfigSnapshot(): AutopusConfig | null {
  return null;
}
