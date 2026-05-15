/**
 * CLI i18n 메시지 조회 함수.
 *
 * 사용:
 *   import { t } from "../i18n/cli/translate.js";
 *   .description(t("docs.description"))
 *
 * 로케일 결정 우선순위:
 *   1. AUTOPUS_LOCALE 환경변수 (예: "ko", "en")
 *   2. 시스템 LANG/LC_ALL (예: "ko_KR.UTF-8" → "ko")
 *   3. 기본값 "ko"  ← AUTOPUS 는 한국 버전이므로 한국어 기본
 */
import { en } from "./locales/en.js";
import { ko } from "./locales/ko.js";
import type { CliMessageTree } from "./types.js";

type Locale = "ko" | "en";

const LOCALES: Record<Locale, CliMessageTree> = {
  ko,
  en,
};

const DEFAULT_LOCALE: Locale = "ko";

let cachedLocale: Locale | null = null;

function detectLocale(): Locale {
  const explicit = process.env.AUTOPUS_LOCALE?.toLowerCase();
  if (explicit === "ko" || explicit === "en") {
    return explicit;
  }
  const sysLocale = (process.env.LC_ALL || process.env.LANG || "").toLowerCase();
  if (sysLocale.startsWith("ko")) {
    return "ko";
  }
  if (sysLocale.startsWith("en")) {
    return "en";
  }
  return DEFAULT_LOCALE;
}

function getLocale(): Locale {
  if (cachedLocale === null) {
    cachedLocale = detectLocale();
  }
  return cachedLocale;
}

/**
 * 테스트에서 로케일을 명시적으로 설정할 때 사용.
 * 일반 코드에서는 호출하지 않음.
 */
export function setCliLocale(locale: Locale): void {
  cachedLocale = locale;
}

function resolveKey(tree: CliMessageTree, key: string): string {
  const parts = key.split(".");
  let cur: string | CliMessageTree | undefined = tree;
  for (const part of parts) {
    if (typeof cur !== "object" || cur === null) {
      return key;
    }
    cur = cur[part];
    if (cur === undefined) {
      return key;
    }
  }
  return typeof cur === "string" ? cur : key;
}

/**
 * 메시지 키를 현재 로케일 문자열로 변환.
 * 키가 없으면 영어 폴백, 그것도 없으면 키 자체 반환.
 */
export function t(key: string): string {
  const locale = getLocale();
  const tree = LOCALES[locale];
  const value = resolveKey(tree, key);
  if (value !== key) {
    return value;
  }
  // 폴백: 영어
  if (locale !== "en") {
    return resolveKey(en, key);
  }
  return key;
}
