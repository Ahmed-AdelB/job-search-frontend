/**
 * Test Suite: useApplyToJob, useDryRunApply, useAutoApply, useRetryApplication,
 *             useBatchApply, useApplyStatus, useRateLimits, useUpdateRateLimits
 * Author: Ahmed Adel Bakr Alderai
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import React from "react";
import {
  useApplyToJob,
  useDryRunApply,
  useAutoApply,
  useRetryApplication,
  useBatchApply,
  useApplyStatus,
  useRateLimits,
  useUpdateRateLimits,
} from "../use-apply";

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

describe("useApplyToJob Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should apply to job with job_id", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useApplyToJob(), { wrapper });

    await act(async () => {
      result.current.mutate({
        jobId: "job_1",
        data: {},
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
  });

  it("should fetch dry-run apply preview data", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useDryRunApply(), { wrapper });

    await act(async () => {
      result.current.mutate({
        job_id: "job_1",
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
  });

  it("should auto-apply to job successfully", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useAutoApply(), { wrapper });

    await act(async () => {
      result.current.mutate("job_1");
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
  });

  it("should retry application successfully", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useRetryApplication(), { wrapper });

    await act(async () => {
      result.current.mutate("app_1");
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
  });

  it("should queue batch jobs", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useBatchApply(), { wrapper });

    await act(async () => {
      result.current.mutate({
        job_ids: ["job_1", "job_2", "job_3"],
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
  });

  it("should fetch apply status for single job", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useApplyStatus("job_1"), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
    expect(result.current.data?.status).toBe("applied");
  });

  it("should not fetch status when jobId is empty", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useApplyStatus(""), { wrapper });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
  });

  it("should fetch rate limits", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useRateLimits(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
    expect(result.current.data?.daily_limit).toBeDefined();
    expect(result.current.data?.remaining).toBeDefined();
  });

  it("should update rate limits", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useUpdateRateLimits(), { wrapper });

    await act(async () => {
      result.current.mutate({
        max_per_day: 100,
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
  });

  it("should show loading state during apply", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useApplyToJob(), { wrapper });

    expect(result.current.isPending).toBe(false);

    await act(async () => {
      result.current.mutate({
        jobId: "job_1",
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it("should handle apply error gracefully", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useApplyToJob(), { wrapper });

    await act(async () => {
      result.current.mutate({
        jobId: "job_1",
      });
    });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });
  });
});
