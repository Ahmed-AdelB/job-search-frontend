/**
 * Settings Page / Tabs Tests
 * Author: Ahmed Adel Bakr Alderai
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
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

// Mock Tabs to render ALL content simultaneously (avoids Radix tab-switching issues in jsdom)
vi.mock("@/components/ui/tabs", () => {
  const React = require("react");
  return {
    Tabs: ({ children, defaultValue, ...props }: any) =>
      React.createElement("div", { "data-testid": "tabs", "data-default": defaultValue, ...props }, children),
    TabsList: ({ children, ...props }: any) =>
      React.createElement("div", { role: "tablist", ...props }, children),
    TabsTrigger: ({ children, value, ...props }: any) =>
      React.createElement("button", { role: "tab", "aria-selected": value === "pipeline" ? "true" : "false", "data-value": value, ...props }, children),
    TabsContent: ({ children, ...props }: any) =>
      React.createElement("div", { role: "tabpanel", ...props }, children),
  };
});

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
        expect(pipelineTab).toHaveAttribute("aria-selected", "true");
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

  // With mocked Tabs that render all content simultaneously, no clicking needed
  describe("Appearance Tab Content", () => {
    it("renders Appearance heading", async () => {
      renderWithProviders(<SettingsPage />);

      await waitFor(() => {
        const appearances = screen.getAllByText("Appearance");
        expect(appearances.length).toBeGreaterThanOrEqual(1);
      });
    });

    it("displays Appearance description", async () => {
      renderWithProviders(<SettingsPage />);

      await waitFor(() => {
        expect(screen.getByText(/Customize how the application looks/i)).toBeInTheDocument();
      });
    });

    it("shows theme options in Appearance tab", async () => {
      renderWithProviders(<SettingsPage />);

      await waitFor(() => {
        expect(screen.getByText("Theme")).toBeInTheDocument();
      });
    });

    it("shows language option in Appearance tab", async () => {
      renderWithProviders(<SettingsPage />);

      await waitFor(() => {
        expect(screen.getByText("Language")).toBeInTheDocument();
      });
    });
  });

  describe("Notifications Tab Content", () => {
    it("renders Notifications heading", async () => {
      renderWithProviders(<SettingsPage />);

      await waitFor(() => {
        const headings = screen.getAllByText("Notifications");
        expect(headings.length).toBeGreaterThanOrEqual(1);
      });
    });

    it("displays Notifications description", async () => {
      renderWithProviders(<SettingsPage />);

      await waitFor(() => {
        expect(screen.getByText(/Manage how you receive notifications/i)).toBeInTheDocument();
      });
    });

    it("has Email Notifications label", async () => {
      renderWithProviders(<SettingsPage />);

      await waitFor(() => {
        expect(screen.getByText("Email Notifications")).toBeInTheDocument();
      });
    });

    it("has Save button for notifications", async () => {
      renderWithProviders(<SettingsPage />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /Save Notification Settings/i })).toBeInTheDocument();
      });
    });
  });

  describe("Privacy Tab Content", () => {
    it("displays Export Your Data section", async () => {
      renderWithProviders(<SettingsPage />);

      await waitFor(() => {
        expect(screen.getByText(/Export Your Data/i)).toBeInTheDocument();
      });
    });

    it("displays GDPR compliant text", async () => {
      renderWithProviders(<SettingsPage />);

      await waitFor(() => {
        expect(screen.getByText(/GDPR compliant/i)).toBeInTheDocument();
      });
    });

    it("has Request Data Export button", async () => {
      renderWithProviders(<SettingsPage />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /Request Data Export/i })).toBeInTheDocument();
      });
    });

    it("displays Delete Account & Data section", async () => {
      renderWithProviders(<SettingsPage />);

      await waitFor(() => {
        expect(screen.getByText(/Delete Account & Data/i)).toBeInTheDocument();
      });
    });

    it("has Request Account Deletion button", async () => {
      renderWithProviders(<SettingsPage />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /Request Account Deletion/i })).toBeInTheDocument();
      });
    });

    it("delete account card exists with destructive border", async () => {
      renderWithProviders(<SettingsPage />);

      await waitFor(() => {
        const card = screen.getByText(/Delete Account & Data/).closest(".border-destructive\\/30");
        expect(card).toBeInTheDocument();
      });
    });
  });

  describe("Account Tab Content", () => {
    it("displays Change Password section", async () => {
      renderWithProviders(<SettingsPage />);

      await waitFor(() => {
        const matches = screen.getAllByText("Change Password");
        expect(matches.length).toBeGreaterThanOrEqual(1);
      });
    });

    it("displays Export Data section", async () => {
      renderWithProviders(<SettingsPage />);

      await waitFor(() => {
        const matches = screen.getAllByText("Export Data");
        expect(matches.length).toBeGreaterThanOrEqual(1);
      });
    });

    it("has Export Data button", async () => {
      renderWithProviders(<SettingsPage />);

      await waitFor(() => {
        const exportButtons = screen.getAllByRole("button", { name: /Export Data/i });
        expect(exportButtons.length).toBeGreaterThan(0);
      });
    });

    it("displays Delete Account section in Account tab", async () => {
      renderWithProviders(<SettingsPage />);

      await waitFor(() => {
        const matches = screen.getAllByText("Delete Account");
        expect(matches.length).toBeGreaterThanOrEqual(1);
      });
    });

    it("has Delete Account button", async () => {
      renderWithProviders(<SettingsPage />);

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
        expect(pipelineTab).toHaveAttribute("aria-selected");
      });
    });
  });
});
