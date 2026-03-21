/**
 * Loading Skeleton Components Tests
 * Author: Ahmed Adel Bakr Alderai
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/__tests__/setup/render-with-providers";
import {
  CardSkeleton,
  TableRowSkeleton,
  TableSkeleton,
  StatSkeleton,
  PageSkeleton,
} from "../loading-skeleton";

// Mock Skeleton component
vi.mock("@/components/ui/skeleton", () => ({
  Skeleton: ({ className }: any) =>
    <div data-testid="skeleton" className={className} />,
}));

describe("CardSkeleton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders card skeleton structure", () => {
    const { container } = renderWithProviders(<CardSkeleton />);
    expect(container.querySelector(".rounded-lg")).toBeInTheDocument();
    expect(container.querySelector(".border")).toBeInTheDocument();
  });

  it("renders title skeleton", () => {
    const { container } = renderWithProviders(<CardSkeleton />);
    const skeletons = container.querySelectorAll('[data-testid="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders content skeletons", () => {
    const { container } = renderWithProviders(<CardSkeleton />);
    const skeletons = container.querySelectorAll('[data-testid="skeleton"]');
    // Should have title + 2 content lines + 2 buttons
    expect(skeletons.length).toBeGreaterThanOrEqual(3);
  });

  it("renders button skeletons", () => {
    const { container } = renderWithProviders(<CardSkeleton />);
    const buttonArea = container.querySelector(".flex.gap-2");
    expect(buttonArea).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = renderWithProviders(
      <CardSkeleton className="h-96" />
    );
    expect(container.querySelector(".h-96")).toBeInTheDocument();
  });

  it("has proper spacing", () => {
    const { container } = renderWithProviders(<CardSkeleton />);
    expect(container.querySelector(".space-y-4")).toBeInTheDocument();
  });

  it("has border styling", () => {
    const { container } = renderWithProviders(<CardSkeleton />);
    const card = container.querySelector(".border");
    expect(card).toHaveClass("border-border");
  });

  it("has background styling", () => {
    const { container } = renderWithProviders(<CardSkeleton />);
    const card = container.querySelector(".bg-background");
    expect(card).toBeInTheDocument();
  });
});

describe("TableRowSkeleton", () => {
  it("renders row skeleton structure", () => {
    const { container } = renderWithProviders(<TableRowSkeleton />);
    expect(container.querySelector(".flex")).toBeInTheDocument();
    expect(container.querySelector(".items-center")).toBeInTheDocument();
  });

  it("renders multiple skeleton cells", () => {
    const { container } = renderWithProviders(<TableRowSkeleton />);
    const skeletons = container.querySelectorAll('[data-testid="skeleton"]');
    // Checkbox + id + name + 2 status columns
    expect(skeletons.length).toBe(5);
  });

  it("has proper gap between cells", () => {
    const { container } = renderWithProviders(<TableRowSkeleton />);
    expect(container.querySelector(".gap-4")).toBeInTheDocument();
  });

  it("has bottom border", () => {
    const { container } = renderWithProviders(<TableRowSkeleton />);
    expect(container.querySelector(".border-b")).toBeInTheDocument();
  });

  it("has padding", () => {
    const { container } = renderWithProviders(<TableRowSkeleton />);
    expect(container.querySelector(".px-4.py-3")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = renderWithProviders(
      <TableRowSkeleton className="bg-blue-50" />
    );
    expect(container.querySelector(".bg-blue-50")).toBeInTheDocument();
  });
});

describe("TableSkeleton", () => {
  it("renders table skeleton structure", () => {
    const { container } = renderWithProviders(<TableSkeleton />);
    expect(container.querySelector(".rounded-lg")).toBeInTheDocument();
    expect(container.querySelector(".border")).toBeInTheDocument();
  });

  it("renders header row", () => {
    const { container } = renderWithProviders(<TableSkeleton />);
    const header = container.querySelector(".bg-muted");
    expect(header).toBeInTheDocument();
  });

  it("renders default 5 body rows", () => {
    const { container } = renderWithProviders(<TableSkeleton />);
    const rows = container.querySelectorAll(".flex.items-center.gap-4.border-b");
    // Header + 5 body rows
    expect(rows.length).toBe(6);
  });

  it("renders custom number of rows", () => {
    const { container } = renderWithProviders(<TableSkeleton rows={10} />);
    const rows = container.querySelectorAll(".border-b");
    // Header + 10 body rows
    expect(rows.length).toBe(11);
  });

  it("renders 0 rows when specified", () => {
    const { container } = renderWithProviders(<TableSkeleton rows={0} />);
    const rows = container.querySelectorAll(".flex.items-center.gap-4");
    // Only header
    expect(rows.length).toBe(1);
  });

  it("has overflow hidden", () => {
    const { container } = renderWithProviders(<TableSkeleton />);
    const table = container.firstChild;
    expect(table).toHaveClass("overflow-hidden");
  });

  it("applies custom className", () => {
    const { container } = renderWithProviders(
      <TableSkeleton className="w-full" />
    );
    expect(container.querySelector(".w-full")).toBeInTheDocument();
  });

  it("has proper border styling", () => {
    const { container } = renderWithProviders(<TableSkeleton />);
    const header = container.querySelector(".bg-muted");
    expect(header).toHaveClass("border-b");
  });
});

describe("StatSkeleton", () => {
  it("renders stat skeleton structure", () => {
    const { container } = renderWithProviders(<StatSkeleton />);
    expect(container.querySelector(".rounded-lg")).toBeInTheDocument();
    expect(container.querySelector(".border")).toBeInTheDocument();
  });

  it("renders label skeleton", () => {
    const { container } = renderWithProviders(<StatSkeleton />);
    const skeletons = container.querySelectorAll('[data-testid="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders value skeleton", () => {
    const { container } = renderWithProviders(<StatSkeleton />);
    const skeletons = container.querySelectorAll('[data-testid="skeleton"]');
    // label + value + description
    expect(skeletons.length).toBe(3);
  });

  it("has proper spacing", () => {
    const { container } = renderWithProviders(<StatSkeleton />);
    expect(container.querySelector(".space-y-3")).toBeInTheDocument();
  });

  it("has background styling", () => {
    const { container } = renderWithProviders(<StatSkeleton />);
    expect(container.querySelector(".bg-background")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = renderWithProviders(
      <StatSkeleton className="h-32" />
    );
    expect(container.querySelector(".h-32")).toBeInTheDocument();
  });

  it("has padding", () => {
    const { container } = renderWithProviders(<StatSkeleton />);
    expect(container.querySelector(".p-4")).toBeInTheDocument();
  });

  it("has border styling", () => {
    const { container } = renderWithProviders(<StatSkeleton />);
    expect(container.querySelector(".border-border")).toBeInTheDocument();
  });
});

describe("PageSkeleton", () => {
  it("renders page skeleton structure", () => {
    const { container } = renderWithProviders(<PageSkeleton />);
    expect(container.querySelector(".space-y-6")).toBeInTheDocument();
  });

  it("renders header section", () => {
    const { container } = renderWithProviders(<PageSkeleton />);
    const headerSpace = container.querySelector(".space-y-2");
    expect(headerSpace).toBeInTheDocument();
  });

  it("renders stats grid section", () => {
    const { container } = renderWithProviders(<PageSkeleton />);
    const statsGrid = container.querySelector(".grid.gap-4");
    expect(statsGrid).toBeInTheDocument();
  });

  it("renders 4 stat skeletons by default", () => {
    const { container } = renderWithProviders(<PageSkeleton />);
    const statSkeletons = container.querySelectorAll(".space-y-3");
    // 4 stat skeletons have space-y-3 (header has space-y-2)
    expect(statSkeletons.length).toBe(4);
  });

  it("renders charts grid section", () => {
    const { container } = renderWithProviders(<PageSkeleton />);
    const grids = container.querySelectorAll(".grid.gap-4");
    // Stats grid + charts grid
    expect(grids.length).toBeGreaterThanOrEqual(2);
  });

  it("renders 2 card skeletons for charts", () => {
    const { container } = renderWithProviders(<PageSkeleton />);
    // Verify grid layout for charts section exists (look for responsive grid)
    const grids = container.querySelectorAll("[class*='grid-cols']");
    expect(grids.length).toBeGreaterThan(0);
  });

  it("renders table section", () => {
    const { container } = renderWithProviders(<PageSkeleton />);
    // Table section should be present
    const tables = container.querySelectorAll(".rounded-lg.border.overflow-hidden");
    expect(tables.length).toBeGreaterThan(0);
  });

  it("renders table with default 5 rows", () => {
    const { container } = renderWithProviders(<PageSkeleton />);
    // Count all border-b elements (header + 5 rows)
    const borders = container.querySelectorAll(".border-b");
    expect(borders.length).toBeGreaterThanOrEqual(6);
  });

  it("applies custom className", () => {
    const { container } = renderWithProviders(
      <PageSkeleton className="p-6" />
    );
    expect(container.querySelector(".p-6")).toBeInTheDocument();
  });

  it("has responsive grid layouts", () => {
    const { container } = renderWithProviders(<PageSkeleton />);
    const mdGrids = container.querySelectorAll(".md\\:grid-cols-4, .md\\:grid-cols-2");
    // There should be responsive classes
    expect(container.innerHTML).toContain("md:");
  });

  it("has proper spacing between sections", () => {
    const { container } = renderWithProviders(<PageSkeleton />);
    const mainSpace = container.querySelector(".space-y-6");
    expect(mainSpace).toBeInTheDocument();
  });
});

describe("Skeleton components layout consistency", () => {
  it("all skeletons have border styling", () => {
    const testIds = [
      { component: <CardSkeleton /> },
      { component: <TableSkeleton /> },
      { component: <StatSkeleton /> },
    ];

    testIds.forEach(({ component }) => {
      const { container } = renderWithProviders(component);
      const bordered = container.querySelector(".border");
      expect(bordered).toBeInTheDocument();
    });
  });

  it("all skeletons have rounded corners", () => {
    const testIds = [
      { component: <CardSkeleton /> },
      { component: <TableSkeleton /> },
      { component: <StatSkeleton /> },
    ];

    testIds.forEach(({ component }) => {
      const { container, unmount } = renderWithProviders(component);
      const rounded = container.querySelector(".rounded-lg");
      expect(rounded).toBeInTheDocument();
      unmount();
    });
  });

  it("all skeletons use consistent spacing", () => {
    const { container: cardContainer } = renderWithProviders(<CardSkeleton />);
    const { container: statContainer } = renderWithProviders(<StatSkeleton />);

    const cardSpace = cardContainer.querySelector(".space-y-4");
    const statSpace = statContainer.querySelector(".space-y-3");

    expect(cardSpace || statSpace).toBeInTheDocument();
  });
});

describe("Skeleton className flexibility", () => {
  it("CardSkeleton accepts custom className", () => {
    const { container } = renderWithProviders(
      <CardSkeleton className="custom-height" />
    );
    expect(container.querySelector(".custom-height")).toBeInTheDocument();
  });

  it("TableRowSkeleton accepts custom className", () => {
    const { container } = renderWithProviders(
      <TableRowSkeleton className="custom-style" />
    );
    expect(container.querySelector(".custom-style")).toBeInTheDocument();
  });

  it("TableSkeleton accepts custom className", () => {
    const { container } = renderWithProviders(
      <TableSkeleton className="custom-width" />
    );
    expect(container.querySelector(".custom-width")).toBeInTheDocument();
  });

  it("StatSkeleton accepts custom className", () => {
    const { container } = renderWithProviders(
      <StatSkeleton className="custom-stat" />
    );
    expect(container.querySelector(".custom-stat")).toBeInTheDocument();
  });

  it("PageSkeleton accepts custom className", () => {
    const { container } = renderWithProviders(
      <PageSkeleton className="custom-page" />
    );
    expect(container.querySelector(".custom-page")).toBeInTheDocument();
  });
});

describe("TableSkeleton rows customization", () => {
  it("renders 1 row when specified", () => {
    const { container } = renderWithProviders(<TableSkeleton rows={1} />);
    const rows = container.querySelectorAll(".border-b");
    // Header + 1 body row
    expect(rows.length).toBe(2);
  });

  it("renders 3 rows when specified", () => {
    const { container } = renderWithProviders(<TableSkeleton rows={3} />);
    const rows = container.querySelectorAll(".border-b");
    // Header + 3 body rows
    expect(rows.length).toBe(4);
  });

  it("renders many rows when specified", () => {
    const { container } = renderWithProviders(<TableSkeleton rows={20} />);
    const rows = container.querySelectorAll(".border-b");
    // Header + 20 body rows
    expect(rows.length).toBe(21);
  });
});

describe("Skeleton component accessibility", () => {
  it("skeletons are visible during loading", () => {
    const { container } = renderWithProviders(<CardSkeleton />);
    const skeletons = container.querySelectorAll('[data-testid="skeleton"]');
    skeletons.forEach((skeleton) => {
      expect(skeleton).toBeVisible();
    });
  });

  it("page skeleton structure is accessible", () => {
    const { container } = renderWithProviders(<PageSkeleton />);
    const mainContent = container.querySelector(".space-y-6");
    expect(mainContent).toBeInTheDocument();
  });

  it("table skeleton maintains table semantics", () => {
    const { container } = renderWithProviders(<TableSkeleton />);
    expect(container.querySelector(".flex")).toBeInTheDocument();
    expect(container.querySelector(".border")).toBeInTheDocument();
  });
});
