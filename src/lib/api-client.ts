/**
 * API Client - Typed fetch wrapper for JobFlow API
 * Author: Ahmed Adel Bakr Alderai
 */

import { toast } from "sonner";

const API_URL = typeof window === 'undefined'
  ? (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8082")
  : "";

interface ApiOptions extends RequestInit {
  skipAuth?: boolean;
}

interface ApiError extends Error {
  status?: number;
  data?: unknown;
}

/**
 * Build login URL with returnUrl parameter to preserve current page
 */
function getLoginUrlWithReturn(): string {
  if (typeof window === "undefined") {
    return "/login";
  }

  // Get current pathname as return destination
  const currentPath = window.location.pathname;
  const loginUrl = new URL("/login", window.location.origin);

  // Only set returnUrl for protected paths (avoid redirect loops from auth pages)
  const protectedPaths = [
    "/jobs", "/contacts", "/applications", "/agents", "/analytics",
    "/outreach", "/profile", "/settings", "/billing", "/notifications",
    "/intelligence", "/interviews", "/invitations", "/logs", "/portals",
    "/recruiters", "/target-list", "/triage", "/deploy", "/admin", "/community",
  ];

  const shouldRedirectBack = protectedPaths.some((prefix) => currentPath.startsWith(prefix));
  if (shouldRedirectBack) {
    loginUrl.searchParams.set("returnUrl", currentPath);
  }

  return loginUrl.pathname + loginUrl.search;
}

/**
 * Core fetch wrapper with authentication and error handling
 */
export async function apiFetch<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const url = `${API_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  // Add JWT Authorization header if not skipped
  if (!options.skipAuth) {
    const token = localStorage.getItem("auth-token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);

    // Handle specific status codes
    if (response.status === 401) {
      // Clear auth from localStorage and cookie, then redirect with returnUrl
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth-token");
        localStorage.removeItem("auth-user");
        document.cookie = "auth-token=; path=/; max-age=0; SameSite=Lax";
        const loginUrl = getLoginUrlWithReturn();
        window.location.href = loginUrl;
      }
      throw new Error("Unauthorized - Please log in again");
    }

    if (response.status === 403) {
      toast.error("Access Forbidden", {
        description: "You don't have permission to perform this action.",
      });
      throw new Error("Forbidden");
    }

    // Handle non-OK responses
    if (!response.ok) {
      let errorData: unknown;
      try {
        errorData = await response.json();
      } catch {
        errorData = await response.text();
      }

      const error: ApiError = new Error(
        (errorData as { detail?: string })?.detail || `HTTP ${response.status}: ${response.statusText}`
      );
      error.status = response.status;
      error.data = errorData;
      throw error;
    }

    // Handle empty responses
    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Network error - Please check your connection");
  }
}

/**
 * HTTP GET request
 */
export function apiGet<T>(endpoint: string, options: Omit<ApiOptions, "method"> = {}): Promise<T> {
  return apiFetch<T>(endpoint, { ...options, method: "GET" });
}

/**
 * HTTP POST request
 */
export function apiPost<T>(
  endpoint: string,
  body: unknown,
  options: Omit<ApiOptions, "method" | "body"> = {}
): Promise<T> {
  return apiFetch<T>(endpoint, {
    ...options,
    method: "POST",
    body: JSON.stringify(body),
  });
}

/**
 * HTTP PUT request
 */
export function apiPut<T>(
  endpoint: string,
  body: unknown,
  options: Omit<ApiOptions, "method" | "body"> = {}
): Promise<T> {
  return apiFetch<T>(endpoint, {
    ...options,
    method: "PUT",
    body: JSON.stringify(body),
  });
}

/**
 * HTTP PATCH request
 */
export function apiPatch<T>(
  endpoint: string,
  body: unknown,
  options: Omit<ApiOptions, "method" | "body"> = {}
): Promise<T> {
  return apiFetch<T>(endpoint, {
    ...options,
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

/**
 * HTTP DELETE request
 */
export function apiDelete<T>(
  endpoint: string,
  options: Omit<ApiOptions, "method"> = {}
): Promise<T> {
  return apiFetch<T>(endpoint, { ...options, method: "DELETE" });
}
