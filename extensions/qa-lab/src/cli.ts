import type { Command } from "commander";
import { t } from "../../../src/i18n/cli/translate.js";
import { collectString } from "./cli-options.js";
import { listLiveTransportQaCliRegistrations } from "./live-transports/cli.js";
import { registerMantisCli } from "./mantis/cli.js";
import {
  DEFAULT_QA_LIVE_PROVIDER_MODE,
  formatQaProviderModeHelp,
  listQaStandaloneProviderCommands,
} from "./providers/index.js";
import {
  QA_FRONTIER_PARITY_BASELINE_LABEL,
  QA_FRONTIER_PARITY_CANDIDATE_LABEL,
} from "./providers/live-frontier/parity.js";
import type { QaProviderMode, QaProviderModeInput } from "./run-config.js";
import { hasQaScenarioPack } from "./scenario-catalog.js";

type QaLabCliRuntime = typeof import("./cli.runtime.js");

let qaLabCliRuntimePromise: Promise<QaLabCliRuntime> | null = null;

async function loadQaLabCliRuntime(): Promise<QaLabCliRuntime> {
  qaLabCliRuntimePromise ??= import("./cli.runtime.js");
  return await qaLabCliRuntimePromise;
}

async function runQaSelfCheck(opts: { repoRoot?: string; output?: string }) {
  const runtime = await loadQaLabCliRuntime();
  await runtime.runQaLabSelfCheckCommand(opts);
}

async function runQaSuite(opts: {
  repoRoot?: string;
  outputDir?: string;
  transportId?: string;
  providerMode?: QaProviderModeInput;
  primaryModel?: string;
  alternateModel?: string;
  fastMode?: boolean;
  thinking?: string;
  allowFailures?: boolean;
  enabledPluginIds?: string[];
  cliAuthMode?: string;
  parityPack?: string;
  scenarioIds?: string[];
  concurrency?: number;
  runner?: string;
  image?: string;
  cpus?: number;
  memory?: string;
  disk?: string;
  preflight?: boolean;
}) {
  const runtime = await loadQaLabCliRuntime();
  await runtime.runQaSuiteCommand(opts);
}

async function runQaParityReport(opts: {
  repoRoot?: string;
  candidateSummary: string;
  baselineSummary: string;
  candidateLabel?: string;
  baselineLabel?: string;
  outputDir?: string;
}) {
  const runtime = await loadQaLabCliRuntime();
  await runtime.runQaParityReportCommand(opts);
}

async function runQaCoverageReport(opts: { repoRoot?: string; output?: string; json?: boolean }) {
  const runtime = await loadQaLabCliRuntime();
  await runtime.runQaCoverageReportCommand(opts);
}

async function runQaCharacterEval(opts: {
  repoRoot?: string;
  outputDir?: string;
  model?: string[];
  scenario?: string;
  fast?: boolean;
  thinking?: string;
  modelThinking?: string[];
  judgeModel?: string[];
  judgeTimeoutMs?: number;
  blindJudgeModels?: boolean;
  concurrency?: number;
  judgeConcurrency?: number;
}) {
  const runtime = await loadQaLabCliRuntime();
  await runtime.runQaCharacterEvalCommand(opts);
}

async function runQaManualLane(opts: {
  repoRoot?: string;
  transportId?: string;
  providerMode?: QaProviderModeInput;
  primaryModel?: string;
  alternateModel?: string;
  fastMode?: boolean;
  message: string;
  timeoutMs?: number;
}) {
  const runtime = await loadQaLabCliRuntime();
  await runtime.runQaManualLaneCommand(opts);
}

async function runQaCredentialsAdd(opts: {
  actorId?: string;
  endpointPrefix?: string;
  json?: boolean;
  kind: string;
  note?: string;
  payloadFile: string;
  repoRoot?: string;
  siteUrl?: string;
}) {
  const runtime = await loadQaLabCliRuntime();
  await runtime.runQaCredentialsAddCommand(opts);
}

async function runQaCredentialsRemove(opts: {
  actorId?: string;
  credentialId: string;
  endpointPrefix?: string;
  json?: boolean;
  siteUrl?: string;
}) {
  const runtime = await loadQaLabCliRuntime();
  await runtime.runQaCredentialsRemoveCommand(opts);
}

async function runQaCredentialsList(opts: {
  actorId?: string;
  endpointPrefix?: string;
  json?: boolean;
  kind?: string;
  limit?: number;
  showSecrets?: boolean;
  siteUrl?: string;
  status?: string;
}) {
  const runtime = await loadQaLabCliRuntime();
  await runtime.runQaCredentialsListCommand(opts);
}

