/**
 * Tests for Auth Utilities
 * Author: Ahmed Adel Bakr Alderai
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getToken,
  setToken,
  removeToken,
  getUser,
  setUser,
  removeUser,
  isAuthenticated,
  logout,
  type User,
} from "@/lib/auth";

describe("Auth Utilities", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe("Token Management", () => {
    it("setToken stores token in localStorage", () => {
      const token = "test-token-123";
      setToken(token);

      expect(localStorage.getItem("auth-token")).toBe(token);
    });

    it("getToken retrieves token from localStorage", () => {
      const token = "test-token-456";
      localStorage.setItem("auth-token", token);

      const result = getToken();

      expect(result).toBe(token);
    });

    it("getToken returns null when empty", () => {
      const result = getToken();

      expect(result).toBeNull();
    });

    it("removeToken clears token from localStorage", () => {
      localStorage.setItem("auth-token", "test-token");

      removeToken();

      expect(localStorage.getItem("auth-token")).toBeNull();
    });

    it("returns null when window is undefined", () => {
      const originalWindow = global.window;
      // @ts-ignore
      global.window = undefined;

      const result = getToken();

      expect(result).toBeNull();

      global.window = originalWindow;
    });

    it("handles setToken when window is undefined", () => {
      const originalWindow = global.window;
      // @ts-ignore
      global.window = undefined;

      // Should not throw
      setToken("test-token");

      global.window = originalWindow;
    });
  });

  describe("User Management", () => {
    it("setUser stores user as JSON in localStorage", () => {
      const user: User = {
        user_id: "123",
        email: "test@example.com",
        name: "Test User",
      };

      setUser(user);

      const stored = localStorage.getItem("auth-user");
      expect(stored).toBe(JSON.stringify(user));
    });

    it("getUser parses user JSON from localStorage", () => {
      const user: User = {
        user_id: "456",
        email: "user@example.com",
        name: "John Doe",
        avatar: "https://example.com/avatar.jpg",
      };

      localStorage.setItem("auth-user", JSON.stringify(user));

      const result = getUser();

      expect(result).toEqual(user);
    });

    it("getUser returns null when empty", () => {
      const result = getUser();

      expect(result).toBeNull();
    });

    it("getUser returns null for invalid JSON", () => {
      localStorage.setItem("auth-user", "invalid json {");

      const result = getUser();

      expect(result).toBeNull();
    });

    it("removeUser clears user from localStorage", () => {
      const user: User = {
        user_id: "789",
        email: "remove@example.com",
      };

      localStorage.setItem("auth-user", JSON.stringify(user));
      removeUser();

      expect(localStorage.getItem("auth-user")).toBeNull();
    });

    it("stores user with optional fields", () => {
      const user: User = {
        user_id: "999",
        email: "minimal@example.com",
      };

      setUser(user);
      const result = getUser();

      expect(result).toEqual(user);
      expect(result?.name).toBeUndefined();
      expect(result?.avatar).toBeUndefined();
    });
  });

  describe("Authentication Status", () => {
    it("isAuthenticated returns true when token exists", () => {
      setToken("test-token");

      const result = isAuthenticated();

      expect(result).toBe(true);
    });

    it("isAuthenticated returns false when token is missing", () => {
      const result = isAuthenticated();

      expect(result).toBe(false);
    });

    it("isAuthenticated returns false after removeToken", () => {
      setToken("test-token");
      removeToken();

      const result = isAuthenticated();

      expect(result).toBe(false);
    });
  });

  describe("Logout", () => {
    it("logout clears token and user", () => {
      const user: User = {
        user_id: "123",
        email: "logout@example.com",
      };

      setToken("test-token");
      setUser(user);

      const originalHref = window.location.href;
      delete (window as any).location;
      window.location = { href: originalHref } as any;

      logout();

      expect(getToken()).toBeNull();
      expect(getUser()).toBeNull();
    });

    it("logout redirects to /login by default", () => {
      setToken("test-token");

      const originalHref = window.location.href;
      delete (window as any).location;
      window.location = { href: originalHref } as any;

      logout();

      expect(window.location.href).toBe("/login");
    });

    it("logout redirects to custom URL when provided", () => {
      setToken("test-token");

      const originalHref = window.location.href;
      delete (window as any).location;
      window.location = { href: originalHref } as any;

      logout("/auth/login");

      expect(window.location.href).toBe("/auth/login");
    });

    it("logout handles undefined window gracefully", () => {
      const originalWindow = global.window;
      // @ts-ignore
      global.window = undefined;

      // Should not throw
      logout();

      global.window = originalWindow;
    });
  });

  describe("Integration Scenarios", () => {
    it("complete authentication flow", () => {
      const user: User = {
        user_id: "flow-123",
        email: "flow@example.com",
        name: "Flow User",
      };
      const token = "flow-token-xyz";

      // Login
      setToken(token);
      setUser(user);

      expect(isAuthenticated()).toBe(true);
      expect(getUser()).toEqual(user);
      expect(getToken()).toBe(token);

      // Check status
      expect(isAuthenticated()).toBe(true);

      // Logout
      delete (window as any).location;
      window.location = { href: "/" } as any;

      logout();

      expect(isAuthenticated()).toBe(false);
      expect(getUser()).toBeNull();
      expect(getToken()).toBeNull();
    });

    it("handles token refresh without user loss", () => {
      const user: User = {
        user_id: "refresh-123",
        email: "refresh@example.com",
      };

      setUser(user);
      setToken("old-token");

      // Refresh token
      setToken("new-token");

      expect(getToken()).toBe("new-token");
      expect(getUser()).toEqual(user);
    });

    it("getToken returns null for window server-side", () => {
      const originalWindow = global.window;
      // @ts-ignore
      global.window = undefined;

      const result = getToken();

      expect(result).toBeNull();

      global.window = originalWindow;
    });
  });
});
