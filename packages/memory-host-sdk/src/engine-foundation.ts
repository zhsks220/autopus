// Real workspace contract for memory engine foundation concerns.

export {
  resolveAgentContextLimits,
  resolveAgentDir,
  resolveAgentWorkspaceDir,
  resolveDefaultAgentId,
  resolveSessionAgentId,
} from "./host/autopus-runtime-agent.js";
export {
  resolveMemorySearchConfig,
  resolveMemorySearchSyncConfig,
  type ResolvedMemorySearchConfig,
  type ResolvedMemorySearchSyncConfig,
} from "./host/autopus-runtime-agent.js";
export { parseDurationMs } from "./host/autopus-runtime-config.js";
export { loadConfig } from "./host/autopus-runtime-config.js";
export { resolveStateDir } from "./host/autopus-runtime-config.js";
export { resolveSessionTranscriptsDirForAgent } from "./host/autopus-runtime-config.js";
export {
  hasConfiguredSecretInput,
  normalizeResolvedSecretInputString,
} from "./host/autopus-runtime-config.js";
export { root } from "./host/autopus-runtime-io.js";
export { isPathInside } from "./host/fs-utils.js";
export { createSubsystemLogger } from "./host/autopus-runtime-io.js";
export { detectMime } from "./host/autopus-runtime-io.js";
export { resolveGlobalSingleton } from "./host/autopus-runtime-io.js";
export { onSessionTranscriptUpdate } from "./host/autopus-runtime-session.js";
export { splitShellArgs } from "./host/autopus-runtime-io.js";
export { runTasksWithConcurrency } from "./host/autopus-runtime-io.js";
export {
  shortenHomeInString,
  shortenHomePath,
  resolveUserPath,
  truncateUtf16Safe,
} from "./host/autopus-runtime-io.js";
export type { AutopusConfig } from "./host/autopus-runtime-config.js";
export type { SessionSendPolicyConfig } from "./host/autopus-runtime-config.js";
export type { SecretInput } from "./host/autopus-runtime-config.js";
export type {
  MemoryBackend,
  MemoryCitationsMode,
  MemoryQmdConfig,
  MemoryQmdIndexPath,
  MemoryQmdMcporterConfig,
  MemoryQmdSearchMode,
} from "./host/autopus-runtime-config.js";
export type { MemorySearchConfig } from "./host/autopus-runtime-config.js";
