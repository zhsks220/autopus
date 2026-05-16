import type { Command } from "commander";
import { danger } from "../globals.js";
import {
  type GmailRunOptions,
  type GmailSetupOptions,
  runGmailService,
  runGmailSetup,
} from "../hooks/gmail-ops.js";
import {
  DEFAULT_GMAIL_LABEL,
  DEFAULT_GMAIL_MAX_BYTES,
  DEFAULT_GMAIL_RENEW_MINUTES,
  DEFAULT_GMAIL_SERVE_BIND,
  DEFAULT_GMAIL_SERVE_PATH,
  DEFAULT_GMAIL_SERVE_PORT,
  DEFAULT_GMAIL_SUBSCRIPTION,
  DEFAULT_GMAIL_TOPIC,
} from "../hooks/gmail.js";
import { t } from "../i18n/cli/translate.js";
import { defaultRuntime } from "../runtime.js";
import { normalizeOptionalString } from "../shared/string-coerce.js";
import { formatDocsLink } from "../terminal/links.js";
import { theme } from "../terminal/theme.js";
import { formatCliCommand } from "./command-format.js";

export function registerWebhooksCli(program: Command) {
  const webhooks = program
    .command("webhooks")
    .description(t("desc.webhook_helpers_and_integrations"))
    .addHelpText(
      "after",
      () =>
        `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/webhooks", "docs.autopus.ai/cli/webhooks")}\n`,
    );

  const gmail = webhooks.command("gmail").description(t("desc.gmail_pub_sub_hooks_via_gogcli"));

  gmail
    .command("setup")
    .description(t("desc.configure_gmail_watch_pub_sub_autopus_hooks"))
    .requiredOption("--account <email>", "Gmail account to watch")
    .option("--project <id>", t("opt.gcp_project_id_oauth_client_owner"))
    .option("--topic <name>", t("opt.pub_sub_topic_name"), DEFAULT_GMAIL_TOPIC)
    .option("--subscription <name>", t("opt.pub_sub_subscription_name"), DEFAULT_GMAIL_SUBSCRIPTION)
    .option("--label <label>", t("opt.gmail_label_to_watch"), DEFAULT_GMAIL_LABEL)
    .option("--hook-url <url>", t("opt.autopus_hook_url"))
    .option("--hook-token <token>", t("opt.autopus_hook_token"))
    .option("--push-token <token>", t("opt.push_token_for_gog_watch_serve"))
    .option("--bind <host>", t("opt.gog_watch_serve_bind_host"), DEFAULT_GMAIL_SERVE_BIND)
    .option("--port <port>", t("opt.gog_watch_serve_port"), String(DEFAULT_GMAIL_SERVE_PORT))
    .option("--path <path>", t("opt.gog_watch_serve_path"), DEFAULT_GMAIL_SERVE_PATH)
    .option("--include-body", t("opt.include_email_body_snippets"), true)
    .option(
      "--max-bytes <n>",
      t("opt.max_bytes_for_body_snippets"),
      String(DEFAULT_GMAIL_MAX_BYTES),
    )
    .option(
      "--renew-minutes <n>",
      "Renew watch every N minutes",
      String(DEFAULT_GMAIL_RENEW_MINUTES),
    )
    .option(
      "--tailscale <mode>",
      t("opt.expose_push_endpoint_via_tailscale_funnel_serve_off"),
      "funnel",
    )
    .option("--tailscale-path <path>", t("opt.path_for_tailscale_serve_funnel"))
    .option(
      "--tailscale-target <target>",
      "Tailscale serve/funnel target (port, host:port, or URL)",
    )
    .option("--push-endpoint <url>", t("opt.explicit_pub_sub_push_endpoint"))
    .option("--json", t("opt.output_json_summary"), false)
    .action(async (opts) => {
      try {
        const parsed = parseGmailSetupOptions(opts);
        await runGmailSetup(parsed);
      } catch (err) {
        defaultRuntime.error(danger(String(err)));
        defaultRuntime.exit(1);
      }
    });

  gmail
    .command("run")
    .description(t("desc.run_gog_watch_serve_auto_renew_loop"))
    .option("--account <email>", t("opt.gmail_account_to_watch"))
    .option("--topic <topic>", t("opt.pub_sub_topic_path_projects_topics"))
    .option("--subscription <name>", t("opt.pub_sub_subscription_name"))
    .option("--label <label>", t("opt.gmail_label_to_watch"))
    .option("--hook-url <url>", t("opt.autopus_hook_url"))
    .option("--hook-token <token>", t("opt.autopus_hook_token"))
    .option("--push-token <token>", t("opt.push_token_for_gog_watch_serve"))
    .option("--bind <host>", t("opt.gog_watch_serve_bind_host"))
    .option("--port <port>", t("opt.gog_watch_serve_port"))
    .option("--path <path>", t("opt.gog_watch_serve_path"))
    .option("--include-body", t("opt.include_email_body_snippets"))
    .option("--max-bytes <n>", t("opt.max_bytes_for_body_snippets"))
    .option("--renew-minutes <n>", t("opt.renew_watch_every_n_minutes"))
    .option("--tailscale <mode>", t("opt.expose_push_endpoint_via_tailscale_funnel_serve_off"))
    .option("--tailscale-path <path>", t("opt.path_for_tailscale_serve_funnel"))
    .option(
      "--tailscale-target <target>",
      "Tailscale serve/funnel target (port, host:port, or URL)",
    )
    .action(async (opts) => {
      try {
        const parsed = parseGmailRunOptions(opts);
        await runGmailService(parsed);
      } catch (err) {
        defaultRuntime.error(danger(String(err)));
        defaultRuntime.exit(1);
      }
    });
}

