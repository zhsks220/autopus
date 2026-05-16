import { describe, expect, it } from "vitest";
import { shortenText } from "./text-format.js";

describe("shortenText", () => {
  it("returns original text when it fits", () => {
    expect(shortenText("autopus", 16)).toBe("autopus");
  });

  it("truncates and appends ellipsis when over limit", () => {
    expect(shortenText("autopus-status-output", 10)).toBe("autopus-…");
  });

  it("counts multi-byte characters correctly", () => {
    expect(shortenText("hello🙂world", 7)).toBe("hello🙂…");
  });
});
