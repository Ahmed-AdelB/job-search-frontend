/**
 * Test Suite: Interview Hooks (useInterviews, useInterview, useScheduleInterview, useUpdateInterview, useDeleteInterview, useMarkCompleted)
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
  useInterviews,
  useInterview,
  useScheduleInterview,
  useMarkCompleted,
  useUpdateInterview,
  useDeleteInterview,
} from "../use-interviews";

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

describe("Interview Hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("useInterviews", () => {
    it("should fetch interviews list successfully", async () => {
      server.use(
        http.get(`${API_URL}/api/interviews`, () =>
          HttpResponse.json({
            data: [
              {
                id: "interview_1",
                type: "phone",
                scheduled_at: "2026-03-25T10:00:00Z",
                status: "scheduled",
              },
            ],
            total: 1,
            page: 1,
            per_page: 20,
          })
        )
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useInterviews(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
      expect(Array.isArray(result.current.data?.data)).toBe(true);
    });

    it("should fetch interviews with filters", async () => {
      server.use(
        http.get(`${API_URL}/api/interviews`, () =>
          HttpResponse.json({
            data: [
              {
                id: "interview_1",
                type: "phone",
                scheduled_at: "2026-03-25T10:00:00Z",
                status: "scheduled",
              },
            ],
            total: 1,
            page: 1,
            per_page: 10,
          })
        )
      );

      const wrapper = createWrapper();
      const { result } = renderHook(
        () =>
          useInterviews({
            status: "scheduled",
            page: 1,
            per_page: 10,
          }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
    });

    it("should handle fetch error", async () => {
      server.use(
        http.get(`${API_URL}/api/interviews`, () =>
          HttpResponse.json(
            { detail: "Server error" },
            { status: 500 }
          )
        )
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useInterviews(), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe("useInterview", () => {
    it("should fetch single interview successfully", async () => {
      server.use(
        http.get(`${API_URL}/api/interviews/:id`, () =>
          HttpResponse.json({
            id: "interview_1",
            type: "phone",
            scheduled_at: "2026-03-25T10:00:00Z",
            status: "scheduled",
          })
        )
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useInterview("interview_1"), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
      expect(result.current.data?.id).toBe("interview_1");
    });

    it("should not fetch when ID is empty", async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useInterview(""), { wrapper });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeUndefined();
    });
  });

  describe("useScheduleInterview", () => {
    it("should schedule interview successfully", async () => {
      server.use(
        http.post(`${API_URL}/api/interviews`, () =>
          HttpResponse.json({
            id: "interview_new",
            application_id: "app_1",
            type: "phone",
            scheduled_at: "2026-03-25T10:00:00Z",
            duration_minutes: 30,
            status: "scheduled",
          })
        )
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useScheduleInterview(), { wrapper });

      await act(async () => {
        result.current.mutate({
          application_id: "app_1",
          type: "phone",
          scheduled_at: "2026-03-25T10:00:00Z",
          duration_minutes: 30,
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
    });

    it("should schedule video interview", async () => {
      server.use(
        http.post(`${API_URL}/api/interviews`, () =>
          HttpResponse.json({
            id: "interview_new",
            application_id: "app_1",
            type: "video",
            scheduled_at: "2026-03-25T14:00:00Z",
            meeting_url: "https://zoom.us/meeting",
            duration_minutes: 45,
            status: "scheduled",
          })
        )
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useScheduleInterview(), { wrapper });

      await act(async () => {
        result.current.mutate({
          application_id: "app_1",
          type: "video",
          scheduled_at: "2026-03-25T14:00:00Z",
          meeting_url: "https://zoom.us/meeting",
          duration_minutes: 45,
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
    });

    it("should handle schedule error", async () => {
      server.use(
        http.post(`${API_URL}/api/interviews`, () =>
          HttpResponse.json(
            { detail: "Invalid date" },
            { status: 400 }
          )
        )
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useScheduleInterview(), { wrapper });

      await act(async () => {
        result.current.mutate({
          application_id: "app_1",
          type: "phone",
          scheduled_at: "invalid-date",
        });
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe("useMarkCompleted", () => {
    it("should mark interview as completed", async () => {
      server.use(
        http.patch(`${API_URL}/api/interviews/:id/mark-completed`, () =>
          HttpResponse.json({
            id: "interview_1",
            status: "completed",
            feedback: "Good interview",
          })
        )
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useMarkCompleted(), { wrapper });

      await act(async () => {
        result.current.mutate("interview_1");
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
    });

    it("should handle mark completed error", async () => {
      server.use(
        http.patch(`${API_URL}/api/interviews/:id/mark-completed`, () =>
          HttpResponse.json(
            { detail: "Interview not found" },
            { status: 404 }
          )
        )
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useMarkCompleted(), { wrapper });

      await act(async () => {
        result.current.mutate("nonexistent");
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe("useUpdateInterview", () => {
    it("should update interview successfully", async () => {
      server.use(
        http.patch(`${API_URL}/api/interviews/:id`, () =>
          HttpResponse.json({
            id: "interview_1",
            scheduled_at: "2026-03-26T10:00:00Z",
            notes: "Rescheduled",
            status: "scheduled",
          })
        )
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useUpdateInterview(), { wrapper });

      await act(async () => {
        result.current.mutate({
          interviewId: "interview_1",
          data: {
            scheduled_at: "2026-03-26T10:00:00Z",
            notes: "Rescheduled",
          },
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
    });

    it("should handle update error", async () => {
      server.use(
        http.patch(`${API_URL}/api/interviews/:id`, () =>
          HttpResponse.json(
            { detail: "Interview not found" },
            { status: 404 }
          )
        )
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useUpdateInterview(), { wrapper });

      await act(async () => {
        result.current.mutate({
          interviewId: "nonexistent",
          data: { scheduled_at: "2026-03-26T10:00:00Z" },
        });
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe("useDeleteInterview", () => {
    it("should delete interview successfully", async () => {
      server.use(
        http.delete(`${API_URL}/api/interviews/:id`, () =>
          HttpResponse.json({ success: true })
        )
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useDeleteInterview(), { wrapper });

      await act(async () => {
        result.current.mutate("interview_1");
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it("should handle delete error", async () => {
      server.use(
        http.delete(`${API_URL}/api/interviews/:id`, () =>
          HttpResponse.json(
            { detail: "Interview not found" },
            { status: 404 }
          )
        )
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useDeleteInterview(), { wrapper });

      await act(async () => {
        result.current.mutate("nonexistent");
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });

    it("should delete multiple interviews sequentially", async () => {
      server.use(
        http.delete(`${API_URL}/api/interviews/:id`, () =>
          HttpResponse.json({ success: true })
        )
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useDeleteInterview(), { wrapper });

      await act(async () => {
        result.current.mutate("interview_1");
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      await act(async () => {
        result.current.mutate("interview_2");
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });
  });
});
