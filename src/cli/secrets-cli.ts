import fs from "node:fs";
import { confirm } from "@clack/prompts";
import type { Command } from "commander";
import { danger } from "../globals.js";
import { t } from "../i18n/cli/translate.js";
import { formatErrorMessage } from "../infra/errors.js";
import { defaultRuntime } from "../runtime.js";
import { runSecretsApply } from "../secrets/apply.js";
import { resolveSecretsAuditExitCode, runSecretsAudit } from "../secrets/audit.js";
import { runSecretsConfigureInteractive } from "../secrets/configure.js";
import { isSecretsApplyPlan, type SecretsApplyPlan } from "../secrets/plan.js";
import { formatDocsLink } from "../terminal/links.js";
import { theme } from "../terminal/theme.js";
import { formatCliCommand } from "./command-format.js";
import { formatGatewayCommandFailure } from "./error-format.js";
import { addGatewayClientOptions, callGatewayFromCli, type GatewayRpcOpts } from "./gateway-rpc.js";

type SecretsReloadOptions = GatewayRpcOpts & { json?: boolean };
type SecretsAuditOptions = {
  check?: boolean;
  json?: boolean;
  allowExec?: boolean;
};
type SecretsConfigureOptions = {
  apply?: boolean;
  yes?: boolean;
  planOut?: string;
  providersOnly?: boolean;
  skipProviderSetup?: boolean;
  agent?: string;
  allowExec?: boolean;
  json?: boolean;
};
type SecretsApplyOptions = {
  from: string;
  dryRun?: boolean;
  allowExec?: boolean;
  json?: boolean;
};

function readPlanFile(pathname: string): SecretsApplyPlan {
  const raw = fs.readFileSync(pathname, "utf8");
  const parsed = JSON.parse(raw) as unknown;
  if (!isSecretsApplyPlan(parsed)) {
    throw new Error(
      `Invalid secrets plan file: ${pathname}. Generate a fresh plan with ${formatCliCommand("autopus secrets configure --plan-out <path>")}.`,
    );
  }
  return parsed;
}

