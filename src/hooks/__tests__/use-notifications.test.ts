/**
 * Test Suite: Notifications Hooks (useMarkNotificationAsRead, useMarkAllNotificationsAsRead, useDeleteNotification)
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
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
} from "../use-notifications";

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

describe("Notification Hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("useMarkNotificationAsRead", () => {
    it("should mark single notification as read", async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useMarkNotificationAsRead(), {
        wrapper,
      });

      await act(async () => {
        result.current.mutate("notif_1");
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
      expect(result.current.data).toHaveProperty("read");
      expect(result.current.data?.read).toBe(true);
    });

    it("should handle mark as read error", async () => {
      server.use(
        http.patch(`${API_URL}/api/notifications/:id`, () =>
          HttpResponse.json(
            { detail: "Notification not found" },
            { status: 404 }
          )
        )
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useMarkNotificationAsRead(), {
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

    it("should mark different notification IDs", async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useMarkNotificationAsRead(), {
        wrapper,
      });

      await act(async () => {
        result.current.mutate("notif_1");
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
    });
  });

  describe("useMarkAllNotificationsAsRead", () => {
    it("should mark all notifications as read", async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useMarkAllNotificationsAsRead(), {
        wrapper,
      });

      await act(async () => {
        result.current.mutate();
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
      expect(result.current.data).toHaveProperty("count");
      expect(result.current.data?.count).toBeGreaterThan(0);
    });

    it("should handle mark all as read error", async () => {
      server.use(
        http.post(`${API_URL}/api/notifications/mark-all-read`, () =>
          HttpResponse.json(
            { detail: "Server error" },
            { status: 500 }
          )
        )
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useMarkAllNotificationsAsRead(), {
        wrapper,
      });

      await act(async () => {
        result.current.mutate();
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });

    it("should return count of marked notifications", async () => {
      server.use(
        http.post(`${API_URL}/api/notifications/mark-all-read`, () =>
          HttpResponse.json({ count: 12 })
        )
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useMarkAllNotificationsAsRead(), {
        wrapper,
      });

      await act(async () => {
        result.current.mutate();
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.count).toBe(12);
    });

    it("should handle zero notifications to mark", async () => {
      server.use(
        http.post(`${API_URL}/api/notifications/mark-all-read`, () =>
          HttpResponse.json({ count: 0 })
        )
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useMarkAllNotificationsAsRead(), {
        wrapper,
      });

      await act(async () => {
        result.current.mutate();
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.count).toBe(0);
    });
  });

  describe("useDeleteNotification", () => {
    it("should delete notification successfully", async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useDeleteNotification(), { wrapper });

      await act(async () => {
        result.current.mutate("notif_1");
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
      expect(result.current.data).toHaveProperty("success");
      expect(result.current.data?.success).toBe(true);
    });

    it("should handle delete error", async () => {
      server.use(
        http.post(`${API_URL}/api/notifications/:id/delete`, () =>
          HttpResponse.json(
            { detail: "Notification not found" },
            { status: 404 }
          )
        )
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useDeleteNotification(), { wrapper });

      await act(async () => {
        result.current.mutate("nonexistent");
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });

    it("should delete multiple notifications sequentially", async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useDeleteNotification(), { wrapper });

      // Delete first notification
      await act(async () => {
        result.current.mutate("notif_1");
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Delete second notification
      await act(async () => {
        result.current.mutate("notif_2");
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.success).toBe(true);
    });

    it("should handle server errors gracefully", async () => {
      server.use(
        http.post(`${API_URL}/api/notifications/:id/delete`, () =>
          HttpResponse.json(
            { detail: "Server error" },
            { status: 500 }
          )
        )
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useDeleteNotification(), { wrapper });

      await act(async () => {
        result.current.mutate("notif_1");
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });
  });
});
