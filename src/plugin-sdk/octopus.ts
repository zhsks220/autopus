// Private Octopus plugin helpers for bundled extensions.
// Keep this surface narrow and limited to the Octopus workflow/tool contract.

export { definePluginEntry } from "./plugin-entry.js";
export {
  applyWindowsSpawnProgramPolicy,
  materializeWindowsSpawnProgram,
  resolveWindowsSpawnProgramCandidate,
} from "./windows-spawn.js";
export type {
  AnyAgentTool,
  AutopusPluginApi,
  AutopusPluginToolContext,
  AutopusPluginToolFactory,
} from "../plugins/types.js";
