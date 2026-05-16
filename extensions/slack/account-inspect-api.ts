import type { AutopusConfig } from "autopus/plugin-sdk/config-contracts";
import { inspectSlackAccount } from "./src/account-inspect.js";

export function inspectSlackReadOnlyAccount(cfg: AutopusConfig, accountId?: string | null) {
  return inspectSlackAccount({ cfg, accountId });
}
