import { t } from "../../i18n/cli/translate.js";
import { defineCommandDescriptorCatalog } from "./command-descriptor-utils.js";
import type { NamedCommandDescriptor } from "./command-group-descriptors.js";

export type CoreCliCommandDescriptor = NamedCommandDescriptor;

const coreCliCommandCatalog = defineCommandDescriptorCatalog([
  {
    name: "crestodian",
    description: t("desc.open_the_interactive_setup_and_repair_assistant"),
    hasSubcommands: false,
  },
  {
    name: "setup",
    description: t("desc.initialize_local_config_and_an_agent_workspace"),
    hasSubcommands: false,
  },
  {
    name: "onboard",
    description: t("desc.interactive_onboarding_for_gateway_workspace_and_skills"),
    hasSubcommands: false,
  },
  {
    name: "configure",
    description: t(
      "desc.interactive_configuration_for_credentials_channels_gateway_and_agent_defaults",
    ),
    hasSubcommands: false,
  },
  {
    name: "config",
    description: t(
      "desc.non_interactive_config_helpers_get_set_unset_file_validate_default_starts_guided",
    ),
    hasSubcommands: true,
  },
  {
    name: "backup",
    description: t("desc.create_and_verify_local_backup_archives_for_autopus_state"),
    hasSubcommands: true,
  },
  {
    name: "migrate",
    description: t("desc.import_state_from_another_agent_system"),
    hasSubcommands: true,
  },
  {
    name: "doctor",
    description: t("desc.diagnose_and_repair_config_gateway_plugin_and_channel_problems"),
    hasSubcommands: false,
  },
  {
    name: "dashboard",
    description: t("desc.open_the_control_ui_with_your_current_token"),
    hasSubcommands: false,
  },
  {
    name: "reset",
    description: t("desc.reset_local_config_state_keeps_the_cli_installed"),
    hasSubcommands: false,
  },
  {
    name: "uninstall",
    description: t("desc.uninstall_the_gateway_service_local_data_cli_remains"),
    hasSubcommands: false,
  },
  {
    name: "message",
    description: t("desc.send_read_and_manage_channel_messages"),
    hasSubcommands: true,
  },
  {
    name: "mcp",
    description: t("desc.manage_autopus_mcp_config_and_channel_bridge"),
    hasSubcommands: true,
    parentDefaultHelp: true,
  },
  {
    name: "agent",
    description: t("desc.run_one_agent_turn_via_the_gateway"),
    hasSubcommands: false,
  },
  {
    name: "agents",
    description: t("desc.manage_isolated_agents_workspaces_auth_routing"),
    hasSubcommands: true,
  },
  {
    name: "status",
    description: t("desc.show_gateway_channel_model_and_recent_session_status"),
    hasSubcommands: false,
  },
  {
    name: "health",
    description: t("desc.fetch_detailed_health_from_the_running_gateway"),
    hasSubcommands: false,
  },
  {
    name: "sessions",
    description: t("desc.list_stored_conversation_sessions"),
    hasSubcommands: true,
  },
  {
    name: "commitments",
    description: t("desc.list_and_manage_inferred_follow_up_commitments"),
    hasSubcommands: true,
  },
  {
    name: "tasks",
    description: t("desc.inspect_durable_background_tasks_and_flows"),
    hasSubcommands: true,
  },
] as const satisfies ReadonlyArray<CoreCliCommandDescriptor>);

export const CORE_CLI_COMMAND_DESCRIPTORS = coreCliCommandCatalog.descriptors;

export function getCoreCliCommandDescriptors(): ReadonlyArray<CoreCliCommandDescriptor> {
  return coreCliCommandCatalog.getDescriptors();
}

export function getCoreCliCommandNames(): string[] {
  return coreCliCommandCatalog.getNames();
}

export function getCoreCliCommandsWithSubcommands(): string[] {
  return coreCliCommandCatalog.getCommandsWithSubcommands();
}

export function getCoreCliParentDefaultHelpCommands(): string[] {
  return coreCliCommandCatalog.getParentDefaultHelpCommands();
}
