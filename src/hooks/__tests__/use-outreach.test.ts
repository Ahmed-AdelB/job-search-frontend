/**
 * Test Suite: Outreach Hooks (useSendMessage, useCreateCampaign, useOutreachTemplates, useResendMessage)
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
  useSendMessage,
  useCreateCampaign,
  useOutreachTemplates,
  useResendMessage,
} from "../use-outreach";

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

describe("Outreach Hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("useSendMessage", () => {
    it("should send message successfully", async () => {
      server.use(
        http.post(`${API_URL}/api/outreach/send`, () =>
          HttpResponse.json({
            message_id: "msg_1",
            contact_id: "contact_1",
            message_type: "initial",
            status: "sent",
          })
        )
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useSendMessage(), { wrapper });

      await act(async () => {
        result.current.mutate({
          contact_id: "contact_1",
          message_type: "initial",
          subject: "Hello",
          body: "This is a test message",
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
      expect(result.current.data).toHaveProperty("message_id");
      expect(result.current.data?.status).toBe("sent");
    });

    it("should save message as draft", async () => {
      server.use(
        http.post(`${API_URL}/api/outreach/send`, () =>
          HttpResponse.json({
            message_id: "msg_2",
            contact_id: "contact_1",
            message_type: "follow_up_1",
            status: "draft",
          })
        )
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useSendMessage(), { wrapper });

      await act(async () => {
        result.current.mutate({
          contact_id: "contact_1",
          message_type: "follow_up_1",
          subject: "Follow up",
          body: "Draft message",
          save_as_draft: true,
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
    });

    it("should handle send message error", async () => {
      server.use(
        http.post(`${API_URL}/api/outreach/send`, () =>
          HttpResponse.json(
            { detail: "Failed to send message" },
            { status: 500 }
          )
        )
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useSendMessage(), { wrapper });

      await act(async () => {
        result.current.mutate({
          contact_id: "contact_1",
          message_type: "initial",
          subject: "Test",
          body: "Test",
        });
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe("useCreateCampaign", () => {
    it("should create campaign successfully", async () => {
      server.use(
        http.post(`${API_URL}/api/outreach/campaigns`, () =>
          HttpResponse.json({
            id: "campaign_1",
            name: "Q1 2026 Outreach",
            type: "cold_email",
            template_subject: "Let's Connect",
            template_body: "I'd like to discuss opportunities",
            contacts: ["contact_1", "contact_2"],
            status: "created",
          })
        )
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useCreateCampaign(), { wrapper });

      await act(async () => {
        result.current.mutate({
          name: "Q1 2026 Outreach",
          type: "cold_email",
          template_subject: "Let's Connect",
          template_body: "I'd like to discuss opportunities",
          contacts: ["contact_1", "contact_2"],
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
      expect(result.current.data).toHaveProperty("name");
    });

    it("should create networking campaign", async () => {
      server.use(
        http.post(`${API_URL}/api/outreach/campaigns`, () =>
          HttpResponse.json({
            id: "campaign_2",
            name: "Networking Campaign",
            type: "networking",
            template_subject: "Networking",
            template_body: "Let's network",
            status: "created",
          })
        )
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useCreateCampaign(), { wrapper });

      await act(async () => {
        result.current.mutate({
          name: "Networking Campaign",
          type: "networking",
          template_subject: "Networking",
          template_body: "Let's network",
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
    });

    it("should handle campaign creation error", async () => {
      server.use(
        http.post(`${API_URL}/api/outreach/campaigns`, () =>
          HttpResponse.json(
            { detail: "Failed to create campaign" },
            { status: 400 }
          )
        )
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useCreateCampaign(), { wrapper });

      await act(async () => {
        result.current.mutate({
          name: "Test Campaign",
          type: "cold_email",
          template_subject: "Test",
          template_body: "Test",
        });
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe("useOutreachTemplates", () => {
    it("should fetch templates successfully", async () => {
      // Add mock handler for templates
      server.use(
        http.get(`${API_URL}/api/outreach/templates`, () =>
          HttpResponse.json([
            {
              id: "template_1",
              name: "Cold Email",
              subject: "Let's Connect",
              body: "I'd like to reach out...",
              message_type: "initial",
            },
            {
              id: "template_2",
              name: "Follow Up",
              subject: "Following up",
              body: "Just wanted to check in...",
              message_type: "follow_up_1",
            },
          ])
        )
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useOutreachTemplates(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
      expect(Array.isArray(result.current.data)).toBe(true);
      expect(result.current.data!.length).toBe(2);
      expect(result.current.data![0]).toHaveProperty("name");
      expect(result.current.data![0]).toHaveProperty("subject");
    });

    it("should cache templates for 1 hour", async () => {
      server.use(
        http.get(`${API_URL}/api/outreach/templates`, () =>
          HttpResponse.json([
            {
              id: "template_1",
              name: "Template",
              subject: "Subject",
              body: "Body",
              message_type: "initial",
            },
          ])
        )
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useOutreachTemplates(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
    });

    it("should handle template fetch error", async () => {
      server.use(
        http.get(`${API_URL}/api/outreach/templates`, () =>
          HttpResponse.json(
            { detail: "Failed to fetch templates" },
            { status: 500 }
          )
        )
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useOutreachTemplates(), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe("useResendMessage", () => {
    it("should resend message successfully", async () => {
      server.use(
        http.post(`${API_URL}/api/outreach/:messageId/resend`, () =>
          HttpResponse.json({
            message_id: "msg_1",
            status: "resent",
            sent_at: "2026-03-21T10:00:00Z",
          })
        )
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useResendMessage(), { wrapper });

      await act(async () => {
        result.current.mutate("msg_1");
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
    });

    it("should handle resend error", async () => {
      server.use(
        http.post(`${API_URL}/api/outreach/:messageId/resend`, () =>
          HttpResponse.json(
            { detail: "Message not found" },
            { status: 404 }
          )
        )
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useResendMessage(), { wrapper });

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
