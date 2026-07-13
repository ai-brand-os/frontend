import { getApiBaseUrl } from "./config";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from "./token-store";
import { ApiError, type AuthResult } from "./types";

export type ApiRequestOptions = Omit<RequestInit, "body"> & {
  /** JSON-serializable body; `Content-Type: application/json` is set for you. */
  body?: unknown;
  /**
   * Attach the `Authorization: Bearer` header and auto-refresh on 401.
   * Defaults to `true`. Set `false` for the auth endpoints themselves.
   */
  auth?: boolean;
  /** Internal: marks the one post-refresh retry so we never loop. */
  _retry?: boolean;
};

/**
 * Single-flight refresh: concurrent 401s share one `/auth/refresh` call
 * instead of each firing its own (which would rotate the refresh token
 * multiple times and, per backend theft-detection, revoke the whole family).
 */
let refreshPromise: Promise<boolean> | null = null;

function refreshTokens(): Promise<boolean> {
  refreshPromise ??= runRefresh().finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
}

async function runRefresh(): Promise<boolean> {
  const token = getRefreshToken();
  if (!token) return false;

  let response: Response;
  try {
    response = await fetch(`${getApiBaseUrl()}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: token }),
    });
  } catch {
    // Network blip — keep tokens so a later request can retry.
    return false;
  }

  if (!response.ok) {
    // Refresh token expired/revoked: the session is unrecoverable.
    clearTokens();
    return false;
  }

  const result = (await response.json()) as AuthResult;
  setTokens(result.tokens);
  return true;
}

/**
 * Typed fetch wrapper for the backend API. Serializes JSON bodies, attaches
 * the bearer token, transparently refreshes it once on a 401, and normalizes
 * every failure into an {@link ApiError}.
 */
export async function apiFetch<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { body, auth = true, _retry = false, headers, ...init } = options;

  const requestHeaders = new Headers(headers);
  if (body !== undefined && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }
  if (auth) {
    const accessToken = getAccessToken();
    if (accessToken) {
      requestHeaders.set("Authorization", `Bearer ${accessToken}`);
    }
  }

  let response: Response;
  try {
    response = await fetch(`${getApiBaseUrl()}${path}`, {
      ...init,
      headers: requestHeaders,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, "NETWORK_ERROR", "Unable to reach the server");
  }

  if (response.status === 401 && auth && !_retry) {
    const refreshed = await refreshTokens();
    if (refreshed) {
      return apiFetch<T>(path, { ...options, _retry: true });
    }
  }

  if (!response.ok) {
    throw await toApiError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

async function toApiError(response: Response): Promise<ApiError> {
  try {
    const data = (await response.json()) as {
      error?: { code?: string; message?: string };
    };
    return new ApiError(
      response.status,
      data.error?.code ?? "ERROR",
      data.error?.message ?? response.statusText,
    );
  } catch {
    return new ApiError(response.status, "ERROR", response.statusText);
  }
}
