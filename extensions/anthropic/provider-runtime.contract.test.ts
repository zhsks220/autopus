import { describeAnthropicProviderRuntimeContract } from "autopus/plugin-sdk/provider-test-contracts";

describeAnthropicProviderRuntimeContract(() => import("./index.js"));
