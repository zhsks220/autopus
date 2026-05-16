import type { Command } from "commander";
import type { CronDeliveryPreview, CronJob } from "../../cron/types.js";
import { t } from "../../i18n/cli/translate.js";
import { defaultRuntime } from "../../runtime.js";
import { normalizeLowercaseStringOrEmpty } from "../../shared/string-coerce.js";
import type { GatewayRpcOpts } from "../gateway-rpc.js";
import { addGatewayClientOptions, callGatewayFromCli } from "../gateway-rpc.js";
import {
  coerceCronDeliveryPreviews,
  enrichCronJsonWithStatus,
  handleCronCliError,
  printCronJson,
  printCronShow,
  warnIfCronSchedulerDisabled,
} from "./shared.js";

const CRON_SHOW_PAGE_SIZE = 200;

function findCronJobInPage(jobs: CronJob[], idOrName: string): CronJob | undefined {
  const needle = normalizeLowercaseStringOrEmpty(idOrName);
  return jobs.find(
    (job) =>
      normalizeLowercaseStringOrEmpty(job.id) === needle ||
      normalizeLowercaseStringOrEmpty(job.name) === needle,
  );
}

async function loadCronJobForShow(
  opts: GatewayRpcOpts,
  idOrName: string,
): Promise<{ job?: CronJob; deliveryPreview?: CronDeliveryPreview }> {
  let offset = 0;
  for (;;) {
    const res = await callGatewayFromCli("cron.list", opts, {
      includeDisabled: true,
      limit: CRON_SHOW_PAGE_SIZE,
      offset,
    });
    const page = res as {
      jobs?: CronJob[];
      hasMore?: boolean;
      nextOffset?: number | null;
    };
    const jobs = page.jobs ?? [];
    const job = findCronJobInPage(jobs, idOrName);
    if (job) {
      return { job, deliveryPreview: coerceCronDeliveryPreviews(res).get(job.id) };
    }
    if (!page.hasMore || typeof page.nextOffset !== "number") {
      return {};
    }
    offset = page.nextOffset;
  }
}

function registerCronToggleCommand(params: {
  cron: Command;
  name: "enable" | "disable";
  description: string;
  enabled: boolean;
}) {
  addGatewayClientOptions(
    params.cron
      .command(params.name)
      .description(params.description)
      .argument("<id>", "Job id")
      .action(async (id, opts) => {
        try {
          const res = await callGatewayFromCli("cron.update", opts, {
            id,
            patch: { enabled: params.enabled },
          });
          printCronJson(res);
          await warnIfCronSchedulerDisabled(opts);
        } catch (err) {
          handleCronCliError(err);
        }
      }),
  );
}

export function registerCronSimpleCommands(cron: Command) {
  addGatewayClientOptions(
    cron
      .command("rm")
      .alias("remove")
      .alias("delete")
      .description(t("desc.remove_a_cron_job"))
      .argument("<id>", "Job id")
      .option("--json", t("opt.output_json"), false)
      .action(async (id, opts) => {
        try {
          const res = await callGatewayFromCli("cron.remove", opts, { id });
          printCronJson(res);
        } catch (err) {
          handleCronCliError(err);
        }
      }),
  );

  registerCronToggleCommand({
    cron,
    name: "enable",
    description: "Enable a cron job",
    enabled: true,
  });
  registerCronToggleCommand({
    cron,
    name: "disable",
    description: "Disable a cron job",
    enabled: false,
  });

  addGatewayClientOptions(
    cron
      .command("get")
      .description(t("desc.get_a_cron_job_as_json"))
      .argument("<id>", "Job id")
      .action(async (id, opts) => {
        try {
          const res = await callGatewayFromCli("cron.get", opts, { id: String(id) });
          printCronJson(res);
        } catch (err) {
          handleCronCliError(err);
        }
      }),
  );

  addGatewayClientOptions(
    cron
      .command("show")
      .description(t("desc.show_a_cron_job"))
      .argument("<id>", "Job id or exact name")
      .option("--json", t("opt.output_json"), false)
      .action(async (id, opts) => {
        try {
          const { job, deliveryPreview } = await loadCronJobForShow(opts, String(id));
          if (!job) {
            throw new Error(`cron job not found: ${String(id)}`);
          }
          if (opts.json) {
            printCronJson(enrichCronJsonWithStatus(job));
            return;
          }
          printCronShow(job, defaultRuntime, { deliveryPreview });
        } catch (err) {
          handleCronCliError(err);
        }
      }),
  );

  addGatewayClientOptions(
    cron
      .command("runs")
      .description(t("desc.show_cron_run_history_jsonl_backed"))
      .requiredOption("--id <id>", "Job id")
      .option("--limit <n>", t("opt.max_entries_default_50"), "50")
      .action(async (opts) => {
        try {
          const limitRaw = Number.parseInt(String(opts.limit ?? "50"), 10);
          const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? limitRaw : 50;
          const id = String(opts.id);
          const res = await callGatewayFromCli("cron.runs", opts, {
            id,
            limit,
          });
          printCronJson(res);
        } catch (err) {
          handleCronCliError(err);
        }
      }),
  );

  addGatewayClientOptions(
    cron
      .command("run")
      .description(t("desc.run_a_cron_job_now_debug"))
      .argument("<id>", "Job id")
      .option("--due", t("opt.run_only_when_due_default_behavior_in_older_versions"), false)
      .action(async (id, opts, command) => {
        try {
          if (command.getOptionValueSource("timeout") === "default") {
            opts.timeout = "600000";
          }
          const res = await callGatewayFromCli("cron.run", opts, {
            id,
            mode: opts.due ? "due" : "force",
          });
          printCronJson(res);
          const result = res as { ok?: boolean; ran?: boolean; enqueued?: boolean } | undefined;
          defaultRuntime.exit(result?.ok && (result?.ran || result?.enqueued) ? 0 : 1);
        } catch (err) {
          handleCronCliError(err);
        }
      }),
  );
}
