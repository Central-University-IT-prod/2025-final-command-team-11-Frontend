"use client";

import { useCallback, useRef } from "react";

import { $authFetch } from "../../api.client";
import { useSession } from "./use-session";

interface UseRefreshOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function useRefresh(options: UseRefreshOptions = {}) {
  const { onSuccess, onError } = options;

  const { session, setSession, clearSession } = useSession();
  const isRefreshingRef = useRef(false);

  const refreshAttemptsRef = useRef(0);
  const lastRefreshAttemptRef = useRef(0);

  const MAX_ATTEMPTS = 3;
  const ATTEMPT_RESET_TIME = 10000;

  const refreshToken = useCallback(async () => {
    if (!session) {
      return {
        success: false,
        error: "No active session",
      };
    }

    const now = Date.now();
    if (now - lastRefreshAttemptRef.current < ATTEMPT_RESET_TIME) {
      refreshAttemptsRef.current += 1;

      if (refreshAttemptsRef.current > MAX_ATTEMPTS) {
        const error = `Too many refresh attempts (${refreshAttemptsRef.current}) within ${ATTEMPT_RESET_TIME}ms. Cooling down.`;
        console.warn(error);
        onError?.(error);
        return { success: false, error };
      }
    } else {
      refreshAttemptsRef.current = 1;
    }

    lastRefreshAttemptRef.current = now;

    if (isRefreshingRef.current) {
      return {
        success: false,
        error: "Refresh already in progress",
      };
    }

    try {
      isRefreshingRef.current = true;
      const response = await $authFetch.GET("/auth/refresh");

      if (response.error) {
        const errorMessage = response.error.error ?? "Token refresh failed";
        onError?.(errorMessage);

        if (response.response.status === 401) {
          clearSession();
        }

        return { success: false, error: errorMessage };
      }

      if (!response.data.token) {
        const errorMessage = "Failed to refresh token";
        onError?.(errorMessage);
        return { success: false, error: errorMessage };
      }

      const updatedSession = {
        ...session,
        tokens: {
          accessToken: response.data.token,
          refreshToken: response.data.token,
        },
        expiresAt: Math.floor(Date.now() / 1000) + 3600,
      };

      setSession(updatedSession);
      onSuccess?.();
      return { success: true, error: undefined };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      onError?.(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      isRefreshingRef.current = false;
    }
  }, [session, setSession, clearSession, onSuccess, onError]);

  return { refreshToken };
}
