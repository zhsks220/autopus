import { describeGithubCopilotProviderAuthContract } from "autopus/plugin-sdk/provider-test-contracts";

describeGithubCopilotProviderAuthContract(() => import("./index.js"));
