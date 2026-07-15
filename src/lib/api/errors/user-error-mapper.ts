import type { ApiErrorCode } from "./error-codes";
import { parseApiError } from "./error-parser";

/**
 * Localized, user-facing copy keyed by error code, with a required `fallback`
 * for unmapped codes. Callers supply this from their i18n dictionary — the
 * mapper stays language-agnostic.
 */
export type UserMessageDictionary = Partial<Record<ApiErrorCode, string>> & {
  fallback: string;
};

/**
 * Turns any thrown value into a user-facing message. Parsing lives in the
 * parser; this only maps the normalized code to app-provided copy. Use for
 * anything a user reads (toasts, form root errors).
 */
export function toUserMessage(
  error: unknown,
  dictionary: UserMessageDictionary,
): string {
  const { code } = parseApiError(error);
  return dictionary[code] ?? dictionary.fallback;
}
