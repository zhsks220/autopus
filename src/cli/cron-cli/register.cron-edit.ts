import type { Command } from "commander";
import type { CronJob } from "../../cron/types.js";
import { danger } from "../../globals.js";
import { t } from "../../i18n/cli/translate.js";
import { sanitizeAgentId } from "../../routing/session-key.js";
import { defaultRuntime } from "../../runtime.js";
import {
  normalizeOptionalLowercaseString,
  normalizeOptionalString,
} from "../../shared/string-coerce.js";
import { addGatewayClientOptions, callGatewayFromCli } from "../gateway-rpc.js";
import {
  applyExistingCronSchedulePatch,
  resolveCronEditScheduleRequest,
} from "./schedule-options.js";
import {
  getCronChannelOptions,
  parseCronToolsAllow,
  parseDurationMs,
  warnIfCronSchedulerDisabled,
} from "./shared.js";
import { normalizeCronSessionTargetOption, parseCronThreadIdOption } from "./thread-id-shared.js";

const CRON_EDIT_LOOKUP_PAGE_SIZE = 200;
const CRON_EDIT_LOOKUP_MAX_PAGES = 50;

const assignIf = (
  target: Record<string, unknown>,
  key: string,
  value: unknown,
  shouldAssign: boolean,
) => {
  if (shouldAssign) {
    target[key] = value;
  }
};

async function loadCronJobForEditSchedulePatch(
  opts: Record<string, unknown>,
  id: string,
): Promise<CronJob | undefined> {
  let offset = 0;
  for (let page = 0; page < CRON_EDIT_LOOKUP_MAX_PAGES; page += 1) {
    const listed = (await callGatewayFromCli("cron.list", opts, {
      includeDisabled: true,
      limit: CRON_EDIT_LOOKUP_PAGE_SIZE,
      offset,
    })) as { jobs?: CronJob[]; hasMore?: boolean; nextOffset?: number | null } | null;
    const existing = (listed?.jobs ?? []).find((job) => job.id === id);
    if (existing) {
      return existing;
    }
    if (!listed?.hasMore || typeof listed.nextOffset !== "number") {
      return undefined;
    }
    if (listed.nextOffset <= offset) {
      throw new Error("cron.list pagination did not advance while looking up cron job");
    }
    offset = listed.nextOffset;
  }
  throw new Error("cron.list pagination exceeded maximum pages while looking up cron job");
}

