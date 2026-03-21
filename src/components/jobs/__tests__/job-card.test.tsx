/**
 * Job Card Component Tests
 * Author: Ahmed Adel Bakr Alderai
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/__tests__/setup/render-with-providers";
import { JobCard } from "../job-card";
import type { Job } from "@/types/api";

// Mock StatusBadge component
vi.mock("@/components/shared/status-badge", () => ({
  StatusBadge: ({ status }: { status: string }) => <span>{status}</span>,
}));

const mockJob: Job = {
  id: 1,
  title: "Senior React Developer",
  company: "Tech Corp",
  location: "San Francisco, CA",
  salary_min: 120000,
  salary_max: 160000,
  description: "We are looking for an experienced React developer to join our team.",
  requirements: ["React", "TypeScript", "Node.js"],
  status: "new",
  source: "LinkedIn",
  remote_type: "hybrid",
  url: "https://example.com/job/1",
  score: 85,
  ghost_score: 20,
  visa_sponsored: true,
};

describe("JobCard Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Renders correctly with props", () => {
    it("renders job title", () => {
      renderWithProviders(<JobCard job={mockJob} />);
      expect(screen.getByText("Senior React Developer")).toBeInTheDocument();
    });

    it("renders company name", () => {
      renderWithProviders(<JobCard job={mockJob} />);
      expect(screen.getByText("Tech Corp")).toBeInTheDocument();
    });

    it("renders location and remote type", () => {
      renderWithProviders(<JobCard job={mockJob} />);
      expect(screen.getByText("San Francisco, CA")).toBeInTheDocument();
      expect(screen.getByText("Hybrid")).toBeInTheDocument();
    });

    it("renders salary range", () => {
      renderWithProviders(<JobCard job={mockJob} />);
      expect(screen.getByText("$120K - $160K")).toBeInTheDocument();
    });

    it("renders description preview", () => {
      renderWithProviders(<JobCard job={mockJob} />);
      expect(
        screen.getByText("We are looking for an experienced React developer to join our team.")
      ).toBeInTheDocument();
    });

    it("renders requirements", () => {
      renderWithProviders(<JobCard job={mockJob} />);
      expect(screen.getByText("React, TypeScript, Node.js")).toBeInTheDocument();
    });

    it("renders score badge with correct styling for high score", () => {
      renderWithProviders(<JobCard job={mockJob} />);
      const scoreBadge = screen.getByText("85");
      expect(scoreBadge).toBeInTheDocument();
      expect(scoreBadge).toHaveClass("bg-green-100");
    });
  });

  describe("Handles missing/empty props", () => {
    it("handles job without salary data", () => {
      const jobNoSalary = { ...mockJob, salary_min: null, salary_max: null };
      renderWithProviders(<JobCard job={jobNoSalary} />);
      expect(screen.getByText("Salary not listed")).toBeInTheDocument();
    });

    it("handles job with only minimum salary", () => {
      const jobMinSalary = { ...mockJob, salary_max: null };
      renderWithProviders(<JobCard job={jobMinSalary} />);
      expect(screen.getByText("$120K+")).toBeInTheDocument();
    });

    it("handles job without remote type", () => {
      const jobNoRemote = { ...mockJob, remote_type: null };
      renderWithProviders(<JobCard job={jobNoRemote} />);
      // Should still render other badges even without remote type
      expect(screen.getByText("San Francisco, CA")).toBeInTheDocument();
    });

    it("handles job without description", () => {
      const jobNoDesc = { ...mockJob, description: null };
      renderWithProviders(<JobCard job={jobNoDesc} />);
      expect(screen.queryByText(/We are looking/)).not.toBeInTheDocument();
    });

    it("handles job without requirements", () => {
      const jobNoReqs = { ...mockJob, requirements: null };
      renderWithProviders(<JobCard job={jobNoReqs} />);
      expect(screen.queryByText("Requirements:")).not.toBeInTheDocument();
    });

    it("handles job without score", () => {
      const jobNoScore = { ...mockJob, score: null };
      renderWithProviders(<JobCard job={jobNoScore} />);
      expect(screen.queryByText("85")).not.toBeInTheDocument();
    });
  });

  describe("Conditional rendering", () => {
    it("shows ghost job badge when ghost score is above 70", () => {
      const ghostJob = { ...mockJob, ghost_score: 75 };
      renderWithProviders(<JobCard job={ghostJob} />);
      expect(screen.getByText(/Potential Ghost Job/)).toBeInTheDocument();
    });

    it("hides ghost job badge when ghost score is below 70", () => {
      const safeJob = { ...mockJob, ghost_score: 65 };
      renderWithProviders(<JobCard job={safeJob} />);
      expect(screen.queryByText(/Potential Ghost Job/)).not.toBeInTheDocument();
    });

    it("shows visa sponsored badge when visa_sponsored is true", () => {
      renderWithProviders(<JobCard job={mockJob} />);
      expect(screen.getByText("Visa Sponsored")).toBeInTheDocument();
    });

    it("hides visa sponsored badge when visa_sponsored is false", () => {
      const noVisa = { ...mockJob, visa_sponsored: false };
      renderWithProviders(<JobCard job={noVisa} />);
      expect(screen.queryByText("Visa Sponsored")).not.toBeInTheDocument();
    });

    it("shows external link button when job has URL", () => {
      const { container } = renderWithProviders(<JobCard job={mockJob} />);
      const externalLink = container.querySelector('a[href="https://example.com/job/1"]');
      expect(externalLink).toBeInTheDocument();
      expect(externalLink).toHaveAttribute("target", "_blank");
      expect(externalLink).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("hides external link button when job has no URL", () => {
      const noUrl = { ...mockJob, url: null };
      const { container } = renderWithProviders(<JobCard job={noUrl} />);
      const externalLinks = container.querySelectorAll('a[target="_blank"]');
      expect(externalLinks.length).toBe(0);
    });

    it("shows delete button only when onDelete callback provided", () => {
      const { rerender } = renderWithProviders(<JobCard job={mockJob} />);
      expect(
        screen.queryByRole("button", { name: /Delete/i })
      ).not.toBeInTheDocument();

      const handleDelete = vi.fn();
      rerender(<JobCard job={mockJob} onDelete={handleDelete} />);
      expect(screen.getByRole("button", { name: /Delete/i })).toBeInTheDocument();
    });
  });

  describe("Score color variants", () => {
    it("renders red badge for low score (< 30)", () => {
      const lowScoreJob = { ...mockJob, score: 20 };
      renderWithProviders(<JobCard job={lowScoreJob} />);
      const scoreBadge = screen.getByText("20");
      expect(scoreBadge).toHaveClass("bg-red-100");
    });

    it("renders yellow badge for medium score (30-60)", () => {
      const mediumScoreJob = { ...mockJob, score: 45 };
      renderWithProviders(<JobCard job={mediumScoreJob} />);
      const scoreBadge = screen.getByText("45");
      expect(scoreBadge).toHaveClass("bg-yellow-100");
    });

    it("renders green badge for high score (> 60)", () => {
      const highScoreJob = { ...mockJob, score: 75 };
      renderWithProviders(<JobCard job={highScoreJob} />);
      const scoreBadge = screen.getByText("75");
      expect(scoreBadge).toHaveClass("bg-green-100");
    });
  });

  describe("Remote type display", () => {
    it("displays '100% Remote' for remote type", () => {
      const remoteJob = { ...mockJob, remote_type: "remote" };
      renderWithProviders(<JobCard job={remoteJob} />);
      expect(screen.getByText("100% Remote")).toBeInTheDocument();
    });

    it("displays 'Hybrid' for hybrid type", () => {
      renderWithProviders(<JobCard job={mockJob} />);
      expect(screen.getByText("Hybrid")).toBeInTheDocument();
    });

    it("displays 'On-site' for on-site type", () => {
      const onSiteJob = { ...mockJob, remote_type: "on-site" };
      renderWithProviders(<JobCard job={onSiteJob} />);
      expect(screen.getByText("On-site")).toBeInTheDocument();
    });
  });

  describe("Button interactions", () => {
    it("calls onApply when Apply button is clicked", async () => {
      const user = userEvent.setup();
      const handleApply = vi.fn();
      renderWithProviders(<JobCard job={mockJob} onApply={handleApply} />);

      const applyButton = screen.getByRole("button", { name: /Apply/i });
      await user.click(applyButton);

      expect(handleApply).toHaveBeenCalledTimes(1);
    });

    it("calls onArchive when Archive button is clicked", async () => {
      const user = userEvent.setup();
      const handleArchive = vi.fn();
      renderWithProviders(<JobCard job={mockJob} onArchive={handleArchive} />);

      const archiveButton = screen.getByRole("button", { name: /Archive/i });
      await user.click(archiveButton);

      expect(handleArchive).toHaveBeenCalledTimes(1);
    });

    it("calls onDelete when Delete button is clicked", async () => {
      const user = userEvent.setup();
      const handleDelete = vi.fn();
      renderWithProviders(<JobCard job={mockJob} onDelete={handleDelete} />);

      const deleteButton = screen.getByRole("button", { name: /Delete/i });
      await user.click(deleteButton);

      expect(handleDelete).toHaveBeenCalledTimes(1);
    });

    it("calls onClick when card is clicked", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      renderWithProviders(<JobCard job={mockJob} onClick={handleClick} />);

      const card = screen.getByText("Senior React Developer").closest("div");
      if (card?.parentElement) {
        await user.click(card.parentElement);
      }

      expect(handleClick).toHaveBeenCalled();
    });

    it("stops propagation when action buttons are clicked", async () => {
      const user = userEvent.setup();
      const handleCardClick = vi.fn();
      const handleApply = vi.fn();
      renderWithProviders(
        <JobCard job={mockJob} onClick={handleCardClick} onApply={handleApply} />
      );

      const applyButton = screen.getByRole("button", { name: /Apply/i });
      await user.click(applyButton);

      expect(handleApply).toHaveBeenCalled();
      expect(handleCardClick).not.toHaveBeenCalled();
    });
  });

  describe("Badges display", () => {
    it("renders source badge", () => {
      renderWithProviders(<JobCard job={mockJob} />);
      expect(screen.getByText("LinkedIn")).toBeInTheDocument();
    });

    it("renders status through StatusBadge component", () => {
      renderWithProviders(<JobCard job={mockJob} />);
      expect(screen.getByText("new")).toBeInTheDocument();
    });

    it("renders all location-related badges", () => {
      renderWithProviders(<JobCard job={mockJob} />);
      const badges = screen.getAllByText(/San Francisco|Hybrid|LinkedIn/);
      expect(badges.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe("Card layout and styling", () => {
    it("renders as a card component with proper classes", () => {
      const { container } = renderWithProviders(<JobCard job={mockJob} />);
      const card = container.querySelector(".hover\\:shadow-md");
      expect(card).toBeInTheDocument();
    });

    it("applies selectable styling when isSelectable is true", () => {
      const { container } = renderWithProviders(
        <JobCard job={mockJob} isSelectable={true} />
      );
      const card = container.querySelector(".border-primary\\/50");
      expect(card).toBeInTheDocument();
    });

    it("applies transition classes for hover effects", () => {
      const { container } = renderWithProviders(<JobCard job={mockJob} />);
      const card = container.querySelector(".transition-all");
      expect(card).toBeInTheDocument();
    });
  });

  describe("Requirements display", () => {
    it("shows Requirements section when available", () => {
      renderWithProviders(<JobCard job={mockJob} />);
      expect(screen.getByText("Requirements:")).toBeInTheDocument();
    });

    it("displays requirements as comma-separated list", () => {
      renderWithProviders(<JobCard job={mockJob} />);
      expect(screen.getByText("React, TypeScript, Node.js")).toBeInTheDocument();
    });

    it("displays requirements in muted background", () => {
      const { container } = renderWithProviders(<JobCard job={mockJob} />);
      const reqSection = screen.getByText("React, TypeScript, Node.js").closest(".bg-muted");
      expect(reqSection).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has proper heading hierarchy for title", () => {
      renderWithProviders(<JobCard job={mockJob} />);
      const title = screen.getByText("Senior React Developer");
      expect(title.tagName.toLowerCase()).toBe("h3");
    });

    it("external link has proper accessibility attributes", () => {
      const { container } = renderWithProviders(<JobCard job={mockJob} />);
      const externalLink = container.querySelector('a[target="_blank"]');
      expect(externalLink).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("buttons are keyboard accessible", () => {
      renderWithProviders(<JobCard job={mockJob} />);
      const buttons = screen.getAllByRole("button");
      buttons.forEach((button) => {
        expect(button).toBeVisible();
      });
    });
  });

  describe("Salary formatting", () => {
    it("formats salary to thousands abbreviation", () => {
      renderWithProviders(<JobCard job={mockJob} />);
      expect(screen.getByText("$120K - $160K")).toBeInTheDocument();
    });

    it("handles large salaries correctly", () => {
      const largeJob = {
        ...mockJob,
        salary_min: 250000,
        salary_max: 350000,
      };
      renderWithProviders(<JobCard job={largeJob} />);
      expect(screen.getByText("$250K - $350K")).toBeInTheDocument();
    });
  });
});
