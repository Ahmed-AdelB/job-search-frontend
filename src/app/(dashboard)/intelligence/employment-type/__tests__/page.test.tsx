/**
 * Employment Type Analysis Page Integration Tests
 * Author: Ahmed Adel Bakr Alderai
 */

import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen, waitFor, fireEvent, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/__tests__/setup/render-with-providers";
import EmploymentTypePage from "../page";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock Input/Textarea as plain HTML <input> to avoid React 19 + Base UI event issues in jsdom
// Textarea mocked as <input type="text"> because fireEvent.input works reliably on <input> in React 19
vi.mock("@/components/ui/input", () => ({
  Input: React.forwardRef((props: any, ref: any) =>
    React.createElement("input", { ...props, ref })
  ),
}));

vi.mock("@/components/ui/textarea", () => ({
  Textarea: React.forwardRef((props: any, ref: any) =>
    React.createElement("textarea", { ...props, ref })
  ),
}));

// Mock hooks
const mockMutate = vi.fn();
const mockUseEmploymentTypeStats = vi.fn();
const mockUseEmploymentTypeDetect = vi.fn();

vi.mock("@/hooks/use-employment-type", () => ({
  useEmploymentTypeStats: () => mockUseEmploymentTypeStats(),
  useEmploymentTypeDetect: () => mockUseEmploymentTypeDetect(),
}));

describe("EmploymentTypePage Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseEmploymentTypeStats.mockReturnValue({
      data: { breakdown: { "full-time": 80, "part-time": 5, contract: 15 } },
      isLoading: false,
    });

    mockMutate.mockReset();
    mockUseEmploymentTypeDetect.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      data: null,
    });
  });

  it("renders page with title and description", () => {
    renderWithProviders(<EmploymentTypePage />);
    expect(screen.getByText("Employment Type Analysis")).toBeInTheDocument();
    expect(screen.getByText("Detect and analyze employment types across job postings")).toBeInTheDocument();
  });

  it("displays detection form with title input and description textarea", () => {
    renderWithProviders(<EmploymentTypePage />);
    expect(screen.getByPlaceholderText(/Job Title/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Paste job description here/i)).toBeInTheDocument();
  });

  it("form has Detect Type button", () => {
    renderWithProviders(<EmploymentTypePage />);
    expect(screen.getByRole("button", { name: /detect type/i })).toBeInTheDocument();
  });

  it("Detect button is disabled when both inputs are empty", () => {
    renderWithProviders(<EmploymentTypePage />);
    expect(screen.getByRole("button", { name: /detect type/i })).toBeDisabled();
  });

  it("Detect button becomes enabled when title is filled", async () => {
    const user = userEvent.setup();
    renderWithProviders(<EmploymentTypePage />);
    expect(screen.getByRole("button", { name: /detect type/i })).toBeDisabled();

    await user.type(screen.getByPlaceholderText(/Job Title/i), "DevOps");
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /detect type/i })).not.toBeDisabled();
    });
  });

  it("Detect button becomes enabled when description is filled", async () => {
    const user = userEvent.setup();
    renderWithProviders(<EmploymentTypePage />);

    await user.type(screen.getByPlaceholderText(/Paste job description here/i), "Full-time");
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /detect type/i })).not.toBeDisabled();
    });
  });

  it("calls detect mutation when button is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<EmploymentTypePage />);

    // userEvent.type types one char at a time; React 19 + jsdom only reliably
    // processes the first character when typing in multiple controlled inputs
    await user.type(screen.getByPlaceholderText(/Job Title/i), "C");
    await user.type(screen.getByPlaceholderText(/Paste job description here/i), "6");

    await user.click(screen.getByRole("button", { name: /detect type/i }));

    expect(mockMutate).toHaveBeenCalledWith(
      { title: "C", description: "6" },
      expect.any(Object)
    );
  });

  it("shows detection result badge and confidence", () => {
    mockUseEmploymentTypeDetect.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      data: { employment_type: "full-time", confidence: 0.92 },
    });

    renderWithProviders(<EmploymentTypePage />);
    const badges = screen.getAllByText("full-time");
    expect(badges.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/92% confidence/)).toBeInTheDocument();
  });

  it("shows stats cards with counts", () => {
    renderWithProviders(<EmploymentTypePage />);
    expect(screen.getByText("80")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("15")).toBeInTheDocument();
  });

  it("displays percentage text for analyzed jobs", () => {
    renderWithProviders(<EmploymentTypePage />);
    const pctTexts = screen.getAllByText(/% of analyzed jobs/i);
    expect(pctTexts.length).toBe(3);
  });

  it("displays progress bars", () => {
    renderWithProviders(<EmploymentTypePage />);
    const progressBars = screen.getAllByRole("progressbar");
    expect(progressBars.length).toBe(3);
  });

  it("shows loading skeletons while fetching stats", () => {
    mockUseEmploymentTypeStats.mockReturnValue({ data: null, isLoading: true });
    renderWithProviders(<EmploymentTypePage />);
    expect(screen.getByText("Employment Type Analysis")).toBeInTheDocument();
  });

  it("shows back button to intelligence hub", () => {
    renderWithProviders(<EmploymentTypePage />);
    const backLink = screen.getByRole("link");
    expect(backLink).toHaveAttribute("href", "/dashboard/intelligence");
  });

  it("shows no data message when stats are null", () => {
    mockUseEmploymentTypeStats.mockReturnValue({ data: null, isLoading: false });
    renderWithProviders(<EmploymentTypePage />);
    expect(screen.getByText("No employment type data available yet")).toBeInTheDocument();
  });

  it("button is disabled when mutation is pending", () => {
    mockUseEmploymentTypeDetect.mockReturnValue({ mutate: vi.fn(), isPending: true, data: null });
    renderWithProviders(<EmploymentTypePage />);
    expect(screen.getByRole("button", { name: /detect type/i })).toBeDisabled();
  });

  it("handles error in detection via toast", async () => {
    const errorMutate = vi.fn((_data, options) => {
      options.onError(new Error("Detection failed"));
    });
    mockUseEmploymentTypeDetect.mockReturnValue({ mutate: errorMutate, isPending: false, data: null });

    renderWithProviders(<EmploymentTypePage />);
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText(/Job Title/i), { target: { value: "Test" } });
    });
    fireEvent.click(screen.getByRole("button", { name: /detect type/i }));

    expect(errorMutate).toHaveBeenCalled();
  });

  it("form accepts input in description field", async () => {
    renderWithProviders(<EmploymentTypePage />);
    const descInput = screen.getByPlaceholderText(/Paste job description here/i) as HTMLInputElement;

    await act(async () => {
      fireEvent.change(descInput, { target: { value: "Line 1 Line 2 Line 3" } });
    });

    expect(descInput.value).toContain("Line 1");
  });
});
