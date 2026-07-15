import axios, {
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

import { clearTokens } from "../../token-store";
import type { ResponseInterceptor } from "../http.types";
import { refreshAccessToken } from "../token-refresher";
import { DEFAULT_PUBLIC_ENDPOINTS, isPublicEndpoint } from "./auth.interceptor";

/** Where to send the user when the session can't be recovered. */
const LOGIN_REDIRECT_PATH = "/";

/** Request config carrying the one-retry marker that prevents infinite loops. */
type RetriableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

export interface RefreshInterceptorOptions {
  /** Replays the original request (typically the owning instance's `request`). */
  retry: (config: InternalAxiosRequestConfig) => Promise<AxiosResponse>;
  /** Endpoints exempt from refresh handling. Defaults to the auth endpoints. */
  publicEndpoints?: readonly string[];
  /** Runs when refresh fails. Defaults to clearing tokens + redirecting. */
  onRefreshFailure?: () => void;
}

/** Guards against firing multiple redirects when many requests fail at once. */
let redirecting = false;

function defaultOnRefreshFailure(): void {
  clearTokens();
  if (typeof window === "undefined" || redirecting) return;
  redirecting = true;
  window.location.assign(LOGIN_REDIRECT_PATH);
}

/**
 * Response interceptor implementing single-flight token refresh with replay.
 *
 * On a 401 for an authenticated request that hasn't already been retried, it
 * awaits {@link refreshAccessToken} — which coalesces concurrent callers onto
 * one `/auth/refresh`. When refresh succeeds, the original request is replayed
 * once (the request interceptor re-attaches the fresh token). When it fails,
 * auth is cleared, the request rejects, and the user is redirected to login.
 *
 * Loop safety: `_retry` marks a request so a second 401 is never refreshed
 * again — each request is retried at most once.
 */
export function createRefreshInterceptor(
  options: RefreshInterceptorOptions,
): ResponseInterceptor {
  const {
    retry,
    publicEndpoints = DEFAULT_PUBLIC_ENDPOINTS,
    onRefreshFailure = defaultOnRefreshFailure,
  } = options;

  return {
    onRejected: async (error) => {
      if (!axios.isAxiosError(error)) throw error;

      const config = error.config as RetriableRequestConfig | undefined;
      const isUnauthorized = error.response?.status === 401;

      if (
        !isUnauthorized ||
        !config ||
        config._retry ||
        isPublicEndpoint(config.url, publicEndpoints)
      ) {
        throw error;
      }

      config._retry = true;

      const refreshed = await refreshAccessToken();
      if (!refreshed) {
        onRefreshFailure();
        throw error;
      }

      return retry(config);
    },
  };
}
