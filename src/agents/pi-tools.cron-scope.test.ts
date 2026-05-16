import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AnyAgentTool } from "./tools/common.js";

const mocks = vi.hoisted(() => {
  const stubTool = (name: string, ownerOnly = false) =>
    ({
      name,
      label: name,
      displaySummary: name,
      description: name,
      ownerOnly,
      parameters: { type: "object", properties: {} },
      execute: vi.fn(),
    }) satisfies AnyAgentTool;

  return {
    createAutopusToolsOptions: vi.fn(),
    stubTool,
  };
});

vi.mock("./autopus-tools.js", () => ({
  createAutopusTools: (options: unknown) => {
    mocks.createAutopusToolsOptions(options);
    return [mocks.stubTool("cron", true)];
  },
}));

import "./test-helpers/fast-bash-tools.js";
import "./test-helpers/fast-coding-tools.js";
import { createAutopusCodingTools } from "./pi-tools.js";

function firstAutopusToolsOptions(): { cronSelfRemoveOnlyJobId?: string } | undefined {
  return mocks.createAutopusToolsOptions.mock.calls[0]?.[0] as
    | { cronSelfRemoveOnlyJobId?: string }
    | undefined;
}

describe("createAutopusCodingTools cron scope", () => {
  beforeEach(() => {
    mocks.createAutopusToolsOptions.mockClear();
  });

  it("scopes the cron owner-only runtime grant to self-removal", () => {
    const tools = createAutopusCodingTools({
      trigger: "cron",
      jobId: "job-current",
      senderIsOwner: false,
      ownerOnlyToolAllowlist: ["cron"],
    });

    expect(tools.map((tool) => tool.name)).toContain("cron");
    expect(firstAutopusToolsOptions()?.cronSelfRemoveOnlyJobId).toBe("job-current");
  });

  it("does not scope ordinary owner cron sessions", () => {
    createAutopusCodingTools({
      trigger: "cron",
      jobId: "job-current",
      senderIsOwner: true,
    });

    expect(firstAutopusToolsOptions()?.cronSelfRemoveOnlyJobId).toBeUndefined();
  });
});
