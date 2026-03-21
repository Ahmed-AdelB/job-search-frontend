/**
 * Status Badge Component Tests
 * Author: Ahmed Adel Bakr Alderai
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/__tests__/setup/render-with-providers";
import { StatusBadge } from "../status-badge";

// Mock Badge component
vi.mock("@/components/ui/badge", () => ({
  Badge: ({ children, variant, className }: any) =>
    <span data-variant={variant} className={className}>{children}</span>,
}));

describe("StatusBadge Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Success status variants", () => {
    const successStatuses = [
      "running",
      "active",
      "submitted",
      "completed",
      "confirmed",
      "offer",
      "applied",
    ];

    successStatuses.forEach((status) => {
      it(`renders "${status}" with default variant`, () => {
        renderWithProviders(<StatusBadge status={status} />);
        const displayText = status.replace(/_/g, " ");
        const badge = screen.getByText(new RegExp(displayText, "i"));
        expect(badge).toHaveAttribute("data-variant", "default");
      });
    });

    it("renders 'running' status", () => {
      renderWithProviders(<StatusBadge status="running" />);
      expect(screen.getByText(/running/i)).toBeInTheDocument();
    });

    it("renders 'completed' status", () => {
      renderWithProviders(<StatusBadge status="completed" />);
      expect(screen.getByText(/completed/i)).toBeInTheDocument();
    });

    it("renders 'offer' status", () => {
      renderWithProviders(<StatusBadge status="offer" />);
      expect(screen.getByText(/offer/i)).toBeInTheDocument();
    });
  });

  describe("Warning status variants", () => {
    const warningStatuses = ["pending", "paused", "starting", "draft"];

    warningStatuses.forEach((status) => {
      it(`renders "${status}" with secondary variant`, () => {
        renderWithProviders(<StatusBadge status={status} />);
        const displayText = status.replace(/_/g, " ");
        const badge = screen.getByText(new RegExp(displayText, "i"));
        expect(badge).toHaveAttribute("data-variant", "secondary");
      });
    });

    it("renders 'pending' status", () => {
      renderWithProviders(<StatusBadge status="pending" />);
      expect(screen.getByText(/pending/i)).toBeInTheDocument();
    });

    it("renders 'paused' status", () => {
      renderWithProviders(<StatusBadge status="paused" />);
      expect(screen.getByText(/paused/i)).toBeInTheDocument();
    });
  });

  describe("Error status variants", () => {
    const errorStatuses = [
      "error",
      "rejected",
      "failed",
      "cancelled",
      "withdrawn",
      "stopped",
      "bounced",
    ];

    errorStatuses.forEach((status) => {
      it(`renders "${status}" with destructive variant`, () => {
        renderWithProviders(<StatusBadge status={status} />);
        const displayText = status.replace(/_/g, " ");
        const badge = screen.getByText(new RegExp(displayText, "i"));
        expect(badge).toHaveAttribute("data-variant", "destructive");
      });
    });

    it("renders 'failed' status", () => {
      renderWithProviders(<StatusBadge status="failed" />);
      expect(screen.getByText(/failed/i)).toBeInTheDocument();
    });

    it("renders 'rejected' status", () => {
      renderWithProviders(<StatusBadge status="rejected" />);
      expect(screen.getByText(/rejected/i)).toBeInTheDocument();
    });
  });

  describe("Info status variants", () => {
    const infoStatuses = [
      "interview",
      "new",
      "archived",
      "half_open",
      "open",
      "closed",
      "sent",
      "delivered",
      "opened",
      "replied",
    ];

    infoStatuses.forEach((status) => {
      it(`renders "${status}" with outline variant`, () => {
        renderWithProviders(<StatusBadge status={status} />);
        const badge = screen.getByText(new RegExp(status.replace(/_/g, " "), "i"));
        expect(badge).toHaveAttribute("data-variant", "outline");
      });
    });

    it("renders 'new' status", () => {
      renderWithProviders(<StatusBadge status="new" />);
      expect(screen.getByText(/new/i)).toBeInTheDocument();
    });

    it("renders 'interview' status", () => {
      renderWithProviders(<StatusBadge status="interview" />);
      expect(screen.getByText(/interview/i)).toBeInTheDocument();
    });
  });

  describe("Status text formatting", () => {
    it("formats underscore-separated status to title case", () => {
      renderWithProviders(<StatusBadge status="half_open" />);
      expect(screen.getByText("Half Open")).toBeInTheDocument();
    });

    it("formats single word status to title case", () => {
      renderWithProviders(<StatusBadge status="pending" />);
      expect(screen.getByText("Pending")).toBeInTheDocument();
    });

    it("formats follow_up_1 status correctly", () => {
      renderWithProviders(<StatusBadge status="follow_up_1" />);
      expect(screen.getByText("Follow Up 1")).toBeInTheDocument();
    });

    it("capitalizes first letter of each word", () => {
      renderWithProviders(<StatusBadge status="in_progress" />);
      expect(screen.getByText("In Progress")).toBeInTheDocument();
    });

    it("handles multiple underscores", () => {
      renderWithProviders(<StatusBadge status="very_long_status_name" />);
      expect(screen.getByText("Very Long Status Name")).toBeInTheDocument();
    });
  });

  describe("Custom variant override", () => {
    it("uses custom variant when provided", () => {
      renderWithProviders(
        <StatusBadge status="running" variant="destructive" />
      );
      const badge = screen.getByText(/running/i);
      expect(badge).toHaveAttribute("data-variant", "destructive");
    });

    it("overrides default success variant with custom", () => {
      renderWithProviders(
        <StatusBadge status="completed" variant="outline" />
      );
      const badge = screen.getByText(/completed/i);
      expect(badge).toHaveAttribute("data-variant", "outline");
    });

    it("applies secondary variant override", () => {
      renderWithProviders(
        <StatusBadge status="new" variant="secondary" />
      );
      const badge = screen.getByText(/new/i);
      expect(badge).toHaveAttribute("data-variant", "secondary");
    });

    it("applies ghost variant override", () => {
      renderWithProviders(
        <StatusBadge status="pending" variant="ghost" />
      );
      const badge = screen.getByText(/pending/i);
      expect(badge).toHaveAttribute("data-variant", "ghost");
    });

    it("applies link variant override", () => {
      renderWithProviders(
        <StatusBadge status="active" variant="link" />
      );
      const badge = screen.getByText(/active/i);
      expect(badge).toHaveAttribute("data-variant", "link");
    });
  });

  describe("Custom className", () => {
    it("applies custom className", () => {
      renderWithProviders(
        <StatusBadge status="pending" className="custom-class" />
      );
      const badge = screen.getByText(/pending/i);
      expect(badge).toHaveClass("custom-class");
    });

    it("combines Badge className with custom className", () => {
      renderWithProviders(
        <StatusBadge status="active" className="text-lg" />
      );
      const badge = screen.getByText(/active/i);
      expect(badge.className).toContain("text-lg");
    });

    it("applies multiple custom classes", () => {
      renderWithProviders(
        <StatusBadge status="completed" className="px-4 py-2" />
      );
      const badge = screen.getByText(/completed/i);
      expect(badge.className).toContain("px-4");
      expect(badge.className).toContain("py-2");
    });
  });

  describe("Edge cases and unknown statuses", () => {
    it("handles unknown status with outline variant", () => {
      renderWithProviders(<StatusBadge status="unknown_status" />);
      const badge = screen.getByText(/unknown status/i);
      expect(badge).toHaveAttribute("data-variant", "outline");
    });

    it("handles custom string status", () => {
      renderWithProviders(<StatusBadge status="custom_status" />);
      expect(screen.getByText("Custom Status")).toBeInTheDocument();
    });

    it("formats custom status with underscores", () => {
      renderWithProviders(<StatusBadge status="my_custom_status" />);
      expect(screen.getByText("My Custom Status")).toBeInTheDocument();
    });

    it("handles status with numbers", () => {
      renderWithProviders(<StatusBadge status="round_2_interview" />);
      expect(screen.getByText("Round 2 Interview")).toBeInTheDocument();
    });
  });

  describe("All documented statuses", () => {
    it("handles 'running' status", () => {
      renderWithProviders(<StatusBadge status="running" />);
      expect(screen.getByText("Running")).toBeInTheDocument();
    });

    it("handles 'active' status", () => {
      renderWithProviders(<StatusBadge status="active" />);
      expect(screen.getByText("Active")).toBeInTheDocument();
    });

    it("handles 'submitted' status", () => {
      renderWithProviders(<StatusBadge status="submitted" />);
      expect(screen.getByText("Submitted")).toBeInTheDocument();
    });

    it("handles 'interview' status", () => {
      renderWithProviders(<StatusBadge status="interview" />);
      expect(screen.getByText("Interview")).toBeInTheDocument();
    });

    it("handles 'offer' status", () => {
      renderWithProviders(<StatusBadge status="offer" />);
      expect(screen.getByText("Offer")).toBeInTheDocument();
    });

    it("handles 'rejected' status", () => {
      renderWithProviders(<StatusBadge status="rejected" />);
      expect(screen.getByText("Rejected")).toBeInTheDocument();
    });

    it("handles 'withdrawn' status", () => {
      renderWithProviders(<StatusBadge status="withdrawn" />);
      expect(screen.getByText("Withdrawn")).toBeInTheDocument();
    });

    it("handles 'archived' status", () => {
      renderWithProviders(<StatusBadge status="archived" />);
      expect(screen.getByText("Archived")).toBeInTheDocument();
    });

    it("handles 'open' status", () => {
      renderWithProviders(<StatusBadge status="open" />);
      expect(screen.getByText("Open")).toBeInTheDocument();
    });

    it("handles 'closed' status", () => {
      renderWithProviders(<StatusBadge status="closed" />);
      expect(screen.getByText("Closed")).toBeInTheDocument();
    });
  });

  describe("Variant assignment logic", () => {
    it("prioritizes status over custom variant parameter correctly", () => {
      // Ensure custom variant is respected
      renderWithProviders(
        <StatusBadge status="pending" variant="destructive" />
      );
      const badge = screen.getByText(/pending/i);
      expect(badge).toHaveAttribute("data-variant", "destructive");
    });

    it("multiple statuses map to correct variants", () => {
      const { rerender } = renderWithProviders(
        <StatusBadge status="running" />
      );
      expect(screen.getByText("Running")).toHaveAttribute("data-variant", "default");

      rerender(<StatusBadge status="pending" />);
      expect(screen.getByText("Pending")).toHaveAttribute("data-variant", "secondary");

      rerender(<StatusBadge status="failed" />);
      expect(screen.getByText("Failed")).toHaveAttribute("data-variant", "destructive");

      rerender(<StatusBadge status="new" />);
      expect(screen.getByText("New")).toHaveAttribute("data-variant", "outline");
    });
  });

  describe("Badge rendering", () => {
    it("renders as Badge component", () => {
      renderWithProviders(<StatusBadge status="active" />);
      const badge = screen.getByText(/active/i);
      expect(badge.tagName.toLowerCase()).toBe("span");
    });

    it("badge is visible in document", () => {
      renderWithProviders(<StatusBadge status="pending" />);
      const badge = screen.getByText(/pending/i);
      expect(badge).toBeVisible();
    });
  });

  describe("Status messages readability", () => {
    it("displays human-readable status for 'half_open'", () => {
      renderWithProviders(<StatusBadge status="half_open" />);
      expect(screen.getByText("Half Open")).toBeInTheDocument();
    });

    it("displays human-readable status for 'follow_up'", () => {
      renderWithProviders(<StatusBadge status="follow_up_1" />);
      const text = screen.getByText(/Follow Up/i);
      expect(text.textContent).toContain("Follow Up");
    });

    it("all formatted statuses are readable", () => {
      const statuses = ["running", "pending", "half_open", "in_review"];
      statuses.forEach((status) => {
        const { unmount } = renderWithProviders(
          <StatusBadge status={status} />
        );
        const text = screen.getByText(new RegExp(status.replace(/_/g, " "), "i"));
        expect(text).toBeInTheDocument();
        unmount();
      });
    });
  });
});
