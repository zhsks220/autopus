/**
 * CLI 메시지 트리 타입.
 *
 * 사용 패턴:
 *   t("docs.description") → "Autopus 공식 문서를 검색합니다"
 *
 * 메시지 구조는 영어를 source-of-truth 로 두고 (src/i18n/cli/locales/en.ts),
 * 다른 로케일은 같은 키 구조를 따라야 함.
 */
export type CliMessageTree = {
  readonly [key: string]: string | CliMessageTree;
};
