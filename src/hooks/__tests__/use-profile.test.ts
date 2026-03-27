/**
 * Test Suite: Profile Hooks (useProfile, useUpdateProfile, useUploadCV, useResumes, useDeleteResume, useSetPrimaryResume)
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
  useProfile,
  useUpdateProfile,
  useUploadCV,
  useResumes,
  useDeleteResume,
  useSetPrimaryResume,
} from "../use-profile";

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

describe("Profile Hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem("auth-token", "test-token");
  });

  describe("useProfile", () => {
    it("should fetch user profile successfully", async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useProfile(), { wrapper });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
      expect(result.current.data).toHaveProperty("email");
      expect(result.current.data).toHaveProperty("first_name");
      expect(result.current.data?.email).toBe("test@example.com");
    });

    it("should handle profile fetch error", async () => {
      server.use(
        http.get(`${API_URL}/api/profiles/me`, () =>
          HttpResponse.json(
            { detail: "Unauthorized" },
            { status: 401 }
          )
        )
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useProfile(), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe("useUpdateProfile", () => {
    it("should update profile successfully", async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUpdateProfile(), { wrapper });

      await act(async () => {
        result.current.mutate({
          first_name: "John",
          last_name: "Doe",
          email: "john@example.com",
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
      expect(result.current.data).toHaveProperty("email");
    });

    it("should handle profile update error", async () => {
      server.use(
        http.put(`${API_URL}/api/profiles/me`, () =>
          HttpResponse.json(
            { detail: "Invalid data" },
            { status: 400 }
          )
        )
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useUpdateProfile(), { wrapper });

      await act(async () => {
        result.current.mutate({
          first_name: "John",
          last_name: "Doe",
          email: "invalid",
        });
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });

    it("should update only specific fields", async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUpdateProfile(), { wrapper });

      await act(async () => {
        result.current.mutate({
          first_name: "Jane",
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
    });
  });

  describe("useUploadCV", () => {
    it("should upload CV file successfully", async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUploadCV(), { wrapper });

      const file = new File(["content"], "resume.pdf", { type: "application/pdf" });

      await act(async () => {
        result.current.mutate(file);
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
      expect(result.current.data).toHaveProperty("filename");
      expect(result.current.data).toHaveProperty("score");
    });

    it("should handle upload error", async () => {
      server.use(
        http.post(`${API_URL}/api/onboarding/cv`, () =>
          HttpResponse.json(
            { detail: "Invalid file format" },
            { status: 400 }
          )
        )
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useUploadCV(), { wrapper });

      const file = new File(["content"], "file.txt", { type: "text/plain" });

      await act(async () => {
        result.current.mutate(file);
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe("useResumes", () => {
    it("should fetch resumes list successfully", async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useResumes(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
      expect(result.current.data).toHaveProperty("resumes");
      expect(Array.isArray(result.current.data?.resumes)).toBe(true);
      expect(result.current.data!.resumes.length).toBeGreaterThan(0);
      expect(result.current.data!.resumes[0]).toHaveProperty("id");
      expect(result.current.data!.resumes[0]).toHaveProperty("filename");
    });

    it("should handle resumes fetch error", async () => {
      server.use(
        http.get(`${API_URL}/api/profiles/resumes`, () =>
          HttpResponse.json(
            { detail: "Server error" },
            { status: 500 }
          )
        )
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useResumes(), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe("useDeleteResume", () => {
    it("should delete resume successfully", async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useDeleteResume(), { wrapper });

      await act(async () => {
        result.current.mutate("resume_1");
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
    });

    it("should handle delete error", async () => {
      server.use(
        http.delete(`${API_URL}/api/profiles/resumes/:id`, () =>
          HttpResponse.json(
            { detail: "Resume not found" },
            { status: 404 }
          )
        )
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useDeleteResume(), { wrapper });

      await act(async () => {
        result.current.mutate("nonexistent");
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe("useSetPrimaryResume", () => {
    it("should set resume as primary successfully", async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useSetPrimaryResume(), { wrapper });

      await act(async () => {
        result.current.mutate("resume_1");
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
      expect(result.current.data).toHaveProperty("is_primary");
    });

    it("should handle set primary error", async () => {
      server.use(
        http.put(`${API_URL}/api/profiles/resumes/:id/primary`, () =>
          HttpResponse.json(
            { detail: "Resume not found" },
            { status: 404 }
          )
        )
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useSetPrimaryResume(), { wrapper });

      await act(async () => {
        result.current.mutate("nonexistent");
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });

    it("should switch primary resume", async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useSetPrimaryResume(), { wrapper });

      await act(async () => {
        result.current.mutate("resume_2");
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
    });
  });
});
