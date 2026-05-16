export const AUTOPUS_OWNER_ONLY_CORE_TOOL_NAMES = ["cron", "gateway", "nodes"] as const;

const AUTOPUS_OWNER_ONLY_CORE_TOOL_NAME_SET: ReadonlySet<string> = new Set(
  AUTOPUS_OWNER_ONLY_CORE_TOOL_NAMES,
);

export function isAutopusOwnerOnlyCoreToolName(toolName: string): boolean {
  return AUTOPUS_OWNER_ONLY_CORE_TOOL_NAME_SET.has(toolName);
}
