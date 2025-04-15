"use client";

import { useCallback } from "react";

import { $authFetch } from "../../api.client";
import { useSession } from "./use-session";

interface UseLogoutOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function useLogout(options: UseLogoutOptions = {}) {
  const { clearSession } = useSession();

  const logout = useCallback(async () => {
    try {
      const response = await $authFetch.POST("/auth/logout");

      if (response.error) {
        const errorMessage = response.error.error ?? "Logout failed";
        options.onError?.(errorMessage);
        return { success: false, error: errorMessage };
      }

      clearSession();
      options.onSuccess?.();
      return { success: true, error: undefined };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      options.onError?.(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [clearSession, options]);

  return { logout };
}
