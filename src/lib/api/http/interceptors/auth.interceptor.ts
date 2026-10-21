import { getAccessToken, getCredentialEpoch } from "../../token-store";
import type { RequestInterceptor } from "../http.types";

/**
 * Endpoints that must never carry a bearer token — they mint or exchange
 * credentials rather than consuming an access token. Configurable per client
 * via {@link createAuthInterceptor}.
 */
export const DEFAULT_PUBLIC_ENDPOINTS: readonly string[] = [
  "/auth/login",
  "/auth/signup",
  "/auth/refresh",
  "/auth/logout",
];

/** True when `url`'s path is (or is nested under) a public endpoint. */
export function isPublicEndpoint(
  url: string | undefined,
  publicEndpoints: readonly string[],
): boolean {
  if (!url) return false;
  const path = url.split("?")[0];
  return publicEndpoints.some(
    (endpoint) => path === endpoint || path.startsWith(`${endpoint}/`),
  );
}

/**
 * Request interceptor that attaches `Authorization: Bearer <accessToken>` to
 * every authenticated request. The token is read from the existing token store
 * (single source of truth — no duplicated auth state). Public endpoints are
 * skipped, and a missing token is left to the endpoint to reject. Refresh is
 * intentionally not handled here.
 */
export function createAuthInterceptor(
  publicEndpoints: readonly string[] = DEFAULT_PUBLIC_ENDPOINTS,
): RequestInterceptor {
  return {
    onFulfilled: (config) => {
      if (isPublicEndpoint(config.url, publicEndpoints)) return config;

      (
        config as typeof config & { _credentialEpoch?: number }
      )._credentialEpoch = getCredentialEpoch();
      const accessToken = getAccessToken();
      if (accessToken) {
        config.headers.set("Authorization", `Bearer ${accessToken}`);
      }
      return config;
    },
  };
}
