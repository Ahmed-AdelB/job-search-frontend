/**
 * Test Suite: Target Companies Hooks (useTargetCompanies, useCreateTargetCompany, useDeleteTargetCompany, useImportTargetCompanies)
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
  useTargetCompanies,
  useCreateTargetCompany,
  useUpdateTargetCompanyTier,
  useDeleteTargetCompany,
  useImportTargetCompanies,
} from "../use-target-companies";

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

describe("Target Companies Hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem("auth-token", "test-token");
  });

  describe("useTargetCompanies", () => {
    it("should fetch target companies list successfully", async () => {
      server.use(
        http.get(`${API_URL}/api/target-list`, () =>
          HttpResponse.json({
            companies: [
              { id: "company_1", name: "Google", tier: "tier_1" },
              { id: "company_2", name: "Meta", tier: "tier_2" },
            ],
            total: 2,
            page: 1,
            per_page: 20,
          })
        )
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useTargetCompanies(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
      expect(result.current.data).toHaveProperty("companies");
      expect(Array.isArray(result.current.data?.companies)).toBe(true);
    });

    it("should fetch with tier filter", async () => {
      server.use(
        http.get(`${API_URL}/api/target-list`, () =>
          HttpResponse.json({
            companies: [{ id: "company_1", name: "Google", tier: "tier_1" }],
            total: 1,
            page: 1,
            per_page: 20,
          })
        )
      );

      const wrapper = createWrapper();
      const { result } = renderHook(
        () => useTargetCompanies({ tier: "tier_1" }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
    });

    it("should fetch with search query", async () => {
      server.use(
        http.get(`${API_URL}/api/target-list`, () =>
          HttpResponse.json({
            companies: [{ id: "company_1", name: "Google", tier: "tier_1" }],
            total: 1,
            page: 1,
            per_page: 20,
          })
        )
      );

      const wrapper = createWrapper();
      const { result } = renderHook(
        () => useTargetCompanies({ search: "Google" }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
    });

    it("should fetch with pagination", async () => {
      server.use(
        http.get(`${API_URL}/api/target-list`, () =>
          HttpResponse.json({
            companies: [{ id: "company_3", name: "Apple", tier: "tier_1" }],
            total: 5,
            page: 2,
            per_page: 10,
          })
        )
      );

      const wrapper = createWrapper();
      const { result } = renderHook(
        () => useTargetCompanies({ page: 2, per_page: 10 }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
    });

    it("should handle fetch error", async () => {
      server.use(
        http.get(`${API_URL}/api/target-list`, () =>
          HttpResponse.json(
            { detail: "Server error" },
            { status: 500 }
          )
        )
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useTargetCompanies(), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe("useCreateTargetCompany", () => {
    it("should create target company successfully", async () => {
      server.use(
        http.post(`${API_URL}/api/target-list`, () =>
          HttpResponse.json({
            id: "company_new",
            name: "Google",
            tier: "tier_1",
          })
        )
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useCreateTargetCompany(), { wrapper });

      await act(async () => {
        result.current.mutate({
          name: "Google",
          tier: "tier_1",
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
      expect(result.current.data).toHaveProperty("id");
      expect(result.current.data).toHaveProperty("name");
    });

    it("should create with additional fields", async () => {
      server.use(
        http.post(`${API_URL}/api/target-list`, () =>
          HttpResponse.json({
            id: "company_new",
            name: "Meta",
            tier: "tier_2",
            headquarters: "Menlo Park, CA",
            industry: "Technology",
          })
        )
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useCreateTargetCompany(), { wrapper });

      await act(async () => {
        result.current.mutate({
          name: "Meta",
          tier: "tier_2",
          headquarters: "Menlo Park, CA",
          industry: "Technology",
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
    });

    it("should handle creation error", async () => {
      server.use(
        http.post(`${API_URL}/api/target-list`, () =>
          HttpResponse.json(
            { detail: "Company already exists" },
            { status: 409 }
          )
        )
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useCreateTargetCompany(), { wrapper });

      await act(async () => {
        result.current.mutate({
          name: "Google",
          tier: "tier_1",
        });
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe("useUpdateTargetCompanyTier", () => {
    it("should update company tier successfully", async () => {
      server.use(
        http.put(`${API_URL}/api/target-list/:id/tier`, () =>
          HttpResponse.json({
            id: "company_1",
            name: "Google",
            tier: "tier_2",
          })
        )
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useUpdateTargetCompanyTier(), {
        wrapper,
      });

      await act(async () => {
        result.current.mutate({
          id: "company_1",
          tier: "tier_2",
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
    });

    it("should handle tier update error", async () => {
      server.use(
        http.put(`${API_URL}/api/target-list/:id/tier`, () =>
          HttpResponse.json(
            { detail: "Invalid tier" },
            { status: 400 }
          )
        )
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useUpdateTargetCompanyTier(), {
        wrapper,
      });

      await act(async () => {
        result.current.mutate({
          id: "company_1",
          tier: "invalid_tier",
        });
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe("useDeleteTargetCompany", () => {
    it("should delete target company successfully", async () => {
      server.use(
        http.delete(`${API_URL}/api/target-list/:id`, () =>
          HttpResponse.json({ success: true })
        )
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useDeleteTargetCompany(), { wrapper });

      await act(async () => {
        result.current.mutate("company_1");
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it("should handle delete error", async () => {
      server.use(
        http.delete(`${API_URL}/api/target-list/:id`, () =>
          HttpResponse.json(
            { detail: "Company not found" },
            { status: 404 }
          )
        )
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useDeleteTargetCompany(), { wrapper });

      await act(async () => {
        result.current.mutate("nonexistent");
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });

    it("should delete multiple companies sequentially", async () => {
      server.use(
        http.delete(`${API_URL}/api/target-list/:id`, () =>
          HttpResponse.json({ success: true })
        )
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useDeleteTargetCompany(), { wrapper });

      await act(async () => {
        result.current.mutate("company_1");
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      await act(async () => {
        result.current.mutate("company_2");
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });
  });

  describe("useImportTargetCompanies", () => {
    it("should import companies from CSV file", async () => {
      server.use(
        http.post(`${API_URL}/api/target-list/import`, () =>
          HttpResponse.json({
            imported: 15,
            skipped: 2,
            total: 17,
          })
        )
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useImportTargetCompanies(), {
        wrapper,
      });

      const file = new File(["company,tier\nGoogle,1"], "companies.csv", {
        type: "text/csv",
      });

      await act(async () => {
        result.current.mutate(file);
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
    });

    it("should handle import error", async () => {
      server.use(
        http.post(`${API_URL}/api/target-list/import`, () =>
          HttpResponse.json(
            { detail: "Invalid CSV format" },
            { status: 400 }
          )
        )
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useImportTargetCompanies(), {
        wrapper,
      });

      const file = new File(["invalid"], "companies.txt", {
        type: "text/plain",
      });

      await act(async () => {
        result.current.mutate(file);
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });

    it("should handle file upload with FormData", async () => {
      server.use(
        http.post(`${API_URL}/api/target-list/import`, () =>
          HttpResponse.json({
            imported: 2,
            skipped: 0,
            total: 2,
          })
        )
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useImportTargetCompanies(), {
        wrapper,
      });

      const file = new File(
        ["company,tier\nApple,1\nMicrosoft,1"],
        "companies.csv",
        { type: "text/csv" }
      );

      await act(async () => {
        result.current.mutate(file);
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });
  });
});
