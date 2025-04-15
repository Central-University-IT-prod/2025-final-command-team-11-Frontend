"use client";

import { useCallback, useState } from "react";
import { getCookie, setCookie } from "cookies-next/client";

import type { AuthSession } from "../types";
import { AUTH_COOKIE_NAME } from "../constants";

function getSessionFromCookie(): AuthSession | null {
  try {
    const sessionData = getCookie(AUTH_COOKIE_NAME);
    if (!sessionData) return null;

    try {
      return JSON.parse(sessionData) as AuthSession;
    } catch {
      return null;
    }
  } catch (e) {
    console.error("Error reading cookie:", e);
    return null;
  }
}

function setSessionToCookie(session: AuthSession): void {
  try {
    setCookie(AUTH_COOKIE_NAME, JSON.stringify(session));
  } catch (e) {
    console.error("Error setting cookie:", e);
  }
}

export function useSession() {
  const [session, setSessionState] = useState<AuthSession | null>(
    getSessionFromCookie,
  );

  const setSession = useCallback((session: AuthSession) => {
    setSessionToCookie(session);
    setSessionState(session);
  }, []);

  const clearSession = useCallback(() => {
    try {
      setCookie(AUTH_COOKIE_NAME, "", { maxAge: 0 });
    } catch (e) {
      console.error("Error clearing cookie:", e);
    }
    setSessionState(null);
  }, []);

  return {
    session,
    setSession,
    clearSession,
  };
}
