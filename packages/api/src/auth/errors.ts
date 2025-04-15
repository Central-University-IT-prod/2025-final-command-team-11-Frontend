export type AuthErrorCode =
  | "INVALID_CREDENTIALS"
  | "NETWORK_ERROR"
  | "UNAUTHORIZED"
  | "TOKEN_EXPIRED"
  | "REFRESH_FAILED"
  | "VERIFICATION_REQUIRED"
  | "NOT_FOUND"
  | "INTERNAL_SERVER_ERROR";

export interface AuthErrorData {
  code: AuthErrorCode;
  message?: string;
}

export class AuthError extends Error {
  data: AuthErrorData;

  constructor(code: AuthErrorCode, message?: string) {
    super(message ?? code);
    this.name = "AuthError";
    this.data = { code, message };
  }
}
