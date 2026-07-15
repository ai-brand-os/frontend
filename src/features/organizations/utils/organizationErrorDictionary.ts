import {
  ErrorCode,
  toUserMessage,
  type UserMessageDictionary,
} from "@/lib/api";
import type { Messages } from "@/i18n/dictionaries";

/** Localized copy for the error codes the organization screens can surface. */
function buildDictionary(
  errorMessages: Messages["organization"]["errors"],
): UserMessageDictionary {
  return {
    [ErrorCode.UNAUTHORIZED]: errorMessages.unauthorized,
    [ErrorCode.FORBIDDEN]: errorMessages.forbidden,
    [ErrorCode.NETWORK_ERROR]: errorMessages.network,
    [ErrorCode.TIMEOUT]: errorMessages.network,
    fallback: errorMessages.unexpected,
  };
}

/** Maps a thrown API error to localized organization copy for display. */
export function resolveOrganizationErrorMessage(
  error: unknown,
  errorMessages: Messages["organization"]["errors"],
): string {
  return toUserMessage(error, buildDictionary(errorMessages));
}
