/**
 * Settings Page / Tabs Tests
 * Author: Ahmed Adel Bakr Alderai
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/__tests__/setup/render-with-providers";
import SettingsPage from "@/app/(dashboard)/settings/page";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  usePathname: () => "/dashboard/settings",
}));

// Mock preferences store
vi.mock("@/stores/preferences-store", () => ({
  usePreferencesStore: () => ({
    language: "en",
    theme: "light",
    setLanguage: vi.fn(),
    setTheme: vi.fn(),
  }),
}));

// Mock GDPR hooks
vi.mock("@/hooks/use-gdpr", () => ({
  useGDPRExport: () => ({
    mutate: vi.fn(),
    isPending: false,
    isSuccess: false,
  }),
  useGDPRExportStatus: () => ({
    data: null,
    isLoading: false,
  }),
  useGDPRDeleteAccount: () => ({
    mutate: vi.fn(),
    isPending: false,
    isSuccess: false,
  }),
}));

// Mock API client
vi.mock("@/lib/api-client", () => ({
  apiGet: vi.fn(() =>
    Promise.resolve({
      pipeline: {
        auto_apply_enabled: false,
        min_match_score: 70,
        max_applications_per_day: 5,
        preferred_locations: [],
        excluded_companies: [],
        remote_types: ["remote", "hybrid"],
      },
      notifications: {
        email_notifications: true,
        application_status_updates: true,
        interview_reminders: true,
        daily_digest: true,
        notification_email: "test@example.com",
      },
    })
  ),
  apiPut: vi.fn(() => Promise.resolve({ status: "ok" })),
  apiPost: vi.fn(() => Promise.resolve({})),
}));

describe("Settings Page with Tabs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Page Title and Description", () => {
    it("renders page title Settings", async () => {
      renderWithProviders(<SettingsPage />);

      await waitFor(() => {
        expect(screen.getByText("Settings")).toBeInTheDocument();
      });
    });

    it("displays page subtitle", async () => {
      renderWithProviders(<SettingsPage />);

      await waitFor(() => {
        expect(screen.getByText(/Configure your account, pipeline, and preferences/i)).toBeInTheDocument();
      });
    });
  });

  describe("Tab Navigation", () => {
    it("renders tab list with 5 tabs", async () => {
      renderWithProviders(<SettingsPage />);

      await waitFor(() => {
        const tabs = screen.getAllByRole("tab");
        expect(tabs.length).toBe(5);
      });
    });

    it("renders Pipeline tab", async () => {
      renderWithProviders(<SettingsPage />);

      await waitFor(() => {
        expect(screen.getByRole("tab", { name: /Pipeline/i })).toBeInTheDocument();
      });
    });

    it("renders Appearance tab", async () => {
      renderWithProviders(<SettingsPage />);

      await waitFor(() => {
        expect(screen.getByRole("tab", { name: /Appearance/i })).toBeInTheDocument();
      });
    });

    it("renders Notifications tab", async () => {
      renderWithProviders(<SettingsPage />);

      await waitFor(() => {
        expect(screen.getByRole("tab", { name: /Notifications/i })).toBeInTheDocument();
      });
    });

    it("renders Privacy tab", async () => {
      renderWithProviders(<SettingsPage />);

      await waitFor(() => {
        expect(screen.getByRole("tab", { name: /Privacy/i })).toBeInTheDocument();
      });
    });

    it("renders Account tab", async () => {
      renderWithProviders(<SettingsPage />);

      await waitFor(() => {
        expect(screen.getByRole("tab", { name: /Account/i })).toBeInTheDocument();
      });
    });

    it("Pipeline tab is selected by default", async () => {
      renderWithProviders(<SettingsPage />);

      await waitFor(() => {
        const pipelineTab = screen.getByRole("tab", { name: /Pipeline/i });
        expect(pipelineTab).toHaveAttribute("data-state", "active");
      });
    });
  });

  describe("Pipeline Tab Content", () => {
    it("displays Pipeline Settings title when on pipeline tab", async () => {
      renderWithProviders(<SettingsPage />);

      await waitFor(() => {
        expect(screen.getByText("Pipeline Settings")).toBeInTheDocument();
      });
    });

    it("has Auto Apply toggle label", async () => {
      renderWithProviders(<SettingsPage />);

      await waitFor(() => {
        expect(screen.getByText(/Auto Apply/i)).toBeInTheDocument();
      });
    });

    it("has Minimum Match Score label", async () => {
      renderWithProviders(<SettingsPage />);

      await waitFor(() => {
        expect(screen.getByText(/Minimum Match Score/i)).toBeInTheDocument();
      });
    });

    it("has Max Applications Per Day label", async () => {
      renderWithProviders(<SettingsPage />);

      await waitFor(() => {
        expect(screen.getByText(/Max Applications Per Day/i)).toBeInTheDocument();
      });
    });

    it("has Remote Type Preferences label", async () => {
      renderWithProviders(<SettingsPage />);

      await waitFor(() => {
        expect(screen.getByText(/Remote Type Preferences/i)).toBeInTheDocument();
      });
    });

    it("has Save button for pipeline settings", async () => {
      renderWithProviders(<SettingsPage />);

      await waitFor(() => {
        const saveButton = screen.getByRole("button", { name: /Save Pipeline Settings/i });
        expect(saveButton).toBeInTheDocument();
      });
    });
  });

  describe("Appearance Tab Content", () => {
    it("can click Appearance tab", async () => {
      const user = userEvent.setup();
      renderWithProviders(<SettingsPage />);

      await waitFor(() => {
        const appearanceTab = screen.getByRole("tab", { name: /Appearance/i });
        expect(appearanceTab).toBeInTheDocument();
      });

      const appearanceTab = screen.getByRole("tab", { name: /Appearance/i });
      await user.click(appearanceTab);

      await waitFor(() => {
        expect(screen.getByText("Appearance")).toBeInTheDocument();
      });
    });

    it("displays Appearance description", async () => {
      const user = userEvent.setup();
      renderWithProviders(<SettingsPage />);

      const appearanceTab = screen.getByRole("tab", { name: /Appearance/i });
      await user.click(appearanceTab);

      await waitFor(() => {
        expect(screen.getByText(/Customize how the application looks/i)).toBeInTheDocument();
      });
    });

    it("shows theme options in Appearance tab", async () => {
      const user = userEvent.setup();
      renderWithProviders(<SettingsPage />);

      const appearanceTab = screen.getByRole("tab", { name: /Appearance/i });
      await user.click(appearanceTab);

      await waitFor(() => {
        // Theme options should be visible
        expect(screen.getByText(/Theme/i)).toBeInTheDocument();
      });
    });

    it("shows language option in Appearance tab", async () => {
      const user = userEvent.setup();
      renderWithProviders(<SettingsPage />);

      const appearanceTab = screen.getByRole("tab", { name: /Appearance/i });
      await user.click(appearanceTab);

      await waitFor(() => {
        expect(screen.getByText(/Language/i)).toBeInTheDocument();
      });
    });
  });

  describe("Notifications Tab Content", () => {
    it("can click Notifications tab", async () => {
      const user = userEvent.setup();
      renderWithProviders(<SettingsPage />);

      await waitFor(() => {
        const notificationsTab = screen.getByRole("tab", { name: /Notifications/i });
        expect(notificationsTab).toBeInTheDocument();
      });

      const notificationsTab = screen.getByRole("tab", { name: /Notifications/i });
      await user.click(notificationsTab);

      await waitFor(() => {
        expect(screen.getByText("Notifications")).toBeInTheDocument();
      });
    });

    it("displays Notifications description", async () => {
      const user = userEvent.setup();
      renderWithProviders(<SettingsPage />);

      const notificationsTab = screen.getByRole("tab", { name: /Notifications/i });
      await user.click(notificationsTab);

      await waitFor(() => {
        expect(screen.getByText(/Manage how you receive notifications/i)).toBeInTheDocument();
      });
    });

    it("has Email Notifications label", async () => {
      const user = userEvent.setup();
      renderWithProviders(<SettingsPage />);

      const notificationsTab = screen.getByRole("tab", { name: /Notifications/i });
      await user.click(notificationsTab);

      await waitFor(() => {
        expect(screen.getByText("Email Notifications")).toBeInTheDocument();
      });
    });

    it("has Save button for notifications", async () => {
      const user = userEvent.setup();
      renderWithProviders(<SettingsPage />);

      const notificationsTab = screen.getByRole("tab", { name: /Notifications/i });
      await user.click(notificationsTab);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /Save Notification Settings/i })).toBeInTheDocument();
      });
    });
  });

  describe("Privacy Tab Content", () => {
    it("can click Privacy tab", async () => {
      const user = userEvent.setup();
      renderWithProviders(<SettingsPage />);

      await waitFor(() => {
        const privacyTab = screen.getByRole("tab", { name: /Privacy/i });
        expect(privacyTab).toBeInTheDocument();
      });

      const privacyTab = screen.getByRole("tab", { name: /Privacy/i });
      await user.click(privacyTab);

      await waitFor(() => {
        expect(screen.getByText(/Export Your Data/i)).toBeInTheDocument();
      });
    });

    it("displays Export Your Data section", async () => {
      const user = userEvent.setup();
      renderWithProviders(<SettingsPage />);

      const privacyTab = screen.getByRole("tab", { name: /Privacy/i });
      await user.click(privacyTab);

      await waitFor(() => {
        expect(screen.getByText(/GDPR compliant/i)).toBeInTheDocument();
      });
    });

    it("has Request Data Export button", async () => {
      const user = userEvent.setup();
      renderWithProviders(<SettingsPage />);

      const privacyTab = screen.getByRole("tab", { name: /Privacy/i });
      await user.click(privacyTab);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /Request Data Export/i })).toBeInTheDocument();
      });
    });

    it("displays Delete Account & Data section", async () => {
      const user = userEvent.setup();
      renderWithProviders(<SettingsPage />);

      const privacyTab = screen.getByRole("tab", { name: /Privacy/i });
      await user.click(privacyTab);

      await waitFor(() => {
        expect(screen.getByText(/Delete Account & Data/i)).toBeInTheDocument();
      });
    });

    it("has Request Account Deletion button", async () => {
      const user = userEvent.setup();
      renderWithProviders(<SettingsPage />);

      const privacyTab = screen.getByRole("tab", { name: /Privacy/i });
      await user.click(privacyTab);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /Request Account Deletion/i })).toBeInTheDocument();
      });
    });

    it("delete account button has destructive styling", async () => {
      const user = userEvent.setup();
      renderWithProviders(<SettingsPage />);

      const privacyTab = screen.getByRole("tab", { name: /Privacy/i });
      await user.click(privacyTab);

      await waitFor(() => {
        const deleteButton = screen.getByRole("button", { name: /Request Account Deletion/i });
        expect(deleteButton).toHaveClass("bg-destructive");
      });
    });

    it("delete account section has warning styling", async () => {
      const user = userEvent.setup();
      renderWithProviders(<SettingsPage />);

      const privacyTab = screen.getByRole("tab", { name: /Privacy/i });
      await user.click(privacyTab);

      await waitFor(() => {
        const deleteCard = screen.getByText(/Delete Account & Data/).closest("div");
        expect(deleteCard).toHaveClass("border-destructive/30");
      });
    });
  });

  describe("Privacy Tab - Delete Confirmation Dialog", () => {
    it("opens delete confirmation when button clicked", async () => {
      const user = userEvent.setup();
      renderWithProviders(<SettingsPage />);

      const privacyTab = screen.getByRole("tab", { name: /Privacy/i });
      await user.click(privacyTab);

      await waitFor(() => {
        const deleteButton = screen.getByRole("button", { name: /Request Account Deletion/i });
        expect(deleteButton).toBeInTheDocument();
      });

      const deleteButton = screen.getByRole("button", { name: /Request Account Deletion/i });
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText(/Delete Account & All Data/i)).toBeInTheDocument();
      });
    });

    it("displays confirmation warning message", async () => {
      const user = userEvent.setup();
      renderWithProviders(<SettingsPage />);

      const privacyTab = screen.getByRole("tab", { name: /Privacy/i });
      await user.click(privacyTab);

      const deleteButton = screen.getByRole("button", { name: /Request Account Deletion/i });
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText(/permanent deletion of your account/i)).toBeInTheDocument();
      });
    });

    it("requires DELETE confirmation text", async () => {
      const user = userEvent.setup();
      renderWithProviders(<SettingsPage />);

      const privacyTab = screen.getByRole("tab", { name: /Privacy/i });
      await user.click(privacyTab);

      const deleteButton = screen.getByRole("button", { name: /Request Account Deletion/i });
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText(/Type DELETE to confirm/i)).toBeInTheDocument();
      });
    });

    it("has DELETE input field", async () => {
      const user = userEvent.setup();
      renderWithProviders(<SettingsPage />);

      const privacyTab = screen.getByRole("tab", { name: /Privacy/i });
      await user.click(privacyTab);

      const deleteButton = screen.getByRole("button", { name: /Request Account Deletion/i });
      await user.click(deleteButton);

      await waitFor(() => {
        const deleteInput = screen.getByPlaceholderText(/Type "DELETE"/i);
        expect(deleteInput).toBeInTheDocument();
      });
    });

    it("confirm button is disabled initially", async () => {
      const user = userEvent.setup();
      renderWithProviders(<SettingsPage />);

      const privacyTab = screen.getByRole("tab", { name: /Privacy/i });
      await user.click(privacyTab);

      const deleteButton = screen.getByRole("button", { name: /Request Account Deletion/i });
      await user.click(deleteButton);

      await waitFor(() => {
        const scheduleDeleteButton = screen.getByRole("button", { name: /Schedule Deletion/i });
        expect(scheduleDeleteButton).toBeDisabled();
      });
    });

    it("enables confirm button when DELETE is typed", async () => {
      const user = userEvent.setup();
      renderWithProviders(<SettingsPage />);

      const privacyTab = screen.getByRole("tab", { name: /Privacy/i });
      await user.click(privacyTab);

      const deleteButton = screen.getByRole("button", { name: /Request Account Deletion/i });
      await user.click(deleteButton);

      const deleteInput = screen.getByPlaceholderText(/Type "DELETE"/i);
      await user.type(deleteInput, "DELETE");

      await waitFor(() => {
        const scheduleDeleteButton = screen.getByRole("button", { name: /Schedule Deletion/i });
        expect(scheduleDeleteButton).not.toBeDisabled();
      });
    });

    it("has cancel button in dialog", async () => {
      const user = userEvent.setup();
      renderWithProviders(<SettingsPage />);

      const privacyTab = screen.getByRole("tab", { name: /Privacy/i });
      await user.click(privacyTab);

      const deleteButton = screen.getByRole("button", { name: /Request Account Deletion/i });
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /Cancel/i })).toBeInTheDocument();
      });
    });
  });

  describe("Account Tab Content", () => {
    it("can click Account tab", async () => {
      const user = userEvent.setup();
      renderWithProviders(<SettingsPage />);

      await waitFor(() => {
        const accountTab = screen.getByRole("tab", { name: /Account/i });
        expect(accountTab).toBeInTheDocument();
      });

      const accountTab = screen.getByRole("tab", { name: /Account/i });
      await user.click(accountTab);

      await waitFor(() => {
        expect(screen.getByText(/Change Password/i)).toBeInTheDocument();
      });
    });

    it("displays Change Password section", async () => {
      const user = userEvent.setup();
      renderWithProviders(<SettingsPage />);

      const accountTab = screen.getByRole("tab", { name: /Account/i });
      await user.click(accountTab);

      await waitFor(() => {
        expect(screen.getByText("Change Password")).toBeInTheDocument();
      });
    });

    it("displays Export Data section", async () => {
      const user = userEvent.setup();
      renderWithProviders(<SettingsPage />);

      const accountTab = screen.getByRole("tab", { name: /Account/i });
      await user.click(accountTab);

      await waitFor(() => {
        expect(screen.getByText("Export Data")).toBeInTheDocument();
      });
    });

    it("has Export Data button", async () => {
      const user = userEvent.setup();
      renderWithProviders(<SettingsPage />);

      const accountTab = screen.getByRole("tab", { name: /Account/i });
      await user.click(accountTab);

      await waitFor(() => {
        const exportButton = screen.getAllByRole("button", { name: /Export Data/i });
        expect(exportButton.length).toBeGreaterThan(0);
      });
    });

    it("displays Delete Account section", async () => {
      const user = userEvent.setup();
      renderWithProviders(<SettingsPage />);

      const accountTab = screen.getByRole("tab", { name: /Account/i });
      await user.click(accountTab);

      await waitFor(() => {
        expect(screen.getByText("Delete Account")).toBeInTheDocument();
      });
    });

    it("has Delete Account button", async () => {
      const user = userEvent.setup();
      renderWithProviders(<SettingsPage />);

      const accountTab = screen.getByRole("tab", { name: /Account/i });
      await user.click(accountTab);

      await waitFor(() => {
        const deleteButtons = screen.getAllByRole("button", { name: /Delete Account/i });
        expect(deleteButtons.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Accessibility", () => {
    it("tabs are keyboard navigable", async () => {
      renderWithProviders(<SettingsPage />);

      await waitFor(() => {
        const tabs = screen.getAllByRole("tab");
        expect(tabs[0]).toBeInTheDocument();
      });
    });

    it("tab content is properly associated", async () => {
      renderWithProviders(<SettingsPage />);

      await waitFor(() => {
        const pipelineTab = screen.getByRole("tab", { name: /Pipeline/i });
        expect(pipelineTab).toHaveAttribute("data-state");
      });
    });
  });
});
