import {
  formatDocsLink,
  formatHelpExamples,
  theme,
} from "autopus/plugin-sdk/memory-core-host-runtime-cli";
import type { Command } from "commander";
import { t } from "../../../src/i18n/cli/translate.js";
import type {
  MemoryCommandOptions,
  MemoryPromoteCommandOptions,
  MemoryPromoteExplainOptions,
  MemoryRemBackfillOptions,
  MemoryRemHarnessOptions,
  MemorySearchCommandOptions,
} from "./cli.types.js";
import {
  DEFAULT_PROMOTION_MIN_RECALL_COUNT,
  DEFAULT_PROMOTION_MIN_SCORE,
  DEFAULT_PROMOTION_MIN_UNIQUE_QUERIES,
} from "./short-term-promotion.js";

type MemoryCliRuntime = typeof import("./cli.runtime.js");

let memoryCliRuntimePromise: Promise<MemoryCliRuntime> | null = null;

async function loadMemoryCliRuntime(): Promise<MemoryCliRuntime> {
  memoryCliRuntimePromise ??= import("./cli.runtime.js");
  return await memoryCliRuntimePromise;
}

export async function runMemoryStatus(opts: MemoryCommandOptions) {
  const runtime = await loadMemoryCliRuntime();
  await runtime.runMemoryStatus(opts);
}

async function runMemoryIndex(opts: MemoryCommandOptions) {
  const runtime = await loadMemoryCliRuntime();
  await runtime.runMemoryIndex(opts);
}

async function runMemorySearch(queryArg: string | undefined, opts: MemorySearchCommandOptions) {
  const runtime = await loadMemoryCliRuntime();
  await runtime.runMemorySearch(queryArg, opts);
}

async function runMemoryPromote(opts: MemoryPromoteCommandOptions) {
  const runtime = await loadMemoryCliRuntime();
  await runtime.runMemoryPromote(opts);
}

async function runMemoryPromoteExplain(
  selectorArg: string | undefined,
  opts: MemoryPromoteExplainOptions,
) {
  const runtime = await loadMemoryCliRuntime();
  await runtime.runMemoryPromoteExplain(selectorArg, opts);
}

async function runMemoryRemHarness(opts: MemoryRemHarnessOptions) {
  const runtime = await loadMemoryCliRuntime();
  await runtime.runMemoryRemHarness(opts);
}

async function runMemoryRemBackfill(opts: MemoryRemBackfillOptions) {
  const runtime = await loadMemoryCliRuntime();
  await runtime.runMemoryRemBackfill(opts);
}