async function runQaCredentialsDoctor(opts: {
  actorId?: string;
  endpointPrefix?: string;
  json?: boolean;
  siteUrl?: string;
}) {
  const runtime = await loadQaLabCliRuntime();
  await runtime.runQaCredentialsDoctorCommand(opts);
}

async function runQaUi(opts: {
  repoRoot?: string;
  host?: string;
  port?: number;
  advertiseHost?: string;
  advertisePort?: number;
  controlUiUrl?: string;
  controlUiToken?: string;
  controlUiProxyTarget?: string;
  uiDistDir?: string;
  autoKickoffTarget?: string;
  embeddedGateway?: string;
  sendKickoffOnStart?: boolean;
}) {
  const runtime = await loadQaLabCliRuntime();
  await runtime.runQaLabUiCommand(opts);
}

async function runQaDockerScaffold(opts: {
  repoRoot?: string;
  outputDir: string;
  gatewayPort?: number;
  qaLabPort?: number;
  providerBaseUrl?: string;
  image?: string;
  usePrebuiltImage?: boolean;
  bindUiDist?: boolean;
}) {
  const runtime = await loadQaLabCliRuntime();
  await runtime.runQaDockerScaffoldCommand(opts);
}

async function runQaDockerBuildImage(opts: { repoRoot?: string; image?: string }) {
  const runtime = await loadQaLabCliRuntime();
  await runtime.runQaDockerBuildImageCommand(opts);
}

async function runQaDockerUp(opts: {
  repoRoot?: string;
  outputDir?: string;
  gatewayPort?: number;
  qaLabPort?: number;
  providerBaseUrl?: string;
  image?: string;
  usePrebuiltImage?: boolean;
  bindUiDist?: boolean;
  skipUiBuild?: boolean;
}) {
  const runtime = await loadQaLabCliRuntime();
  await runtime.runQaDockerUpCommand(opts);
}

async function runQaProviderServer(
  providerMode: QaProviderMode,
  opts: { host?: string; port?: number },
) {
  const runtime = await loadQaLabCliRuntime();
  await runtime.runQaProviderServerCommand(providerMode, opts);
}

export function isQaLabCliAvailable(): boolean {
  return hasQaScenarioPack();
}

function assertNoQaSubcommandCollision(qa: Command, commandName: string) {
  if (qa.commands.some((command) => command.name() === commandName)) {
    throw new Error(`QA runner command "${commandName}" conflicts with an existing qa subcommand`);
  }
}

