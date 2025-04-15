import type { components } from "../schemas/auth.types";

export type Account = Required<components["schemas"]["Account"]>;
export type Token = components["schemas"]["Token"];
export type Login = components["schemas"]["Login"];
export type CreateUser = components["schemas"]["CreateUser"];
export type UpdateUser = components["schemas"]["UpdateUser"];
export type JsonError = components["schemas"]["JsonError"];
export type Message = components["schemas"]["Message"];

export interface AuthSession {
  user: Account;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
  expiresAt: number;
}

export type LoginInput = Login;

export interface ApiError {
  error?: string;
}

export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
  response: Response;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  userId: number;
}

export interface LogoutResponse {
  message: string;
}

export interface RefreshResponse {
  token: string;
}
