import { definePluginEntry } from "autopus/plugin-sdk/plugin-entry";
import { registerOcPathCli } from "./cli-registration.js";

export default definePluginEntry({
  id: "oc-path",
  name: "OC Path",
  description: "Adds the autopus path CLI for oc:// workspace file addressing.",
  register(api) {
    registerOcPathCli(api);
  },
});
