export type MatrixManagedDeviceInfo = {
  deviceId: string;
  displayName: string | null;
  current: boolean;
};

export type MatrixDeviceHealthSummary = {
  currentDeviceId: string | null;
  staleAutopusDevices: MatrixManagedDeviceInfo[];
  currentAutopusDevices: MatrixManagedDeviceInfo[];
};

const AUTOPUS_DEVICE_NAME_PREFIX = "Autopus ";

export function isAutopusManagedMatrixDevice(displayName: string | null | undefined): boolean {
  return displayName?.startsWith(AUTOPUS_DEVICE_NAME_PREFIX) === true;
}

export function summarizeMatrixDeviceHealth(
  devices: MatrixManagedDeviceInfo[],
): MatrixDeviceHealthSummary {
  const currentDeviceId = devices.find((device) => device.current)?.deviceId ?? null;
  const autopusDevices = devices.filter((device) =>
    isAutopusManagedMatrixDevice(device.displayName),
  );
  return {
    currentDeviceId,
    staleAutopusDevices: autopusDevices.filter((device) => !device.current),
    currentAutopusDevices: autopusDevices.filter((device) => device.current),
  };
}
