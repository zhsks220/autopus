import fs from "node:fs";
import path from "node:path";
import { bundledPluginRoot } from "autopus/plugin-sdk/test-fixtures";
import { afterEach, describe, expect, it } from "vitest";
import {
  buildOfficialChannelCatalog,
  OFFICIAL_CHANNEL_CATALOG_RELATIVE_PATH,
  writeOfficialChannelCatalog,
} from "../scripts/write-official-channel-catalog.mjs";
import { describePluginInstallSource } from "../src/plugins/install-source-info.js";
import { cleanupTempDirs, makeTempRepoRoot, writeJsonFile } from "./helpers/temp-repo.js";

const tempDirs: string[] = [];

type OfficialChannelCatalogEntry = ReturnType<
  typeof buildOfficialChannelCatalog
>["entries"][number];
type OfficialChannelInstall = NonNullable<
  NonNullable<OfficialChannelCatalogEntry["autopus"]>["install"]
>;

function makeRepoRoot(prefix: string): string {
  return makeTempRepoRoot(tempDirs, prefix);
}

function writeJson(filePath: string, value: unknown): void {
  writeJsonFile(filePath, value);
}

function requireInstall(entry: OfficialChannelCatalogEntry | undefined): OfficialChannelInstall {
  const install = entry?.autopus?.install;
  if (!install) {
    throw new Error("expected official channel install config");
  }
  return install;
}

function requireNpmInstallSource(source: ReturnType<typeof describePluginInstallSource>) {
  if (!source.npm) {
    throw new Error("expected npm install source");
  }
  return source.npm;
}

function findCatalogEntry(
  entries: OfficialChannelCatalogEntry[],
  predicate: (entry: OfficialChannelCatalogEntry) => boolean,
): OfficialChannelCatalogEntry {
  const entry = entries.find(predicate);
  if (!entry) {
    throw new Error("expected official channel catalog entry");
  }
  return entry;
}

function summarizeCatalogEntry(entry: OfficialChannelCatalogEntry) {
  return {
    name: entry.name,
    description: entry.description,
    source: entry.source,
    plugin: entry.autopus?.plugin,
    channel: entry.autopus?.channel,
    install: entry.autopus?.install,
  };
}

afterEach(() => {
  cleanupTempDirs(tempDirs);
});

