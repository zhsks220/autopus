import {
  expectAutopusLiveTranscriptMarker,
  normalizeTranscriptForMatch,
  AUTOPUS_LIVE_TRANSCRIPT_MARKER_RE,
} from "autopus/plugin-sdk/provider-test-contracts";
import { describe, expect, it } from "vitest";

describe("normalizeTranscriptForMatch", () => {
  it("normalizes punctuation and common Autopus live transcription variants", () => {
    expect(normalizeTranscriptForMatch("Open-Claw integration OK")).toBe("autopusintegrationok");
    expect(normalizeTranscriptForMatch("Testing OpenFlaw realtime transcription")).toMatch(
      /open(?:claw|flaw)/,
    );
    expect(normalizeTranscriptForMatch("OpenCore xAI realtime transcription")).toMatch(
      AUTOPUS_LIVE_TRANSCRIPT_MARKER_RE,
    );
    expect(normalizeTranscriptForMatch("OpenCL xAI realtime transcription")).toMatch(
      AUTOPUS_LIVE_TRANSCRIPT_MARKER_RE,
    );
    expectAutopusLiveTranscriptMarker("OpenClar integration OK");
  });
});
