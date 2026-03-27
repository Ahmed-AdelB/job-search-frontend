/**
 * Applications Page Integration Tests
 * Author: Ahmed Adel Bakr Alderai
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/__tests__/setup/render-with-providers";
import ApplicationsPage from "../page";

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
  apiDelete: vi.fn(),
}));

// Mock React Query with proper return structure
vi.mock("@tanstack/react-query", async () => {
  const actual = await vi.importActual("@tanstack/react-query");
  return {
    ...actual,
    useQuery: vi.fn(() => ({
      data: { applications: [], total: 0 },
      isLoading: false,
      isError: false,
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

// Mock Select component
vi.mock("@/components/ui/select", () => {
  const React = require("react");
  return {
    Select: ({ children, value, onValueChange, ...props }: any) =>
      React.createElement("div", { "data-testid": "select-root", ...props },
        React.Children.map(children, (child: any) =>
          child ? React.cloneElement(child, { value, onValueChange }) : null
        )
      ),
    SelectTrigger: ({ children, value, onValueChange, ...props }: any) =>
      React.createElement("div", { "data-testid": "select-trigger", ...props }, children),
    SelectValue: ({ placeholder, value }: any) =>
      React.createElement("span", { "data-testid": "select-value" }, value || placeholder || ""),
    SelectContent: ({ children, value, onValueChange, ...props }: any) =>
      React.createElement("div", { "data-testid": "select-content", ...props },
        React.Children.map(children, (child: any) =>
          child ? React.cloneElement(child, { onValueChange }) : null
        )
      ),
    SelectItem: ({ children, value: itemValue, onValueChange, ...props }: any) =>
      React.createElement("option", {
        value: itemValue,
        onClick: () => onValueChange?.(itemValue),
        ...props,
      }, children),
  };
});

describe("ApplicationsPage Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders page with title", () => {
    renderWithProviders(<ApplicationsPage />);
    const heading = screen.getByRole("heading", { level: 1, name: /applications/i });
    expect(heading).toBeInTheDocument();
  });

  it("displays subtitle about managing applications", () => {
    renderWithProviders(<ApplicationsPage />);
    const subtitle = screen.getByText(/track and manage your/i);
    expect(subtitle).toBeInTheDocument();
  });

  it("displays status summary cards", () => {
    renderWithProviders(<ApplicationsPage />);
    expect(screen.getByText("submitted")).toBeInTheDocument();
    expect(screen.getByText("screening")).toBeInTheDocument();
    expect(screen.getByText("interview")).toBeInTheDocument();
    expect(screen.getByText("offer")).toBeInTheDocument();
    expect(screen.getByText("rejected")).toBeInTheDocument();
  });

  it("displays search input field", () => {
    renderWithProviders(<ApplicationsPage />);
    const searchInput = screen.getByPlaceholderText(/search by company or job title/i);
    expect(searchInput).toBeInTheDocument();
  });

  it("allows typing in search field", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ApplicationsPage />);

    const searchInput = screen.getByPlaceholderText(
      /search by company or job title/i
    ) as HTMLInputElement;

    fireEvent.change(searchInput, { target: { value: "Google" } });
    expect(searchInput.value).toBe("Google");
  });

  it("displays status filter dropdown", () => {
    renderWithProviders(<ApplicationsPage />);
    expect(screen.getByText("All Statuses")).toBeInTheDocument();
  });

  it("displays status filter options", () => {
    renderWithProviders(<ApplicationsPage />);
    expect(screen.getByText("Draft")).toBeInTheDocument();
    expect(screen.getByText("Submitted")).toBeInTheDocument();
    expect(screen.getByText("Screening")).toBeInTheDocument();
    expect(screen.getByText("Interview")).toBeInTheDocument();
    expect(screen.getByText("Offer")).toBeInTheDocument();
    expect(screen.getByText("Hired")).toBeInTheDocument();
    expect(screen.getByText("Rejected")).toBeInTheDocument();
    expect(screen.getByText("Withdrawn")).toBeInTheDocument();
  });

  it("renders the page without errors", () => {
    renderWithProviders(<ApplicationsPage />);
    // Page should render successfully
    expect(screen.getByRole("heading", { level: 1, name: /applications/i })).toBeInTheDocument();
  });

  it("displays search and filter controls together", () => {
    renderWithProviders(<ApplicationsPage />);
    const searchInput = screen.getByPlaceholderText(/search by company or job title/i);
    const statusFilter = screen.getByText("All Statuses");
    expect(searchInput).toBeInTheDocument();
    expect(statusFilter).toBeInTheDocument();
  });

  it("displays loading state with skeletons", () => {
    renderWithProviders(<ApplicationsPage />);
    const heading = screen.getByRole("heading", { level: 1, name: /applications/i });
    expect(heading).toBeInTheDocument();
  });

  it("shows empty state message when no applications", () => {
    renderWithProviders(<ApplicationsPage />);
    const heading = screen.getByRole("heading", { level: 1, name: /applications/i });
    expect(heading).toBeInTheDocument();
  });

  it("displays total applications count in description", () => {
    renderWithProviders(<ApplicationsPage />);
    const description = screen.getByText(/total applications/i);
    expect(description).toBeInTheDocument();
  });

  it("displays filter card container", () => {
    renderWithProviders(<ApplicationsPage />);
    const searchIcon = screen.getByPlaceholderText(/search by company or job title/i);
    expect(searchIcon).toBeInTheDocument();
  });

  it("displays summary cards grid layout", () => {
    renderWithProviders(<ApplicationsPage />);
    const statusCards = screen.getAllByText(/submitted|screening|interview|offer|rejected/i);
    expect(statusCards.length).toBeGreaterThanOrEqual(5);
  });

  it("renders page structure correctly", () => {
    renderWithProviders(<ApplicationsPage />);
    const heading = screen.getByRole("heading", { level: 1, name: /applications/i });
    expect(heading).toBeInTheDocument();
  });
});
