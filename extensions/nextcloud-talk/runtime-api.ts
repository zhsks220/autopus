// Private runtime barrel for the bundled Nextcloud Talk extension.
// Keep this barrel thin and aligned with the local extension surface.

export type { AllowlistMatch } from "autopus/plugin-sdk/allow-from";
export type { ChannelGroupContext } from "autopus/plugin-sdk/channel-contract";
export { logInboundDrop } from "autopus/plugin-sdk/channel-logging";
export { createChannelPairingController } from "autopus/plugin-sdk/channel-pairing";
export type {
  BlockStreamingCoalesceConfig,
  DmConfig,
  DmPolicy,
  GroupPolicy,
  GroupToolPolicyConfig,
  AutopusConfig,
} from "autopus/plugin-sdk/config-contracts";
export {
  GROUP_POLICY_BLOCKED_LABEL,
  resolveAllowlistProviderRuntimeGroupPolicy,
  resolveDefaultGroupPolicy,
  warnMissingProviderGroupPolicyFallbackOnce,
} from "autopus/plugin-sdk/runtime-group-policy";
export { createChannelMessageReplyPipeline } from "autopus/plugin-sdk/channel-message";
export type { OutboundReplyPayload } from "autopus/plugin-sdk/reply-payload";
export { deliverFormattedTextWithAttachments } from "autopus/plugin-sdk/reply-payload";
export type { PluginRuntime } from "autopus/plugin-sdk/runtime-store";
export type { RuntimeEnv } from "autopus/plugin-sdk/runtime";
export type { SecretInput } from "autopus/plugin-sdk/secret-input";
export { fetchWithSsrFGuard } from "autopus/plugin-sdk/ssrf-runtime";
export { setNextcloudTalkRuntime } from "./src/runtime.js";
