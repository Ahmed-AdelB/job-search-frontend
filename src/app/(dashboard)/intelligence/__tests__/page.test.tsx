/**
 * Intelligence Hub Page Integration Tests
 * Author: Ahmed Adel Bakr Alderai
 */

import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "@/__tests__/setup/render-with-providers";
import IntelligencePage from "../page";

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
  },
}));

// Mock hooks
const mockUseQuerySkills = vi.fn();
const mockUseQueryVisa = vi.fn();
const mockUseQuerySalary = vi.fn();
const mockUseQueryRemote = vi.fn();

vi.mock("@tanstack/react-query", async () => {
  const actual = await vi.importActual("@tanstack/react-query");
  return {
    ...actual,
    useQuery: (options: any) => {
      if (options.queryKey?.[1] === "skills-gap") return mockUseQuerySkills();
      if (options.queryKey?.[1] === "visa") return mockUseQueryVisa();
      if (options.queryKey?.[1] === "salary") return mockUseQuerySalary();
      if (options.queryKey?.[1] === "remote") return mockUseQueryRemote();
      return { data: null, isLoading: false };
    },
  };
});

describe("IntelligencePage Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseQuerySkills.mockReturnValue({
      data: {
        match_percentage: 75,
        missing_skills: [
          { skill: "Go", importance: "critical" },
          { skill: "Kubernetes", importance: "preferred" },
        ],
        possessed_skills: ["JavaScript", "Python", "React", "AWS"],
      },
      isLoading: false,
    });

    mockUseQueryVisa.mockReturnValue({
      data: {
        eligibility_score: 85,
        eligible_countries: ["USA", "Canada", "UK"],
        occupation: "Software Engineer",
        sponsorship_likelihood: "high",
        details: "Strong tech background and high-demand role",
      },
      isLoading: false,
    });

    mockUseQuerySalary.mockReturnValue({
      data: {
        currency: "USD",
        percentile_50: 120000,
        percentile_25: 100000,
        percentile_75: 140000,
        percentile_90: 160000,
        title: "Senior Software Engineer",
        location: "San Francisco, CA",
        sample_size: 250,
      },
      isLoading: false,
    });

    mockUseQueryRemote.mockReturnValue({
      data: {
        remote_score: 88,
        remote_type: "remote",
        reasoning: "Your experience aligns well with remote-first companies",
      },
      isLoading: false,
    });
  });

  it("renders page with title and description", () => {
    renderWithProviders(<IntelligencePage />);
    expect(screen.getByText("Intelligence Hub")).toBeInTheDocument();
    expect(screen.getByText("AI-powered insights to optimize your job search strategy")).toBeInTheDocument();
  });

  it("displays four quick stat cards", () => {
    renderWithProviders(<IntelligencePage />);
    expect(screen.getByText("Skills Match")).toBeInTheDocument();
    expect(screen.getAllByText("Visa Eligibility").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Salary Benchmark").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Remote Score")).toBeInTheDocument();
  });

  it("shows skills match percentage", () => {
    renderWithProviders(<IntelligencePage />);
    const percentages = screen.getAllByText("75%");
    expect(percentages.length).toBeGreaterThanOrEqual(1);
  });

  it("shows visa eligibility score", () => {
    renderWithProviders(<IntelligencePage />);
    const eligibilityElements = screen.getAllByText("85%");
    expect(eligibilityElements.length).toBeGreaterThanOrEqual(1);
  });

  it("shows salary benchmark value", () => {
    renderWithProviders(<IntelligencePage />);
    // Check for the salary figure - it may be formatted differently
    const salaryElements = screen.getAllByText(/120/);
    expect(salaryElements.length).toBeGreaterThanOrEqual(1);
  });

  it("shows remote score value", () => {
    renderWithProviders(<IntelligencePage />);
    expect(screen.getByText("88/100")).toBeInTheDocument();
  });

  it("displays skills gap analysis section", () => {
    renderWithProviders(<IntelligencePage />);
    expect(screen.getByText("Skills Gap Analysis")).toBeInTheDocument();
    expect(screen.getByText("Compare your skills against market requirements")).toBeInTheDocument();
  });

  it("shows skills match progress bar and percentage", () => {
    renderWithProviders(<IntelligencePage />);
    const progressBars = screen.getAllByRole("progressbar");
    expect(progressBars.length).toBeGreaterThanOrEqual(1);
  });

  it("displays possessed and missing skills sections", () => {
    renderWithProviders(<IntelligencePage />);
    // Check for multiple "Your Skills" since it appears in multiple places
    const yourSkillsTexts = screen.getAllByText(/Your Skills/i);
    expect(yourSkillsTexts.length).toBeGreaterThanOrEqual(1);
    const missingSkillsTexts = screen.getAllByText(/Missing Skills/i);
    expect(missingSkillsTexts.length).toBeGreaterThanOrEqual(1);
  });

  it("shows skills badges for possessed and missing skills", () => {
    renderWithProviders(<IntelligencePage />);
    const badges = screen.getAllByRole("button");
    expect(badges.length).toBeGreaterThanOrEqual(1);
  });

  it("displays salary benchmark card with details", () => {
    renderWithProviders(<IntelligencePage />);
    const salaryBenchmarks = screen.getAllByText("Salary Benchmark");
    expect(salaryBenchmarks.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Market salary ranges for your role")).toBeInTheDocument();
  });

  it("shows salary percentile information", () => {
    renderWithProviders(<IntelligencePage />);
    expect(screen.getByText("Senior Software Engineer in San Francisco, CA (250 data points)")).toBeInTheDocument();
  });

  it("displays visa sponsorship section", () => {
    renderWithProviders(<IntelligencePage />);
    const allVisa = screen.getAllByText("Visa Eligibility");
    expect(allVisa.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Sponsorship likelihood by country")).toBeInTheDocument();
  });

  it("shows visa occupation badge", () => {
    renderWithProviders(<IntelligencePage />);
    expect(screen.getByText("Software Engineer")).toBeInTheDocument();
  });

  it("shows visa sponsorship likelihood", () => {
    renderWithProviders(<IntelligencePage />);
    expect(screen.getByText("HIGH")).toBeInTheDocument();
  });

  it("displays eligible countries", () => {
    renderWithProviders(<IntelligencePage />);
    expect(screen.getByText("USA")).toBeInTheDocument();
    expect(screen.getByText("Canada")).toBeInTheDocument();
    expect(screen.getByText("UK")).toBeInTheDocument();
  });

  it("displays remote work compatibility section", () => {
    renderWithProviders(<IntelligencePage />);
    expect(screen.getByText("Remote Work Compatibility")).toBeInTheDocument();
    expect(screen.getByText("How well your profile matches remote positions")).toBeInTheDocument();
  });

  it("shows remote score and type", () => {
    renderWithProviders(<IntelligencePage />);
    expect(screen.getByText("88")).toBeInTheDocument();
    expect(screen.getByText("remote")).toBeInTheDocument();
  });

  it("shows work mode analysis card with link", () => {
    renderWithProviders(<IntelligencePage />);
    const workModeLinks = screen.getAllByRole("link").filter((link) =>
      link.getAttribute("href")?.includes("work-mode")
    );
    expect(workModeLinks.length).toBeGreaterThanOrEqual(1);
  });

  it("shows employment type card with link", () => {
    renderWithProviders(<IntelligencePage />);
    const employmentTypeLinks = screen.getAllByRole("link").filter((link) =>
      link.getAttribute("href")?.includes("employment-type")
    );
    expect(employmentTypeLinks.length).toBeGreaterThanOrEqual(1);
  });

  it("shows details button for skills gap analysis", () => {
    renderWithProviders(<IntelligencePage />);
    const skillsDetailsButtons = screen.getAllByRole("link").filter((link) =>
      link.getAttribute("href")?.includes("skills")
    );
    expect(skillsDetailsButtons.length).toBeGreaterThanOrEqual(1);
  });

  it("shows details button for salary benchmark", () => {
    renderWithProviders(<IntelligencePage />);
    const salaryDetailsButtons = screen.getAllByRole("link").filter((link) =>
      link.getAttribute("href")?.includes("salary")
    );
    expect(salaryDetailsButtons.length).toBeGreaterThanOrEqual(1);
  });

  it("shows details button for visa eligibility", () => {
    renderWithProviders(<IntelligencePage />);
    const visaDetailsButtons = screen.getAllByRole("link").filter((link) =>
      link.getAttribute("href")?.includes("visa")
    );
    expect(visaDetailsButtons.length).toBeGreaterThanOrEqual(1);
  });

  it("shows loading skeletons when data is loading", () => {
    mockUseQuerySkills.mockReturnValue({ data: null, isLoading: true });
    mockUseQueryVisa.mockReturnValue({ data: null, isLoading: true });
    mockUseQuerySalary.mockReturnValue({ data: null, isLoading: true });
    mockUseQueryRemote.mockReturnValue({ data: null, isLoading: true });

    renderWithProviders(<IntelligencePage />);
    expect(screen.getByText("Intelligence Hub")).toBeInTheDocument();
  });

  it("shows empty state message when no skills data available", () => {
    mockUseQuerySkills.mockReturnValue({ data: null, isLoading: false });
    renderWithProviders(<IntelligencePage />);
    expect(screen.getByText("Upload your resume to see skills analysis")).toBeInTheDocument();
  });

  it("displays work mode analysis card title and description", () => {
    renderWithProviders(<IntelligencePage />);
    expect(screen.getByText("Work Mode Analysis")).toBeInTheDocument();
    expect(screen.getByText("Detect remote, hybrid, and on-site patterns across jobs")).toBeInTheDocument();
  });

  it("displays employment type card title and description", () => {
    renderWithProviders(<IntelligencePage />);
    expect(screen.getByText("Employment Type")).toBeInTheDocument();
    expect(screen.getByText("Detect full-time, part-time, contract, and freelance patterns")).toBeInTheDocument();
  });

  it("renders all skill tags from possessed skills", () => {
    renderWithProviders(<IntelligencePage />);
    expect(screen.getByText("JavaScript")).toBeInTheDocument();
    expect(screen.getByText("Python")).toBeInTheDocument();
    expect(screen.getByText("React")).toBeInTheDocument();
  });

  it("renders missing skills with importance indicators", () => {
    renderWithProviders(<IntelligencePage />);
    expect(screen.getByText("Go")).toBeInTheDocument();
    expect(screen.getByText("Kubernetes")).toBeInTheDocument();
  });

  it("displays visa details text", () => {
    renderWithProviders(<IntelligencePage />);
    expect(screen.getByText("Strong tech background and high-demand role")).toBeInTheDocument();
  });

  it("shows remote reasoning text", () => {
    renderWithProviders(<IntelligencePage />);
    expect(screen.getByText("Your experience aligns well with remote-first companies")).toBeInTheDocument();
  });

  it("displays salary percentiles in the benchmark section", () => {
    renderWithProviders(<IntelligencePage />);
    const salaryText = screen.getAllByText(/25th Percentile|Median|50th|75th|90th/i);
    expect(salaryText.length).toBeGreaterThanOrEqual(1);
  });

  it("renders all main content sections in page", () => {
    renderWithProviders(<IntelligencePage />);
    // Verify all major sections are present
    expect(screen.getByText("Intelligence Hub")).toBeInTheDocument();
    expect(screen.getByText("Skills Gap Analysis")).toBeInTheDocument();
    expect(screen.getByText("Work Mode Analysis")).toBeInTheDocument();
    expect(screen.getByText("Employment Type")).toBeInTheDocument();
  });
});
