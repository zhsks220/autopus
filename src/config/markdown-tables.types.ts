import type { AutopusConfig } from "./types.autopus.js";
import type { MarkdownTableMode } from "./types.base.js";

export type ResolveMarkdownTableModeParams = {
  cfg?: Partial<AutopusConfig>;
  channel?: string | null;
  accountId?: string | null;
};

export type ResolveMarkdownTableMode = (
  params: ResolveMarkdownTableModeParams,
) => MarkdownTableMode;
