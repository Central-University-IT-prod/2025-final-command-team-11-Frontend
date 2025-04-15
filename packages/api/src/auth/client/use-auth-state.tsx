"use client";

import { useCallback } from "react";

import type { LoginInput } from "../types";
import { useLogout } from "./use-logout";
import { useRefresh } from "./use-refresh";
import { useSession } from "./use-session";
import { useSignIn } from "./use-sign-in";

export function useAuthState() {
  const { session } = useSession();
  const { signIn } = useSignIn();
  const { logout } = useLogout();
  const { refreshToken } = useRefresh();
  const isLoggedIn = useCallback(() => {
    return !!session;
  }, [session]);

  const isTokenExpired = useCallback(() => {
    if (!session) return true;
    const now = Math.floor(Date.now() / 1000);
    return session.expiresAt <= now;
  }, [session]);

  const login = async (credentials: LoginInput) => {
    return signIn(credentials);
  };

  return {
    session,
    isLoggedIn,
    isTokenExpired,
    login,
    logout,
    refreshToken,
  };
}
