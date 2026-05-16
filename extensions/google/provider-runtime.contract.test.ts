import { describeGoogleProviderRuntimeContract } from "autopus/plugin-sdk/provider-test-contracts";

describeGoogleProviderRuntimeContract(() => import("./index.js"));
