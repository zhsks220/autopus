import fs from "node:fs/promises";
import { callGatewayFromCli } from "autopus/plugin-sdk/gateway-runtime";
import type { Command } from "commander";
import { t } from "../../../src/i18n/cli/translate.js";
import type { AutopusConfig } from "../api.js";
import { applyMemoryWikiMutation } from "./apply.js";
import {
  importChatGptConversations,
  rollbackChatGptImportRun,
  type ChatGptImportResult,
  type ChatGptRollbackResult,
} from "./chatgpt-import.js";
import { compileMemoryWikiVault } from "./compile.js";
import {
  resolveMemoryWikiConfig,
  WIKI_SEARCH_BACKENDS,
  WIKI_SEARCH_CORPORA,
  type MemoryWikiPluginConfig,
  type ResolvedMemoryWikiConfig,
} from "./config.js";
import { ingestMemoryWikiSource } from "./ingest.js";
import { lintMemoryWikiVault } from "./lint.js";
import {
  probeObsidianCli,
  runObsidianCommand,
  runObsidianDaily,
  runObsidianOpen,
  runObsidianSearch,
} from "./obsidian.js";
import {
  getMemoryWikiPage,
  searchMemoryWiki,
  WIKI_SEARCH_MODES,
  type WikiSearchMode,
} from "./query.js";
import { syncMemoryWikiImportedSources } from "./source-sync.js";
import type { MemoryWikiImportedSourceSyncResult } from "./source-sync.js";
import {
  buildMemoryWikiDoctorReport,
  renderMemoryWikiDoctor,
  renderMemoryWikiStatus,
  type MemoryWikiDoctorReport,
  type MemoryWikiStatus,
  resolveMemoryWikiStatus,
} from "./status.js";
import { initializeMemoryWikiVault } from "./vault.js";

const WIKI_GATEWAY_TIMEOUT_MS = "30000";
const GATEWAY_TERMINAL_STRING_MAX_CHARS = 2_000;
const GATEWAY_RESPONSE_MAX_ARRAY_ITEMS = 10_000;
const GATEWAY_RESPONSE_MAX_STRING_CHARS = 10_000;
const GATEWAY_RESPONSE_MAX_CODE_CHARS = 256;
const ANSI_ESCAPE_SEQUENCE_PATTERN = new RegExp(
  String.raw`(?:\x1B\[[0-?]*[ -/]*[@-~]|\x1B[@-Z\\-_]|\x9B[0-?]*[ -/]*[@-~])`,
  "g",
);
const TERMINAL_CONTROL_CHARACTER_PATTERN = new RegExp(String.raw`[\x00-\x1F\x7F-\x9F]+`, "g");
const UNICODE_FORMAT_CONTROL_PATTERN = /[\u061C\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF]/g;

type WikiStatusCommandOptions = {
  json?: boolean;
};

type WikiDoctorCommandOptions = {
  json?: boolean;
};

type WikiInitCommandOptions = {
  json?: boolean;
};

type WikiCompileCommandOptions = {
  json?: boolean;
};

type WikiLintCommandOptions = {
  json?: boolean;
};

type WikiIngestCommandOptions = {
  json?: boolean;
  title?: string;
};

type WikiSearchCommandOptions = {
  json?: boolean;
  maxResults?: number;
  backend?: ResolvedMemoryWikiConfig["search"]["backend"];
  corpus?: ResolvedMemoryWikiConfig["search"]["corpus"];
  mode?: WikiSearchMode;
};

type WikiGetCommandOptions = {
  json?: boolean;
  from?: number;
  lines?: number;
  backend?: ResolvedMemoryWikiConfig["search"]["backend"];
  corpus?: ResolvedMemoryWikiConfig["search"]["corpus"];
};

type WikiApplySynthesisCommandOptions = {
  json?: boolean;
  body?: string;
  bodyFile?: string;
  sourceId?: string[];
  contradiction?: string[];
  question?: string[];
  confidence?: number;
  status?: string;
};

type WikiApplyMetadataCommandOptions = {
  json?: boolean;
  sourceId?: string[];
  contradiction?: string[];
  question?: string[];
  confidence?: number;
  clearConfidence?: boolean;
  status?: string;
};

type WikiBridgeImportCommandOptions = {
  json?: boolean;
};

type WikiUnsafeLocalImportCommandOptions = {
  json?: boolean;
};

type WikiChatGptImportCommandOptions = {
  json?: boolean;
  dryRun?: boolean;
  export?: string;
};

type WikiChatGptRollbackCommandOptions = {
  json?: boolean;
};

type WikiObsidianSearchCommandOptions = {
  json?: boolean;
};

type WikiObsidianOpenCommandOptions = {
  json?: boolean;
};

type WikiObsidianCommandCommandOptions = {
  json?: boolean;
};

type WikiObsidianDailyCommandOptions = {
  json?: boolean;
};

function isResolvedMemoryWikiConfig(
  config: MemoryWikiPluginConfig | ResolvedMemoryWikiConfig | undefined,
): config is ResolvedMemoryWikiConfig {
  return Boolean(
    config &&
    "vaultMode" in config &&
    "vault" in config &&
    "bridge" in config &&
    "obsidian" in config &&
    "unsafeLocal" in config,
  );
}

