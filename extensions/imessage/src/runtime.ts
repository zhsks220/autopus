import type { PluginRuntime } from "autopus/plugin-sdk/core";
import { createPluginRuntimeStore } from "autopus/plugin-sdk/runtime-store";

const { setRuntime: setIMessageRuntime } = createPluginRuntimeStore<PluginRuntime>({
  pluginId: "imessage",
  errorMessage: "iMessage runtime not initialized",
});
export { setIMessageRuntime };
