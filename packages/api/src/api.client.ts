import { getCookie } from "cookies-next";
import createFetchClient from "openapi-fetch";
import createClient from "openapi-react-query";

import type { AuthSession } from "./auth/types";
import type { adminPaths, authPaths, bookingPaths } from "./schemas/index";
import { env } from "./env";
import { AUTH_COOKIE_NAME } from "./index";

function getAuthHeader(): Record<string, string> | undefined {
  try {
    const sessionData = getCookie(AUTH_COOKIE_NAME);
    if (!sessionData || typeof sessionData !== "string") return undefined;

    const session = JSON.parse(sessionData) as AuthSession;
    if (!session.tokens.accessToken) return undefined;

    return {
      Authorization: `Bearer ${session.tokens.accessToken}`,
    };
  } catch (e) {
    console.error("Error getting auth token:", e);
    return undefined;
  }
}

export const $adminFetch = createFetchClient<adminPaths>({
  baseUrl: env.NEXT_PUBLIC_API_URL_ADMIN,
  credentials: "include",
});

$adminFetch.use({
  onRequest: ({ request }) => {
    const headers = getAuthHeader();
    if (headers) {
      Object.entries(headers).forEach(([key, value]) => {
        request.headers.set(key, value);
      });
    }
    return request;
  },
});

export const $adminApi = createClient($adminFetch);

export const $authFetch = createFetchClient<authPaths>({
  baseUrl: env.NEXT_PUBLIC_API_URL_ID,
  credentials: "include",
  mode: "cors",
  headers: {
    "Content-Type": "application/json",
  },
});

$authFetch.use({
  onRequest: ({ request }) => {
    const headers = getAuthHeader();
    if (headers) {
      Object.entries(headers).forEach(([key, value]) => {
        request.headers.set(key, value);
      });
    }
    return request;
  },
});

export const $authApi = createClient($authFetch);

export const $bookingFetch = createFetchClient<bookingPaths>({
  baseUrl: env.NEXT_PUBLIC_API_URL_BOOKING,
  credentials: "include",
});

$bookingFetch.use({
  onRequest: ({ request }) => {
    const headers = getAuthHeader();
    if (headers) {
      Object.entries(headers).forEach(([key, value]) => {
        request.headers.set(key, value);
      });
    }
    return request;
  },
});

export const $bookingApi = createClient($bookingFetch);
