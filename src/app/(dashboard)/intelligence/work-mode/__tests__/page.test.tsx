/**
 * Work Mode Analysis Page Integration Tests
 * Author: Ahmed Adel Bakr Alderai
 */

import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen, waitFor, fireEvent, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/__tests__/setup/render-with-providers";
import WorkModePage from "../page";

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
const mockUseWorkModeStats = vi.fn();
const mockUseWorkModeDetect = vi.fn();

vi.mock("@/hooks/use-work-mode", () => ({
  useWorkModeStats: () => mockUseWorkModeStats(),
  useWorkModeDetect: () => mockUseWorkModeDetect(),
}));

describe("WorkModePage Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseWorkModeStats.mockReturnValue({
      data: { remote_count: 60, hybrid_count: 25, onsite_count: 15 },
      isLoading: false,
    });

    mockMutate.mockReset();
    mockUseWorkModeDetect.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      data: null,
    });
  });

  it("renders page with title and description", () => {
    renderWithProviders(<WorkModePage />);
    expect(screen.getByText("Work Mode Analysis")).toBeInTheDocument();
    expect(screen.getByText("Detect and analyze remote, hybrid, and on-site work patterns")).toBeInTheDocument();
  });

  it("displays detection form with title input and description textarea", () => {
    renderWithProviders(<WorkModePage />);
    expect(screen.getByPlaceholderText(/Job Title/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Paste job description here/i)).toBeInTheDocument();
  });

  it("form has Detect Work Mode button", () => {
    renderWithProviders(<WorkModePage />);
    expect(screen.getByRole("button", { name: /detect work mode/i })).toBeInTheDocument();
  });

  it("Detect button is disabled when both inputs are empty", () => {
    renderWithProviders(<WorkModePage />);
    expect(screen.getByRole("button", { name: /detect work mode/i })).toBeDisabled();
  });

  it("Detect button becomes enabled when title is filled", async () => {
    const user = userEvent.setup();
    renderWithProviders(<WorkModePage />);
    expect(screen.getByRole("button", { name: /detect work mode/i })).toBeDisabled();

    await user.type(screen.getByPlaceholderText(/Job Title/i), "SWE");
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /detect work mode/i })).not.toBeDisabled();
    });
  });

  it("Detect button becomes enabled when description is filled", async () => {
    const user = userEvent.setup();
    renderWithProviders(<WorkModePage />);

    await user.type(screen.getByPlaceholderText(/Paste job description here/i), "Remote");
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /detect work mode/i })).not.toBeDisabled();
    });
  });

  it("calls detect mutation when button is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<WorkModePage />);

    // userEvent.type types one char at a time; React 19 + jsdom only reliably
    // processes the first character when typing in multiple controlled inputs
    await user.type(screen.getByPlaceholderText(/Job Title/i), "R");
    await user.type(screen.getByPlaceholderText(/Paste job description here/i), "F");

    await user.click(screen.getByRole("button", { name: /detect work mode/i }));

    expect(mockMutate).toHaveBeenCalledWith(
      { title: "R", description: "F" },
      expect.any(Object)
    );
  });

  it("shows detection result badge and confidence", () => {
    mockUseWorkModeDetect.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      data: { work_mode: "remote", confidence: 0.95 },
    });

    renderWithProviders(<WorkModePage />);
    const remoteBadges = screen.getAllByText("remote");
    expect(remoteBadges.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/95% confidence/)).toBeInTheDocument();
  });

  it("shows stats cards with counts", () => {
    renderWithProviders(<WorkModePage />);
    expect(screen.getByText("60")).toBeInTheDocument();
    expect(screen.getByText("25")).toBeInTheDocument();
    expect(screen.getByText("15")).toBeInTheDocument();
  });

  it("displays percentage text for analyzed jobs", () => {
    renderWithProviders(<WorkModePage />);
    const pctTexts = screen.getAllByText(/% of analyzed jobs/i);
    expect(pctTexts.length).toBe(3);
  });

  it("displays progress bars", () => {
    renderWithProviders(<WorkModePage />);
    const progressBars = screen.getAllByRole("progressbar");
    expect(progressBars.length).toBe(3);
  });

  it("shows loading skeletons while fetching stats", () => {
    mockUseWorkModeStats.mockReturnValue({ data: null, isLoading: true });
    renderWithProviders(<WorkModePage />);
    expect(screen.getByText("Work Mode Analysis")).toBeInTheDocument();
  });

  it("shows back button to intelligence hub", () => {
    renderWithProviders(<WorkModePage />);
    const backLink = screen.getByRole("link");
    expect(backLink).toHaveAttribute("href", "/dashboard/intelligence");
  });

  it("shows no data message when stats are null", () => {
    mockUseWorkModeStats.mockReturnValue({ data: null, isLoading: false });
    renderWithProviders(<WorkModePage />);
    expect(screen.getByText("No work mode data available yet")).toBeInTheDocument();
  });

  it("button is disabled when mutation is pending", () => {
    mockUseWorkModeDetect.mockReturnValue({ mutate: vi.fn(), isPending: true, data: null });
    renderWithProviders(<WorkModePage />);
    expect(screen.getByRole("button", { name: /detect work mode/i })).toBeDisabled();
  });

  it("handles error in detection via toast", async () => {
    const errorMutate = vi.fn((_data, options) => {
      options.onError(new Error("Detection failed"));
    });
    mockUseWorkModeDetect.mockReturnValue({ mutate: errorMutate, isPending: false, data: null });

    renderWithProviders(<WorkModePage />);
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText(/Job Title/i), { target: { value: "Test" } });
    });
    fireEvent.click(screen.getByRole("button", { name: /detect work mode/i }));

    expect(errorMutate).toHaveBeenCalled();
  });
});
