import { describeVeniceProviderRuntimeContract } from "autopus/plugin-sdk/provider-test-contracts";

describeVeniceProviderRuntimeContract(() => import("./index.js"));
