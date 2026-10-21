import { getCredentialEpoch, getRefreshToken, setTokens } from "../token-store";
import type { AuthResult } from "../types";
import { createAxiosInstance, createHttpClient } from "./http.client";
import { getDefaultHttpConfig } from "./http.config";

/**
 * A bare client for the refresh call itself — deliberately free of the auth
 * and refresh interceptors so a refresh can never trigger another refresh
 * (no loop) and never attaches a possibly-expired access token.
 */
const refreshClient = createHttpClient(
  createAxiosInstance(getDefaultHttpConfig()),
);

/**
 * The single in-flight refresh, or `null` when none is running. Shared so
 * concurrent 401s coalesce onto one `/auth/refresh` call (single-flight) —
 * critical because the backend rotates refresh tokens and treats a reused
 * token as theft, revoking the whole family.
 */
let refreshPromise: Promise<boolean> | null = null;
let refreshEpoch: number | null = null;

async function performRefresh(): Promise<boolean> {
  const epoch = getCredentialEpoch();
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const result = await refreshClient.post<AuthResult>("/auth/refresh", {
      refreshToken,
    });
    // A logout/account transition must not be undone by an older refresh.
    if (epoch !== getCredentialEpoch() || getRefreshToken() !== refreshToken)
      return false;
    setTokens(result.tokens);
    return true;
  } catch {
    // Refresh token expired/revoked or network failure: unrecoverable here.
    return false;
  }
}

/**
 * Refreshes the access token, coalescing concurrent callers onto one request.
 * Resolves `true` when a fresh pair was stored, `false` otherwise. The promise
 * is cleared once settled so the next 401 can start a new refresh.
 */
export function refreshAccessToken(): Promise<boolean> {
  const epoch = getCredentialEpoch();
  if (refreshPromise && refreshEpoch === epoch) return refreshPromise;
  refreshEpoch = epoch;
  const promise = performRefresh().finally(() => {
    if (refreshPromise === promise) {
      refreshPromise = null;
      refreshEpoch = null;
    }
  });
  refreshPromise = promise;
  return promise;
}
