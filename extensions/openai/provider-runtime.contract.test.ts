import { describeOpenAIProviderRuntimeContract } from "autopus/plugin-sdk/provider-test-contracts";

describeOpenAIProviderRuntimeContract(() => import("./index.js"));
