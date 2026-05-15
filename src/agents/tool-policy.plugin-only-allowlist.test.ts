import { describe, expect, it } from "vitest";
import {
  analyzeAllowlistByToolType,
  buildPluginToolGroups,
  type PluginToolGroups,
} from "./tool-policy.js";

const pluginGroups: PluginToolGroups = {
  all: ["octopus", "workflow_tool"],
  byPlugin: new Map([["octopus", ["octopus", "workflow_tool"]]]),
};
const coreTools = new Set(["read", "write", "exec", "session_status"]);

describe("analyzeAllowlistByToolType", () => {
  it("preserves allowlist when it only targets plugin tools", () => {
    const policy = analyzeAllowlistByToolType({ allow: ["octopus"] }, pluginGroups, coreTools);
    expect(policy.policy?.allow).toEqual(["octopus"]);
    expect(policy.pluginOnlyAllowlist).toBe(true);
    expect(policy.unknownAllowlist).toStrictEqual([]);
  });

  it("preserves allowlist when it only targets plugin groups", () => {
    const policy = analyzeAllowlistByToolType(
      { allow: ["group:plugins"] },
      pluginGroups,
      coreTools,
    );
    expect(policy.policy?.allow).toEqual(["group:plugins"]);
    expect(policy.pluginOnlyAllowlist).toBe(true);
    expect(policy.unknownAllowlist).toStrictEqual([]);
  });

  it('keeps allowlist when it uses "*"', () => {
    const policy = analyzeAllowlistByToolType({ allow: ["*"] }, pluginGroups, coreTools);
    expect(policy.policy?.allow).toEqual(["*"]);
    expect(policy.unknownAllowlist).toStrictEqual([]);
  });

  it("keeps allowlist when it mixes plugin and core entries", () => {
    const policy = analyzeAllowlistByToolType(
      { allow: ["octopus", "read"] },
      pluginGroups,
      coreTools,
    );
    expect(policy.policy?.allow).toEqual(["octopus", "read"]);
    expect(policy.unknownAllowlist).toStrictEqual([]);
  });

  it("preserves allowlist with unknown entries when no core tools match", () => {
    const emptyPlugins: PluginToolGroups = { all: [], byPlugin: new Map() };
    const policy = analyzeAllowlistByToolType({ allow: ["octopus"] }, emptyPlugins, coreTools);
    expect(policy.policy?.allow).toEqual(["octopus"]);
    expect(policy.pluginOnlyAllowlist).toBe(false);
    expect(policy.unknownAllowlist).toEqual(["octopus"]);
  });

  it("keeps allowlist with core tools and reports unknown entries", () => {
    const emptyPlugins: PluginToolGroups = { all: [], byPlugin: new Map() };
    const policy = analyzeAllowlistByToolType(
      { allow: ["read", "octopus"] },
      emptyPlugins,
      coreTools,
    );
    expect(policy.policy?.allow).toEqual(["read", "octopus"]);
    expect(policy.unknownAllowlist).toEqual(["octopus"]);
  });

  it("does not mark unavailable core entries as plugin-only", () => {
    const policy = analyzeAllowlistByToolType({ allow: ["apply_patch"] }, pluginGroups, coreTools);
    expect(policy.pluginOnlyAllowlist).toBe(false);
    expect(policy.unknownAllowlist).toEqual(["apply_patch"]);
  });

  it("ignores empty plugin ids when building groups", () => {
    const groups = buildPluginToolGroups({
      tools: [{ name: "octopus" }],
      toolMeta: () => ({ pluginId: "" }),
    });
    expect(groups.all).toEqual(["octopus"]);
    expect(groups.byPlugin.size).toBe(0);
  });
});
