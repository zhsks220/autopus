import { describePluginRegistrationContract } from "autopus/plugin-sdk/plugin-test-contracts";

describePluginRegistrationContract({
  pluginId: "alibaba",
  videoGenerationProviderIds: ["alibaba"],
  requireGenerateVideo: true,
});
