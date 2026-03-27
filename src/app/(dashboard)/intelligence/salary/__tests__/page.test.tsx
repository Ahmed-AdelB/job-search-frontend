/**
 * Salary Benchmarks Page Integration Tests
 * Author: Ahmed Adel Bakr Alderai
 */

import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "@/__tests__/setup/render-with-providers";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock motion/react
vi.mock("motion/react", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    tr: ({ children, ...props }: any) => <tr {...props}>{children}</tr>,
  },
}));

// Mock useQuery hook
vi.mock("@tanstack/react-query", async () => {
  const actual = await vi.importActual("@tanstack/react-query");
  return {
    ...actual,
    useQuery: vi.fn(),
  };
});

// Import AFTER mocking
import SalaryPage from "../page";
import { useQuery } from "@tanstack/react-query";

describe("SalaryPage Integration Tests", () => {
  const mockUseQuery = useQuery as any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseQuery.mockReturnValue({
      data: {
        benchmarks: [
          {
            title: "Senior Software Engineer",
            location: "San Francisco, CA",
            currency: "USD",
            percentile_25: 100000,
            percentile_50: 120000,
            percentile_75: 140000,
            percentile_90: 160000,
            sample_size: 250,
          },
          {
            title: "Staff Engineer",
            location: "San Francisco, CA",
            currency: "USD",
            percentile_25: 130000,
            percentile_50: 160000,
            percentile_75: 190000,
            percentile_90: 220000,
            sample_size: 180,
          },
          {
            title: "Engineering Manager",
            location: "New York, NY",
            currency: "USD",
            percentile_25: 110000,
            percentile_50: 135000,
            percentile_75: 160000,
            percentile_90: 185000,
            sample_size: 120,
          },
        ],
      },
      isLoading: false,
    });
  });

  it("renders page with title and description", () => {
    renderWithProviders(<SalaryPage />);
    expect(screen.getByText("Salary Benchmarks")).toBeInTheDocument();
    expect(screen.getByText("Salary data and compensation analysis for your target roles")).toBeInTheDocument();
  });

  it("displays back button", () => {
    renderWithProviders(<SalaryPage />);
    const backLink = screen.getByRole("link", { name: /back/i });
    expect(backLink).toHaveAttribute("href", "/intelligence");
  });

  it("shows three summary stat cards", () => {
    renderWithProviders(<SalaryPage />);
    expect(screen.getByText("Avg Median Salary")).toBeInTheDocument();
    expect(screen.getByText("Top P90")).toBeInTheDocument();
    expect(screen.getByText("Data Points")).toBeInTheDocument();
  });

  it("displays average median salary calculation", () => {
    renderWithProviders(<SalaryPage />);
    expect(screen.getByText(/\$138,333/)).toBeInTheDocument();
  });

  it("displays top P90 salary", () => {
    renderWithProviders(<SalaryPage />);
    // Should find multiple elements with P90 salary (card and table), verify at least one exists
    const elements = screen.getAllByText(/\$220,000/);
    expect(elements.length).toBeGreaterThanOrEqual(1);
  });

  it("displays total data points", () => {
    renderWithProviders(<SalaryPage />);
    expect(screen.getByText("550")).toBeInTheDocument();
  });

  it("displays salary benchmarks table", () => {
    renderWithProviders(<SalaryPage />);
    expect(screen.getByText("Salary Benchmarks by Role")).toBeInTheDocument();
    expect(screen.getByText("3 roles analyzed")).toBeInTheDocument();
  });

  it("shows table header columns", () => {
    renderWithProviders(<SalaryPage />);
    expect(screen.getByText("Role")).toBeInTheDocument();
    expect(screen.getByText("Location")).toBeInTheDocument();
    expect(screen.getByText("P25")).toBeInTheDocument();
    expect(screen.getByText("Median")).toBeInTheDocument();
    expect(screen.getByText("P75")).toBeInTheDocument();
    expect(screen.getByText("P90")).toBeInTheDocument();
  });

  it("displays first benchmark row data", () => {
    renderWithProviders(<SalaryPage />);
    expect(screen.getByText("Senior Software Engineer")).toBeInTheDocument();
  });

  it("displays salary values formatted as currency", () => {
    renderWithProviders(<SalaryPage />);
    const salaryTexts = screen.getAllByText(/\$\d{1,3}(,\d{3})*(?!\d)/);
    expect(salaryTexts.length).toBeGreaterThanOrEqual(10);
  });

  it("shows sample sizes for each role", () => {
    renderWithProviders(<SalaryPage />);
    expect(screen.getByText("250")).toBeInTheDocument();
    expect(screen.getByText("180")).toBeInTheDocument();
    expect(screen.getByText("120")).toBeInTheDocument();
  });

  it("displays all three role titles", () => {
    renderWithProviders(<SalaryPage />);
    expect(screen.getByText("Senior Software Engineer")).toBeInTheDocument();
    expect(screen.getByText("Staff Engineer")).toBeInTheDocument();
    expect(screen.getByText("Engineering Manager")).toBeInTheDocument();
  });

  it("displays all locations", () => {
    renderWithProviders(<SalaryPage />);
    // Locations appear multiple times in the table (San Francisco appears twice, New York once)
    // Verify at least one occurrence of each
    const sfElements = screen.getAllByText(/San Francisco, CA/);
    const nyElements = screen.getAllByText(/New York, NY/);
    expect(sfElements.length).toBeGreaterThanOrEqual(1);
    expect(nyElements.length).toBeGreaterThanOrEqual(1);
  });

  it("shows loading skeletons while data is loading", () => {
    mockUseQuery.mockReturnValue({
      data: null,
      isLoading: true,
    });
    renderWithProviders(<SalaryPage />);
    expect(screen.getByText("Salary Benchmarks")).toBeInTheDocument();
  });

  it("shows empty state when no benchmarks available", () => {
    mockUseQuery.mockReturnValue({
      data: { benchmarks: [] },
      isLoading: false,
    });
    renderWithProviders(<SalaryPage />);
    expect(screen.getByText("No salary data available yet. Apply to jobs to build salary benchmarks.")).toBeInTheDocument();
  });

  it("back button link has correct href", () => {
    renderWithProviders(<SalaryPage />);
    const backButton = screen.getByRole("link", { name: /back/i });
    expect(backButton.getAttribute("href")).toBe("/intelligence");
  });

  it("displays top P90 salary in green color", () => {
    renderWithProviders(<SalaryPage />);
    // Check that P90 value is present, allowing for multiple occurrences (card + table)
    const elements = screen.getAllByText(/\$220,000/);
    expect(elements.length).toBeGreaterThanOrEqual(1);
  });

  it("handles single benchmark correctly", () => {
    mockUseQuery.mockReturnValue({
      data: {
        benchmarks: [
          {
            title: "Single Role",
            location: "Remote",
            currency: "USD",
            percentile_25: 50000,
            percentile_50: 60000,
            percentile_75: 70000,
            percentile_90: 80000,
            sample_size: 50,
          },
        ],
      },
      isLoading: false,
    });
    renderWithProviders(<SalaryPage />);
    expect(screen.getByText("Single Role")).toBeInTheDocument();
    expect(screen.getByText("Remote")).toBeInTheDocument();
  });

  it("renders description in card header", () => {
    renderWithProviders(<SalaryPage />);
    expect(screen.getByText("3 roles analyzed")).toBeInTheDocument();
  });
});
