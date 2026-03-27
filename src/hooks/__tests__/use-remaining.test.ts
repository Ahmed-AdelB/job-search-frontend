/**
 * Test Suite: Remaining Hooks (Outreach, Settings, Notifications, Profile, GDPR, Portals, Dashboard, Billing)
 * Author: Ahmed Adel Bakr Alderai
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import React from "react";
import {
  useOutreachStats,
  useOutreachMessages,
  useSendMessage,
} from "../use-outreach";
import {
  useSettings,
  useUpdateSettings,
  useUpdateGeneralSettings,
  useUpdatePipelineSettings,
  useLLMConfig,
  useUpdateLLMConfig,
  useUpdateNotificationSettings,
  useUpdateAdvancedSettings,
} from "../use-settings";
import {
  useNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
} from "../use-notifications";
import {
  useProfile,
  useUpdateProfile,
  useUploadCV,
  useResumes,
  useDeleteResume,
  useSetPrimaryResume,
} from "../use-profile";
import {
  useGDPRExport,
  useGDPRExportStatus,
  useGDPRDeleteAccount,
} from "../use-gdpr";
import {
  usePortals,
  usePortal,
  useCreatePortal,
  useDeletePortal,
  useSyncPortal,
} from "../use-portals";
import {
  usePipelineStats,
  useAnalyticsOverview,
  useFunnelData,
  useTimelineData,
} from "../use-dashboard";
import {
  usePlans,
  useSubscription,
  useCreateCheckout,
  useCancelSubscription,
  useInvoices,
  usePortal as useBillingPortal,
} from "../use-billing";

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

describe("Outreach Hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("useOutreachStats should fetch stats", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useOutreachStats(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
  });

  it("useOutreachMessages should fetch messages list", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useOutreachMessages(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
    expect(result.current.data).toHaveProperty("messages");
    expect(Array.isArray(result.current.data?.messages)).toBe(true);
  });

  it("useSendMessage should mutate with payload", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useSendMessage(), { wrapper });

    await act(async () => {
      result.current.mutate({
        contact_id: "contact_1",
        message_type: "initial",
        subject: "Test Subject",
        body: "Test body",
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
  });
});

describe("Settings Hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("useSettings should fetch all settings", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useSettings(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
  });

  it("useUpdateSettings should mutate all settings", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useUpdateSettings(), { wrapper });

    const newSettings = {
      general: { theme: "dark" as const, language: "en" as const, timezone: "UTC", notifications_enabled: true },
      pipeline: { auto_apply_enabled: true, rate_limit_per_hour: 10 },
      llm: { provider: "anthropic" as const, model: "claude-3", temperature: 0.7 },
      notifications: {
        email_notifications: true,
        application_status_updates: true,
        interview_reminders: true,
        daily_digest: false,
        notification_email: "test@example.com",
      },
      advanced: { rate_limit_per_minute: 10, debug_mode: false },
    };

    await act(async () => {
      result.current.mutate(newSettings);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
  });

  it("useUpdateGeneralSettings should mutate general settings", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useUpdateGeneralSettings(), { wrapper });

    const generalSettings = {
      theme: "dark" as const,
      language: "en" as const,
      timezone: "UTC",
      notifications_enabled: true,
    };

    await act(async () => {
      result.current.mutate(generalSettings);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
  });

  it("useUpdatePipelineSettings should mutate pipeline settings", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useUpdatePipelineSettings(), { wrapper });

    const pipelineSettings = {
      auto_apply_enabled: true,
      rate_limit_per_hour: 10,
    };

    await act(async () => {
      result.current.mutate(pipelineSettings);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
  });

  it("useLLMConfig should fetch LLM configuration", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useLLMConfig(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
    expect(result.current.data).toHaveProperty("provider");
    expect(result.current.data).toHaveProperty("model");
    expect(result.current.data).toHaveProperty("temperature");
  });

  it("useUpdateLLMConfig should mutate LLM config", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useUpdateLLMConfig(), { wrapper });

    const llmConfig = {
      provider: "anthropic" as const,
      model: "claude-3",
      temperature: 0.7,
    };

    await act(async () => {
      result.current.mutate(llmConfig);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
  });

  it("useUpdateNotificationSettings should mutate notification settings", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useUpdateNotificationSettings(), { wrapper });

    const notificationSettings = {
      email_notifications: true,
      application_status_updates: true,
      interview_reminders: true,
      daily_digest: false,
      notification_email: "test@example.com",
    };

    await act(async () => {
      result.current.mutate(notificationSettings);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
  });

  it("useUpdateAdvancedSettings should mutate advanced settings", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useUpdateAdvancedSettings(), { wrapper });

    const advancedSettings = {
      rate_limit_per_minute: 10,
      debug_mode: false,
    };

    await act(async () => {
      result.current.mutate(advancedSettings);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
  });
});

describe("Notifications Hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("useNotifications should fetch notifications list", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useNotifications(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
    expect(result.current.data).toHaveProperty("notifications");
    expect(Array.isArray(result.current.data?.notifications)).toBe(true);
  });

  it("useMarkNotificationAsRead should mutate notification read status", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useMarkNotificationAsRead(), { wrapper });

    await act(async () => {
      result.current.mutate("notif_1");
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
  });

  it("useMarkAllNotificationsAsRead should mutate all notifications", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useMarkAllNotificationsAsRead(), { wrapper });

    await act(async () => {
      result.current.mutate();
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
    expect(result.current.data).toHaveProperty("count");
  });

  it("useDeleteNotification should delete notification", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useDeleteNotification(), { wrapper });

    await act(async () => {
      result.current.mutate("notif_1");
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
  });
});

describe("Profile Hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("useProfile should fetch user profile", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useProfile(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
  });

  it("useUpdateProfile should mutate profile data", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useUpdateProfile(), { wrapper });

    const updateData = {
      first_name: "John",
      last_name: "Doe",
      email: "john@example.com",
    };

    await act(async () => {
      result.current.mutate(updateData);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
  });

  it("useResumes should fetch resume list", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useResumes(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
    expect(result.current.data).toHaveProperty("resumes");
    expect(Array.isArray(result.current.data?.resumes)).toBe(true);
  });

  it("useDeleteResume should delete resume", async () => {
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

  it("useSetPrimaryResume should set resume as primary", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useSetPrimaryResume(), { wrapper });

    await act(async () => {
      result.current.mutate("resume_1");
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
  });
});

describe("GDPR Hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("useGDPRExport should request data export", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useGDPRExport(), { wrapper });

    await act(async () => {
      result.current.mutate();
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
    expect(result.current.data).toHaveProperty("status");
  });

  it("useGDPRExportStatus should check export status", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useGDPRExportStatus("req_123"), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
    expect(result.current.data).toHaveProperty("status");
  });

  it("useGDPRDeleteAccount should request account deletion", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useGDPRDeleteAccount(), { wrapper });

    await act(async () => {
      result.current.mutate();
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
  });
});

describe("Portals Hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("usePortals should fetch portals list", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => usePortals(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
    expect(result.current.data).toHaveProperty("portals");
    expect(Array.isArray(result.current.data?.portals)).toBe(true);
  });

  it("usePortal should fetch single portal", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => usePortal("portal_1"), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
    expect(result.current.data).toHaveProperty("name");
  });

  it("useCreatePortal should create portal", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useCreatePortal(), { wrapper });

    await act(async () => {
      result.current.mutate({
        name: "LinkedIn",
        type: "job_board",
        url: "https://linkedin.com",
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
  });

  it("useDeletePortal should delete portal", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useDeletePortal(), { wrapper });

    await act(async () => {
      result.current.mutate("portal_1");
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
  });

  it("useSyncPortal should sync portal", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useSyncPortal(), { wrapper });

    await act(async () => {
      result.current.mutate("LinkedIn");
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
    expect(result.current.data).toHaveProperty("jobs_synced");
  });
});

describe("Dashboard Hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("usePipelineStats should fetch pipeline statistics", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => usePipelineStats(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
  });

  it("useAnalyticsOverview should fetch overview data", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useAnalyticsOverview(),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
    expect(result.current.data).toHaveProperty("total_jobs");
  });

  it("useFunnelData should fetch funnel data", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useFunnelData(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
    expect(Array.isArray(result.current.data)).toBe(true);
  });

  it("useTimelineData should fetch timeline data", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useTimelineData(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
    expect(Array.isArray(result.current.data)).toBe(true);
  });
});

describe("Billing Hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("usePlans should fetch billing plans", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => usePlans(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
    expect(Array.isArray(result.current.data)).toBe(true);
  });

  it("useSubscription should fetch subscription", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useSubscription(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
    expect(result.current.data).toHaveProperty("plan_id");
    expect(result.current.data).toHaveProperty("status");
  });

  it("useInvoices should fetch invoices", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useInvoices(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
    expect(Array.isArray(result.current.data)).toBe(true);
  });

  it("useCancelSubscription should cancel subscription", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useCancelSubscription(), { wrapper });

    await act(async () => {
      result.current.mutate();
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
  });
});
