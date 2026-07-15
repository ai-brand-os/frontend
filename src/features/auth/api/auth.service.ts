import {
  clearTokens,
  clearUser,
  getRefreshToken,
  httpClient,
  setTokens,
  setUser,
  type AuthResult,
} from "@/lib/api";
import type { LoginInput, SignupInput } from "./auth.types";

/**
 * POST /auth/login — stores the returned token pair and user on success. Public
 * endpoint: the auth interceptor attaches no bearer token.
 */
export async function login(input: LoginInput): Promise<AuthResult> {
  const result = await httpClient.post<AuthResult>("/auth/login", input);
  setTokens(result.tokens);
  setUser(result.user);
  return result;
}

/** POST /auth/signup — creates the account and stores the token pair and user. */
export async function signup(input: SignupInput): Promise<AuthResult> {
  const result = await httpClient.post<AuthResult>("/auth/signup", input);
  setTokens(result.tokens);
  setUser(result.user);
  return result;
}

/**
 * POST /auth/logout — revokes the current refresh token server-side, then
 * clears the local tokens and user. Local state is cleared even if the network
 * call fails, so the user is always logged out client-side.
 */
export async function logout(): Promise<void> {
  const refreshToken = getRefreshToken();
  try {
    if (refreshToken) {
      await httpClient.post<void>("/auth/logout", { refreshToken });
    }
  } finally {
    clearTokens();
    clearUser();
  }
}
