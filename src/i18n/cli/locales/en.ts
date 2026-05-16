/**
 * 영어 CLI 메시지 (source-of-truth).
 *
 * 새 키를 추가할 때는 ko.ts 에도 동일한 키 구조로 추가해야 한다.
 * 본 파일의 'desc' / 'opt' 트리는 광역 적용 스크립트로 자동 생성된 영역이므로
 * 수동 수정 시 generator 와 충돌하지 않도록 주의.
 */
import type { CliMessageTree } from "../types.js";

export const en = {
  desc: {
    run_an_acp_bridge_backed_by_the_gateway: "Run an ACP bridge backed by the Gateway",
    run_an_interactive_acp_client_against_the_local_acp_bridge:
      "Run an interactive ACP client against the local ACP bridge",
    list_canonical_capability_ids_and_supported_transports:
      "List canonical capability ids and supported transports",
    inspect_one_canonical_capability_id: "Inspect one canonical capability id",
    run_provider_backed_inference_commands_through_a_stable_cli_surface:
      "Run provider-backed inference commands through a stable CLI surface",
    text_inference_and_model_catalog_commands: "Text inference and model catalog commands",
    run_a_one_shot_model_turn: "Run a one-shot model turn",
    list_known_models: "List known models",
    inspect_one_model_catalog_entry: "Inspect one model catalog entry",
    list_model_providers_from_the_catalog: "List model providers from the catalog",
    provider_auth_helpers: "Provider auth helpers",
    run_provider_auth_login: "Run provider auth login",
    remove_saved_auth_profiles_for_one_provider: "Remove saved auth profiles for one provider",
    show_configured_auth_state: "Show configured auth state",
    image_generation_and_description: "Image generation and description",
    generate_images: "Generate images",
    edit_images_with_one_or_more_input_files: "Edit images with one or more input files",
    describe_one_image_file: "Describe one image file",
    describe_multiple_image_files: "Describe multiple image files",
    list_image_generation_providers: "List image generation providers",
    audio_transcription: "Audio transcription",
    transcribe_one_audio_file: "Transcribe one audio file",
    list_audio_transcription_providers: "List audio transcription providers",
    text_to_speech: "Text to speech",
    convert_text_to_speech: "Convert text to speech",
    list_voices_for_a_tts_provider: "List voices for a TTS provider",
    list_speech_providers: "List speech providers",
    list_tts_personas: "List TTS personas",
    show_tts_status: "Show TTS status",
    set_the_active_tts_provider: "Set the active TTS provider",
    set_the_active_tts_persona: "Set the active TTS persona",
    video_generation_and_description: "Video generation and description",
    generate_video: "Generate video",
    describe_one_video_file: "Describe one video file",
    list_video_generation_and_description_providers:
      "List video generation and description providers",
    web_capabilities: "Web capabilities",
    run_web_search: "Run web search",
    fetch_one_url: "Fetch one URL",
    list_web_providers: "List web providers",
    embedding_providers: "Embedding providers",
    create_embeddings: "Create embeddings",
    list_embedding_providers: "List embedding providers",
    manage_connected_chat_channels_and_accounts: "Manage connected chat channels and accounts",
    list_chat_channels_configured_by_default_pass_all_for_installable_catalog:
      "List chat channels (configured by default; pass --all for installable catalog)",
    show_gateway_channel_status_use_status_deep_for_local:
      "Show gateway channel status (use status --deep for local)",
    show_provider_capabilities_intents_scopes_supported_features:
      "Show provider capabilities (intents/scopes + supported features)",
    resolve_channel_user_names_to_ids: "Resolve channel/user names to IDs",
    show_recent_channel_logs_from_the_gateway_log_file:
      "Show recent channel logs from the gateway log file",
    add_or_update_a_channel_account: "Add or update a channel account",
    disable_or_delete_a_channel_account: "Disable or delete a channel account",
    link_a_channel_account_if_supported: "Link a channel account (if supported)",
    log_out_of_a_channel_session_if_supported: "Log out of a channel session (if supported)",
    legacy_clawbot_command_aliases: "Legacy clawbot command aliases",
    generate_shell_completion_script: "Generate shell completion script",
    get_a_config_value_by_dot_path: "Get a config value by dot path",
    remove_a_config_value_by_dot_path: "Remove a config value by dot path",
    print_the_active_config_file_path: "Print the active config file path",
    print_the_json_schema_for_autopus_json: "Print the JSON schema for autopus.json",
    validate_the_current_config_against_the_schema_without_starting_the_gateway:
      "Validate the current config against the schema without starting the gateway",
    show_cron_scheduler_status: "Show cron scheduler status",
    list_cron_jobs: "List cron jobs",
    add_a_cron_job: "Add a cron job",
    edit_a_cron_job_patch_fields: "Edit a cron job (patch fields)",
    remove_a_cron_job: "Remove a cron job",
    get_a_cron_job_as_json: "Get a cron job as JSON",
    show_a_cron_job: "Show a cron job",
    show_cron_run_history_jsonl_backed: "Show cron run history (JSONL-backed)",
    run_a_cron_job_now_debug: "Run a cron job now (debug)",
    manage_cron_jobs_via_gateway: "Manage cron jobs (via Gateway)",
    install_the_gateway_service_launchd_systemd_schtasks:
      "Install the Gateway service (launchd/systemd/schtasks)",
    uninstall_the_gateway_service_launchd_systemd_schtasks:
      "Uninstall the Gateway service (launchd/systemd/schtasks)",
    start_the_gateway_service_launchd_systemd_schtasks:
      "Start the Gateway service (launchd/systemd/schtasks)",
    stop_the_gateway_service_launchd_systemd_schtasks:
      "Stop the Gateway service (launchd/systemd/schtasks)",
    restart_the_gateway_service_launchd_systemd_schtasks:
      "Restart the Gateway service (launchd/systemd/schtasks)",
    manage_the_gateway_service_launchd_systemd_schtasks:
      "Manage the Gateway service (launchd/systemd/schtasks)",
    device_pairing_and_auth_tokens: "Device pairing and auth tokens",
    list_pending_and_paired_devices: "List pending and paired devices",
    remove_a_paired_device_entry: "Remove a paired device entry",
    clear_paired_devices_from_the_gateway_table: "Clear paired devices from the gateway table",
    approve_a_pending_device_pairing_request: "Approve a pending device pairing request",
    reject_a_pending_device_pairing_request: "Reject a pending device pairing request",
    rotate_a_device_token_for_a_role: "Rotate a device token for a role",
    revoke_a_device_token_for_a_role: "Revoke a device token for a role",
    lookup_contact_and_group_ids_self_peers_groups_for_supported_chat_channels:
      "Lookup contact and group IDs (self, peers, groups) for supported chat channels",
    show_the_current_account_user: "Show the current account user",
    peer_directory_contacts_users: "Peer directory (contacts/users)",
    list_peers: "List peers",
    group_directory: "Group directory",
    list_groups: "List groups",
    list_group_members: "List group members",
    dns_helpers_for_wide_area_discovery_tailscale_coredns:
      "DNS helpers for wide-area discovery (Tailscale + CoreDNS)",
    manage_exec_approvals_gateway_or_node_host: "Manage exec approvals (gateway or node host)",
    fetch_exec_approvals_snapshot: "Fetch exec approvals snapshot",
    replace_exec_approvals_with_a_json_file: "Replace exec approvals with a JSON file",
    edit_the_per_agent_allowlist: "Edit the per-agent allowlist",
    show_or_synchronize_requested_exec_policy_with_host_approvals:
      "Show or synchronize requested exec policy with host approvals",
    show_the_local_config_policy_host_approvals_and_effective_merge:
      "Show the local config policy, host approvals, and effective merge",
    synchronize_local_config_and_host_approvals_using_explicit_values:
      "Synchronize local config and host approvals using explicit values",
    run_inspect_and_query_the_websocket_gateway: "Run, inspect, and query the WebSocket Gateway",
    run_the_websocket_gateway_foreground: "Run the WebSocket Gateway (foreground)",
    call_a_gateway_method: "Call a Gateway method",
    fetch_usage_cost_summary_from_session_logs: "Fetch usage cost summary from session logs",
    fetch_gateway_health: "Fetch Gateway health",
    fetch_payload_free_gateway_stability_diagnostics:
      "Fetch payload-free Gateway stability diagnostics",
    export_local_support_diagnostics: "Export local support diagnostics",
    write_a_shareable_payload_free_diagnostics_zip:
      "Write a shareable, payload-free diagnostics .zip",
    discover_gateways_via_bonjour_local_wide_area_if_configured:
      "Discover gateways via Bonjour (local + wide-area if configured)",
    manage_internal_agent_hooks: "Manage internal agent hooks",
    list_all_hooks: "List all hooks",
    show_detailed_information_about_a_hook: "Show detailed information about a hook",
    check_hooks_eligibility_status: "Check hooks eligibility status",
    enable_a_hook: "Enable a hook",
    disable_a_hook: "Disable a hook",
    internal_native_harness_hook_relay: "Internal native harness hook relay",
    deprecated_install_a_hook_pack_via_autopus_plugins_install:
      "Deprecated: install a hook pack via `autopus plugins install`",
    deprecated_update_hook_packs_via_autopus_plugins_update:
      "Deprecated: update hook packs via `autopus plugins update`",
    tail_gateway_file_logs_via_rpc: "Tail gateway file logs via RPC",
    manage_autopus_mcp_config_and_channel_bridge: "Manage Autopus MCP config and channel bridge",
    expose_autopus_channels_over_mcp_stdio: "Expose Autopus channels over MCP stdio",
    list_configured_mcp_servers: "List configured MCP servers",
    show_one_configured_mcp_server_or_the_full_mcp_config:
      "Show one configured MCP server or the full MCP config",
    set_one_configured_mcp_server_from_a_json_object:
      "Set one configured MCP server from a JSON object",
    remove_one_configured_mcp_server: "Remove one configured MCP server",
    model_discovery_scanning_and_configuration: "Model discovery, scanning, and configuration",
    list_models_configured_by_default: "List models (configured by default)",
    show_configured_model_state: "Show configured model state",
    set_the_default_model: "Set the default model",
    set_the_image_model: "Set the image model",
    manage_model_aliases: "Manage model aliases",
    list_model_aliases: "List model aliases",
    add_or_update_a_model_alias: "Add or update a model alias",
    remove_a_model_alias: "Remove a model alias",
    manage_model_fallback_list: "Manage model fallback list",
    list_fallback_models: "List fallback models",
    add_a_fallback_model: "Add a fallback model",
    remove_a_fallback_model: "Remove a fallback model",
    clear_all_fallback_models: "Clear all fallback models",
    manage_image_model_fallback_list: "Manage image model fallback list",
    list_image_fallback_models: "List image fallback models",
    add_an_image_fallback_model: "Add an image fallback model",
    remove_an_image_fallback_model: "Remove an image fallback model",
    clear_all_image_fallback_models: "Clear all image fallback models",
    scan_openrouter_free_models_for_tools_images: "Scan OpenRouter free models for tools + images",
    manage_model_auth_profiles: "Manage model auth profiles",
    list_saved_auth_profiles: "List saved auth profiles",
    interactive_auth_helper_provider_auth_or_paste_token:
      "Interactive auth helper (provider auth or paste token)",
    run_a_provider_plugin_auth_flow_oauth_api_key:
      "Run a provider plugin auth flow (OAuth/API key)",
    run_a_provider_cli_to_create_sync_a_token_tty_required:
      "Run a provider CLI to create/sync a token (TTY required)",
    paste_a_token_into_auth_profiles_json_and_update_config:
      "Paste a token into auth-profiles.json and update config",
    login_to_github_copilot_via_github_device_flow_tty_required:
      "Login to GitHub Copilot via GitHub device flow (TTY required)",
    manage_per_agent_auth_profile_order_overrides: "Manage per-agent auth profile order overrides",
    show_per_agent_auth_order_override_from_auth_state_json:
      "Show per-agent auth order override (from auth-state.json)",
    set_per_agent_auth_order_override_writes_auth_state_json:
      "Set per-agent auth order override (writes auth-state.json)",
    clear_per_agent_auth_order_override_fall_back_to_config_round_robin:
      "Clear per-agent auth order override (fall back to config/round-robin)",
    run_and_manage_the_headless_node_host_service: "Run and manage the headless node host service",
    run_the_headless_node_host_foreground: "Run the headless node host (foreground)",
    show_node_host_status: "Show node host status",
    install_the_node_host_service_launchd_systemd_schtasks:
      "Install the node host service (launchd/systemd/schtasks)",
    uninstall_the_node_host_service_launchd_systemd_schtasks:
      "Uninstall the node host service (launchd/systemd/schtasks)",
    stop_the_node_host_service_launchd_systemd_schtasks:
      "Stop the node host service (launchd/systemd/schtasks)",
    start_the_node_host_service_launchd_systemd_schtasks:
      "Start the node host service (launchd/systemd/schtasks)",
    restart_the_node_host_service_launchd_systemd_schtasks:
      "Restart the node host service (launchd/systemd/schtasks)",
    capture_camera_media_from_a_paired_node: "Capture camera media from a paired node",
    list_available_cameras_on_a_node: "List available cameras on a node",
    capture_a_photo_from_a_node_camera_prints_media_path:
      "Capture a photo from a node camera (prints MEDIA:<path>)",
    capture_a_short_video_clip_from_a_node_camera_prints_media_path:
      "Capture a short video clip from a node camera (prints MEDIA:<path>)",
    invoke_a_command_on_a_paired_node: "Invoke a command on a paired node",
    fetch_location_from_a_paired_node: "Fetch location from a paired node",
    fetch_the_current_location_from_a_node: "Fetch the current location from a node",
    send_a_local_notification_on_a_node_mac_only: "Send a local notification on a node (mac only)",
    list_pending_pairing_requests: "List pending pairing requests",
    approve_a_pending_pairing_request: "Approve a pending pairing request",
    reject_a_pending_pairing_request: "Reject a pending pairing request",
    remove_a_paired_node_entry: "Remove a paired node entry",
    rename_a_paired_node_display_name_override: "Rename a paired node (display name override)",
    send_an_apns_test_push_to_an_ios_node: "Send an APNs test push to an iOS node",
    capture_screen_recordings_from_a_paired_node: "Capture screen recordings from a paired node",
    capture_a_short_screen_recording_from_a_node_prints_media_path:
      "Capture a short screen recording from a node (prints MEDIA:<path>)",
    list_known_nodes_with_connection_status_and_capabilities:
      "List known nodes with connection status and capabilities",
    describe_a_node_capabilities_supported_invoke_commands:
      "Describe a node (capabilities + supported invoke commands)",
    list_pending_and_paired_nodes: "List pending and paired nodes",
    manage_gateway_owned_nodes_pairing_status_invoke_and_media:
      "Manage gateway-owned nodes (pairing, status, invoke, and media)",
    secure_dm_pairing_approve_inbound_requests: "Secure DM pairing (approve inbound requests)",
    approve_a_pairing_code_and_allow_that_sender: "Approve a pairing code and allow that sender",
    manage_autopus_plugins_and_extensions: "Manage Autopus plugins and extensions",
    list_discovered_plugins: "List discovered plugins",
    search_clawhub_plugin_packages: "Search ClawHub plugin packages",
    inspect_plugin_details: "Inspect plugin details",
    enable_a_plugin_in_config: "Enable a plugin in config",
    disable_a_plugin_in_config: "Disable a plugin in config",
    uninstall_a_plugin: "Uninstall a plugin",
    update_installed_plugins_and_tracked_hook_packs:
      "Update installed plugins and tracked hook packs",
    inspect_or_rebuild_the_persisted_plugin_registry:
      "Inspect or rebuild the persisted plugin registry",
    report_plugin_load_issues: "Report plugin load issues",
    inspect_claude_compatible_plugin_marketplaces: "Inspect Claude-compatible plugin marketplaces",
    list_plugins_published_by_a_marketplace_source:
      "List plugins published by a marketplace source",
    broadcast_a_message_to_multiple_targets: "Broadcast a message to multiple targets",
    role_actions: "Role actions",
    list_roles: "List roles",
    add_role_to_a_member: "Add role to a member",
    remove_role_from_a_member: "Remove role from a member",
    channel_actions: "Channel actions",
    fetch_channel_info: "Fetch channel info",
    list_channels: "List channels",
    member_actions: "Member actions",
    fetch_member_info: "Fetch member info",
    voice_actions: "Voice actions",
    fetch_voice_status: "Fetch voice status",
    event_actions: "Event actions",
    list_scheduled_events: "List scheduled events",
    create_a_scheduled_event: "Create a scheduled event",
    timeout_a_member: "Timeout a member",
    kick_a_member: "Kick a member",
    ban_a_member: "Ban a member",
    emoji_actions: "Emoji actions",
    list_emojis: "List emojis",
    upload_an_emoji: "Upload an emoji",
    sticker_actions: "Sticker actions",
    send_stickers: "Send stickers",
    upload_a_sticker: "Upload a sticker",
    fetch_channel_permissions: "Fetch channel permissions",
    search_discord_messages: "Search Discord messages",
    pin_a_message: "Pin a message",
    unpin_a_message: "Unpin a message",
    list_pinned_messages: "List pinned messages",
    send_a_poll: "Send a poll",
    add_or_remove_a_reaction: "Add or remove a reaction",
    list_reactions_on_a_message: "List reactions on a message",
    read_recent_messages: "Read recent messages",
    edit_a_message: "Edit a message",
    delete_a_message: "Delete a message",
    send_a_message: "Send a message",
    thread_actions: "Thread actions",
    create_a_thread: "Create a thread",
    list_threads: "List threads",
    reply_in_a_thread: "Reply in a thread",
    run_an_agent_turn_via_the_gateway_use_local_for_embedded:
      "Run an agent turn via the Gateway (use --local for embedded)",
    manage_isolated_agents_workspaces_auth_routing:
      "Manage isolated agents (workspaces + auth + routing)",
    list_configured_agents: "List configured agents",
    list_routing_bindings: "List routing bindings",
    add_routing_bindings_for_an_agent: "Add routing bindings for an agent",
    remove_routing_bindings_for_an_agent: "Remove routing bindings for an agent",
    add_a_new_isolated_agent: "Add a new isolated agent",
    update_an_agent_identity_name_theme_emoji_avatar:
      "Update an agent identity (name/theme/emoji/avatar)",
    delete_an_agent_and_prune_workspace_state: "Delete an agent and prune workspace/state",
    create_and_verify_local_backup_archives_for_autopus_state:
      "Create and verify local backup archives for Autopus state",
    write_a_backup_archive_for_config_credentials_sessions_and_workspaces:
      "Write a backup archive for config, credentials, sessions, and workspaces",
    validate_a_backup_archive_and_its_embedded_manifest:
      "Validate a backup archive and its embedded manifest",
    interactive_configuration_for_credentials_channels_gateway_and_agent_defaults:
      "Interactive configuration for credentials, channels, gateway, and agent defaults",
    open_the_ring_zero_setup_and_repair_helper: "Open the ring-zero setup and repair helper",
    health_checks_quick_fixes_for_the_gateway_and_channels:
      "Health checks + quick fixes for the gateway and channels",
    open_the_control_ui_with_your_current_token: "Open the Control UI with your current token",
    reset_local_config_state_keeps_the_cli_installed:
      "Reset local config/state (keeps the CLI installed)",
    uninstall_the_gateway_service_local_data_cli_remains:
      "Uninstall the gateway service + local data (CLI remains)",
    send_read_and_manage_messages_and_channel_actions:
      "Send, read, and manage messages and channel actions",
    import_state_from_another_agent_system: "Import state from another agent system",
    list_migration_providers: "List migration providers",
    preview_a_migration_without_changing_autopus_state:
      "Preview a migration without changing Autopus state",
    apply_a_migration_after_a_verified_backup: "Apply a migration after a verified backup",
    guided_setup_for_auth_models_gateway_workspace_channels_and_skills:
      "Guided setup for auth, models, Gateway, workspace, channels, and skills",
    create_baseline_config_workspace_files_use_wizard_for_full_onboarding:
      "Create baseline config/workspace files; use --wizard for full onboarding",
    show_channel_health_and_recent_session_recipients:
      "Show channel health and recent session recipients",
    fetch_health_from_the_running_gateway: "Fetch health from the running gateway",
    list_stored_conversation_sessions: "List stored conversation sessions",
    run_session_store_maintenance_now: "Run session-store maintenance now",
    export_a_redacted_trajectory_bundle_for_a_stored_session:
      "Export a redacted trajectory bundle for a stored session",
    list_and_manage_inferred_follow_up_commitments:
      "List and manage inferred follow-up commitments",
    list_inferred_follow_up_commitments: "List inferred follow-up commitments",
    dismiss_inferred_follow_up_commitments: "Dismiss inferred follow-up commitments",
    inspect_durable_background_tasks_and_taskflow_state:
      "Inspect durable background tasks and TaskFlow state",
    list_tracked_background_tasks: "List tracked background tasks",
    show_stale_or_broken_background_tasks_and_taskflows:
      "Show stale or broken background tasks and TaskFlows",
    preview_or_apply_tasks_and_taskflow_maintenance:
      "Preview or apply tasks and TaskFlow maintenance",
    show_one_background_task_by_task_id_run_id_or_session_key:
      "Show one background task by task id, run id, or session key",
    set_task_notify_policy: "Set task notify policy",
    cancel_a_running_background_task: "Cancel a running background task",
    inspect_durable_taskflow_state_under_tasks: "Inspect durable TaskFlow state under tasks",
    list_tracked_taskflows: "List tracked TaskFlows",
    show_one_taskflow_by_flow_id_or_owner_key: "Show one TaskFlow by flow id or owner key",
    cancel_a_running_taskflow: "Cancel a running TaskFlow",
    run_the_autopus_debug_proxy_and_inspect_captured_traffic:
      "Run the Autopus debug proxy and inspect captured traffic",
    start_the_local_explicit_debug_proxy: "Start the local explicit debug proxy",
    run_a_child_command_with_autopus_debug_proxy_capture_enabled:
      "Run a child command with Autopus debug proxy capture enabled",
    validate_the_operator_managed_network_proxy: "Validate the operator-managed network proxy",
    report_current_debug_proxy_transport_coverage_and_remaining_gaps:
      "Report current debug proxy transport coverage and remaining gaps",
    list_recent_capture_sessions: "List recent capture sessions",
    run_a_built_in_query_preset_against_captured_traffic:
      "Run a built-in query preset against captured traffic",
    read_a_captured_payload_blob_by_id: "Read a captured payload blob by id",
    delete_all_captured_traffic_metadata_and_blobs:
      "Delete all captured traffic metadata and blobs",
    generate_a_mobile_pairing_qr_code_and_setup_code:
      "Generate a mobile pairing QR code and setup code",
    manage_sandbox_containers_docker_based_agent_isolation:
      "Manage sandbox containers (Docker-based agent isolation)",
    list_sandbox_containers_and_their_status: "List sandbox containers and their status",
    remove_containers_to_force_recreation_with_updated_config:
      "Remove containers to force recreation with updated config",
    explain_effective_sandbox_tool_policy_for_a_session_agent:
      "Explain effective sandbox/tool policy for a session/agent",
    secrets_runtime_controls: "Secrets runtime controls",
    re_resolve_secret_references_and_atomically_swap_runtime_snapshot:
      "Re-resolve secret references and atomically swap runtime snapshot",
    audit_plaintext_secrets_unresolved_refs_and_precedence_drift:
      "Audit plaintext secrets, unresolved refs, and precedence drift",
    interactive_secrets_helper_provider_setup_secretref_mapping_preflight:
      "Interactive secrets helper (provider setup + SecretRef mapping + preflight)",
    apply_a_previously_generated_secrets_plan: "Apply a previously generated secrets plan",
    audit_local_config_and_state_for_common_security_foot_guns:
      "Audit local config and state for common security foot-guns",
    audit_config_local_state_for_common_security_foot_guns:
      "Audit config + local state for common security foot-guns",
    list_and_inspect_available_skills: "List and inspect available skills",
    search_clawhub_skills: "Search ClawHub skills",
    install_a_skill_from_clawhub_into_the_active_workspace:
      "Install a skill from ClawHub into the active workspace",
    update_clawhub_installed_skills_in_the_active_workspace:
      "Update ClawHub-installed skills in the active workspace",
    list_all_available_skills: "List all available skills",
    show_detailed_information_about_a_skill: "Show detailed information about a skill",
    check_which_skills_are_ready_visible_or_missing_requirements:
      "Check which skills are ready, visible, or missing requirements",
    system_tools_events_heartbeat_presence: "System tools (events, heartbeat, presence)",
    enqueue_a_system_event_and_optionally_trigger_a_heartbeat:
      "Enqueue a system event and optionally trigger a heartbeat",
    heartbeat_controls: "Heartbeat controls",
    show_the_last_heartbeat_event: "Show the last heartbeat event",
    enable_heartbeats: "Enable heartbeats",
    disable_heartbeats: "Disable heartbeats",
    list_system_presence_entries: "List system presence entries",
    open_a_terminal_ui_connected_to_the_gateway: "Open a terminal UI connected to the Gateway",
    update_autopus_and_inspect_update_channel_status:
      "Update Autopus and inspect update channel status",
    interactive_update_wizard: "Interactive update wizard",
    show_update_channel_and_version_status: "Show update channel and version status",
    webhook_helpers_and_integrations: "Webhook helpers and integrations",
    gmail_pub_sub_hooks_via_gogcli: "Gmail Pub/Sub hooks (via gogcli)",
    configure_gmail_watch_pub_sub_autopus_hooks: "Configure Gmail watch + Pub/Sub + Autopus hooks",
    run_gog_watch_serve_auto_renew_loop: "Run gog watch serve + auto-renew loop",
    click_an_element_by_ref_from_snapshot: "Click an element by ref from snapshot",
    click_viewport_coordinates: "Click viewport coordinates",
    type_into_an_element_by_ref_from_snapshot: "Type into an element by ref from snapshot",
    press_a_key: "Press a key",
    hover_an_element_by_ai_ref: "Hover an element by ai ref",
    scroll_an_element_into_view_by_ref_from_snapshot:
      "Scroll an element into view by ref from snapshot",
    drag_from_one_ref_to_another: "Drag from one ref to another",
    select_option_s_in_a_select_element: "Select option(s) in a select element",
    arm_file_upload_for_the_next_file_chooser: "Arm file upload for the next file chooser",
    wait_for_the_next_download_and_save_it: "Wait for the next download (and save it)",
    click_a_ref_and_save_the_resulting_download: "Click a ref and save the resulting download",
    arm_the_next_modal_dialog_alert_confirm_prompt:
      "Arm the next modal dialog (alert/confirm/prompt)",
    fill_a_form_with_json_field_descriptors: "Fill a form with JSON field descriptors",
    wait_for_time_selector_url_load_state_or_js_conditions:
      "Wait for time, selector, URL, load state, or JS conditions",
    evaluate_a_function_against_the_page_or_a_ref: "Evaluate a function against the page or a ref",
    navigate_the_current_tab_to_a_url: "Navigate the current tab to a URL",
    resize_the_viewport: "Resize the viewport",
    get_recent_console_messages: "Get recent console messages",
    save_page_as_pdf: "Save page as PDF",
    wait_for_a_network_response_and_return_its_body:
      "Wait for a network response and return its body",
    highlight_an_element_by_ref: "Highlight an element by ref",
    get_recent_page_errors: "Get recent page errors",
    get_recent_network_requests_best_effort: "Get recent network requests (best-effort)",
    record_a_playwright_trace: "Record a Playwright trace",
    start_trace_recording: "Start trace recording",
    stop_trace_recording_and_write_a_zip: "Stop trace recording and write a .zip",
    capture_a_screenshot_media_path: "Capture a screenshot (MEDIA:<path>)",
    capture_a_snapshot_default_ai_aria_is_the_accessibility_tree:
      "Capture a snapshot (default: ai; aria is the accessibility tree)",
    show_browser_status: "Show browser status",
    check_browser_plugin_readiness: "Check browser plugin readiness",
    start_the_browser_no_op_if_already_running: "Start the browser (no-op if already running)",
    stop_the_browser_best_effort: "Stop the browser (best-effort)",
    reset_browser_profile_moves_it_to_trash: "Reset browser profile (moves it to Trash)",
    list_open_tabs: "List open tabs",
    tab_shortcuts_index_based: "Tab shortcuts (index-based)",
    open_a_new_tab_about_blank: "Open a new tab (about:blank)",
    assign_a_friendly_label_to_a_tab: "Assign a friendly label to a tab",
    focus_tab_by_index_1_based: "Focus tab by index (1-based)",
    close_tab_by_index_1_based_default_first_tab:
      "Close tab by index (1-based); default: first tab",
    open_a_url_in_a_new_tab: "Open a URL in a new tab",
    focus_a_tab_by_target_id_tab_id_label_or_unique_target_id_prefix:
      "Focus a tab by target id, tab id, label, or unique target id prefix",
    close_a_tab_target_id_optional: "Close a tab (target id optional)",
    list_all_browser_profiles: "List all browser profiles",
    create_a_new_browser_profile: "Create a new browser profile",
    delete_a_browser_profile: "Delete a browser profile",
    read_write_cookies: "Read/write cookies",
    set_a_cookie_requires_url_or_domain_path: "Set a cookie (requires --url or domain+path)",
    clear_all_cookies: "Clear all cookies",
    read_write_localstorage_sessionstorage: "Read/write localStorage/sessionStorage",
    browser_environment_settings: "Browser environment settings",
    set_viewport_size_alias_for_resize: "Set viewport size (alias for resize)",
    toggle_offline_mode: "Toggle offline mode",
    set_extra_http_headers_json_object: "Set extra HTTP headers (JSON object)",
    set_http_basic_auth_credentials: "Set HTTP basic auth credentials",
    set_geolocation_and_grant_permission: "Set geolocation (and grant permission)",
    emulate_prefers_color_scheme: "Emulate prefers-color-scheme",
    override_timezone_cdp: "Override timezone (CDP)",
    override_locale_cdp: "Override locale (CDP)",
    manage_autopus_s_dedicated_browser_chrome_chromium:
      "Manage Autopus's dedicated browser (Chrome/Chromium)",
    capture_or_render_canvas_content_from_a_paired_node:
      "Capture or render canvas content from a paired node",
    capture_a_canvas_snapshot_prints_media_path: "Capture a canvas snapshot (prints MEDIA:<path>)",
    show_the_canvas_optionally_with_a_target_url_path:
      "Show the canvas (optionally with a target URL/path)",
    hide_the_canvas: "Hide the canvas",
    navigate_the_canvas_to_a_url: "Navigate the canvas to a URL",
    evaluate_javascript_in_the_canvas: "Evaluate JavaScript in the canvas",
    render_a2ui_content_on_the_canvas: "Render A2UI content on the canvas",
    push_a2ui_jsonl_to_the_canvas: "Push A2UI JSONL to the canvas",
    reset_a2ui_renderer_state: "Reset A2UI renderer state",
    google_meet_participant_utilities: "Google Meet participant utilities",
    google_meet_oauth_helpers: "Google Meet OAuth helpers",
    run_a_pkce_oauth_flow_and_print_refresh_token_json_to_store_in_plugin_config:
      "Run a PKCE OAuth flow and print refresh-token JSON to store in plugin config",
    create_a_new_google_meet_space_and_print_its_meeting_url:
      "Create a new Google Meet space and print its meeting URL",
    end_the_active_conference_for_a_google_meet_space:
      "End the active conference for a Google Meet space",
    resolve_a_meet_url_meeting_code_or_spaces_id_to_its_canonical_space:
      "Resolve a Meet URL, meeting code, or spaces/{id} to its canonical space",
    validate_oauth_meeting_resolution_prerequisites_for_meet_media_work:
      "Validate OAuth + meeting resolution prerequisites for Meet media work",
    find_the_latest_meet_conference_record_for_a_meeting:
      "Find the latest Meet conference record for a meeting",
    preview_calendar_events_with_google_meet_links:
      "Preview Calendar events with Google Meet links",
    list_meet_conference_records_and_available_participant_artifact_metadata:
      "List Meet conference records and available participant/artifact metadata",
    list_meet_participants_and_participant_sessions:
      "List Meet participants and participant sessions",
    write_meet_artifacts_attendance_transcript_and_raw_json_into_a_folder:
      "Write Meet artifacts, attendance, transcript, and raw JSON into a folder",
    show_human_readable_meet_session_browser_realtime_health:
      "Show human-readable Meet session/browser/realtime health",
    focus_and_inspect_an_existing_google_meet_tab: "Focus and inspect an existing Google Meet tab",
    show_google_meet_transport_setup_status: "Show Google Meet transport setup status",
    matrix_channel_utilities: "Matrix channel utilities",
    manage_matrix_channel_accounts: "Manage matrix channel accounts",
    add_or_update_a_matrix_account_wrapper_around_channel_setup:
      "Add or update a matrix account (wrapper around channel setup)",
    manage_matrix_bot_profile: "Manage Matrix bot profile",
    update_matrix_profile_display_name_and_or_avatar:
      "Update Matrix profile display name and/or avatar",
    inspect_and_repair_matrix_direct_room_state: "Inspect and repair Matrix direct-room state",
    inspect_direct_room_mappings_for_a_matrix_user:
      "Inspect direct-room mappings for a Matrix user",
    repair_matrix_direct_room_mappings_for_a_matrix_user:
      "Repair Matrix direct-room mappings for a Matrix user",
    set_up_matrix_end_to_end_encryption: "Set up Matrix end-to-end encryption",
    enable_matrix_e2ee_bootstrap_verification_and_print_next_steps:
      "Enable Matrix E2EE, bootstrap verification, and print next steps",
    device_verification_for_matrix_e2ee: "Device verification for Matrix E2EE",
    list_pending_matrix_verification_requests: "List pending Matrix verification requests",
    interactively_self_verify_this_matrix_device: "Interactively self-verify this Matrix device",
    request_matrix_device_verification_from_another_matrix_client:
      "Request Matrix device verification from another Matrix client",
    accept_an_inbound_matrix_verification_request: "Accept an inbound Matrix verification request",
    start_sas_verification_for_a_matrix_verification_request:
      "Start SAS verification for a Matrix verification request",
    show_sas_emoji_or_decimals_for_a_matrix_verification_request:
      "Show SAS emoji or decimals for a Matrix verification request",
    confirm_matching_sas_emoji_or_decimals_for_a_matrix_verification_request:
      "Confirm matching SAS emoji or decimals for a Matrix verification request",
    reject_a_matrix_sas_verification_when_the_emoji_or_decimals_do_not_match:
      "Reject a Matrix SAS verification when the emoji or decimals do not match",
    cancel_a_matrix_verification_request: "Cancel a Matrix verification request",
    check_matrix_device_verification_status: "Check Matrix device verification status",
    matrix_room_key_backup_health_and_restore: "Matrix room-key backup health and restore",
    show_matrix_room_key_backup_status_for_this_device:
      "Show Matrix room-key backup status for this device",
    restore_encrypted_room_keys_from_server_backup:
      "Restore encrypted room keys from server backup",
    bootstrap_matrix_cross_signing_and_device_verification_state:
      "Bootstrap Matrix cross-signing and device verification state",
    verify_device_using_a_matrix_recovery_key: "Verify device using a Matrix recovery key",
    inspect_and_clean_up_matrix_devices: "Inspect and clean up Matrix devices",
    list_server_side_matrix_devices_for_this_account:
      "List server-side Matrix devices for this account",
    delete_stale_autopus_managed_devices_for_this_account:
      "Delete stale Autopus-managed devices for this account",
    search_inspect_and_reindex_memory_files: "Search, inspect, and reindex memory files",
    show_memory_search_index_status: "Show memory search index status",
    reindex_memory_files: "Reindex memory files",
    search_memory_files: "Search memory files",
    rank_short_term_recalls_and_optionally_append_top_entries_to_memory_md:
      "Rank short-term recalls and optionally append top entries to MEMORY.md",
    explain_a_specific_promotion_candidate_and_its_score_breakdown:
      "Explain a specific promotion candidate and its score breakdown",
    preview_rem_reflections_candidate_truths_and_deep_promotions_without_writing:
      "Preview REM reflections, candidate truths, and deep promotions without writing",
    write_grounded_historical_rem_summaries_into_dreams_md_for_ui_review:
      "Write grounded historical REM summaries into DREAMS.md for UI review",
    lancedb_memory_plugin_commands: "LanceDB memory plugin commands",
    list_memories: "List memories",
    search_memories: "Search memories",
    query_memories_non_vector_search: "Query memories (non-vector search)",
    show_memory_statistics: "Show memory statistics",
    inspect_and_initialize_the_memory_wiki_vault: "Inspect and initialize the memory wiki vault",
    show_wiki_vault_status: "Show wiki vault status",
    audit_wiki_vault_setup_and_report_actionable_fixes:
      "Audit wiki vault setup and report actionable fixes",
    initialize_the_wiki_vault_layout: "Initialize the wiki vault layout",
    refresh_generated_wiki_indexes: "Refresh generated wiki indexes",
    lint_the_wiki_vault_and_write_a_report: "Lint the wiki vault and write a report",
    ingest_a_local_file_into_the_wiki_sources_folder:
      "Ingest a local file into the wiki sources folder",
    search_wiki_pages_and_when_configured_the_active_memory_corpus:
      "Search wiki pages and, when configured, the active memory corpus",
    read_a_wiki_page_by_id_or_relative_path_with_optional_active_memory_fallback:
      "Read a wiki page by id or relative path, with optional active-memory fallback",
    apply_narrow_wiki_mutations: "Apply narrow wiki mutations",
    create_or_refresh_a_synthesis_page_with_managed_summary_content:
      "Create or refresh a synthesis page with managed summary content",
    update_metadata_on_an_existing_page: "Update metadata on an existing page",
    import_public_memory_artifacts_into_the_wiki_vault:
      "Import public memory artifacts into the wiki vault",
    sync_bridge_backed_memory_artifacts_into_wiki_source_pages:
      "Sync bridge-backed memory artifacts into wiki source pages",
    import_explicitly_configured_private_local_paths_into_wiki_source_pages:
      "Import explicitly configured private local paths into wiki source pages",
    sync_unsafe_local_configured_paths_into_wiki_source_pages:
      "Sync unsafe-local configured paths into wiki source pages",
    import_chatgpt_export_history_into_wiki_source_pages:
      "Import ChatGPT export history into wiki source pages",
    import_a_chatgpt_export_into_draft_wiki_source_pages:
      "Import a ChatGPT export into draft wiki source pages",
    roll_back_a_previously_applied_chatgpt_import_run:
      "Roll back a previously applied ChatGPT import run",
    run_official_obsidian_cli_helpers: "Run official Obsidian CLI helpers",
    probe_the_obsidian_cli: "Probe the Obsidian CLI",
    search_the_current_obsidian_vault: "Search the current Obsidian vault",
    open_a_file_in_obsidian_by_vault_relative_path:
      "Open a file in Obsidian by vault-relative path",
    execute_an_obsidian_command_palette_command_by_id:
      "Execute an Obsidian command palette command by id",
    open_today_s_daily_note_in_obsidian: "Open today's daily note in Obsidian",
    inspect_and_edit_workspace_files_via_the_oc_addressing_scheme:
      "Inspect and edit workspace files via the oc:// addressing scheme",
    print_the_match_at_an_oc_path: "Print the match at an oc:// path",
    enumerate_matches_for_a_wildcard_predicate_oc_pattern:
      "Enumerate matches for a wildcard / predicate oc:// pattern",
    write_a_leaf_value_at_an_oc_path: "Write a leaf value at an oc:// path",
    parse_an_oc_path_and_print_its_slot_structure:
      "Parse an oc:// path and print its slot structure",
    round_trip_a_file_through_parse_emit: "Round-trip a file through parse + emit",
    run_private_qa_automation_flows_and_launch_the_qa_debugger:
      "Run private QA automation flows and launch the QA debugger",
    run_the_bundled_qa_self_check_and_write_a_markdown_report:
      "Run the bundled QA self-check and write a Markdown report",
    run_repo_backed_qa_scenarios_against_the_qa_gateway_lane:
      "Run repo-backed QA scenarios against the QA gateway lane",
    compare_two_qa_suite_summaries_and_write_an_agentic_parity_gate_report:
      "Compare two QA suite summaries and write an agentic parity gate report",
    print_the_markdown_scenario_coverage_inventory:
      "Print the markdown scenario coverage inventory",
    run_the_character_qa_scenario_across_live_models_and_write_a_judged_report:
      "Run the character QA scenario across live models and write a judged report",
    run_a_one_off_qa_agent_prompt_against_the_selected_provider_model_lane:
      "Run a one-off QA agent prompt against the selected provider/model lane",
    manage_pooled_convex_live_credentials_used_by_qa_lanes:
      "Manage pooled Convex live credentials used by QA lanes",
    check_convex_credential_broker_env_and_admin_reachability:
      "Check Convex credential broker env and admin reachability",
    add_one_credential_payload_to_the_shared_pool: "Add one credential payload to the shared pool",
    remove_one_credential_from_active_use_by_disabling_it:
      "Remove one credential from active use by disabling it",
    list_credential_rows_in_the_shared_convex_pool:
      "List credential rows in the shared Convex pool",
    start_the_private_qa_debugger_ui_and_local_qa_bus:
      "Start the private QA debugger UI and local QA bus",
    write_a_prebaked_docker_scaffold_for_the_qa_dashboard_gateway_lane:
      "Write a prebaked Docker scaffold for the QA dashboard + gateway lane",
    build_the_prebaked_qa_docker_image_with_qa_channel_qa_lab_bundled:
      "Build the prebaked QA Docker image with qa-channel + qa-lab bundled",
    build_the_qa_site_start_the_docker_backed_qa_stack_and_print_the_qa_lab_url:
      "Build the QA site, start the Docker-backed QA stack, and print the QA Lab URL",
    run_mantis_before_after_and_live_smoke_verification_flows:
      "Run Mantis before/after and live-smoke verification flows",
    run_a_mantis_before_after_scenario_against_baseline_and_candidate_refs:
      "Run a Mantis before/after scenario against baseline and candidate refs",
    verify_the_mantis_discord_bot_can_see_the_guild_channel_post_and_react:
      "Verify the Mantis Discord bot can see the guild/channel, post, and react",
    voice_call_utilities: "Voice call utilities",
    show_voice_call_provider_and_webhook_setup_status:
      "Show Voice Call provider and webhook setup status",
    check_voice_call_readiness_and_optionally_place_a_short_outbound_test_call:
      "Check Voice Call readiness and optionally place a short outbound test call",
    initiate_an_outbound_voice_call: "Initiate an outbound voice call",
    alias_for_voicecall_call: "Alias for voicecall call",
    speak_a_message_and_wait_for_a_response: "Speak a message and wait for a response",
    speak_a_message_without_waiting_for_response: "Speak a message without waiting for response",
    send_dtmf_digits_to_an_active_call: "Send DTMF digits to an active call",
    hang_up_an_active_call: "Hang up an active call",
    show_call_status: "Show call status",
    tail_voice_call_jsonl_logs_prints_new_lines_useful_during_provider_tests:
      "Tail voice-call JSONL logs (prints new lines; useful during provider tests)",
    summarize_turn_latency_metrics_from_voice_call_jsonl_logs:
      "Summarize turn latency metrics from voice-call JSONL logs",
    enable_disable_tailscale_serve_funnel_for_the_webhook:
      "Enable/disable Tailscale serve/funnel for the webhook",
    run_and_manage_acp_backed_coding_agents: "Run and manage ACP-backed coding agents",
    run_inspect_and_query_the_autopus_gateway: "Run, inspect, and query the Autopus Gateway",
    manage_the_gateway_service_legacy_alias: "Manage the Gateway service (legacy alias)",
    tail_gateway_logs_locally_or_via_rpc: "Tail Gateway logs locally or via RPC",
    system_events_heartbeat_and_presence: "System events, heartbeat, and presence",
    list_scan_and_set_model_providers: "List, scan, and set model providers",
    run_provider_backed_model_media_search_and_embedding_commands:
      "Run provider-backed model, media, search, and embedding commands",
    run_provider_capability_commands_fallback_alias_infer:
      "Run provider capability commands (fallback alias: infer)",
    pair_nodes_and_run_node_host_commands_through_the_gateway:
      "Pair nodes and run node-host commands through the Gateway",
    device_pairing_token_management: "Device pairing + token management",
    manage_sandbox_containers_for_agent_isolation: "Manage sandbox containers for agent isolation",
    open_a_local_terminal_ui_alias_for_tui_local:
      "Open a local terminal UI (alias for tui --local)",
    schedule_and_inspect_gateway_background_jobs: "Schedule and inspect Gateway background jobs",
    search_the_live_autopus_docs: "Search the live Autopus docs",
    run_qa_scenarios_and_launch_the_private_qa_debugger_ui:
      "Run QA scenarios and launch the private QA debugger UI",
    generate_mobile_pairing_qr_setup_code: "Generate mobile pairing QR/setup code",
    install_enable_disable_and_inspect_plugins: "Install, enable, disable, and inspect plugins",
    add_remove_login_and_inspect_messaging_channels:
      "Add, remove, login, and inspect messaging channels",
    security_tools_and_local_config_audits: "Security tools and local config audits",
    audit_apply_and_reload_secretref_backed_credentials:
      "Audit, apply, and reload SecretRef-backed credentials",
    list_inspect_and_install_agent_skills: "List, inspect, and install agent skills",
    open_the_interactive_setup_and_repair_assistant:
      "Open the interactive setup and repair assistant",
    initialize_local_config_and_an_agent_workspace:
      "Initialize local config and an agent workspace",
    interactive_onboarding_for_gateway_workspace_and_skills:
      "Interactive onboarding for gateway, workspace, and skills",
    non_interactive_config_helpers_get_set_unset_file_validate_default_starts_guided:
      "Non-interactive config helpers (get/set/unset/file/validate). Default: starts guided setup.",
    diagnose_and_repair_config_gateway_plugin_and_channel_problems:
      "Diagnose and repair config, Gateway, plugin, and channel problems",
    send_read_and_manage_channel_messages: "Send, read, and manage channel messages",
    run_one_agent_turn_via_the_gateway: "Run one agent turn via the Gateway",
    show_gateway_channel_model_and_recent_session_status:
      "Show Gateway, channel, model, and recent-session status",
    fetch_detailed_health_from_the_running_gateway:
      "Fetch detailed health from the running Gateway",
    inspect_durable_background_tasks_and_flows: "Inspect durable background tasks and flows",
  },
  opt: {
    gateway_websocket_url_defaults_to_gateway_remote_url_when_configured:
      "Gateway WebSocket URL (defaults to gateway.remote.url when configured)",
    gateway_token_if_required: "Gateway token (if required)",
    read_gateway_token_from_file: "Read gateway token from file",
    gateway_password_if_required: "Gateway password (if required)",
    read_gateway_password_from_file: "Read gateway password from file",
    default_session_key_e_g_agent_main_main: "Default session key (e.g. agent:main:main)",
    default_session_label_to_resolve: "Default session label to resolve",
    acp_provenance_mode_off_meta_or_meta_receipt: "ACP provenance mode: off, meta, or meta+receipt",
    working_directory_for_the_acp_session: "Working directory for the ACP session",
    acp_server_command_default_autopus: "ACP server command (default: autopus)",
    extra_arguments_for_the_acp_server: "Extra arguments for the ACP server",
    model_override: "Model override",
    thinking_level_override: "Thinking level override",
    provider_auth_method_id: "Provider auth method id",
    number_of_images: "Number of images",
    size_hint_like_1024x1024: "Size hint like 1024x1024",
    aspect_ratio_hint_like_16_9: "Aspect ratio hint like 16:9",
    resolution_hint_1k_2k_or_4k: "Resolution hint: 1K, 2K, or 4K",
    output_format_hint_png_jpeg_or_webp: "Output format hint: png, jpeg, or webp",
    background_hint_transparent_opaque_or_auto: "Background hint: transparent, opaque, or auto",
    openai_background_hint_transparent_opaque_or_auto:
      "OpenAI background hint: transparent, opaque, or auto",
    provider_request_timeout_in_milliseconds: "Provider request timeout in milliseconds",
    output_path: "Output path",
    prompt_hint: "Prompt hint",
    language_hint: "Language hint",
    channel_hint: "Channel hint",
    voice_hint: "Voice hint",
    speech_provider_id: "Speech provider id",
    tts_persona_id: "TTS persona id",
    size_hint_like_1280x720: "Size hint like 1280x720",
    resolution_hint_480p_720p_768p_or_1080p: "Resolution hint: 480P, 720P, 768P, or 1080P",
    target_duration_in_seconds: "Target duration in seconds",
    enable_generated_audio_when_supported: "Enable generated audio when supported",
    request_provider_watermark_when_supported: "Request provider watermark when supported",
    provider_id: "Provider id",
    result_limit: "Result limit",
    format_hint: "Format hint",
    account_id_only_with_channel: "Account id (only with --channel)",
    channel_target_for_permission_audit_discord_channel_id:
      "Channel target for permission audit (Discord channel:<id>)",
    account_id_accountid: "Account id (accountId)",
    account_id_default_when_omitted: "Account id (default when omitted)",
    display_name_for_this_account: "Display name for this account",
    channel_token_or_credential_payload: "Channel token or credential payload",
    read_channel_token_or_credential_payload_from_file:
      "Read channel token or credential payload from file",
    channel_shared_secret: "Channel shared secret",
    read_channel_shared_secret_from_file: "Read channel shared secret from file",
    bot_token: "Bot token",
    app_token: "App token",
    channel_password_or_login_secret: "Channel password or login secret",
    channel_cli_path: "Channel CLI path",
    channel_setup_url: "Channel setup URL",
    channel_base_url: "Channel base URL",
    channel_http_service_url: "Channel HTTP service URL",
    channel_auth_directory_override: "Channel auth directory override",
    channel_alias_auto_when_only_one_is_configured:
      "Channel alias (auto when only one is configured)",
    install_completion_script_to_shell_profile: "Install completion script to shell profile",
    secretref_builder_provider_alias: "SecretRef builder: provider alias",
    secretref_builder_source_env_file_exec: "SecretRef builder: source (env|file|exec)",
    secretref_builder_ref_id: "SecretRef builder: ref id",
    provider_builder_source_env_file_exec: "Provider builder: source (env|file|exec)",
    provider_builder_file_path: "Provider builder (file): path",
    provider_builder_file_mode_singlevalue_json: "Provider builder (file): mode (singleValue|json)",
    provider_builder_file_exec_timeout_ms: "Provider builder (file|exec): timeout ms",
    provider_builder_file_max_bytes: "Provider builder (file): max bytes",
    provider_builder_exec_absolute_command_path: "Provider builder (exec): absolute command path",
    provider_builder_exec_no_output_timeout_ms: "Provider builder (exec): no-output timeout ms",
    provider_builder_exec_max_output_bytes: "Provider builder (exec): max output bytes",
    batch_mode_json_array_of_set_operations: "Batch mode: JSON array of set operations",
    batch_mode_read_json_array_of_set_operations_from_file:
      "Batch mode: read JSON array of set operations from file",
    read_a_json5_config_patch_object_from_file: "Read a JSON5 config patch object from file",
    filter_by_agent_id: "Filter by agent id",
    optional_description: "Optional description",
    agent_id_for_this_job: "Agent id for this job",
    session_target_main_isolated: "Session target (main|isolated)",
    session_key_for_job_routing_e_g_agent_my_agent_my_session:
      "Session key for job routing (e.g. agent:my-agent:my-session)",
    run_every_duration_e_g_10m_1h: "Run every duration (e.g. 10m, 1h)",
    cron_expression_5_field_or_6_field_with_seconds:
      "Cron expression (5-field or 6-field with seconds)",
    cron_stagger_window_e_g_30s_5m: "Cron stagger window (e.g. 30s, 5m)",
    system_event_payload_main_session: "System event payload (main session)",
    agent_message_payload: "Agent message payload",
    model_override_for_agent_jobs_provider_model_or_alias:
      "Model override for agent jobs (provider/model or alias)",
    timeout_seconds_for_agent_jobs: "Timeout seconds for agent jobs",
    tool_allow_list_e_g_exec_read_write_or_exec_read_write:
      "Tool allow-list (e.g. exec,read,write or exec read write)",
    deprecated_use_announce_fallback_delivers_final_text_to_a_chat:
      "Deprecated (use --announce). Fallback-delivers final text to a chat.",
    disable_runner_fallback_delivery: "Disable runner fallback delivery",
    telegram_forum_topic_thread_id: "Telegram forum topic thread id",
    channel_account_id_for_delivery_multi_account_setups:
      "Channel account id for delivery (multi-account setups)",
    set_name: "Set name",
    set_description: "Set description",
    set_agent_id: "Set agent id",
    set_session_key_for_job_routing: "Set session key for job routing",
    wake_mode_now_next_heartbeat: "Wake mode (now|next-heartbeat)",
    set_one_shot_time_iso_or_duration_like_20m: "Set one-shot time (ISO) or duration like 20m",
    set_interval_duration_like_10m: "Set interval duration like 10m",
    set_cron_expression: "Set cron expression",
    disable_cron_staggering_set_stagger_to_0: "Disable cron staggering (set stagger to 0)",
    set_systemevent_payload: "Set systemEvent payload",
    set_agentturn_payload_message: "Set agentTurn payload message",
    model_override_for_agent_jobs: "Model override for agent jobs",
    enable_lightweight_bootstrap_context_for_agent_jobs:
      "Enable lightweight bootstrap context for agent jobs",
    disable_lightweight_bootstrap_context_for_agent_jobs:
      "Disable lightweight bootstrap context for agent jobs",
    fallback_deliver_final_text_to_a_chat: "Fallback-deliver final text to a chat",
    do_not_fail_job_if_delivery_fails: "Do not fail job if delivery fails",
    fail_job_when_delivery_fails: "Fail job when delivery fails",
    enable_failure_alerts_for_this_job: "Enable failure alerts for this job",
    disable_failure_alerts_for_this_job: "Disable failure alerts for this job",
    alert_after_n_consecutive_job_errors: "Alert after N consecutive job errors",
    failure_alert_destination: "Failure alert destination",
    minimum_time_between_alerts_e_g_1h_30m: "Minimum time between alerts (e.g. 1h, 30m)",
    count_consecutive_skipped_runs_toward_alerts: "Count consecutive skipped runs toward alerts",
    alert_only_on_execution_errors: "Alert only on execution errors",
    failure_alert_delivery_mode_announce_or_webhook:
      "Failure alert delivery mode (announce or webhook)",
    gateway_websocket_url_defaults_to_config_remote_local:
      "Gateway WebSocket URL (defaults to config/remote/local)",
    gateway_password_password_auth: "Gateway password (password auth)",
    skip_rpc_probe: "Skip RPC probe",
    gateway_port: "Gateway port",
    daemon_runtime_node_bun_default_node: "Daemon runtime (node|bun). Default: node",
    gateway_token_token_auth: "Gateway token (token auth)",
    executable_wrapper_for_generated_service_programarguments:
      "Executable wrapper for generated service ProgramArguments",
    scopes_to_attach_to_the_token_repeatable: "Scopes to attach to the token (repeatable)",
    channel_auto_when_only_one_is_configured: "Channel (auto when only one is configured)",
    optional_search_query: "Optional search query",
    limit_results: "Limit results",
    wide_area_discovery_domain_e_g_autopus_internal:
      "Wide-area discovery domain (e.g. autopus.internal)",
    target_node_id_name_ip: "Target node id/name/IP",
    path_to_json_file_to_upload: "Path to JSON file to upload",
    exec_host_target_auto_sandbox_gateway_node: "Exec host target: auto|sandbox|gateway|node",
    exec_security_deny_allowlist_full: "Exec security: deny|allowlist|full",
    exec_ask_mode_off_on_miss_always: "Exec ask mode: off|on-miss|always",
    host_approvals_fallback_deny_allowlist_full: "Host approvals fallback: deny|allowlist|full",
    filter_by_diagnostic_event_type: "Filter by diagnostic event type",
    only_include_events_after_this_sequence: "Only include events after this sequence",
    diagnostics_export_output_zip_path: "Diagnostics export output .zip path",
    output_zip_path: "Output .zip path",
    gateway_websocket_url_for_health_snapshot: "Gateway WebSocket URL for health snapshot",
    gateway_token_for_health_snapshot: "Gateway token for health snapshot",
    gateway_password_for_health_snapshot: "Gateway password for health snapshot",
    skip_persisted_stability_bundle_lookup: "Skip persisted stability bundle lookup",
    explicit_gateway_websocket_url_still_probes_localhost:
      "Explicit Gateway WebSocket URL (still probes localhost)",
    ssh_target_for_remote_gateway_tunnel_user_host_or_user_host_port:
      "SSH target for remote gateway tunnel (user@host or user@host:port)",
    ssh_identity_file_path: "SSH identity file path",
    gateway_token_applies_to_all_probes: "Gateway token (applies to all probes)",
    gateway_password_applies_to_all_probes: "Gateway password (applies to all probes)",
    port_for_the_gateway_websocket: "Port for the gateway WebSocket",
    password_for_auth_mode_password: "Password for auth mode=password",
    raw_stream_jsonl_path: "Raw stream jsonl path",
    disable_ansi_colors: "Disable ANSI colors",
    print_json: "Print JSON",
    filter_by_provider_id: "Filter by provider id",
    only_probe_a_single_provider: "Only probe a single provider",
    per_probe_timeout_in_ms: "Per-probe timeout in ms",
    concurrent_probes: "Concurrent probes",
    probe_max_tokens_best_effort: "Probe max tokens (best-effort)",
    minimum_parameter_size_billions: "Minimum parameter size (billions)",
    skip_models_older_than_n_days: "Skip models older than N days",
    filter_by_provider_prefix: "Filter by provider prefix",
    probe_concurrency: "Probe concurrency",
    skip_live_probes_list_free_candidates_only: "Skip live probes; list free candidates only",
    disable_prompts_use_defaults: "Disable prompts (use defaults)",
    agent_id_for_auth_commands: "Agent id for auth commands",
    agent_id_default_configured_default_agent: "Agent id (default: configured default agent)",
    provider_id_registered_by_a_plugin: "Provider id registered by a plugin",
    auth_profile_id_default_provider_manual: "Auth profile id (default: <provider>:manual)",
    gateway_host: "Gateway host",
    expected_tls_certificate_fingerprint_sha256: "Expected TLS certificate fingerprint (sha256)",
    override_node_id_clears_pairing_token: "Override node id (clears pairing token)",
    override_node_display_name: "Override node display name",
    service_runtime_node_bun_default_node: "Service runtime (node|bun). Default: node",
    camera_device_id_from_nodes_camera_list: "Camera device id (from nodes camera list)",
    max_width_in_px_optional: "Max width in px (optional)",
    jpeg_quality_default_0_9: "JPEG quality (default 0.9)",
    delay_before_capture_in_ms_macos_default_2000:
      "Delay before capture in ms (macOS default 2000)",
    disable_audio_capture: "Disable audio capture",
    idempotency_key_optional: "Idempotency key (optional)",
    use_cached_location_newer_than_this_ms: "Use cached location newer than this (ms)",
    notification_title: "Notification title",
    notification_body: "Notification body",
    notification_sound: "Notification sound",
    notification_priority: "Notification priority",
    push_body: "Push body",
    override_apns_environment: "Override APNs environment",
    disable_microphone_audio_capture: "Disable microphone audio capture",
    only_show_connected_nodes: "Only show connected nodes",
    only_show_nodes_connected_within_duration_e_g_24h:
      "Only show nodes connected within duration (e.g. 24h)",
    account_id_for_multi_account_channels: "Account id (for multi-account channels)",
    inspect_all_plugins: "Inspect all plugins",
    load_plugin_runtime_for_hooks_tools_diagnostics:
      "Load plugin runtime for hooks/tools/diagnostics",
    channel_account_id_accountid: "Channel account id (accountId)",
    message_to_send: "Message to send",
    media_url: "Media URL",
    guild_id_discord: "Guild id (Discord)",
    event_end_time: "Event end time",
    event_description: "Event description",
    channel_id: "Channel id",
    event_location: "Event location",
    event_type: "Event type",
    cover_image_url_or_local_file_path: "Cover image URL or local file path",
    timeout_duration_minutes: "Timeout duration minutes",
    timeout_until: "Timeout until",
    moderation_reason: "Moderation reason",
    ban_delete_message_days: "Ban delete message days",
    optional_message_body: "Optional message body",
    author_id: "Author id",
    poll_duration_in_hours_discord: "Poll duration in hours (Discord)",
    poll_duration_in_seconds_telegram_5_600: "Poll duration in seconds (Telegram; 5-600)",
    thread_id_telegram_forum_topic_slack_thread_ts:
      "Thread id (Telegram forum topic / Slack thread ts)",
    emoji_for_reactions: "Emoji for reactions",
    whatsapp_reaction_participant: "WhatsApp reaction participant",
    signal_reaction_target_author_uuid_or_phone: "Signal reaction target author (uuid or phone)",
    signal_reaction_target_author_uuid: "Signal reaction target author uuid",
    read_a_specific_message_id: "Read a specific message id",
    read_search_before_id: "Read/search before id",
    read_search_after_id: "Read/search after id",
    read_around_id: "Read around id",
    thread_id_slack_thread_timestamp: "Thread id (Slack thread timestamp)",
    thread_id_telegram_forum_thread: "Thread id (Telegram forum thread)",
    message_body_required_unless_media_is_set: "Message body (required unless --media is set)",
    shared_delivery_preferences_as_json: "Shared delivery preferences as JSON",
    reply_to_message_id: "Reply-to message id",
    message_id_optional: "Message id (optional)",
    initial_thread_message_text: "Initial thread message text",
    thread_auto_archive_minutes: "Thread auto-archive minutes",
    recipient_number_in_e_164_used_to_derive_the_session_key:
      "Recipient number in E.164 used to derive the session key",
    use_an_explicit_session_id: "Use an explicit session id",
    agent_id_overrides_routing_bindings: "Agent id (overrides routing bindings)",
    model_override_for_this_run_provider_model_or_model_id:
      "Model override for this run (provider/model or model id)",
    persist_agent_verbose_level_for_the_session: "Persist agent verbose level for the session",
    delivery_target_override_separate_from_session_routing:
      "Delivery target override (separate from session routing)",
    delivery_channel_override_separate_from_routing:
      "Delivery channel override (separate from routing)",
    delivery_account_id_override: "Delivery account id override",
    agent_id_defaults_to_current_default_agent: "Agent id (defaults to current default agent)",
    workspace_directory_for_the_new_agent: "Workspace directory for the new agent",
    model_id_for_this_agent: "Model id for this agent",
    agent_state_directory_for_this_agent: "Agent state directory for this agent",
    agent_id_to_update: "Agent id to update",
    workspace_directory_used_to_locate_the_agent_identity_md:
      "Workspace directory used to locate the agent + IDENTITY.md",
    explicit_identity_md_path_to_read: "Explicit IDENTITY.md path to read",
    identity_name: "Identity name",
    identity_theme: "Identity theme",
    identity_emoji: "Identity emoji",
    identity_avatar_workspace_path_http_s_url_or_data_uri:
      "Identity avatar (workspace path, http(s) URL, or data URI)",
    archive_path_or_destination_directory: "Archive path or destination directory",
    exclude_workspace_directories_from_the_backup: "Exclude workspace directories from the backup",
    run_one_crestodian_request: "Run one Crestodian request",
    print_url_but_do_not_launch_a_browser: "Print URL but do not launch a browser",
    config_config_creds_sessions_full_default_interactive_prompt:
      "config|config+creds+sessions|full (default: interactive prompt)",
    source_directory_to_migrate_from: "Source directory to migrate from",
    pre_migration_backup_archive_path_or_directory:
      "Pre-migration backup archive path or directory",
    skip_the_pre_migration_autopus_backup: "Skip the pre-migration Autopus backup",
    agent_workspace_directory_default_autopus_workspace:
      "Agent workspace directory (default: ~/.autopus/workspace)",
    reset_scope_config_config_creds_sessions_full: "Reset scope: config|config+creds+sessions|full",
    onboard_flow_quickstart_advanced_manual_import:
      "Onboard flow: quickstart|advanced|manual|import",
    onboard_mode_local_remote: "Onboard mode: local|remote",
    token_value_non_interactive_used_with_auth_choice_token:
      "Token value (non-interactive; used with --auth-choice token)",
    optional_token_expiry_duration_e_g_365d_12h: "Optional token expiry duration (e.g. 365d, 12h)",
    cloudflare_account_id: "Cloudflare Account ID",
    cloudflare_ai_gateway_id: "Cloudflare AI Gateway ID",
    custom_provider_base_url: "Custom provider base URL",
    custom_provider_api_key_optional: "Custom provider API key (optional)",
    custom_provider_model_id: "Custom provider model ID",
    custom_provider_id_optional_auto_derived_by_default:
      "Custom provider ID (optional; auto-derived by default)",
    mark_the_custom_provider_model_as_image_capable:
      "Mark the custom provider model as image-capable",
    mark_the_custom_provider_model_as_text_only: "Mark the custom provider model as text-only",
    gateway_bind_loopback_tailnet_lan_auto_custom: "Gateway bind: loopback|tailnet|lan|auto|custom",
    gateway_auth_token_password: "Gateway auth: token|password",
    remote_gateway_websocket_url: "Remote Gateway WebSocket URL",
    remote_gateway_token_optional: "Remote Gateway token (optional)",
    tailscale_off_serve_funnel: "Tailscale: off|serve|funnel",
    reset_tailscale_serve_funnel_on_exit: "Reset tailscale serve/funnel on exit",
    install_gateway_service: "Install gateway service",
    skip_gateway_service_install: "Skip gateway service install",
    daemon_runtime_node_bun: "Daemon runtime: node|bun",
    skip_channel_setup: "Skip channel setup",
    skip_skills_setup: "Skip skills setup",
    skip_creating_default_agent_workspace_files: "Skip creating default agent workspace files",
    skip_search_provider_setup: "Skip search provider setup",
    skip_health_check: "Skip health check",
    skip_control_ui_tui_prompts: "Skip Control UI/TUI prompts",
    skip_hook_setup: "Skip hook setup",
    node_manager_for_skills_npm_pnpm_bun: "Node manager for skills: npm|pnpm|bun",
    migration_provider_to_run_during_onboarding: "Migration provider to run during onboarding",
    source_agent_home_for_import_from: "Source agent home for --import-from",
    path_to_session_store_default_resolved_from_config:
      "Path to session store (default: resolved from config)",
    agent_id_to_inspect_default_configured_default_agent:
      "Agent id to inspect (default: configured default agent)",
    only_show_sessions_updated_within_the_past_n_minutes:
      "Only show sessions updated within the past N minutes",
    agent_id_to_maintain_default_configured_default_agent:
      "Agent id to maintain (default: configured default agent)",
    protect_this_session_key_from_budget_eviction: "Protect this session key from budget-eviction",
    session_key_to_export: "Session key to export",
    output_directory_name_inside_autopus_trajectory_exports:
      "Output directory name inside .autopus/trajectory-exports",
    workspace_root_for_the_export_default_current_directory:
      "Workspace root for the export (default: current directory)",
    path_to_session_store_default_resolved_from_session_key:
      "Path to session store (default: resolved from session key)",
    agent_id_for_resolving_the_default_session_store:
      "Agent id for resolving the default session store",
    base64url_encoded_export_request: "Base64url-encoded export request",
    agent_id_to_inspect: "Agent id to inspect",
    filter_by_status_pending_sent_dismissed_snoozed_expired:
      "Filter by status (pending, sent, dismissed, snoozed, expired)",
    filter_by_kind_subagent_acp_cron_cli: "Filter by kind (subagent, acp, cron, cli)",
    filter_by_severity_warn_error: "Filter by severity (warn, error)",
    limit_displayed_findings: "Limit displayed findings",
    print_machine_readable_json: "Print machine-readable JSON",
    proxy_url_to_validate_instead_of_config_env: "Proxy URL to validate instead of config/env",
    also_verify_sandbox_apns_http_2_is_reachable_through_the_proxy:
      "Also verify sandbox APNs HTTP/2 is reachable through the proxy",
    apns_authority_to_probe_with_apns_reachable: "APNs authority to probe with --apns-reachable",
    restrict_to_a_capture_session_id: "Restrict to a capture session id",
    override_gateway_url_used_in_the_setup_payload:
      "Override gateway URL used in the setup payload",
    override_gateway_public_url_used_in_the_setup_payload:
      "Override gateway public URL used in the setup payload",
    override_gateway_token_for_setup_payload: "Override gateway token for setup payload",
    override_gateway_password_for_setup_payload: "Override gateway password for setup payload",
    skip_ascii_qr_rendering: "Skip ASCII QR rendering",
    recreate_container_for_specific_session: "Recreate container for specific session",
    recreate_containers_for_specific_agent: "Recreate containers for specific agent",
    session_key_to_inspect_defaults_to_agent_main:
      "Session key to inspect (defaults to agent main)",
    agent_id_to_inspect_defaults_to_derived_agent:
      "Agent id to inspect (defaults to derived agent)",
    write_generated_plan_json_to_a_file: "Write generated plan JSON to a file",
    use_explicit_gateway_token_for_deep_probe_auth:
      "Use explicit gateway token for deep probe auth",
    use_explicit_gateway_password_for_deep_probe_auth:
      "Use explicit gateway password for deep probe auth",
    target_agent_workspace_defaults_to_cwd_inferred_then_default_agent:
      "Target agent workspace (defaults to cwd-inferred, then default agent)",
    install_a_specific_version: "Install a specific version",
    send_an_initial_message_after_connecting: "Send an initial message after connecting",
    agent_timeout_in_ms_defaults_to_agents_defaults_timeoutseconds:
      "Agent timeout in ms (defaults to agents.defaults.timeoutSeconds)",
    skip_restarting_the_gateway_service_after_a_successful_update:
      "Skip restarting the gateway service after a successful update",
    persist_update_channel_git_npm: "Persist update channel (git + npm)",
    timeout_for_each_update_step_in_seconds_default_1800:
      "Timeout for each update step in seconds (default: 1800)",
    timeout_for_update_checks_in_seconds_default_3:
      "Timeout for update checks in seconds (default: 3)",
    gcp_project_id_oauth_client_owner: "GCP project id (OAuth client owner)",
    autopus_hook_url: "Autopus hook URL",
    autopus_hook_token: "Autopus hook token",
    push_token_for_gog_watch_serve: "Push token for gog watch serve",
    path_for_tailscale_serve_funnel: "Path for tailscale serve/funnel",
    explicit_pub_sub_push_endpoint: "Explicit Pub/Sub push endpoint",
    gmail_account_to_watch: "Gmail account to watch",
    pub_sub_topic_path_projects_topics: "Pub/Sub topic path (projects/.../topics/..)",
    pub_sub_subscription_name: "Pub/Sub subscription name",
    gmail_label_to_watch: "Gmail label to watch",
    gog_watch_serve_bind_host: "gog watch serve bind host",
    gog_watch_serve_port: "gog watch serve port",
    gog_watch_serve_path: "gog watch serve path",
    include_email_body_snippets: "Include email body snippets",
    max_bytes_for_body_snippets: "Max bytes for body snippets",
    renew_watch_every_n_minutes: "Renew watch every N minutes",
    expose_push_endpoint_via_tailscale_funnel_serve_off:
      "Expose push endpoint via tailscale (funnel|serve|off)",
    cdp_target_id_or_unique_prefix: "CDP target id (or unique prefix)",
    mouse_button_to_use: "Mouse button to use",
    comma_separated_modifiers_shift_alt_meta: "Comma-separated modifiers (Shift,Alt,Meta)",
    ref_id_from_snapshot_to_click_after_arming: "Ref id from snapshot to click after arming",
    ref_id_for_input_type_file_to_set_directly: "Ref id for <input type=file> to set directly",
    css_selector_for_input_type_file: "CSS selector for <input type=file>",
    prompt_response_text: "Prompt response text",
    json_array_of_field_objects: "JSON array of field objects",
    read_json_array_from_a_file: "Read JSON array from a file",
    wait_for_text_to_appear: "Wait for text to appear",
    wait_for_text_to_disappear: "Wait for text to disappear",
    wait_for_url_supports_globs_like_dash: "Wait for URL (supports globs like **/dash)",
    wait_for_load_state: "Wait for load state",
    wait_for_js_condition_passed_to_waitforfunction:
      "Wait for JS condition (passed to waitForFunction)",
    function_source_e_g_el_el_textcontent: "Function source, e.g. (el) => el.textContent",
    ref_from_snapshot: "Ref from snapshot",
    filter_by_level_error_warn_info: "Filter by level (error, warn, info)",
    only_show_urls_that_contain_this_substring: "Only show URLs that contain this substring",
    disable_screenshots: "Disable screenshots",
    disable_snapshots: "Disable snapshots",
    aria_ref_from_ai_snapshot: "ARIA ref from ai snapshot",
    css_selector_for_element_screenshot: "CSS selector for element screenshot",
    snapshot_preset_efficient: "Snapshot preset (efficient)",
    role_snapshot_scope_to_css_selector: "Role snapshot: scope to CSS selector",
    role_snapshot_scope_to_an_iframe_selector: "Role snapshot: scope to an iframe selector",
    write_snapshot_to_a_file: "Write snapshot to a file",
    run_a_live_snapshot_probe: "Run a live snapshot probe",
    launch_a_local_managed_browser_headless_for_this_start:
      "Launch a local managed browser headless for this start",
    assign_a_friendly_tab_label: "Assign a friendly tab label",
    profile_color_hex_format_e_g_0066cc: "Profile color (hex format, e.g. #0066CC)",
    cdp_url_for_remote_chrome_http_https: "CDP URL for remote Chrome (http/https)",
    user_data_dir_for_existing_session_chromium_attach:
      "User data dir for existing-session Chromium attach",
    profile_driver_autopus_existing_session_default_autopus:
      "Profile driver (autopus|existing-session). Default: autopus",
    cookie_url_scope_recommended: "Cookie URL scope (recommended)",
    json_object_of_headers: "JSON object of headers",
    origin_to_grant_permissions_for: "Origin to grant permissions for",
    browser_profile: "Browser profile",
    gateway_websocket_url: "Gateway WebSocket URL",
    browser_profile_name_default_from_config: "Browser profile name (default from config)",
    jpeg_quality_optional: "JPEG quality (optional)",
    target_url_path_optional: "Target URL/path (optional)",
    placement_x_coordinate: "Placement x coordinate",
    placement_y_coordinate: "Placement y coordinate",
    placement_width: "Placement width",
    placement_height: "Placement height",
    node_invoke_timeout_in_ms: "Node invoke timeout in ms",
    javascript_to_evaluate: "JavaScript to evaluate",
    path_to_jsonl_payload: "Path to JSONL payload",
    render_a_quick_a2ui_text_payload: "Render a quick A2UI text payload",
    oauth_client_id_override: "OAuth client id override",
    oauth_client_secret_override: "OAuth client secret override",
    use_copy_paste_callback_flow_instead_of_localhost_callback:
      "Use copy/paste callback flow instead of localhost callback",
    access_token_override: "Access token override",
    refresh_token_override: "Refresh token override",
    cached_access_token_expiry_as_unix_epoch_milliseconds:
      "Cached access token expiry as unix epoch milliseconds",
    only_create_the_meeting_url_do_not_join_it: "Only create the meeting URL; do not join it",
    join_transport_chrome_chrome_node_or_twilio: "Join transport: chrome, chrome-node, or twilio",
    join_mode_agent_bidi_or_transcribe: "Join mode: agent, bidi, or transcribe",
    realtime_speech_to_trigger_after_join: "Realtime speech to trigger after join",
    meet_dial_in_number_for_twilio_transport: "Meet dial-in number for Twilio transport",
    meet_phone_pin_is_appended_if_omitted: "Meet phone PIN; # is appended if omitted",
    explicit_twilio_dtmf_sequence: "Explicit Twilio DTMF sequence",
    transport_chrome_chrome_node_or_twilio: "Transport: chrome, chrome-node, or twilio",
    mode_agent_bidi_or_transcribe: "Mode: agent, bidi, or transcribe",
    transport_chrome_or_chrome_node: "Transport: chrome or chrome-node",
    how_long_to_wait_for_fresh_captions_transcript_movement:
      "How long to wait for fresh captions/transcript movement",
    meet_url_meeting_code_or_spaces_id: "Meet URL, meeting code, or spaces/{id}",
    find_a_meet_link_on_today_s_calendar: "Find a Meet link on today's calendar",
    find_a_matching_calendar_event_with_a_meet_link:
      "Find a matching calendar event with a Meet link",
    find_meet_links_on_today_s_calendar: "Find Meet links on today's calendar",
    find_matching_calendar_events_with_meet_links: "Find matching calendar events with Meet links",
    conference_record_name_or_id: "Conference record name or id",
    max_resources_per_meet_api_page: "Max resources per Meet API page",
    fetch_every_conference_record_for_meeting: "Fetch every conference record for --meeting",
    skip_structured_transcript_entry_lookup: "Skip structured transcript entry lookup",
    export_linked_transcript_and_smart_note_google_docs_text:
      "Export linked transcript and smart-note Google Docs text",
    write_output_to_a_file_instead_of_stdout: "Write output to a file instead of stdout",
    keep_duplicate_participant_resources_as_separate_rows:
      "Keep duplicate participant resources as separate rows",
    output_directory: "Output directory",
    also_write_a_portable_zip_archive: "Also write a portable .zip archive",
    also_verify_spaces_get_for_a_meet_url_code_or_spaces_id:
      "Also verify spaces.get for a Meet URL, code, or spaces/{id}",
    transport_to_inspect_chrome_or_chrome_node: "Transport to inspect: chrome or chrome-node",
    transport_to_check_chrome_chrome_node_or_twilio:
      "Transport to check: chrome, chrome-node, or twilio",
    mode_to_check_agent_bidi_or_transcribe: "Mode to check: agent, bidi, or transcribe",
    account_id_default_normalized_name_else_default:
      "Account ID (default: normalized --name, else default)",
    optional_display_name_for_this_account: "Optional display name for this account",
    optional_matrix_avatar_url_mxc_or_http_s_url:
      "Optional Matrix avatar URL (mxc:// or http(s) URL)",
    matrix_homeserver_url: "Matrix homeserver URL",
    optional_http_s_proxy_url_for_matrix_requests: "Optional HTTP(S) proxy URL for Matrix requests",
    matrix_user_id: "Matrix user ID",
    matrix_access_token: "Matrix access token",
    matrix_password: "Matrix password",
    matrix_device_display_name: "Matrix device display name",
    matrix_initial_sync_limit: "Matrix initial sync limit",
    enable_matrix_end_to_end_encryption_and_bootstrap_verification:
      "Enable Matrix end-to-end encryption and bootstrap verification",
    alias_for_enable_e2ee: "Alias for --enable-e2ee",
    show_setup_details: "Show setup details",
    output_as_json: "Output as JSON",
    account_id_for_multi_account_setups: "Account ID (for multi-account setups)",
    profile_display_name: "Profile display name",
    profile_avatar_url_mxc_or_http_s_url: "Profile avatar URL (mxc:// or http(s) URL)",
    show_detailed_diagnostics: "Show detailed diagnostics",
    recovery_key_to_apply_before_bootstrap: "Recovery key to apply before bootstrap",
    force_reset_cross_signing_identity_before_bootstrap:
      "Force reset cross-signing identity before bootstrap",
    how_long_to_wait_for_the_other_matrix_client: "How long to wait for the other Matrix client",
    request_self_verification_for_this_matrix_account:
      "Request self-verification for this Matrix account",
    matrix_user_id_to_verify: "Matrix user ID to verify",
    matrix_device_id_to_verify: "Matrix device ID to verify",
    matrix_direct_message_room_id_for_verification:
      "Matrix direct-message room ID for verification",
    matrix_user_id_for_dm_verification_follow_up: "Matrix user ID for DM verification follow-up",
    matrix_direct_message_room_id_for_verification_follow_up:
      "Matrix direct-message room ID for verification follow-up",
    cancellation_reason: "Cancellation reason",
    matrix_cancellation_code: "Matrix cancellation code",
    include_stored_recovery_key_in_output: "Include stored recovery key in output",
    create_a_new_matrix_recovery_key_for_the_fresh_backup:
      "Create a new Matrix recovery key for the fresh backup",
    read_the_matrix_recovery_key_from_stdin: "Read the Matrix recovery key from stdin",
    agent_id_default_default_agent: "Agent id (default: default agent)",
    probe_embedding_provider_availability: "Probe embedding provider availability",
    reindex_if_dirty_implies_deep: "Reindex if dirty (implies --deep)",
    repair_stale_recall_locks_and_normalize_promotion_metadata:
      "Repair stale recall locks and normalize promotion metadata",
    search_query_alternative_to_positional_argument:
      "Search query (alternative to positional argument)",
    seed_the_harness_from_historical_daily_memory_file_s:
      "Seed the harness from historical daily memory file(s)",
    also_render_a_grounded_day_level_rem_preview: "Also render a grounded day-level REM preview",
    historical_daily_memory_file_s_or_directory: "Historical daily memory file(s) or directory",
    max_results: "Max results",
    columns_to_select_comma_separated: "Columns to select, comma-separated",
    filter_condition: "Filter condition",
    order_by_column_and_direction_e_g_createdat_desc:
      "Order by column and direction (e.g., createdAt:desc)",
    page_status: "Page status",
    override_the_source_title: "Override the source title",
    summary_body_text: "Summary body text",
    read_summary_body_text_from_a_file: "Read summary body text from a file",
    remove_any_stored_confidence_value: "Remove any stored confidence value",
    force_json_output: "Force JSON output",
    force_human_output: "Force human output",
    resolve_file_slot_against_this_directory: "Resolve file slot against this directory",
    override_the_file_slot_s_resolved_path: "Override the file slot's resolved path",
    print_bytes_without_writing: "Print bytes without writing",
    repository_root_to_target_when_running_from_a_neutral_cwd:
      "Repository root to target when running from a neutral cwd",
    report_output_path: "Report output path",
    suite_artifact_directory: "Suite artifact directory",
    primary_provider_model_ref: "Primary provider/model ref",
    alternate_provider_model_ref: "Alternate provider/model ref",
    multipass_image_alias: "Multipass image alias",
    multipass_memory_size: "Multipass memory size",
    multipass_disk_size: "Multipass disk size",
    artifact_directory_for_the_parity_report: "Artifact directory for the parity report",
    repository_root_to_target_when_writing_output:
      "Repository root to target when writing --output",
    write_the_coverage_inventory_to_this_path: "Write the coverage inventory to this path",
    character_eval_artifact_directory: "Character eval artifact directory",
    enable_provider_fast_mode_for_all_candidate_runs:
      "Enable provider fast mode for all candidate runs",
    primary_provider_model_ref_defaults_by_provider_mode:
      "Primary provider/model ref (defaults by provider mode)",
    override_autopus_qa_convex_site_url: "Override AUTOPUS_QA_CONVEX_SITE_URL",
    override_autopus_qa_convex_endpoint_prefix: "Override AUTOPUS_QA_CONVEX_ENDPOINT_PREFIX",
    optional_admin_actor_id_to_include_in_broker_audit_events:
      "Optional admin actor id to include in broker audit events",
    repository_root_for_resolving_relative_payload_file_paths:
      "Repository root for resolving relative payload-file paths",
    optional_note_stored_with_this_credential_row: "Optional note stored with this credential row",
    filter_by_credential_kind: "Filter by credential kind",
    optional_public_host_to_advertise_in_bootstrap_payloads:
      "Optional public host to advertise in bootstrap payloads",
    optional_control_ui_url_to_embed_beside_the_qa_panel:
      "Optional Control UI URL to embed beside the QA panel",
    optional_control_ui_token_for_embedded_links: "Optional Control UI token for embedded links",
    optional_qa_lab_ui_asset_directory_override: "Optional QA Lab UI asset directory override",
    kickoff_default_target_direct_or_channel: "Kickoff default target (direct or channel)",
    provider_base_url_for_the_qa_gateway: "Provider base URL for the QA gateway",
    output_directory_for_docker_compose_state_files:
      "Output directory for docker-compose + state files",
    mantis_before_after_artifact_directory: "Mantis before/after artifact directory",
    mantis_discord_smoke_artifact_directory: "Mantis Discord smoke artifact directory",
    override_autopus_qa_discord_guild_id: "Override AUTOPUS_QA_DISCORD_GUILD_ID",
    override_autopus_qa_discord_channel_id: "Override AUTOPUS_QA_DISCORD_CHANNEL_ID",
    env_var_containing_the_mantis_discord_bot_token:
      "Env var containing the Mantis Discord bot token",
    file_containing_the_mantis_discord_bot_token: "File containing the Mantis Discord bot token",
    env_var_containing_the_mantis_discord_bot_token_file_path:
      "Env var containing the Mantis Discord bot token file path",
    smoke_message_to_post: "Smoke message to post",
    mantis_desktop_browser_artifact_directory: "Mantis desktop browser artifact directory",
    url_to_open_in_the_visible_browser: "URL to open in the visible browser",
    repo_local_html_file_to_render_in_the_visible_browser:
      "Repo-local HTML file to render in the visible browser",
    octopusbox_binary_path: "Octopusbox binary path",
    octopusbox_provider: "Octopusbox provider",
    octopusbox_machine_class: "Octopusbox machine class",
    alias_for_machine_class: "Alias for --machine-class",
    reuse_an_existing_octopusbox_lease: "Reuse an existing Octopusbox lease",
    octopusbox_idle_timeout: "Octopusbox idle timeout",
    octopusbox_maximum_lease_lifetime: "Octopusbox maximum lease lifetime",
    visible_desktop_recording_duration_in_seconds: "Visible desktop recording duration in seconds",
    keep_a_lease_created_by_this_run_after_a_passing_smoke:
      "Keep a lease created by this run after a passing smoke",
    mantis_slack_desktop_artifact_directory: "Mantis Slack desktop artifact directory",
    stop_a_lease_created_by_this_run_after_a_passing_smoke:
      "Stop a lease created by this run after a passing smoke",
    start_a_persistent_autopus_slack_gateway_inside_the_vnc_vm:
      "Start a persistent Autopus Slack gateway inside the VNC VM",
    slack_web_url_to_open_in_the_visible_browser: "Slack web URL to open in the visible browser",
    slack_channel_id_for_gateway_setup_allowlist: "Slack channel id for gateway setup allowlist",
    qa_provider_mode: "QA provider mode",
    remote_hydrate_mode_source_or_prehydrated: "Remote hydrate mode: source or prehydrated",
    credential_source_for_slack_qa_env_or_convex: "Credential source for Slack QA: env or convex",
    credential_role_for_convex_auth: "Credential role for convex auth",
    enable_provider_fast_mode_where_supported: "Enable provider fast mode where supported",
    mantis_telegram_desktop_builder_artifact_directory:
      "Mantis Telegram desktop builder artifact directory",
    keep_a_lease_created_by_this_run_after_a_passing_builder_run:
      "Keep a lease created by this run after a passing builder run",
    stop_a_lease_created_by_this_run_after_a_passing_builder_run:
      "Stop a lease created by this run after a passing builder run",
    install_telegram_desktop_only_do_not_configure_autopus:
      "Install Telegram Desktop only; do not configure Autopus",
    credential_source_for_telegram_setup_env_or_convex:
      "Credential source for Telegram setup: env or convex",
    mantis_visual_task_artifact_directory: "Mantis visual-task artifact directory",
    keep_a_lease_created_by_this_run_after_a_passing_task:
      "Keep a lease created by this run after a passing task",
    desktop_recording_duration: "Desktop recording duration",
    milliseconds_to_wait_after_launch_before_screenshot:
      "Milliseconds to wait after launch before screenshot",
    vision_mode_image_describe_or_metadata: "Vision mode: image-describe or metadata",
    prompt_for_image_understanding: "Prompt for image understanding",
    image_capable_provider_model_ref: "Image-capable provider/model ref",
    image_understanding_timeout_in_milliseconds: "Image understanding timeout in milliseconds",
    case_insensitive_text_expected_in_the_vision_output:
      "Case-insensitive text expected in the vision output",
    octopusbox_lease_id: "Octopusbox lease id",
    phone_number_to_call_for_a_live_smoke: "Phone number to call for a live smoke",
    actually_place_the_live_outbound_call: "Actually place the live outbound call",
    message_to_speak_when_call_connects: "Message to speak when call connects",
    call_id: "Call ID",
    tailscale_path_to_expose_recommend_matching_serve_path:
      "Tailscale path to expose (recommend matching serve.path)",
    local_webhook_port: "Local webhook port",
    local_webhook_path: "Local webhook path",
    fail_if_the_session_key_label_does_not_exist: "Fail if the session key/label does not exist",
    reset_the_session_key_before_first_use: "Reset the session key before first use",
    do_not_prefix_prompts_with_the_working_directory:
      "Do not prefix prompts with the working directory",
    verbose_logging_to_stderr: "Verbose logging to stderr",
    enable_verbose_logging_on_the_acp_server: "Enable verbose logging on the ACP server",
    verbose_client_logging: "Verbose client logging",
    output_json: "Output JSON",
    image_file: "Image file",
    force_local_execution: "Force local execution",
    force_gateway_execution: "Force gateway execution",
    disable_the_active_tts_persona: "Disable the active TTS persona",
    include_bundled_and_installable_catalog_channels:
      "Include bundled and installable catalog channels",
    probe_channel_credentials: "Probe channel credentials",
    timeout_in_ms: "Timeout in ms",
    target_kind_auto_user_group: "Target kind (auto|user|group)",
    number_of_lines_default_200: "Number of lines (default: 200)",
    use_env_backed_credentials_when_supported: "Use env-backed credentials when supported",
    delete_config_entries_no_prompt: "Delete config entries (no prompt)",
    verbose_connection_logs: "Verbose connection logs",
    skip_confirmation_non_interactive: "Skip confirmation (non-interactive)",
    strict_json_parsing_error_instead_of_raw_string_fallback:
      "Strict JSON parsing (error instead of raw string fallback)",
    legacy_alias_for_strict_json: "Legacy alias for --strict-json",
    merge_object_map_values_instead_of_replacing_the_target_path:
      "Merge object/map values instead of replacing the target path",
    provider_builder_exec_require_json_output: "Provider builder (exec): require JSON output",
    read_a_json5_config_patch_object_from_stdin: "Read a JSON5 config patch object from stdin",
    output_dry_run_result_as_json: "Output dry-run result as JSON",
    output_validation_result_as_json: "Output validation result as JSON",
    include_disabled_jobs: "Include disabled jobs",
    create_job_disabled: "Create job disabled",
    delete_one_shot_job_after_it_succeeds: "Delete one-shot job after it succeeds",
    keep_one_shot_job_after_it_succeeds: "Keep one-shot job after it succeeds",
    use_lightweight_bootstrap_context_for_agent_jobs:
      "Use lightweight bootstrap context for agent jobs",
    do_not_fail_the_job_if_delivery_fails: "Do not fail the job if delivery fails",
    enable_job: "Enable job",
    disable_job: "Disable job",
    unset_agent_and_use_default: "Unset agent and use default",
    unset_session_key: "Unset session key",
    remove_tool_allow_list_use_all_tools: "Remove tool allow-list (use all tools)",
    max_entries_default_50: "Max entries (default 50)",
    run_only_when_due_default_behavior_in_older_versions:
      "Run only when due (default behavior in older versions)",
    exit_non_zero_when_the_rpc_probe_fails: "Exit non-zero when the RPC probe fails",
    scan_system_level_services: "Scan system-level services",
    reinstall_overwrite_if_already_installed: "Reinstall/overwrite if already installed",
    restart_immediately_without_waiting_for_active_gateway_work:
      "Restart immediately without waiting for active gateway work",
    request_an_autopus_aware_restart_after_active_work_drains:
      "Request an Autopus-aware restart after active work drains",
    bypass_the_safe_restart_deferral_gate_requires_safe:
      "Bypass the safe-restart deferral gate; requires --safe",
    also_reject_all_pending_pairing_requests: "Also reject all pending pairing requests",
    confirm_destructive_clear: "Confirm destructive clear",
    show_the_most_recent_pending_request_to_approve_explicitly:
      "Show the most recent pending request to approve explicitly",
    force_gateway_approvals: "Force gateway approvals",
    read_json_from_stdin: "Read JSON from stdin",
    wait_for_final_response_agent: "Wait for final response (agent)",
    json_object_string_for_params: "JSON object string for params",
    number_of_days_to_include: "Number of days to include",
    maximum_number_of_recent_events: "Maximum number of recent events",
    write_a_shareable_support_diagnostics_export: "Write a shareable support diagnostics export",
    maximum_sanitized_log_lines_to_include: "Maximum sanitized log lines to include",
    maximum_log_bytes_to_inspect: "Maximum log bytes to inspect",
    status_health_snapshot_timeout_in_ms: "Status/health snapshot timeout in ms",
    try_to_derive_an_ssh_target_from_bonjour_discovery:
      "Try to derive an SSH target from Bonjour discovery",
    overall_probe_budget_in_ms: "Overall probe budget in ms",
    per_command_timeout_in_ms: "Per-command timeout in ms",
    create_a_dev_config_workspace_if_missing_no_bootstrap_md:
      "Create a dev config + workspace if missing (no BOOTSTRAP.md)",
    kill_any_existing_listener_on_the_target_port_before_starting:
      "Kill any existing listener on the target port before starting",
    verbose_logging_to_stdout_stderr: "Verbose logging to stdout/stderr",
    deprecated_alias_for_cli_backend_logs: "Deprecated alias for --cli-backend-logs",
    log_raw_model_stream_events_to_jsonl: "Log raw model stream events to jsonl",
    show_only_eligible_hooks: "Show only eligible hooks",
    show_more_details_including_missing_requirements:
      "Show more details including missing requirements",
    gateway_timeout_in_ms: "Gateway timeout in ms",
    link_a_local_path_instead_of_copying: "Link a local path instead of copying",
    record_npm_installs_as_exact_resolved_name_version:
      "Record npm installs as exact resolved <name>@<version>",
    update_all_tracked_hooks: "Update all tracked hooks",
    show_what_would_change_without_writing: "Show what would change without writing",
    max_lines_to_return: "Max lines to return",
    max_bytes_to_read: "Max bytes to read",
    follow_log_output: "Follow log output",
    polling_interval_in_ms: "Polling interval in ms",
    emit_json_log_lines: "Emit JSON log lines",
    plain_text_output_no_ansi_styling: "Plain text output (no ANSI styling)",
    display_timestamps_in_local_timezone: "Display timestamps in local timezone",
    output_json_alias_for_models_status_json: "Output JSON (alias for `models status --json`)",
    plain_output_alias_for_models_status_plain: "Plain output (alias for `models status --plain`)",
    show_full_model_catalog: "Show full model catalog",
    filter_to_local_models: "Filter to local models",
    plain_line_output: "Plain line output",
    plain_output: "Plain output",
    probe_configured_provider_auth_live: "Probe configured provider auth (live)",
    max_fallback_candidates: "Max fallback candidates",
    accept_defaults_without_prompting: "Accept defaults without prompting",
    set_agents_defaults_model_to_the_first_selection:
      "Set agents.defaults.model to the first selection",
    set_agents_defaults_imagemodel_to_the_first_image_selection:
      "Set agents.defaults.imageModel to the first image selection",
    apply_the_provider_s_default_model_recommendation:
      "Apply the provider's default model recommendation",
    skip_confirmation: "Skip confirmation",
    overwrite_existing_profile_without_prompting: "Overwrite existing profile without prompting",
    use_tls_for_the_gateway_connection: "Use TLS for the gateway connection",
    camera_facing: "Camera facing",
    node_invoke_timeout_in_ms_default_20000: "Node invoke timeout in ms (default 20000)",
    node_invoke_timeout_in_ms_default_90000: "Node invoke timeout in ms (default 90000)",
    node_invoke_timeout_in_ms_default_15000: "Node invoke timeout in ms (default 15000)",
    location_fix_timeout_ms: "Location fix timeout (ms)",
    delivery_mode: "Delivery mode",
    push_title: "Push title",
    screen_index_0_primary: "Screen index (0 = primary)",
    clip_duration_ms_or_10s: "Clip duration (ms or 10s)",
    frames_per_second: "Frames per second",
    node_invoke_timeout_in_ms_default_120000: "Node invoke timeout in ms (default 120000)",
    notify_the_requester_on_the_same_channel: "Notify the requester on the same channel",
    only_show_enabled_plugins: "Only show enabled plugins",
    show_detailed_entries: "Show detailed entries",
    keep_installed_files_on_disk: "Keep installed files on disk",
    deprecated_alias_for_keep_files: "Deprecated alias for --keep-files",
    skip_confirmation_prompt: "Skip confirmation prompt",
    show_what_would_be_removed_without_making_changes:
      "Show what would be removed without making changes",
    overwrite_an_existing_installed_plugin_or_hook_pack:
      "Overwrite an existing installed plugin or hook pack",
    update_all_tracked_plugins_and_hook_packs: "Update all tracked plugins and hook packs",
    rebuild_the_persisted_registry_from_current_plugin_manifests:
      "Rebuild the persisted registry from current plugin manifests",
    ansi: "ANSI 색상을 비활성화합니다",
    output_result_as_json: "Output result as JSON",
    print_payload_and_skip_sending: "Print payload and skip sending",
    verbose_logging: "Verbose logging",
    role_id_repeat: "Role id (repeat)",
    channel_id_repeat: "Channel id (repeat)",
    author_id_repeat: "Author id (repeat)",
    allow_multiple_selections: "Allow multiple selections",
    send_an_anonymous_poll_telegram: "Send an anonymous poll (Telegram)",
    send_a_non_anonymous_poll_telegram: "Send a non-anonymous poll (Telegram)",
    remove_reaction: "Remove reaction",
    whatsapp_reaction_fromme: "WhatsApp reaction fromMe",
    include_thread_replies_discord: "Include thread replies (Discord)",
    request_that_the_delivered_message_be_pinned_when_supported:
      "Request that the delivered message be pinned when supported",
    treat_video_media_as_gif_playback_whatsapp_only:
      "Treat video media as GIF playback (WhatsApp only).",
    include_archived_threads: "Include archived threads",
    send_the_agent_s_reply_back_to_the_selected_channel:
      "Send the agent's reply back to the selected channel",
    output_json_instead_of_text: "Output JSON instead of text",
    include_routing_bindings: "Include routing bindings",
    output_json_summary: "Output JSON summary",
    binding_to_remove_repeatable: "Binding to remove (repeatable)",
    remove_all_bindings_for_this_agent: "Remove all bindings for this agent",
    route_channel_binding_repeatable: "Route channel binding (repeatable)",
    disable_prompts_requires_workspace: "Disable prompts; requires --workspace",
    read_values_from_identity_md: "Read values from IDENTITY.md",
    print_the_backup_plan_without_writing_the_archive:
      "Print the backup plan without writing the archive",
    verify_the_archive_after_writing_it: "Verify the archive after writing it",
    back_up_only_the_active_json_config_file: "Back up only the active JSON config file",
    approve_persistent_config_writes_for_this_request:
      "Approve persistent config writes for this request",
    output_startup_overview_as_json: "Output startup overview as JSON",
    disable_workspace_memory_system_suggestions: "Disable workspace memory system suggestions",
    apply_recommended_repairs_without_prompting: "Apply recommended repairs without prompting",
    apply_recommended_repairs_alias_for_repair: "Apply recommended repairs (alias for --repair)",
    apply_aggressive_repairs_overwrites_custom_service_config:
      "Apply aggressive repairs (overwrites custom service config)",
    run_without_prompts_safe_migrations_only: "Run without prompts (safe migrations only)",
    generate_and_configure_a_gateway_token: "Generate and configure a gateway token",
    scan_system_services_for_extra_gateway_installs:
      "Scan system services for extra gateway installs",
    skip_confirmation_prompts: "Skip confirmation prompts",
    disable_prompts_requires_scope_yes: "Disable prompts (requires --scope + --yes)",
    print_actions_without_removing_files: "Print actions without removing files",
    remove_the_gateway_service: "Remove the gateway service",
    remove_state_config: "Remove state + config",
    remove_workspace_dirs: "Remove workspace dirs",
    remove_the_macos_app: "Remove the macOS app",
    remove_service_state_workspace_app: "Remove service + state + workspace + app",
    disable_prompts_requires_yes: "Disable prompts (requires --yes)",
    import_supported_credentials_and_secrets: "Import supported credentials and secrets",
    overwrite_conflicting_target_files_after_item_level_backups:
      "Overwrite conflicting target files after item-level backups",
    preview_only_do_not_apply_changes: "Preview only; do not apply changes",
    apply_without_prompting_after_preview: "Apply without prompting after preview",
    allow_dangerous_options_such_as_no_backup: "Allow dangerous options such as --no-backup",
    apply_without_prompting: "Apply without prompting",
    run_without_prompts: "Run without prompts",
    use_the_conversational_setup_repair_assistant: "Use the conversational setup/repair assistant",
    import_supported_secrets_during_onboarding_migration:
      "Import supported secrets during onboarding migration",
    run_interactive_onboarding: "Run interactive onboarding",
    run_onboarding_without_prompts: "Run onboarding without prompts",
    full_diagnosis_read_only_pasteable: "Full diagnosis (read-only, pasteable)",
    show_model_provider_usage_quota_snapshots: "Show model provider usage/quota snapshots",
    probe_channels_whatsapp_web_telegram_discord_slack_signal:
      "Probe channels (WhatsApp Web + Telegram + Discord + Slack + Signal)",
    probe_timeout_in_milliseconds: "Probe timeout in milliseconds",
    alias_for_verbose: "Alias for --verbose",
    connection_timeout_in_milliseconds: "Connection timeout in milliseconds",
    aggregate_sessions_across_all_configured_agents:
      "Aggregate sessions across all configured agents",
    run_maintenance_across_all_configured_agents: "Run maintenance across all configured agents",
    preview_maintenance_actions_without_writing: "Preview maintenance actions without writing",
    apply_maintenance_even_when_configured_mode_is_warn:
      "Apply maintenance even when configured mode is warn",
    show_all_statuses: "Show all statuses",
    apply_reconciliation_cleanup_stamping_and_pruning:
      "Apply reconciliation, cleanup stamping, and pruning",
    bind_host: "Bind host",
    bind_port: "Bind port",
    destination_expected_to_be_blocked_by_the_proxy:
      "Destination expected to be blocked by the proxy",
    per_request_timeout_in_milliseconds: "Per-request timeout in milliseconds",
    maximum_sessions_to_show: "Maximum sessions to show",
    print_only_the_setup_code: "Print only the setup code",
    list_browser_containers_only: "List browser containers only",
    recreate_all_sandbox_containers: "Recreate all sandbox containers",
    only_recreate_browser_containers: "Only recreate browser containers",
    exit_non_zero_when_findings_are_present: "Exit non-zero when findings are present",
    apply_changes_immediately_after_preflight: "Apply changes immediately after preflight",
    skip_apply_confirmation_prompt: "Skip apply confirmation prompt",
    configure_secrets_providers_only_skip_credential_mapping:
      "Configure secrets.providers only, skip credential mapping",
    validate_preflight_only: "Validate/preflight only",
    allow_exec_secretref_checks_may_execute_provider_commands:
      "Allow exec SecretRef checks (may execute provider commands)",
    attempt_live_gateway_probes_and_plugin_owned_collector_checks:
      "Attempt live Gateway probes and plugin-owned collector checks",
    apply_safe_fixes_tighten_defaults_chmod_state_config:
      "Apply safe fixes (tighten defaults + chmod state/config)",
    overwrite_an_existing_workspace_skill: "Overwrite an existing workspace skill",
    update_all_tracked_clawhub_skills: "Update all tracked ClawHub skills",
    show_only_eligible_ready_to_use_skills: "Show only eligible (ready to use) skills",
    run_against_the_local_embedded_agent_runtime: "Run against the local embedded agent runtime",
    deliver_assistant_replies: "Deliver assistant replies",
    history_entries_to_load: "History entries to load",
    preview_update_actions_without_making_changes: "Preview update actions without making changes",
    skip_confirmation_prompts_non_interactive: "Skip confirmation prompts (non-interactive)",
    pub_sub_topic_name: "Pub/Sub topic name",
    double_click: "Double click",
    delay_between_mouse_down_up: "Delay between mouse down/up",
    press_enter_after_typing: "Press Enter after typing",
    type_slowly_human_like: "Type slowly (human-like)",
    how_long_to_wait_for_scroll_default_20000: "How long to wait for scroll (default: 20000)",
    accept_the_dialog: "Accept the dialog",
    dismiss_the_dialog: "Dismiss the dialog",
    wait_for_n_milliseconds: "Wait for N milliseconds",
    max_body_chars_to_return_default_200000: "Max body chars to return (default: 200000)",
    clear_stored_errors_after_reading: "Clear stored errors after reading",
    clear_stored_requests_after_reading: "Clear stored requests after reading",
    include_sources_bigger_traces: "Include sources (bigger traces)",
    capture_full_scrollable_page: "Capture full scrollable page",
    overlay_role_refs_on_the_screenshot: "Overlay role refs on the screenshot",
    output_type_default_png: "Output type (default: png)",
    snapshot_format_default_ai: "Snapshot format (default: ai)",
    max_nodes_default_500_800: "Max nodes (default: 500/800)",
    use_the_efficient_snapshot_preset: "Use the efficient snapshot preset",
    role_snapshot_interactive_elements_only: "Role snapshot: interactive elements only",
    role_snapshot_compact_output: "Role snapshot: compact output",
    role_snapshot_max_depth: "Role snapshot: max depth",
    include_viewport_label_overlay_screenshot: "Include viewport label overlay screenshot",
    append_discovered_link_urls_to_ai_snapshots: "Append discovered link URLs to AI snapshots",
    clear_credentials: "Clear credentials",
    clear_geolocation_permissions: "Clear geolocation + permissions",
    accuracy_in_meters: "Accuracy in meters",
    output_machine_readable_json: "Output machine-readable JSON",
    image_format: "Image format",
    print_the_token_payload_as_json: "Print the token payload as JSON",
    local_callback_timeout_in_seconds: "Local callback timeout in seconds",
    print_json_output: "Print JSON output",
    calendar_id_for_today_or_event: "Calendar id for --today or --event",
    calendar_id_for_lookup: "Calendar id for lookup",
    output_format_summary_or_markdown: "Output format: summary or markdown",
    mark_participants_late_after_this_many_minutes:
      "Mark participants late after this many minutes",
    mark_early_leavers_before_this_many_minutes: "Mark early leavers before this many minutes",
    output_format_summary_markdown_or_csv: "Output format: summary, markdown, or csv",
    fetch_export_data_and_print_the_manifest_without_writing_files:
      "Fetch export data and print the manifest without writing files",
    verify_google_meet_oauth_token_refresh_without_printing_secrets:
      "Verify Google Meet OAuth token refresh without printing secrets",
    also_verify_spaces_create_by_creating_a_throwaway_meet_space:
      "Also verify spaces.create by creating a throwaway Meet space",
    confirm_destructive_backup_reset: "Confirm destructive backup reset",
    force_full_reindex: "Force full reindex",
    minimum_score: "Minimum score",
    max_candidates: "Max candidates",
    append_selected_candidates_to_memory_md: "Append selected candidates to MEMORY.md",
    include_already_promoted_candidates: "Include already promoted candidates",
    include_already_promoted_deep_candidates: "Include already promoted deep candidates",
    remove_previously_written_grounded_rem_backfill_entries:
      "Remove previously written grounded REM backfill entries",
    order_memories_by_createdat_descending: "Order memories by createdAt descending",
    limit_number_of_results: "Limit number of results",
    source_id: "Source id",
    contradiction_note: "Contradiction note",
    open_question: "Open question",
    confidence_score_between_0_and_1: "Confidence score between 0 and 1",
    maximum_results: "Maximum results",
    start_line: "Start line",
    number_of_lines: "Number of lines",
    preview_changes_without_writing: "Preview changes without writing",
    execution_runner_host_or_multipass: "Execution runner: host or multipass",
    qa_transport_id: "QA transport id",
    run_only_the_named_qa_scenario_repeatable: "Run only the named QA scenario (repeatable)",
    scenario_worker_concurrency: "Scenario worker concurrency",
    run_a_single_scenario_bootstrap_preflight_and_stop:
      "Run a single-scenario bootstrap preflight and stop",
    multipass_vcpu_count: "Multipass vCPU count",
    baseline_display_label: "Baseline display label",
    print_json_instead_of_markdown: "Print JSON instead of Markdown",
    character_scenario_id: "Character scenario id",
    override_judge_wait_timeout: "Override judge wait timeout",
    candidate_model_run_concurrency: "Candidate model run concurrency",
    judge_model_run_concurrency: "Judge model run concurrency",
    override_agent_wait_timeout: "Override agent.wait timeout",
    emit_machine_readable_json_output: "Emit machine-readable JSON output",
    max_rows_to_return: "Max rows to return",
    include_credential_payload_json_in_output: "Include credential payload JSON in output",
    optional_public_port_to_advertise: "Optional public port to advertise",
    embedded_gateway_mode_hint: "Embedded gateway mode hint",
    gateway_host_port: "Gateway host port",
    qa_lab_host_port: "QA lab host port",
    prebaked_image_name: "Prebaked image name",
    use_image_instead_of_build_in_docker_compose: "Use image: instead of build: in docker-compose",
    image_tag: "Image tag",
    skip_pnpm_qa_lab_build_before_starting_docker: "Skip pnpm qa:lab:build before starting Docker",
    qa_credential_source: "QA credential source",
    qa_credential_role: "QA credential role",
    enable_fast_provider_mode_where_supported: "Enable fast provider mode where supported",
    skip_pnpm_install_in_baseline_candidate_worktrees:
      "Skip pnpm install in baseline/candidate worktrees",
    skip_pnpm_build_in_baseline_candidate_worktrees:
      "Skip pnpm build in baseline/candidate worktrees",
    only_check_discord_api_visibility_do_not_post_or_react:
      "Only check Discord API visibility; do not post or react",
    call_mode_notify_or_conversation: "Call mode: notify or conversation",
    path_to_calls_jsonl: "Path to calls.jsonl",
    print_last_n_lines_first: "Print last N lines first",
    poll_interval_in_ms: "Poll interval in ms",
    analyze_last_n_records: "Analyze last N records",
    off_serve_tailnet_funnel_public: "off | serve (tailnet) | funnel (public)",
  },
} as const satisfies CliMessageTree;

export type CliMessages = typeof en;
