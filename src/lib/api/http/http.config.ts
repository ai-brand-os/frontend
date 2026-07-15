import { getApiBaseUrl } from "../config";
import type { HttpClientConfig } from "./http.types";

/** Fallback request timeout (ms) when no override is provided. */
const DEFAULT_TIMEOUT_MS = 15_000;

/**
 * Resolves the request timeout from `NEXT_PUBLIC_API_TIMEOUT` (milliseconds),
 * falling back to {@link DEFAULT_TIMEOUT_MS} when unset or invalid.
 */
function resolveTimeout(): number {
  const raw = process.env.NEXT_PUBLIC_API_TIMEOUT;
  const parsed = raw ? Number(raw) : Number.NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_TIMEOUT_MS;
}

/**
 * Default configuration for the shared client. `baseURL` reuses
 * {@link getApiBaseUrl} so the origin/prefix rule lives in one place.
 */
export function getDefaultHttpConfig(): HttpClientConfig {
  return {
    baseURL: getApiBaseUrl(),
    timeout: resolveTimeout(),
  };
}
