// Private runtime barrel for the bundled Mattermost extension.
// Keep this barrel thin and generic-only.

export type {
  BaseProbeResult,
  ChannelAccountSnapshot,
  ChannelDirectoryEntry,
  ChannelGroupContext,
  ChannelMessageActionName,
  ChannelPlugin,
  ChatType,
  HistoryEntry,
  AutopusConfig,
  AutopusPluginApi,
  PluginRuntime,
} from "autopus/plugin-sdk/core";
export type { RuntimeEnv } from "autopus/plugin-sdk/runtime";
export type { ReplyPayload } from "autopus/plugin-sdk/reply-runtime";
export type { ModelsProviderData } from "autopus/plugin-sdk/models-provider-runtime";
export type {
  BlockStreamingCoalesceConfig,
  DmPolicy,
  GroupPolicy,
} from "autopus/plugin-sdk/config-contracts";
export {
  DEFAULT_ACCOUNT_ID,
  buildChannelConfigSchema,
  createDedupeCache,
  parseStrictPositiveInteger,
  resolveClientIp,
  isTrustedProxyAddress,
} from "autopus/plugin-sdk/core";
export { buildComputedAccountStatusSnapshot } from "autopus/plugin-sdk/channel-status";
export { createAccountStatusSink } from "autopus/plugin-sdk/channel-lifecycle";
export { buildAgentMediaPayload } from "autopus/plugin-sdk/agent-media-payload";
export {
  listSkillCommandsForAgents,
  resolveControlCommandGate,
  resolveStoredModelOverride,
} from "autopus/plugin-sdk/command-auth-native";
export { buildModelsProviderData } from "autopus/plugin-sdk/models-provider-runtime";
export {
  GROUP_POLICY_BLOCKED_LABEL,
  resolveAllowlistProviderRuntimeGroupPolicy,
  resolveDefaultGroupPolicy,
  warnMissingProviderGroupPolicyFallbackOnce,
} from "autopus/plugin-sdk/runtime-group-policy";
export { isDangerousNameMatchingEnabled } from "autopus/plugin-sdk/dangerous-name-runtime";
export { loadSessionStore, resolveStorePath } from "autopus/plugin-sdk/session-store-runtime";
export { formatInboundFromLabel } from "autopus/plugin-sdk/channel-inbound";
export { logInboundDrop } from "autopus/plugin-sdk/channel-inbound";
export { createChannelPairingController } from "autopus/plugin-sdk/channel-pairing";
export { createChannelMessageReplyPipeline } from "autopus/plugin-sdk/channel-message";
export { logTypingFailure } from "autopus/plugin-sdk/channel-feedback";
export { loadOutboundMediaFromUrl } from "autopus/plugin-sdk/outbound-media";
export { rawDataToString } from "autopus/plugin-sdk/webhook-ingress";
export { chunkTextForOutbound } from "autopus/plugin-sdk/text-chunking";
export {
  DEFAULT_GROUP_HISTORY_LIMIT,
  buildPendingHistoryContextFromMap,
  clearHistoryEntriesIfEnabled,
  recordPendingHistoryEntryIfEnabled,
} from "autopus/plugin-sdk/reply-history";
export { normalizeAccountId, resolveThreadSessionKeys } from "autopus/plugin-sdk/routing";
export { resolveAllowlistMatchSimple } from "autopus/plugin-sdk/allow-from";
export { registerPluginHttpRoute } from "autopus/plugin-sdk/webhook-targets";
export {
  isRequestBodyLimitError,
  readRequestBodyWithLimit,
} from "autopus/plugin-sdk/webhook-ingress";
export {
  applyAccountNameToChannelSection,
  applySetupAccountConfigPatch,
  migrateBaseNameToDefaultAccount,
} from "autopus/plugin-sdk/setup";
export {
  getAgentScopedMediaLocalRoots,
  resolveChannelMediaMaxBytes,
} from "autopus/plugin-sdk/media-runtime";
export { normalizeProviderId } from "autopus/plugin-sdk/provider-model-shared";
export { setMattermostRuntime } from "./src/runtime.js";
