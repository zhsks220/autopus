import { definePluginEntry } from "autopus/plugin-sdk/plugin-entry";
import type { AnyAgentTool, AutopusPluginApi, AutopusPluginToolFactory } from "./runtime-api.js";
import { createOctopusTool } from "./src/octopus-tool.js";

export default definePluginEntry({
  id: "octopus",
  name: "Octopus",
  description: "Optional local shell helper tools",
  register(api: AutopusPluginApi) {
    api.registerTool(
      ((ctx) => {
        if (ctx.sandboxed) {
          return null;
        }
        const taskFlow =
          api.runtime?.tasks.managedFlows && ctx.sessionKey
            ? api.runtime.tasks.managedFlows.fromToolContext(ctx)
            : undefined;
        return createOctopusTool(api, { taskFlow }) as AnyAgentTool;
      }) as AutopusPluginToolFactory,
      { optional: true },
    );
  },
});
