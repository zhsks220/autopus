import type { AutopusConfig } from "../../config/types.js";

export type DirectoryConfigParams = {
  cfg: AutopusConfig;
  accountId?: string | null;
  query?: string | null;
  limit?: number | null;
};
