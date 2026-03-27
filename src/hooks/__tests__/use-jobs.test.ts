/**
 * Test Suite: useJobs, useJob, useUpdateJobStatus, useDeleteJob, useBulkAction
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
  useJobs,
  useJob,
  useUpdateJobStatus,
  useDeleteJob,
  useBulkAction,
} from "../use-jobs";

const API_URL = "http://localhost:8082";

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

describe("useJobs Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return isLoading=true initially then data", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useJobs(), { wrapper });

    // Initially loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toBeDefined();
    expect(result.current.isSuccess).toBe(true);
  });

  it("should return job list from API", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useJobs(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.data).toBeDefined();
    expect(Array.isArray(result.current.data?.data)).toBe(true);
    expect(result.current.data?.data?.length).toBeGreaterThan(0);
    expect(result.current.data?.data?.[0]).toHaveProperty("job_id");
    expect(result.current.data?.data?.[0]).toHaveProperty("title");
    expect(result.current.data?.data?.[0]).toHaveProperty("company");
  });

  it("should fetch single job by ID", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useJob("job_1"), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
    expect(result.current.data?.job_id).toBe("job_1");
    expect(result.current.data?.title).toBe("Senior Software Engineer");
  });

  it("should not execute query when jobId is undefined", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useJob(""), { wrapper });

    // Query should be disabled
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
  });

  it("should update job status successfully", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useUpdateJobStatus(), { wrapper });

    await act(async () => {
      result.current.mutate({
        jobId: "job_1",
        status: "applied",
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
    expect(result.current.data?.status).toBe("applied");
  });

  it("should delete job successfully", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useDeleteJob(), { wrapper });

    await act(async () => {
      result.current.mutate("job_1");
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it("should handle error when API fails", async () => {
    const wrapper = createWrapper();

    // Override handler to return error
    server.use(
      http.get(`${API_URL}/api/jobs`, () =>
        HttpResponse.json(
          { detail: "Server error" },
          { status: 500 }
        )
      )
    );

    const { result } = renderHook(() => useJobs(), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
  });

  it("should pass query params with filters", async () => {
    const wrapper = createWrapper();
    const filters = {
      status: "new",
      min_score: 70,
      page: 2,
    };

    const { result } = renderHook(() => useJobs(filters), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
  });

  it("should perform bulk action successfully", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useBulkAction(), { wrapper });

    await act(async () => {
      result.current.mutate({
        action: "archive",
        jobIds: ["job_1", "job_2", "job_3"],
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.count).toBe(3);
  });
});
