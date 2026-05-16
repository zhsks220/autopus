import type { Command } from "commander";
import {
  resolveAgentIdByWorkspacePath,
  resolveAgentWorkspaceDir,
  resolveDefaultAgentId,
} from "../agents/agent-scope.js";
import {
  installSkillFromClawHub,
  readTrackedClawHubSkillSlugs,
  searchSkillsFromClawHub,
  updateSkillsFromClawHub,
} from "../agents/skills-clawhub.js";
import { getRuntimeConfig } from "../config/config.js";
import { t } from "../i18n/cli/translate.js";
import { defaultRuntime } from "../runtime.js";
import { normalizeOptionalString } from "../shared/string-coerce.js";
import { formatDocsLink } from "../terminal/links.js";
import { theme } from "../terminal/theme.js";
import { resolveOptionFromCommand } from "./cli-utils.js";
import { formatSkillInfo, formatSkillsCheck, formatSkillsList } from "./skills-cli.format.js";

export type {
  SkillInfoOptions,
  SkillsCheckOptions,
  SkillsListOptions,
} from "./skills-cli.format.js";
export { formatSkillInfo, formatSkillsCheck, formatSkillsList } from "./skills-cli.format.js";

type SkillStatusReport = Awaited<
  ReturnType<(typeof import("../agents/skills-status.js"))["buildWorkspaceSkillStatus"]>
>;

type ResolveSkillsWorkspaceOptions = {
  agentId?: string;
  cwd?: string;
};

function resolveSkillsWorkspace(options?: ResolveSkillsWorkspaceOptions): {
  config: ReturnType<typeof getRuntimeConfig>;
  workspaceDir: string;
  agentId: string;
} {
  const config = getRuntimeConfig();
  const explicitAgentId = normalizeOptionalString(options?.agentId);
  const inferredAgentId = explicitAgentId
    ? undefined
    : resolveAgentIdByWorkspacePath(config, options?.cwd ?? process.cwd());
  const agentId = explicitAgentId ?? inferredAgentId ?? resolveDefaultAgentId(config);
  return {
    config,
    agentId,
    workspaceDir: resolveAgentWorkspaceDir(config, agentId),
  };
}

function resolveAgentOption(
  command: Command | undefined,
  opts?: { agent?: string },
): string | undefined {
  return resolveOptionFromCommand<string>(command, "agent") ?? opts?.agent;
}

async function loadSkillsStatusReport(
  options?: ResolveSkillsWorkspaceOptions,
): Promise<SkillStatusReport> {
  const { config, workspaceDir, agentId } = resolveSkillsWorkspace(options);
  const { buildWorkspaceSkillStatus } = await import("../agents/skills-status.js");
  return buildWorkspaceSkillStatus(workspaceDir, { config, agentId });
}

async function runSkillsAction(
  render: (report: SkillStatusReport) => string,
  options?: ResolveSkillsWorkspaceOptions,
): Promise<void> {
  try {
    const report = await loadSkillsStatusReport(options);
    defaultRuntime.writeStdout(render(report));
    defaultRuntime.exit(0);
  } catch (err) {
    defaultRuntime.error(String(err));
    defaultRuntime.exit(1);
  }
}

function resolveActiveWorkspaceDir(options?: ResolveSkillsWorkspaceOptions): string {
  return resolveSkillsWorkspace(options).workspaceDir;
}

/**
 * Register the skills CLI commands
 */
