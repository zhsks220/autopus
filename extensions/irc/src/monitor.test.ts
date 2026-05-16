import { describe, expect, it } from "vitest";
import { resolveIrcInboundTarget } from "./monitor.js";

describe("irc monitor inbound target", () => {
  it("keeps channel target for group messages", () => {
    expect(
      resolveIrcInboundTarget({
        target: "#autopus",
        senderNick: "alice",
      }),
    ).toEqual({
      isGroup: true,
      target: "#autopus",
      rawTarget: "#autopus",
    });
  });

  it("maps DM target to sender nick and preserves raw target", () => {
    expect(
      resolveIrcInboundTarget({
        target: "autopus-bot",
        senderNick: "alice",
      }),
    ).toEqual({
      isGroup: false,
      target: "alice",
      rawTarget: "autopus-bot",
    });
  });

  it("falls back to raw target when sender nick is empty", () => {
    expect(
      resolveIrcInboundTarget({
        target: "autopus-bot",
        senderNick: " ",
      }),
    ).toEqual({
      isGroup: false,
      target: "autopus-bot",
      rawTarget: "autopus-bot",
    });
  });
});
