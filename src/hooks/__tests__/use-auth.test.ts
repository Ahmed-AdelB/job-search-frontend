/**
 * Test Suite: useAuth hook
 * Author: Ahmed Adel Bakr Alderai
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useAuth, isSafeRedirectUrl } from "../use-auth";

// Mock both the auth store and router
vi.mock("@/stores/auth-store");
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
  usePathname: () => "/dashboard",
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
  redirect: vi.fn(),
  notFound: vi.fn(),
}));

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

describe("useAuth Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    // Default mock for authenticated state
    vi.mocked(useAuthStore).mockReturnValue({
      user: {
        id: "user_1",
        email: "test@example.com",
        name: "Test User",
      },
      token: "mock_token_123",
      isAuthenticated: true,
      isLoading: false,
      error: null,
      login: vi.fn(),
      signup: vi.fn(),
      logout: vi.fn(),
      checkAuth: vi.fn(() => true),
      clearError: vi.fn(),
    } as any);

    // Default router mock
    vi.mocked(useRouter).mockReturnValue({
      push: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    } as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should return authenticated user when token exists", () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toBeDefined();
    expect(result.current.user?.email).toBe("test@example.com");
    expect(result.current.token).toBe("mock_token_123");
  });

  it("should return user details", () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toEqual({
      id: "user_1",
      email: "test@example.com",
      name: "Test User",
    });
  });

  it("should expose store methods", () => {
    const { result } = renderHook(() => useAuth());

    expect(typeof result.current.login).toBe("function");
    expect(typeof result.current.signup).toBe("function");
    expect(typeof result.current.logout).toBe("function");
    expect(typeof result.current.checkAuth).toBe("function");
    expect(typeof result.current.clearError).toBe("function");
  });

  it("should show loading state from store", () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.isLoading).toBe(false);
  });

  it("should redirect to login when requireAuth=true and not authenticated", async () => {
    // Mock unauthenticated state for this test
    const mockCheckAuth = vi.fn(() => false);
    vi.mocked(useAuthStore).mockReturnValue({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      login: vi.fn(),
      signup: vi.fn(),
      logout: vi.fn(),
      checkAuth: mockCheckAuth,
      clearError: vi.fn(),
    } as any);

    // Mock the router with a push function we can check
    const mockPush = vi.fn();
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    } as any);

    renderHook(() => useAuth(true));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(expect.stringContaining("/login"));
    });
  });

  it("should not redirect when requireAuth=false", () => {
    // Mock the router with a push function we can check
    const mockPush = vi.fn();
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    } as any);

    renderHook(() => useAuth(false));

    expect(mockPush).not.toHaveBeenCalled();
  });
});

describe("isSafeRedirectUrl", () => {
  it('should return true for "/dashboard" path', () => {
    expect(isSafeRedirectUrl("/dashboard")).toBe(true);
  });

  it('should return true for "/dashboard/jobs" path', () => {
    expect(isSafeRedirectUrl("/dashboard/jobs")).toBe(true);
  });

  it('should return true for "/profile" path', () => {
    expect(isSafeRedirectUrl("/profile")).toBe(true);
  });

  it('should return true for "/settings" path', () => {
    expect(isSafeRedirectUrl("/settings")).toBe(true);
  });

  it('should return true for "/settings/general" path', () => {
    expect(isSafeRedirectUrl("/settings/general")).toBe(true);
  });

  it('should return false for protocol-relative URL', () => {
    expect(isSafeRedirectUrl("//evil.com")).toBe(false);
  });

  it('should return false for external URL with http', () => {
    expect(isSafeRedirectUrl("http://evil.com")).toBe(false);
  });

  it('should return false for external URL with https', () => {
    expect(isSafeRedirectUrl("https://evil.com")).toBe(false);
  });

  it('should return false for URL without leading slash', () => {
    expect(isSafeRedirectUrl("dashboard")).toBe(false);
  });

  it('should return false for unknown path prefix', () => {
    expect(isSafeRedirectUrl("/unknown-path")).toBe(false);
  });

  it('should return false for empty string', () => {
    expect(isSafeRedirectUrl("")).toBe(false);
  });

  it('should return false for root path only', () => {
    expect(isSafeRedirectUrl("/")).toBe(false);
  });
});
