// Private runtime barrel for the bundled Voice Call extension.
// Keep this barrel thin and aligned with the local extension surface.

export { definePluginEntry } from "autopus/plugin-sdk/plugin-entry";
export type { AutopusPluginApi } from "autopus/plugin-sdk/plugin-entry";
export type { GatewayRequestHandlerOptions } from "autopus/plugin-sdk/gateway-runtime";
export {
  isRequestBodyLimitError,
  readRequestBodyWithLimit,
  requestBodyErrorToText,
} from "autopus/plugin-sdk/webhook-request-guards";
export { fetchWithSsrFGuard, isBlockedHostnameOrIp } from "autopus/plugin-sdk/ssrf-runtime";
export type { SessionEntry } from "autopus/plugin-sdk/session-store-runtime";
export {
  TtsAutoSchema,
  TtsConfigSchema,
  TtsModeSchema,
  TtsProviderSchema,
} from "autopus/plugin-sdk/tts-runtime";
export { sleep } from "autopus/plugin-sdk/runtime-env";
