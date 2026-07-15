import { ErrorCode, type ApiErrorCode } from "./error-codes";

/** Error envelope the backend emits: `{ success:false, error:{ code, message } }`. */
export type ApiErrorBody = {
  success: false;
  error: { code: string; message: string };
};

/**
 * The single typed error every API failure is normalized to (see the error
 * parser). Carries the backend `code` so callers branch on it instead of
 * matching message text. Transport failures use `status = 0`.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode;

  constructor(status: number, code: ApiErrorCode, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }

  /** The server was unreachable (no response). */
  static network(): ApiError {
    return new ApiError(0, ErrorCode.NETWORK_ERROR, "Unable to reach the server");
  }

  /** The request exceeded the configured timeout. */
  static timeout(): ApiError {
    return new ApiError(0, ErrorCode.TIMEOUT, "The request timed out");
  }

  /** A non-Error, non-Axios value was thrown. */
  static unknown(): ApiError {
    return new ApiError(0, ErrorCode.UNKNOWN, "An unexpected error occurred");
  }
}

/** Type guard: value is an {@link ApiError}. */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/** Type guard: value matches the backend {@link ApiErrorBody} envelope. */
export function isApiErrorBody(data: unknown): data is ApiErrorBody {
  if (typeof data !== "object" || data === null) return false;
  const body = data as Record<string, unknown>;
  if (body.success !== false) return false;
  const error = body.error;
  return (
    typeof error === "object" &&
    error !== null &&
    typeof (error as Record<string, unknown>).code === "string" &&
    typeof (error as Record<string, unknown>).message === "string"
  );
}
