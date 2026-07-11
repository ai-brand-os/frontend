import { HttpResponse, delay, type JsonBodyType } from "msw";

/**
 * Reusable response shapes for MSW handlers, covering the scenarios every
 * API-backed feature needs to prove it handles: success, validation errors,
 * server errors, auth failures, and network failure.
 *
 * Use these inside `http.get/post(...)` resolvers instead of hand-rolling
 * `Response` objects in every test, e.g.:
 *
 *   http.post('/api/auth/signin', () => success({ token: 'abc' }))
 */

export function success<T extends JsonBodyType>(body: T, init?: { status?: number }) {
  return HttpResponse.json(body, { status: init?.status ?? 200 });
}

export function validationError(
  errors: Record<string, string>,
  init?: { status?: number },
) {
  return HttpResponse.json(
    { message: "Validation failed", errors },
    { status: init?.status ?? 422 },
  );
}

export function serverError(message = "Internal server error") {
  return HttpResponse.json({ message }, { status: 500 });
}

export function unauthorizedError(message = "Unauthorized") {
  return HttpResponse.json({ message }, { status: 401 });
}

/** Simulates a dropped connection (DNS failure, offline, aborted request). */
export function networkError() {
  return HttpResponse.error();
}

/** Adds artificial latency to exercise loading states deterministically. */
export async function withDelay<T>(value: T, ms = 50): Promise<T> {
  await delay(ms);
  return value;
}
