/**
 * Base URL for the backend API. The NestJS app mounts every route under the
 * `api/v1` global prefix (see backend `main.ts`), so that suffix lives here
 * once rather than in every request path.
 *
 * Override the host in any environment with `NEXT_PUBLIC_API_URL` (no
 * trailing slash), e.g. `https://api.aibrandos.com`.
 */
const DEFAULT_ORIGIN = "http://localhost:3000";
const API_PREFIX = "/api/v1";

export function getApiBaseUrl(): string {
  const origin = (
    process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_ORIGIN
  ).replace(/\/+$/, "");
  return `${origin}${API_PREFIX}`;
}