export function registerSkillsCli(program: Command) {
  const skills = program
    .command("skills")
    .description(t("desc.list_and_inspect_available_skills"))
    .option(
      "--agent <id>",
      t("opt.target_agent_workspace_defaults_to_cwd_inferred_then_default_agent"),
    )
    .addHelpText(
      "after",
      () =>
        `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/skills", "docs.autopus.ai/cli/skills")}\n`,
    );

  skills
    .command("search")
    .description(t("desc.search_clawhub_skills"))
    .argument("[query...]", "Optional search query")
    .option("--limit <n>", t("opt.max_results"), (value) => Number.parseInt(value, 10))
    .option("--json", t("opt.output_as_json"), false)
    .action(async (queryParts: string[], opts: { limit?: number; json?: boolean }) => {
      try {
        const results = await searchSkillsFromClawHub({
          query: normalizeOptionalString(queryParts.join(" ")),
          limit: opts.limit,
        });
        if (opts.json) {
          defaultRuntime.writeJson({ results });
          return;
        }
        if (results.length === 0) {
          defaultRuntime.log("No ClawHub skills found.");
          return;
        }
        for (const entry of results) {
          const version = entry.version ? ` v${entry.version}` : "";
          const summary = entry.summary ? `  ${entry.summary}` : "";
          defaultRuntime.log(`${entry.slug}${version}  ${entry.displayName}${summary}`);
        }
      } catch (err) {
        defaultRuntime.error(String(err));
        defaultRuntime.exit(1);
      }
    });

  skills
    .command("install")
    .description(t("desc.install_a_skill_from_clawhub_into_the_active_workspace"))
    .argument("<slug>", "ClawHub skill slug")
    .option("--version <version>", t("opt.install_a_specific_version"))
    .option("--force", t("opt.overwrite_an_existing_workspace_skill"), false)
    .option(
      "--agent <id>",
      t("opt.target_agent_workspace_defaults_to_cwd_inferred_then_default_agent"),
    )
    .action(
      async (
        slug: string,
        opts: { version?: string; force?: boolean; agent?: string },
        command: Command,
      ) => {
        try {
          const workspaceDir = resolveActiveWorkspaceDir({
            agentId: resolveAgentOption(command, opts),
          });
          const result = await installSkillFromClawHub({
            workspaceDir,
            slug,
            version: opts.version,
            force: Boolean(opts.force),
            logger: {
              info: (message) => defaultRuntime.log(message),
            },
          });
          if (!result.ok) {
            defaultRuntime.error(result.error);
            defaultRuntime.exit(1);
            return;
          }
          defaultRuntime.log(`Installed ${result.slug}@${result.version} -> ${result.targetDir}`);
        } catch (err) {
          defaultRuntime.error(String(err));
          defaultRuntime.exit(1);
        }
      },
    );

  skills
    .command("update")
    .description(t("desc.update_clawhub_installed_skills_in_the_active_workspace"))
    .argument("[slug]", "Single skill slug")
    .option("--all", t("opt.update_all_tracked_clawhub_skills"), false)
    .option(
      "--agent <id>",
      t("opt.target_agent_workspace_defaults_to_cwd_inferred_then_default_agent"),
    )
    .action(
      async (
        slug: string | undefined,
        opts: { all?: boolean; agent?: string },
        command: Command,
      ) => {
        try {
          if (!slug && !opts.all) {
            defaultRuntime.error("Provide a skill slug or use --all.");
            defaultRuntime.exit(1);
            return;
          }
          if (slug && opts.all) {
            defaultRuntime.error("Use either a skill slug or --all.");
            defaultRuntime.exit(1);
            return;
          }
          const workspaceDir = resolveActiveWorkspaceDir({
            agentId: resolveAgentOption(command, opts),
          });
          const tracked = await readTrackedClawHubSkillSlugs(workspaceDir);
          if (opts.all && tracked.length === 0) {
            defaultRuntime.log("No tracked ClawHub skills to update.");
            return;
          }
          const results = await updateSkillsFromClawHub({
            workspaceDir,
            slug,
            logger: {
              info: (message) => defaultRuntime.log(message),
            },
          });
          for (const result of results) {
            if (!result.ok) {
              defaultRuntime.error(result.error);
              continue;
            }
            if (result.changed) {
              defaultRuntime.log(
                `Updated ${result.slug}: ${result.previousVersion ?? "unknown"} -> ${result.version}`,
              );
              continue;
            }
            defaultRuntime.log(`${result.slug} already at ${result.version}`);
          }
        } catch (err) {
          defaultRuntime.error(String(err));
          defaultRuntime.exit(1);
        }
      },
    );

  skills
    .command("list")
    .description(t("desc.list_all_available_skills"))
    .option("--json", t("opt.output_as_json"), false)
    .option("--eligible", t("opt.show_only_eligible_ready_to_use_skills"), false)
    .option("-v, --verbose", t("opt.show_more_details_including_missing_requirements"), false)
    .option(
      "--agent <id>",
      t("opt.target_agent_workspace_defaults_to_cwd_inferred_then_default_agent"),
    )
    .action(
      async (
        opts: { json?: boolean; eligible?: boolean; verbose?: boolean; agent?: string },
        command: Command,
      ) => {
        await runSkillsAction((report) => formatSkillsList(report, opts), {
          agentId: resolveAgentOption(command, opts),
        });
      },
    );

  skills
    .command("info")
    .description(t("desc.show_detailed_information_about_a_skill"))
    .argument("<name>", "Skill name")
    .option("--json", t("opt.output_as_json"), false)
    .option(
      "--agent <id>",
      t("opt.target_agent_workspace_defaults_to_cwd_inferred_then_default_agent"),
    )
    .action(async (name: string, opts: { json?: boolean; agent?: string }, command: Command) => {
      await runSkillsAction((report) => formatSkillInfo(report, name, opts), {
        agentId: resolveAgentOption(command, opts),
      });
    });

  skills
    .command("check")
    .description(t("desc.check_which_skills_are_ready_visible_or_missing_requirements"))
    .option(
      "--agent <id>",
      t("opt.target_agent_workspace_defaults_to_cwd_inferred_then_default_agent"),
    )
    .option("--json", t("opt.output_as_json"), false)
    .action(async (opts: { json?: boolean; agent?: string }, command: Command) => {
      await runSkillsAction((report) => formatSkillsCheck(report, opts), {
        agentId: resolveAgentOption(command, opts),
      });
    });

  // Default action (no subcommand) - show list
  skills.action(async (opts: { agent?: string }, command: Command) => {
    await runSkillsAction((report) => formatSkillsList(report, {}), {
      agentId: resolveAgentOption(command, opts),
    });
  });
}
