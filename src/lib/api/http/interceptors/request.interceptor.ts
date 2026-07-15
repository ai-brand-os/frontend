import type { RequestInterceptor } from "../http.types";

/**
 * Baseline request interceptor: asks the backend for JSON. Intentionally
 * carries no authentication — the bearer/refresh interceptor is added
 * separately later so this layer stays auth-agnostic (SRP).
 */
export const defaultRequestInterceptor: RequestInterceptor = {
  onFulfilled: (config) => {
    config.headers.set("Accept", "application/json");
    return config;
  },
};
