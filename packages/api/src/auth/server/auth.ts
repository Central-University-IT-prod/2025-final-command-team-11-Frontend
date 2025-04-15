"use server";

import { cookies } from "next/headers";

import type { AuthSession } from "../types";
import { AUTH_COOKIE_NAME } from "../constants";

export async function auth() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!sessionCookie) {
    return null;
  }

  try {
    const session = JSON.parse(
      decodeURIComponent(sessionCookie),
    ) as AuthSession;
    if (!session.tokens.accessToken) {
      return null;
    }

    return session;
  } catch (error) {
    console.error("Failed to parse session:", error);
    return null;
  }
}
