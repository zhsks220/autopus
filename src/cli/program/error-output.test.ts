import { describe, expect, it } from "vitest";
import { formatCliParseErrorOutput } from "./error-output.js";

describe("formatCliParseErrorOutput", () => {
  it("explains unknown commands with root help and plugin hints", () => {
    const output = formatCliParseErrorOutput("error: unknown command 'wat'\n", {
      argv: ["node", "autopus", "wat"],
    });

    expect(output).toBe(
      'Autopus does not know the command "wat".\nTry: autopus --help\nPlugin command? autopus plugins list\nDocs: https://docs.autopus.ai/cli\n',
    );
  });

  it("points unknown options at the active command help", () => {
    const output = formatCliParseErrorOutput("error: unknown option '--wat'\n", {
      argv: ["node", "autopus", "channels", "status", "--wat"],
    });

    expect(output).toBe(
      'Autopus does not recognize option "--wat".\nTry: autopus channels status --help\n',
    );
  });

  it("points missing required arguments at command help", () => {
    const output = formatCliParseErrorOutput("error: missing required argument 'name'\n", {
      argv: ["node", "autopus", "plugins", "install"],
    });

    expect(output).toBe('Missing required argument "name".\nTry: autopus plugins install --help\n');
  });
});
