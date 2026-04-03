/**
 * Next.js Middleware - Route Protection
 * Protects dashboard routes from unauthenticated access
 *
 * REDIRECT PARAMETER CONVENTION (Issue #408):
 * When redirecting unauthenticated users to login, this middleware sets
 * the 'returnUrl' query parameter to preserve the original requested path.
 * Example: User tries to access /jobs/123 → redirect to /login?returnUrl=/jobs/123
 *
 * The login page (app/(auth)/login/page.tsx) then reads this parameter and:
 * 1. Validates it's a safe path
 * 2. Redirects user back to that path after successful login
 * 3. Falls back to /jobs if returnUrl is missing or unsafe
 *
 * Author: Ahmed Adel Bakr Alderai
 */

import { NextResponse, type NextRequest } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8082";

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/privacy",
  "/terms",
];

// Routes that should redirect to home if already logged in
const AUTH_ROUTES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
];

/**
 * Check if a JWT token cookie is expired by parsing the payload.
 * Returns true if the token is valid and not expired.
 */
function isTokenValid(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    const payload = JSON.parse(atob(parts[1]));
    if (!payload.exp) return true; // No expiry = assume valid
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Proxy /api/* requests to the backend
  if (pathname.startsWith("/api/")) {
    const backendUrl = new URL(pathname + request.nextUrl.search, BACKEND_URL);
    const headers = new Headers(request.headers);
    headers.set("host", new URL(BACKEND_URL).host);
    return NextResponse.rewrite(backendUrl, {
      request: { headers },
    });
  }

  // Skip static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.includes(".") // static files like favicon.ico
  ) {
    return NextResponse.next();
  }

  // Get auth token from cookies and validate expiration
  const authToken = request.cookies.get("auth-token")?.value;
  const isAuthenticated = !!authToken && isTokenValid(authToken);

  // If cookie exists but token is expired, clear the cookie
  if (authToken && !isAuthenticated) {
    const response = NextResponse.next();
    response.cookies.delete("auth-token");
    return response;
  }

  // Check if this is a public route
  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname === route);

  // Check if route is an auth route
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname === route);

  // Redirect to dashboard if already logged in and trying to access auth routes
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/jobs", request.url));
  }

  // Redirect to login if accessing any protected route without auth
  if (!isPublicRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    // Issue #408: Standardized parameter name is 'returnUrl' (not 'from')
    loginUrl.searchParams.set("returnUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Configure which routes to apply middleware to
export const config = {
  matcher: [
    // Match all routes except static files and API
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
