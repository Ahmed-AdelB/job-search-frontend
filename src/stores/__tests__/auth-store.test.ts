/**
 * Auth Store Tests
 * Author: Ahmed Adel Bakr Alderai
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { useAuthStore } from "@/stores/auth-store";
import * as authLib from "@/lib/auth";
import * as apiClient from "@/lib/api-client";
import type { AuthResponse } from "@/types/api";

// Helper to create valid JWT tokens
function createJWT(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = btoa(JSON.stringify(payload));
  const signature = btoa("test-signature");
  return `${header}.${body}.${signature}`;
}

// Create a valid non-expired JWT (exp: year 2099)
const validToken = createJWT({ exp: 4070908800, sub: "user-123" });

// Create an expired JWT (exp: year 2000)
const expiredToken = createJWT({ exp: 946684800, sub: "user-123" });

describe("Auth Store", () => {
  beforeEach(() => {
    // Reset store to initial state
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
    // Clear localStorage
    localStorage.clear();
    // Clear all mocks
    vi.clearAllMocks();
  });

  it("should have initial state with null user and token", () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it("should login successfully and set user, token, and isAuthenticated", async () => {
    // Mock apiPost to return successful response
    const mockResponse: AuthResponse = {
      token: validToken,
      user_id: "user-123",
      email: "test@example.com",
      name: "John Doe",
    };
    vi.spyOn(apiClient, "apiPost").mockResolvedValue(mockResponse);

    // Mock auth library functions
    vi.spyOn(authLib, "setToken").mockImplementation(() => {});
    vi.spyOn(authLib, "setUser").mockImplementation(() => {});

    const result = await useAuthStore.getState().login("test@example.com", "password123");

    expect(result).toBe(true);
    const state = useAuthStore.getState();
    expect(state.user).toEqual({
      user_id: "user-123",
      email: "test@example.com",
      name: "John Doe",
    });
    expect(state.token).toBe(validToken);
    expect(state.isAuthenticated).toBe(true);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
    expect(authLib.setToken).toHaveBeenCalledWith(validToken);
    expect(authLib.setUser).toHaveBeenCalledWith({
      user_id: "user-123",
      email: "test@example.com",
      name: "John Doe",
    });
  });

  it("should handle login failure and set error message", async () => {
    const errorMessage = "Invalid credentials";
    vi.spyOn(apiClient, "apiPost").mockRejectedValue(new Error(errorMessage));

    const result = await useAuthStore.getState().login("test@example.com", "wrongpassword");

    expect(result).toBe(false);
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBe(errorMessage);
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
  });

  it("should logout and clear all authentication state", () => {
    // First set up authenticated state
    useAuthStore.setState({
      user: { user_id: "user-123", email: "test@example.com", name: "John Doe" },
      token: validToken,
      isAuthenticated: true,
      error: null,
    });

    vi.spyOn(authLib, "removeToken").mockImplementation(() => {});
    vi.spyOn(authLib, "removeUser").mockImplementation(() => {});

    // Mock window.location.href
    delete (window as Partial<Window>).location;
    window.location = { href: "" } as Location;

    useAuthStore.getState().logout();

    expect(authLib.removeToken).toHaveBeenCalled();
    expect(authLib.removeUser).toHaveBeenCalled();
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.error).toBeNull();
    expect(window.location.href).toBe("/login");
  });

  it("should return true for checkAuth with valid non-expired token", () => {
    useAuthStore.setState({
      token: validToken,
      isAuthenticated: false,
    });

    const result = useAuthStore.getState().checkAuth();

    expect(result).toBe(true);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  it("should return false and clear auth for checkAuth with expired token", () => {
    useAuthStore.setState({
      token: expiredToken,
      user: { user_id: "user-123", email: "test@example.com" },
      isAuthenticated: true,
    });

    vi.spyOn(authLib, "removeToken").mockImplementation(() => {});
    vi.spyOn(authLib, "removeUser").mockImplementation(() => {});

    const result = useAuthStore.getState().checkAuth();

    expect(result).toBe(false);
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
    expect(authLib.removeToken).toHaveBeenCalled();
    expect(authLib.removeUser).toHaveBeenCalled();
  });

  it("should return false for checkAuth with no token", () => {
    useAuthStore.setState({
      token: null,
      isAuthenticated: true,
    });

    const result = useAuthStore.getState().checkAuth();

    expect(result).toBe(false);
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it("should handle signup success and set isLoading correctly", async () => {
    const mockResponse: AuthResponse = {
      token: validToken,
      user_id: "user-123",
      email: "newuser@example.com",
    };
    vi.spyOn(apiClient, "apiPost").mockResolvedValue(mockResponse);

    // isLoading should be false before signup
    expect(useAuthStore.getState().isLoading).toBe(false);

    const signupPromise = useAuthStore.getState().signup("newuser@example.com", "password123");

    // Check isLoading is true during signup
    expect(useAuthStore.getState().isLoading).toBe(true);

    const result = await signupPromise;

    expect(result).toBe(true);
    const state = useAuthStore.getState();
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it("should handle signup failure and set error message", async () => {
    const errorMessage = "Email already exists";
    vi.spyOn(apiClient, "apiPost").mockRejectedValue(new Error(errorMessage));

    const result = await useAuthStore.getState().signup("existing@example.com", "password123");

    expect(result).toBe(false);
    const state = useAuthStore.getState();
    expect(state.isLoading).toBe(false);
    expect(state.error).toBe(errorMessage);
  });

  it("should clear error when calling clearError", () => {
    useAuthStore.setState({
      error: "Some error message",
    });

    useAuthStore.getState().clearError();

    expect(useAuthStore.getState().error).toBeNull();
  });

  it("should set isLoading to true during login and false after completion", async () => {
    vi.spyOn(apiClient, "apiPost").mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              token: validToken,
              user_id: "user-123",
              email: "test@example.com",
            } as AuthResponse);
          }, 10);
        })
    );

    vi.spyOn(authLib, "setToken").mockImplementation(() => {});
    vi.spyOn(authLib, "setUser").mockImplementation(() => {});

    const loginPromise = useAuthStore.getState().login("test@example.com", "password123");

    // Check isLoading is true immediately after calling login
    expect(useAuthStore.getState().isLoading).toBe(true);

    await loginPromise;

    // Check isLoading is false after login completes
    expect(useAuthStore.getState().isLoading).toBe(false);
  });
});
