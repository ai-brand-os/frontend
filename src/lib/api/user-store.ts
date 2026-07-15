import type { AuthUser } from "./types";

/**
 * Client-side store for the authenticated user returned by the auth endpoints.
 * Mirrors {@link ./token-store}: cached in-memory (the source of truth during a
 * session) and persisted to `localStorage` so the identity survives a reload
 * without an extra round-trip. On the server (SSR) `window` is absent, so reads
 * return `null` and writes no-op.
 */
const USER_KEY = "abos.user";

let user: AuthUser | null = null;
let hydrated = false;

type Listener = () => void;
const listeners = new Set<Listener>();

function isAuthUser(value: unknown): value is AuthUser {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.email === "string" &&
    typeof candidate.fullName === "string"
  );
}

function parseUser(raw: string): AuthUser | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    return isAuthUser(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function hydrate(): void {
  if (hydrated || typeof window === "undefined") return;
  const raw = window.localStorage.getItem(USER_KEY);
  user = raw ? parseUser(raw) : null;
  hydrated = true;
}

/**
 * The cached user, or `null` when signed out. The returned reference is stable
 * until the next write, so it is safe as a `useSyncExternalStore` snapshot.
 */
export function getUser(): AuthUser | null {
  hydrate();
  return user;
}

/** Persists the user from a login / signup response. */
export function setUser(next: AuthUser): void {
  hydrate();
  user = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(USER_KEY, JSON.stringify(next));
  }
  notify();
}

/** Drops the cached user — on logout, or when a refresh attempt is rejected. */
export function clearUser(): void {
  hydrate();
  user = null;
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(USER_KEY);
  }
  notify();
}

/** Subscribe to user changes (login/logout). Returns an unsubscribe fn. */
export function subscribeUser(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify(): void {
  for (const listener of listeners) listener();
}
