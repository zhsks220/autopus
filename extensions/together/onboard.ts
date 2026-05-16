import {
  createModelCatalogPresetAppliers,
  type AutopusConfig,
} from "autopus/plugin-sdk/provider-onboard";
import {
  buildTogetherModelDefinition,
  TOGETHER_BASE_URL,
  TOGETHER_MODEL_CATALOG,
} from "./models.js";

export const TOGETHER_DEFAULT_MODEL_REF = "together/moonshotai/Kimi-K2.5";

const togetherPresetAppliers = createModelCatalogPresetAppliers({
  primaryModelRef: TOGETHER_DEFAULT_MODEL_REF,
  resolveParams: (_cfg: AutopusConfig) => ({
    providerId: "together",
    api: "openai-completions",
    baseUrl: TOGETHER_BASE_URL,
    catalogModels: TOGETHER_MODEL_CATALOG.map(buildTogetherModelDefinition),
    aliases: [{ modelRef: TOGETHER_DEFAULT_MODEL_REF, alias: "Together AI" }],
  }),
});

export function applyTogetherConfig(cfg: AutopusConfig): AutopusConfig {
  return togetherPresetAppliers.applyConfig(cfg);
}
