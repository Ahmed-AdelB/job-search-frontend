/**
 * Next.js Middleware - Route Protection
 * Protects dashboard routes from unauthenticated access
 * Author: Ahmed Adel Bakr Alderai
 */

import { NextResponse, type NextRequest } from "next/server";

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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files, Next.js internals, and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") // static files like favicon.ico
  ) {
    return NextResponse.next();
  }

  // Get auth token from cookies
  const authToken = request.cookies.get("auth-token")?.value;
  const isAuthenticated = !!authToken;

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
