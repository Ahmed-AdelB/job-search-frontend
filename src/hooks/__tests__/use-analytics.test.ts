/**
 * Test Suite: useAnalyticsOverview, useFunnel, useByATS, useTimeline
 * Author: Ahmed Adel Bakr Alderai
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import React from "react";
import {
  useAnalyticsOverview,
  useFunnel,
  useByATS,
  useTimeline,
  useTopSources,
  useTopCompanies,
} from "../use-analytics";

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

describe("Analytics Hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch analytics overview with total stats", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useAnalyticsOverview(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
    expect(result.current.data).toHaveProperty("total_jobs");
    expect(result.current.data).toHaveProperty("total_applications");
    expect(result.current.data).toHaveProperty("success_rate");
    expect(typeof result.current.data?.total_jobs).toBe("number");
  });

  it("should fetch application funnel data", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useFunnel(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
    expect(Array.isArray(result.current.data)).toBe(true);
    expect(result.current.data?.length).toBeGreaterThan(0);
    expect(result.current.data?.[0]).toHaveProperty("stage");
    expect(result.current.data?.[0]).toHaveProperty("count");
  });

  it("should fetch ATS type breakdown", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useByATS(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
    expect(Array.isArray(result.current.data)).toBe(true);
    expect(result.current.data?.[0]).toHaveProperty("ats_type");
    expect(result.current.data?.[0]).toHaveProperty("count");
    expect(result.current.data?.[0]).toHaveProperty("percentage");
  });

  it("should fetch timeline data with default 30 days", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useTimeline(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
    expect(Array.isArray(result.current.data)).toBe(true);
    expect(result.current.data?.length).toBeGreaterThan(0);
    expect(result.current.data?.[0]).toHaveProperty("date");
    expect(result.current.data?.[0]).toHaveProperty("jobs_discovered");
    expect(result.current.data?.[0]).toHaveProperty("applications");
    expect(result.current.data?.[0]).toHaveProperty("success_rate");
  });

  it("should fetch timeline data with 7 days range", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useTimeline(7), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
    expect(Array.isArray(result.current.data)).toBe(true);
  });

  it("should fetch timeline data with 90 days range", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useTimeline(90), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
    expect(Array.isArray(result.current.data)).toBe(true);
  });

  it("should fetch timeline data for all time", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useTimeline("all"), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
    expect(Array.isArray(result.current.data)).toBe(true);
  });

  it("should fetch top job sources", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useTopSources(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
    expect(Array.isArray(result.current.data)).toBe(true);
    expect(result.current.data?.[0]).toHaveProperty("source");
    expect(result.current.data?.[0]).toHaveProperty("count");
    expect(result.current.data?.[0]).toHaveProperty("percentage");
  });

  it("should fetch top companies", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useTopCompanies(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
    expect(Array.isArray(result.current.data)).toBe(true);
    expect(result.current.data?.[0]).toHaveProperty("company");
    expect(result.current.data?.[0]).toHaveProperty("applications");
    expect(result.current.data?.[0]).toHaveProperty("interviews");
  });

  it("should show loading state initially for analytics overview", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useAnalyticsOverview(), { wrapper });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it("should handle stale time for analytics queries", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useAnalyticsOverview(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Verify stale time is configured (data should not refetch immediately)
    expect(result.current.isStale).toBe(false);
  });
});
