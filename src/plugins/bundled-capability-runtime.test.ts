import { describe, expect, it } from "vitest";
import { buildVitestCapabilityShimAliasMap } from "./bundled-capability-runtime.js";

describe("buildVitestCapabilityShimAliasMap", () => {
  it("keeps scoped and unscoped capability shim aliases aligned", () => {
    const aliasMap = buildVitestCapabilityShimAliasMap();

    expect(aliasMap["autopus/plugin-sdk/config-runtime"]).toBe(
      aliasMap["@autopus/plugin-sdk/config-runtime"],
    );
    expect(aliasMap["autopus/plugin-sdk/media-runtime"]).toBe(
      aliasMap["@autopus/plugin-sdk/media-runtime"],
    );
    expect(aliasMap["autopus/plugin-sdk/provider-onboard"]).toBe(
      aliasMap["@autopus/plugin-sdk/provider-onboard"],
    );
    expect(aliasMap["autopus/plugin-sdk/speech-core"]).toBe(
      aliasMap["@autopus/plugin-sdk/speech-core"],
    );
  });
});
