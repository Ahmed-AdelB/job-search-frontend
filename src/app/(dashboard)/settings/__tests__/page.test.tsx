/**
 * Settings Page Integration Tests
 * Author: Ahmed Adel Bakr Alderai
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/__tests__/setup/render-with-providers";
import SettingsPage from "../page";

// Mock next/link and next/navigation
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}));

// Mock API calls
vi.mock("@/lib/api-client", () => ({
  apiGet: vi.fn(),
  apiPut: vi.fn(),
  apiPost: vi.fn(),
}));

// Mock preferences store
vi.mock("@/stores/preferences-store", () => ({
  usePreferencesStore: vi.fn(() => ({
    theme: "system",
    language: "en",
    setTheme: vi.fn(),
    setLanguage: vi.fn(),
  })),
}));

// Mock GDPR hooks
vi.mock("@/hooks/use-gdpr", () => ({
  useGDPRExport: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
    isSuccess: false,
  })),
  useGDPRExportStatus: vi.fn(() => ({
    data: null,
  })),
  useGDPRDeleteAccount: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
}));

// Mock React Query
vi.mock("@tanstack/react-query", async () => {
  const actual = await vi.importActual("@tanstack/react-query");
  return {
    ...actual,
    useQuery: vi.fn(() => ({
      data: {
        pipeline: {
          auto_apply_enabled: false,
          min_match_score: 70,
          max_applications_per_day: 5,
          preferred_locations: [],
          excluded_companies: [],
          remote_types: [],
        },
        notifications: {
          email_notifications: true,
          application_status_updates: true,
          interview_reminders: true,
          daily_digest: true,
          notification_email: "test@example.com",
        },
      },
      isLoading: false,
    })),
    useMutation: vi.fn(() => ({
      mutate: vi.fn(),
      isPending: false,
      isSuccess: false,
    })),
    useQueryClient: vi.fn(() => ({
      invalidateQueries: vi.fn(),
    })),
  };
});

// Mock Select and Tabs components
vi.mock("@/components/ui/select", () => {
  const React = require("react");
  return {
    Select: ({ children, ...props }: any) =>
      React.createElement("div", { "data-testid": "select-root", ...props }, children),
    SelectTrigger: ({ children, ...props }: any) =>
      React.createElement("div", { "data-testid": "select-trigger", ...props }, children),
    SelectValue: ({ placeholder, ...props }: any) =>
      React.createElement("span", { ...props }, placeholder || ""),
    SelectContent: ({ children, ...props }: any) =>
      React.createElement("div", { ...props }, children),
    SelectItem: ({ children, ...props }: any) =>
      React.createElement("option", { ...props }, children),
  };
});

vi.mock("@/components/ui/tabs", () => ({
  Tabs: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  TabsList: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  TabsTrigger: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  TabsContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}));

// Mock AlertDialog
vi.mock("@/components/ui/alert-dialog", () => ({
  AlertDialog: ({ children }: any) => <div>{children}</div>,
  AlertDialogTrigger: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  AlertDialogContent: ({ children }: any) => <div>{children}</div>,
  AlertDialogHeader: ({ children }: any) => <div>{children}</div>,
  AlertDialogTitle: ({ children }: any) => <div>{children}</div>,
  AlertDialogDescription: ({ children }: any) => <div>{children}</div>,
  AlertDialogFooter: ({ children }: any) => <div>{children}</div>,
  AlertDialogAction: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  AlertDialogCancel: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

describe("SettingsPage Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders page with title", () => {
    renderWithProviders(<SettingsPage />);
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("displays subtitle about configuration", () => {
    renderWithProviders(<SettingsPage />);
    expect(screen.getByText(/configure your account, pipeline, and preferences/i)).toBeInTheDocument();
  });

  it("displays Pipeline tab", () => {
    renderWithProviders(<SettingsPage />);
    expect(screen.getByText("Pipeline")).toBeInTheDocument();
  });

  it("displays Privacy tab", () => {
    renderWithProviders(<SettingsPage />);
    expect(screen.getByText("Privacy")).toBeInTheDocument();
  });

  it("displays Account tab", () => {
    renderWithProviders(<SettingsPage />);
    expect(screen.getByText("Account")).toBeInTheDocument();
  });

  it("displays Pipeline Settings title", () => {
    renderWithProviders(<SettingsPage />);
    expect(screen.getByText("Pipeline Settings")).toBeInTheDocument();
  });

  it("displays Auto Apply setting", () => {
    renderWithProviders(<SettingsPage />);
    expect(screen.getByText("Auto Apply")).toBeInTheDocument();
  });

  it("displays Minimum Match Score setting", () => {
    renderWithProviders(<SettingsPage />);
    expect(screen.getByText("Minimum Match Score")).toBeInTheDocument();
  });

  it("displays Export Your Data card", () => {
    renderWithProviders(<SettingsPage />);
    expect(screen.getByText("Export Your Data")).toBeInTheDocument();
  });

  it("displays theme option System", () => {
    renderWithProviders(<SettingsPage />);
    expect(screen.getByText("System")).toBeInTheDocument();
  });

  it("displays language option English", () => {
    renderWithProviders(<SettingsPage />);
    expect(screen.getByText("English")).toBeInTheDocument();
  });

  it("displays Save Pipeline Settings button", () => {
    renderWithProviders(<SettingsPage />);
    expect(screen.getByRole("button", { name: /save pipeline settings/i })).toBeInTheDocument();
  });

  it("renders page structure correctly", () => {
    renderWithProviders(<SettingsPage />);
    const heading = screen.getByText("Settings");
    expect(heading).toBeInTheDocument();
  });
});
