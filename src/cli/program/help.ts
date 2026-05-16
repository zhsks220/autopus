import type { Command } from "commander";
import { t } from "../../i18n/cli/translate.js";
import { resolveCommitHash } from "../../infra/git-commit.js";
import { formatDocsLink } from "../../terminal/links.js";
import { isRich, theme } from "../../terminal/theme.js";
import { escapeRegExp } from "../../utils.js";
import { hasFlag, hasRootVersionAlias } from "../argv.js";
import { formatCliBannerLine, hasEmittedCliBanner } from "../banner.js";
import { replaceCliName, resolveCliName } from "../cli-name.js";
import { CLI_LOG_LEVEL_VALUES, parseCliLogLevelOption } from "../log-level-option.js";
import type { ProgramContext } from "./context.js";
import { getCoreCliCommandsWithSubcommands } from "./core-command-descriptors.js";
import { formatCliParseErrorOutput } from "./error-output.js";
import { getSubCliCommandsWithSubcommands } from "./subcli-descriptors.js";

const CLI_NAME = resolveCliName();
const CLI_NAME_PATTERN = escapeRegExp(CLI_NAME);
const ROOT_COMMANDS_WITH_SUBCOMMANDS = new Set([
  ...getCoreCliCommandsWithSubcommands(),
  ...getSubCliCommandsWithSubcommands(),
]);
const ROOT_COMMANDS_HINT =
  "안내: * 가 붙은 명령에는 하위 명령이 있습니다. 자세한 내용은 <명령> --help 를 실행하세요.";

const EXAMPLES = [
  ["autopus onboard", "로컬 Gateway, 워크스페이스, 인증, 채널을 위한 가이드 설정을 실행합니다."],
  ["autopus setup", "기본 config, 워크스페이스, 세션 폴더를 생성합니다."],
  ["autopus configure", "모델, Gateway, 채널, 플러그인, 스킬, 헬스체크를 변경합니다."],
  ["autopus status", "Gateway, 채널, 모델, 최근 세션 상태를 확인합니다."],
  ["autopus doctor --fix", "흔한 config, 서비스, 플러그인, 채널 문제를 복구합니다."],
  ["autopus channels add", "가이드 프롬프트로 채팅 채널 계정을 추가하거나 갱신합니다."],
  ["autopus channels status", "연결된 메시징 계정과 로그인 상태를 표시합니다."],
  [
    "autopus --dev gateway",
    "분리된 상태/설정으로 dev Gateway 를 ws://127.0.0.1:19001 에서 실행합니다.",
  ],
  ["autopus gateway run --force", "Gateway 를 시작하고 해당 포트에 묶인 것을 교체합니다."],
  ["autopus models status", "에이전트 실행 전에 모델/Provider 인증 상태를 표시합니다."],
  ["autopus plugins list", "활성화/비활성화/설치된 플러그인을 점검합니다."],
  [
    'autopus agent --to +15555550123 --message "Run summary" --deliver',
    "Gateway 를 통해 에이전트 턴 하나를 실행하고 선택적으로 답장을 전달합니다.",
  ],
  [
    'autopus message send --channel telegram --target @mychat --message "Hi"',
    "Telegram bot 으로 메시지를 전송합니다.",
  ],
] as const;

