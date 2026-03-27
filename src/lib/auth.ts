/**
 * Auth Utilities - JWT and User Management
 * Author: Ahmed Adel Bakr Alderai
 */

const TOKEN_KEY = "auth-token";
const USER_KEY = "auth-user";

export interface User {
  user_id: string;
  email: string;
  name?: string;
  avatar?: string;
}

/**
 * Get JWT token from localStorage
 */
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Set JWT token in localStorage and cookie (for middleware access)
 */
export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  // Also set as cookie so Next.js middleware can read it
  document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

/**
 * Remove JWT token from localStorage and cookie
 */
export function removeToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  // Also remove the cookie
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax`;
}

/**
 * Get user data from localStorage
 */
export function getUser(): User | null {
  if (typeof window === "undefined") return null;
  const userData = localStorage.getItem(USER_KEY);
  if (!userData) return null;
  try {
    return JSON.parse(userData) as User;
  } catch {
    return null;
  }
}

/**
 * Set user data in localStorage
 */
export function setUser(user: User): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/**
 * Remove user data from localStorage
 */
export function removeUser(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(USER_KEY);
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getToken();
}

/**
 * Logout user - clear auth data and redirect
 */
export function logout(redirectUrl: string = "/login"): void {
  removeToken();
  removeUser();
  if (typeof window !== "undefined") {
    window.location.href = redirectUrl;
  }
}
