import type { AutopusConfig } from "autopus/plugin-sdk/config-contracts";

export type IMessageAccountConfig = Omit<
  NonNullable<NonNullable<AutopusConfig["channels"]>["imessage"]>,
  "accounts" | "defaultAccount"
>;
