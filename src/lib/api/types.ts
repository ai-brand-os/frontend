/**
 * The typed API error and its envelope now live in `./errors` (the single
 * source of error parsing/typing). Re-exported here so existing imports from
 * `./types` keep resolving.
 */
export { ApiError, type ApiErrorBody } from "./errors";

/** Mirrors the backend `AuthUserView` returned by every auth endpoint. */
export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
};

/** Mirrors the backend `TokenPair`. `expiresIn` is the access-token TTL in seconds. */
export type TokenPair = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

/** Mirrors the backend `AuthResult` — the raw success body of auth endpoints. */
export type AuthResult = {
  user: AuthUser;
  organizationId?: string;
  tokens: TokenPair;
};

