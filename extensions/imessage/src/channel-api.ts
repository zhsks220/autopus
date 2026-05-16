import { formatTrimmedAllowFromEntries } from "autopus/plugin-sdk/channel-config-helpers";
import { PAIRING_APPROVED_MESSAGE } from "autopus/plugin-sdk/channel-status";
import {
  DEFAULT_ACCOUNT_ID,
  getChatChannelMeta,
  type ChannelPlugin,
} from "autopus/plugin-sdk/core";
import { resolveChannelMediaMaxBytes } from "autopus/plugin-sdk/media-runtime";
import { collectStatusIssuesFromLastError } from "autopus/plugin-sdk/status-helpers";
import { normalizeIMessageMessagingTarget } from "./normalize.js";
export { chunkTextForOutbound } from "autopus/plugin-sdk/text-chunking";

export {
  collectStatusIssuesFromLastError,
  DEFAULT_ACCOUNT_ID,
  formatTrimmedAllowFromEntries,
  getChatChannelMeta,
  normalizeIMessageMessagingTarget,
  PAIRING_APPROVED_MESSAGE,
  resolveChannelMediaMaxBytes,
};

export type { ChannelPlugin };
