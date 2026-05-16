import { createNonExitingRuntime, type RuntimeEnv } from "autopus/plugin-sdk/runtime-env";
import { normalizeStringEntries } from "autopus/plugin-sdk/string-coerce-runtime";
import type { MonitorIMessageOpts } from "./types.js";

export function resolveRuntime(opts: MonitorIMessageOpts): RuntimeEnv {
  return opts.runtime ?? createNonExitingRuntime();
}

export function normalizeAllowList(list?: Array<string | number>) {
  return normalizeStringEntries(list);
}
