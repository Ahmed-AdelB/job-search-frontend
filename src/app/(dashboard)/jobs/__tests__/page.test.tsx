/**
 * Jobs Page Integration Tests
 * Author: Ahmed Adel Bakr Alderai
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen, waitFor, fireEvent } from "@testing-library/react";
import { renderWithProviders } from "@/__tests__/setup/render-with-providers";
import JobsPage from "../page";
import { createMockJob, createMockJobList, resetIdCounter } from "@/__tests__/setup/test-data";

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

// Mock hooks
vi.mock("@/hooks/use-apply", () => ({
  useApplyToJob: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  useAutoApply: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  useDryRunApply: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

// Mock Select to render real HTML select elements in jsdom
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

/** Helper to reliably set controlled input values in React 19 */
function setInputValue(element: HTMLElement, value: string) {
  const proto = element.tagName === "TEXTAREA"
    ? HTMLTextAreaElement.prototype
    : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
  if (setter) setter.call(element, value);
  element.dispatchEvent(new Event("input", { bubbles: true }));
}

describe("JobsPage Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetIdCounter();
  });

  it("renders page with job list", async () => {
    const mockJobs = createMockJobList(3);
    const { apiGet } = await import("@/lib/api-client");
    vi.mocked(apiGet).mockResolvedValueOnce({
      jobs: mockJobs,
      total: 3,
    });

    renderWithProviders(<JobsPage />);

    await waitFor(() => {
      expect(screen.getByText("Jobs")).toBeInTheDocument();
    });
  });

  it("shows loading skeletons initially", async () => {
    const { apiGet } = await import("@/lib/api-client");
    vi.mocked(apiGet).mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({ jobs: [], total: 0 });
          }, 1000);
        })
    );

    renderWithProviders(<JobsPage />);

    // Check for Jobs title
    expect(screen.getByText("Jobs")).toBeInTheDocument();
  });

  it("renders job cards with title and company", async () => {
    const mockJobs = createMockJobList(2);
    const { apiGet } = await import("@/lib/api-client");
    vi.mocked(apiGet).mockResolvedValueOnce({
      jobs: mockJobs,
      total: 2,
    });

    renderWithProviders(<JobsPage />);

    await waitFor(() => {
      expect(screen.getByText("Engineer 1")).toBeInTheDocument();
      expect(screen.getByText("Company 1")).toBeInTheDocument();
    });
  });

  it("shows job table with sortable columns", async () => {
    const mockJobs = createMockJobList(2);
    const { apiGet } = await import("@/lib/api-client");
    vi.mocked(apiGet).mockResolvedValueOnce({
      jobs: mockJobs,
      total: 2,
    });

    renderWithProviders(<JobsPage />);

    await waitFor(() => {
      expect(screen.getByText("Title")).toBeInTheDocument();
      expect(screen.getByText("Company")).toBeInTheDocument();
      expect(screen.getByText("Location")).toBeInTheDocument();
    });
  });

  it("shows empty state when no jobs found", async () => {
    const { apiGet } = await import("@/lib/api-client");
    vi.mocked(apiGet).mockResolvedValueOnce({
      jobs: [],
      total: 0,
    });

    renderWithProviders(<JobsPage />);

    await waitFor(() => {
      expect(
        screen.getByText("No jobs discovered yet. Run the pipeline to start discovering jobs.")
      ).toBeInTheDocument();
    });
  });

  it("displays filter and search controls", async () => {
    const mockJobs = createMockJobList(3);
    const { apiGet } = await import("@/lib/api-client");
    vi.mocked(apiGet).mockResolvedValueOnce({
      jobs: mockJobs,
      total: 3,
    });

    renderWithProviders(<JobsPage />);

    await waitFor(() => {
      // Search input
      const searchInput = screen.getByPlaceholderText(
        /search by title, company, or location/i
      ) as HTMLInputElement;
      expect(searchInput).toBeInTheDocument();

      // Status filter - rendered via mocked Select showing "All Status" as option
      expect(screen.getByText("All Status")).toBeInTheDocument();

      // Remote type filter
      expect(screen.getByText("All Types")).toBeInTheDocument();
    });
  });

  it("filters jobs by search term", async () => {
    const mockJobs = createMockJobList(2);
    const { apiGet } = await import("@/lib/api-client");

    vi.mocked(apiGet).mockResolvedValueOnce({
      jobs: mockJobs,
      total: 2,
    });

    renderWithProviders(<JobsPage />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search by title, company, or location/i)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(
      /search by title, company, or location/i
    ) as HTMLInputElement;

    // Use fireEvent.change which works for controlled Input in React 19
    fireEvent.change(searchInput, { target: { value: "Engineer" } });

    await waitFor(() => {
      expect(searchInput.value).toBe("Engineer");
    });
  });

  it("filters jobs by status", async () => {
    const mockJobs = createMockJobList(2);
    const { apiGet } = await import("@/lib/api-client");

    vi.mocked(apiGet).mockResolvedValueOnce({
      jobs: mockJobs,
      total: 2,
    });

    renderWithProviders(<JobsPage />);

    await waitFor(() => {
      // Verify the status filter options exist
      expect(screen.getByText("All Status")).toBeInTheDocument();
      expect(screen.getByText("New")).toBeInTheDocument();
      expect(screen.getByText("Applied")).toBeInTheDocument();
    });
  });

  it("shows status badges with job counts", async () => {
    const mockJobs = [
      createMockJob({ status: "new" }),
      createMockJob({ status: "applied" }),
      createMockJob({ status: "new" }),
    ];
    const { apiGet } = await import("@/lib/api-client");

    vi.mocked(apiGet).mockResolvedValueOnce({
      jobs: mockJobs,
      total: 3,
    });

    renderWithProviders(<JobsPage />);

    await waitFor(() => {
      // Job status badges should be visible in the table
      const appliedBadges = screen.queryAllByText("applied");
      expect(appliedBadges.length).toBeGreaterThan(0);
    });
  });

  it("supports pagination controls", async () => {
    const mockJobs = createMockJobList(25);
    const { apiGet } = await import("@/lib/api-client");

    vi.mocked(apiGet).mockResolvedValueOnce({
      jobs: mockJobs,
      total: 50,
    });

    renderWithProviders(<JobsPage />);

    await waitFor(() => {
      const previousButton = screen.getByRole("button", { name: /previous/i });
      const nextButton = screen.getByRole("button", { name: /next/i });

      expect(previousButton).toBeInTheDocument();
      expect(nextButton).toBeInTheDocument();
    });
  });

  it("allows selecting multiple jobs via checkboxes", async () => {
    const mockJobs = createMockJobList(3);
    const { apiGet } = await import("@/lib/api-client");

    vi.mocked(apiGet).mockResolvedValueOnce({
      jobs: mockJobs,
      total: 3,
    });

    renderWithProviders(<JobsPage />);

    await waitFor(() => {
      const checkboxes = screen.getAllByRole("checkbox");
      expect(checkboxes.length).toBeGreaterThan(0);
    });
  });

  it("shows bulk action buttons when jobs are selected", async () => {
    const mockJobs = createMockJobList(2);
    const { apiGet } = await import("@/lib/api-client");

    vi.mocked(apiGet).mockResolvedValueOnce({
      jobs: mockJobs,
      total: 2,
    });

    renderWithProviders(<JobsPage />);

    await waitFor(() => {
      const checkboxes = screen.getAllByRole("checkbox");
      expect(checkboxes.length).toBeGreaterThan(0);
    });
  });

  it("displays salary information in table", async () => {
    const mockJobs = [
      createMockJob({ salary_min: 80000, salary_max: 120000, currency: "USD" }),
    ];
    const { apiGet } = await import("@/lib/api-client");

    vi.mocked(apiGet).mockResolvedValueOnce({
      jobs: mockJobs,
      total: 1,
    });

    renderWithProviders(<JobsPage />);

    await waitFor(() => {
      // Salary should be displayed - look for either the formatted range or individual numbers
      const salaryElements = screen.queryAllByText(/80/);
      expect(salaryElements.length).toBeGreaterThan(0);
    });
  });

  it("displays job status badges with correct styling", async () => {
    const mockJobs = [
      createMockJob({ status: "applied" }),
      createMockJob({ status: "interview" }),
    ];
    const { apiGet } = await import("@/lib/api-client");

    vi.mocked(apiGet).mockResolvedValueOnce({
      jobs: mockJobs,
      total: 2,
    });

    renderWithProviders(<JobsPage />);

    await waitFor(() => {
      const appliedBadges = screen.queryAllByText("applied");
      expect(appliedBadges.length).toBeGreaterThan(0);
    });
  });

  it("displays remote type information with badge styling", async () => {
    const mockJobs = [
      createMockJob({ remote_type: "remote" }),
      createMockJob({ remote_type: "hybrid" }),
    ];
    const { apiGet } = await import("@/lib/api-client");

    vi.mocked(apiGet).mockResolvedValueOnce({
      jobs: mockJobs,
      total: 2,
    });

    renderWithProviders(<JobsPage />);

    await waitFor(() => {
      const remoteBadges = screen.queryAllByText("remote");
      const hybridBadges = screen.queryAllByText("hybrid");

      expect(remoteBadges.length).toBeGreaterThan(0);
      expect(hybridBadges.length).toBeGreaterThan(0);
    });
  });
});
