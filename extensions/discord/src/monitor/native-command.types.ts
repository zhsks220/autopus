import type { AutopusConfig } from "autopus/plugin-sdk/config-contracts";
import type { CommandArgValues } from "autopus/plugin-sdk/native-command-registry";

export type DiscordConfig = NonNullable<AutopusConfig["channels"]>["discord"];

export type DiscordCommandArgs = {
  raw?: string;
  values?: CommandArgValues;
};
