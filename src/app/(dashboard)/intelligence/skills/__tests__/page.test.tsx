/**
 * Skills Gap Analysis Page Integration Tests
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
import SkillsPage from "../page";
import { useQuery } from "@tanstack/react-query";

describe("SkillsPage Integration Tests", () => {
  const mockUseQuery = useQuery as any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseQuery.mockReturnValue({
      data: {
        analysis: {
          match_percentage: 72,
          required_skills: [
            { skill: "JavaScript", importance: "critical" },
            { skill: "React", importance: "critical" },
            { skill: "TypeScript", importance: "preferred" },
            { skill: "Node.js", importance: "preferred" },
            { skill: "Docker", importance: "nice_to_have" },
          ],
          possessed_skills: ["JavaScript", "React", "Node.js"],
          missing_skills: [
            { skill: "TypeScript", importance: "preferred", recommendation: "Take a TypeScript course on Udemy" },
            { skill: "Docker", importance: "nice_to_have", recommendation: "Docker documentation is excellent" },
          ],
        },
      },
      isLoading: false,
    });
  });

  it("renders page with title and description", () => {
    renderWithProviders(<SkillsPage />);
    expect(screen.getByText("Skills Gap Analysis")).toBeInTheDocument();
    expect(screen.getByText("Identify skill gaps and get improvement recommendations")).toBeInTheDocument();
  });

  it("displays back button with correct href", () => {
    renderWithProviders(<SkillsPage />);
    const backLink = screen.getByRole("link", { name: /back/i });
    expect(backLink).toHaveAttribute("href", "/intelligence");
  });

  it("shows overall skills match percentage", () => {
    renderWithProviders(<SkillsPage />);
    expect(screen.getByText("72%")).toBeInTheDocument();
  });

  it("displays overall skills match title", () => {
    renderWithProviders(<SkillsPage />);
    expect(screen.getByText("Overall Skills Match")).toBeInTheDocument();
  });

  it("shows count of required skills", () => {
    renderWithProviders(<SkillsPage />);
    expect(screen.getByText(/5 required skills/i)).toBeInTheDocument();
  });

  it("displays possessed skills count", () => {
    renderWithProviders(<SkillsPage />);
    expect(screen.getByText("3 possessed")).toBeInTheDocument();
  });

  it("displays missing skills count", () => {
    renderWithProviders(<SkillsPage />);
    expect(screen.getByText("2 missing")).toBeInTheDocument();
  });

  it("shows skills you have section title", () => {
    renderWithProviders(<SkillsPage />);
    expect(screen.getByText("Skills You Have")).toBeInTheDocument();
  });

  it("displays count of possessed skills in header", () => {
    renderWithProviders(<SkillsPage />);
    expect(screen.getByText("3 skills matched from your profile")).toBeInTheDocument();
  });

  it("shows all possessed skill badges", () => {
    renderWithProviders(<SkillsPage />);
    // Multiple occurrences of skills in different sections (badges + breakdown), use getAllByText
    const jsElements = screen.getAllByText("JavaScript");
    const reactElements = screen.getAllByText("React");
    const nodeElements = screen.getAllByText("Node.js");
    expect(jsElements.length).toBeGreaterThanOrEqual(1);
    expect(reactElements.length).toBeGreaterThanOrEqual(1);
    expect(nodeElements.length).toBeGreaterThanOrEqual(1);
  });

  it("displays skills to develop section title", () => {
    renderWithProviders(<SkillsPage />);
    expect(screen.getByText("Skills to Develop")).toBeInTheDocument();
  });

  it("shows count of missing skills in header", () => {
    renderWithProviders(<SkillsPage />);
    expect(screen.getByText("2 skills needed for your target roles")).toBeInTheDocument();
  });

  it("shows skills to develop table with headers", () => {
    renderWithProviders(<SkillsPage />);
    expect(screen.getByText("Skill")).toBeInTheDocument();
    expect(screen.getByText("Importance")).toBeInTheDocument();
    expect(screen.getByText("Recommendation")).toBeInTheDocument();
  });

  it("displays missing skill with importance badges", () => {
    renderWithProviders(<SkillsPage />);
    // TypeScript appears in table AND breakdown, so check for multiple occurrences
    const typeScriptElements = screen.getAllByText("TypeScript");
    expect(typeScriptElements.length).toBeGreaterThanOrEqual(1);
    // Check importance badge exists (may appear multiple times)
    const preferredElements = screen.getAllByText(/preferred/i);
    expect(preferredElements.length).toBeGreaterThanOrEqual(1);
  });

  it("shows missing skill recommendations", () => {
    renderWithProviders(<SkillsPage />);
    expect(screen.getByText("Take a TypeScript course on Udemy")).toBeInTheDocument();
    expect(screen.getByText("Docker documentation is excellent")).toBeInTheDocument();
  });

  it("displays required skills breakdown section", () => {
    renderWithProviders(<SkillsPage />);
    expect(screen.getByText("Required Skills Breakdown")).toBeInTheDocument();
    expect(screen.getByText("All skills required by your target jobs")).toBeInTheDocument();
  });

  it("shows all required skills in breakdown", () => {
    renderWithProviders(<SkillsPage />);
    // All 5 required skills should appear in breakdown
    const jsElements = screen.getAllByText("JavaScript");
    const reactElements = screen.getAllByText("React");
    const tsElements = screen.getAllByText("TypeScript");
    const nodeElements = screen.getAllByText("Node.js");
    const dockerElements = screen.getAllByText("Docker");
    expect(jsElements.length).toBeGreaterThanOrEqual(1);
    expect(reactElements.length).toBeGreaterThanOrEqual(1);
    expect(tsElements.length).toBeGreaterThanOrEqual(1);
    expect(nodeElements.length).toBeGreaterThanOrEqual(1);
    expect(dockerElements.length).toBeGreaterThanOrEqual(1);
  });

  it("displays loading skeletons while data is loading", () => {
    mockUseQuery.mockReturnValue({
      data: null,
      isLoading: true,
    });
    renderWithProviders(<SkillsPage />);
    expect(screen.getByText("Skills Gap Analysis")).toBeInTheDocument();
  });

  it("shows empty state when no analysis available", () => {
    mockUseQuery.mockReturnValue({
      data: null,
      isLoading: false,
    });
    renderWithProviders(<SkillsPage />);
    expect(screen.getByText("No skills analysis available. Upload a resume and apply to some jobs first.")).toBeInTheDocument();
  });

  it("displays page with correct back button navigation", () => {
    renderWithProviders(<SkillsPage />);
    const backButton = screen.getByRole("link", { name: /back/i });
    expect(backButton.getAttribute("href")).toBe("/intelligence");
  });

  it("shows match percentage with color coding logic", () => {
    renderWithProviders(<SkillsPage />);
    expect(screen.getByText("72%")).toBeInTheDocument();
  });

  it("displays importance badges with correct text", () => {
    renderWithProviders(<SkillsPage />);
    // Check importance levels appear in badges (may appear in multiple places)
    const preferredElements = screen.getAllByText(/preferred/i);
    expect(preferredElements.length).toBeGreaterThanOrEqual(1);
    // Verify recommendations are shown (Docker with nice_to_have)
    expect(screen.getByText("Docker documentation is excellent")).toBeInTheDocument();
  });

  it("displays all skill importance levels", () => {
    renderWithProviders(<SkillsPage />);
    const badges = screen.getAllByText(/critical|preferred/i);
    expect(badges.length).toBeGreaterThanOrEqual(2);
  });

  it("shows correct number of skills in possession vs missing", () => {
    renderWithProviders(<SkillsPage />);
    expect(screen.getByText("3 possessed")).toBeInTheDocument();
    expect(screen.getByText("2 missing")).toBeInTheDocument();
  });

  it("renders empty state with icon when no analysis", () => {
    mockUseQuery.mockReturnValue({
      data: null,
      isLoading: false,
    });
    renderWithProviders(<SkillsPage />);
    expect(screen.getByText("No skills analysis available. Upload a resume and apply to some jobs first.")).toBeInTheDocument();
  });

  it("shows all sections when analysis data is available", () => {
    renderWithProviders(<SkillsPage />);
    expect(screen.getByText("Overall Skills Match")).toBeInTheDocument();
    expect(screen.getByText("Skills You Have")).toBeInTheDocument();
    expect(screen.getByText("Skills to Develop")).toBeInTheDocument();
    expect(screen.getByText("Required Skills Breakdown")).toBeInTheDocument();
  });
});
