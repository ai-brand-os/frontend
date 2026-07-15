import { parseApiError } from "./error-parser";

/**
 * A detailed, non-localized description for logs and devtools — never shown to
 * users. Includes status and code so failures are greppable in production
 * logging.
 */
export function toDeveloperMessage(error: unknown): string {
  const { code, status, message } = parseApiError(error);
  const suffix = status ? ` (status ${status})` : "";
  return `ApiError[${code}]${suffix}: ${message}`;
}
