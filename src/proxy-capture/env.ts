import { randomUUID } from "node:crypto";
import type { Agent } from "node:http";
import process from "node:process";
import { createAmbientNodeProxyAgent } from "@openclaw/proxyline";
import {
  resolveDebugProxyBlobDir,
  resolveDebugProxyCertDir,
  resolveDebugProxyDbPath,
} from "./paths.js";

export const AUTOPUS_DEBUG_PROXY_ENABLED = "AUTOPUS_DEBUG_PROXY_ENABLED";
export const AUTOPUS_DEBUG_PROXY_URL = "AUTOPUS_DEBUG_PROXY_URL";
export const AUTOPUS_DEBUG_PROXY_DB_PATH = "AUTOPUS_DEBUG_PROXY_DB_PATH";
export const AUTOPUS_DEBUG_PROXY_BLOB_DIR = "AUTOPUS_DEBUG_PROXY_BLOB_DIR";
export const AUTOPUS_DEBUG_PROXY_CERT_DIR = "AUTOPUS_DEBUG_PROXY_CERT_DIR";
export const AUTOPUS_DEBUG_PROXY_SESSION_ID = "AUTOPUS_DEBUG_PROXY_SESSION_ID";
export const AUTOPUS_DEBUG_PROXY_REQUIRE = "AUTOPUS_DEBUG_PROXY_REQUIRE";

export type DebugProxySettings = {
  enabled: boolean;
  required: boolean;
  proxyUrl?: string;
  dbPath: string;
  blobDir: string;
  certDir: string;
  sessionId: string;
  sourceProcess: string;
};

let cachedImplicitSessionId: string | undefined;

function isTruthy(value: string | undefined): boolean {
  return value === "1" || value === "true" || value === "yes" || value === "on";
}

export function resolveDebugProxySettings(
  env: NodeJS.ProcessEnv = process.env,
): DebugProxySettings {
  const enabled = isTruthy(env[AUTOPUS_DEBUG_PROXY_ENABLED]);
  const explicitSessionId = env[AUTOPUS_DEBUG_PROXY_SESSION_ID]?.trim() || undefined;
  const sessionId = explicitSessionId ?? (cachedImplicitSessionId ??= randomUUID());
  return {
    enabled,
    required: isTruthy(env[AUTOPUS_DEBUG_PROXY_REQUIRE]),
    proxyUrl: env[AUTOPUS_DEBUG_PROXY_URL]?.trim() || undefined,
    dbPath: env[AUTOPUS_DEBUG_PROXY_DB_PATH]?.trim() || resolveDebugProxyDbPath(env),
    blobDir: env[AUTOPUS_DEBUG_PROXY_BLOB_DIR]?.trim() || resolveDebugProxyBlobDir(env),
    certDir: env[AUTOPUS_DEBUG_PROXY_CERT_DIR]?.trim() || resolveDebugProxyCertDir(env),
    sessionId,
    sourceProcess: "autopus",
  };
}

export function applyDebugProxyEnv(
  env: NodeJS.ProcessEnv,
  params: {
    proxyUrl: string;
    sessionId: string;
    dbPath?: string;
    blobDir?: string;
    certDir?: string;
  },
): NodeJS.ProcessEnv {
  return {
    ...env,
    [AUTOPUS_DEBUG_PROXY_ENABLED]: "1",
    [AUTOPUS_DEBUG_PROXY_REQUIRE]: "1",
    [AUTOPUS_DEBUG_PROXY_URL]: params.proxyUrl,
    [AUTOPUS_DEBUG_PROXY_DB_PATH]: params.dbPath ?? resolveDebugProxyDbPath(env),
    [AUTOPUS_DEBUG_PROXY_BLOB_DIR]: params.blobDir ?? resolveDebugProxyBlobDir(env),
    [AUTOPUS_DEBUG_PROXY_CERT_DIR]: params.certDir ?? resolveDebugProxyCertDir(env),
    [AUTOPUS_DEBUG_PROXY_SESSION_ID]: params.sessionId,
    HTTP_PROXY: params.proxyUrl,
    HTTPS_PROXY: params.proxyUrl,
    ALL_PROXY: params.proxyUrl,
  };
}

export function createDebugProxyWebSocketAgent(settings: DebugProxySettings): Agent | undefined {
  if (!settings.enabled || !settings.proxyUrl) {
    return undefined;
  }
  return createAmbientNodeProxyAgent({
    protocol: "https",
    env: {
      HTTP_PROXY: settings.proxyUrl,
      HTTPS_PROXY: settings.proxyUrl,
      ALL_PROXY: undefined,
      NO_PROXY: undefined,
      http_proxy: undefined,
      https_proxy: undefined,
      all_proxy: undefined,
      no_proxy: undefined,
    },
  }) as Agent | undefined;
}

export function resolveEffectiveDebugProxyUrl(configuredProxyUrl?: string): string | undefined {
  const explicit = configuredProxyUrl?.trim();
  if (explicit) {
    return explicit;
  }
  const settings = resolveDebugProxySettings();
  return settings.enabled ? settings.proxyUrl : undefined;
}
