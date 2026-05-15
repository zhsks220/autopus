import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { resolveWorkspaceTemplateDir } from "../../agents/workspace-templates.js";
import { resolveDefaultAgentWorkspaceDir } from "../../agents/workspace.js";
import { handleReset } from "../../commands/onboard-helpers.js";
import { createConfigIO, replaceConfigFile } from "../../config/config.js";
import { defaultRuntime } from "../../runtime.js";
import { normalizeOptionalLowercaseString } from "../../shared/string-coerce.js";
import { resolveUserPath, shortenHomePath } from "../../utils.js";

const DEV_IDENTITY_NAME = "C3-PO";
const DEV_IDENTITY_THEME = "protocol droid";
const DEV_IDENTITY_EMOJI = "🤖";
const DEV_AGENT_WORKSPACE_SUFFIX = "dev";

async function loadDevTemplate(name: string, fallback: string): Promise<string> {
  try {
    const templateDir = await resolveWorkspaceTemplateDir();
    const raw = await fs.promises.readFile(path.join(templateDir, name), "utf-8");
    if (!raw.startsWith("---")) {
      return raw;
    }
    const endIndex = raw.indexOf("\n---", 3);
    if (endIndex === -1) {
      return raw;
    }
    return raw.slice(endIndex + "\n---".length).replace(/^\s+/, "");
  } catch {
    return fallback;
  }
}

const resolveDevWorkspaceDir = (env: NodeJS.ProcessEnv = process.env): string => {
  const baseDir = resolveDefaultAgentWorkspaceDir(env, os.homedir);
  const profile = normalizeOptionalLowercaseString(env.AUTOPUS_PROFILE);
  if (profile === "dev") {
    return baseDir;
  }
  return `${baseDir}-${DEV_AGENT_WORKSPACE_SUFFIX}`;
};

async function writeFileIfMissing(filePath: string, content: string) {
  try {
    await fs.promises.writeFile(filePath, content, {
      encoding: "utf-8",
      flag: "wx",
    });
  } catch (err) {
    const anyErr = err as { code?: string };
    if (anyErr.code !== "EEXIST") {
      throw err;
    }
  }
}

async function ensureDevWorkspace(dir: string) {
  const resolvedDir = resolveUserPath(dir);
  await fs.promises.mkdir(resolvedDir, { recursive: true });

  const [agents, soul, tools, identity, user] = await Promise.all([
    loadDevTemplate(
      "AGENTS.dev.md",
      `# AGENTS.md — Autopus 개발 워크스페이스\n\n` +
        `\`autopus gateway --dev\` 용 기본 개발 워크스페이스입니다.\n\n` +
        `매 세션 시작 시 \`SOUL.md\`, \`USER.md\`, \`memory/YYYY-MM-DD.md\` 를 읽어 ` +
        `현재 사용자 컨텍스트를 복원합니다. 중요한 결정/대화는 \`memory/YYYY-MM-DD.md\` 에 기록하고, ` +
        `장기 기억은 \`MEMORY.md\` 에 정리합니다.\n`,
    ),
    loadDevTemplate(
      "SOUL.dev.md",
      `# SOUL.md — Autopus 페르소나\n\n` +
        `## 정체성\n` +
        `한국어 사용자 옆에서 일하는 AI 직원입니다. 사용자의 일을 자동화하고, ` +
        `메시징/대화/문서/예약 작업을 옆에서 처리하는 동료 역할입니다.\n\n` +
        `## 톤\n` +
        `- 한국어, 존댓말 기본\n` +
        `- 간결, 군더더기 없이\n` +
        `- 결과보다 과정 중심: 단계가 끝날 때마다 묻기 전에 한 줄로 보고\n\n` +
        `## 원칙\n` +
        `- 시키신 일만 정확히, 임의 추가 금지\n` +
        `- 단계별 사용자 OK 받고 진행\n` +
        `- 작업 완료 자체가 보고 트리거 (침묵 금지)\n` +
        `- 도구 사용 전 동작 검증, 동작한다고 보고하기 전에 확인\n`,
    ),
    loadDevTemplate(
      "TOOLS.dev.md",
      `# TOOLS.md — 사용자 도구 메모 (수정 가능)\n\n로컬 도구 사용 메모를 여기에 추가하십시오.\n`,
    ),
    loadDevTemplate(
      "IDENTITY.dev.md",
      `# IDENTITY.md — 에이전트 신원\n\n` +
        `- 이름: ${DEV_IDENTITY_NAME}\n` +
        `- 종류: 문어 도우미\n` +
        `- 분위기: ${DEV_IDENTITY_THEME}\n` +
        `- 이모지: ${DEV_IDENTITY_EMOJI}\n`,
    ),
    loadDevTemplate("USER.dev.md", `# USER.md — 사용자 프로필\n\n- 이름:\n- 호칭:\n- 메모:\n`),
  ]);

  await writeFileIfMissing(path.join(resolvedDir, "AGENTS.md"), agents);
  await writeFileIfMissing(path.join(resolvedDir, "SOUL.md"), soul);
  await writeFileIfMissing(path.join(resolvedDir, "TOOLS.md"), tools);
  await writeFileIfMissing(path.join(resolvedDir, "IDENTITY.md"), identity);
  await writeFileIfMissing(path.join(resolvedDir, "USER.md"), user);
}

export async function ensureDevGatewayConfig(opts: { reset?: boolean }) {
  const workspace = resolveDevWorkspaceDir();
  if (opts.reset) {
    await handleReset("full", workspace, defaultRuntime);
  }

  const io = createConfigIO();
  const configPath = io.configPath;
  const configExists = fs.existsSync(configPath);
  if (!opts.reset && configExists) {
    return;
  }

  await replaceConfigFile({
    nextConfig: {
      gateway: {
        mode: "local",
        bind: "loopback",
      },
      agents: {
        defaults: {
          workspace,
          skipBootstrap: true,
        },
        list: [
          {
            id: "dev",
            default: true,
            workspace,
            identity: {
              name: DEV_IDENTITY_NAME,
              theme: DEV_IDENTITY_THEME,
              emoji: DEV_IDENTITY_EMOJI,
            },
          },
        ],
      },
    },
    afterWrite: { mode: "auto" },
  });
  await ensureDevWorkspace(workspace);
  defaultRuntime.log(`Dev config ready: ${shortenHomePath(configPath)}`);
  defaultRuntime.log(`Dev workspace ready: ${shortenHomePath(resolveUserPath(workspace))}`);
}
