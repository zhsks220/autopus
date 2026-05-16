// Private runtime barrel for the bundled Feishu extension.
// Keep this barrel thin and generic-only.

export type {
  AllowlistMatch,
  AnyAgentTool,
  BaseProbeResult,
  ChannelGroupContext,
  ChannelMessageActionName,
  ChannelMeta,
  ChannelOutboundAdapter,
  ChannelPlugin,
  HistoryEntry,
  AutopusConfig,
  AutopusPluginApi,
  OutboundIdentity,
  PluginRuntime,
  ReplyPayload,
} from "autopus/plugin-sdk/core";
export type { AutopusConfig as ClawdbotConfig } from "autopus/plugin-sdk/core";
export type { RuntimeEnv } from "autopus/plugin-sdk/runtime";
export type { GroupToolPolicyConfig } from "autopus/plugin-sdk/config-contracts";
export {
  DEFAULT_ACCOUNT_ID,
  buildChannelConfigSchema,
  createActionGate,
  createDedupeCache,
} from "autopus/plugin-sdk/core";
export {
  PAIRING_APPROVED_MESSAGE,
  buildProbeChannelStatusSummary,
  createDefaultChannelRuntimeState,
} from "autopus/plugin-sdk/channel-status";
export { buildAgentMediaPayload } from "autopus/plugin-sdk/agent-media-payload";
export { createChannelPairingController } from "autopus/plugin-sdk/channel-pairing";
export { createReplyPrefixContext } from "autopus/plugin-sdk/channel-message";
export {
  evaluateSupplementalContextVisibility,
  filterSupplementalContextItems,
  resolveChannelContextVisibilityMode,
} from "autopus/plugin-sdk/context-visibility-runtime";
export {
  loadSessionStore,
  resolveSessionStoreEntry,
} from "autopus/plugin-sdk/session-store-runtime";
export { readJsonFileWithFallback } from "autopus/plugin-sdk/json-store";
export { createPersistentDedupe } from "autopus/plugin-sdk/persistent-dedupe";
export { normalizeAgentId } from "autopus/plugin-sdk/routing";
export { chunkTextForOutbound } from "autopus/plugin-sdk/text-chunking";
export {
  isRequestBodyLimitError,
  readRequestBodyWithLimit,
  requestBodyErrorToText,
} from "autopus/plugin-sdk/webhook-ingress";
export { setFeishuRuntime } from "./src/runtime.js";
