import type { Command } from "commander";
import { runCrestodian } from "../../crestodian/crestodian.js";
import { t } from "../../i18n/cli/translate.js";
import { defaultRuntime } from "../../runtime.js";
import { theme } from "../../terminal/theme.js";
import { runCommandWithRuntime } from "../cli-utils.js";
import { formatHelpExamples } from "../help-format.js";

export function registerCrestodianCommand(program: Command) {
  program
    .command("crestodian")
    .description(t("desc.open_the_ring_zero_setup_and_repair_helper"))
    .option("-m, --message <text>", t("opt.run_one_crestodian_request"))
    .option("--yes", t("opt.approve_persistent_config_writes_for_this_request"), false)
    .option("--json", t("opt.output_startup_overview_as_json"), false)
    .addHelpText(
      "after",
      () =>
        `\n${theme.heading("Examples:")}\n${formatHelpExamples([
          ["autopus", "Start Crestodian."],
          ["autopus crestodian", "Start Crestodian explicitly."],
          ['autopus crestodian -m "status"', "Run one status request."],
          [
            'autopus crestodian -m "set default model openai/gpt-5.2" --yes',
            "Apply a typed config write.",
          ],
        ])}`,
    )
    .action(async (opts) => {
      await runCommandWithRuntime(defaultRuntime, async () => {
        await runCrestodian({
          message: opts.message as string | undefined,
          yes: Boolean(opts.yes),
          json: Boolean(opts.json),
        });
      });
    });
}
