"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/auth-store"
import type { User } from "@/types/api"

interface UseAuthResult {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<boolean>
  signup: (email: string, password: string) => Promise<boolean>
  logout: () => void
  checkAuth: () => boolean
  clearError: () => void
}

/** Allowed redirect path prefixes after login */
const SAFE_REDIRECT_PREFIXES = [
  "/jobs", "/contacts", "/applications", "/agents", "/analytics",
  "/outreach", "/profile", "/settings", "/billing", "/notifications",
  "/intelligence", "/interviews", "/invitations", "/logs", "/portals",
  "/recruiters", "/target-list", "/triage", "/deploy", "/admin", "/community",
];

function isSafeRedirectUrl(url: string): boolean {
  // Only allow relative paths starting with known prefixes
  if (!url.startsWith("/")) return false;
  if (url.startsWith("//")) return false; // Protocol-relative URL
  return SAFE_REDIRECT_PREFIXES.some((prefix) => url.startsWith(prefix));
}

/**
 * Auth hook - wraps useAuthStore with convenience methods
 * Auto-checks auth on mount and redirects to login if unauthenticated
 * Author: Ahmed Adel Bakr Alderai
 */
export function useAuth(requireAuth = false): UseAuthResult {
  const router = useRouter()
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    signup,
    logout,
    checkAuth,
    clearError,
  } = useAuthStore()

  // Check auth on mount
  useEffect(() => {
    const isAuth = checkAuth()

    // Redirect to login if auth is required but user is not authenticated
    if (requireAuth && !isAuth) {
      const returnUrl = typeof window !== "undefined" ? window.location.pathname : "/jobs"
      const safeReturnUrl = isSafeRedirectUrl(returnUrl) ? returnUrl : "/jobs"
      router.push(`/login?returnUrl=${encodeURIComponent(safeReturnUrl)}`)
    }
  }, [requireAuth, checkAuth, router])

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    signup,
    logout,
    checkAuth,
    clearError,
  }
}

export { isSafeRedirectUrl }
