import { describe, expect, it } from "vitest";
import {
  parseFrontmatter,
  resolveAutopusMetadata,
  resolveHookInvocationPolicy,
} from "./frontmatter.js";
import type { AutopusHookMetadata } from "./types.js";

function requireString(value: string | undefined, label: string): string {
  if (typeof value !== "string") {
    throw new Error(`expected ${label}`);
  }
  return value;
}

function requireAutopusMetadata(metadata: AutopusHookMetadata | undefined): AutopusHookMetadata {
  if (!metadata) {
    throw new Error("expected autopus metadata");
  }
  return metadata;
}

describe("parseFrontmatter", () => {
  it("parses single-line key-value pairs", () => {
    const content = `---
name: test-hook
description: "A test hook"
homepage: https://example.com
---

# Test Hook
`;
    const result = parseFrontmatter(content);
    expect(result.name).toBe("test-hook");
    expect(result.description).toBe("A test hook");
    expect(result.homepage).toBe("https://example.com");
  });

  it("handles missing frontmatter", () => {
    const content = "# Just a markdown file";
    const result = parseFrontmatter(content);
    expect(result).toStrictEqual({});
  });

  it("handles unclosed frontmatter", () => {
    const content = `---
name: broken
    `;
    const result = parseFrontmatter(content);
    expect(result).toStrictEqual({});
  });

  it("parses multi-line metadata block with indented JSON", () => {
    const content = `---
name: session-memory
description: "Save session context"
metadata:
  {
    "autopus": {
      "emoji": "💾",
      "events": ["command:new"]
    }
  }
---

# Session Memory Hook
`;
    const result = parseFrontmatter(content);
    expect(result.name).toBe("session-memory");
    expect(result.description).toBe("Save session context");
    const metadata = requireString(result.metadata, "session-memory metadata");

    // Verify the metadata is valid JSON
    const parsed = JSON.parse(metadata);
    expect(parsed.autopus.emoji).toBe("💾");
    expect(parsed.autopus.events).toEqual(["command:new"]);
  });

  it("parses multi-line metadata with complex nested structure", () => {
    const content = `---
name: command-logger
description: "Log all command events"
metadata:
  {
    "autopus":
      {
        "emoji": "📝",
        "events": ["command"],
        "requires": { "config": ["workspace.dir"] },
        "install": [{ "id": "bundled", "kind": "bundled", "label": "Bundled" }]
      }
  }
---
`;
    const result = parseFrontmatter(content);
    expect(result.name).toBe("command-logger");

    const parsed = JSON.parse(requireString(result.metadata, "command-logger metadata"));
    expect(parsed.autopus.emoji).toBe("📝");
    expect(parsed.autopus.events).toEqual(["command"]);
    expect(parsed.autopus.requires.config).toEqual(["workspace.dir"]);
    expect(parsed.autopus.install[0].kind).toBe("bundled");
  });

  it("handles single-line metadata (inline JSON)", () => {
    const content = `---
name: simple-hook
metadata: {"autopus": {"events": ["test"]}}
---
`;
    const result = parseFrontmatter(content);
    expect(result.name).toBe("simple-hook");
    expect(result.metadata).toBe('{"autopus": {"events": ["test"]}}');
  });

  it("handles mixed single-line and multi-line values", () => {
    const content = `---
name: mixed-hook
description: "A hook with mixed values"
homepage: https://example.com
metadata:
  {
    "autopus": {
      "events": ["command:new"]
    }
  }
enabled: true
---
`;
    const result = parseFrontmatter(content);
    expect(result.name).toBe("mixed-hook");
    expect(result.description).toBe("A hook with mixed values");
    expect(result.homepage).toBe("https://example.com");
    expect(requireString(result.metadata, "mixed-hook metadata")).toContain('"command:new"');
    expect(result.enabled).toBe("true");
  });

  it("strips surrounding quotes from values", () => {
    const content = `---
name: "quoted-name"
description: 'single-quoted'
---
`;
    const result = parseFrontmatter(content);
    expect(result.name).toBe("quoted-name");
    expect(result.description).toBe("single-quoted");
  });

  it("handles CRLF line endings", () => {
    const content = "---\r\nname: test\r\ndescription: crlf\r\n---\r\n";
    const result = parseFrontmatter(content);
    expect(result.name).toBe("test");
    expect(result.description).toBe("crlf");
  });

  it("handles CR line endings", () => {
    const content = "---\rname: test\rdescription: cr\r---\r";
    const result = parseFrontmatter(content);
    expect(result.name).toBe("test");
    expect(result.description).toBe("cr");
  });
});

