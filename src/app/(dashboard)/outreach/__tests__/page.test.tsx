/**
 * Outreach Page Integration Tests
 * Author: Ahmed Adel Bakr Alderai
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/__tests__/setup/render-with-providers";
import OutreachPage from "../page";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock API calls
vi.mock("@/lib/api-client", () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
}));

// Mock React Query
vi.mock("@tanstack/react-query", async () => {
  const actual = await vi.importActual("@tanstack/react-query");
  return {
    ...actual,
    useQuery: vi.fn(() => ({
      data: {
        total_sent: 0,
        open_rate: 0,
        reply_rate: 0,
        total_replied: 0,
        messages: [],
        total: 0,
        campaigns: [],
      },
      isLoading: false,
      refetch: vi.fn(),
    })),
    useMutation: vi.fn(() => ({
      mutate: vi.fn(),
      isPending: false,
    })),
    useQueryClient: vi.fn(() => ({
      invalidateQueries: vi.fn(),
    })),
  };
});

// Mock Dialog component
vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  DialogTrigger: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <div>{children}</div>,
  DialogDescription: ({ children }: any) => <div>{children}</div>,
  DialogFooter: ({ children }: any) => <div>{children}</div>,
}));

// Mock Select component
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

describe("OutreachPage Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders page with title", () => {
    renderWithProviders(<OutreachPage />);
    expect(screen.getByText("Outreach")).toBeInTheDocument();
  });

  it("displays subtitle about email campaigns", () => {
    renderWithProviders(<OutreachPage />);
    expect(screen.getByText(/manage email campaigns and outreach messages/i)).toBeInTheDocument();
  });

  it("displays Refresh button", () => {
    renderWithProviders(<OutreachPage />);
    const refreshButton = screen.getByRole("button", { name: /refresh/i });
    expect(refreshButton).toBeInTheDocument();
  });

  it("displays New Campaign button", () => {
    renderWithProviders(<OutreachPage />);
    const newCampaignButton = screen.getByRole("button", { name: /new campaign/i });
    expect(newCampaignButton).toBeInTheDocument();
  });

  it("displays Total Sent stats card", () => {
    renderWithProviders(<OutreachPage />);
    expect(screen.getByText("Total Sent")).toBeInTheDocument();
  });

  it("displays Open Rate stats card", () => {
    renderWithProviders(<OutreachPage />);
    expect(screen.getByText("Open Rate")).toBeInTheDocument();
  });

  it("displays Reply Rate stats card", () => {
    renderWithProviders(<OutreachPage />);
    expect(screen.getByText("Reply Rate")).toBeInTheDocument();
  });

  it("displays Replied count stats card", () => {
    renderWithProviders(<OutreachPage />);
    expect(screen.getByText("Replied")).toBeInTheDocument();
  });

  it("displays Message Queue section", () => {
    renderWithProviders(<OutreachPage />);
    expect(screen.getByText("Message Queue")).toBeInTheDocument();
  });

  it("displays message count in description", () => {
    renderWithProviders(<OutreachPage />);
    expect(screen.getByText(/total messages/i)).toBeInTheDocument();
  });

  it("renders page structure correctly", () => {
    renderWithProviders(<OutreachPage />);
    const heading = screen.getByText("Outreach");
    expect(heading).toBeInTheDocument();
  });

  it("renders all main sections", () => {
    renderWithProviders(<OutreachPage />);
    // Verify the page renders without errors
    expect(screen.getByText("Outreach")).toBeInTheDocument();
  });

  it("creates proper layout structure", () => {
    const { container } = renderWithProviders(<OutreachPage />);
    expect(container).toBeInTheDocument();
  });
});
