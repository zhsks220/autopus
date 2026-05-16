import type { Command } from "commander";
import { t } from "../i18n/cli/translate.js";
import { formatDocsLink } from "../terminal/links.js";
import { theme } from "../terminal/theme.js";
import type { PluginInspectOptions } from "./plugins-inspect-command.js";
import type { PluginsListOptions } from "./plugins-list-command.js";
import { applyParentDefaultHelpAction } from "./program/parent-default-help.js";

export type PluginUpdateOptions = {
  all?: boolean;
  dryRun?: boolean;
  dangerouslyForceUnsafeInstall?: boolean;
};

export type PluginMarketplaceListOptions = {
  json?: boolean;
};

export type PluginSearchOptions = {
  json?: boolean;
  limit?: number;
};

export type PluginUninstallOptions = {
  keepFiles?: boolean;
  /** @deprecated Use keepFiles. */
  keepConfig?: boolean;
  force?: boolean;
  dryRun?: boolean;
};

export type PluginRegistryOptions = {
  json?: boolean;
  refresh?: boolean;
};

export function registerPluginsCli(program: Command) {
  const plugins = program
    .command("plugins")
    .description(t("desc.manage_autopus_plugins_and_extensions"))
    .addHelpText(
      "after",
      () =>
        `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/plugins", "docs.autopus.ai/cli/plugins")}\n`,
    );

  plugins
    .command("list")
    .description(t("desc.list_discovered_plugins"))
    .option("--json", t("opt.print_json"))
    .option("--enabled", t("opt.only_show_enabled_plugins"), false)
    .option("--verbose", t("opt.show_detailed_entries"), false)
    .action(async (opts: PluginsListOptions) => {
      const { runPluginsListCommand } = await import("./plugins-list-command.js");
      await runPluginsListCommand(opts);
    });

  plugins
    .command("search")
    .description(t("desc.search_clawhub_plugin_packages"))
    .argument("[query...]", "Search query")
    .option("--limit <n>", t("opt.max_results"), (value) => Number.parseInt(value, 10))
    .option("--json", t("opt.print_json"), false)
    .action(async (queryParts: string[], opts: PluginSearchOptions) => {
      const { runPluginsSearchCommand } = await import("./plugins-search-command.js");
      await runPluginsSearchCommand(queryParts, opts);
    });

  plugins
    .command("inspect")
    .alias("info")
    .description(t("desc.inspect_plugin_details"))
    .argument("[id]", "Plugin id")
    .option("--all", t("opt.inspect_all_plugins"))
    .option("--runtime", t("opt.load_plugin_runtime_for_hooks_tools_diagnostics"))
    .option("--json", t("opt.print_json"))
    .action(async (id: string | undefined, opts: PluginInspectOptions) => {
      const { runPluginsInspectCommand } = await import("./plugins-inspect-command.js");
      await runPluginsInspectCommand(id, opts);
    });

  plugins
    .command("enable")
    .description(t("desc.enable_a_plugin_in_config"))
    .argument("<id>", "Plugin id")
    .action(async (id: string) => {
      const { runPluginsEnableCommand } = await import("./plugins-cli.runtime.js");
      await runPluginsEnableCommand(id);
    });

  plugins
    .command("disable")
    .description(t("desc.disable_a_plugin_in_config"))
    .argument("<id>", "Plugin id")
    .action(async (id: string) => {
      const { runPluginsDisableCommand } = await import("./plugins-cli.runtime.js");
      await runPluginsDisableCommand(id);
    });

  plugins
    .command("uninstall")
    .description(t("desc.uninstall_a_plugin"))
    .argument("<id>", "Plugin id")
    .option("--keep-files", t("opt.keep_installed_files_on_disk"), false)
    .option("--keep-config", t("opt.deprecated_alias_for_keep_files"), false)
    .option("--force", t("opt.skip_confirmation_prompt"), false)
    .option("--dry-run", t("opt.show_what_would_be_removed_without_making_changes"), false)
    .action(async (id: string, opts: PluginUninstallOptions) => {
      const { runPluginUninstallCommand } = await import("./plugins-uninstall-command.js");
      await runPluginUninstallCommand(id, opts);
    });

  plugins
    .command("install")
    .description(
      "Install a plugin or hook pack (path, archive, npm spec, git repo, clawhub:package, or marketplace entry)",
    )
    .argument(
      "<path-or-spec-or-plugin>",
      "Path (.ts/.js/.zip/.tgz/.tar.gz), npm package spec, or marketplace plugin name",
    )
    .option("-l, --link", t("opt.link_a_local_path_instead_of_copying"), false)
    .option("--force", t("opt.overwrite_an_existing_installed_plugin_or_hook_pack"), false)
    .option("--pin", t("opt.record_npm_installs_as_exact_resolved_name_version"), false)
    .option(
      "--dangerously-force-unsafe-install",
      "Bypass built-in dangerous-code install blocking (plugin hooks may still block)",
      false,
    )
    .option(
      "--marketplace <source>",
      "Install a Claude marketplace plugin from a local repo/path or git/GitHub source",
    )
    .action(
      async (
        raw: string,
        opts: {
          dangerouslyForceUnsafeInstall?: boolean;
          force?: boolean;
          link?: boolean;
          pin?: boolean;
          marketplace?: string;
        },
      ) => {
        const { runPluginsInstallAction } = await import("./plugins-cli.runtime.js");
        await runPluginsInstallAction(raw, opts);
      },
    );

  plugins
    .command("update")
    .description(t("desc.update_installed_plugins_and_tracked_hook_packs"))
    .argument("[id]", "Plugin or hook-pack id (omit with --all)")
    .option("--all", t("opt.update_all_tracked_plugins_and_hook_packs"), false)
    .option("--dry-run", t("opt.show_what_would_change_without_writing"), false)
    .option(
      "--dangerously-force-unsafe-install",
      "Bypass built-in dangerous-code update blocking for plugins (plugin hooks may still block)",
      false,
    )
    .action(async (id: string | undefined, opts: PluginUpdateOptions) => {
      const { runPluginUpdateCommand } = await import("./plugins-update-command.js");
      await runPluginUpdateCommand({ id, opts });
    });

  plugins
    .command("registry")
    .description(t("desc.inspect_or_rebuild_the_persisted_plugin_registry"))
    .option("--json", t("opt.print_json"))
    .option(
      "--refresh",
      t("opt.rebuild_the_persisted_registry_from_current_plugin_manifests"),
      false,
    )
    .action(async (opts: PluginRegistryOptions) => {
      const { runPluginsRegistryCommand } = await import("./plugins-cli.runtime.js");
      await runPluginsRegistryCommand(opts);
    });

  plugins
    .command("doctor")
    .description(t("desc.report_plugin_load_issues"))
    .action(async () => {
      const { runPluginsDoctorCommand } = await import("./plugins-cli.runtime.js");
      await runPluginsDoctorCommand();
    });

  const marketplace = plugins
    .command("marketplace")
    .description(t("desc.inspect_claude_compatible_plugin_marketplaces"));

  marketplace
    .command("list")
    .description(t("desc.list_plugins_published_by_a_marketplace_source"))
    .argument("<source>", "Local marketplace path/repo or git/GitHub source")
    .option("--json", t("opt.print_json"))
    .action(async (source: string, opts: PluginMarketplaceListOptions) => {
      const { runPluginMarketplaceListCommand } = await import("./plugins-cli.runtime.js");
      await runPluginMarketplaceListCommand(source, opts);
    });

  applyParentDefaultHelpAction(plugins);
}
