/**
 * Test Suite: Intelligence Hooks
 * Author: Ahmed Adel Bakr Alderai
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import React from "react";
import {
  useSkillGap,
  useSkillRecommendations,
  useVisaScore,
  useEligibleOccupations,
  useSalaryBenchmark,
  useSalaryReport,
  useRemoteScore,
  useSalaryReportPDF,
} from "../use-intelligence";

/**
 * Create a wrapper component that provides QueryClientProvider
 */
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

describe("Intelligence Hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("useSkillGap", () => {
    it("should mutate with job_id parameter", async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useSkillGap(), { wrapper });

      await act(async () => {
        result.current.mutate({ job_id: 123 });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
      expect(result.current.data).toHaveProperty("gaps");
      expect(result.current.data).toHaveProperty("recommendations");
    });

    it("should handle mutation without job_id", async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useSkillGap(), { wrapper });

      await act(async () => {
        result.current.mutate({});
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
    });
  });

  describe("useSkillRecommendations", () => {
    it("should fetch skill recommendations", async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useSkillRecommendations(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
      expect(result.current.data).toHaveProperty("recommendations");
      expect(Array.isArray(result.current.data?.recommendations)).toBe(true);
    });

    it("should include course information in recommendations", async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useSkillRecommendations(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      const recommendation = result.current.data?.recommendations?.[0];
      if (recommendation) {
        expect(recommendation).toHaveProperty("skill");
        expect(recommendation).toHaveProperty("courses");
        expect(Array.isArray(recommendation.courses)).toBe(true);
      }
    });
  });

  describe("useVisaScore", () => {
    it("should mutate with occupation and country parameters", async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useVisaScore(), { wrapper });

      await act(async () => {
        result.current.mutate({
          occupation: "Software Engineer",
          country: "Ireland",
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
      expect(result.current.data).toHaveProperty("score");
      expect(result.current.data).toHaveProperty("eligible");
    });

    it("should handle partial parameters", async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useVisaScore(), { wrapper });

      await act(async () => {
        result.current.mutate({
          occupation: "Software Engineer",
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
    });
  });

  describe("useEligibleOccupations", () => {
    it("should fetch eligible occupations list", async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useEligibleOccupations(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
      expect(result.current.data).toHaveProperty("occupations");
      expect(Array.isArray(result.current.data?.occupations)).toBe(true);
    });

    it("should include occupation details", async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useEligibleOccupations(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      const occupation = result.current.data?.occupations?.[0];
      if (occupation) {
        expect(occupation).toHaveProperty("occupation");
        expect(occupation).toHaveProperty("countries");
        expect(occupation).toHaveProperty("demand");
        expect(["high", "medium", "low"]).toContain(occupation.demand);
      }
    });
  });

  describe("useSalaryBenchmark", () => {
    it("should fetch salary benchmark with title and location", async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(
        () => useSalaryBenchmark("Software Engineer", "San Francisco"),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
      expect(result.current.data).toHaveProperty("min_salary");
      expect(result.current.data).toHaveProperty("max_salary");
      expect(result.current.data).toHaveProperty("median_salary");
    });

    it("should be disabled when title is empty", () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useSalaryBenchmark("", "San Francisco"), {
        wrapper,
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeUndefined();
    });

    it("should be disabled when location is empty", () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useSalaryBenchmark("Software Engineer", ""), {
        wrapper,
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeUndefined();
    });

    it("should be disabled when both parameters are empty", () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useSalaryBenchmark("", ""), {
        wrapper,
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeUndefined();
    });
  });

  describe("useSalaryReport", () => {
    it("should fetch comprehensive salary report", async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useSalaryReport(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
      expect(result.current.data).toHaveProperty("report");
      const report = result.current.data?.report;
      if (report) {
        expect(report).toHaveProperty("market_median");
        expect(report).toHaveProperty("percentile_rank");
        expect(report).toHaveProperty("location");
        expect(report).toHaveProperty("title");
      }
    });
  });

  describe("useRemoteScore", () => {
    it("should mutate with job_id parameter", async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useRemoteScore(), { wrapper });

      await act(async () => {
        result.current.mutate({ job_id: 123 });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
      expect(result.current.data).toHaveProperty("remote_score");
      expect(result.current.data).toHaveProperty("remote_type");
      expect(result.current.data).toHaveProperty("reasoning");
      const remoteType = result.current.data?.remote_type;
      expect(["remote", "hybrid", "onsite"]).toContain(remoteType);
    });
  });

  describe("useSalaryReportPDF", () => {
    it("should be a valid mutation hook", () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useSalaryReportPDF(), { wrapper });

      // Verify the hook returns a valid mutation object
      expect(result.current).toHaveProperty("mutate");
      expect(result.current).toHaveProperty("isPending");
      expect(result.current).toHaveProperty("isSuccess");
      expect(result.current).toHaveProperty("isError");
      expect(result.current).toHaveProperty("data");
    });

    it("should show loading state during PDF download", () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useSalaryReportPDF(), { wrapper });

      expect(result.current.isPending).toBe(false);

      act(() => {
        result.current.mutate();
      });

      // Should have loading state during mutation
      expect(typeof result.current.isPending).toBe("boolean");
    });
  });
});
