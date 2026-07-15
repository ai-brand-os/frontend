import { http } from "msw";

import { getApiBaseUrl } from "@/lib/api";
import type { AuthResult } from "@/lib/api";
import { success } from "@/test/mocks/response-factories";

const base = getApiBaseUrl();

/**
 * A representative successful auth response, matching the backend
 * `AuthResult`. Login and refresh carry no `organizationId` — only signup,
 * which creates one alongside the account.
 */
export const authResultFixture: AuthResult = {
  user: { id: "user_1", email: "founder@acme.dev", fullName: "Ada Lovelace" },
  tokens: {
    accessToken: "access-token-1",
    refreshToken: "refresh-token-1",
    expiresIn: 900,
  },
};

/** `POST /auth/signup` — the same result plus the org created with the account. */
export const signupResultFixture: AuthResult = {
  ...authResultFixture,
  organizationId: "org_1",
};

/**
 * Default happy-path handlers so any component that calls the auth API in a
 * test resolves without each test wiring its own. Override per-scenario with
 * `server.use(...)` and the error factories (e.g. `unauthorizedError`).
 */
export const authHandlers = [
  http.post(`${base}/auth/login`, () => success(authResultFixture)),
  http.post(`${base}/auth/signup`, () => success(signupResultFixture, { status: 201 })),
  http.post(`${base}/auth/refresh`, () => success(authResultFixture)),
  http.post(`${base}/auth/logout`, () => success(null, { status: 204 })),
];
