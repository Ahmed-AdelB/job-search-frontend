"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore, type User } from "@/stores/auth-store"

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

/**
 * Auth hook - wraps useAuthStore with convenience methods
 * Auto-checks auth on mount and redirects to login if unauthenticated
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
      const returnUrl = typeof window !== "undefined" ? window.location.pathname : "/"
      router.push(`/login?returnUrl=${encodeURIComponent(returnUrl)}`)
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
