import { buildManifestModelProviderConfig } from "autopus/plugin-sdk/provider-catalog-shared";
import type { ModelProviderConfig } from "autopus/plugin-sdk/provider-model-shared";
import manifest from "./autopus.plugin.json" with { type: "json" };

export function buildMistralProvider(): ModelProviderConfig {
  return buildManifestModelProviderConfig({
    providerId: "mistral",
    catalog: manifest.modelCatalog.providers.mistral,
  });
}
