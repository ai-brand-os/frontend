import { apiFetch } from "./client";
import { clearTokens, getRefreshToken, setTokens } from "./token-store";
import type { AuthResult } from "./types";

export type LoginInput = {
  email: string;
  password: string;
};

export type SignupInput = {
  email: string;
  password: string;
  fullName: string;
  organization: {
    name: string;
    industry: string;
    companySize: string;
    websiteUrl?: string;
    primaryRegion: string;
    primaryLanguage: string;
  };
};

/** POST /auth/login — stores the returned token pair on success. */
export async function login(input: LoginInput): Promise<AuthResult> {
  const result = await apiFetch<AuthResult>("/auth/login", {
    method: "POST",
    body: input,
    auth: false,
  });
  setTokens(result.tokens);
  return result;
}

/** POST /auth/signup — creates the account and stores the token pair. */
export async function signup(input: SignupInput): Promise<AuthResult> {
  const result = await apiFetch<AuthResult>("/auth/signup", {
    method: "POST",
    body: input,
    auth: false,
  });
  setTokens(result.tokens);
  return result;
}

/**
 * POST /auth/logout — revokes the current refresh token server-side, then
 * clears local tokens. Local state is cleared even if the network call fails,
 * so the user is always logged out client-side.
 */
export async function logout(): Promise<void> {
  const refreshToken = getRefreshToken();
  try {
    if (refreshToken) {
      await apiFetch<void>("/auth/logout", {
        method: "POST",
        body: { refreshToken },
        auth: false,
      });
    }
  } finally {
    clearTokens();
  }
}
