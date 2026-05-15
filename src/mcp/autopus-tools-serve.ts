/**
 * Standalone MCP server for selected built-in Autopus tools.
 *
 * Run via: node --import tsx src/mcp/autopus-tools-serve.ts
 * Or: bun src/mcp/autopus-tools-serve.ts
 */
import { pathToFileURL } from "node:url";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import type { AnyAgentTool } from "../agents/tools/common.js";
import { createCronTool } from "../agents/tools/cron-tool.js";
import { formatErrorMessage } from "../infra/errors.js";
import { connectToolsMcpServerToStdio, createToolsMcpServer } from "./tools-stdio-server.js";

export function resolveAutopusToolsForMcp(): AnyAgentTool[] {
  return [createCronTool()];
}

function createAutopusToolsMcpServer(
  params: {
    tools?: AnyAgentTool[];
  } = {},
): Server {
  const tools = params.tools ?? resolveAutopusToolsForMcp();
  return createToolsMcpServer({ name: "autopus-tools", tools });
}

async function serveAutopusToolsMcp(): Promise<void> {
  const server = createAutopusToolsMcpServer();
  await connectToolsMcpServerToStdio(server);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  serveAutopusToolsMcp().catch((err) => {
    process.stderr.write(`autopus-tools-serve: ${formatErrorMessage(err)}\n`);
    process.exit(1);
  });
}
