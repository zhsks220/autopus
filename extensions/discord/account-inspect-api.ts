import type { AutopusConfig } from "autopus/plugin-sdk/config-contracts";
import { inspectDiscordAccount } from "./src/account-inspect.js";

export function inspectDiscordReadOnlyAccount(cfg: AutopusConfig, accountId?: string | null) {
  return inspectDiscordAccount({ cfg, accountId });
}
