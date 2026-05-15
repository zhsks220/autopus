// Narrow Matrix monitor helper seam.
// Keep monitor internals off the broad package runtime-api barrel so monitor
// tests and shared workers do not pull unrelated Matrix helper surfaces.

export type { NormalizedLocation } from "autopus/plugin-sdk/channel-location";
export type { PluginRuntime, RuntimeLogger } from "autopus/plugin-sdk/plugin-runtime";
export type { BlockReplyContext, ReplyPayload } from "autopus/plugin-sdk/reply-runtime";
export type { MarkdownTableMode, AutopusConfig } from "autopus/plugin-sdk/config-contracts";
export type { RuntimeEnv } from "autopus/plugin-sdk/runtime";
export {
  addAllowlistUserEntriesFromConfigEntry,
  buildAllowlistResolutionSummary,
  canonicalizeAllowlistWithResolvedIds,
  formatAllowlistMatchMeta,
  patchAllowlistUsersInConfigEntries,
  summarizeMapping,
} from "autopus/plugin-sdk/allow-from";
export {
  createReplyPrefixOptions,
  createTypingCallbacks,
} from "autopus/plugin-sdk/channel-reply-options-runtime";
export { formatLocationText, toLocationContext } from "autopus/plugin-sdk/channel-location";
export { getAgentScopedMediaLocalRoots } from "autopus/plugin-sdk/agent-media-payload";
export { logInboundDrop, logTypingFailure } from "autopus/plugin-sdk/channel-logging";
export {
  buildChannelKeyCandidates,
  resolveChannelEntryMatch,
} from "autopus/plugin-sdk/channel-targets";
