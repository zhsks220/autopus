import type { AutopusConfig } from "./runtime-api.js";
import { inspectTelegramAccount } from "./src/account-inspect.js";

export function inspectTelegramReadOnlyAccount(cfg: AutopusConfig, accountId?: string | null) {
  return inspectTelegramAccount({ cfg, accountId });
}