export function registerCronEditCommand(cron: Command) {
  addGatewayClientOptions(
    cron
      .command("edit")
      .description(t("desc.edit_a_cron_job_patch_fields"))
      .argument("<id>", "Job id")
      .option("--name <name>", t("opt.set_name"))
      .option("--description <text>", t("opt.set_description"))
      .option("--enable", t("opt.enable_job"), false)
      .option("--disable", t("opt.disable_job"), false)
      .option("--delete-after-run", t("opt.delete_one_shot_job_after_it_succeeds"), false)
      .option("--keep-after-run", t("opt.keep_one_shot_job_after_it_succeeds"), false)
      .option("--session <target>", t("opt.session_target_main_isolated"))
      .option("--agent <id>", t("opt.set_agent_id"))
      .option("--clear-agent", t("opt.unset_agent_and_use_default"), false)
      .option("--session-key <key>", t("opt.set_session_key_for_job_routing"))
      .option("--clear-session-key", t("opt.unset_session_key"), false)
      .option("--wake <mode>", t("opt.wake_mode_now_next_heartbeat"))
      .option("--at <when>", t("opt.set_one_shot_time_iso_or_duration_like_20m"))
      .option("--every <duration>", t("opt.set_interval_duration_like_10m"))
      .option("--cron <expr>", t("opt.set_cron_expression"))
      .option(
        "--tz <iana>",
        "Timezone for cron expressions (IANA; cron default: Gateway host local timezone)",
      )
      .option("--stagger <duration>", t("opt.cron_stagger_window_e_g_30s_5m"))
      .option("--exact", t("opt.disable_cron_staggering_set_stagger_to_0"))
      .option("--system-event <text>", t("opt.set_systemevent_payload"))
      .option("--message <text>", t("opt.set_agentturn_payload_message"))
      .option(
        "--thinking <level>",
        "Thinking level for agent jobs (off|minimal|low|medium|high|xhigh)",
      )
      .option("--model <model>", t("opt.model_override_for_agent_jobs"))
      .option("--timeout-seconds <n>", t("opt.timeout_seconds_for_agent_jobs"))
      .option("--light-context", t("opt.enable_lightweight_bootstrap_context_for_agent_jobs"))
      .option("--no-light-context", t("opt.disable_lightweight_bootstrap_context_for_agent_jobs"))
      .option("--tools <list>", t("opt.tool_allow_list_e_g_exec_read_write_or_exec_read_write"))
      .option("--clear-tools", t("opt.remove_tool_allow_list_use_all_tools"), false)
      .option("--announce", t("opt.fallback_deliver_final_text_to_a_chat"))
      .option("--deliver", t("opt.deprecated_use_announce_fallback_delivers_final_text_to_a_chat"))
      .option("--no-deliver", t("opt.disable_runner_fallback_delivery"))
      .option("--channel <channel>", `Delivery channel (${getCronChannelOptions()})`)
      .option(
        "--to <dest>",
        "Delivery destination (E.164, Telegram chatId, or Discord channel/user)",
      )
      .option("--thread-id <id>", t("opt.telegram_forum_topic_thread_id"))
      .option("--account <id>", t("opt.channel_account_id_for_delivery_multi_account_setups"))
      .option("--best-effort-deliver", t("opt.do_not_fail_job_if_delivery_fails"))
      .option("--no-best-effort-deliver", t("opt.fail_job_when_delivery_fails"))
      .option("--failure-alert", t("opt.enable_failure_alerts_for_this_job"))
      .option("--no-failure-alert", t("opt.disable_failure_alerts_for_this_job"))
      .option("--failure-alert-after <n>", t("opt.alert_after_n_consecutive_job_errors"))
      .option(
        "--failure-alert-channel <channel>",
        `Failure alert channel (${getCronChannelOptions()})`,
      )
      .option("--failure-alert-to <dest>", t("opt.failure_alert_destination"))
      .option(
        "--failure-alert-cooldown <duration>",
        t("opt.minimum_time_between_alerts_e_g_1h_30m"),
      )
      .option(
        "--failure-alert-include-skipped",
        t("opt.count_consecutive_skipped_runs_toward_alerts"),
      )
      .option("--failure-alert-exclude-skipped", t("opt.alert_only_on_execution_errors"))
      .option(
        "--failure-alert-mode <mode>",
        t("opt.failure_alert_delivery_mode_announce_or_webhook"),
      )
      .option(
        "--failure-alert-account-id <id>",
        "Account ID for failure alert channel (multi-account setups)",
      )
      .action(async (id, opts) => {
        try {
          const sessionTarget =
            typeof opts.session === "string"
              ? normalizeCronSessionTargetOption(opts.session)
              : undefined;
          if (typeof opts.session === "string" && !sessionTarget) {
            throw new Error("--session must be main, isolated, current, or session:<id>");
          }
          if (sessionTarget === "main" && opts.message) {
            throw new Error(
              "Main jobs cannot use --message; use --system-event or --session isolated.",
            );
          }
          if (
            (sessionTarget === "isolated" ||
              sessionTarget === "current" ||
              sessionTarget?.startsWith("session:")) &&
            opts.systemEvent
          ) {
            throw new Error(
              "Isolated jobs cannot use --system-event; use --message or --session main.",
            );
          }
          if (opts.announce && typeof opts.deliver === "boolean") {
            throw new Error("Choose --announce or --no-deliver (not multiple).");
          }
          const patch: Record<string, unknown> = {};
          if (typeof opts.name === "string") {
            patch.name = opts.name;
          }
          if (typeof opts.description === "string") {
            patch.description = opts.description;
          }
          if (opts.enable && opts.disable) {
            throw new Error("Choose --enable or --disable, not both");
          }
          if (opts.enable) {
            patch.enabled = true;
          }
          if (opts.disable) {
            patch.enabled = false;
          }
          if (opts.deleteAfterRun && opts.keepAfterRun) {
            throw new Error("Choose --delete-after-run or --keep-after-run, not both");
          }
          if (opts.deleteAfterRun) {
            patch.deleteAfterRun = true;
          }
          if (opts.keepAfterRun) {
            patch.deleteAfterRun = false;
          }
          if (typeof opts.session === "string") {
            patch.sessionTarget = sessionTarget;
          }
          if (typeof opts.wake === "string") {
            patch.wakeMode = opts.wake;
          }
          if (opts.agent && opts.clearAgent) {
            throw new Error("Use --agent or --clear-agent, not both");
          }
          if (typeof opts.agent === "string" && opts.agent.trim()) {
            patch.agentId = sanitizeAgentId(opts.agent.trim());
          }
          if (opts.clearAgent) {
            patch.agentId = null;
          }
          if (opts.sessionKey && opts.clearSessionKey) {
            throw new Error("Use --session-key or --clear-session-key, not both");
          }
          if (typeof opts.sessionKey === "string" && opts.sessionKey.trim()) {
            patch.sessionKey = opts.sessionKey.trim();
          }
          if (opts.clearSessionKey) {
            patch.sessionKey = null;
          }

          const scheduleRequest = resolveCronEditScheduleRequest({
            at: opts.at,
            cron: opts.cron,
            every: opts.every,
            exact: opts.exact,
            stagger: opts.stagger,
            tz: opts.tz,
          });
          if (scheduleRequest.kind === "direct") {
            patch.schedule = scheduleRequest.schedule;
          } else if (scheduleRequest.kind === "patch-existing-cron") {
            const existing = await loadCronJobForEditSchedulePatch(opts, String(id));
            if (!existing) {
              throw new Error(`unknown cron job id: ${id}`);
            }
            patch.schedule = applyExistingCronSchedulePatch(existing.schedule, scheduleRequest);
          }

          const hasSystemEventPatch = typeof opts.systemEvent === "string";
          const model = normalizeOptionalString(opts.model);
          const thinking = normalizeOptionalString(opts.thinking);
          const toolsAllow = parseCronToolsAllow(opts.tools);
          const timeoutSeconds = opts.timeoutSeconds
            ? Number.parseInt(String(opts.timeoutSeconds), 10)
            : undefined;
          const hasTimeoutSeconds = Boolean(timeoutSeconds && Number.isFinite(timeoutSeconds));
          const hasDeliveryModeFlag = opts.announce || typeof opts.deliver === "boolean";
          const threadId = parseCronThreadIdOption(opts.threadId);
          const hasDeliveryThreadId = typeof threadId === "number";
          const hasDeliveryTarget =
            typeof opts.channel === "string" || typeof opts.to === "string" || hasDeliveryThreadId;
          const hasDeliveryAccount = typeof opts.account === "string";
          const hasBestEffort = typeof opts.bestEffortDeliver === "boolean";
          const hasAgentTurnPatch =
            typeof opts.message === "string" ||
            Boolean(model) ||
            Boolean(thinking) ||
            hasTimeoutSeconds ||
            typeof opts.lightContext === "boolean" ||
            typeof opts.tools === "string" ||
            Array.isArray(opts.tools) ||
            opts.clearTools ||
            hasDeliveryModeFlag ||
            hasDeliveryTarget ||
            hasDeliveryAccount ||
            hasBestEffort;
          if (hasSystemEventPatch && hasAgentTurnPatch) {
            throw new Error("Choose at most one payload change");
          }
          if (hasSystemEventPatch) {
            patch.payload = {
              kind: "systemEvent",
              text: String(opts.systemEvent),
            };
          } else if (hasAgentTurnPatch) {
            const payload: Record<string, unknown> = { kind: "agentTurn" };
            assignIf(payload, "message", String(opts.message), typeof opts.message === "string");
            assignIf(payload, "model", model, Boolean(model));
            assignIf(payload, "thinking", thinking, Boolean(thinking));
            assignIf(payload, "timeoutSeconds", timeoutSeconds, hasTimeoutSeconds);
            assignIf(
              payload,
              "lightContext",
              opts.lightContext,
              typeof opts.lightContext === "boolean",
            );
            if (opts.clearTools) {
              payload.toolsAllow = null;
            } else if (toolsAllow) {
              payload.toolsAllow = toolsAllow;
            }
            patch.payload = payload;
          }

          if (hasDeliveryModeFlag || hasDeliveryTarget || hasDeliveryAccount || hasBestEffort) {
            const delivery: Record<string, unknown> = {};
            if (hasDeliveryModeFlag) {
              delivery.mode = opts.announce || opts.deliver === true ? "announce" : "none";
            } else if (hasBestEffort) {
              // Back-compat: toggling best-effort alone has historically implied announce mode.
              delivery.mode = "announce";
            }
            if (typeof opts.channel === "string") {
              const channel = opts.channel.trim();
              delivery.channel = channel ? channel : undefined;
            }
            if (typeof opts.to === "string") {
              const to = opts.to.trim();
              delivery.to = to ? to : undefined;
            }
            if (hasDeliveryThreadId) {
              delivery.threadId = threadId;
            }
            if (typeof opts.account === "string") {
              const account = opts.account.trim();
              delivery.accountId = account ? account : undefined;
            }
            if (typeof opts.bestEffortDeliver === "boolean") {
              delivery.bestEffort = opts.bestEffortDeliver;
            }
            patch.delivery = delivery;
          }

          const hasFailureAlertAfter = typeof opts.failureAlertAfter === "string";
          const hasFailureAlertChannel = typeof opts.failureAlertChannel === "string";
          const hasFailureAlertTo = typeof opts.failureAlertTo === "string";
          const hasFailureAlertCooldown = typeof opts.failureAlertCooldown === "string";
          const hasFailureAlertIncludeSkipped =
            typeof opts.failureAlertIncludeSkipped === "boolean";
          const hasFailureAlertExcludeSkipped =
            typeof opts.failureAlertExcludeSkipped === "boolean";
          const hasFailureAlertMode = typeof opts.failureAlertMode === "string";
          const hasFailureAlertAccountId = typeof opts.failureAlertAccountId === "string";
          if (hasFailureAlertIncludeSkipped && hasFailureAlertExcludeSkipped) {
            throw new Error(
              "Use either --failure-alert-include-skipped or --failure-alert-exclude-skipped.",
            );
          }
          const hasFailureAlertFields =
            hasFailureAlertAfter ||
            hasFailureAlertChannel ||
            hasFailureAlertTo ||
            hasFailureAlertCooldown ||
            hasFailureAlertIncludeSkipped ||
            hasFailureAlertExcludeSkipped ||
            hasFailureAlertMode ||
            hasFailureAlertAccountId;
          const failureAlertFlag =
            typeof opts.failureAlert === "boolean" ? opts.failureAlert : undefined;
          if (failureAlertFlag === false && hasFailureAlertFields) {
            throw new Error("Use --no-failure-alert alone (without failure-alert-* options).");
          }
          if (failureAlertFlag === false) {
            patch.failureAlert = false;
          } else if (failureAlertFlag === true || hasFailureAlertFields) {
            const failureAlert: Record<string, unknown> = {};
            if (hasFailureAlertAfter) {
              const after = Number.parseInt(String(opts.failureAlertAfter), 10);
              if (!Number.isFinite(after) || after <= 0) {
                throw new Error("Invalid --failure-alert-after (must be a positive integer).");
              }
              failureAlert.after = after;
            }
            if (hasFailureAlertChannel) {
              failureAlert.channel = normalizeOptionalLowercaseString(opts.failureAlertChannel);
            }
            if (hasFailureAlertTo) {
              const to = normalizeOptionalString(opts.failureAlertTo) ?? "";
              failureAlert.to = to ? to : undefined;
            }
            if (hasFailureAlertCooldown) {
              const cooldownMs = parseDurationMs(String(opts.failureAlertCooldown));
              if (!cooldownMs && cooldownMs !== 0) {
                throw new Error("Invalid --failure-alert-cooldown.");
              }
              failureAlert.cooldownMs = cooldownMs;
            }
            if (hasFailureAlertIncludeSkipped || hasFailureAlertExcludeSkipped) {
              failureAlert.includeSkipped = hasFailureAlertIncludeSkipped;
            }
            if (hasFailureAlertMode) {
              const mode = normalizeOptionalLowercaseString(opts.failureAlertMode);
              if (mode !== "announce" && mode !== "webhook") {
                throw new Error("Invalid --failure-alert-mode (must be 'announce' or 'webhook').");
              }
              failureAlert.mode = mode;
            }
            if (hasFailureAlertAccountId) {
              const accountId = normalizeOptionalString(opts.failureAlertAccountId) ?? "";
              failureAlert.accountId = accountId ? accountId : undefined;
            }
            patch.failureAlert = failureAlert;
          }

          const res = await callGatewayFromCli("cron.update", opts, {
            id,
            patch,
          });
          defaultRuntime.writeJson(res);
          await warnIfCronSchedulerDisabled(opts);
        } catch (err) {
          defaultRuntime.error(danger(String(err)));
          defaultRuntime.exit(1);
        }
      }),
  );
}
