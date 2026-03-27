/**
 * Next.js Middleware - Route Protection
 * Protects dashboard routes from unauthenticated access
 * Author: Ahmed Adel Bakr Alderai
 */

import { NextResponse, type NextRequest } from "next/server";

// Protected routes that require authentication
const PROTECTED_ROUTES = [
  "/dashboard",
  "/dashboard/(.*)", // All dashboard sub-routes
];

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

// Routes that should redirect to dashboard if already logged in
const AUTH_ROUTES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get auth token from cookies
  const authToken = request.cookies.get("auth-token")?.value;
  const isAuthenticated = !!authToken;

  // Check if route is protected
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => {
    const regex = new RegExp(`^${route}$`);
    return regex.test(pathname);
  });

  // Check if route is an auth route
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname === route);

  // Redirect to login if accessing protected route without auth
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("returnUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to dashboard if already logged in and trying to access auth routes
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// Configure which routes to apply middleware to
export const config = {
  matcher: [
    // Include protected routes
    "/dashboard/:path*",
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
    // Exclude static files and API routes
    "/((?!_next/static|_next/image|favicon.ico|api).*)",
  ],
};
