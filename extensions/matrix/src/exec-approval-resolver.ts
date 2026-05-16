import { resolveApprovalOverGateway } from "autopus/plugin-sdk/approval-gateway-runtime";
import type { ExecApprovalReplyDecision } from "autopus/plugin-sdk/approval-runtime";
import type { AutopusConfig } from "autopus/plugin-sdk/config-contracts";
import { isApprovalNotFoundError } from "autopus/plugin-sdk/error-runtime";

export { isApprovalNotFoundError };

export async function resolveMatrixApproval(params: {
  cfg: AutopusConfig;
  approvalId: string;
  decision: ExecApprovalReplyDecision;
  senderId?: string | null;
  gatewayUrl?: string;
}): Promise<void> {
  await resolveApprovalOverGateway({
    cfg: params.cfg,
    approvalId: params.approvalId,
    decision: params.decision,
    senderId: params.senderId,
    gatewayUrl: params.gatewayUrl,
    clientDisplayName: `Matrix approval (${params.senderId?.trim() || "unknown"})`,
  });
}
