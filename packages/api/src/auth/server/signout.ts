"use server";

import { cookies } from "next/headers";

import { env } from "../../env";
import { AUTH_COOKIE_NAME } from "../constants";
import { auth } from "./auth";

interface SignOutResponse {
  success: boolean;
  error?: string;
}

export async function serverSignOut(): Promise<SignOutResponse> {
  try {
    const session = await auth();

    if (session?.tokens.accessToken) {
      try {
        const response = await fetch(
          `${env.NEXT_PUBLIC_API_URL_ID}/auth/logout`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${session.tokens.accessToken}`,
            },
          },
        );

        if (!response.ok) {
          console.warn(
            "Failed to logout from API, but will clear session anyway",
          );
        }
      } catch (apiError) {
        console.error("API logout error:", apiError);
      }
    }

    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, "", {
      maxAge: 0,
      path: "/",
      expires: new Date(0),
    });

    return { success: true };
  } catch (error) {
    console.error("Error during sign out:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unknown error during sign out",
    };
  }
}
