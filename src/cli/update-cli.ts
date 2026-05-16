import type { Command } from "commander";
import { t } from "../i18n/cli/translate.js";
import { defaultRuntime } from "../runtime.js";
import { formatDocsLink } from "../terminal/links.js";
import { theme } from "../terminal/theme.js";
import { inheritOptionFromParent } from "./command-options.js";
import { formatHelpExamples } from "./help-format.js";
import {
  type UpdateCommandOptions,
  type UpdateStatusOptions,
  type UpdateWizardOptions,
} from "./update-cli/shared.js";
import { updateStatusCommand } from "./update-cli/status.js";
import { updateCommand } from "./update-cli/update-command.js";
import { updateWizardCommand } from "./update-cli/wizard.js";

export { updateCommand, updateStatusCommand, updateWizardCommand };
export type { UpdateCommandOptions, UpdateStatusOptions, UpdateWizardOptions };

function inheritedUpdateJson(command?: Command): boolean {
  return Boolean(inheritOptionFromParent<boolean>(command, "json"));
}

function inheritedUpdateTimeout(
  opts: { timeout?: unknown },
  command?: Command,
): string | undefined {
  const timeout = opts.timeout as string | undefined;
  if (timeout) {
    return timeout;
  }
  return inheritOptionFromParent<string>(command, "timeout");
}

export function registerUpdateCli(program: Command) {
  program.enablePositionalOptions();
  const update = program
    .command("update")
    .description(t("desc.update_autopus_and_inspect_update_channel_status"))
    .option("--json", t("opt.output_result_as_json"), false)
    .option("--no-restart", t("opt.skip_restarting_the_gateway_service_after_a_successful_update"))
    .option("--dry-run", t("opt.preview_update_actions_without_making_changes"), false)
    .option("--channel <stable|beta|dev>", t("opt.persist_update_channel_git_npm"))
    .option(
      "--tag <dist-tag|version|spec>",
      "이번 업데이트의 패키지 대상을 재정의합니다 (dist-tag, version, 또는 package spec)",
    )
    .option("--timeout <seconds>", t("opt.timeout_for_each_update_step_in_seconds_default_1800"))
    .option("--yes", t("opt.skip_confirmation_prompts_non_interactive"), false)
    .addHelpText("after", () => {
      const examples = [
        ["autopus update", "소스 체크아웃 업데이트 (git)"],
        ["autopus update --channel beta", "beta 채널로 전환 (git + npm)"],
        ["autopus update --channel dev", "dev 채널로 전환 (git + npm)"],
        ["autopus update --tag beta", "dist-tag 또는 버전 1회성 업데이트"],
        ["autopus update --tag main", "GitHub main 의 1회성 패키지 설치"],
        ["autopus update --dry-run", "변경 없이 작업 미리보기"],
        ["autopus update --no-restart", "서비스 재시작 없이 업데이트"],
        ["autopus update --json", "결과를 JSON 으로 출력"],
        ["autopus update --yes", "비대화형 (다운그레이드 확인 자동 수락)"],
        ["autopus update wizard", "대화형 업데이트 마법사"],
        ["autopus --update", "autopus update 의 단축형"],
      ] as const;
      const fmtExamples = examples
        .map(([cmd, desc]) => `  ${theme.command(cmd)} ${theme.muted(`# ${desc}`)}`)
        .join("\n");
      return `
${theme.heading("이 명령어가 하는 일:")}
  - Git 체크아웃: fetch, rebase, 의존성 설치, 빌드, doctor 실행
  - npm 설치: 감지된 패키지 매니저로 업데이트

${theme.heading("채널 전환:")}
  - --channel stable|beta|dev 로 config 에 업데이트 채널 저장
  - autopus update status 로 활성 채널 / 소스 확인
  - --tag <dist-tag|version|spec> 로 채널 저장 없이 1회성 패키지 업데이트

${theme.heading("비대화형:")}
  - --yes 로 다운그레이드 확인 자동 수락
  - 필요에 따라 --channel/--tag/--no-restart/--json/--timeout 조합 사용
  - --dry-run 으로 config 기록 / 설치 / 재시작 없이 작업 미리보기

${theme.heading("예시:")}
${fmtExamples}

${theme.heading("참고:")}
  - --channel stable|beta|dev 로 채널 전환
  - 글로벌 설치 시: 가능한 경우 감지된 패키지 매니저로 자동 업데이트 (docs/install/updating.md 참조)
  - 다운그레이드는 확인 필요 (설정 손상 가능)
  - 작업 디렉토리에 커밋되지 않은 변경이 있으면 업데이트 건너뜀

${theme.muted("문서:")} ${formatDocsLink("/cli/update", "docs.autopus.ai/cli/update")}`;
    })
    .action(async (opts) => {
      try {
        await updateCommand({
          json: Boolean(opts.json),
          restart: Boolean(opts.restart),
          dryRun: Boolean(opts.dryRun),
          channel: opts.channel as string | undefined,
          tag: opts.tag as string | undefined,
          timeout: opts.timeout as string | undefined,
          yes: Boolean(opts.yes),
        });
      } catch (err) {
        defaultRuntime.error(String(err));
        defaultRuntime.exit(1);
      }
    });

  update
    .command("wizard")
    .description(t("desc.interactive_update_wizard"))
    .option("--timeout <seconds>", t("opt.timeout_for_each_update_step_in_seconds_default_1800"))
    .addHelpText(
      "after",
      `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/update", "docs.autopus.ai/cli/update")}\n`,
    )
    .action(async (opts, command) => {
      try {
        await updateWizardCommand({
          timeout: inheritedUpdateTimeout(opts, command),
        });
      } catch (err) {
        defaultRuntime.error(String(err));
        defaultRuntime.exit(1);
      }
    });

  update
    .command("status")
    .description(t("desc.show_update_channel_and_version_status"))
    .option("--json", t("opt.output_result_as_json"), false)
    .option("--timeout <seconds>", t("opt.timeout_for_update_checks_in_seconds_default_3"))
    .addHelpText(
      "after",
      () =>
        `\n${theme.heading("Examples:")}\n${formatHelpExamples([
          ["autopus update status", "Show channel + version status."],
          ["autopus update status --json", "JSON output."],
          ["autopus update status --timeout 10", "Custom timeout."],
        ])}\n\n${theme.heading("Notes:")}\n${theme.muted(
          "- Shows current update channel (stable/beta/dev) and source",
        )}\n${theme.muted("- Includes git tag/branch/SHA for source checkouts")}\n\n${theme.muted(
          "Docs:",
        )} ${formatDocsLink("/cli/update", "docs.autopus.ai/cli/update")}`,
    )
    .action(async (opts, command) => {
      try {
        await updateStatusCommand({
          json: Boolean(opts.json) || inheritedUpdateJson(command),
          timeout: inheritedUpdateTimeout(opts, command),
        });
      } catch (err) {
        defaultRuntime.error(String(err));
        defaultRuntime.exit(1);
      }
    });
}
