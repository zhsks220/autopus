// Private runtime barrel for the bundled Microsoft Teams extension.
// Keep this barrel thin and aligned with the local extension surface.

export { DEFAULT_ACCOUNT_ID } from "autopus/plugin-sdk/account-id";
export type { AllowlistMatch } from "autopus/plugin-sdk/allow-from";
export {
  mergeAllowlist,
  resolveAllowlistMatchSimple,
  summarizeMapping,
} from "autopus/plugin-sdk/allow-from";
export type {
  BaseProbeResult,
  ChannelDirectoryEntry,
  ChannelGroupContext,
  ChannelMessageActionName,
  ChannelOutboundAdapter,
} from "autopus/plugin-sdk/channel-contract";
export type { ChannelPlugin } from "autopus/plugin-sdk/channel-core";
export { logTypingFailure } from "autopus/plugin-sdk/channel-logging";
export { createChannelPairingController } from "autopus/plugin-sdk/channel-pairing";
export { resolveToolsBySender } from "autopus/plugin-sdk/channel-policy";
export { createChannelMessageReplyPipeline } from "autopus/plugin-sdk/channel-message";
export {
  PAIRING_APPROVED_MESSAGE,
  buildProbeChannelStatusSummary,
  createDefaultChannelRuntimeState,
} from "autopus/plugin-sdk/channel-status";
export {
  buildChannelKeyCandidates,
  normalizeChannelSlug,
  resolveChannelEntryMatchWithFallback,
  resolveNestedAllowlistDecision,
} from "autopus/plugin-sdk/channel-targets";
export type {
  GroupPolicy,
  GroupToolPolicyConfig,
  MSTeamsChannelConfig,
  MSTeamsConfig,
  MSTeamsReplyStyle,
  MSTeamsTeamConfig,
  MarkdownTableMode,
  AutopusConfig,
} from "autopus/plugin-sdk/config-contracts";
export { isDangerousNameMatchingEnabled } from "autopus/plugin-sdk/dangerous-name-runtime";
export { resolveDefaultGroupPolicy } from "autopus/plugin-sdk/runtime-group-policy";
export { withFileLock } from "autopus/plugin-sdk/file-lock";
export { keepHttpServerTaskAlive } from "autopus/plugin-sdk/channel-lifecycle";
export {
  detectMime,
  extensionForMime,
  extractOriginalFilename,
  getFileExtension,
  resolveChannelMediaMaxBytes,
} from "autopus/plugin-sdk/media-runtime";
export { dispatchReplyFromConfigWithSettledDispatcher } from "autopus/plugin-sdk/inbound-reply-dispatch";
export { loadOutboundMediaFromUrl } from "autopus/plugin-sdk/outbound-media";
export { buildMediaPayload } from "autopus/plugin-sdk/reply-payload";
export type { ReplyPayload } from "autopus/plugin-sdk/reply-payload";
export type { PluginRuntime } from "autopus/plugin-sdk/runtime-store";
export type { RuntimeEnv } from "autopus/plugin-sdk/runtime";
export type { SsrFPolicy } from "autopus/plugin-sdk/ssrf-runtime";
export { fetchWithSsrFGuard } from "autopus/plugin-sdk/ssrf-runtime";
export { normalizeStringEntries } from "autopus/plugin-sdk/string-normalization-runtime";
export { chunkTextForOutbound } from "autopus/plugin-sdk/text-chunking";
export { DEFAULT_WEBHOOK_MAX_BODY_BYTES } from "autopus/plugin-sdk/webhook-ingress";
export { setMSTeamsRuntime } from "./src/runtime.js";
