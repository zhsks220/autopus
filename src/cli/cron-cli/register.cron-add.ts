import type { Command } from "commander";
import type { CronJob } from "../../cron/types.js";
import { t } from "../../i18n/cli/translate.js";
import { sanitizeAgentId } from "../../routing/session-key.js";
import { defaultRuntime } from "../../runtime.js";
import {
  normalizeLowercaseStringOrEmpty,
  normalizeOptionalString,
} from "../../shared/string-coerce.js";
import { theme } from "../../terminal/theme.js";
import type { GatewayRpcOpts } from "../gateway-rpc.js";
import { addGatewayClientOptions, callGatewayFromCli } from "../gateway-rpc.js";
import { parsePositiveIntOrUndefined } from "../program/helpers.js";
import { resolveCronCreateSchedule } from "./schedule-options.js";
import {
  getCronChannelOptions,
  coerceCronDeliveryPreviews,
  enrichCronJsonWithStatus,
  handleCronCliError,
  parseCronToolsAllow,
  printCronJson,
  printCronList,
  warnIfCronSchedulerDisabled,
} from "./shared.js";
import { normalizeCronSessionTargetOption, parseCronThreadIdOption } from "./thread-id-shared.js";

export function registerCronStatusCommand(cron: Command) {
  addGatewayClientOptions(
    cron
      .command("status")
      .description(t("desc.show_cron_scheduler_status"))
      .option("--json", t("opt.output_json"), false)
      .action(async (opts) => {
        try {
          const res = await callGatewayFromCli("cron.status", opts, {});
          printCronJson(res);
        } catch (err) {
          handleCronCliError(err);
        }
      }),
  );
}

export function registerCronListCommand(cron: Command) {
  addGatewayClientOptions(
    cron
      .command("list")
      .description(t("desc.list_cron_jobs"))
      .option("--all", t("opt.include_disabled_jobs"), false)
      .option("--agent <id>", t("opt.filter_by_agent_id"))
      .option("--json", t("opt.output_json"), false)
      .action(async (opts) => {
        try {
          const listParams: Record<string, unknown> = {
            includeDisabled: Boolean(opts.all),
          };
          const agentId = normalizeOptionalString(opts.agent);
          if (agentId) {
            listParams.agentId = sanitizeAgentId(agentId);
          }
          const res = await callGatewayFromCli("cron.list", opts, listParams);
          if (opts.json) {
            printCronJson(enrichCronJsonWithStatus(res));
            return;
          }
          const jobs = (res as { jobs?: CronJob[] } | null)?.jobs ?? [];
          const deliveryPreviews = coerceCronDeliveryPreviews(res);
          printCronList(jobs, defaultRuntime, { deliveryPreviews });
        } catch (err) {
          handleCronCliError(err);
        }
      }),
  );
}

