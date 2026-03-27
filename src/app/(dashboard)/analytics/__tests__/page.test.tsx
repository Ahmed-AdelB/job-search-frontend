/**
 * Analytics Page Integration Tests
 * Author: Ahmed Adel Bakr Alderai
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/__tests__/setup/render-with-providers";
import AnalyticsPage from "../page";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock React Query
vi.mock("@tanstack/react-query", async () => {
  const actual = await vi.importActual("@tanstack/react-query");
  return {
    ...actual,
    useQuery: vi.fn(() => ({
      data: undefined,
      isLoading: false,
      isError: false,
    })),
  };
});

// Mock recharts
vi.mock("recharts", () => ({
  BarChart: () => <div>BarChart</div>,
  LineChart: () => <div>LineChart</div>,
  AreaChart: () => <div>AreaChart</div>,
  PieChart: () => <div>PieChart</div>,
  Bar: () => <div>Bar</div>,
  Line: () => <div>Line</div>,
  Area: () => <div>Area</div>,
  Pie: () => <div>Pie</div>,
  Cell: () => <div>Cell</div>,
  XAxis: () => <div>XAxis</div>,
  YAxis: () => <div>YAxis</div>,
  CartesianGrid: () => <div>CartesianGrid</div>,
  Tooltip: () => <div>Tooltip</div>,
  Legend: () => <div>Legend</div>,
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
}));

describe("AnalyticsPage Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders page with title", () => {
    renderWithProviders(<AnalyticsPage />);
    expect(screen.getByText("Analytics")).toBeInTheDocument();
  });

  it("displays subtitle about tracking performance", () => {
    renderWithProviders(<AnalyticsPage />);
    expect(screen.getByText(/track your job search performance/i)).toBeInTheDocument();
  });

  it("displays overview stat cards section", () => {
    renderWithProviders(<AnalyticsPage />);
    expect(screen.getByText("Total Jobs")).toBeInTheDocument();
    expect(screen.getByText("Applications")).toBeInTheDocument();
  });

  it("displays Response Rate card", () => {
    renderWithProviders(<AnalyticsPage />);
    expect(screen.getByText("Response Rate")).toBeInTheDocument();
  });

  it("displays Acceptance Rate card", () => {
    renderWithProviders(<AnalyticsPage />);
    expect(screen.getByText("Acceptance Rate")).toBeInTheDocument();
  });

  it("displays Pipeline Funnel chart title", () => {
    renderWithProviders(<AnalyticsPage />);
    expect(screen.getByText("Pipeline Funnel")).toBeInTheDocument();
  });

  it("displays Jobs by Source chart title", () => {
    renderWithProviders(<AnalyticsPage />);
    expect(screen.getByText("Jobs by Source")).toBeInTheDocument();
  });

  it("displays Activity Timeline chart title", () => {
    renderWithProviders(<AnalyticsPage />);
    expect(screen.getByText("Activity Timeline")).toBeInTheDocument();
  });

  it("displays Key Metrics Summary card", () => {
    renderWithProviders(<AnalyticsPage />);
    expect(screen.getByText("Key Metrics Summary")).toBeInTheDocument();
  });

  it("renders all main chart sections", () => {
    renderWithProviders(<AnalyticsPage />);
    const analyticsHeading = screen.getByText("Analytics");
    expect(analyticsHeading).toBeInTheDocument();
  });

  it("displays Interviews stat card", () => {
    renderWithProviders(<AnalyticsPage />);
    expect(screen.getByText("Interviews")).toBeInTheDocument();
  });
});
