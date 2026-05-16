import chalk, { Chalk } from "chalk";
import { OCTOPUS_PALETTE } from "./palette.js";

const hasForceColor =
  typeof process.env.FORCE_COLOR === "string" &&
  process.env.FORCE_COLOR.trim().length > 0 &&
  process.env.FORCE_COLOR.trim() !== "0";

const baseChalk = process.env.NO_COLOR && !hasForceColor ? new Chalk({ level: 0 }) : chalk;

const hex = (value: string) => baseChalk.hex(value);

export const theme = {
  accent: hex(OCTOPUS_PALETTE.accent),
  accentBright: hex(OCTOPUS_PALETTE.accentBright),
  accentDim: hex(OCTOPUS_PALETTE.accentDim),
  info: hex(OCTOPUS_PALETTE.info),
  success: hex(OCTOPUS_PALETTE.success),
  warn: hex(OCTOPUS_PALETTE.warn),
  error: hex(OCTOPUS_PALETTE.error),
  muted: hex(OCTOPUS_PALETTE.muted),
  heading: baseChalk.bold.hex(OCTOPUS_PALETTE.accent),
  command: hex(OCTOPUS_PALETTE.accentBright),
  option: hex(OCTOPUS_PALETTE.warn),
} as const;

export const isRich = () => baseChalk.level > 0;

export const colorize = (rich: boolean, color: (value: string) => string, value: string) =>
  rich ? color(value) : value;