describe("buildOfficialChannelCatalog", () => {
  it("includes publishable official channel plugins and skips non-publishable entries", () => {
    const repoRoot = makeRepoRoot("autopus-official-channel-catalog-");
    writeJson(path.join(repoRoot, "extensions", "whatsapp", "package.json"), {
      name: "@autopus/whatsapp",
      version: "2026.3.23",
      description: "Autopus WhatsApp channel plugin",
      autopus: {
        channel: {
          id: "whatsapp",
          label: "WhatsApp",
          selectionLabel: "WhatsApp (QR link)",
          detailLabel: "WhatsApp Web",
          docsPath: "/channels/whatsapp",
          blurb: "works with your own number; recommend a separate phone + eSIM.",
        },
        install: {
          clawhubSpec: "clawhub:@autopus/whatsapp",
          npmSpec: "@autopus/whatsapp",
          localPath: bundledPluginRoot("whatsapp"),
          defaultChoice: "clawhub",
        },
        release: {
          publishToNpm: true,
        },
      },
    });
    writeJson(path.join(repoRoot, "extensions", "local-only", "package.json"), {
      name: "@autopus/local-only",
      autopus: {
        channel: {
          id: "local-only",
          label: "Local Only",
          selectionLabel: "Local Only",
          docsPath: "/channels/local-only",
          blurb: "dev only",
        },
        install: {
          localPath: bundledPluginRoot("local-only"),
        },
        release: {
          publishToNpm: false,
        },
      },
    });

    const entries = buildOfficialChannelCatalog({ repoRoot }).entries;

    expect(
      summarizeCatalogEntry(
        findCatalogEntry(entries, (entry) => entry.name === "@wecom/wecom-autopus-plugin"),
      ),
    ).toEqual({
      name: "@wecom/wecom-autopus-plugin",
      description: "Autopus WeCom channel plugin by the Tencent WeCom team.",
      source: "external",
      plugin: {
        id: "wecom-autopus-plugin",
        label: "WeCom",
      },
      channel: {
        id: "wecom",
        label: "WeCom",
        selectionLabel: "WeCom（企业微信）",
        detailLabel: "WeCom",
        docsLabel: "wecom",
        docsPath: "/plugins/community#wecom",
        blurb: "Enterprise messaging and documents, scheduling, task tools.",
        order: 45,
        aliases: ["qywx", "wework", "enterprise-wechat"],
      },
      install: {
        npmSpec: "@wecom/wecom-autopus-plugin@2026.5.7",
        defaultChoice: "npm",
        expectedIntegrity:
          "sha512-TCkP9as00WfEhgFWG8YL/rcmaWGIshAki2HQh83nTRccGfVBCoGjrEboTTqq3yDmK9koWTV11zi8u8A4dNtvug==",
      },
    });
    expect(
      summarizeCatalogEntry(
        findCatalogEntry(entries, (entry) => entry.name === "autopus-plugin-yuanbao"),
      ),
    ).toEqual({
      name: "autopus-plugin-yuanbao",
      description: "Autopus Yuanbao channel plugin by the Tencent Yuanbao team.",
      source: "external",
      plugin: {
        id: "autopus-plugin-yuanbao",
        label: "Yuanbao",
      },
      channel: {
        id: "yuanbao",
        label: "Yuanbao",
        selectionLabel: "Yuanbao (元宝)",
        detailLabel: "Yuanbao",
        docsLabel: "yuanbao",
        docsPath: "/plugins/community#yuanbao",
        blurb: "Tencent Yuanbao AI assistant conversation channel.",
        order: 85,
        aliases: ["yuanbao", "yb", "tencent-yuanbao", "元宝"],
      },
      install: {
        npmSpec: "autopus-plugin-yuanbao@2.13.1",
        defaultChoice: "npm",
        expectedIntegrity:
          "sha512-lH2I9/nsmrg7l0YJJSQhOSpWMEFBAa6FwKbZcRLDFHDT2+mOZkHa44XE+8KYN4VmorlUdAxHzpZQmVr7C98IuA==",
      },
    });
    expect(
      summarizeCatalogEntry(
        findCatalogEntry(entries, (entry) => entry.name === "@autopus/whatsapp"),
      ),
    ).toEqual({
      name: "@autopus/whatsapp",
      description: "Autopus WhatsApp channel plugin",
      source: "official",
      plugin: undefined,
      channel: {
        id: "whatsapp",
        label: "WhatsApp",
        selectionLabel: "WhatsApp (QR link)",
        detailLabel: "WhatsApp Web",
        docsLabel: "whatsapp",
        docsPath: "/channels/whatsapp",
        blurb: "works with your own number; recommend a separate phone + eSIM.",
        systemImage: "message",
      },
      install: {
        clawhubSpec: "clawhub:@autopus/whatsapp",
        npmSpec: "@autopus/whatsapp",
        defaultChoice: "clawhub",
        minHostVersion: ">=2026.4.25",
      },
    });
  });

  it("keeps third-party official external catalog npm sources exactly pinned", () => {
    const repoRoot = makeRepoRoot("autopus-official-channel-catalog-policy-");
    const entries = buildOfficialChannelCatalog({ repoRoot }).entries.filter(
      (entry) => entry.source === "external" && !entry.name?.startsWith("@autopus/"),
    );

    expect(entries.length).toBeGreaterThan(0);
    for (const entry of entries) {
      const installSource = describePluginInstallSource(requireInstall(entry));
      expect(installSource.warnings).toStrictEqual([]);
      expect(requireNpmInstallSource(installSource).pinState).toBe("exact-with-integrity");
    }
  });

  it("allows official Autopus channel npm specs without integrity during launch", () => {
    const repoRoot = makeRepoRoot("autopus-official-channel-catalog-autopus-policy-");
    const twitch = buildOfficialChannelCatalog({ repoRoot }).entries.find(
      (entry) => entry.autopus?.channel?.id === "twitch",
    );

    expect({
      name: twitch?.name,
      install: twitch?.autopus?.install,
    }).toEqual({
      name: "@autopus/twitch",
      install: {
        npmSpec: "@autopus/twitch",
        defaultChoice: "npm",
        minHostVersion: ">=2026.4.10",
      },
    });
    const installSource = describePluginInstallSource(requireInstall(twitch));
    expect(requireNpmInstallSource(installSource).pinState).toBe("floating-without-integrity");
    expect(installSource.warnings).toEqual(["npm-spec-floating", "npm-spec-missing-integrity"]);
  });

  it("preserves ClawHub specs when generating publishable channel catalog entries", () => {
    const repoRoot = makeRepoRoot("autopus-official-channel-catalog-clawhub-");
    writeJson(path.join(repoRoot, "extensions", "storepack-chat", "package.json"), {
      name: "@autopus/storepack-chat",
      autopus: {
        channel: {
          id: "storepack-chat",
          label: "Storepack Chat",
          selectionLabel: "Storepack Chat",
          docsPath: "/channels/storepack-chat",
          blurb: "storepack-first channel",
        },
        install: {
          clawhubSpec: "clawhub:@autopus/storepack-chat",
          npmSpec: "@autopus/storepack-chat",
          defaultChoice: "clawhub",
        },
        release: {
          publishToNpm: true,
        },
      },
    });

    const entry = buildOfficialChannelCatalog({ repoRoot }).entries.find(
      (candidate) => candidate.autopus?.channel?.id === "storepack-chat",
    );

    expect(requireInstall(entry)).toEqual({
      clawhubSpec: "clawhub:@autopus/storepack-chat",
      npmSpec: "@autopus/storepack-chat",
      defaultChoice: "clawhub",
    });
  });

  it("writes the official catalog under dist", () => {
    const repoRoot = makeRepoRoot("autopus-official-channel-catalog-write-");
    writeJson(path.join(repoRoot, "extensions", "whatsapp", "package.json"), {
      name: "@autopus/whatsapp",
      autopus: {
        channel: {
          id: "whatsapp",
          label: "WhatsApp",
          selectionLabel: "WhatsApp",
          docsPath: "/channels/whatsapp",
          blurb: "wa",
        },
        install: {
          npmSpec: "@autopus/whatsapp",
        },
        release: {
          publishToNpm: true,
        },
      },
    });

    writeOfficialChannelCatalog({ repoRoot });

    const outputPath = path.join(repoRoot, OFFICIAL_CHANNEL_CATALOG_RELATIVE_PATH);
    expect(fs.existsSync(outputPath)).toBe(true);
    const entries = JSON.parse(fs.readFileSync(outputPath, "utf8")).entries;
    expect(entries.map((entry: { name?: string }) => entry.name)).toContain(
      "@wecom/wecom-autopus-plugin",
    );
    expect(entries.map((entry: { name?: string }) => entry.name)).toContain(
      "autopus-plugin-yuanbao",
    );
    const whatsappEntry = findCatalogEntry(
      entries,
      (entry: { autopus?: { channel?: { id?: string } } }) =>
        entry.autopus?.channel?.id === "whatsapp",
    );
    expect(summarizeCatalogEntry(whatsappEntry)).toEqual({
      name: "@autopus/whatsapp",
      description: "Autopus WhatsApp channel plugin",
      source: "official",
      plugin: undefined,
      channel: {
        id: "whatsapp",
        label: "WhatsApp",
        selectionLabel: "WhatsApp (QR link)",
        detailLabel: "WhatsApp Web",
        docsLabel: "whatsapp",
        docsPath: "/channels/whatsapp",
        blurb: "works with your own number; recommend a separate phone + eSIM.",
        systemImage: "message",
      },
      install: {
        clawhubSpec: "clawhub:@autopus/whatsapp",
        npmSpec: "@autopus/whatsapp",
        defaultChoice: "clawhub",
        minHostVersion: ">=2026.4.25",
      },
    });
    const whatsappEntries = entries.filter(
      (entry: { autopus?: { channel?: { id?: string } } }) =>
        entry.autopus?.channel?.id === "whatsapp",
    );
    expect(whatsappEntries).toHaveLength(1);
  });
});
