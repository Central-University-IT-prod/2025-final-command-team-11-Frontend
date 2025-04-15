"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";

import { useRefresh, useSession } from "@acme/api/auth";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastRefreshTimeRef = useRef<number>(0);
  const MIN_REFRESH_INTERVAL = 5000;
  const { session } = useSession();

  const { refreshToken } = useRefresh({
    onError: (error: string) => {
      console.error("Auth refresh error:", error);
    },
    onSuccess: () => {
      lastRefreshTimeRef.current = Date.now();
      console.log(
        "Token refresh successful, updated at:",
        new Date().toISOString(),
      );
    },
  });

  useEffect(() => {
    if (!session) {
      console.log("No active session, skipping refresh setup");
      return;
    }

    const safeRefresh = async () => {
      const now = Date.now();
      const elapsed = now - lastRefreshTimeRef.current;

      if (elapsed < MIN_REFRESH_INTERVAL) {
        console.log(
          `Skipping refresh, last refresh was ${elapsed}ms ago (min: ${MIN_REFRESH_INTERVAL}ms)`,
        );
        return;
      }

      try {
        console.log("Attempting token refresh");
        const result = await refreshToken();
        if (!result.success) {
          console.error("Refresh failed:", result.error);
        }
      } catch (error) {
        console.error("Error during refresh:", error);
      }
    };

    console.log("Setting up refresh interval (1 hour)");
    timerRef.current = setInterval(() => {
      void safeRefresh();
    }, 3600 * 1000);

    return () => {
      if (timerRef.current) {
        console.log("Cleaning up refresh interval");
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [session, refreshToken]);

  return <>{children}</>;
}
