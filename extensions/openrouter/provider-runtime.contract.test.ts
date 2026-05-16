import { describeOpenRouterProviderRuntimeContract } from "autopus/plugin-sdk/provider-test-contracts";

describeOpenRouterProviderRuntimeContract(() => import("./index.js"));
