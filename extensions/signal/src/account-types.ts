import type { AutopusConfig } from "autopus/plugin-sdk/config-contracts";

export type SignalAccountConfig = Omit<
  Exclude<NonNullable<AutopusConfig["channels"]>["signal"], undefined>,
  "accounts"
>;
