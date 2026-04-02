/**
 * Tests for API Client
 * Author: Ahmed Adel Bakr Alderai
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { toast } from "sonner";
import {
  apiFetch,
  apiGet,
  apiPost,
  apiPut,
  apiPatch,
  apiDelete,
} from "@/lib/api-client";

describe("API Client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Mock window.location
    delete (window as any).location;
    window.location = { href: "" } as any;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("apiGet", () => {
    it("calls fetch with GET method and parses JSON", async () => {
      const mockData = { id: 1, name: "Test" };
      const mockFetch = vi.fn().mockResolvedValueOnce({
        status: 200,
        ok: true,
        json: async () => mockData,
      });
      global.fetch = mockFetch;

      const result = await apiGet("/test");

      expect(mockFetch).toHaveBeenCalledWith(
        "/test",
        expect.objectContaining({
          method: "GET",
        })
      );
      expect(result).toEqual(mockData);
    });
  });

  describe("apiPost", () => {
    it("calls fetch with POST method and serialized body", async () => {
      const mockBody = { name: "Test" };
      const mockResponse = { id: 1, ...mockBody };
      const mockFetch = vi.fn().mockResolvedValueOnce({
        status: 200,
        ok: true,
        json: async () => mockResponse,
      });
      global.fetch = mockFetch;

      const result = await apiPost("/test", mockBody);

      expect(mockFetch).toHaveBeenCalledWith(
        "/test",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(mockBody),
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("apiPut", () => {
    it("calls fetch with PUT method", async () => {
      const mockBody = { id: 1, name: "Updated" };
      const mockResponse = mockBody;
      const mockFetch = vi.fn().mockResolvedValueOnce({
        status: 200,
        ok: true,
        json: async () => mockResponse,
      });
      global.fetch = mockFetch;

      const result = await apiPut("/test/1", mockBody);

      expect(mockFetch).toHaveBeenCalledWith(
        "/test/1",
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify(mockBody),
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("apiPatch", () => {
    it("calls fetch with PATCH method", async () => {
      const mockBody = { name: "Patched" };
      const mockResponse = { id: 1, ...mockBody };
      const mockFetch = vi.fn().mockResolvedValueOnce({
        status: 200,
        ok: true,
        json: async () => mockResponse,
      });
      global.fetch = mockFetch;

      const result = await apiPatch("/test/1", mockBody);

      expect(mockFetch).toHaveBeenCalledWith(
        "/test/1",
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify(mockBody),
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("apiDelete", () => {
    it("calls fetch with DELETE method", async () => {
      const mockFetch = vi.fn().mockResolvedValueOnce({
        status: 204,
        ok: true,
      });
      global.fetch = mockFetch;

      const result = await apiDelete("/test/1");

      expect(mockFetch).toHaveBeenCalledWith(
        "/test/1",
        expect.objectContaining({
          method: "DELETE",
        })
      );
      expect(result).toBeUndefined();
    });
  });

  describe("Authentication", () => {
    it("adds Bearer token from localStorage", async () => {
      const token = "test-token-123";
      localStorage.setItem("auth-token", token);

      const mockFetch = vi.fn().mockResolvedValueOnce({
        status: 200,
        ok: true,
        json: async () => ({ success: true }),
      });
      global.fetch = mockFetch;

      await apiGet("/protected");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${token}`,
          }),
        })
      );
    });

    it("skips auth header when skipAuth: true", async () => {
      localStorage.setItem("auth-token", "test-token");

      const mockFetch = vi.fn().mockResolvedValueOnce({
        status: 200,
        ok: true,
        json: async () => ({ success: true }),
      });
      global.fetch = mockFetch;

      await apiFetch("/public", { skipAuth: true });

      const callArgs = mockFetch.mock.calls[0][1];
      expect(callArgs.headers.Authorization).toBeUndefined();
    });
  });

  describe("Error Handling", () => {
    it("on 401 clears localStorage and redirects to login with returnUrl for protected paths", async () => {
      localStorage.setItem("auth-token", "test-token");
      localStorage.setItem("auth-user", '{"user_id":"123"}');

      // Mock window location with pathname
      Object.defineProperty(window, "location", {
        value: {
          href: "",
          pathname: "/jobs",
          origin: "http://localhost:3000",
        },
        writable: true,
      });

      const mockFetch = vi.fn().mockResolvedValueOnce({
        status: 401,
        ok: false,
        statusText: "Unauthorized",
      });
      global.fetch = mockFetch;

      try {
        await apiGet("/protected");
      } catch (error) {
        // Expected
      }

      expect(localStorage.getItem("auth-token")).toBeNull();
      expect(localStorage.getItem("auth-user")).toBeNull();
      // Should redirect to /login with returnUrl parameter for protected paths
      expect(window.location.href).toBe("/login?returnUrl=%2Fjobs");
    });

    it("on 401 from non-protected path redirects to /login without returnUrl", async () => {
      localStorage.setItem("auth-token", "test-token");

      // Mock window location with non-protected pathname (auth page)
      Object.defineProperty(window, "location", {
        value: {
          href: "",
          pathname: "/login",
          origin: "http://localhost:3000",
        },
        writable: true,
      });

      const mockFetch = vi.fn().mockResolvedValueOnce({
        status: 401,
        ok: false,
        statusText: "Unauthorized",
      });
      global.fetch = mockFetch;

      try {
        await apiGet("/protected");
      } catch (error) {
        // Expected
      }

      expect(window.location.href).toBe("/login");
    });

    it("on 403 shows toast.error and throws Forbidden", async () => {
      const mockFetch = vi.fn().mockResolvedValueOnce({
        status: 403,
        ok: false,
        statusText: "Forbidden",
      });
      global.fetch = mockFetch;

      try {
        await apiGet("/forbidden");
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe("Forbidden");
      }

      expect(toast.error).toHaveBeenCalledWith(
        "Access Forbidden",
        expect.objectContaining({
          description: "You don't have permission to perform this action.",
        })
      );
    });

    it("on 500 throws with error detail", async () => {
      const errorDetail = "Internal Server Error";
      const mockFetch = vi.fn().mockResolvedValueOnce({
        status: 500,
        ok: false,
        statusText: "Internal Server Error",
        json: async () => ({ detail: errorDetail }),
      });
      global.fetch = mockFetch;

      try {
        await apiGet("/error");
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe(errorDetail);
      }
    });

    it("on network failure throws network error", async () => {
      const mockFetch = vi
        .fn()
        .mockRejectedValueOnce(new TypeError("Failed to fetch"));
      global.fetch = mockFetch;

      try {
        await apiGet("/test");
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(TypeError);
        expect((error as Error).message).toBe("Failed to fetch");
      }
    });

    it("on 204 returns undefined", async () => {
      const mockFetch = vi.fn().mockResolvedValueOnce({
        status: 204,
        ok: true,
      });
      global.fetch = mockFetch;

      const result = await apiDelete("/test/1");

      expect(result).toBeUndefined();
    });

    it("on error with fallback message", async () => {
      const mockFetch = vi.fn().mockResolvedValueOnce({
        status: 400,
        ok: false,
        statusText: "Bad Request",
        json: async () => ({}),
      });
      global.fetch = mockFetch;

      try {
        await apiGet("/error");
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain("HTTP 400");
      }
    });

    it("handles non-Error rejection", async () => {
      const mockFetch = vi.fn().mockRejectedValueOnce("String error");
      global.fetch = mockFetch;

      try {
        await apiGet("/test");
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe(
          "Network error - Please check your connection"
        );
      }
    });
  });

  describe("URL Construction", () => {
    it("handles endpoints with leading slash", async () => {
      const mockFetch = vi.fn().mockResolvedValueOnce({
        status: 200,
        ok: true,
        json: async () => ({}),
      });
      global.fetch = mockFetch;

      await apiGet("/users");

      expect(mockFetch).toHaveBeenCalledWith(
        "/users",
        expect.any(Object)
      );
    });

    it("handles endpoints without leading slash", async () => {
      const mockFetch = vi.fn().mockResolvedValueOnce({
        status: 200,
        ok: true,
        json: async () => ({}),
      });
      global.fetch = mockFetch;

      await apiGet("users");

      expect(mockFetch).toHaveBeenCalledWith(
        "/users",
        expect.any(Object)
      );
    });

    it("adds Content-Type header", async () => {
      const mockFetch = vi.fn().mockResolvedValueOnce({
        status: 200,
        ok: true,
        json: async () => ({}),
      });
      global.fetch = mockFetch;

      await apiGet("/test");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
        })
      );
    });
  });

  describe("Headers", () => {
    it("merges custom headers with defaults", async () => {
      const mockFetch = vi.fn().mockResolvedValueOnce({
        status: 200,
        ok: true,
        json: async () => ({}),
      });
      global.fetch = mockFetch;

      await apiFetch("/test", {
        headers: { "X-Custom": "value" },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            "X-Custom": "value",
          }),
        })
      );
    });
  });
});
