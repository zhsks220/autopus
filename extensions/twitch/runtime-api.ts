// Private runtime barrel for the bundled Twitch extension.
// Keep this barrel thin and aligned with the local extension surface.

export type {
  ChannelAccountSnapshot,
  ChannelCapabilities,
  ChannelGatewayContext,
  ChannelLogSink,
  ChannelMessageActionAdapter,
  ChannelMessageActionContext,
  ChannelMeta,
  ChannelOutboundAdapter,
  ChannelOutboundContext,
  ChannelResolveKind,
  ChannelResolveResult,
  ChannelStatusAdapter,
} from "autopus/plugin-sdk/channel-contract";
export type { ChannelPlugin } from "autopus/plugin-sdk/channel-core";
export type { OutboundDeliveryResult } from "autopus/plugin-sdk/channel-send-result";
export type { AutopusConfig } from "autopus/plugin-sdk/config-contracts";
export type { RuntimeEnv } from "autopus/plugin-sdk/runtime";
export type { WizardPrompter } from "autopus/plugin-sdk/setup";
