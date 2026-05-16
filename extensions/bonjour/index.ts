import { definePluginEntry } from "autopus/plugin-sdk/plugin-entry";

function formatBonjourInstanceName(displayName: string) {
  const trimmed = displayName.trim();
  if (!trimmed) {
    return "Autopus";
  }
  if (/autopus/i.test(trimmed)) {
    return trimmed;
  }
  return `${trimmed} (Autopus)`;
}

export default definePluginEntry({
  id: "bonjour",
  name: "Bonjour Gateway Discovery",
  description: "Advertise the local Autopus gateway over Bonjour/mDNS.",
  register(api) {
    api.registerGatewayDiscoveryService({
      id: "bonjour",
      advertise: async (ctx) => {
        const [
          { startGatewayBonjourAdvertiser },
          { registerUncaughtExceptionHandler, registerUnhandledRejectionHandler },
        ] = await Promise.all([
          import("./src/advertiser.js"),
          import("autopus/plugin-sdk/runtime"),
        ]);
        const advertiser = await startGatewayBonjourAdvertiser(
          {
            instanceName: formatBonjourInstanceName(ctx.machineDisplayName),
            gatewayPort: ctx.gatewayPort,
            gatewayTlsEnabled: ctx.gatewayTlsEnabled,
            gatewayTlsFingerprintSha256: ctx.gatewayTlsFingerprintSha256,
            canvasPort: ctx.canvasPort,
            sshPort: ctx.sshPort,
            tailnetDns: ctx.tailnetDns,
            cliPath: ctx.cliPath,
            minimal: ctx.minimal,
          },
          {
            logger: api.logger,
            registerUncaughtExceptionHandler,
            registerUnhandledRejectionHandler,
          },
        );
        return { stop: advertiser.stop };
      },
    });
  },
});
