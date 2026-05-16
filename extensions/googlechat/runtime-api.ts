// Private runtime barrel for the bundled Google Chat extension.
// Keep this barrel thin and avoid broad plugin-sdk surfaces during bootstrap.

export { DEFAULT_ACCOUNT_ID } from "autopus/plugin-sdk/account-id";
export {
  createActionGate,
  jsonResult,
  readNumberParam,
  readReactionParams,
  readStringParam,
} from "autopus/plugin-sdk/channel-actions";
export { buildChannelConfigSchema } from "autopus/plugin-sdk/channel-config-primitives";
export type {
  ChannelMessageActionAdapter,
  ChannelMessageActionName,
  ChannelStatusIssue,
} from "autopus/plugin-sdk/channel-contract";
export { missingTargetError } from "autopus/plugin-sdk/channel-feedback";
export {
  createAccountStatusSink,
  runPassiveAccountLifecycle,
} from "autopus/plugin-sdk/channel-lifecycle";
export { createChannelPairingController } from "autopus/plugin-sdk/channel-pairing";
export { createChannelMessageReplyPipeline } from "autopus/plugin-sdk/channel-message";
export { PAIRING_APPROVED_MESSAGE } from "autopus/plugin-sdk/channel-status";
export { chunkTextForOutbound } from "autopus/plugin-sdk/text-chunking";
export type { AutopusConfig } from "autopus/plugin-sdk/config-contracts";
export { GoogleChatConfigSchema } from "autopus/plugin-sdk/bundled-channel-config-schema";
export {
  GROUP_POLICY_BLOCKED_LABEL,
  resolveAllowlistProviderRuntimeGroupPolicy,
  resolveDefaultGroupPolicy,
  warnMissingProviderGroupPolicyFallbackOnce,
} from "autopus/plugin-sdk/runtime-group-policy";
export { isDangerousNameMatchingEnabled } from "autopus/plugin-sdk/dangerous-name-runtime";
export {
  readRemoteMediaBuffer,
  resolveChannelMediaMaxBytes,
} from "autopus/plugin-sdk/media-runtime";
export { loadOutboundMediaFromUrl } from "autopus/plugin-sdk/outbound-media";
export type { PluginRuntime } from "autopus/plugin-sdk/runtime-store";
export { fetchWithSsrFGuard } from "autopus/plugin-sdk/ssrf-runtime";
export type {
  GoogleChatAccountConfig,
  GoogleChatConfig,
} from "autopus/plugin-sdk/config-contracts";
export { extractToolSend } from "autopus/plugin-sdk/tool-send";
export { resolveInboundMentionDecision } from "autopus/plugin-sdk/channel-inbound";
export { resolveInboundRouteEnvelopeBuilderWithRuntime } from "autopus/plugin-sdk/inbound-envelope";
export { resolveWebhookPath } from "autopus/plugin-sdk/webhook-ingress";
export {
  registerWebhookTargetWithPluginRoute,
  resolveWebhookTargetWithAuthOrReject,
  withResolvedWebhookRequestPipeline,
} from "autopus/plugin-sdk/webhook-targets";
export {
  createWebhookInFlightLimiter,
  readJsonWebhookBodyOrReject,
  type WebhookInFlightLimiter,
} from "autopus/plugin-sdk/webhook-request-guards";
export { setGoogleChatRuntime } from "./src/runtime.js";
