import axios from "axios";

import { ApiError, isApiErrorBody } from "./api-error";
import { ErrorCode } from "./error-codes";

/**
 * Parses a response body (backend envelope) into an {@link ApiError}. Shared by
 * every transport so parsing lives in exactly one place. `status` and
 * `fallbackMessage` come from the transport when the body isn't the envelope.
 */
export function parseErrorBody(
  status: number,
  data: unknown,
  fallbackMessage = "Request failed",
): ApiError {
  if (isApiErrorBody(data)) {
    return new ApiError(
      status,
      data.error.code || ErrorCode.ERROR,
      data.error.message || fallbackMessage,
    );
  }
  return new ApiError(status, ErrorCode.ERROR, fallbackMessage);
}

/**
 * Normalizes any thrown value into an {@link ApiError}: passes existing ones
 * through, maps Axios HTTP/network/timeout failures, and falls back to
 * `UNKNOWN`. The one entry point every layer calls — no other code inspects
 * raw Axios errors or response bodies.
 */
export function parseApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (axios.isAxiosError(error)) {
    if (error.response) {
      return parseErrorBody(
        error.response.status,
        error.response.data,
        error.response.statusText,
      );
    }
    if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
      return ApiError.timeout();
    }
    return ApiError.network();
  }

  return ApiError.unknown();
}
