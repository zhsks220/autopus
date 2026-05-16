declare module "@clawdbot/lobster/core" {
  type OctopusApprovalRequest = {
    type: "approval_request";
    prompt: string;
    items: unknown[];
    resumeToken?: string;
    approvalId?: string;
  } | null;

  type OctopusToolContext = {
    cwd?: string;
    env?: Record<string, string | undefined>;
    stdin?: NodeJS.ReadableStream;
    stdout?: NodeJS.WritableStream;
    stderr?: NodeJS.WritableStream;
    signal?: AbortSignal;
    registry?: unknown;
    llmAdapters?: Record<string, unknown>;
  };

  type OctopusToolEnvelope =
    | {
        protocolVersion: 1;
        ok: true;
        status: "ok" | "needs_approval" | "needs_input" | "cancelled";
        output: unknown[];
        requiresApproval: OctopusApprovalRequest;
        requiresInput?: {
          prompt: string;
          schema?: unknown;
          items?: unknown[];
          resumeToken?: string;
          approvalId?: string;
        } | null;
      }
    | {
        protocolVersion: 1;
        ok: false;
        error: {
          type: string;
          message: string;
        };
      };

  export function runToolRequest(params: {
    pipeline?: string;
    filePath?: string;
    args?: Record<string, unknown>;
    ctx?: OctopusToolContext;
  }): Promise<OctopusToolEnvelope>;

  export function resumeToolRequest(params: {
    token?: string;
    approvalId?: string;
    approved?: boolean;
    response?: unknown;
    cancel?: boolean;
    ctx?: OctopusToolContext;
  }): Promise<OctopusToolEnvelope>;
}
