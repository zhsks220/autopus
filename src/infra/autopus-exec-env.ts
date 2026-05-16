export const AUTOPUS_CLI_ENV_VAR = "AUTOPUS_CLI";
export const AUTOPUS_CLI_ENV_VALUE = "1";

export function markAutopusExecEnv<T extends Record<string, string | undefined>>(env: T): T {
  return {
    ...env,
    [AUTOPUS_CLI_ENV_VAR]: AUTOPUS_CLI_ENV_VALUE,
  };
}

export function ensureAutopusExecMarkerOnProcess(
  env: NodeJS.ProcessEnv = process.env,
): NodeJS.ProcessEnv {
  env[AUTOPUS_CLI_ENV_VAR] = AUTOPUS_CLI_ENV_VALUE;
  return env;
}
