import type { AuthProfileStore, OAuthCredential } from "../agents/auth-profiles/types.js";
import type { AutopusConfig } from "../config/types.autopus.js";
import type { ModelProviderAuthMode, ModelProviderConfig } from "../config/types.js";

export type ProviderResolveSyntheticAuthContext = {
  config?: AutopusConfig;
  provider: string;
  providerConfig?: ModelProviderConfig;
};

export type ProviderSyntheticAuthResult = {
  apiKey: string;
  source: string;
  mode: Exclude<ModelProviderAuthMode, "aws-sdk">;
  expiresAt?: number;
};

export type ProviderResolveExternalOAuthProfilesContext = {
  config?: AutopusConfig;
  agentDir?: string;
  workspaceDir?: string;
  env: NodeJS.ProcessEnv;
  store: AuthProfileStore;
};

export type ProviderResolveExternalAuthProfilesContext =
  ProviderResolveExternalOAuthProfilesContext;

export type ProviderExternalOAuthProfile = {
  profileId: string;
  credential: OAuthCredential;
  persistence?: "runtime-only" | "persisted";
};

export type ProviderExternalAuthProfile = ProviderExternalOAuthProfile;
