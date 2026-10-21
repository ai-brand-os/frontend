import {
  ApiError,
  clearTokens,
  clearUser,
  getRefreshToken,
  httpClient,
  setTokens,
  setUser,
  type AuthResult,
} from "@/lib/api";
import type { LoginInput, SignupInput } from "./auth.types";

let authAttempt = 0;

function beginAuthTransition(): number {
  authAttempt += 1;
  clearTokens();
  clearUser();
  return authAttempt;
}

function acceptAuthResult(attempt: number, result: AuthResult): void {
  if (attempt !== authAttempt) {
    throw new ApiError(
      401,
      "UNAUTHORIZED",
      "Authentication attempt superseded",
    );
  }
  setTokens(result.tokens);
  setUser(result.user);
}

/**
 * POST /auth/login — stores the returned token pair and user on success. Public
 * endpoint: the auth interceptor attaches no bearer token.
 */
export async function login(input: LoginInput): Promise<AuthResult> {
  const attempt = beginAuthTransition();
  const result = await httpClient.post<AuthResult>("/auth/login", input);
  acceptAuthResult(attempt, result);
  return result;
}

/** POST /auth/signup — creates the account and stores the token pair and user. */
export async function signup(input: SignupInput): Promise<AuthResult> {
  const attempt = beginAuthTransition();
  const result = await httpClient.post<AuthResult>("/auth/signup", input);
  acceptAuthResult(attempt, result);
  return result;
}

/**
 * POST /auth/logout — clear local credentials immediately, then revoke the
 * captured refresh token. A failed request still rejects so callers can report
 * that server revocation is unconfirmed.
 */
export async function logout(): Promise<void> {
  const refreshToken = getRefreshToken();
  beginAuthTransition();
  if (refreshToken) {
    await httpClient.post<void>("/auth/logout", { refreshToken });
  }
}
