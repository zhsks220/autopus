import { describe, expect, it } from "vitest";
import { isAutopusManagedMatrixDevice, summarizeMatrixDeviceHealth } from "./device-health.js";

describe("matrix device health", () => {
  it("detects Autopus-managed device names", () => {
    expect(isAutopusManagedMatrixDevice("Autopus Gateway")).toBe(true);
    expect(isAutopusManagedMatrixDevice("Autopus Debug")).toBe(true);
    expect(isAutopusManagedMatrixDevice("Element iPhone")).toBe(false);
    expect(isAutopusManagedMatrixDevice(null)).toBe(false);
  });

  it("summarizes stale Autopus-managed devices separately from the current device", () => {
    const summary = summarizeMatrixDeviceHealth([
      {
        deviceId: "du314Zpw3A",
        displayName: "Autopus Gateway",
        current: true,
      },
      {
        deviceId: "BritdXC6iL",
        displayName: "Autopus Gateway",
        current: false,
      },
      {
        deviceId: "G6NJU9cTgs",
        displayName: "Autopus Debug",
        current: false,
      },
      {
        deviceId: "phone123",
        displayName: "Element iPhone",
        current: false,
      },
    ]);

    expect(summary).toEqual({
      currentDeviceId: "du314Zpw3A",
      currentAutopusDevices: [
        {
          deviceId: "du314Zpw3A",
          displayName: "Autopus Gateway",
          current: true,
        },
      ],
      staleAutopusDevices: [
        {
          deviceId: "BritdXC6iL",
          displayName: "Autopus Gateway",
          current: false,
        },
        {
          deviceId: "G6NJU9cTgs",
          displayName: "Autopus Debug",
          current: false,
        },
      ],
    });
  });
});
