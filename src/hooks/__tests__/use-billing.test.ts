/**
 * Test Suite: Billing Hooks (usePlans, useSubscription, useCreateCheckout, useCancelSubscription, useInvoices, usePortal)
 * Author: Ahmed Adel Bakr Alderai
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { server } from "@/__mocks__/server";
import type { ReactNode } from "react";
import React from "react";
import {
  usePlans,
  useSubscription,
  useCreateCheckout,
  useCancelSubscription,
  useInvoices,
  usePortal,
} from "../use-billing";

const API_URL = "http://localhost:8082";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: ReactNode }) =>
    React.createElement(
      QueryClientProvider,
      { client: queryClient },
      children
    );
}

describe("Billing Hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("usePlans", () => {
    it("should fetch all billing plans successfully", async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => usePlans(), { wrapper });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
      expect(Array.isArray(result.current.data)).toBe(true);
      expect(result.current.data!.length).toBeGreaterThan(0);
      expect(result.current.data![0]).toHaveProperty("id");
      expect(result.current.data![0]).toHaveProperty("name");
      expect(result.current.data![0]).toHaveProperty("price");
    });

    it("should handle error when fetching plans fails", async () => {
      server.use(
        http.get(`${API_URL}/api/billing/plans`, () =>
          HttpResponse.json({ detail: "Failed to fetch plans" }, { status: 500 })
        )
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => usePlans(), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe("useSubscription", () => {
    it("should fetch current subscription successfully", async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useSubscription(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
      expect(result.current.data).toHaveProperty("plan_id");
      expect(result.current.data).toHaveProperty("status");
      expect(result.current.data?.status).toBe("active");
    });

    it("should update when subscription changes", async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useSubscription(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.status).toBe("active");
    });
  });

  describe("useCreateCheckout", () => {
    it("should create checkout session successfully", async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useCreateCheckout(), { wrapper });

      await act(async () => {
        result.current.mutate("plan_2");
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
      expect(result.current.data).toHaveProperty("session_id");
      expect(result.current.data).toHaveProperty("url");
    });

    it("should handle checkout creation error", async () => {
      server.use(
        http.post(`${API_URL}/api/checkout/session`, () =>
          HttpResponse.json(
            { detail: "Invalid plan" },
            { status: 400 }
          )
        )
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useCreateCheckout(), { wrapper });

      await act(async () => {
        result.current.mutate("invalid_plan");
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe("useCancelSubscription", () => {
    it("should cancel subscription successfully", async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useCancelSubscription(), { wrapper });

      await act(async () => {
        result.current.mutate();
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
      expect(result.current.data).toHaveProperty("status");
      expect(result.current.data?.status).toBe("cancelled");
    });

    it("should handle cancellation error", async () => {
      server.use(
        http.post(`${API_URL}/api/billing/cancel`, () =>
          HttpResponse.json(
            { detail: "Cannot cancel subscription" },
            { status: 409 }
          )
        )
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useCancelSubscription(), { wrapper });

      await act(async () => {
        result.current.mutate();
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe("useInvoices", () => {
    it("should fetch invoice history successfully", async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useInvoices(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
      expect(Array.isArray(result.current.data)).toBe(true);
      expect(result.current.data!.length).toBeGreaterThan(0);
      expect(result.current.data![0]).toHaveProperty("id");
      expect(result.current.data![0]).toHaveProperty("amount");
      expect(result.current.data![0]).toHaveProperty("status");
    });

    it("should handle invoice fetch error", async () => {
      server.use(
        http.get(`${API_URL}/api/billing/invoices`, () =>
          HttpResponse.json(
            { detail: "Failed to fetch invoices" },
            { status: 500 }
          )
        )
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useInvoices(), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe("usePortal", () => {
    it("should create billing portal session successfully", async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => usePortal(), { wrapper });

      await act(async () => {
        result.current.mutate();
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
      expect(result.current.data).toHaveProperty("url");
    });

    it("should handle portal creation error", async () => {
      server.use(
        http.post(`${API_URL}/api/billing/portal`, () =>
          HttpResponse.json(
            { detail: "Failed to create portal" },
            { status: 500 }
          )
        )
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => usePortal(), { wrapper });

      await act(async () => {
        result.current.mutate();
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });
  });
});
