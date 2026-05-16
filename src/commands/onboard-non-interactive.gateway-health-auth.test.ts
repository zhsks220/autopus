import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import type { AutopusConfig } from "../config/types.autopus.js";
import { resolveGatewayHealthProbeToken } from "./onboard-non-interactive/local.js";

async function withTempDir<T>(run: (dir: string) => Promise<T>): Promise<T> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "autopus-gateway-health-auth-"));
  try {
    return await run(dir);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
}

async function writeSecureFile(filePath: string, content: string): Promise<void> {
  await fs.writeFile(filePath, content, { mode: 0o600 });
  await fs.chmod(filePath, 0o600);
}

describe("resolveGatewayHealthProbeToken", () => {
  const originalGatewayToken = process.env.AUTOPUS_GATEWAY_TOKEN;
  const originalGatewayPassword = process.env.AUTOPUS_GATEWAY_PASSWORD;

  afterEach(() => {
    if (originalGatewayToken === undefined) {
      delete process.env.AUTOPUS_GATEWAY_TOKEN;
    } else {
      process.env.AUTOPUS_GATEWAY_TOKEN = originalGatewayToken;
    }
    if (originalGatewayPassword === undefined) {
      delete process.env.AUTOPUS_GATEWAY_PASSWORD;
    } else {
      process.env.AUTOPUS_GATEWAY_PASSWORD = originalGatewayPassword;
    }
  });

  it("resolves file SecretRefs for the local onboarding health probe without persisting plaintext", async () => {
    await withTempDir(async (dir) => {
      const tokenPath = path.join(dir, "gateway-token.txt");
      await writeSecureFile(tokenPath, "file-secret-token\n");
      process.env.AUTOPUS_GATEWAY_TOKEN = "stale-env-token";

      const resolved = await resolveGatewayHealthProbeToken({
        gateway: {
          auth: {
            mode: "token",
            token: {
              source: "file",
              provider: "gateway-token-file",
              id: "value",
            },
          },
        },
        secrets: {
          providers: {
            "gateway-token-file": {
              source: "file",
              path: tokenPath,
              mode: "singleValue",
            },
          },
        },
      } as AutopusConfig);

      expect(resolved).toEqual({ token: "file-secret-token" });
    });
  });

  it("does not fall back to stale AUTOPUS_GATEWAY_TOKEN when a SecretRef is unresolved", async () => {
    await withTempDir(async (dir) => {
      process.env.AUTOPUS_GATEWAY_TOKEN = "stale-env-token";

      const resolved = await resolveGatewayHealthProbeToken({
        gateway: {
          auth: {
            mode: "token",
            token: {
              source: "file",
              provider: "gateway-token-file",
              id: "value",
            },
          },
        },
        secrets: {
          providers: {
            "gateway-token-file": {
              source: "file",
              path: path.join(dir, "missing-token.txt"),
              mode: "singleValue",
            },
          },
        },
      } as AutopusConfig);

      expect(resolved.token).toBeUndefined();
      expect(resolved.unresolvedRefReason).toBe(
        "gateway.auth.token SecretRef is unresolved (file:gateway-token-file:value).",
      );
    });
  });

  it("resolves password auth for the local onboarding health probe", async () => {
    process.env.AUTOPUS_GATEWAY_TOKEN = "stale-env-token";
    process.env.AUTOPUS_GATEWAY_PASSWORD = "resolved-password"; // pragma: allowlist secret

    const resolved = await resolveGatewayHealthProbeToken({
      gateway: {
        auth: {
          mode: "password",
          password: {
            source: "env",
            provider: "default",
            id: "AUTOPUS_GATEWAY_PASSWORD",
          },
        },
      },
    } as AutopusConfig);

    expect(resolved).toEqual({ password: "resolved-password" });
  });
});