describe("resolveAutopusMetadata", () => {
  it("extracts autopus metadata from parsed frontmatter", () => {
    const frontmatter = {
      name: "test-hook",
      metadata: JSON.stringify({
        autopus: {
          emoji: "🔥",
          events: ["command:new", "command:reset"],
          requires: {
            config: ["workspace.dir"],
            bins: ["git"],
          },
        },
      }),
    };

    const result = resolveAutopusMetadata(frontmatter);
    const autopus = requireAutopusMetadata(result);
    expect(autopus.emoji).toBe("🔥");
    expect(autopus.events).toEqual(["command:new", "command:reset"]);
    expect(autopus.requires?.config).toEqual(["workspace.dir"]);
    expect(autopus.requires?.bins).toEqual(["git"]);
  });

  it("returns undefined when metadata is missing", () => {
    const frontmatter = { name: "no-metadata" };
    const result = resolveAutopusMetadata(frontmatter);
    expect(result).toBeUndefined();
  });

  it("returns undefined when autopus key is missing", () => {
    const frontmatter = {
      metadata: JSON.stringify({ other: "data" }),
    };
    const result = resolveAutopusMetadata(frontmatter);
    expect(result).toBeUndefined();
  });

  it("returns undefined for invalid JSON", () => {
    const frontmatter = {
      metadata: "not valid json {",
    };
    const result = resolveAutopusMetadata(frontmatter);
    expect(result).toBeUndefined();
  });

  it("handles install specs", () => {
    const frontmatter = {
      metadata: JSON.stringify({
        autopus: {
          events: ["command"],
          install: [
            { id: "bundled", kind: "bundled", label: "Bundled with Autopus" },
            { id: "npm", kind: "npm", package: "@autopus/hook" },
          ],
        },
      }),
    };

    const result = resolveAutopusMetadata(frontmatter);
    expect(result?.install).toHaveLength(2);
    expect(result?.install?.[0].kind).toBe("bundled");
    expect(result?.install?.[1].kind).toBe("npm");
    expect(result?.install?.[1].package).toBe("@autopus/hook");
  });

  it("handles os restrictions", () => {
    const frontmatter = {
      metadata: JSON.stringify({
        autopus: {
          events: ["command"],
          os: ["darwin", "linux"],
        },
      }),
    };

    const result = resolveAutopusMetadata(frontmatter);
    expect(result?.os).toEqual(["darwin", "linux"]);
  });

  it("parses real session-memory HOOK.md format", () => {
    // This is the actual format used in the bundled hooks
    const content = `---
name: session-memory
description: "Save session context to memory when /new or /reset command is issued"
homepage: https://docs.autopus.ai/automation/hooks#session-memory
metadata:
  {
    "autopus":
      {
        "emoji": "💾",
        "events": ["command:new", "command:reset"],
        "requires": { "config": ["workspace.dir"] },
        "install": [{ "id": "bundled", "kind": "bundled", "label": "Bundled with Autopus" }],
      },
  }
---

# Session Memory Hook
`;

    const frontmatter = parseFrontmatter(content);
    expect(frontmatter.name).toBe("session-memory");
    expect(requireString(frontmatter.metadata, "session-memory metadata")).toContain(
      '"command:reset"',
    );

    const autopus = requireAutopusMetadata(resolveAutopusMetadata(frontmatter));
    expect(autopus.emoji).toBe("💾");
    expect(autopus.events).toEqual(["command:new", "command:reset"]);
    expect(autopus.requires?.config).toEqual(["workspace.dir"]);
    expect(autopus.install?.[0].kind).toBe("bundled");
  });

  it("parses YAML metadata map", () => {
    const content = `---
name: yaml-metadata
metadata:
  autopus:
    emoji: disk
    events:
      - command:new
---
`;
    const frontmatter = parseFrontmatter(content);
    const autopus = resolveAutopusMetadata(frontmatter);
    expect(autopus?.emoji).toBe("disk");
    expect(autopus?.events).toEqual(["command:new"]);
  });
});

describe("resolveHookInvocationPolicy", () => {
  it("defaults to enabled when missing", () => {
    expect(resolveHookInvocationPolicy({}).enabled).toBe(true);
  });

  it("parses enabled flag", () => {
    expect(resolveHookInvocationPolicy({ enabled: "no" }).enabled).toBe(false);
    expect(resolveHookInvocationPolicy({ enabled: "on" }).enabled).toBe(true);
  });
});
