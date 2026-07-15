import { parseApiError } from "../../errors";
import type { ResponseInterceptor } from "../http.types";

/**
 * Response interceptor that rejects with the normalized {@link ApiError}
 * produced by the shared parser — the only place transport failures are
 * interpreted.
 */
export const errorNormalizationInterceptor: ResponseInterceptor = {
  onRejected: (error) => Promise.reject(parseApiError(error)),
};
