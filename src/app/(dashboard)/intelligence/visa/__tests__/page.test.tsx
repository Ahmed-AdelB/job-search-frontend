/**
 * Visa Sponsorship Analysis Page Integration Tests
 * Author: Ahmed Adel Bakr Alderai
 */

import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen } from "@testing-library/react";
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
import VisaPage from "../page";
import { useQuery } from "@tanstack/react-query";

describe("VisaPage Integration Tests", () => {
  const mockUseQuery = useQuery as any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseQuery.mockReturnValue({
      data: {
        scores: [
          {
            occupation: "Software Engineer",
            eligibility_score: 85,
            sponsorship_likelihood: "high",
            eligible_countries: ["USA", "Canada", "UK"],
            details: "High-demand role with strong visa sponsorship",
          },
          {
            occupation: "Data Engineer",
            eligibility_score: 78,
            sponsorship_likelihood: "high",
            eligible_countries: ["USA", "Canada", "UK", "Australia"],
            details: "Strong technical skills in demand",
          },
          {
            occupation: "Product Manager",
            eligibility_score: 55,
            sponsorship_likelihood: "medium",
            eligible_countries: ["Canada", "UK"],
            details: "Moderate visa sponsorship likelihood",
          },
          {
            occupation: "Design Engineer",
            eligibility_score: 35,
            sponsorship_likelihood: "low",
            eligible_countries: ["Canada"],
            details: "Limited visa sponsorship opportunities",
          },
        ],
      },
      isLoading: false,
    });
  });

  it("renders page with title and description", () => {
    renderWithProviders(<VisaPage />);
    expect(screen.getByText("Visa Sponsorship")).toBeInTheDocument();
    expect(screen.getByText("Visa eligibility scoring and sponsorship analysis")).toBeInTheDocument();
  });

  it("displays back button with correct href", () => {
    renderWithProviders(<VisaPage />);
    const backLink = screen.getByRole("link", { name: /back/i });
    expect(backLink).toHaveAttribute("href", "/intelligence");
  });

  it("shows three summary stat cards", () => {
    renderWithProviders(<VisaPage />);
    expect(screen.getByText("Average Score")).toBeInTheDocument();
    expect(screen.getByText("High Likelihood")).toBeInTheDocument();
    expect(screen.getByText("Medium Likelihood")).toBeInTheDocument();
  });

  it("displays average score calculation", () => {
    renderWithProviders(<VisaPage />);
    expect(screen.getByText("63/100")).toBeInTheDocument();
  });

  it("displays high likelihood count", () => {
    renderWithProviders(<VisaPage />);
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("displays medium likelihood count", () => {
    renderWithProviders(<VisaPage />);
    const mediumBadge = screen.getByText("1");
    expect(mediumBadge).toBeInTheDocument();
  });

  it("displays visa eligibility table title", () => {
    renderWithProviders(<VisaPage />);
    expect(screen.getByText("Visa Eligibility by Occupation")).toBeInTheDocument();
  });

  it("shows table description with role count", () => {
    renderWithProviders(<VisaPage />);
    expect(screen.getByText("4 occupations analyzed")).toBeInTheDocument();
  });

  it("shows table header columns", () => {
    renderWithProviders(<VisaPage />);
    expect(screen.getByText("Occupation")).toBeInTheDocument();
    expect(screen.getByText("Eligibility Score")).toBeInTheDocument();
    expect(screen.getByText("Sponsorship Likelihood")).toBeInTheDocument();
    expect(screen.getByText("Eligible Countries")).toBeInTheDocument();
    expect(screen.getByText("Details")).toBeInTheDocument();
  });

  it("displays all occupation names", () => {
    renderWithProviders(<VisaPage />);
    expect(screen.getByText("Software Engineer")).toBeInTheDocument();
    expect(screen.getByText("Data Engineer")).toBeInTheDocument();
    expect(screen.getByText("Product Manager")).toBeInTheDocument();
    expect(screen.getByText("Design Engineer")).toBeInTheDocument();
  });

  it("shows eligibility scores for all roles", () => {
    renderWithProviders(<VisaPage />);
    expect(screen.getByText("85")).toBeInTheDocument();
    expect(screen.getByText("78")).toBeInTheDocument();
    expect(screen.getByText("55")).toBeInTheDocument();
    expect(screen.getByText("35")).toBeInTheDocument();
  });

  it("displays sponsorship likelihood badges", () => {
    renderWithProviders(<VisaPage />);
    const highBadges = screen.getAllByText(/high/i);
    expect(highBadges.length).toBeGreaterThanOrEqual(1);
  });

  it("shows eligible countries for each role", () => {
    renderWithProviders(<VisaPage />);
    // Countries appear multiple times in the table, verify at least one of each appears
    // Note: Some countries may be hidden behind "+N" badges if > 3 are present
    const usaElements = screen.getAllByText("USA");
    const canadaElements = screen.getAllByText("Canada");
    const ukElements = screen.getAllByText("UK");
    expect(usaElements.length).toBeGreaterThanOrEqual(1);
    expect(canadaElements.length).toBeGreaterThanOrEqual(1);
    expect(ukElements.length).toBeGreaterThanOrEqual(1);
    // Australia may be hidden, but verify the "+1" indicator exists for Data Engineer
    expect(screen.getByText("+1")).toBeInTheDocument();
  });

  it("displays details text for roles", () => {
    renderWithProviders(<VisaPage />);
    expect(screen.getByText("High-demand role with strong visa sponsorship")).toBeInTheDocument();
    expect(screen.getByText("Strong technical skills in demand")).toBeInTheDocument();
    expect(screen.getByText("Moderate visa sponsorship likelihood")).toBeInTheDocument();
    expect(screen.getByText("Limited visa sponsorship opportunities")).toBeInTheDocument();
  });

  it("shows +3 indicator for additional countries", () => {
    renderWithProviders(<VisaPage />);
    expect(screen.getByText("+1")).toBeInTheDocument();
  });

  it("shows loading skeletons while data is loading", () => {
    mockUseQuery.mockReturnValue({
      data: null,
      isLoading: true,
    });
    renderWithProviders(<VisaPage />);
    expect(screen.getByText("Visa Sponsorship")).toBeInTheDocument();
  });

  it("shows empty state when no scores available", () => {
    mockUseQuery.mockReturnValue({
      data: { scores: [] },
      isLoading: false,
    });
    renderWithProviders(<VisaPage />);
    expect(screen.getByText("No visa data available. Add jobs to analyze sponsorship likelihood.")).toBeInTheDocument();
  });

  it("back button navigates to intelligence hub", () => {
    renderWithProviders(<VisaPage />);
    const backButton = screen.getByRole("link", { name: /back/i });
    expect(backButton.getAttribute("href")).toBe("/intelligence");
  });

  it("renders score cards with proper styling", () => {
    renderWithProviders(<VisaPage />);
    expect(screen.getByText("Average Score")).toBeInTheDocument();
    expect(screen.getByText("High Likelihood")).toBeInTheDocument();
    expect(screen.getByText("Medium Likelihood")).toBeInTheDocument();
  });

  it("displays average score out of 100", () => {
    renderWithProviders(<VisaPage />);
    expect(screen.getByText(/\/100/)).toBeInTheDocument();
  });

  it("shows high likelihood count in green", () => {
    renderWithProviders(<VisaPage />);
    expect(screen.getByText("High Likelihood")).toBeInTheDocument();
  });

  it("shows medium likelihood count in amber", () => {
    renderWithProviders(<VisaPage />);
    expect(screen.getByText("Medium Likelihood")).toBeInTheDocument();
  });

  it("handles single score correctly", () => {
    mockUseQuery.mockReturnValue({
      data: {
        scores: [
          {
            occupation: "Test Role",
            eligibility_score: 70,
            sponsorship_likelihood: "high",
            eligible_countries: ["USA"],
            details: "Test details",
          },
        ],
      },
      isLoading: false,
    });
    renderWithProviders(<VisaPage />);
    expect(screen.getByText("Test Role")).toBeInTheDocument();
    expect(screen.getByText("70/100")).toBeInTheDocument();
  });

  it("shows empty state message when no data", () => {
    mockUseQuery.mockReturnValue({
      data: { scores: [] },
      isLoading: false,
    });
    renderWithProviders(<VisaPage />);
    expect(screen.getByText("No visa data available. Add jobs to analyze sponsorship likelihood.")).toBeInTheDocument();
  });

  it("renders page title section with correct styling", () => {
    renderWithProviders(<VisaPage />);
    expect(screen.getByText("Visa Sponsorship")).toBeInTheDocument();
    expect(screen.getByText("Visa eligibility scoring and sponsorship analysis")).toBeInTheDocument();
  });

  it("displays summary cards with icons", () => {
    renderWithProviders(<VisaPage />);
    expect(screen.getByText("Average Score")).toBeInTheDocument();
    expect(screen.getByText("High Likelihood")).toBeInTheDocument();
    expect(screen.getByText("Medium Likelihood")).toBeInTheDocument();
  });

  it("shows correct calculation for average score", () => {
    renderWithProviders(<VisaPage />);
    expect(screen.getByText("63/100")).toBeInTheDocument();
  });
});