export function registerMemoryCli(program: Command) {
  const memory = program
    .command("memory")
    .description(t("desc.search_inspect_and_reindex_memory_files"))
    .addHelpText(
      "after",
      () =>
        `\n${theme.heading("Examples:")}\n${formatHelpExamples([
          ["autopus memory status", "Show index and provider status."],
          [
            "autopus memory status --fix",
            "Repair stale recall locks and normalize promotion metadata.",
          ],
          ["autopus memory status --deep", "Probe embedding provider readiness."],
          ["autopus memory index --force", "Force a full reindex."],
          ['autopus memory search "meeting notes"', "Quick search using positional query."],
          [
            'autopus memory search --query "deployment" --max-results 20',
            "Limit results for focused troubleshooting.",
          ],
          [
            `autopus memory promote --limit 10 --min-score ${DEFAULT_PROMOTION_MIN_SCORE}`,
            "Review weighted short-term candidates for long-term memory.",
          ],
          [
            "autopus memory promote --apply",
            "Append top-ranked short-term candidates into MEMORY.md.",
          ],
          [
            'autopus memory promote-explain "router vlan"',
            "Explain why a specific candidate would or would not promote.",
          ],
          [
            "autopus memory rem-harness --json",
            "Preview REM reflections, candidate truths, and deep promotion output.",
          ],
          [
            "autopus memory rem-backfill --path ./memory",
            "Write grounded historical REM entries into DREAMS.md for UI review.",
          ],
          [
            "autopus memory rem-backfill --path ./memory --stage-short-term",
            "Also seed durable grounded candidates into the live short-term promotion store.",
          ],
          ["autopus memory status --json", "Output machine-readable JSON (good for scripts)."],
        ])}\n\n${theme.muted("Docs:")} ${formatDocsLink("/cli/memory", "docs.autopus.ai/cli/memory")}\n`,
    );

  memory
    .command("status")
    .description(t("desc.show_memory_search_index_status"))
    .option("--agent <id>", t("opt.agent_id_default_default_agent"))
    .option("--json", t("opt.print_json"))
    .option("--deep", t("opt.probe_embedding_provider_availability"))
    .option("--index", t("opt.reindex_if_dirty_implies_deep"))
    .option("--fix", t("opt.repair_stale_recall_locks_and_normalize_promotion_metadata"))
    .option("--verbose", t("opt.verbose_logging"), false)
    .action(async (opts: MemoryCommandOptions & { force?: boolean }) => {
      await runMemoryStatus(opts);
    });

  memory
    .command("index")
    .description(t("desc.reindex_memory_files"))
    .option("--agent <id>", t("opt.agent_id_default_default_agent"))
    .option("--force", t("opt.force_full_reindex"), false)
    .option("--verbose", t("opt.verbose_logging"), false)
    .action(async (opts: MemoryCommandOptions) => {
      await runMemoryIndex(opts);
    });

  memory
    .command("search")
    .description(t("desc.search_memory_files"))
    .argument("[query]", "Search query")
    .option("--query <text>", t("opt.search_query_alternative_to_positional_argument"))
    .option("--agent <id>", t("opt.agent_id_default_default_agent"))
    .option("--max-results <n>", t("opt.max_results"), (value: string) => Number(value))
    .option("--min-score <n>", t("opt.minimum_score"), (value: string) => Number(value))
    .option("--json", t("opt.print_json"))
    .action(async (queryArg: string | undefined, opts: MemorySearchCommandOptions) => {
      await runMemorySearch(queryArg, opts);
    });

  memory
    .command("promote")
    .description(t("desc.rank_short_term_recalls_and_optionally_append_top_entries_to_memory_md"))
    .option("--agent <id>", t("opt.agent_id_default_default_agent"))
    .option("--limit <n>", t("opt.max_candidates"), (value: string) => Number(value))
    .option(
      "--min-score <n>",
      `Minimum weighted score (default: ${DEFAULT_PROMOTION_MIN_SCORE})`,
      (value: string) => Number(value),
    )
    .option(
      "--min-recall-count <n>",
      `Minimum recall count (default: ${DEFAULT_PROMOTION_MIN_RECALL_COUNT})`,
      (value: string) => Number(value),
    )
    .option(
      "--min-unique-queries <n>",
      `Minimum distinct query count (default: ${DEFAULT_PROMOTION_MIN_UNIQUE_QUERIES})`,
      (value: string) => Number(value),
    )
    .option("--apply", t("opt.append_selected_candidates_to_memory_md"), false)
    .option("--include-promoted", t("opt.include_already_promoted_candidates"), false)
    .option("--json", t("opt.print_json"))
    .action(async (opts: MemoryPromoteCommandOptions) => {
      await runMemoryPromote(opts);
    });

  memory
    .command("promote-explain")
    .description(t("desc.explain_a_specific_promotion_candidate_and_its_score_breakdown"))
    .argument("<selector>", "Candidate key, path fragment, or snippet fragment")
    .option("--agent <id>", t("opt.agent_id_default_default_agent"))
    .option("--include-promoted", t("opt.include_already_promoted_candidates"), false)
    .option("--json", t("opt.print_json"))
    .action(async (selectorArg: string | undefined, opts: MemoryPromoteExplainOptions) => {
      await runMemoryPromoteExplain(selectorArg, opts);
    });

  memory
    .command("rem-harness")
    .description(
      t("desc.preview_rem_reflections_candidate_truths_and_deep_promotions_without_writing"),
    )
    .option("--agent <id>", t("opt.agent_id_default_default_agent"))
    .option("--path <file-or-dir>", t("opt.seed_the_harness_from_historical_daily_memory_file_s"))
    .option("--grounded", t("opt.also_render_a_grounded_day_level_rem_preview"))
    .option("--include-promoted", t("opt.include_already_promoted_deep_candidates"), false)
    .option("--json", t("opt.print_json"))
    .action(async (opts: MemoryRemHarnessOptions) => {
      await runMemoryRemHarness(opts);
    });

  memory
    .command("rem-backfill")
    .description(t("desc.write_grounded_historical_rem_summaries_into_dreams_md_for_ui_review"))
    .option("--agent <id>", t("opt.agent_id_default_default_agent"))
    .option("--path <file-or-dir>", t("opt.historical_daily_memory_file_s_or_directory"))
    .option("--rollback", t("opt.remove_previously_written_grounded_rem_backfill_entries"), false)
    .option(
      "--stage-short-term",
      "Also seed grounded durable candidates into the short-term promotion store",
      false,
    )
    .option(
      "--rollback-short-term",
      "Remove previously seeded grounded short-term candidates",
      false,
    )
    .option("--json", t("opt.print_json"))
    .action(async (opts: MemoryRemBackfillOptions) => {
      await runMemoryRemBackfill(opts);
    });

  memory.action(() => {
    memory.outputHelp();
    process.exitCode = 0;
  });
}
