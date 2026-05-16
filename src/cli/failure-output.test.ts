import { describe, expect, it } from "vitest";
import { formatCliFailureLines } from "./failure-output.js";

describe("formatCliFailureLines", () => {
  it("shows a concise reason and recovery commands by default", () => {
    const lines = formatCliFailureLines({
      title: "Could not start the CLI.",
      error: new Error("config file is invalid"),
      argv: ["node", "autopus", "status"],
      env: {},
    });

    expect(lines).toEqual([
      "[autopus] Could not start the CLI.",
      "[autopus] Reason: config file is invalid",
      "[autopus] Debug: set AUTOPUS_DEBUG=1 to include the stack trace.",
      "[autopus] Try: autopus doctor",
      "[autopus] Help: autopus --help",
    ]);
  });

  it("prints stack details when debug output is requested", () => {
    const lines = formatCliFailureLines({
      title: "The CLI command failed.",
      error: new Error("boom"),
      env: { AUTOPUS_DEBUG: "1" },
    });

    expect(lines.slice(0, 4)).toEqual([
      "[autopus] The CLI command failed.",
      "[autopus] Reason: boom",
      "[autopus] Stack:",
      "[autopus] Error: boom",
    ]);
    expect(lines.join("\n")).toContain("Error: boom");
  });
});
