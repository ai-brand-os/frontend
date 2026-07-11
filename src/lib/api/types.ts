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

/** Error envelope the backend emits: `{ success: false, error: { code, message } }`. */
export type ApiErrorBody = {
  success: false;
  error: { code: string; message: string };
};

/**
 * Thrown by {@link apiFetch} for any non-2xx response (and for network
 * failures, with `status = 0`). Carries the backend's error `code` so callers
 * can branch on it (e.g. `INVALID_CREDENTIALS`, `EMAIL_ALREADY_REGISTERED`)
 * instead of matching on message text.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}