export function configureProgramHelp(program: Command, ctx: ProgramContext) {
  program
    .name(CLI_NAME)
    .description("")
    .version(ctx.programVersion, "-V, --version", "버전 번호를 출력합니다")
    .option(
      "--container <name>",
      "이름이 <name> 인 실행 중인 Podman/Docker 컨테이너 안에서 CLI 를 실행합니다 (기본값: 환경변수 AUTOPUS_CONTAINER)",
    )
    .option(
      "--dev",
      "Dev 프로필: ~/.autopus-dev 아래 상태를 격리하고, 기본 gateway 포트 19001, 파생 포트(브라우저/캔버스)도 이동시킵니다",
    )
    .option(
      "--profile <name>",
      "지정된 프로필을 사용합니다 (~/.autopus-<name> 아래 AUTOPUS_STATE_DIR/AUTOPUS_CONFIG_PATH 를 격리합니다)",
    )
    .option(
      "--log-level <level>",
      `파일 + 콘솔의 전역 로그 레벨을 재설정합니다 (${CLI_LOG_LEVEL_VALUES})`,
      parseCliLogLevelOption,
    );

  program.option("--no-color", t("opt.ansi"), false);
  program.helpOption("-h, --help", "명령에 대한 도움말을 표시합니다");
  program.helpCommand("help [command]", "명령에 대한 도움말을 표시합니다");

  program.configureHelp({
    // sort options and subcommands alphabetically
    sortSubcommands: true,
    sortOptions: true,
    optionTerm: (option) => theme.option(option.flags),
    subcommandTerm: (cmd) => {
      const isRootCommand = cmd.parent === program;
      const hasSubcommands = isRootCommand && ROOT_COMMANDS_WITH_SUBCOMMANDS.has(cmd.name());
      return theme.command(hasSubcommands ? `${cmd.name()} *` : cmd.name());
    },
  });

  const formatHelpOutput = (str: string) => {
    let output = str;
    const isRootHelp = new RegExp(
      `^Usage:\\s+${CLI_NAME_PATTERN}\\s+\\[options\\]\\s+\\[command\\]\\s*$`,
      "m",
    ).test(output);
    if (isRootHelp && /^Commands:/m.test(output)) {
      output = output.replace(/^Commands:/m, `Commands:\n  ${theme.muted(ROOT_COMMANDS_HINT)}`);
    }

    return output
      .replace(/^Usage:/gm, theme.heading("사용법:"))
      .replace(/^Options:/gm, theme.heading("옵션:"))
      .replace(/^Commands:/gm, theme.heading("명령:"))
      .replace(/^Arguments:/gm, theme.heading("인자:"))
      .replace(/\(default:\s+false\)/g, "(기본값: 거짓)")
      .replace(/\(default:\s+true\)/g, "(기본값: 참)")
      .replace(/\(default:\s+"([^"]*)"\)/g, '(기본값: "$1")')
      .replace(/\(choices:\s+([^)]+)\)/g, "(선택지: $1)");
  };

  program.configureOutput({
    writeOut: (str) => {
      process.stdout.write(formatHelpOutput(str));
    },
    writeErr: (str) => {
      process.stderr.write(formatHelpOutput(str));
    },
    outputError: (str, write) => write(formatCliParseErrorOutput(str, { argv: process.argv })),
  });

  if (
    hasFlag(process.argv, "-V") ||
    hasFlag(process.argv, "--version") ||
    hasRootVersionAlias(process.argv)
  ) {
    const commit = resolveCommitHash({ moduleUrl: import.meta.url });
    console.log(
      commit ? `Autopus ${ctx.programVersion} (${commit})` : `Autopus ${ctx.programVersion}`,
    );
    process.exit(0);
  }

  program.addHelpText("beforeAll", () => {
    if (hasEmittedCliBanner() || process.env.AUTOPUS_SUPPRESS_HELP_BANNER === "1") {
      return "";
    }
    const rich = isRich();
    const line = formatCliBannerLine(ctx.programVersion, { richTty: rich, mode: "default" });
    return `\n${line}\n`;
  });

  const fmtExamples = EXAMPLES.map(
    ([cmd, desc]) => `  ${theme.command(replaceCliName(cmd, CLI_NAME))}\n    ${theme.muted(desc)}`,
  ).join("\n");

  program.addHelpText("afterAll", ({ command }) => {
    if (command !== program) {
      return "";
    }
    const docs = formatDocsLink("/cli", "docs.autopus.ai/cli");
    return `\n${theme.heading("Examples:")}\n${fmtExamples}\n\n${theme.muted("Docs:")} ${docs}\n`;
  });
}
