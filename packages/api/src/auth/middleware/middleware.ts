import type { NextRequest } from "next/server";

import type { AuthSession } from "../types";
import { AUTH_COOKIE_NAME } from "../constants";

export interface AuthMiddlewareConfig {
  redirectTo?: string;
  publicRoutes?: string[];
  defaultPublicRoutes?: string[];
}

export interface AuthRequest extends NextRequest {
  auth: { session: AuthSession | null };
}

function getSessionFromCookie(request: NextRequest): AuthSession | null {
  try {
    const sessionCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;

    if (!sessionCookie) {
      return null;
    }

    const session = JSON.parse(
      decodeURIComponent(sessionCookie),
    ) as AuthSession;

    if (!session.tokens.accessToken || session.expiresAt < Date.now() / 1000) {
      return null;
    }

    return session;
  } catch (error) {
    console.error("Error getting auth session:", error);
    return null;
  }
}

export function authMiddleware(config: AuthMiddlewareConfig = {}) {
  const {
    redirectTo = "/login",
    publicRoutes = [],
    defaultPublicRoutes = [
      "/login",
      "/register",
      "/api/auth",
      "/_next",
      "/favicon.ico",
      "/static",
    ],
  } = config;

  const allPublicRoutes = [...defaultPublicRoutes, ...publicRoutes];

  function authMiddleware(request: NextRequest) {
    const session = getSessionFromCookie(request);

    (request as AuthRequest).auth = { session };

    const { pathname } = request.nextUrl;

    const isPublicRoute = allPublicRoutes.some((route) => {
      if (route.endsWith("*")) {
        const baseRoute = route.slice(0, -1);
        return pathname.startsWith(baseRoute);
      }
      return pathname === route;
    });

    if (isPublicRoute) {
      return;
    }

    if (!session) {
      const url = new URL(redirectTo, request.url);
      url.searchParams.set("callbackUrl", encodeURIComponent(request.url));
      return Response.redirect(url, 302);
    }

    return;
  }

  return function middleware(request: NextRequest) {
    const authResponse = authMiddleware(request);

    if (authResponse) {
      return authResponse;
    }

    return;
  };
}

export { authMiddleware as middleware };