function sanitizeGatewayStringForTerminal(value: string): string {
  const truncated =
    value.length > GATEWAY_TERMINAL_STRING_MAX_CHARS
      ? value.slice(0, GATEWAY_TERMINAL_STRING_MAX_CHARS)
      : value;
  const sanitized = truncated
    .replace(ANSI_ESCAPE_SEQUENCE_PATTERN, "")
    .replace(TERMINAL_CONTROL_CHARACTER_PATTERN, " ")
    .replace(UNICODE_FORMAT_CONTROL_PATTERN, "");
  return value.length > GATEWAY_TERMINAL_STRING_MAX_CHARS
    ? `${sanitized}... [truncated]`
    : sanitized;
}

function escapeGatewayJsonForTerminal(json: string): string {
  return json.replace(UNICODE_FORMAT_CONTROL_PATTERN, (char) => {
    const codePoint = char.codePointAt(0);
    return typeof codePoint === "number" ? `\\u${codePoint.toString(16).padStart(4, "0")}` : "";
  });
}

function writeOutput(output: string, writer: Pick<NodeJS.WriteStream, "write"> = process.stdout) {
  writer.write(output.endsWith("\n") ? output : `${output}\n`);
}

function shouldRouteBridgeRuntimeThroughGateway(config: ResolvedMemoryWikiConfig): boolean {
  return (
    config.vaultMode === "bridge" && config.bridge.enabled && config.bridge.readMemoryArtifacts
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function isBoundedGatewayString(
  value: unknown,
  maxChars = GATEWAY_RESPONSE_MAX_STRING_CHARS,
): value is string {
  return typeof value === "string" && value.length <= maxChars;
}

function isStringArray(
  value: unknown,
  maxChars = GATEWAY_RESPONSE_MAX_STRING_CHARS,
): value is string[] {
  return (
    Array.isArray(value) &&
    value.length <= GATEWAY_RESPONSE_MAX_ARRAY_ITEMS &&
    value.every((item) => isBoundedGatewayString(item, maxChars))
  );
}

function hasNumberFields(value: Record<string, unknown>, keys: readonly string[]): boolean {
  return keys.every((key) => typeof value[key] === "number");
}

function isWarningList(value: unknown): boolean {
  return (
    Array.isArray(value) &&
    value.length <= GATEWAY_RESPONSE_MAX_ARRAY_ITEMS &&
    value.every(
      (item) =>
        isRecord(item) &&
        isBoundedGatewayString(item.code, GATEWAY_RESPONSE_MAX_CODE_CHARS) &&
        isBoundedGatewayString(item.message),
    )
  );
}

function isMemoryWikiStatus(value: unknown): value is MemoryWikiStatus {
  if (!isRecord(value)) {
    return false;
  }
  const bridge = value.bridge;
  const obsidianCli = value.obsidianCli;
  const unsafeLocal = value.unsafeLocal;
  const pageCounts = value.pageCounts;
  const sourceCounts = value.sourceCounts;
  return (
    isBoundedGatewayString(value.vaultMode, GATEWAY_RESPONSE_MAX_CODE_CHARS) &&
    isBoundedGatewayString(value.renderMode, GATEWAY_RESPONSE_MAX_CODE_CHARS) &&
    isBoundedGatewayString(value.vaultPath) &&
    typeof value.vaultExists === "boolean" &&
    (typeof value.bridgePublicArtifactCount === "number" ||
      value.bridgePublicArtifactCount === null) &&
    isRecord(bridge) &&
    typeof bridge.enabled === "boolean" &&
    isRecord(obsidianCli) &&
    typeof obsidianCli.enabled === "boolean" &&
    typeof obsidianCli.requested === "boolean" &&
    typeof obsidianCli.available === "boolean" &&
    (isBoundedGatewayString(obsidianCli.command) || obsidianCli.command === null) &&
    isRecord(unsafeLocal) &&
    typeof unsafeLocal.allowPrivateMemoryCoreAccess === "boolean" &&
    typeof unsafeLocal.pathCount === "number" &&
    isRecord(pageCounts) &&
    hasNumberFields(pageCounts, ["source", "entity", "concept", "synthesis", "report"]) &&
    isRecord(sourceCounts) &&
    hasNumberFields(sourceCounts, ["native", "bridge", "bridgeEvents", "unsafeLocal", "other"]) &&
    isWarningList(value.warnings)
  );
}

function isMemoryWikiDoctorReport(value: unknown): value is MemoryWikiDoctorReport {
  return (
    isRecord(value) &&
    typeof value.healthy === "boolean" &&
    typeof value.warningCount === "number" &&
    isMemoryWikiStatus(value.status) &&
    Array.isArray(value.fixes) &&
    value.fixes.length <= GATEWAY_RESPONSE_MAX_ARRAY_ITEMS &&
    value.fixes.every(
      (item) =>
        isRecord(item) &&
        isBoundedGatewayString(item.code, GATEWAY_RESPONSE_MAX_CODE_CHARS) &&
        isBoundedGatewayString(item.message),
    )
  );
}

function isMemoryWikiImportResult(value: unknown): value is MemoryWikiImportedSourceSyncResult {
  return (
    isRecord(value) &&
    hasNumberFields(value, [
      "importedCount",
      "updatedCount",
      "skippedCount",
      "removedCount",
      "artifactCount",
      "workspaces",
    ]) &&
    isStringArray(value.pagePaths) &&
    typeof value.indexesRefreshed === "boolean" &&
    isStringArray(value.indexUpdatedFiles) &&
    isBoundedGatewayString(value.indexRefreshReason, GATEWAY_RESPONSE_MAX_CODE_CHARS)
  );
}

function validateWikiGatewayResult(
  method: "wiki.status" | "wiki.doctor" | "wiki.bridge.import",
  value: unknown,
): MemoryWikiStatus | MemoryWikiDoctorReport | MemoryWikiImportedSourceSyncResult {
  if (method === "wiki.status" && isMemoryWikiStatus(value)) {
    return value;
  }
  if (method === "wiki.doctor" && isMemoryWikiDoctorReport(value)) {
    return value;
  }
  if (method === "wiki.bridge.import" && isMemoryWikiImportResult(value)) {
    return value;
  }
  throw new Error(`Invalid Gateway response for ${method}.`);
}

async function callWikiGateway(method: "wiki.status"): Promise<MemoryWikiStatus>;
async function callWikiGateway(method: "wiki.doctor"): Promise<MemoryWikiDoctorReport>;
async function callWikiGateway(
  method: "wiki.bridge.import",
): Promise<MemoryWikiImportedSourceSyncResult>;
async function callWikiGateway(method: "wiki.status" | "wiki.doctor" | "wiki.bridge.import") {
  const result = await callGatewayFromCli(method, { timeout: WIKI_GATEWAY_TIMEOUT_MS }, undefined, {
    progress: false,
  });
  return validateWikiGatewayResult(method, result);
}

function normalizeCliStringList(values?: string[]): string[] | undefined {
  if (!values) {
    return undefined;
  }
  const normalized = values
    .map((value) => value.trim())
    .filter(Boolean)
    .filter((value, index, all) => all.indexOf(value) === index);
  return normalized.length > 0 ? normalized : undefined;
}

function collectCliValues(value: string, acc: string[] = []) {
  acc.push(value);
  return acc;
}

function parseWikiSearchEnumOption<T extends string>(
  value: string,
  allowed: readonly T[],
  label: string,
): T {
  if ((allowed as readonly string[]).includes(value)) {
    return value as T;
  }
  throw new Error(`Invalid ${label}: ${value}. Expected one of: ${allowed.join(", ")}`);
}

async function resolveWikiApplyBody(params: { body?: string; bodyFile?: string }): Promise<string> {
  if (params.body?.trim()) {
    return params.body;
  }
  if (params.bodyFile?.trim()) {
    return await fs.readFile(params.bodyFile, "utf8");
  }
  throw new Error("wiki apply synthesis requires --body or --body-file.");
}

type MemoryWikiMutationResult = Awaited<ReturnType<typeof applyMemoryWikiMutation>>;

function formatMemoryWikiMutationSummary(result: MemoryWikiMutationResult, json?: boolean): string {
  if (json) {
    return JSON.stringify(result, null, 2);
  }
  return `${result.changed ? "Updated" : "No changes for"} ${result.pagePath} via ${result.operation}. ${result.compile.updatedFiles.length > 0 ? `Refreshed ${result.compile.updatedFiles.length} index file${result.compile.updatedFiles.length === 1 ? "" : "s"}.` : "Indexes unchanged."}`;
}

function formatJsonOrText<T>(
  result: T,
  json: boolean | undefined,
  render: (result: T) => string,
): string {
  return json ? JSON.stringify(result, null, 2) : render(result);
}

function formatGatewayJsonOrText<T>(
  result: T,
  json: boolean | undefined,
  render: (result: T) => string,
): string {
  return json
    ? escapeGatewayJsonForTerminal(JSON.stringify(result, null, 2))
    : sanitizeGatewayStringForTerminal(render(result));
}

async function runWikiCommandWithSummary<T>(params: {
  json?: boolean;
  stdout?: Pick<NodeJS.WriteStream, "write">;
  run: () => Promise<T>;
  render: (result: T) => string;
}): Promise<T> {
  const result = await params.run();
  writeOutput(formatJsonOrText(result, params.json, params.render), params.stdout);
  return result;
}

async function runSyncedWikiCommandWithSummary<T>(params: {
  config: ResolvedMemoryWikiConfig;
  appConfig?: AutopusConfig;
  json?: boolean;
  stdout?: Pick<NodeJS.WriteStream, "write">;
  run: () => Promise<T>;
  render: (result: T) => string;
}): Promise<T> {
  await syncMemoryWikiImportedSources({ config: params.config, appConfig: params.appConfig });
  return runWikiCommandWithSummary(params);
}

function addWikiSearchConfigOptions<T extends Command>(command: T): T {
  return command
    .option(
      "--backend <backend>",
      `Search backend (${WIKI_SEARCH_BACKENDS.join(", ")})`,
      (value: string) => parseWikiSearchEnumOption(value, WIKI_SEARCH_BACKENDS, "backend"),
    )
    .option(
      "--corpus <corpus>",
      `Search corpus (${WIKI_SEARCH_CORPORA.join(", ")})`,
      (value: string) => parseWikiSearchEnumOption(value, WIKI_SEARCH_CORPORA, "corpus"),
    );
}

function addWikiApplyMutationOptions<T extends Command>(command: T): T {
  return command
    .option("--source-id <id>", t("opt.source_id"), collectCliValues)
    .option("--contradiction <text>", t("opt.contradiction_note"), collectCliValues)
    .option("--question <text>", t("opt.open_question"), collectCliValues)
    .option("--confidence <n>", t("opt.confidence_score_between_0_and_1"), (value: string) =>
      Number(value),
    )
    .option("--status <status>", t("opt.page_status"));
}

export async function runWikiStatus(params: {
  config: ResolvedMemoryWikiConfig;
  appConfig?: AutopusConfig;
  json?: boolean;
  stdout?: Pick<NodeJS.WriteStream, "write">;
}) {
  const routeThroughGateway = shouldRouteBridgeRuntimeThroughGateway(params.config);
  const status = routeThroughGateway
    ? await callWikiGateway("wiki.status")
    : await (async () => {
        await syncMemoryWikiImportedSources({ config: params.config, appConfig: params.appConfig });
        return await resolveMemoryWikiStatus(params.config, {
          appConfig: params.appConfig,
        });
      })();
  writeOutput(
    routeThroughGateway
      ? formatGatewayJsonOrText(status, params.json, renderMemoryWikiStatus)
      : formatJsonOrText(status, params.json, renderMemoryWikiStatus),
    params.stdout,
  );
  return status;
}

export async function runWikiDoctor(params: {
  config: ResolvedMemoryWikiConfig;
  appConfig?: AutopusConfig;
  json?: boolean;
  stdout?: Pick<NodeJS.WriteStream, "write">;
}) {
  const routeThroughGateway = shouldRouteBridgeRuntimeThroughGateway(params.config);
  const report = routeThroughGateway
    ? await callWikiGateway("wiki.doctor")
    : await (async () => {
        await syncMemoryWikiImportedSources({ config: params.config, appConfig: params.appConfig });
        return buildMemoryWikiDoctorReport(
          await resolveMemoryWikiStatus(params.config, {
            appConfig: params.appConfig,
          }),
        );
      })();
  if (!report.healthy) {
    process.exitCode = 1;
  }
  writeOutput(
    routeThroughGateway
      ? formatGatewayJsonOrText(report, params.json, renderMemoryWikiDoctor)
      : formatJsonOrText(report, params.json, renderMemoryWikiDoctor),
    params.stdout,
  );
  return report;
}

export async function runWikiInit(params: {
  config: ResolvedMemoryWikiConfig;
  json?: boolean;
  stdout?: Pick<NodeJS.WriteStream, "write">;
}) {
  return runWikiCommandWithSummary({
    json: params.json,
    stdout: params.stdout,
    run: () => initializeMemoryWikiVault(params.config),
    render: (value) =>
      `Initialized wiki vault at ${value.rootDir} (${value.createdDirectories.length} dirs, ${value.createdFiles.length} files).`,
  });
}

export async function runWikiCompile(params: {
  config: ResolvedMemoryWikiConfig;
  appConfig?: AutopusConfig;
  json?: boolean;
  stdout?: Pick<NodeJS.WriteStream, "write">;
}) {
  return runSyncedWikiCommandWithSummary({
    config: params.config,
    appConfig: params.appConfig,
    json: params.json,
    stdout: params.stdout,
    run: () => compileMemoryWikiVault(params.config),
    render: (value) =>
      `Compiled wiki vault at ${value.vaultRoot} (${value.pages.length} pages, ${value.updatedFiles.length} indexes updated).`,
  });
}

export async function runWikiLint(params: {
  config: ResolvedMemoryWikiConfig;
  appConfig?: AutopusConfig;
  json?: boolean;
  stdout?: Pick<NodeJS.WriteStream, "write">;
}) {
  return runSyncedWikiCommandWithSummary({
    config: params.config,
    appConfig: params.appConfig,
    json: params.json,
    stdout: params.stdout,
    run: () => lintMemoryWikiVault(params.config),
    render: (value) =>
      `Linted wiki vault at ${value.vaultRoot} (${value.issueCount} issues, report: ${value.reportPath}).`,
  });
}

export async function runWikiIngest(params: {
  config: ResolvedMemoryWikiConfig;
  inputPath: string;
  title?: string;
  json?: boolean;
  stdout?: Pick<NodeJS.WriteStream, "write">;
}) {
  return runWikiCommandWithSummary({
    json: params.json,
    stdout: params.stdout,
    run: () =>
      ingestMemoryWikiSource({
        config: params.config,
        inputPath: params.inputPath,
        title: params.title,
      }),
    render: (value) =>
      `Ingested ${value.sourcePath} into ${value.pagePath}. Refreshed ${value.indexUpdatedFiles.length} index file${value.indexUpdatedFiles.length === 1 ? "" : "s"}.`,
  });
}

export async function runWikiSearch(params: {
  config: ResolvedMemoryWikiConfig;
  appConfig?: AutopusConfig;
  query: string;
  maxResults?: number;
  searchBackend?: ResolvedMemoryWikiConfig["search"]["backend"];
  searchCorpus?: ResolvedMemoryWikiConfig["search"]["corpus"];
  mode?: WikiSearchMode;
  json?: boolean;
  stdout?: Pick<NodeJS.WriteStream, "write">;
}) {
  if (params.mode && !(WIKI_SEARCH_MODES as readonly string[]).includes(params.mode)) {
    throw new Error(`wiki search --mode must be one of: ${WIKI_SEARCH_MODES.join(", ")}.`);
  }
  await syncMemoryWikiImportedSources({ config: params.config, appConfig: params.appConfig });
  const results = await searchMemoryWiki({
    config: params.config,
    appConfig: params.appConfig,
    query: params.query,
    maxResults: params.maxResults,
    searchBackend: params.searchBackend,
    searchCorpus: params.searchCorpus,
    mode: params.mode,
  });
  const summary = params.json
    ? JSON.stringify(results, null, 2)
    : results.length === 0
      ? "No wiki or memory results."
      : results
          .map(
            (result, index) =>
              `${index + 1}. ${result.title} (${result.corpus}/${result.kind})\nPath: ${result.path}${typeof result.startLine === "number" && typeof result.endLine === "number" ? `\nLines: ${result.startLine}-${result.endLine}` : ""}${result.provenanceLabel ? `\nProvenance: ${result.provenanceLabel}` : ""}${result.matchedClaimId ? `\nClaim: ${result.matchedClaimId}` : ""}${result.evidenceKinds && result.evidenceKinds.length > 0 ? `\nEvidence: ${result.evidenceKinds.join(", ")}` : ""}\nSnippet: ${result.snippet}`,
          )
          .join("\n\n");
  writeOutput(summary, params.stdout);
  return results;
}

export async function runWikiGet(params: {
  config: ResolvedMemoryWikiConfig;
  appConfig?: AutopusConfig;
  lookup: string;
  fromLine?: number;
  lineCount?: number;
  searchBackend?: ResolvedMemoryWikiConfig["search"]["backend"];
  searchCorpus?: ResolvedMemoryWikiConfig["search"]["corpus"];
  json?: boolean;
  stdout?: Pick<NodeJS.WriteStream, "write">;
}) {
  await syncMemoryWikiImportedSources({ config: params.config, appConfig: params.appConfig });
  const result = await getMemoryWikiPage({
    config: params.config,
    appConfig: params.appConfig,
    lookup: params.lookup,
    fromLine: params.fromLine,
    lineCount: params.lineCount,
    searchBackend: params.searchBackend,
    searchCorpus: params.searchCorpus,
  });
  const summary = params.json
    ? JSON.stringify(result, null, 2)
    : (result?.content ?? `Wiki page not found: ${params.lookup}`);
  writeOutput(summary, params.stdout);
  return result;
}

export async function runWikiApplySynthesis(params: {
  config: ResolvedMemoryWikiConfig;
  appConfig?: AutopusConfig;
  title: string;
  body?: string;
  bodyFile?: string;
  sourceIds?: string[];
  contradictions?: string[];
  questions?: string[];
  confidence?: number;
  status?: string;
  json?: boolean;
  stdout?: Pick<NodeJS.WriteStream, "write">;
}) {
  const sourceIds = normalizeCliStringList(params.sourceIds);
  if (!sourceIds) {
    throw new Error("wiki apply synthesis requires at least one --source-id.");
  }
  const body = await resolveWikiApplyBody({ body: params.body, bodyFile: params.bodyFile });
  await syncMemoryWikiImportedSources({ config: params.config, appConfig: params.appConfig });
  const result = await applyMemoryWikiMutation({
    config: params.config,
    mutation: {
      op: "create_synthesis",
      title: params.title,
      body,
      sourceIds,
      ...(normalizeCliStringList(params.contradictions)
        ? { contradictions: normalizeCliStringList(params.contradictions) }
        : {}),
      ...(normalizeCliStringList(params.questions)
        ? { questions: normalizeCliStringList(params.questions) }
        : {}),
      ...(typeof params.confidence === "number" ? { confidence: params.confidence } : {}),
      ...(params.status?.trim() ? { status: params.status.trim() } : {}),
    },
  });
  writeOutput(formatMemoryWikiMutationSummary(result, params.json), params.stdout);
  return result;
}

export async function runWikiApplyMetadata(params: {
  config: ResolvedMemoryWikiConfig;
  appConfig?: AutopusConfig;
  lookup: string;
  sourceIds?: string[];
  contradictions?: string[];
  questions?: string[];
  confidence?: number;
  clearConfidence?: boolean;
  status?: string;
  json?: boolean;
  stdout?: Pick<NodeJS.WriteStream, "write">;
}) {
  await syncMemoryWikiImportedSources({ config: params.config, appConfig: params.appConfig });
  const result = await applyMemoryWikiMutation({
    config: params.config,
    mutation: {
      op: "update_metadata",
      lookup: params.lookup,
      ...(normalizeCliStringList(params.sourceIds)
        ? { sourceIds: normalizeCliStringList(params.sourceIds) }
        : {}),
      ...(normalizeCliStringList(params.contradictions)
        ? { contradictions: normalizeCliStringList(params.contradictions) }
        : {}),
      ...(normalizeCliStringList(params.questions)
        ? { questions: normalizeCliStringList(params.questions) }
        : {}),
      ...(params.clearConfidence
        ? { confidence: null }
        : typeof params.confidence === "number"
          ? { confidence: params.confidence }
          : {}),
      ...(params.status?.trim() ? { status: params.status.trim() } : {}),
    },
  });
  writeOutput(formatMemoryWikiMutationSummary(result, params.json), params.stdout);
  return result;
}

export async function runWikiBridgeImport(params: {
  config: ResolvedMemoryWikiConfig;
  appConfig?: AutopusConfig;
  json?: boolean;
  stdout?: Pick<NodeJS.WriteStream, "write">;
}) {
  const render = (value: MemoryWikiImportedSourceSyncResult) =>
    `Bridge import synced ${value.artifactCount} artifacts across ${value.workspaces} workspaces (${value.importedCount} new, ${value.updatedCount} updated, ${value.skippedCount} unchanged, ${value.removedCount} removed). Indexes ${value.indexesRefreshed ? `refreshed (${value.indexUpdatedFiles.length} files)` : `not refreshed (${value.indexRefreshReason})`}.`;
  if (shouldRouteBridgeRuntimeThroughGateway(params.config)) {
    const result = await callWikiGateway("wiki.bridge.import");
    writeOutput(formatGatewayJsonOrText(result, params.json, render), params.stdout);
    return result;
  }
  return runWikiCommandWithSummary({
    json: params.json,
    stdout: params.stdout,
    run: () =>
      syncMemoryWikiImportedSources({
        config: params.config,
        appConfig: params.appConfig,
      }),
    render,
  });
}

export async function runWikiUnsafeLocalImport(params: {
  config: ResolvedMemoryWikiConfig;
  appConfig?: AutopusConfig;
  json?: boolean;
  stdout?: Pick<NodeJS.WriteStream, "write">;
}) {
  return runWikiCommandWithSummary({
    json: params.json,
    stdout: params.stdout,
    run: () =>
      syncMemoryWikiImportedSources({
        config: params.config,
        appConfig: params.appConfig,
      }),
    render: (value) =>
      `Unsafe-local import synced ${value.artifactCount} artifacts (${value.importedCount} new, ${value.updatedCount} updated, ${value.skippedCount} unchanged, ${value.removedCount} removed). Indexes ${value.indexesRefreshed ? `refreshed (${value.indexUpdatedFiles.length} files)` : `not refreshed (${value.indexRefreshReason})`}.`,
  });
}

export async function runWikiObsidianStatus(params: {
  config: ResolvedMemoryWikiConfig;
  json?: boolean;
  stdout?: Pick<NodeJS.WriteStream, "write">;
}) {
  return runWikiCommandWithSummary({
    json: params.json,
    stdout: params.stdout,
    run: () => probeObsidianCli(),
    render: (value) =>
      value.available
        ? `Obsidian CLI available at ${value.command}`
        : "Obsidian CLI is not available on PATH.",
  });
}

export async function runWikiObsidianSearch(params: {
  config: ResolvedMemoryWikiConfig;
  query: string;
  json?: boolean;
  stdout?: Pick<NodeJS.WriteStream, "write">;
}) {
  return runWikiCommandWithSummary({
    json: params.json,
    stdout: params.stdout,
    run: () => runObsidianSearch({ config: params.config, query: params.query }),
    render: (value) => value.stdout.trim(),
  });
}

export async function runWikiObsidianOpenCli(params: {
  config: ResolvedMemoryWikiConfig;
  vaultPath: string;
  json?: boolean;
  stdout?: Pick<NodeJS.WriteStream, "write">;
}) {
  return runWikiCommandWithSummary({
    json: params.json,
    stdout: params.stdout,
    run: () => runObsidianOpen({ config: params.config, vaultPath: params.vaultPath }),
    render: (value) => value.stdout.trim() || "Opened in Obsidian.",
  });
}

export async function runWikiObsidianCommandCli(params: {
  config: ResolvedMemoryWikiConfig;
  id: string;
  json?: boolean;
  stdout?: Pick<NodeJS.WriteStream, "write">;
}) {
  return runWikiCommandWithSummary({
    json: params.json,
    stdout: params.stdout,
    run: () => runObsidianCommand({ config: params.config, id: params.id }),
    render: (value) => value.stdout.trim() || "Command sent to Obsidian.",
  });
}

export async function runWikiObsidianDailyCli(params: {
  config: ResolvedMemoryWikiConfig;
  json?: boolean;
  stdout?: Pick<NodeJS.WriteStream, "write">;
}) {
  return runWikiCommandWithSummary({
    json: params.json,
    stdout: params.stdout,
    run: () => runObsidianDaily({ config: params.config }),
    render: (value) => value.stdout.trim() || "Opened today's daily note.",
  });
}

function formatChatGptImportSummary(result: ChatGptImportResult): string {
  if (result.dryRun) {
    return `ChatGPT import dry run scanned ${result.conversationCount} conversations (${result.createdCount} new, ${result.updatedCount} updated, ${result.skippedCount} unchanged).`;
  }
  const runSuffix = result.runId ? ` Run id: ${result.runId}.` : "";
  return `ChatGPT import applied ${result.conversationCount} conversations (${result.createdCount} new, ${result.updatedCount} updated, ${result.skippedCount} unchanged). Refreshed ${result.indexUpdatedFiles.length} index file${result.indexUpdatedFiles.length === 1 ? "" : "s"}.${runSuffix}`;
}

function formatChatGptRollbackSummary(result: ChatGptRollbackResult): string {
  if (result.alreadyRolledBack) {
    return `ChatGPT import run ${result.runId} was already rolled back.`;
  }
  return `Rolled back ChatGPT import run ${result.runId} (${result.removedCount} removed, ${result.restoredCount} restored). Refreshed ${result.indexUpdatedFiles.length} index file${result.indexUpdatedFiles.length === 1 ? "" : "s"}.`;
}

export async function runWikiChatGptImport(params: {
  config: ResolvedMemoryWikiConfig;
  exportPath: string;
  dryRun?: boolean;
  json?: boolean;
  stdout?: Pick<NodeJS.WriteStream, "write">;
}) {
  return runWikiCommandWithSummary({
    json: params.json,
    stdout: params.stdout,
    run: () =>
      importChatGptConversations({
        config: params.config,
        exportPath: params.exportPath,
        dryRun: params.dryRun,
      }),
    render: formatChatGptImportSummary,
  });
}

export async function runWikiChatGptRollback(params: {
  config: ResolvedMemoryWikiConfig;
  runId: string;
  json?: boolean;
  stdout?: Pick<NodeJS.WriteStream, "write">;
}) {
  return runWikiCommandWithSummary({
    json: params.json,
    stdout: params.stdout,
    run: () =>
      rollbackChatGptImportRun({
        config: params.config,
        runId: params.runId,
      }),
    render: formatChatGptRollbackSummary,
  });
}

export function registerWikiCli(
  program: Command,
  pluginConfig?: MemoryWikiPluginConfig | ResolvedMemoryWikiConfig,
  appConfig?: AutopusConfig,
) {
  const config = isResolvedMemoryWikiConfig(pluginConfig)
    ? pluginConfig
    : resolveMemoryWikiConfig(pluginConfig);
  const wiki = program
    .command("wiki")
    .description(t("desc.inspect_and_initialize_the_memory_wiki_vault"));

  wiki
    .command("status")
    .description(t("desc.show_wiki_vault_status"))
    .option("--json", t("opt.print_json"))
    .action(async (opts: WikiStatusCommandOptions) => {
      await runWikiStatus({ config, appConfig, json: opts.json });
    });

  wiki
    .command("doctor")
    .description(t("desc.audit_wiki_vault_setup_and_report_actionable_fixes"))
    .option("--json", t("opt.print_json"))
    .action(async (opts: WikiDoctorCommandOptions) => {
      await runWikiDoctor({ config, appConfig, json: opts.json });
    });

  wiki
    .command("init")
    .description(t("desc.initialize_the_wiki_vault_layout"))
    .option("--json", t("opt.print_json"))
    .action(async (opts: WikiInitCommandOptions) => {
      await runWikiInit({ config, json: opts.json });
    });

  wiki
    .command("compile")
    .description(t("desc.refresh_generated_wiki_indexes"))
    .option("--json", t("opt.print_json"))
    .action(async (opts: WikiCompileCommandOptions) => {
      await runWikiCompile({ config, appConfig, json: opts.json });
    });

  wiki
    .command("lint")
    .description(t("desc.lint_the_wiki_vault_and_write_a_report"))
    .option("--json", t("opt.print_json"))
    .action(async (opts: WikiLintCommandOptions) => {
      await runWikiLint({ config, appConfig, json: opts.json });
    });

  wiki
    .command("ingest")
    .description(t("desc.ingest_a_local_file_into_the_wiki_sources_folder"))
    .argument("<path>", "Local file path to ingest")
    .option("--title <title>", t("opt.override_the_source_title"))
    .option("--json", t("opt.print_json"))
    .action(async (inputPath: string, opts: WikiIngestCommandOptions) => {
      await runWikiIngest({ config, inputPath, title: opts.title, json: opts.json });
    });

  addWikiSearchConfigOptions(
    wiki
      .command("search")
      .description(t("desc.search_wiki_pages_and_when_configured_the_active_memory_corpus"))
      .argument("<query>", "Search query")
      .option("--max-results <n>", t("opt.maximum_results"), (value: string) => Number(value))
      .option("--mode <mode>", `Search mode (${WIKI_SEARCH_MODES.join(", ")})`),
  )
    .option("--json", t("opt.print_json"))
    .action(async (query: string, opts: WikiSearchCommandOptions) => {
      await runWikiSearch({
        config,
        appConfig,
        query,
        maxResults: opts.maxResults,
        searchBackend: opts.backend,
        searchCorpus: opts.corpus,
        mode: opts.mode,
        json: opts.json,
      });
    });

  addWikiSearchConfigOptions(
    wiki
      .command("get")
      .description(
        t("desc.read_a_wiki_page_by_id_or_relative_path_with_optional_active_memory_fallback"),
      )
      .argument("<lookup>", "Relative path or page id")
      .option("--from <n>", t("opt.start_line"), (value: string) => Number(value))
      .option("--lines <n>", t("opt.number_of_lines"), (value: string) => Number(value)),
  )
    .option("--json", t("opt.print_json"))
    .action(async (lookup: string, opts: WikiGetCommandOptions) => {
      await runWikiGet({
        config,
        appConfig,
        lookup,
        fromLine: opts.from,
        lineCount: opts.lines,
        searchBackend: opts.backend,
        searchCorpus: opts.corpus,
        json: opts.json,
      });
    });

  const apply = wiki.command("apply").description(t("desc.apply_narrow_wiki_mutations"));
  addWikiApplyMutationOptions(
    apply
      .command("synthesis")
      .description(t("desc.create_or_refresh_a_synthesis_page_with_managed_summary_content"))
      .argument("<title>", "Synthesis title")
      .option("--body <text>", t("opt.summary_body_text"))
      .option("--body-file <path>", t("opt.read_summary_body_text_from_a_file")),
  )
    .option("--json", t("opt.print_json"))
    .action(async (title: string, opts: WikiApplySynthesisCommandOptions) => {
      await runWikiApplySynthesis({
        config,
        appConfig,
        title,
        body: opts.body,
        bodyFile: opts.bodyFile,
        sourceIds: opts.sourceId,
        contradictions: opts.contradiction,
        questions: opts.question,
        confidence: opts.confidence,
        status: opts.status,
        json: opts.json,
      });
    });
  addWikiApplyMutationOptions(
    apply
      .command("metadata")
      .description(t("desc.update_metadata_on_an_existing_page"))
      .argument("<lookup>", "Relative path or page id"),
  )
    .option("--clear-confidence", t("opt.remove_any_stored_confidence_value"))
    .option("--json", t("opt.print_json"))
    .action(async (lookup: string, opts: WikiApplyMetadataCommandOptions) => {
      await runWikiApplyMetadata({
        config,
        appConfig,
        lookup,
        sourceIds: opts.sourceId,
        contradictions: opts.contradiction,
        questions: opts.question,
        confidence: opts.confidence,
        clearConfidence: opts.clearConfidence,
        status: opts.status,
        json: opts.json,
      });
    });

  const bridge = wiki
    .command("bridge")
    .description(t("desc.import_public_memory_artifacts_into_the_wiki_vault"));
  bridge
    .command("import")
    .description(t("desc.sync_bridge_backed_memory_artifacts_into_wiki_source_pages"))
    .option("--json", t("opt.print_json"))
    .action(async (opts: WikiBridgeImportCommandOptions) => {
      await runWikiBridgeImport({ config, appConfig, json: opts.json });
    });

  const unsafeLocal = wiki
    .command("unsafe-local")
    .description(t("desc.import_explicitly_configured_private_local_paths_into_wiki_source_pages"));
  unsafeLocal
    .command("import")
    .description(t("desc.sync_unsafe_local_configured_paths_into_wiki_source_pages"))
    .option("--json", t("opt.print_json"))
    .action(async (opts: WikiUnsafeLocalImportCommandOptions) => {
      await runWikiUnsafeLocalImport({ config, appConfig, json: opts.json });
    });

  const chatgpt = wiki
    .command("chatgpt")
    .description(t("desc.import_chatgpt_export_history_into_wiki_source_pages"));
  chatgpt
    .command("import")
    .description(t("desc.import_a_chatgpt_export_into_draft_wiki_source_pages"))
    .requiredOption("--export <path>", "ChatGPT export directory or conversations.json path")
    .option("--dry-run", t("opt.preview_changes_without_writing"), false)
    .option("--json", t("opt.print_json"))
    .action(async (opts: WikiChatGptImportCommandOptions) => {
      await runWikiChatGptImport({
        config,
        exportPath: opts.export!,
        dryRun: opts.dryRun,
        json: opts.json,
      });
    });
  chatgpt
    .command("rollback")
    .description(t("desc.roll_back_a_previously_applied_chatgpt_import_run"))
    .argument("<run-id>", "Import run id")
    .option("--json", t("opt.print_json"))
    .action(async (runId: string, opts: WikiChatGptRollbackCommandOptions) => {
      await runWikiChatGptRollback({
        config,
        runId,
        json: opts.json,
      });
    });

  const obsidian = wiki
    .command("obsidian")
    .description(t("desc.run_official_obsidian_cli_helpers"));
  obsidian
    .command("status")
    .description(t("desc.probe_the_obsidian_cli"))
    .option("--json", t("opt.print_json"))
    .action(async (opts: WikiStatusCommandOptions) => {
      await runWikiObsidianStatus({ config, json: opts.json });
    });
  obsidian
    .command("search")
    .description(t("desc.search_the_current_obsidian_vault"))
    .argument("<query>", "Search query")
    .option("--json", t("opt.print_json"))
    .action(async (query: string, opts: WikiObsidianSearchCommandOptions) => {
      await runWikiObsidianSearch({ config, query, json: opts.json });
    });
  obsidian
    .command("open")
    .description(t("desc.open_a_file_in_obsidian_by_vault_relative_path"))
    .argument("<path>", "Vault-relative path")
    .option("--json", t("opt.print_json"))
    .action(async (vaultPath: string, opts: WikiObsidianOpenCommandOptions) => {
      await runWikiObsidianOpenCli({ config, vaultPath, json: opts.json });
    });
  obsidian
    .command("command")
    .description(t("desc.execute_an_obsidian_command_palette_command_by_id"))
    .argument("<id>", "Obsidian command id")
    .option("--json", t("opt.print_json"))
    .action(async (id: string, opts: WikiObsidianCommandCommandOptions) => {
      await runWikiObsidianCommandCli({ config, id, json: opts.json });
    });
  obsidian
    .command("daily")
    .description(t("desc.open_today_s_daily_note_in_obsidian"))
    .option("--json", t("opt.print_json"))
    .action(async (opts: WikiObsidianDailyCommandOptions) => {
      await runWikiObsidianDailyCli({ config, json: opts.json });
    });
}
