import { buildManifestModelProviderConfig } from "autopus/plugin-sdk/provider-catalog-shared";
import type { ModelProviderConfig } from "autopus/plugin-sdk/provider-model-shared";
import manifest from "./autopus.plugin.json" with { type: "json" };

export function buildTogetherProvider(): ModelProviderConfig {
  return buildManifestModelProviderConfig({
    providerId: "together",
    catalog: manifest.modelCatalog.providers.together,
  });
}
