"use client";

import { setCookie } from "cookies-next/client";

import { registerResponseSchema } from "@acme/validators";

import type { AuthErrorCode } from "../errors";
import type { AuthSession } from "../types";
import { $authFetch } from "../../api.client";
import { AUTH_COOKIE_NAME } from "../constants";
import { AuthError } from "../errors";

export type AuthErrorType = AuthErrorCode;

interface CreateUserInput {
  email: string;
  password: string;
  name: string;
}

type SignUpResponse =
  | { session: AuthSession; error: undefined; errorType: undefined }
  | { session: undefined; error: string; errorType: AuthErrorType };

export function useSignUp() {
  const signUp = async (userData: CreateUserInput): Promise<SignUpResponse> => {
    try {
      const response = await $authFetch.POST("/account/new", {
        body: {
          email: userData.email,
          password: userData.password,
          name: userData.name,
        },
      });

      if (response.response.status !== 201) {
        return {
          session: undefined,
          error: "Failed to create account",
          errorType: "INVALID_CREDENTIALS",
        };
      }

      const validated = registerResponseSchema.safeParse(response.data);

      if (!validated.success) {
        return {
          session: undefined,
          error: validated.error.message,
          errorType: "INVALID_CREDENTIALS",
        };
      }

      const newSession: AuthSession = {
        user: {
          email: validated.data.email,
          id: validated.data.id,
          name: validated.data.name,
        },
        tokens: {
          accessToken: validated.data.token,
          refreshToken: validated.data.token,
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
    signUp,
  };
}
