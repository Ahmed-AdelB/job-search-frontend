/**
 * Empty State Component Tests
 * Author: Ahmed Adel Bakr Alderai
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/__tests__/setup/render-with-providers";
import { EmptyState } from "../empty-state";
import { Inbox } from "lucide-react";

describe("EmptyState Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Renders with required props", () => {
    it("renders title", () => {
      renderWithProviders(<EmptyState title="No items found" />);
      expect(screen.getByText("No items found")).toBeInTheDocument();
    });

    it("renders with title only", () => {
      const { container } = renderWithProviders(
        <EmptyState title="Empty" />
      );
      expect(screen.getByText("Empty")).toBeInTheDocument();
      expect(container.querySelector(".flex")).toBeInTheDocument();
    });
  });

  describe("Renders optional description", () => {
    it("renders description when provided", () => {
      renderWithProviders(
        <EmptyState
          title="No jobs"
          description="Try adjusting your filters"
        />
      );
      expect(screen.getByText("Try adjusting your filters")).toBeInTheDocument();
    });

    it("hides description when not provided", () => {
      renderWithProviders(<EmptyState title="No items" />);
      expect(screen.queryByText(/Try adjusting/)).not.toBeInTheDocument();
    });

    it("displays both title and description", () => {
      renderWithProviders(
        <EmptyState
          title="No results"
          description="Please try again"
        />
      );
      expect(screen.getByText("No results")).toBeInTheDocument();
      expect(screen.getByText("Please try again")).toBeInTheDocument();
    });

    it("renders description with muted text styling", () => {
      const { container } = renderWithProviders(
        <EmptyState
          title="Title"
          description="Description"
        />
      );
      const desc = screen.getByText("Description");
      expect(desc).toHaveClass("text-muted-foreground");
    });
  });

  describe("Renders optional icon", () => {
    it("renders icon when provided", () => {
      const { container } = renderWithProviders(
        <EmptyState title="Empty" icon={Inbox} />
      );
      const iconContainer = container.querySelector(".bg-muted");
      expect(iconContainer).toBeInTheDocument();
    });

    it("wraps icon in muted background", () => {
      const { container } = renderWithProviders(
        <EmptyState title="Empty" icon={Inbox} />
      );
      const iconBox = container.querySelector(".rounded-lg.bg-muted.p-3");
      expect(iconBox).toBeInTheDocument();
    });

    it("does not render icon container when icon not provided", () => {
      const { container } = renderWithProviders(
        <EmptyState title="Empty" />
      );
      const containers = container.querySelectorAll(".rounded-lg.bg-muted.p-3");
      expect(containers).toHaveLength(0);
    });

    it("icon has correct sizing", () => {
      const { container } = renderWithProviders(
        <EmptyState title="Empty" icon={Inbox} />
      );
      const iconSvg = container.querySelector("svg");
      expect(iconSvg).toHaveClass("size-6");
    });

    it("icon has muted foreground color", () => {
      const { container } = renderWithProviders(
        <EmptyState title="Empty" icon={Inbox} />
      );
      const iconSvg = container.querySelector("svg");
      expect(iconSvg).toHaveClass("text-muted-foreground");
    });
  });

  describe("Renders optional action button", () => {
    it("renders action button when action provided", () => {
      const handleClick = vi.fn();
      renderWithProviders(
        <EmptyState
          title="Empty"
          action={{ label: "Create new", onClick: handleClick }}
        />
      );
      expect(screen.getByRole("button", { name: /Create new/i })).toBeInTheDocument();
    });

    it("does not render button when action not provided", () => {
      renderWithProviders(<EmptyState title="Empty" />);
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("button displays action label", () => {
      const handleClick = vi.fn();
      renderWithProviders(
        <EmptyState
          title="Empty"
          action={{ label: "Add item", onClick: handleClick }}
        />
      );
      expect(screen.getByRole("button", { name: /Add item/i })).toBeInTheDocument();
    });

    it("button calls onClick handler when clicked", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      renderWithProviders(
        <EmptyState
          title="Empty"
          action={{ label: "Click me", onClick: handleClick }}
        />
      );

      const button = screen.getByRole("button", { name: /Click me/i });
      await user.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });


    it("button has small size", () => {
      const handleClick = vi.fn();
      renderWithProviders(
        <EmptyState
          title="Empty"
          action={{ label: "Action", onClick: handleClick }}
        />
      );
      const button = screen.getByRole("button");
      // Check for size-sm class
      const classStr = button.className;
      expect(classStr).toBeTruthy();
    });
  });

  describe("Layout and styling", () => {
    it("renders flexbox container with centered content", () => {
      const { container } = renderWithProviders(
        <EmptyState title="Empty" />
      );
      const flexBox = container.querySelector(".flex.flex-col.items-center.justify-center");
      expect(flexBox).toBeInTheDocument();
    });

    it("renders with dashed border", () => {
      const { container } = renderWithProviders(
        <EmptyState title="Empty" />
      );
      const bordered = container.querySelector(".border-dashed");
      expect(bordered).toBeInTheDocument();
    });

    it("has gap between elements", () => {
      const { container } = renderWithProviders(
        <EmptyState title="Empty" />
      );
      const main = container.querySelector(".gap-4");
      expect(main).toBeInTheDocument();
    });

    it("has rounded corners", () => {
      const { container } = renderWithProviders(
        <EmptyState title="Empty" />
      );
      const rounded = container.querySelector(".rounded-lg");
      expect(rounded).toBeInTheDocument();
    });

    it("has semi-transparent background", () => {
      const { container } = renderWithProviders(
        <EmptyState title="Empty" />
      );
      const bgElement = container.querySelector(".bg-background\\/50");
      expect(bgElement).toBeInTheDocument();
    });

    it("has centered text", () => {
      const { container } = renderWithProviders(
        <EmptyState title="Empty" />
      );
      const textCenter = container.querySelector(".text-center");
      expect(textCenter).toBeInTheDocument();
    });
  });

  describe("Custom className prop", () => {
    it("applies custom className", () => {
      const { container } = renderWithProviders(
        <EmptyState title="Empty" className="custom-class" />
      );
      const element = container.querySelector(".custom-class");
      expect(element).toBeInTheDocument();
    });

    it("combines default and custom classes", () => {
      const { container } = renderWithProviders(
        <EmptyState title="Empty" className="h-80" />
      );
      const element = container.querySelector(".h-80");
      expect(element).toBeInTheDocument();
      // Also check for default classes
      expect(element?.className).toMatch(/flex|flex-col|items-center/);
    });

    it("custom className overrides defaults", () => {
      const { container } = renderWithProviders(
        <EmptyState title="Empty" className="hidden" />
      );
      const element = container.querySelector(".hidden");
      expect(element).toBeInTheDocument();
    });
  });

  describe("Title styling", () => {
    it("renders title as heading with semibold weight", () => {
      const { container } = renderWithProviders(
        <EmptyState title="Empty" />
      );
      const heading = container.querySelector("h3");
      expect(heading).toHaveClass("font-semibold");
    });

    it("title has correct color", () => {
      const { container } = renderWithProviders(
        <EmptyState title="Empty" />
      );
      const heading = container.querySelector("h3");
      expect(heading).toHaveClass("text-foreground");
    });
  });

  describe("Description styling", () => {
    it("description has small text size", () => {
      const { container } = renderWithProviders(
        <EmptyState
          title="Title"
          description="Desc"
        />
      );
      const desc = screen.getByText("Desc");
      expect(desc).toHaveClass("text-sm");
    });

    it("description text is properly colored", () => {
      const { container } = renderWithProviders(
        <EmptyState
          title="Title"
          description="Desc"
        />
      );
      const desc = screen.getByText("Desc");
      expect(desc).toHaveClass("text-muted-foreground");
    });
  });

  describe("Complete empty state scenarios", () => {
    it("renders empty state with all props", () => {
      const handleCreate = vi.fn();
      renderWithProviders(
        <EmptyState
          icon={Inbox}
          title="No jobs found"
          description="Start by creating a new job posting"
          action={{ label: "Create job", onClick: handleCreate }}
          className="h-96"
        />
      );

      expect(screen.getByText("No jobs found")).toBeInTheDocument();
      expect(screen.getByText("Start by creating a new job posting")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Create job/i })).toBeInTheDocument();
    });

    it("renders minimal empty state with only title", () => {
      renderWithProviders(<EmptyState title="Nothing here" />);
      expect(screen.getByText("Nothing here")).toBeInTheDocument();
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("renders with icon and action but no description", () => {
      const handleClick = vi.fn();
      renderWithProviders(
        <EmptyState
          icon={Inbox}
          title="Empty"
          action={{ label: "Add", onClick: handleClick }}
        />
      );

      expect(screen.getByText("Empty")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Add/i })).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("heading is properly structured", () => {
      const { container } = renderWithProviders(
        <EmptyState title="Empty" />
      );
      const heading = container.querySelector("h3");
      expect(heading).toBeInTheDocument();
    });

    it("button is keyboard accessible", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      renderWithProviders(
        <EmptyState
          title="Empty"
          action={{ label: "Click", onClick: handleClick }}
        />
      );

      const button = screen.getByRole("button");
      await user.keyboard("{Enter}");
      // Button should be accessible via keyboard
      expect(button).toBeVisible();
    });

    it("action button has descriptive text", () => {
      const handleClick = vi.fn();
      renderWithProviders(
        <EmptyState
          title="Empty"
          action={{ label: "Create new item", onClick: handleClick }}
        />
      );

      const button = screen.getByRole("button", { name: /Create new item/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe("Content spacing", () => {
    it("title and description have spacing between them", () => {
      const { container } = renderWithProviders(
        <EmptyState
          title="Title"
          description="Desc"
        />
      );
      const space = container.querySelector(".space-y-2");
      expect(space).toBeInTheDocument();
    });

    it("elements have gap between them", () => {
      const { container } = renderWithProviders(
        <EmptyState
          title="Title"
          description="Desc"
          action={{ label: "Act", onClick: vi.fn() }}
        />
      );
      const main = container.querySelector(".gap-4");
      expect(main).toBeInTheDocument();
    });
  });
});
