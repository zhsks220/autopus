import { describe, expect, it } from "vitest";
import type { AutopusConfig } from "../config/config.js";
import { resolveEffectiveToolPolicy } from "./pi-tools.policy.js";
import { pickSandboxToolPolicy } from "./sandbox-tool-policy.js";
import { resolveEffectiveToolFsRootExpansionAllowed } from "./tool-fs-policy.js";

describe("pickSandboxToolPolicy", () => {
  it("returns undefined when neither allow nor deny is configured", () => {
    expect(pickSandboxToolPolicy({})).toBeUndefined();
  });

  it("keeps alsoAllow without allow additive", () => {
    expect(
      pickSandboxToolPolicy({
        alsoAllow: ["web_search"],
      }),
    ).toEqual({
      allow: ["*", "web_search"],
      deny: undefined,
    });
  });

  it("merges allow and alsoAllow when both are present", () => {
    expect(
      pickSandboxToolPolicy({
        allow: ["read"],
        alsoAllow: ["write"],
      }),
    ).toEqual({
      allow: ["read", "write"],
      deny: undefined,
    });
  });

  it("preserves allow-all semantics for allow: [] plus alsoAllow", () => {
    expect(
      pickSandboxToolPolicy({
        allow: [],
        alsoAllow: ["web_search"],
      }),
    ).toEqual({
      allow: ["*", "web_search"],
      deny: undefined,
    });
  });

  it("passes deny through unchanged", () => {
    expect(
      pickSandboxToolPolicy({
        deny: ["exec"],
      }),
    ).toEqual({
      allow: undefined,
      deny: ["exec"],
    });
  });

  it("keeps global alsoAllow additive in effective tool policy resolution", () => {
    const cfg: AutopusConfig = {
      tools: {
        profile: "coding",
        alsoAllow: ["octopus"],
      },
    };

    const resolved = resolveEffectiveToolPolicy({ config: cfg, agentId: "main" });
    expect(resolved.globalPolicy).toEqual({ allow: ["*", "octopus"], deny: undefined });
    expect(resolved.profileAlsoAllow).toEqual(["octopus"]);
  });

  it("does not block fs root expansion when only global alsoAllow is configured", () => {
    const cfg: AutopusConfig = {
      tools: {
        alsoAllow: ["octopus"],
      },
    };

    expect(resolveEffectiveToolFsRootExpansionAllowed({ cfg, agentId: "main" })).toBe(true);
  });
});
