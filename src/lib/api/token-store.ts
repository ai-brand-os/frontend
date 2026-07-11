import type { TokenPair } from "./types";

/**
 * Client-side token store. The access token is attached as an
 * `Authorization: Bearer` header on every authenticated request; the refresh
 * token is used to mint a new pair when the access token expires.
 *
 * Tokens are cached in-memory (fast, and the source of truth during a session)
 * and mirrored to `localStorage` so they survive a full page reload. On the
 * server (SSR) `window` is absent, so reads return `null` and writes no-op.
 */
const ACCESS_KEY = "abos.accessToken";
const REFRESH_KEY = "abos.refreshToken";

let accessToken: string | null = null;
let refreshToken: string | null = null;
let hydrated = false;

type Listener = () => void;
const listeners = new Set<Listener>();

function hydrate(): void {
  if (hydrated || typeof window === "undefined") return;
  accessToken = window.localStorage.getItem(ACCESS_KEY);
  refreshToken = window.localStorage.getItem(REFRESH_KEY);
  hydrated = true;
}

export function getAccessToken(): string | null {
  hydrate();
  return accessToken;
}

export function getRefreshToken(): string | null {
  hydrate();
  return refreshToken;
}

/** Persists a freshly issued pair from login / signup / refresh. */
export function setTokens(tokens: Pick<TokenPair, "accessToken" | "refreshToken">): void {
  hydrate();
  accessToken = tokens.accessToken;
  refreshToken = tokens.refreshToken;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(ACCESS_KEY, tokens.accessToken);
    window.localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
  }
  notify();
}

/** Drops all tokens — on logout, or when a refresh attempt is rejected. */
export function clearTokens(): void {
  hydrate();
  accessToken = null;
  refreshToken = null;
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(ACCESS_KEY);
    window.localStorage.removeItem(REFRESH_KEY);
  }
  notify();
}

export function isAuthenticated(): boolean {
  return getAccessToken() !== null;
}

/** Subscribe to token changes (login/logout). Returns an unsubscribe fn. */
export function subscribeTokens(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify(): void {
  for (const listener of listeners) listener();
}
