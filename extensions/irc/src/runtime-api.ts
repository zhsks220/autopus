// Private runtime barrel for the bundled IRC extension.
// Keep this barrel thin and generic-only.

export type { BaseProbeResult } from "autopus/plugin-sdk/channel-contract";
export type { ChannelPlugin } from "autopus/plugin-sdk/channel-core";
export type { AutopusConfig } from "autopus/plugin-sdk/config-contracts";
export type { PluginRuntime } from "autopus/plugin-sdk/runtime-store";
export type { RuntimeEnv } from "autopus/plugin-sdk/runtime";
export type {
  BlockStreamingCoalesceConfig,
  DmConfig,
  DmPolicy,
  GroupPolicy,
  GroupToolPolicyBySenderConfig,
  GroupToolPolicyConfig,
  MarkdownConfig,
} from "autopus/plugin-sdk/config-contracts";
export type { OutboundReplyPayload } from "autopus/plugin-sdk/reply-payload";
export { DEFAULT_ACCOUNT_ID } from "autopus/plugin-sdk/account-id";
export { buildChannelConfigSchema } from "autopus/plugin-sdk/channel-config-primitives";
export {
  PAIRING_APPROVED_MESSAGE,
  buildBaseChannelStatusSummary,
} from "autopus/plugin-sdk/channel-status";
export { createChannelPairingController } from "autopus/plugin-sdk/channel-pairing";
export { createAccountStatusSink } from "autopus/plugin-sdk/channel-lifecycle";
export { resolveControlCommandGate } from "autopus/plugin-sdk/command-auth-native";
export { createChannelMessageReplyPipeline } from "autopus/plugin-sdk/channel-message";
export { chunkTextForOutbound } from "autopus/plugin-sdk/text-chunking";
export {
  deliverFormattedTextWithAttachments,
  formatTextWithAttachmentLinks,
  resolveOutboundMediaUrls,
} from "autopus/plugin-sdk/reply-payload";
export {
  GROUP_POLICY_BLOCKED_LABEL,
  resolveAllowlistProviderRuntimeGroupPolicy,
  resolveDefaultGroupPolicy,
  warnMissingProviderGroupPolicyFallbackOnce,
} from "autopus/plugin-sdk/runtime-group-policy";
export { isDangerousNameMatchingEnabled } from "autopus/plugin-sdk/dangerous-name-runtime";
export { logInboundDrop } from "autopus/plugin-sdk/channel-inbound";
