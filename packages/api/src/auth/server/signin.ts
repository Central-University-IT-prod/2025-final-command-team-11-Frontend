"use server";

import { cookies } from "next/headers";

import type { AuthErrorCode } from "../errors";
import type { Account, AuthSession, LoginInput } from "../types";
import { env } from "../../env";
import { AUTH_COOKIE_NAME } from "../constants";
import { AuthError } from "../errors";

type SignInResponse =
  | { session: AuthSession; error: undefined; errorType: undefined }
  | { session: undefined; error: string; errorType: AuthErrorCode };

interface LoginResponseData {
  token?: string;
  error?: string;
}

export async function serverSignIn(
  credentials: LoginInput,
): Promise<SignInResponse> {
  try {
    const response = await fetch(`${env.NEXT_PUBLIC_API_URL_ID}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      }),
    });

    const responseData = (await response.json()) as LoginResponseData;

    if (!response.ok || !responseData.token) {
      return {
        session: undefined,
        error: responseData.error ?? "Failed to get user data",
        errorType: "INVALID_CREDENTIALS",
      };
    }

    const userResponse = await fetch(`${env.NEXT_PUBLIC_API_URL_ID}/account/`, {
      headers: {
        Authorization: `Bearer ${responseData.token}`,
      },
    });

    if (!userResponse.ok) {
      return {
        session: undefined,
        error: "Failed to get user profile data",
        errorType: "NETWORK_ERROR",
      };
    }

    const userData = (await userResponse.json()) as Account;

    const newSession: AuthSession = {
      user: userData,
      tokens: {
        accessToken: responseData.token,
        refreshToken: responseData.token,
      },
      expiresAt: Math.floor(Date.now() / 1000) + 3600,
    };

    try {
      const cookieStore = await cookies();
      const oneWeek = 7 * 24 * 60 * 60 * 1000;

      cookieStore.set(AUTH_COOKIE_NAME, JSON.stringify(newSession), {
        expires: new Date(Date.now() + oneWeek),
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        httpOnly: true,
        path: "/",
      });
    } catch (cookieError) {
      console.error("Failed to set cookie:", cookieError);
    }

    return { session: newSession, error: undefined, errorType: undefined };
  } catch (unknownError) {
    let errorMessage = "Unknown error";
    let errorType: AuthErrorCode = "NETWORK_ERROR";

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
}