export function registerSecretsCli(program: Command) {
  const secrets = program
    .command("secrets")
    .description(t("desc.secrets_runtime_controls"))
    .addHelpText(
      "after",
      () =>
        `\n${theme.muted("Docs:")} ${formatDocsLink("/gateway/security", "docs.autopus.ai/gateway/security")}\n`,
    );

  addGatewayClientOptions(
    secrets
      .command("reload")
      .description(t("desc.re_resolve_secret_references_and_atomically_swap_runtime_snapshot"))
      .option("--json", t("opt.output_json"), false),
  ).action(async (opts: SecretsReloadOptions) => {
    try {
      const result = await callGatewayFromCli("secrets.reload", opts, undefined, {
        expectFinal: false,
      });
      if (opts.json) {
        defaultRuntime.writeJson(result);
        return;
      }
      const warningCount = Number(
        (result as { warningCount?: unknown } | undefined)?.warningCount ?? 0,
      );
      if (Number.isFinite(warningCount) && warningCount > 0) {
        defaultRuntime.log(`Secrets reloaded with ${warningCount} warning(s).`);
        return;
      }
      defaultRuntime.log("Secrets reloaded.");
    } catch (err) {
      defaultRuntime.error(
        danger(
          formatGatewayCommandFailure({
            action: "reload secrets",
            error: err,
            inspectCommand: "autopus gateway status --deep",
          }),
        ),
      );
      defaultRuntime.exit(1);
    }
  });

  secrets
    .command("audit")
    .description(t("desc.audit_plaintext_secrets_unresolved_refs_and_precedence_drift"))
    .option("--check", t("opt.exit_non_zero_when_findings_are_present"), false)
    .option(
      "--allow-exec",
      "Allow exec SecretRef resolution during audit (may execute provider commands)",
      false,
    )
    .option("--json", t("opt.output_json"), false)
    .action(async (opts: SecretsAuditOptions) => {
      try {
        const report = await runSecretsAudit({
          allowExec: Boolean(opts.allowExec),
        });
        if (opts.json) {
          defaultRuntime.writeJson(report);
        } else {
          defaultRuntime.log(
            `Secrets audit: ${report.status}. plaintext=${report.summary.plaintextCount}, unresolved=${report.summary.unresolvedRefCount}, shadowed=${report.summary.shadowedRefCount}, legacy=${report.summary.legacyResidueCount}.`,
          );
          if (report.findings.length > 0) {
            for (const finding of report.findings.slice(0, 20)) {
              defaultRuntime.log(
                `- [${finding.code}] ${finding.file}:${finding.jsonPath} ${finding.message}`,
              );
            }
            if (report.findings.length > 20) {
              defaultRuntime.log(`... ${report.findings.length - 20} more finding(s).`);
            }
          }
          if (report.resolution.skippedExecRefs > 0) {
            defaultRuntime.log(
              `Audit note: skipped ${report.resolution.skippedExecRefs} exec SecretRef resolvability check(s). Re-run with --allow-exec to execute exec providers during audit.`,
            );
          }
        }
        const exitCode = resolveSecretsAuditExitCode(report, Boolean(opts.check));
        if (exitCode !== 0) {
          defaultRuntime.exit(exitCode);
        }
      } catch (err) {
        defaultRuntime.error(
          danger(
            `Secrets audit failed: ${formatErrorMessage(err)}. Run ${formatCliCommand("autopus doctor")} to inspect config and credential state.`,
          ),
        );
        defaultRuntime.exit(2);
      }
    });

  secrets
    .command("configure")
    .description(t("desc.interactive_secrets_helper_provider_setup_secretref_mapping_preflight"))
    .option("--apply", t("opt.apply_changes_immediately_after_preflight"), false)
    .option("--yes", t("opt.skip_apply_confirmation_prompt"), false)
    .option(
      "--providers-only",
      t("opt.configure_secrets_providers_only_skip_credential_mapping"),
      false,
    )
    .option(
      "--skip-provider-setup",
      "Skip provider setup and only map credential fields to existing providers",
      false,
    )
    .option(
      "--agent <id>",
      "Agent id for auth-profiles targets (default: configured default agent)",
    )
    .option(
      "--allow-exec",
      "Allow exec SecretRef preflight checks (may execute provider commands)",
      false,
    )
    .option("--plan-out <path>", t("opt.write_generated_plan_json_to_a_file"))
    .option("--json", t("opt.output_json"), false)
    .action(async (opts: SecretsConfigureOptions) => {
      try {
        const configured = await runSecretsConfigureInteractive({
          providersOnly: Boolean(opts.providersOnly),
          skipProviderSetup: Boolean(opts.skipProviderSetup),
          agentId: typeof opts.agent === "string" ? opts.agent : undefined,
          allowExecInPreflight: Boolean(opts.allowExec),
        });
        if (opts.planOut) {
          fs.writeFileSync(opts.planOut, `${JSON.stringify(configured.plan, null, 2)}\n`, "utf8");
        }
        if (opts.json) {
          defaultRuntime.writeJson({
            plan: configured.plan,
            preflight: configured.preflight,
          });
        } else {
          defaultRuntime.log(
            `Preflight: changed=${configured.preflight.changed}, files=${configured.preflight.changedFiles.length}, warnings=${configured.preflight.warningCount}.`,
          );
          if (configured.preflight.warningCount > 0) {
            for (const warning of configured.preflight.warnings) {
              defaultRuntime.log(`- warning: ${warning}`);
            }
          }
          if (
            !configured.preflight.checks.resolvabilityComplete &&
            configured.preflight.skippedExecRefs > 0
          ) {
            defaultRuntime.log(
              `Preflight note: skipped ${configured.preflight.skippedExecRefs} exec SecretRef resolvability check(s). Re-run with --allow-exec to execute exec providers during preflight.`,
            );
          }
          const providerUpserts = Object.keys(configured.plan.providerUpserts ?? {}).length;
          const providerDeletes = configured.plan.providerDeletes?.length ?? 0;
          defaultRuntime.log(
            `Plan: targets=${configured.plan.targets.length}, providerUpserts=${providerUpserts}, providerDeletes=${providerDeletes}.`,
          );
          if (opts.planOut) {
            defaultRuntime.log(`Plan written to ${opts.planOut}`);
          }
        }

        let shouldApply = Boolean(opts.apply);
        if (!shouldApply && !opts.json) {
          const approved = await confirm({
            message: "Apply this plan now?",
            initialValue: true,
          });
          if (typeof approved === "boolean") {
            shouldApply = approved;
          }
        }
        if (shouldApply) {
          const needsIrreversiblePrompt = Boolean(opts.apply);
          if (needsIrreversiblePrompt && !opts.yes && !opts.json) {
            const confirmed = await confirm({
              message:
                "This migration is one-way for migrated plaintext values. Continue with apply?",
              initialValue: true,
            });
            if (confirmed !== true) {
              defaultRuntime.log("Apply cancelled.");
              return;
            }
          }
          const result = await runSecretsApply({
            plan: configured.plan,
            write: true,
            allowExec: Boolean(opts.allowExec),
          });
          if (opts.json) {
            defaultRuntime.writeJson(result);
            return;
          }
          defaultRuntime.log(
            result.changed
              ? `Secrets applied. Updated ${result.changedFiles.length} file(s).`
              : "Secrets apply: no changes.",
          );
        }
      } catch (err) {
        defaultRuntime.error(
          danger(
            `Secrets configure failed: ${formatErrorMessage(err)}. Re-run ${formatCliCommand("autopus secrets audit")} before applying changes.`,
          ),
        );
        defaultRuntime.exit(1);
      }
    });

  secrets
    .command("apply")
    .description(t("desc.apply_a_previously_generated_secrets_plan"))
    .requiredOption("--from <path>", "Path to plan JSON")
    .option("--dry-run", t("opt.validate_preflight_only"), false)
    .option(
      "--allow-exec",
      t("opt.allow_exec_secretref_checks_may_execute_provider_commands"),
      false,
    )
    .option("--json", t("opt.output_json"), false)
    .action(async (opts: SecretsApplyOptions) => {
      try {
        const plan = readPlanFile(opts.from);
        const result = await runSecretsApply({
          plan,
          write: !opts.dryRun,
          allowExec: Boolean(opts.allowExec),
        });
        if (opts.json) {
          defaultRuntime.writeJson(result);
          return;
        }
        if (opts.dryRun) {
          defaultRuntime.log(
            result.changed
              ? `Secrets apply dry run: ${result.changedFiles.length} file(s) would change.`
              : "Secrets apply dry run: no changes.",
          );
          if (!result.checks.resolvabilityComplete && result.skippedExecRefs > 0) {
            defaultRuntime.log(
              `Secrets apply dry-run note: skipped ${result.skippedExecRefs} exec SecretRef resolvability check(s). Re-run with --allow-exec to execute exec providers during dry-run.`,
            );
          }
          return;
        }
        defaultRuntime.log(
          result.changed
            ? `Secrets applied. Updated ${result.changedFiles.length} file(s).`
            : "Secrets apply: no changes.",
        );
      } catch (err) {
        defaultRuntime.error(
          danger(
            `Secrets apply failed: ${formatErrorMessage(err)}. Re-run ${formatCliCommand("autopus secrets apply --from <path> --dry-run")} to inspect the plan without writing.`,
          ),
        );
        defaultRuntime.exit(1);
      }
    });
}
