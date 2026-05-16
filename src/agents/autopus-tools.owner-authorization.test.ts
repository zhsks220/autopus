import { describe, expect, it } from "vitest";
import {
  isAutopusOwnerOnlyCoreToolName,
  AUTOPUS_OWNER_ONLY_CORE_TOOL_NAMES,
} from "./tools/owner-only-tools.js";

describe("createAutopusTools owner authorization", () => {
  it("marks owner-only core tool names", () => {
    expect(AUTOPUS_OWNER_ONLY_CORE_TOOL_NAMES).toEqual(["cron", "gateway", "nodes"]);
    expect(isAutopusOwnerOnlyCoreToolName("cron")).toBe(true);
    expect(isAutopusOwnerOnlyCoreToolName("gateway")).toBe(true);
    expect(isAutopusOwnerOnlyCoreToolName("nodes")).toBe(true);
  });

  it("keeps canvas non-owner-only", () => {
    expect(isAutopusOwnerOnlyCoreToolName("canvas")).toBe(false);
  });
});
