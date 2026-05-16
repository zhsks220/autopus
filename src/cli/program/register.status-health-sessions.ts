import type { Command } from "commander";
import { commitmentsDismissCommand, commitmentsListCommand } from "../../commands/commitments.js";
import { exportTrajectoryCommand } from "../../commands/export-trajectory.js";
import { flowsCancelCommand, flowsListCommand, flowsShowCommand } from "../../commands/flows.js";
import { healthCommand } from "../../commands/health.js";
import { sessionsCleanupCommand } from "../../commands/sessions-cleanup.js";
import { sessionsCommand } from "../../commands/sessions.js";
import { statusCommand } from "../../commands/status.js";
import {
  tasksAuditCommand,
  tasksCancelCommand,
  tasksListCommand,
  tasksMaintenanceCommand,
  tasksNotifyCommand,
  tasksShowCommand,
} from "../../commands/tasks.js";
import { setVerbose } from "../../globals.js";
import { t } from "../../i18n/cli/translate.js";
import { defaultRuntime } from "../../runtime.js";
import { formatDocsLink } from "../../terminal/links.js";
import { theme } from "../../terminal/theme.js";
import { runCommandWithRuntime } from "../cli-utils.js";
import { formatHelpExamples } from "../help-format.js";
import { parsePositiveIntOrUndefined } from "./helpers.js";

function resolveVerbose(opts: { verbose?: boolean; debug?: boolean }): boolean {
  return Boolean(opts.verbose || opts.debug);
}

function parseTimeoutMs(timeout: unknown): number | null | undefined {
  const parsed = parsePositiveIntOrUndefined(timeout);
  if (timeout !== undefined && parsed === undefined) {
    defaultRuntime.error("--timeout must be a positive integer (milliseconds)");
    defaultRuntime.exit(1);
    return null;
  }
  return parsed;
}

async function runWithVerboseAndTimeout(
  opts: { verbose?: boolean; debug?: boolean; timeout?: unknown },
  action: (params: { verbose: boolean; timeoutMs: number | undefined }) => Promise<void>,
): Promise<void> {
  const verbose = resolveVerbose(opts);
  setVerbose(verbose);
  const timeoutMs = parseTimeoutMs(opts.timeout);
  if (timeoutMs === null) {
    return;
  }
  await runCommandWithRuntime(defaultRuntime, async () => {
    await action({ verbose, timeoutMs });
  });
}

