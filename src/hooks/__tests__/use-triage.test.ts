/**
 * Test Suite: Triage Hooks (useTriagePreview, useTriageHistory, useTriageConfig, useGenerateTriageDigest, useUpdateTriageConfig, useCompleteTriageActions)
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
  useTriagePreview,
  useTriageHistory,
  useTriageConfig,
  useTriageDigest,
  useGenerateTriageDigest,
  useUpdateTriageConfig,
  useCompleteTriageActions,
} from "../use-triage";

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

describe("Triage Hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("useTriagePreview", () => {
    it("should fetch today's triage preview successfully", async () => {
      server.use(
        http.get(`${API_URL}/api/triage/preview`, () =>
          HttpResponse.json({
            jobs: [
              {
                id: "job_1",
                title: "Senior Engineer",
                company: "Tech Corp",
                score: 85,
                action: "apply",
              },
            ],
            total: 1,
            recommended_actions: ["apply_to_5", "contact_2"],
          })
        )
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useTriagePreview(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
      expect(result.current.data).toHaveProperty("jobs");
    });

    it("should handle preview fetch error", async () => {
      server.use(
        http.get(`${API_URL}/api/triage/preview`, () =>
          HttpResponse.json(
            { detail: "Server error" },
            { status: 500 }
          )
        )
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useTriagePreview(), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });

    it("should refetch every 5 minutes", async () => {
      server.use(
        http.get(`${API_URL}/api/triage/preview`, () =>
          HttpResponse.json({
            jobs: [
              {
                id: "job_1",
                title: "Senior Engineer",
                company: "Tech Corp",
                score: 85,
                action: "apply",
              },
            ],
            total: 1,
            recommended_actions: ["apply_to_5", "contact_2"],
          })
        )
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useTriagePreview(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
    });
  });

  describe("useTriageHistory", () => {
    it("should fetch past triage digests successfully", async () => {
      server.use(
        http.get(`${API_URL}/api/triage/history`, () =>
          HttpResponse.json({
            digests: [
              {
                date: "2026-03-20",
                jobs_count: 15,
                recommended_count: 8,
                status: "completed",
              },
              {
                date: "2026-03-19",
                jobs_count: 12,
                recommended_count: 6,
                status: "completed",
              },
            ],
            total: 2,
            page: 1,
            per_page: 20,
          })
        )
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useTriageHistory(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
      expect(Array.isArray(result.current.data?.digests)).toBe(true);
    });

    it("should fetch with date range filter", async () => {
      server.use(
        http.get(`${API_URL}/api/triage/history`, () =>
          HttpResponse.json({
            digests: [
              {
                date: "2026-03-20",
                jobs_count: 15,
                recommended_count: 8,
                status: "completed",
              },
            ],
            total: 1,
            page: 1,
            per_page: 20,
          })
        )
      );

      const wrapper = createWrapper();
      const { result } = renderHook(
        () => useTriageHistory({ days_back: 7, page: 1, per_page: 20 }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
    });

    it("should handle history fetch error", async () => {
      server.use(
        http.get(`${API_URL}/api/triage/history`, () =>
          HttpResponse.json(
            { detail: "Server error" },
            { status: 500 }
          )
        )
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useTriageHistory(), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe("useTriageConfig", () => {
    it("should fetch triage configuration successfully", async () => {
      server.use(
        http.get(`${API_URL}/api/triage/config`, () =>
          HttpResponse.json({
            max_score_threshold: 80,
            min_score_threshold: 60,
            auto_apply_enabled: true,
            notification_enabled: true,
          })
        )
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useTriageConfig(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
      expect(result.current.data).toHaveProperty("max_score_threshold");
    });

    it("should handle config fetch error", async () => {
      server.use(
        http.get(`${API_URL}/api/triage/config`, () =>
          HttpResponse.json(
            { detail: "Not found" },
            { status: 404 }
          )
        )
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useTriageConfig(), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe("useTriageDigest", () => {
    it("should fetch specific digest by date", async () => {
      server.use(
        http.get(`${API_URL}/api/triage/digest/:date`, () =>
          HttpResponse.json({
            date: "2026-03-20",
            jobs: [
              {
                id: "job_1",
                title: "Engineer",
                score: 85,
                recommendation: "apply",
              },
            ],
            total: 1,
            actions_taken: 0,
          })
        )
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useTriageDigest("2026-03-20"), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
      expect(result.current.data?.date).toBe("2026-03-20");
    });

    it("should not fetch when date is empty", async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useTriageDigest(""), { wrapper });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeUndefined();
    });
  });

  describe("useGenerateTriageDigest", () => {
    it("should generate today's digest successfully", async () => {
      server.use(
        http.post(`${API_URL}/api/triage/digest`, () =>
          HttpResponse.json({
            id: "digest_1",
            date: "2026-03-21",
            jobs: [],
            status: "generated",
          })
        )
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useGenerateTriageDigest(), { wrapper });

      await act(async () => {
        result.current.mutate();
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
    });

    it("should handle generation error", async () => {
      server.use(
        http.post(`${API_URL}/api/triage/digest`, () =>
          HttpResponse.json(
            { detail: "Already generated today" },
            { status: 409 }
          )
        )
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useGenerateTriageDigest(), { wrapper });

      await act(async () => {
        result.current.mutate();
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe("useUpdateTriageConfig", () => {
    it("should update triage configuration successfully", async () => {
      server.use(
        http.put(`${API_URL}/api/triage/config`, () =>
          HttpResponse.json({
            max_score_threshold: 85,
            min_score_threshold: 65,
            auto_apply_enabled: false,
            notification_enabled: true,
          })
        )
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useUpdateTriageConfig(), { wrapper });

      await act(async () => {
        result.current.mutate({
          max_score_threshold: 85,
          min_score_threshold: 65,
          auto_apply_enabled: false,
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
    });

    it("should handle update error", async () => {
      server.use(
        http.put(`${API_URL}/api/triage/config`, () =>
          HttpResponse.json(
            { detail: "Invalid configuration" },
            { status: 400 }
          )
        )
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useUpdateTriageConfig(), { wrapper });

      await act(async () => {
        result.current.mutate({
          max_score_threshold: 200, // Invalid
        });
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });

    it("should update multiple config fields", async () => {
      server.use(
        http.put(`${API_URL}/api/triage/config`, () =>
          HttpResponse.json({
            max_score_threshold: 90,
            min_score_threshold: 70,
            auto_apply_enabled: true,
            notification_enabled: false,
          })
        )
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useUpdateTriageConfig(), { wrapper });

      await act(async () => {
        result.current.mutate({
          max_score_threshold: 90,
          min_score_threshold: 70,
          auto_apply_enabled: true,
          notification_enabled: false,
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
    });
  });

  describe("useCompleteTriageActions", () => {
    it("should mark digest actions as completed", async () => {
      server.use(
        http.post(`${API_URL}/api/triage/digest/:id/complete`, () =>
          HttpResponse.json({
            id: "digest_1",
            status: "completed",
            actions_count: 5,
          })
        )
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useCompleteTriageActions(), {
        wrapper,
      });

      await act(async () => {
        result.current.mutate("digest_1");
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
    });

    it("should handle completion error", async () => {
      server.use(
        http.post(`${API_URL}/api/triage/digest/:id/complete`, () =>
          HttpResponse.json(
            { detail: "Digest not found" },
            { status: 404 }
          )
        )
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useCompleteTriageActions(), {
        wrapper,
      });

      await act(async () => {
        result.current.mutate("nonexistent");
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });
  });
});
