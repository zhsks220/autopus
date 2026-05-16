import { describeGithubCopilotProviderRuntimeContract } from "autopus/plugin-sdk/provider-test-contracts";

describeGithubCopilotProviderRuntimeContract(() => import("./index.js"));