export function registerStatusHealthSessionsCommands(program: Command) {
  program
    .command("status")
    .description(t("desc.show_channel_health_and_recent_session_recipients"))
    .option("--json", t("opt.output_json_instead_of_text"), false)
    .option("--all", t("opt.full_diagnosis_read_only_pasteable"), false)
    .option("--usage", t("opt.show_model_provider_usage_quota_snapshots"), false)
    .option("--deep", t("opt.probe_channels_whatsapp_web_telegram_discord_slack_signal"), false)
    .option("--timeout <ms>", t("opt.probe_timeout_in_milliseconds"), "10000")
    .option("--verbose", t("opt.verbose_logging"), false)
    .option("--debug", t("opt.alias_for_verbose"), false)
    .addHelpText(
      "after",
      () =>
        `\n${theme.heading("Examples:")}\n${formatHelpExamples([
          ["autopus status", "Show channel health + session summary."],
          ["autopus status --all", "Full diagnosis (read-only)."],
          ["autopus status --json", "Machine-readable output."],
          ["autopus status --usage", "Show model provider usage/quota snapshots."],
          [
            "autopus status --deep",
            "Run channel probes (WA + Telegram + Discord + Slack + Signal).",
          ],
          ["autopus status --deep --timeout 5000", "Tighten probe timeout."],
        ])}`,
    )
    .addHelpText(
      "after",
      () =>
        `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/status", "docs.autopus.ai/cli/status")}\n`,
    )
    .action(async (opts) => {
      await runWithVerboseAndTimeout(opts, async ({ verbose, timeoutMs }) => {
        await statusCommand(
          {
            json: Boolean(opts.json),
            all: Boolean(opts.all),
            deep: Boolean(opts.deep),
            usage: Boolean(opts.usage),
            timeoutMs,
            verbose,
          },
          defaultRuntime,
        );
      });
    });

  program
    .command("health")
    .description(t("desc.fetch_health_from_the_running_gateway"))
    .option("--json", t("opt.output_json_instead_of_text"), false)
    .option("--timeout <ms>", t("opt.connection_timeout_in_milliseconds"), "10000")
    .option("--verbose", t("opt.verbose_logging"), false)
    .option("--debug", t("opt.alias_for_verbose"), false)
    .addHelpText(
      "after",
      () =>
        `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/health", "docs.autopus.ai/cli/health")}\n`,
    )
    .action(async (opts) => {
      await runWithVerboseAndTimeout(opts, async ({ verbose, timeoutMs }) => {
        await healthCommand(
          {
            json: Boolean(opts.json),
            timeoutMs,
            verbose,
          },
          defaultRuntime,
        );
      });
    });

  const sessionsCmd = program
    .command("sessions")
    .description(t("desc.list_stored_conversation_sessions"))
    .option("--json", t("opt.output_as_json"), false)
    .option("--verbose", t("opt.verbose_logging"), false)
    .option("--store <path>", t("opt.path_to_session_store_default_resolved_from_config"))
    .option("--agent <id>", t("opt.agent_id_to_inspect_default_configured_default_agent"))
    .option("--all-agents", t("opt.aggregate_sessions_across_all_configured_agents"), false)
    .option("--active <minutes>", t("opt.only_show_sessions_updated_within_the_past_n_minutes"))
    .option("--limit <count>", 'Max sessions to show (default: 100; use "all" for full output)')
    .addHelpText(
      "after",
      () =>
        `\n${theme.heading("Examples:")}\n${formatHelpExamples([
          ["autopus sessions", "List all sessions."],
          ["autopus sessions --agent work", "List sessions for one agent."],
          ["autopus sessions --all-agents", "Aggregate sessions across agents."],
          ["autopus sessions --active 120", "Only last 2 hours."],
          ["autopus sessions --limit 25", "Show the newest 25 sessions."],
          ["autopus sessions --json", "Machine-readable output."],
          ["autopus sessions --store ./tmp/sessions.json", "Use a specific session store."],
        ])}\n\n${theme.muted(
          "Shows token usage per session when the agent reports it; set agents.defaults.contextTokens to cap the window and show %.",
        )}`,
    )
    .addHelpText(
      "after",
      () =>
        `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/sessions", "docs.autopus.ai/cli/sessions")}\n`,
    )
    .action(async (opts) => {
      setVerbose(Boolean(opts.verbose));
      await sessionsCommand(
        {
          json: Boolean(opts.json),
          store: opts.store as string | undefined,
          agent: opts.agent as string | undefined,
          allAgents: Boolean(opts.allAgents),
          active: opts.active as string | undefined,
          limit: opts.limit as string | undefined,
        },
        defaultRuntime,
      );
    });
  sessionsCmd.enablePositionalOptions();

  sessionsCmd
    .command("cleanup")
    .description(t("desc.run_session_store_maintenance_now"))
    .option("--store <path>", t("opt.path_to_session_store_default_resolved_from_config"))
    .option("--agent <id>", t("opt.agent_id_to_maintain_default_configured_default_agent"))
    .option("--all-agents", t("opt.run_maintenance_across_all_configured_agents"), false)
    .option("--dry-run", t("opt.preview_maintenance_actions_without_writing"), false)
    .option("--enforce", t("opt.apply_maintenance_even_when_configured_mode_is_warn"), false)
    .option(
      "--fix-missing",
      "Remove store entries whose transcript files are missing (bypasses age/count retention)",
      false,
    )
    .option(
      "--fix-dm-scope",
      "Retire stale direct-DM session rows that no longer match session.dmScope=main",
      false,
    )
    .option("--active-key <key>", t("opt.protect_this_session_key_from_budget_eviction"))
    .option("--json", t("opt.output_json"), false)
    .addHelpText(
      "after",
      () =>
        `\n${theme.heading("Examples:")}\n${formatHelpExamples([
          ["autopus sessions cleanup --dry-run", "Preview stale/cap cleanup."],
          [
            "autopus sessions cleanup --dry-run --fix-missing",
            "Also preview pruning entries with missing transcript files.",
          ],
          [
            "autopus sessions cleanup --dry-run --fix-dm-scope",
            "Preview stale direct-DM rows after returning dmScope to main.",
          ],
          ["autopus sessions cleanup --enforce", "Apply maintenance now."],
          ["autopus sessions cleanup --agent work --dry-run", "Preview one agent store."],
          ["autopus sessions cleanup --all-agents --dry-run", "Preview all agent stores."],
          [
            "autopus sessions cleanup --enforce --store ./tmp/sessions.json",
            "Use a specific store.",
          ],
        ])}`,
    )
    .action(async (opts, command) => {
      const parentOpts = command.parent?.opts() as
        | {
            store?: string;
            agent?: string;
            allAgents?: boolean;
            json?: boolean;
          }
        | undefined;
      await runCommandWithRuntime(defaultRuntime, async () => {
        await sessionsCleanupCommand(
          {
            store: (opts.store as string | undefined) ?? parentOpts?.store,
            agent: (opts.agent as string | undefined) ?? parentOpts?.agent,
            allAgents: Boolean(opts.allAgents || parentOpts?.allAgents),
            dryRun: Boolean(opts.dryRun),
            enforce: Boolean(opts.enforce),
            fixMissing: Boolean(opts.fixMissing),
            fixDmScope: Boolean(opts.fixDmScope),
            activeKey: opts.activeKey as string | undefined,
            json: Boolean(opts.json || parentOpts?.json),
          },
          defaultRuntime,
        );
      });
    });

  sessionsCmd
    .command("export-trajectory")
    .description(t("desc.export_a_redacted_trajectory_bundle_for_a_stored_session"))
    .option("--session-key <key>", t("opt.session_key_to_export"))
    .option("--output <path>", t("opt.output_directory_name_inside_autopus_trajectory_exports"))
    .option("--workspace <path>", t("opt.workspace_root_for_the_export_default_current_directory"))
    .option("--store <path>", t("opt.path_to_session_store_default_resolved_from_session_key"))
    .option("--agent <id>", t("opt.agent_id_for_resolving_the_default_session_store"))
    .option("--request-json-base64 <payload>", t("opt.base64url_encoded_export_request"))
    .option("--json", t("opt.output_json"), false)
    .action(async (opts, command) => {
      const parentOpts = command.parent?.opts() as
        | {
            store?: string;
            agent?: string;
            json?: boolean;
          }
        | undefined;
      await runCommandWithRuntime(defaultRuntime, async () => {
        await exportTrajectoryCommand(
          {
            sessionKey: opts.sessionKey as string | undefined,
            output: opts.output as string | undefined,
            workspace: opts.workspace as string | undefined,
            store: (opts.store as string | undefined) ?? parentOpts?.store,
            agent: (opts.agent as string | undefined) ?? parentOpts?.agent,
            requestJsonBase64: opts.requestJsonBase64 as string | undefined,
            json: Boolean(opts.json || parentOpts?.json),
          },
          defaultRuntime,
        );
      });
    });

  const commitmentsCmd = program
    .command("commitments")
    .description(t("desc.list_and_manage_inferred_follow_up_commitments"))
    .option("--json", t("opt.output_json_instead_of_text"), false)
    .option("--agent <id>", t("opt.agent_id_to_inspect"))
    .option("--status <status>", t("opt.filter_by_status_pending_sent_dismissed_snoozed_expired"))
    .option("--all", t("opt.show_all_statuses"), false)
    .addHelpText(
      "after",
      () =>
        `\n${theme.heading("Examples:")}\n${formatHelpExamples([
          ["autopus commitments", "List pending inferred follow-ups."],
          ["autopus commitments --all", "List all inferred follow-ups."],
          ["autopus commitments --agent work", "List one agent's inferred follow-ups."],
          ["autopus commitments dismiss cm_abc123", "Dismiss a follow-up."],
        ])}`,
    )
    .action(async (opts) => {
      await runCommandWithRuntime(defaultRuntime, async () => {
        await commitmentsListCommand(
          {
            json: Boolean(opts.json),
            agent: opts.agent as string | undefined,
            status: opts.status as string | undefined,
            all: Boolean(opts.all),
          },
          defaultRuntime,
        );
      });
    });
  commitmentsCmd.enablePositionalOptions();

  commitmentsCmd
    .command("list")
    .description(t("desc.list_inferred_follow_up_commitments"))
    .option("--json", t("opt.output_json_instead_of_text"), false)
    .option("--agent <id>", t("opt.agent_id_to_inspect"))
    .option("--status <status>", t("opt.filter_by_status_pending_sent_dismissed_snoozed_expired"))
    .option("--all", t("opt.show_all_statuses"), false)
    .action(async (opts, command) => {
      const parentOpts = command.parent?.opts() as
        | { json?: boolean; agent?: string; status?: string; all?: boolean }
        | undefined;
      await runCommandWithRuntime(defaultRuntime, async () => {
        await commitmentsListCommand(
          {
            json: Boolean(opts.json || parentOpts?.json),
            agent: (opts.agent as string | undefined) ?? parentOpts?.agent,
            status: (opts.status as string | undefined) ?? parentOpts?.status,
            all: Boolean(opts.all || parentOpts?.all),
          },
          defaultRuntime,
        );
      });
    });

  commitmentsCmd
    .command("dismiss <ids...>")
    .description(t("desc.dismiss_inferred_follow_up_commitments"))
    .option("--json", t("opt.output_json_instead_of_text"), false)
    .action(async (ids: string[], opts, command) => {
      const parentOpts = command.parent?.opts() as { json?: boolean } | undefined;
      await runCommandWithRuntime(defaultRuntime, async () => {
        await commitmentsDismissCommand(
          {
            ids,
            json: Boolean(opts.json || parentOpts?.json),
          },
          defaultRuntime,
        );
      });
    });

  const tasksCmd = program
    .command("tasks")
    .description(t("desc.inspect_durable_background_tasks_and_taskflow_state"))
    .option("--json", t("opt.output_as_json"), false)
    .option("--runtime <name>", t("opt.filter_by_kind_subagent_acp_cron_cli"))
    .option(
      "--status <name>",
      "Filter by status (queued, running, succeeded, failed, timed_out, cancelled, lost)",
    )
    .action(async (opts) => {
      await runCommandWithRuntime(defaultRuntime, async () => {
        await tasksListCommand(
          {
            json: Boolean(opts.json),
            runtime: opts.runtime as string | undefined,
            status: opts.status as string | undefined,
          },
          defaultRuntime,
        );
      });
    });
  tasksCmd.enablePositionalOptions();

  tasksCmd
    .command("list")
    .description(t("desc.list_tracked_background_tasks"))
    .option("--json", t("opt.output_as_json"), false)
    .option("--runtime <name>", t("opt.filter_by_kind_subagent_acp_cron_cli"))
    .option(
      "--status <name>",
      "Filter by status (queued, running, succeeded, failed, timed_out, cancelled, lost)",
    )
    .action(async (opts, command) => {
      const parentOpts = command.parent?.opts() as
        | {
            json?: boolean;
            runtime?: string;
            status?: string;
          }
        | undefined;
      await runCommandWithRuntime(defaultRuntime, async () => {
        await tasksListCommand(
          {
            json: Boolean(opts.json || parentOpts?.json),
            runtime: (opts.runtime as string | undefined) ?? parentOpts?.runtime,
            status: (opts.status as string | undefined) ?? parentOpts?.status,
          },
          defaultRuntime,
        );
      });
    });

  tasksCmd
    .command("audit")
    .description(t("desc.show_stale_or_broken_background_tasks_and_taskflows"))
    .option("--json", t("opt.output_as_json"), false)
    .option("--severity <level>", t("opt.filter_by_severity_warn_error"))
    .option(
      "--code <name>",
      "Filter by finding code (stale_queued, stale_running, lost, delivery_failed, missing_cleanup, inconsistent_timestamps, restore_failed, stale_waiting, stale_blocked, cancel_stuck, missing_linked_tasks, blocked_task_missing)",
    )
    .option("--limit <n>", t("opt.limit_displayed_findings"))
    .action(async (opts, command) => {
      const parentOpts = command.parent?.opts() as { json?: boolean } | undefined;
      await runCommandWithRuntime(defaultRuntime, async () => {
        await tasksAuditCommand(
          {
            json: Boolean(opts.json || parentOpts?.json),
            severity: opts.severity as "warn" | "error" | undefined,
            code: opts.code as
              | "stale_queued"
              | "stale_running"
              | "lost"
              | "delivery_failed"
              | "missing_cleanup"
              | "inconsistent_timestamps"
              | "restore_failed"
              | "stale_waiting"
              | "stale_blocked"
              | "cancel_stuck"
              | "missing_linked_tasks"
              | "blocked_task_missing"
              | undefined,
            limit: parsePositiveIntOrUndefined(opts.limit),
          },
          defaultRuntime,
        );
      });
    });

  tasksCmd
    .command("maintenance")
    .description(t("desc.preview_or_apply_tasks_and_taskflow_maintenance"))
    .option("--json", t("opt.output_as_json"), false)
    .option("--apply", t("opt.apply_reconciliation_cleanup_stamping_and_pruning"), false)
    .action(async (opts, command) => {
      const parentOpts = command.parent?.opts() as { json?: boolean } | undefined;
      await runCommandWithRuntime(defaultRuntime, async () => {
        await tasksMaintenanceCommand(
          {
            json: Boolean(opts.json || parentOpts?.json),
            apply: Boolean(opts.apply),
          },
          defaultRuntime,
        );
      });
    });

  tasksCmd
    .command("show")
    .description(t("desc.show_one_background_task_by_task_id_run_id_or_session_key"))
    .argument("<lookup>", "Task id, run id, or session key")
    .option("--json", t("opt.output_as_json"), false)
    .action(async (lookup, opts, command) => {
      const parentOpts = command.parent?.opts() as { json?: boolean } | undefined;
      await runCommandWithRuntime(defaultRuntime, async () => {
        await tasksShowCommand(
          {
            lookup,
            json: Boolean(opts.json || parentOpts?.json),
          },
          defaultRuntime,
        );
      });
    });

  tasksCmd
    .command("notify")
    .description(t("desc.set_task_notify_policy"))
    .argument("<lookup>", "Task id, run id, or session key")
    .argument("<notify>", "Notify policy (done_only, state_changes, silent)")
    .action(async (lookup, notify) => {
      await runCommandWithRuntime(defaultRuntime, async () => {
        await tasksNotifyCommand(
          {
            lookup,
            notify: notify as "done_only" | "state_changes" | "silent",
          },
          defaultRuntime,
        );
      });
    });

  tasksCmd
    .command("cancel")
    .description(t("desc.cancel_a_running_background_task"))
    .argument("<lookup>", "Task id, run id, or session key")
    .action(async (lookup) => {
      await runCommandWithRuntime(defaultRuntime, async () => {
        await tasksCancelCommand(
          {
            lookup,
          },
          defaultRuntime,
        );
      });
    });

  const tasksFlowCmd = tasksCmd
    .command("flow")
    .description(t("desc.inspect_durable_taskflow_state_under_tasks"));

  tasksFlowCmd
    .command("list")
    .description(t("desc.list_tracked_taskflows"))
    .option("--json", t("opt.output_as_json"), false)
    .option(
      "--status <name>",
      "Filter by status (queued, running, waiting, blocked, succeeded, failed, cancelled, lost)",
    )
    .action(async (opts) => {
      await runCommandWithRuntime(defaultRuntime, async () => {
        await flowsListCommand(
          {
            json: Boolean(opts.json),
            status: opts.status as string | undefined,
          },
          defaultRuntime,
        );
      });
    });

  tasksFlowCmd
    .command("show")
    .description(t("desc.show_one_taskflow_by_flow_id_or_owner_key"))
    .argument("<lookup>", "Flow id or owner key")
    .option("--json", t("opt.output_as_json"), false)
    .action(async (lookup, opts) => {
      await runCommandWithRuntime(defaultRuntime, async () => {
        await flowsShowCommand(
          {
            lookup,
            json: Boolean(opts.json),
          },
          defaultRuntime,
        );
      });
    });

  tasksFlowCmd
    .command("cancel")
    .description(t("desc.cancel_a_running_taskflow"))
    .argument("<lookup>", "Flow id or owner key")
    .action(async (lookup) => {
      await runCommandWithRuntime(defaultRuntime, async () => {
        await flowsCancelCommand(
          {
            lookup,
          },
          defaultRuntime,
        );
      });
    });
}
