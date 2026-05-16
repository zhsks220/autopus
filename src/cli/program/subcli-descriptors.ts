import { t } from "../../i18n/cli/translate.js";
import { defineCommandDescriptorCatalog } from "./command-descriptor-utils.js";
import type { NamedCommandDescriptor } from "./command-group-descriptors.js";
import { isPrivateQaCliEnabled } from "./private-qa-cli.js";

export type SubCliDescriptor = NamedCommandDescriptor;

const subCliCommandCatalog = defineCommandDescriptorCatalog([
  {
    name: "acp",
    description: t("desc.run_and_manage_acp_backed_coding_agents"),
    hasSubcommands: true,
  },
  {
    name: "gateway",
    description: t("desc.run_inspect_and_query_the_autopus_gateway"),
    hasSubcommands: true,
  },
  {
    name: "daemon",
    description: t("desc.manage_the_gateway_service_legacy_alias"),
    hasSubcommands: true,
  },
  {
    name: "logs",
    description: t("desc.tail_gateway_logs_locally_or_via_rpc"),
    hasSubcommands: false,
  },
  {
    name: "system",
    description: t("desc.system_events_heartbeat_and_presence"),
    hasSubcommands: true,
  },
  {
    name: "models",
    description: t("desc.list_scan_and_set_model_providers"),
    hasSubcommands: true,
  },
  {
    name: "infer",
    description: t("desc.run_provider_backed_model_media_search_and_embedding_commands"),
    hasSubcommands: true,
  },
  {
    name: "capability",
    description: t("desc.run_provider_capability_commands_fallback_alias_infer"),
    hasSubcommands: true,
  },
  {
    name: "approvals",
    description: t("desc.manage_exec_approvals_gateway_or_node_host"),
    hasSubcommands: true,
    parentDefaultHelp: true,
  },
  {
    name: "exec-policy",
    description: t("desc.show_or_synchronize_requested_exec_policy_with_host_approvals"),
    hasSubcommands: true,
  },
  {
    name: "nodes",
    description: t("desc.pair_nodes_and_run_node_host_commands_through_the_gateway"),
    hasSubcommands: true,
  },
  {
    name: "devices",
    description: t("desc.device_pairing_token_management"),
    hasSubcommands: true,
    parentDefaultHelp: true,
  },
  {
    name: "node",
    description: t("desc.run_and_manage_the_headless_node_host_service"),
    hasSubcommands: true,
  },
  {
    name: "sandbox",
    description: t("desc.manage_sandbox_containers_for_agent_isolation"),
    hasSubcommands: true,
  },
  {
    name: "tui",
    description: t("desc.open_a_terminal_ui_connected_to_the_gateway"),
    hasSubcommands: false,
  },
  {
    name: "terminal",
    description: t("desc.open_a_local_terminal_ui_alias_for_tui_local"),
    hasSubcommands: false,
  },
  {
    name: "chat",
    description: t("desc.open_a_local_terminal_ui_alias_for_tui_local"),
    hasSubcommands: false,
  },
  {
    name: "cron",
    description: t("desc.schedule_and_inspect_gateway_background_jobs"),
    hasSubcommands: true,
    parentDefaultHelp: true,
  },
  {
    name: "dns",
    description: t("desc.dns_helpers_for_wide_area_discovery_tailscale_coredns"),
    hasSubcommands: true,
  },
  {
    name: "docs",
    description: t("desc.search_the_live_autopus_docs"),
    hasSubcommands: false,
  },
  {
    name: "qa",
    description: t("desc.run_qa_scenarios_and_launch_the_private_qa_debugger_ui"),
    hasSubcommands: true,
  },
  {
    name: "proxy",
    description: t("desc.run_the_autopus_debug_proxy_and_inspect_captured_traffic"),
    hasSubcommands: true,
  },
  {
    name: "hooks",
    description: t("desc.manage_internal_agent_hooks"),
    hasSubcommands: true,
  },
  {
    name: "webhooks",
    description: t("desc.webhook_helpers_and_integrations"),
    hasSubcommands: true,
  },
  {
    name: "qr",
    description: t("desc.generate_mobile_pairing_qr_setup_code"),
    hasSubcommands: false,
  },
  {
    name: "clawbot",
    description: t("desc.legacy_clawbot_command_aliases"),
    hasSubcommands: true,
  },
  {
    name: "pairing",
    description: t("desc.secure_dm_pairing_approve_inbound_requests"),
    hasSubcommands: true,
  },
  {
    name: "plugins",
    description: t("desc.install_enable_disable_and_inspect_plugins"),
    hasSubcommands: true,
    parentDefaultHelp: true,
  },
  {
    name: "channels",
    description: t("desc.add_remove_login_and_inspect_messaging_channels"),
    hasSubcommands: true,
    parentDefaultHelp: true,
  },
  {
    name: "directory",
    description: t(
      "desc.lookup_contact_and_group_ids_self_peers_groups_for_supported_chat_channels",
    ),
    hasSubcommands: true,
  },
  {
    name: "security",
    description: t("desc.security_tools_and_local_config_audits"),
    hasSubcommands: true,
  },
  {
    name: "secrets",
    description: t("desc.audit_apply_and_reload_secretref_backed_credentials"),
    hasSubcommands: true,
  },
  {
    name: "skills",
    description: t("desc.list_inspect_and_install_agent_skills"),
    hasSubcommands: true,
  },
  {
    name: "update",
    description: t("desc.update_autopus_and_inspect_update_channel_status"),
    hasSubcommands: true,
  },
  {
    name: "completion",
    description: t("desc.generate_shell_completion_script"),
    hasSubcommands: false,
  },
] as const satisfies ReadonlyArray<SubCliDescriptor>);

export const SUB_CLI_DESCRIPTORS = subCliCommandCatalog.descriptors;

export function getSubCliEntries(): ReadonlyArray<SubCliDescriptor> {
  const descriptors = subCliCommandCatalog.getDescriptors();
  if (isPrivateQaCliEnabled()) {
    return descriptors;
  }
  return descriptors.filter((descriptor) => descriptor.name !== "qa");
}

export function getSubCliCommandsWithSubcommands(): string[] {
  const commands = subCliCommandCatalog.getCommandsWithSubcommands();
  if (isPrivateQaCliEnabled()) {
    return commands;
  }
  return commands.filter((command) => command !== "qa");
}

export function getSubCliParentDefaultHelpCommands(): string[] {
  const commands = subCliCommandCatalog.getParentDefaultHelpCommands();
  if (isPrivateQaCliEnabled()) {
    return commands;
  }
  return commands.filter((command) => command !== "qa");
}
