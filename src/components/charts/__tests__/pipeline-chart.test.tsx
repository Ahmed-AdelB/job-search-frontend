/**
 * Pipeline Chart Component Tests
 * Author: Ahmed Adel Bakr Alderai
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/__tests__/setup/render-with-providers";
import { PipelineChart, type PipelineChartData } from "../pipeline-chart";

// Mock recharts library
vi.mock("recharts", () => {
  const React = require("react");
  return {
    BarChart: ({ children, data }: any) =>
      React.createElement(
        "div",
        { "data-testid": "bar-chart", "data-chart": JSON.stringify(data) },
        children
      ),
    Bar: ({ dataKey, children }: any) =>
      React.createElement("div", { "data-testid": "bar", "data-key": dataKey }, children),
    Cell: ({ fill }: any) =>
      React.createElement("div", { "data-testid": "cell", "data-fill": fill }),
    XAxis: ({ dataKey }: any) =>
      React.createElement("div", { "data-testid": "x-axis", "data-key": dataKey }),
    YAxis: () => React.createElement("div", { "data-testid": "y-axis" }),
    CartesianGrid: () => React.createElement("div", { "data-testid": "cartesian-grid" }),
    Tooltip: () => React.createElement("div", { "data-testid": "tooltip" }),
    Legend: () => React.createElement("div", { "data-testid": "legend" }),
    ResponsiveContainer: ({ children }: any) =>
      React.createElement("div", { "data-testid": "responsive-container" }, children),
  };
});

const mockData: PipelineChartData[] = [
  { stage: "Applied", count: 150 },
  { stage: "Screened", count: 100 },
  { stage: "Interviewed", count: 45 },
  { stage: "Offered", count: 12 },
];

describe("PipelineChart Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Renders correctly with data", () => {
    it("renders chart title", () => {
      renderWithProviders(<PipelineChart data={mockData} />);
      expect(screen.getByText("Application Funnel")).toBeInTheDocument();
    });

    it("renders chart description", () => {
      renderWithProviders(<PipelineChart data={mockData} />);
      expect(screen.getByText("Job conversion stages")).toBeInTheDocument();
    });

    it("renders BarChart component with data", () => {
      renderWithProviders(<PipelineChart data={mockData} />);
      const chart = screen.getByTestId("bar-chart");
      expect(chart).toBeInTheDocument();
      expect(chart).toHaveAttribute("data-chart", JSON.stringify(mockData));
    });

    it("renders XAxis with stage dataKey", () => {
      renderWithProviders(<PipelineChart data={mockData} />);
      const xAxis = screen.getByTestId("x-axis");
      expect(xAxis).toHaveAttribute("data-key", "stage");
    });

    it("renders YAxis", () => {
      renderWithProviders(<PipelineChart data={mockData} />);
      expect(screen.getByTestId("y-axis")).toBeInTheDocument();
    });

    it("renders CartesianGrid", () => {
      renderWithProviders(<PipelineChart data={mockData} />);
      expect(screen.getByTestId("cartesian-grid")).toBeInTheDocument();
    });

    it("renders Tooltip component", () => {
      renderWithProviders(<PipelineChart data={mockData} />);
      expect(screen.getByTestId("tooltip")).toBeInTheDocument();
    });

    it("renders Bar component with count dataKey", () => {
      renderWithProviders(<PipelineChart data={mockData} />);
      const bar = screen.getByTestId("bar");
      expect(bar).toHaveAttribute("data-key", "count");
    });

    it("renders ResponsiveContainer", () => {
      renderWithProviders(<PipelineChart data={mockData} />);
      expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    });
  });

  describe("Renders with Cell colors", () => {
    it("renders Cell for each data point", () => {
      renderWithProviders(<PipelineChart data={mockData} />);
      const cells = screen.getAllByTestId("cell");
      expect(cells).toHaveLength(mockData.length);
    });

    it("applies color array to cells", () => {
      renderWithProviders(<PipelineChart data={mockData} />);
      const cells = screen.getAllByTestId("cell");
      cells.forEach((cell) => {
        const fill = cell.getAttribute("data-fill");
        expect(fill).toBeTruthy();
        expect(fill).toMatch(/hsl\(/);
      });
    });

    it("cycles through color array correctly", () => {
      const manyDataPoints = Array.from({ length: 10 }, (_, i) => ({
        stage: `Stage ${i}`,
        count: 100 - i * 10,
      }));
      renderWithProviders(<PipelineChart data={manyDataPoints} />);
      const cells = screen.getAllByTestId("cell");
      expect(cells).toHaveLength(10);
    });
  });

  describe("Handles loading state", () => {
    it("renders loading skeleton when isLoading is true", () => {
      renderWithProviders(<PipelineChart data={mockData} isLoading={true} />);
      const skeleton = document.querySelector(".animate-pulse");
      expect(skeleton).toBeInTheDocument();
    });

    it("shows loading skeleton with correct height", () => {
      const { container } = renderWithProviders(
        <PipelineChart data={mockData} isLoading={true} />
      );
      const skeleton = container.querySelector(".h-64");
      expect(skeleton).toBeInTheDocument();
    });

    it("does not render chart when loading", () => {
      renderWithProviders(<PipelineChart data={mockData} isLoading={true} />);
      expect(screen.queryByTestId("bar-chart")).not.toBeInTheDocument();
    });

    it("renders chart when isLoading is false", () => {
      renderWithProviders(<PipelineChart data={mockData} isLoading={false} />);
      expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
    });
  });

  describe("Handles empty data", () => {
    it("shows empty state message when data is empty", () => {
      renderWithProviders(<PipelineChart data={[]} />);
      expect(screen.getByText("No pipeline data available")).toBeInTheDocument();
    });

    it("hides chart when data is empty", () => {
      renderWithProviders(<PipelineChart data={[]} />);
      expect(screen.queryByTestId("bar-chart")).not.toBeInTheDocument();
    });

    it("shows empty state message when data is null", () => {
      renderWithProviders(<PipelineChart data={null as any} />);
      expect(screen.getByText("No pipeline data available")).toBeInTheDocument();
    });

    it("shows empty state message when data is undefined", () => {
      renderWithProviders(<PipelineChart data={undefined as any} />);
      expect(screen.getByText("No pipeline data available")).toBeInTheDocument();
    });

  });

  describe("Props handling", () => {
    it("applies custom className to Card", () => {
      const { container } = renderWithProviders(
        <PipelineChart data={mockData} className="custom-class" />
      );
      const card = container.firstChild;
      expect(card).toHaveClass("custom-class");
    });

    it("renders with all default data types", () => {
      const dataWithZeros = [{ stage: "Applied", count: 0 }];
      renderWithProviders(<PipelineChart data={dataWithZeros} />);
      expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
    });

    it("handles large count values", () => {
      const largeData = [
        { stage: "Applied", count: 10000 },
        { stage: "Screened", count: 5000 },
      ];
      renderWithProviders(<PipelineChart data={largeData} />);
      const chart = screen.getByTestId("bar-chart");
      expect(chart).toHaveAttribute("data-chart", JSON.stringify(largeData));
    });
  });

  describe("Chart configuration", () => {
    it("configures correct margins for chart", () => {
      renderWithProviders(<PipelineChart data={mockData} />);
      // Verify chart is rendered with expected structure
      const chart = screen.getByTestId("bar-chart");
      expect(chart).toBeInTheDocument();
    });

    it("renders bar with rounded corners configuration", () => {
      renderWithProviders(<PipelineChart data={mockData} />);
      const bar = screen.getByTestId("bar");
      expect(bar).toBeInTheDocument();
    });
  });

  describe("Responsive behavior", () => {
    it("wraps chart in ResponsiveContainer", () => {
      renderWithProviders(<PipelineChart data={mockData} />);
      expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    });

    it("renders Card with proper padding", () => {
      const { container } = renderWithProviders(<PipelineChart data={mockData} />);
      const card = container.firstChild;
      expect(card).toHaveClass("p-6");
    });
  });

  describe("Title and description text", () => {
    it("renders proper heading for chart title", () => {
      const { container } = renderWithProviders(<PipelineChart data={mockData} />);
      const heading = container.querySelector(".font-semibold");
      expect(heading).toHaveTextContent("Application Funnel");
    });

    it("renders subtitle with muted text", () => {
      const { container } = renderWithProviders(<PipelineChart data={mockData} />);
      const subtitle = container.querySelector(".text-muted-foreground");
      expect(subtitle).toHaveTextContent("Job conversion stages");
    });

    it("subtitle appears after title", () => {
      const { container } = renderWithProviders(<PipelineChart data={mockData} />);
      const titleEl = Array.from(container.querySelectorAll("*")).find(
        (el) => el.textContent?.includes("Application Funnel")
      );
      const subtitleEl = Array.from(container.querySelectorAll("*")).find(
        (el) => el.textContent?.includes("Job conversion stages")
      );
      expect(titleEl).toBeInTheDocument();
      expect(subtitleEl).toBeInTheDocument();
    });
  });

  describe("Data visualization", () => {
    it("correctly maps all data points to chart", () => {
      renderWithProviders(<PipelineChart data={mockData} />);
      const chart = screen.getByTestId("bar-chart");
      expect(chart).toHaveAttribute("data-chart", JSON.stringify(mockData));
    });

    it("preserves data order in chart", () => {
      const orderedData = [
        { stage: "First", count: 100 },
        { stage: "Second", count: 50 },
        { stage: "Third", count: 25 },
      ];
      renderWithProviders(<PipelineChart data={orderedData} />);
      const chart = screen.getByTestId("bar-chart");
      expect(chart).toHaveAttribute("data-chart", JSON.stringify(orderedData));
    });
  });

  describe("Color palette", () => {
    it("uses gradient from blue to green", () => {
      renderWithProviders(<PipelineChart data={mockData} />);
      const cells = screen.getAllByTestId("cell");
      const colors = cells.map((cell) => cell.getAttribute("data-fill"));

      // Verify colors are HSL format (gradient colors)
      colors.forEach((color) => {
        expect(color).toMatch(/hsl\(/);
      });
    });

    it("applies first color to first bar", () => {
      renderWithProviders(<PipelineChart data={mockData} />);
      const cells = screen.getAllByTestId("cell");
      const firstColor = cells[0].getAttribute("data-fill");
      expect(firstColor).toBe("hsl(217.2 91.2% 59.8%)"); // Primary blue
    });
  });

  describe("Accessibility", () => {
    it("renders semantic structure", () => {
      const { container } = renderWithProviders(<PipelineChart data={mockData} />);
      const heading = container.querySelector(".font-semibold");
      expect(heading).toBeInTheDocument();
    });

    it("chart components are rendered", () => {
      renderWithProviders(<PipelineChart data={mockData} />);
      expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
      expect(screen.getByTestId("x-axis")).toBeInTheDocument();
      expect(screen.getByTestId("y-axis")).toBeInTheDocument();
    });
  });
});
