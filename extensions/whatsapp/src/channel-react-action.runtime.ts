import { readStringOrNumberParam, readStringParam } from "autopus/plugin-sdk/channel-actions";
import type { AutopusConfig } from "autopus/plugin-sdk/config-contracts";

export { resolveReactionMessageId } from "autopus/plugin-sdk/channel-actions";
export { handleWhatsAppAction } from "./action-runtime.js";
export { isWhatsAppGroupJid, normalizeWhatsAppTarget } from "./normalize.js";
export { readStringOrNumberParam, readStringParam, type AutopusConfig };
