import type { Command } from "commander";
import { t } from "../i18n/cli/translate.js";
import { formatDocsLink } from "../terminal/links.js";
import { theme } from "../terminal/theme.js";

type ModelsCliRuntime = typeof import("./models-cli.runtime.js");

async function withModelsRuntime(
  action: (runtime: ModelsCliRuntime) => Promise<void>,
): Promise<void> {
  const runtime = await import("./models-cli.runtime.js");
  return runtime.runModelsCommand(() => action(runtime));
}

export function registerModelsCli(program: Command) {
  const models = program
    .command("models")
    .description(t("desc.model_discovery_scanning_and_configuration"))
    .option("--status-json", t("opt.output_json_alias_for_models_status_json"), false)
    .option("--status-plain", t("opt.plain_output_alias_for_models_status_plain"), false)
    .option("--agent <id>", "Agent id to inspect (overrides AUTOPUS_AGENT_DIR/PI_CODING_AGENT_DIR)")
    .addHelpText(
      "after",
      () =>
        `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/models", "docs.autopus.ai/cli/models")}\n`,
    );

  models
    .command("list")
    .description(t("desc.list_models_configured_by_default"))
    .option("--all", t("opt.show_full_model_catalog"), false)
    .option("--local", t("opt.filter_to_local_models"), false)
    .option("--provider <id>", t("opt.filter_by_provider_id"))
    .option("--json", t("opt.output_json"), false)
    .option("--plain", t("opt.plain_line_output"), false)
    .action(async (opts) => {
      await withModelsRuntime(async ({ defaultRuntime }) => {
        const { modelsListCommand } = await import("../commands/models/list.list-command.js");
        await modelsListCommand(opts, defaultRuntime);
      });
    });

  models
    .command("status")
    .description(t("desc.show_configured_model_state"))
    .option("--json", t("opt.output_json"), false)
    .option("--plain", t("opt.plain_output"), false)
    .option(
      "--check",
      "Exit non-zero if auth is expiring/expired (1=expired/missing, 2=expiring)",
      false,
    )
    .option("--probe", t("opt.probe_configured_provider_auth_live"), false)
    .option("--probe-provider <name>", t("opt.only_probe_a_single_provider"))
    .option(
      "--probe-profile <id>",
      "Only probe specific auth profile ids (repeat or comma-separated)",
      (value, previous) => {
        const next = Array.isArray(previous) ? previous : previous ? [previous] : [];
        next.push(value);
        return next;
      },
    )
    .option("--probe-timeout <ms>", t("opt.per_probe_timeout_in_ms"))
    .option("--probe-concurrency <n>", t("opt.concurrent_probes"))
    .option("--probe-max-tokens <n>", t("opt.probe_max_tokens_best_effort"))
    .option("--agent <id>", "Agent id to inspect (overrides AUTOPUS_AGENT_DIR/PI_CODING_AGENT_DIR)")
    .action(async (opts, command) => {
      await withModelsRuntime(async ({ defaultRuntime, resolveModelAgentOption }) => {
        const agent = resolveModelAgentOption(command, opts);
        const { modelsStatusCommand } = await import("../commands/models/list.status-command.js");
        await modelsStatusCommand(
          {
            json: Boolean(opts.json),
            plain: Boolean(opts.plain),
            check: Boolean(opts.check),
            probe: Boolean(opts.probe),
            probeProvider: opts.probeProvider as string | undefined,
            probeProfile: opts.probeProfile as string | string[] | undefined,
            probeTimeout: opts.probeTimeout as string | undefined,
            probeConcurrency: opts.probeConcurrency as string | undefined,
            probeMaxTokens: opts.probeMaxTokens as string | undefined,
            agent,
          },
          defaultRuntime,
        );
      });
    });

  models
    .command("set")
    .description(t("desc.set_the_default_model"))
    .argument("<model>", "Model id or alias")
    .action(async (model: string, _opts: unknown, command: Command) => {
      const runtime = await import("./models-cli.runtime.js");
      runtime.rejectAgentScopedModelWrite(command, "set");
      await runtime.runModelsCommand(async () => {
        const { modelsSetCommand } = await import("../commands/models/set.js");
        await modelsSetCommand(model, runtime.defaultRuntime);
      });
    });

  models
    .command("set-image")
    .description(t("desc.set_the_image_model"))
    .argument("<model>", "Model id or alias")
    .action(async (model: string, _opts: unknown, command: Command) => {
      const runtime = await import("./models-cli.runtime.js");
      runtime.rejectAgentScopedModelWrite(command, "set-image");
      await runtime.runModelsCommand(async () => {
        const { modelsSetImageCommand } = await import("../commands/models/set-image.js");
        await modelsSetImageCommand(model, runtime.defaultRuntime);
      });
    });

  const aliases = models.command("aliases").description(t("desc.manage_model_aliases"));

  aliases
    .command("list")
    .description(t("desc.list_model_aliases"))
    .option("--json", t("opt.output_json"), false)
    .option("--plain", t("opt.plain_output"), false)
    .action(async (opts) => {
      await withModelsRuntime(async ({ defaultRuntime }) => {
        const { modelsAliasesListCommand } = await import("../commands/models/aliases.js");
        await modelsAliasesListCommand(opts, defaultRuntime);
      });
    });

  aliases
    .command("add")
    .description(t("desc.add_or_update_a_model_alias"))
    .argument("<alias>", "Alias name")
    .argument("<model>", "Model id or alias")
    .action(async (alias: string, model: string) => {
      await withModelsRuntime(async ({ defaultRuntime }) => {
        const { modelsAliasesAddCommand } = await import("../commands/models/aliases.js");
        await modelsAliasesAddCommand(alias, model, defaultRuntime);
      });
    });

  aliases
    .command("remove")
    .description(t("desc.remove_a_model_alias"))
    .argument("<alias>", "Alias name")
    .action(async (alias: string) => {
      await withModelsRuntime(async ({ defaultRuntime }) => {
        const { modelsAliasesRemoveCommand } = await import("../commands/models/aliases.js");
        await modelsAliasesRemoveCommand(alias, defaultRuntime);
      });
    });

  const fallbacks = models.command("fallbacks").description(t("desc.manage_model_fallback_list"));

  fallbacks
    .command("list")
    .description(t("desc.list_fallback_models"))
    .option("--json", t("opt.output_json"), false)
    .option("--plain", t("opt.plain_output"), false)
    .action(async (opts) => {
      await withModelsRuntime(async ({ defaultRuntime }) => {
        const { modelsFallbacksListCommand } = await import("../commands/models/fallbacks.js");
        await modelsFallbacksListCommand(opts, defaultRuntime);
      });
    });

  fallbacks
    .command("add")
    .description(t("desc.add_a_fallback_model"))
    .argument("<model>", "Model id or alias")
    .action(async (model: string) => {
      await withModelsRuntime(async ({ defaultRuntime }) => {
        const { modelsFallbacksAddCommand } = await import("../commands/models/fallbacks.js");
        await modelsFallbacksAddCommand(model, defaultRuntime);
      });
    });

  fallbacks
    .command("remove")
    .description(t("desc.remove_a_fallback_model"))
    .argument("<model>", "Model id or alias")
    .action(async (model: string) => {
      await withModelsRuntime(async ({ defaultRuntime }) => {
        const { modelsFallbacksRemoveCommand } = await import("../commands/models/fallbacks.js");
        await modelsFallbacksRemoveCommand(model, defaultRuntime);
      });
    });

  fallbacks
    .command("clear")
    .description(t("desc.clear_all_fallback_models"))
    .action(async () => {
      await withModelsRuntime(async ({ defaultRuntime }) => {
        const { modelsFallbacksClearCommand } = await import("../commands/models/fallbacks.js");
        await modelsFallbacksClearCommand(defaultRuntime);
      });
    });

  const imageFallbacks = models
    .command("image-fallbacks")
    .description(t("desc.manage_image_model_fallback_list"));

  imageFallbacks
    .command("list")
    .description(t("desc.list_image_fallback_models"))
    .option("--json", t("opt.output_json"), false)
    .option("--plain", t("opt.plain_output"), false)
    .action(async (opts) => {
      await withModelsRuntime(async ({ defaultRuntime }) => {
        const { modelsImageFallbacksListCommand } =
          await import("../commands/models/image-fallbacks.js");
        await modelsImageFallbacksListCommand(opts, defaultRuntime);
      });
    });

  imageFallbacks
    .command("add")
    .description(t("desc.add_an_image_fallback_model"))
    .argument("<model>", "Model id or alias")
    .action(async (model: string) => {
      await withModelsRuntime(async ({ defaultRuntime }) => {
        const { modelsImageFallbacksAddCommand } =
          await import("../commands/models/image-fallbacks.js");
        await modelsImageFallbacksAddCommand(model, defaultRuntime);
      });
    });

  imageFallbacks
    .command("remove")
    .description(t("desc.remove_an_image_fallback_model"))
    .argument("<model>", "Model id or alias")
    .action(async (model: string) => {
      await withModelsRuntime(async ({ defaultRuntime }) => {
        const { modelsImageFallbacksRemoveCommand } =
          await import("../commands/models/image-fallbacks.js");
        await modelsImageFallbacksRemoveCommand(model, defaultRuntime);
      });
    });

  imageFallbacks
    .command("clear")
    .description(t("desc.clear_all_image_fallback_models"))
    .action(async () => {
      await withModelsRuntime(async ({ defaultRuntime }) => {
        const { modelsImageFallbacksClearCommand } =
          await import("../commands/models/image-fallbacks.js");
        await modelsImageFallbacksClearCommand(defaultRuntime);
      });
    });

  models
    .command("scan")
    .description(t("desc.scan_openrouter_free_models_for_tools_images"))
    .option("--min-params <b>", t("opt.minimum_parameter_size_billions"))
    .option("--max-age-days <days>", t("opt.skip_models_older_than_n_days"))
    .option("--provider <name>", t("opt.filter_by_provider_prefix"))
    .option("--max-candidates <n>", t("opt.max_fallback_candidates"), "6")
    .option("--timeout <ms>", t("opt.per_probe_timeout_in_ms"))
    .option("--concurrency <n>", t("opt.probe_concurrency"))
    .option("--no-probe", t("opt.skip_live_probes_list_free_candidates_only"))
    .option("--yes", t("opt.accept_defaults_without_prompting"), false)
    .option("--no-input", t("opt.disable_prompts_use_defaults"))
    .option("--set-default", t("opt.set_agents_defaults_model_to_the_first_selection"), false)
    .option(
      "--set-image",
      t("opt.set_agents_defaults_imagemodel_to_the_first_image_selection"),
      false,
    )
    .option("--json", t("opt.output_json"), false)
    .action(async (opts) => {
      await withModelsRuntime(async ({ defaultRuntime }) => {
        const { modelsScanCommand } = await import("../commands/models/scan.js");
        await modelsScanCommand(opts, defaultRuntime);
      });
    });

  models.action(async (opts) => {
    await withModelsRuntime(async ({ defaultRuntime }) => {
      const { modelsStatusCommand } = await import("../commands/models/list.status-command.js");
      await modelsStatusCommand(
        {
          json: Boolean(opts?.statusJson),
          plain: Boolean(opts?.statusPlain),
          agent: opts?.agent as string | undefined,
        },
        defaultRuntime,
      );
    });
  });

  const auth = models.command("auth").description(t("desc.manage_model_auth_profiles"));
  auth.option("--agent <id>", t("opt.agent_id_for_auth_commands"));
  auth.action(() => {
    auth.help();
  });

  auth
    .command("list")
    .description(t("desc.list_saved_auth_profiles"))
    .option("--provider <id>", t("opt.filter_by_provider_id"))
    .option("--agent <id>", t("opt.agent_id_default_configured_default_agent"))
    .option("--json", t("opt.output_json"), false)
    .action(async (opts, command) => {
      await withModelsRuntime(async ({ defaultRuntime, resolveModelAgentOption }) => {
        const agent = resolveModelAgentOption(command, opts);
        const { modelsAuthListCommand } = await import("../commands/models/auth-list.js");
        await modelsAuthListCommand(
          {
            provider: opts.provider as string | undefined,
            agent,
            json: Boolean(opts.json),
          },
          defaultRuntime,
        );
      });
    });

  auth
    .command("add")
    .description(t("desc.interactive_auth_helper_provider_auth_or_paste_token"))
    .action(async (command) => {
      await withModelsRuntime(async ({ defaultRuntime, resolveModelAgentOption }) => {
        const agent = resolveModelAgentOption(command) ?? resolveModelAgentOption(auth);
        const { modelsAuthAddCommand } = await import("../commands/models/auth.js");
        await modelsAuthAddCommand({ agent }, defaultRuntime);
      });
    });

  auth
    .command("login")
    .description(t("desc.run_a_provider_plugin_auth_flow_oauth_api_key"))
    .option("--provider <id>", t("opt.provider_id_registered_by_a_plugin"))
    .option("--method <id>", t("opt.provider_auth_method_id"))
    .option("--set-default", t("opt.apply_the_provider_s_default_model_recommendation"), false)
    .action(async (opts, command) => {
      await withModelsRuntime(async ({ defaultRuntime, resolveModelAgentOption }) => {
        const agent = resolveModelAgentOption(command);
        const { modelsAuthLoginCommand } = await import("../commands/models/auth.js");
        await modelsAuthLoginCommand(
          {
            provider: opts.provider as string | undefined,
            method: opts.method as string | undefined,
            setDefault: Boolean(opts.setDefault),
            agent,
          },
          defaultRuntime,
        );
      });
    });

  auth
    .command("setup-token")
    .description(t("desc.run_a_provider_cli_to_create_sync_a_token_tty_required"))
    .option("--provider <name>", t("opt.provider_id"))
    .option("--yes", t("opt.skip_confirmation"), false)
    .action(async (opts, command) => {
      await withModelsRuntime(async ({ defaultRuntime, resolveModelAgentOption }) => {
        const agent = resolveModelAgentOption(command);
        const { modelsAuthSetupTokenCommand } = await import("../commands/models/auth.js");
        await modelsAuthSetupTokenCommand(
          {
            provider: opts.provider as string | undefined,
            yes: Boolean(opts.yes),
            agent,
          },
          defaultRuntime,
        );
      });
    });

  auth
    .command("paste-token")
    .description(t("desc.paste_a_token_into_auth_profiles_json_and_update_config"))
    .requiredOption("--provider <name>", "Provider id (e.g. anthropic)")
    .option("--profile-id <id>", t("opt.auth_profile_id_default_provider_manual"))
    .option(
      "--expires-in <duration>",
      "Optional expiry duration (e.g. 365d, 12h). Stored as absolute expiresAt.",
    )
    .action(async (opts, command) => {
      await withModelsRuntime(async ({ defaultRuntime, resolveModelAgentOption }) => {
        const agent = resolveModelAgentOption(command);
        const { modelsAuthPasteTokenCommand } = await import("../commands/models/auth.js");
        await modelsAuthPasteTokenCommand(
          {
            provider: opts.provider as string | undefined,
            profileId: opts.profileId as string | undefined,
            expiresIn: opts.expiresIn as string | undefined,
            agent,
          },
          defaultRuntime,
        );
      });
    });

  auth
    .command("login-github-copilot")
    .description(t("desc.login_to_github_copilot_via_github_device_flow_tty_required"))
    .option("--yes", t("opt.overwrite_existing_profile_without_prompting"), false)
    .action(async (opts, command) => {
      await withModelsRuntime(async ({ defaultRuntime, resolveModelAgentOption }) => {
        const agent = resolveModelAgentOption(command);
        const { modelsAuthLoginCommand } = await import("../commands/models/auth.js");
        await modelsAuthLoginCommand(
          {
            provider: "github-copilot",
            method: "device",
            yes: Boolean(opts.yes),
            agent,
          },
          defaultRuntime,
        );
      });
    });

  const order = auth
    .command("order")
    .description(t("desc.manage_per_agent_auth_profile_order_overrides"));

  order
    .command("get")
    .description(t("desc.show_per_agent_auth_order_override_from_auth_state_json"))
    .requiredOption("--provider <name>", "Provider id (e.g. anthropic)")
    .option("--agent <id>", t("opt.agent_id_default_configured_default_agent"))
    .option("--json", t("opt.output_json"), false)
    .action(async (opts, command) => {
      await withModelsRuntime(async ({ defaultRuntime, resolveModelAgentOption }) => {
        const agent = resolveModelAgentOption(command, opts);
        const { modelsAuthOrderGetCommand } = await import("../commands/models/auth-order.js");
        await modelsAuthOrderGetCommand(
          {
            provider: opts.provider as string,
            agent,
            json: Boolean(opts.json),
          },
          defaultRuntime,
        );
      });
    });

  order
    .command("set")
    .description(t("desc.set_per_agent_auth_order_override_writes_auth_state_json"))
    .requiredOption("--provider <name>", "Provider id (e.g. anthropic)")
    .option("--agent <id>", t("opt.agent_id_default_configured_default_agent"))
    .argument("<profileIds...>", "Auth profile ids (e.g. anthropic:default)")
    .action(async (profileIds: string[], opts, command) => {
      await withModelsRuntime(async ({ defaultRuntime, resolveModelAgentOption }) => {
        const agent = resolveModelAgentOption(command, opts);
        const { modelsAuthOrderSetCommand } = await import("../commands/models/auth-order.js");
        await modelsAuthOrderSetCommand(
          {
            provider: opts.provider as string,
            agent,
            order: profileIds,
          },
          defaultRuntime,
        );
      });
    });

  order
    .command("clear")
    .description(t("desc.clear_per_agent_auth_order_override_fall_back_to_config_round_robin"))
    .requiredOption("--provider <name>", "Provider id (e.g. anthropic)")
    .option("--agent <id>", t("opt.agent_id_default_configured_default_agent"))
    .action(async (opts, command) => {
      await withModelsRuntime(async ({ defaultRuntime, resolveModelAgentOption }) => {
        const agent = resolveModelAgentOption(command, opts);
        const { modelsAuthOrderClearCommand } = await import("../commands/models/auth-order.js");
        await modelsAuthOrderClearCommand(
          {
            provider: opts.provider as string,
            agent,
          },
          defaultRuntime,
        );
      });
    });
}
