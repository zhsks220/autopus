import type { ModelCatalogProvider } from "../types.js";

export type AutopusProviderIndexPluginInstall = {
  clawhubSpec?: string;
  npmSpec?: string;
  defaultChoice?: "clawhub" | "npm";
  minHostVersion?: string;
  expectedIntegrity?: string;
};

export type AutopusProviderIndexPlugin = {
  id: string;
  package?: string;
  source?: string;
  install?: AutopusProviderIndexPluginInstall;
};

export type AutopusProviderIndexProviderAuthChoice = {
  method: string;
  choiceId: string;
  choiceLabel: string;
  choiceHint?: string;
  assistantPriority?: number;
  assistantVisibility?: "visible" | "manual-only";
  groupId?: string;
  groupLabel?: string;
  groupHint?: string;
  optionKey?: string;
  cliFlag?: string;
  cliOption?: string;
  cliDescription?: string;
  onboardingScopes?: readonly ("text-inference" | "image-generation")[];
};

export type AutopusProviderIndexProvider = {
  id: string;
  name: string;
  plugin: AutopusProviderIndexPlugin;
  docs?: string;
  categories?: readonly string[];
  authChoices?: readonly AutopusProviderIndexProviderAuthChoice[];
  previewCatalog?: ModelCatalogProvider;
};

export type AutopusProviderIndex = {
  version: number;
  providers: Readonly<Record<string, AutopusProviderIndexProvider>>;
};
