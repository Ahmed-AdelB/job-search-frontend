/**
 * Test Suite: useApplications, useApplication, useUpdateApplication, useWithdrawApplication
 * Author: Ahmed Adel Bakr Alderai
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import React from "react";
import {
  useApplications,
  useApplication,
  useUpdateApplication,
  useWithdrawApplication,
} from "../use-applications";

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

describe("useApplications Hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch applications list", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useApplications(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
    expect(Array.isArray(result.current.data?.data)).toBe(true);
    expect(result.current.data?.data?.length).toBeGreaterThan(0);
    expect(result.current.data?.data?.[0]).toHaveProperty("application_id");
    expect(result.current.data?.data?.[0]).toHaveProperty("status");
  });

  it("should fetch single application by ID", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useApplication("app_1"), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
    expect(result.current.data?.application_id).toBe("app_1");
    expect(result.current.data?.job_id).toBe("job_1");
  });

  it("should update application successfully", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useUpdateApplication(), { wrapper });

    await act(async () => {
      result.current.mutate({
        applicationId: "app_1",
        data: {
          status: "interview",
          notes: "Great interview feedback",
        },
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
    expect(result.current.data?.status).toBe("interview");
  });

  it("should withdraw application successfully", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useWithdrawApplication(), { wrapper });

    await act(async () => {
      result.current.mutate("app_1");
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
  });

  it("should disable query when applicationId is empty", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useApplication(""), { wrapper });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
  });

  it("should handle filters in applications list", async () => {
    const wrapper = createWrapper();
    const filters = {
      status: "interview",
      job_id: "job_1",
      page: 1,
    };

    const { result } = renderHook(() => useApplications(filters), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
  });

  it("should show loading state initially", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useApplications(), { wrapper });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it("should invalidate queries on successful mutation", async () => {
    const wrapper = createWrapper();

    // First fetch the list
    const { result: listResult } = renderHook(() => useApplications(), {
      wrapper,
    });

    await waitFor(() => {
      expect(listResult.current.isSuccess).toBe(true);
    });

    // Then update an application
    const { result: updateResult } = renderHook(
      () => useUpdateApplication(),
      { wrapper }
    );

    await act(async () => {
      updateResult.current.mutate({
        applicationId: "app_1",
        data: { status: "offer" },
      });
    });

    await waitFor(() => {
      expect(updateResult.current.isSuccess).toBe(true);
    });
  });
});
