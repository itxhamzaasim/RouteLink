import { AUTH_COOKIE_NAME } from "./constants";

export const AUTH_CONFIG = {
  cookieName: AUTH_COOKIE_NAME,
  cookieMaxAge: 60 * 60 * 24 * 7, // 7 days
  protectedRoutes: ["/dashboard", "/admin"],
  authRoutes: ["/login", "/register"],
} as const;

export function isProtectedRoute(pathname: string): boolean {
  return AUTH_CONFIG.protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

export function isAuthRoute(pathname: string): boolean {
  return AUTH_CONFIG.authRoutes.includes(
    pathname as (typeof AUTH_CONFIG.authRoutes)[number]
  );
}
