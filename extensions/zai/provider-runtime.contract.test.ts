import { describeZAIProviderRuntimeContract } from "autopus/plugin-sdk/provider-test-contracts";

describeZAIProviderRuntimeContract(() => import("./index.js"));