function parseGmailSetupOptions(raw: Record<string, unknown>): GmailSetupOptions {
  const accountRaw = raw.account;
  const account = normalizeOptionalString(accountRaw) ?? "";
  if (!account) {
    throw new Error(
      `--account is required. Example: ${formatCliCommand("autopus webhooks gmail setup --account default")}.`,
    );
  }
  const common = parseGmailCommonOptions(raw);
  return {
    account,
    project: normalizeOptionalString(raw.project),
    ...gmailOptionsFromCommon(common),
    pushEndpoint: normalizeOptionalString(raw.pushEndpoint),
    json: Boolean(raw.json),
  };
}

function parseGmailRunOptions(raw: Record<string, unknown>): GmailRunOptions {
  const common = parseGmailCommonOptions(raw);
  return {
    account: normalizeOptionalString(raw.account),
    ...gmailOptionsFromCommon(common),
  };
}

function parseGmailCommonOptions(raw: Record<string, unknown>) {
  return {
    topic: normalizeOptionalString(raw.topic),
    subscription: normalizeOptionalString(raw.subscription),
    label: normalizeOptionalString(raw.label),
    hookUrl: normalizeOptionalString(raw.hookUrl),
    hookToken: normalizeOptionalString(raw.hookToken),
    pushToken: normalizeOptionalString(raw.pushToken),
    bind: normalizeOptionalString(raw.bind),
    port: numberOption(raw.port),
    path: normalizeOptionalString(raw.path),
    includeBody: booleanOption(raw.includeBody),
    maxBytes: numberOption(raw.maxBytes),
    renewEveryMinutes: numberOption(raw.renewMinutes),
    tailscaleRaw: normalizeOptionalString(raw.tailscale),
    tailscalePath: normalizeOptionalString(raw.tailscalePath),
    tailscaleTarget: normalizeOptionalString(raw.tailscaleTarget),
  };
}

function gmailOptionsFromCommon(
  common: ReturnType<typeof parseGmailCommonOptions>,
): Omit<GmailRunOptions, "account"> {
  return {
    topic: common.topic,
    subscription: common.subscription,
    label: common.label,
    hookUrl: common.hookUrl,
    hookToken: common.hookToken,
    pushToken: common.pushToken,
    bind: common.bind,
    port: common.port,
    path: common.path,
    includeBody: common.includeBody,
    maxBytes: common.maxBytes,
    renewEveryMinutes: common.renewEveryMinutes,
    tailscale: common.tailscaleRaw as GmailRunOptions["tailscale"],
    tailscalePath: common.tailscalePath,
    tailscaleTarget: common.tailscaleTarget,
  };
}

function numberOption(value: unknown): number | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n <= 0) {
    return undefined;
  }
  return Math.floor(n);
}

function booleanOption(value: unknown): boolean | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  return Boolean(value);
}