export function registerQaLabCli(program: Command) {
  const qa = program
    .command("qa")
    .description(t("desc.run_private_qa_automation_flows_and_launch_the_qa_debugger"));
  registerMantisCli(qa);

  qa.command("run")
    .description(t("desc.run_the_bundled_qa_self_check_and_write_a_markdown_report"))
    .option(
      "--repo-root <path>",
      t("opt.repository_root_to_target_when_running_from_a_neutral_cwd"),
    )
    .option("--output <path>", t("opt.report_output_path"))
    .action(async (opts: { repoRoot?: string; output?: string }) => {
      await runQaSelfCheck(opts);
    });

  qa.command("suite")
    .description(t("desc.run_repo_backed_qa_scenarios_against_the_qa_gateway_lane"))
    .option(
      "--repo-root <path>",
      t("opt.repository_root_to_target_when_running_from_a_neutral_cwd"),
    )
    .option("--output-dir <path>", t("opt.suite_artifact_directory"))
    .option("--runner <kind>", t("opt.execution_runner_host_or_multipass"), "host")
    .option("--transport <id>", t("opt.qa_transport_id"), "qa-channel")
    .option("--provider-mode <mode>", formatQaProviderModeHelp(), DEFAULT_QA_LIVE_PROVIDER_MODE)
    .option("--model <ref>", t("opt.primary_provider_model_ref"))
    .option("--alt-model <ref>", t("opt.alternate_provider_model_ref"))
    .option(
      "--cli-auth-mode <mode>",
      "CLI backend auth mode for live Claude CLI runs: auto, api-key, or subscription",
    )
    .option("--parity-pack <name>", 'Preset scenario pack; currently only "agentic" is supported')
    .option(
      "--scenario <id>",
      t("opt.run_only_the_named_qa_scenario_repeatable"),
      collectString,
      [],
    )
    .option(
      "--enable-plugin <id>",
      "Enable an extra bundled plugin in the QA gateway config (repeatable)",
      collectString,
      [],
    )
    .option("--concurrency <count>", t("opt.scenario_worker_concurrency"), (value: string) =>
      Number(value),
    )
    .option("--preflight", t("opt.run_a_single_scenario_bootstrap_preflight_and_stop"), false)
    .option(
      "--allow-failures",
      "Write artifacts without setting a failing exit code when scenarios fail",
      false,
    )
    .option("--fast", t("opt.enable_provider_fast_mode_where_supported"), false)
    .option(
      "--thinking <level>",
      "Suite thinking default: off|minimal|low|medium|high|xhigh|adaptive|max",
    )
    .option("--image <alias>", t("opt.multipass_image_alias"))
    .option("--cpus <count>", t("opt.multipass_vcpu_count"), (value: string) => Number(value))
    .option("--memory <size>", t("opt.multipass_memory_size"))
    .option("--disk <size>", t("opt.multipass_disk_size"))
    .action(
      async (opts: {
        repoRoot?: string;
        outputDir?: string;
        transport?: string;
        runner?: string;
        providerMode?: QaProviderModeInput;
        model?: string;
        altModel?: string;
        cliAuthMode?: string;
        parityPack?: string;
        scenario?: string[];
        enablePlugin?: string[];
        concurrency?: number;
        allowFailures?: boolean;
        fast?: boolean;
        thinking?: string;
        image?: string;
        cpus?: number;
        memory?: string;
        disk?: string;
        preflight?: boolean;
      }) => {
        await runQaSuite({
          repoRoot: opts.repoRoot,
          outputDir: opts.outputDir,
          transportId: opts.transport,
          runner: opts.runner,
          providerMode: opts.providerMode,
          primaryModel: opts.model,
          alternateModel: opts.altModel,
          fastMode: opts.fast,
          thinking: opts.thinking,
          cliAuthMode: opts.cliAuthMode,
          parityPack: opts.parityPack,
          scenarioIds: opts.scenario,
          enabledPluginIds: opts.enablePlugin,
          concurrency: opts.concurrency,
          allowFailures: opts.allowFailures,
          image: opts.image,
          cpus: opts.cpus,
          memory: opts.memory,
          disk: opts.disk,
          preflight: opts.preflight,
        });
      },
    );

  qa.command("parity-report")
    .description(t("desc.compare_two_qa_suite_summaries_and_write_an_agentic_parity_gate_report"))
    .requiredOption("--candidate-summary <path>", "Candidate qa-suite-summary.json path")
    .requiredOption("--baseline-summary <path>", "Baseline qa-suite-summary.json path")
    .option(
      "--repo-root <path>",
      t("opt.repository_root_to_target_when_running_from_a_neutral_cwd"),
    )
    .option(
      "--candidate-label <label>",
      "Candidate display label",
      QA_FRONTIER_PARITY_CANDIDATE_LABEL,
    )
    .option(
      "--baseline-label <label>",
      t("opt.baseline_display_label"),
      QA_FRONTIER_PARITY_BASELINE_LABEL,
    )
    .option("--output-dir <path>", t("opt.artifact_directory_for_the_parity_report"))
    .action(
      async (opts: {
        repoRoot?: string;
        candidateSummary: string;
        baselineSummary: string;
        candidateLabel?: string;
        baselineLabel?: string;
        outputDir?: string;
      }) => {
        await runQaParityReport(opts);
      },
    );

  qa.command("coverage")
    .description(t("desc.print_the_markdown_scenario_coverage_inventory"))
    .option("--repo-root <path>", t("opt.repository_root_to_target_when_writing_output"))
    .option("--output <path>", t("opt.write_the_coverage_inventory_to_this_path"))
    .option("--json", t("opt.print_json_instead_of_markdown"), false)
    .action(async (opts: { repoRoot?: string; output?: string; json?: boolean }) => {
      await runQaCoverageReport(opts);
    });

  qa.command("character-eval")
    .description(
      t("desc.run_the_character_qa_scenario_across_live_models_and_write_a_judged_report"),
    )
    .option(
      "--repo-root <path>",
      t("opt.repository_root_to_target_when_running_from_a_neutral_cwd"),
    )
    .option("--output-dir <path>", t("opt.character_eval_artifact_directory"))
    .option(
      "--model <ref[,option]>",
      "Provider/model ref to evaluate; options: thinking=<level>, fast, no-fast, fast=<bool>",
      collectString,
      [],
    )
    .option("--scenario <id>", t("opt.character_scenario_id"), "character-vibes-gollum")
    .option("--fast", t("opt.enable_provider_fast_mode_for_all_candidate_runs"))
    .option(
      "--thinking <level>",
      "Candidate thinking default: off|minimal|low|medium|high|xhigh|adaptive|max",
    )
    .option(
      "--model-thinking <ref=level>",
      "Deprecated: candidate thinking override for one model ref (repeatable)",
      collectString,
      [],
    )
    .option(
      "--judge-model <ref[,option]>",
      "Judge provider/model ref; options: thinking=<level>, fast, no-fast, fast=<bool> (repeatable)",
      collectString,
      [],
    )
    .option("--judge-timeout-ms <ms>", t("opt.override_judge_wait_timeout"), (value: string) =>
      Number(value),
    )
    .option(
      "--blind-judge-models",
      "Hide candidate model refs from judge prompts; reports still map rankings back to real refs",
    )
    .option("--concurrency <count>", t("opt.candidate_model_run_concurrency"), (value: string) =>
      Number(value),
    )
    .option("--judge-concurrency <count>", t("opt.judge_model_run_concurrency"), (value: string) =>
      Number(value),
    )
    .action(
      async (opts: {
        repoRoot?: string;
        outputDir?: string;
        model?: string[];
        scenario?: string;
        fast?: boolean;
        thinking?: string;
        modelThinking?: string[];
        judgeModel?: string[];
        judgeTimeoutMs?: number;
        blindJudgeModels?: boolean;
        concurrency?: number;
        judgeConcurrency?: number;
      }) => {
        await runQaCharacterEval(opts);
      },
    );

  qa.command("manual")
    .description(t("desc.run_a_one_off_qa_agent_prompt_against_the_selected_provider_model_lane"))
    .requiredOption("--message <text>", "Prompt to send to the QA agent")
    .option(
      "--repo-root <path>",
      t("opt.repository_root_to_target_when_running_from_a_neutral_cwd"),
    )
    .option("--transport <id>", t("opt.qa_transport_id"), "qa-channel")
    .option("--provider-mode <mode>", formatQaProviderModeHelp(), DEFAULT_QA_LIVE_PROVIDER_MODE)
    .option("--model <ref>", t("opt.primary_provider_model_ref_defaults_by_provider_mode"))
    .option("--alt-model <ref>", t("opt.alternate_provider_model_ref"))
    .option("--fast", t("opt.enable_provider_fast_mode_where_supported"), false)
    .option("--timeout-ms <ms>", t("opt.override_agent_wait_timeout"), (value: string) =>
      Number(value),
    )
    .action(
      async (opts: {
        message: string;
        repoRoot?: string;
        transport?: string;
        providerMode?: QaProviderModeInput;
        model?: string;
        altModel?: string;
        fast?: boolean;
        timeoutMs?: number;
      }) => {
        await runQaManualLane({
          repoRoot: opts.repoRoot,
          transportId: opts.transport,
          providerMode: opts.providerMode,
          primaryModel: opts.model,
          alternateModel: opts.altModel,
          fastMode: opts.fast,
          message: opts.message,
          timeoutMs: opts.timeoutMs,
        });
      },
    );

  const credentials = qa
    .command("credentials")
    .description(t("desc.manage_pooled_convex_live_credentials_used_by_qa_lanes"));

  credentials
    .command("doctor")
    .description(t("desc.check_convex_credential_broker_env_and_admin_reachability"))
    .option("--site-url <url>", t("opt.override_autopus_qa_convex_site_url"))
    .option("--endpoint-prefix <path>", t("opt.override_autopus_qa_convex_endpoint_prefix"))
    .option("--actor-id <id>", t("opt.optional_admin_actor_id_to_include_in_broker_audit_events"))
    .option("--json", t("opt.emit_machine_readable_json_output"), false)
    .action(
      async (opts: {
        siteUrl?: string;
        endpointPrefix?: string;
        actorId?: string;
        json?: boolean;
      }) => {
        await runQaCredentialsDoctor(opts);
      },
    );

  credentials
    .command("add")
    .description(t("desc.add_one_credential_payload_to_the_shared_pool"))
    .requiredOption("--kind <kind>", "Credential kind (for Telegram v1, use telegram)")
    .requiredOption("--payload-file <path>", "JSON object file containing the credential payload")
    .option(
      "--repo-root <path>",
      t("opt.repository_root_for_resolving_relative_payload_file_paths"),
    )
    .option("--note <text>", t("opt.optional_note_stored_with_this_credential_row"))
    .option("--site-url <url>", t("opt.override_autopus_qa_convex_site_url"))
    .option("--endpoint-prefix <path>", t("opt.override_autopus_qa_convex_endpoint_prefix"))
    .option("--actor-id <id>", t("opt.optional_admin_actor_id_to_include_in_broker_audit_events"))
    .option("--json", t("opt.emit_machine_readable_json_output"), false)
    .action(
      async (opts: {
        kind: string;
        payloadFile: string;
        repoRoot?: string;
        note?: string;
        siteUrl?: string;
        endpointPrefix?: string;
        actorId?: string;
        json?: boolean;
      }) => {
        await runQaCredentialsAdd(opts);
      },
    );

  credentials
    .command("remove")
    .description(t("desc.remove_one_credential_from_active_use_by_disabling_it"))
    .requiredOption("--credential-id <id>", "Credential row id from the Convex pool")
    .option("--site-url <url>", t("opt.override_autopus_qa_convex_site_url"))
    .option("--endpoint-prefix <path>", t("opt.override_autopus_qa_convex_endpoint_prefix"))
    .option("--actor-id <id>", t("opt.optional_admin_actor_id_to_include_in_broker_audit_events"))
    .option("--json", t("opt.emit_machine_readable_json_output"), false)
    .action(
      async (opts: {
        credentialId: string;
        siteUrl?: string;
        endpointPrefix?: string;
        actorId?: string;
        json?: boolean;
      }) => {
        await runQaCredentialsRemove(opts);
      },
    );

  credentials
    .command("list")
    .description(t("desc.list_credential_rows_in_the_shared_convex_pool"))
    .option("--kind <kind>", t("opt.filter_by_credential_kind"))
    .option("--status <status>", 'Filter by row status: "active", "disabled", or "all"', "all")
    .option("--limit <count>", t("opt.max_rows_to_return"), (value: string) => Number(value))
    .option("--show-secrets", t("opt.include_credential_payload_json_in_output"), false)
    .option("--site-url <url>", t("opt.override_autopus_qa_convex_site_url"))
    .option("--endpoint-prefix <path>", t("opt.override_autopus_qa_convex_endpoint_prefix"))
    .option("--actor-id <id>", t("opt.optional_admin_actor_id_to_include_in_broker_audit_events"))
    .option("--json", t("opt.emit_machine_readable_json_output"), false)
    .action(
      async (opts: {
        kind?: string;
        status?: string;
        limit?: number;
        showSecrets?: boolean;
        siteUrl?: string;
        endpointPrefix?: string;
        actorId?: string;
        json?: boolean;
      }) => {
        await runQaCredentialsList(opts);
      },
    );

  qa.command("ui")
    .description(t("desc.start_the_private_qa_debugger_ui_and_local_qa_bus"))
    .option(
      "--repo-root <path>",
      t("opt.repository_root_to_target_when_running_from_a_neutral_cwd"),
    )
    .option("--host <host>", t("opt.bind_host"), "127.0.0.1")
    .option("--port <port>", t("opt.bind_port"), (value: string) => Number(value))
    .option(
      "--advertise-host <host>",
      t("opt.optional_public_host_to_advertise_in_bootstrap_payloads"),
    )
    .option(
      "--advertise-port <port>",
      t("opt.optional_public_port_to_advertise"),
      (value: string) => Number(value),
    )
    .option("--control-ui-url <url>", t("opt.optional_control_ui_url_to_embed_beside_the_qa_panel"))
    .option("--control-ui-token <token>", t("opt.optional_control_ui_token_for_embedded_links"))
    .option(
      "--control-ui-proxy-target <url>",
      "Optional upstream Control UI target for /control-ui proxying",
    )
    .option("--ui-dist-dir <path>", t("opt.optional_qa_lab_ui_asset_directory_override"))
    .option("--auto-kickoff-target <kind>", t("opt.kickoff_default_target_direct_or_channel"))
    .option("--embedded-gateway <mode>", t("opt.embedded_gateway_mode_hint"), "enabled")
    .option(
      "--send-kickoff-on-start",
      "Inject the repo-backed kickoff task when the UI starts",
      false,
    )
    .action(
      async (opts: {
        repoRoot?: string;
        host?: string;
        port?: number;
        advertiseHost?: string;
        advertisePort?: number;
        controlUiUrl?: string;
        controlUiToken?: string;
        controlUiProxyTarget?: string;
        uiDistDir?: string;
        autoKickoffTarget?: string;
        embeddedGateway?: string;
        sendKickoffOnStart?: boolean;
      }) => {
        await runQaUi(opts);
      },
    );

  qa.command("docker-scaffold")
    .description(t("desc.write_a_prebaked_docker_scaffold_for_the_qa_dashboard_gateway_lane"))
    .option(
      "--repo-root <path>",
      t("opt.repository_root_to_target_when_running_from_a_neutral_cwd"),
    )
    .requiredOption("--output-dir <path>", "Output directory for docker-compose + state files")
    .option("--gateway-port <port>", t("opt.gateway_host_port"), (value: string) => Number(value))
    .option("--qa-lab-port <port>", t("opt.qa_lab_host_port"), (value: string) => Number(value))
    .option("--provider-base-url <url>", t("opt.provider_base_url_for_the_qa_gateway"))
    .option("--image <name>", t("opt.prebaked_image_name"), "autopus:qa-local-prebaked")
    .option("--use-prebuilt-image", t("opt.use_image_instead_of_build_in_docker_compose"), false)
    .option(
      "--bind-ui-dist",
      "Bind-mount extensions/qa-lab/web/dist into the qa-lab container for faster UI refresh",
      false,
    )
    .action(
      async (opts: {
        repoRoot?: string;
        outputDir: string;
        gatewayPort?: number;
        qaLabPort?: number;
        providerBaseUrl?: string;
        image?: string;
        usePrebuiltImage?: boolean;
        bindUiDist?: boolean;
      }) => {
        await runQaDockerScaffold(opts);
      },
    );

  qa.command("docker-build-image")
    .description(t("desc.build_the_prebaked_qa_docker_image_with_qa_channel_qa_lab_bundled"))
    .option(
      "--repo-root <path>",
      t("opt.repository_root_to_target_when_running_from_a_neutral_cwd"),
    )
    .option("--image <name>", t("opt.image_tag"), "autopus:qa-local-prebaked")
    .action(async (opts: { repoRoot?: string; image?: string }) => {
      await runQaDockerBuildImage(opts);
    });

  qa.command("up")
    .description(
      t("desc.build_the_qa_site_start_the_docker_backed_qa_stack_and_print_the_qa_lab_url"),
    )
    .option(
      "--repo-root <path>",
      t("opt.repository_root_to_target_when_running_from_a_neutral_cwd"),
    )
    .option("--output-dir <path>", t("opt.output_directory_for_docker_compose_state_files"))
    .option("--gateway-port <port>", t("opt.gateway_host_port"), (value: string) => Number(value))
    .option("--qa-lab-port <port>", t("opt.qa_lab_host_port"), (value: string) => Number(value))
    .option("--provider-base-url <url>", t("opt.provider_base_url_for_the_qa_gateway"))
    .option("--image <name>", t("opt.image_tag"), "autopus:qa-local-prebaked")
    .option("--use-prebuilt-image", t("opt.use_image_instead_of_build_in_docker_compose"), false)
    .option(
      "--bind-ui-dist",
      "Bind-mount extensions/qa-lab/web/dist into the qa-lab container for faster UI refresh",
      false,
    )
    .option("--skip-ui-build", t("opt.skip_pnpm_qa_lab_build_before_starting_docker"), false)
    .action(
      async (opts: {
        repoRoot?: string;
        outputDir?: string;
        gatewayPort?: number;
        qaLabPort?: number;
        providerBaseUrl?: string;
        image?: string;
        usePrebuiltImage?: boolean;
        bindUiDist?: boolean;
        skipUiBuild?: boolean;
      }) => {
        await runQaDockerUp(opts);
      },
    );

  for (const providerCommand of listQaStandaloneProviderCommands()) {
    qa.command(providerCommand.name)
      .description(providerCommand.description)
      .option("--host <host>", t("opt.bind_host"), "127.0.0.1")
      .option("--port <port>", t("opt.bind_port"), (value: string) => Number(value))
      .action(async (opts: { host?: string; port?: number }) => {
        await runQaProviderServer(providerCommand.providerMode, opts);
      });
  }

  for (const lane of listLiveTransportQaCliRegistrations()) {
    assertNoQaSubcommandCollision(qa, lane.commandName);
    lane.register(qa);
  }
}
