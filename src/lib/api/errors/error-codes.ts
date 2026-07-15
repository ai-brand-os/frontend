/**
 * Error codes the frontend knows about. Server codes mirror the backend
 * `HttpExceptionFilter` envelope; the trailing group are client-only transport
 * failures that never reach the server. Codes are the stable contract callers
 * branch on — message text is not.
 */
export const ErrorCode = {
  // Server (mirrors backend HttpExceptionFilter.DEFAULT_CODES + custom codes)
  VALIDATION_ERROR: "VALIDATION_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  RATE_LIMITED: "RATE_LIMITED",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  EMAIL_ALREADY_REGISTERED: "EMAIL_ALREADY_REGISTERED",
  ERROR: "ERROR",
  // Client-only transport failures
  NETWORK_ERROR: "NETWORK_ERROR",
  TIMEOUT: "TIMEOUT",
  UNKNOWN: "UNKNOWN",
} as const;

/** A known, autocompleted error code. */
export type KnownErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

/**
 * Any error code. Keeps autocomplete for {@link KnownErrorCode} while still
 * accepting unknown codes the backend may add without a frontend change.
 */
export type ApiErrorCode = KnownErrorCode | (string & NonNullable<unknown>);