export function registerCronAddCommand(cron: Command) {
  addGatewayClientOptions(
    cron
      .command("add")
      .alias("create")
      .description(t("desc.add_a_cron_job"))
      .requiredOption("--name <name>", "Job name")
      .option("--description <text>", t("opt.optional_description"))
      .option("--disabled", t("opt.create_job_disabled"), false)
      .option("--delete-after-run", t("opt.delete_one_shot_job_after_it_succeeds"), false)
      .option("--keep-after-run", t("opt.keep_one_shot_job_after_it_succeeds"), false)
      .option("--agent <id>", t("opt.agent_id_for_this_job"))
      .option("--session <target>", t("opt.session_target_main_isolated"))
      .option(
        "--session-key <key>",
        t("opt.session_key_for_job_routing_e_g_agent_my_agent_my_session"),
      )
      .option("--wake <mode>", t("opt.wake_mode_now_next_heartbeat"), "now")
      .option(
        "--at <when>",
        "Run once at time (ISO with offset, or +duration). Use --tz for offset-less datetimes",
      )
      .option("--every <duration>", t("opt.run_every_duration_e_g_10m_1h"))
      .option("--cron <expr>", t("opt.cron_expression_5_field_or_6_field_with_seconds"))
      .option(
        "--tz <iana>",
        "Timezone for cron expressions (IANA; cron default: Gateway host local timezone)",
        "",
      )
      .option("--stagger <duration>", t("opt.cron_stagger_window_e_g_30s_5m"))
      .option("--exact", t("opt.disable_cron_staggering_set_stagger_to_0"), false)
      .option("--system-event <text>", t("opt.system_event_payload_main_session"))
      .option("--message <text>", t("opt.agent_message_payload"))
      .option(
        "--thinking <level>",
        "Thinking level for agent jobs (off|minimal|low|medium|high|xhigh)",
      )
      .option("--model <model>", t("opt.model_override_for_agent_jobs_provider_model_or_alias"))
      .option("--timeout-seconds <n>", t("opt.timeout_seconds_for_agent_jobs"))
      .option("--light-context", t("opt.use_lightweight_bootstrap_context_for_agent_jobs"), false)
      .option("--tools <list>", t("opt.tool_allow_list_e_g_exec_read_write_or_exec_read_write"))
      .option("--announce", t("opt.fallback_deliver_final_text_to_a_chat"), false)
      .option("--deliver", t("opt.deprecated_use_announce_fallback_delivers_final_text_to_a_chat"))
      .option("--no-deliver", t("opt.disable_runner_fallback_delivery"))
      .option("--channel <channel>", `Delivery channel (${getCronChannelOptions()})`, "last")
      .option(
        "--to <dest>",
        "Delivery destination (E.164, Telegram chatId, or Discord channel/user)",
      )
      .option("--thread-id <id>", t("opt.telegram_forum_topic_thread_id"))
      .option("--account <id>", t("opt.channel_account_id_for_delivery_multi_account_setups"))
      .option("--best-effort-deliver", t("opt.do_not_fail_the_job_if_delivery_fails"), false)
      .option("--json", t("opt.output_json"), false)
      .action(async (opts: GatewayRpcOpts & Record<string, unknown>, cmd?: Command) => {
        try {
          const schedule = resolveCronCreateSchedule({
            at: opts.at,
            cron: opts.cron,
            every: opts.every,
            exact: opts.exact,
            stagger: opts.stagger,
            tz: opts.tz,
          });

          const wakeMode = normalizeOptionalString(opts.wake) ?? "now";
          if (wakeMode !== "now" && wakeMode !== "next-heartbeat") {
            throw new Error("--wake must be now or next-heartbeat");
          }

          const rawAgentId = normalizeOptionalString(opts.agent);
          const agentId = rawAgentId ? sanitizeAgentId(rawAgentId) : undefined;

          const hasAnnounce = Boolean(opts.announce) || opts.deliver === true;
          const hasNoDeliver = opts.deliver === false;
          const deliveryFlagCount = [hasAnnounce, hasNoDeliver].filter(Boolean).length;
          if (deliveryFlagCount > 1) {
            throw new Error("Choose at most one of --announce or --no-deliver");
          }

          const payload = (() => {
            const systemEvent = normalizeOptionalString(opts.systemEvent) ?? "";
            const message = normalizeOptionalString(opts.message) ?? "";
            const chosen = [Boolean(systemEvent), Boolean(message)].filter(Boolean).length;
            if (chosen !== 1) {
              throw new Error("Choose exactly one payload: --system-event or --message");
            }
            if (systemEvent) {
              return { kind: "systemEvent" as const, text: systemEvent };
            }
            const timeoutSeconds = parsePositiveIntOrUndefined(opts.timeoutSeconds);
            return {
              kind: "agentTurn" as const,
              message,
              model: normalizeOptionalString(opts.model),
              thinking: normalizeOptionalString(opts.thinking),
              timeoutSeconds:
                timeoutSeconds && Number.isFinite(timeoutSeconds) ? timeoutSeconds : undefined,
              lightContext: opts.lightContext === true ? true : undefined,
              toolsAllow: parseCronToolsAllow(opts.tools),
            };
          })();

          const optionSource =
            typeof cmd?.getOptionValueSource === "function"
              ? (name: string) => cmd.getOptionValueSource(name)
              : () => undefined;
          const sessionSource = optionSource("session");
          const sessionTargetRaw = normalizeOptionalString(opts.session) ?? "";
          const inferredSessionTarget = payload.kind === "agentTurn" ? "isolated" : "main";
          const sessionTarget =
            sessionSource === "cli"
              ? normalizeCronSessionTargetOption(sessionTargetRaw) || ""
              : inferredSessionTarget;
          const isCustomSessionTarget =
            normalizeLowercaseStringOrEmpty(sessionTarget).startsWith("session:") &&
            Boolean(normalizeOptionalString(sessionTarget.slice(8)));
          const isIsolatedLikeSessionTarget =
            sessionTarget === "isolated" || sessionTarget === "current" || isCustomSessionTarget;
          if (sessionTarget !== "main" && !isIsolatedLikeSessionTarget) {
            throw new Error("--session must be main, isolated, current, or session:<id>");
          }

          if (opts.deleteAfterRun && opts.keepAfterRun) {
            throw new Error("Choose --delete-after-run or --keep-after-run, not both");
          }

          if (sessionTarget === "main" && payload.kind !== "systemEvent") {
            throw new Error("Main jobs require --system-event (systemEvent).");
          }
          if (isIsolatedLikeSessionTarget && payload.kind !== "agentTurn") {
            throw new Error("Isolated/current/custom-session jobs require --message (agentTurn).");
          }
          if (
            (opts.announce || typeof opts.deliver === "boolean") &&
            (!isIsolatedLikeSessionTarget || payload.kind !== "agentTurn")
          ) {
            throw new Error("--announce/--no-deliver require a non-main agentTurn session target.");
          }

          const accountId = normalizeOptionalString(opts.account);
          const threadId = parseCronThreadIdOption(opts.threadId);
          const hasThreadId = typeof threadId === "number";

          if (
            (accountId || hasThreadId) &&
            (!isIsolatedLikeSessionTarget || payload.kind !== "agentTurn")
          ) {
            throw new Error(
              "--account and --thread-id require a non-main agentTurn job with delivery.",
            );
          }

          const deliveryMode =
            isIsolatedLikeSessionTarget && payload.kind === "agentTurn"
              ? hasAnnounce
                ? "announce"
                : hasNoDeliver
                  ? "none"
                  : "announce"
              : undefined;

          const name = normalizeOptionalString(opts.name) ?? "";
          if (!name) {
            throw new Error("Cron job name is required. Pass --name <name>.");
          }

          const description = normalizeOptionalString(opts.description);

          const sessionKey = normalizeOptionalString(opts.sessionKey);

          if (payload.kind === "agentTurn" && !agentId) {
            defaultRuntime.error(
              theme.warn(
                "No --agent specified; the job will run with the configured default agent. " +
                  "Specify --agent to choose a specific agent.",
              ),
            );
          }

          const params = {
            name,
            description,
            enabled: !opts.disabled,
            deleteAfterRun: opts.deleteAfterRun ? true : opts.keepAfterRun ? false : undefined,
            agentId,
            sessionKey,
            schedule,
            sessionTarget,
            wakeMode,
            payload,
            delivery: deliveryMode
              ? {
                  mode: deliveryMode,
                  channel: normalizeOptionalString(opts.channel),
                  to: normalizeOptionalString(opts.to),
                  threadId,
                  accountId,
                  bestEffort: opts.bestEffortDeliver ? true : undefined,
                }
              : undefined,
          };

          const res = await callGatewayFromCli("cron.add", opts, params);
          printCronJson(res);
          await warnIfCronSchedulerDisabled(opts);
        } catch (err) {
          handleCronCliError(err);
        }
      }),
  );
}
