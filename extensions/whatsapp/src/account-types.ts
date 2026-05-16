import type { AutopusConfig } from "autopus/plugin-sdk/config-contracts";

export type WhatsAppAccountConfig = NonNullable<
  NonNullable<NonNullable<AutopusConfig["channels"]>["whatsapp"]>["accounts"]
>[string];
