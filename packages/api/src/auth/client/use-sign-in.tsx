"use client";

import { setCookie } from "cookies-next/client";

import { loginResponseSchema } from "@acme/validators";

import type { AuthErrorCode } from "../errors";
import type { AuthSession, LoginInput } from "../types";
import { $authFetch } from "../../api.client";
import { AUTH_COOKIE_NAME } from "../constants";
import { AuthError } from "../errors";

export type AuthErrorType = AuthErrorCode;

export type SignInResponse =
  | { session: AuthSession; error: undefined; errorType: undefined }
  | { session: undefined; error: string; errorType: AuthErrorType };

export function useSignIn() {
  const signIn = async (credentials: LoginInput): Promise<SignInResponse> => {
    try {
      const response = await $authFetch.POST("/auth/login", {
        body: {
          email: credentials.email,
          password: credentials.password,
        },
      });

      if (response.response.status !== 200) {
        if (response.response.status in [404, 401]) {
          return {
            session: undefined,
            error: "Invalid credentials",
            errorType: "INVALID_CREDENTIALS",
          };
        }
        return {
          session: undefined,
          error: "Failed to get user data",
          errorType: "INTERNAL_SERVER_ERROR",
        };
      }

      const validated = loginResponseSchema.safeParse(response.data);

      if (!validated.success) {
        return {
          session: undefined,
          error: "Internal server error",
          errorType: "INTERNAL_SERVER_ERROR",
        };
      }
      const tokenData = validated.data;

      const newSession: AuthSession = {
        user: {
          email: tokenData.email,
          id: tokenData.id,
          name: tokenData.name,
        },
        tokens: {
          accessToken: tokenData.token,
          refreshToken: tokenData.token,
        },
        expiresAt: Math.floor(Date.now() / 1000) + 3600,
      };

      try {
        const d = new Date();
        d.setTime(d.getTime() + 7 * 24 * 60 * 60 * 1000);
        setCookie(AUTH_COOKIE_NAME, JSON.stringify(newSession), {
          expires: d,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
        });
      } catch (cookieError) {
        console.error("Failed to set cookie:", cookieError);
      }

      return { session: newSession, error: undefined, errorType: undefined };
    } catch (unknownError) {
      let errorMessage = "Unknown error";
      let errorType: AuthErrorType = "NETWORK_ERROR";

      if (unknownError instanceof Error) {
        errorMessage = unknownError.message;

        if (unknownError instanceof AuthError) {
          if (
            typeof unknownError.data === "object" &&
            "code" in unknownError.data
          ) {
            const code = unknownError.data.code;
            if (typeof code === "string") {
              errorType = code;
            }
          }
        }
      }

      return { session: undefined, error: errorMessage, errorType };
    }
  };

  return {
    signIn,
  };
}
