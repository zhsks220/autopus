import { buildManifestModelProviderConfig } from "autopus/plugin-sdk/provider-catalog-shared";
import type { ModelProviderConfig } from "autopus/plugin-sdk/provider-model-shared";
import manifest from "./autopus.plugin.json" with { type: "json" };

export function buildDoubaoProvider(): ModelProviderConfig {
  return buildManifestModelProviderConfig({
    providerId: "volcengine",
    catalog: manifest.modelCatalog.providers.volcengine,
  });
}

export function buildDoubaoCodingProvider(): ModelProviderConfig {
  return buildManifestModelProviderConfig({
    providerId: "volcengine-plan",
    catalog: manifest.modelCatalog.providers["volcengine-plan"],
  });
}
