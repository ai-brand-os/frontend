import {
  ErrorCode,
  toUserMessage,
  type UserMessageDictionary,
} from "@/lib/api";
import type { Messages } from "@/i18n/dictionaries";

/** Localized copy for the auth error codes the auth form can surface. */
function buildDictionary(
  errorMessages: Messages["auth"]["errors"],
): UserMessageDictionary {
  return {
    [ErrorCode.INVALID_CREDENTIALS]: errorMessages.invalidCredentials,
    [ErrorCode.EMAIL_ALREADY_REGISTERED]: errorMessages.emailTaken,
    [ErrorCode.RATE_LIMITED]: errorMessages.rateLimited,
    fallback: errorMessages.unexpected,
  };
}

/** Maps a thrown API error to localized auth copy for display. */
export function resolveAuthErrorMessage(
  error: unknown,
  errorMessages: Messages["auth"]["errors"],
): string {
  return toUserMessage(error, buildDictionary(errorMessages));
}
