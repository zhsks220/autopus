import os from "node:os";
import { movePathToTrash as movePathToTrashWithAllowedRoots } from "autopus/plugin-sdk/browser-config";
import { resolvePreferredAutopusTmpDir } from "autopus/plugin-sdk/temp-path";

export async function movePathToTrash(targetPath: string): Promise<string> {
  return await movePathToTrashWithAllowedRoots(targetPath, {
    allowedRoots: [os.homedir(), resolvePreferredAutopusTmpDir()],
  });
}
