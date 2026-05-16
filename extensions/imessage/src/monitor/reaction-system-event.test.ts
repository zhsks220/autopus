import type { RuntimeEnv } from "autopus/plugin-sdk/runtime-env";
import { enqueueSystemEvent } from "autopus/plugin-sdk/system-event-runtime";
import { describe, expect, it, vi } from "vitest";
import { enqueueIMessageReactionSystemEvent } from "./reaction-system-event.js";

vi.mock("autopus/plugin-sdk/system-event-runtime", () => ({
  enqueueSystemEvent: vi.fn(() => true),
}));

describe("enqueueIMessageReactionSystemEvent", () => {
  it("matches Discord by enqueueing inbound reactions as untrusted system events", () => {
    const runtime = { log: vi.fn(), error: vi.fn(), exit: vi.fn() } satisfies RuntimeEnv;
    const logVerbose = vi.fn();

    const queued = enqueueIMessageReactionSystemEvent({
      decision: {
        text: "iMessage reaction added: 👎 by +15555550123 on msg octopus-reply-guid",
        contextKey: "imessage:reaction:added:3:octopus-reply-guid:+15555550123:👎",
        route: { sessionKey: "agent:main:main" },
        reaction: {
          targetGuid: "octopus-reply-guid",
          action: "added",
          emoji: "👎",
        },
      },
      runtime,
      logVerbose,
    });

    expect(queued).toBe(true);
    expect(enqueueSystemEvent).toHaveBeenCalledWith(
      "iMessage reaction added: 👎 by +15555550123 on msg octopus-reply-guid",
      {
        sessionKey: "agent:main:main",
        contextKey: "imessage:reaction:added:3:octopus-reply-guid:+15555550123:👎",
        trusted: false,
      },
    );
    expect(runtime.log).toHaveBeenCalledWith(
      "imessage: reaction system event queued session=agent:main:main target=octopus-reply-guid action=added emoji=👎",
    );
    expect(logVerbose).toHaveBeenCalledWith(
      "imessage: reaction event enqueued: iMessage reaction added: 👎 by +15555550123 on msg octopus-reply-guid",
    );
  });
});
