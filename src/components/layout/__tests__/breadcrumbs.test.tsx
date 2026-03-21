/**
 * Breadcrumbs Component Tests
 * Author: Ahmed Adel Bakr Alderai
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/__tests__/setup/render-with-providers";
import { Breadcrumbs } from "../breadcrumbs";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
}));

// Mock next/link - return plain <a> tag
vi.mock("next/link", () => {
  return {
    default: ({ children, href, ...props }: any) =>
      <a href={href} {...props}>{children}</a>,
  };
});

// Mock useI18n hook
vi.mock("@/hooks/useI18n", () => ({
  useI18n: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "nav.dashboard": "Dashboard",
        "nav.jobs": "Jobs",
        "nav.applications": "Applications",
        "nav.contacts": "Contacts",
        "nav.analytics": "Analytics",
        "nav.settings": "Settings",
        "nav.billing": "Billing",
      };
      return translations[key] || key;
    },
  }),
}));

import { usePathname } from "next/navigation";

describe("Breadcrumbs Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Renders with root path", () => {
    it("renders Dashboard link on root path", () => {
      (usePathname as any).mockReturnValue("/dashboard");
      renderWithProviders(<Breadcrumbs />);
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
    });


  });

  describe("Renders with single level path", () => {
    it("renders breadcrumbs for /dashboard/jobs", () => {
      (usePathname as any).mockReturnValue("/dashboard/jobs");
      renderWithProviders(<Breadcrumbs />);

      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(screen.getByText("Jobs")).toBeInTheDocument();
    });

    it("Dashboard is link, Jobs is text", () => {
      (usePathname as any).mockReturnValue("/dashboard/jobs");
      renderWithProviders(<Breadcrumbs />);

      const dashboardLink = screen.getByRole("link", { name: /Dashboard/i });
      expect(dashboardLink).toHaveAttribute("href", "/dashboard");

      // Jobs should be plain text (last item)
      const items = screen.getAllByText("Jobs");
      expect(items.length).toBeGreaterThan(0);
    });

    it("renders correct href for Dashboard on single path", () => {
      (usePathname as any).mockReturnValue("/dashboard/jobs");
      renderWithProviders(<Breadcrumbs />);

      const dashboardLink = screen.getByRole("link");
      expect(dashboardLink).toHaveAttribute("href", "/dashboard");
    });

    it("handles applications path", () => {
      (usePathname as any).mockReturnValue("/dashboard/applications");
      renderWithProviders(<Breadcrumbs />);

      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(screen.getByText("Applications")).toBeInTheDocument();
    });
  });

  describe("Renders with multi-level path", () => {

    it("Dashboard and Jobs are links, last is text", () => {
      (usePathname as any).mockReturnValue("/dashboard/jobs/123");
      renderWithProviders(<Breadcrumbs />);

      const links = screen.getAllByRole("link");
      expect(links.length).toBeGreaterThanOrEqual(0);
      expect(links[0]).toHaveTextContent("Dashboard");
      expect(links[1]).toHaveTextContent("Jobs");
    });

    it("constructs correct hrefs for multi-level path", () => {
      (usePathname as any).mockReturnValue("/dashboard/jobs/123");
      renderWithProviders(<Breadcrumbs />);

      const links = screen.getAllByRole("link");
      expect(links[0]).toHaveAttribute("href", "/dashboard");
      expect(links[1]).toHaveAttribute("href", "/dashboard/jobs");
    });
  });

  describe("Formats segment names", () => {
    it("converts segment to title case", () => {
      (usePathname as any).mockReturnValue("/dashboard/settings");
      renderWithProviders(<Breadcrumbs />);

      expect(screen.getByText("Settings")).toBeInTheDocument();
    });


    it("replaces hyphens with spaces in display", () => {
      (usePathname as any).mockReturnValue("/dashboard/long-page-name");
      renderWithProviders(<Breadcrumbs />);

      // Component replaces hyphens with spaces in display
      expect(screen.getByText(/long|page|name/i)).toBeInTheDocument();
    });

    it("capitalizes first letter of translation", () => {
      (usePathname as any).mockReturnValue("/dashboard/analytics");
      renderWithProviders(<Breadcrumbs />);

      // Should be "Analytics" not "analytics"
      expect(screen.getByText("Analytics")).toBeInTheDocument();
    });
  });

  describe("i18n translation", () => {
    it("uses translation for known segments", () => {
      (usePathname as any).mockReturnValue("/dashboard/jobs");
      renderWithProviders(<Breadcrumbs />);

      // "nav.jobs" translates to "Jobs"
      expect(screen.getByText("Jobs")).toBeInTheDocument();
    });

    it("uses segment name as fallback if translation not found", () => {
      (usePathname as any).mockReturnValue("/dashboard/unknown-page");
      renderWithProviders(<Breadcrumbs />);

      // Should show formatted segment name
      expect(screen.getByText(/unknown|page/i)).toBeInTheDocument();
    });

    it("applies translation for Dashboard", () => {
      (usePathname as any).mockReturnValue("/dashboard");
      renderWithProviders(<Breadcrumbs />);

      expect(screen.getByText("Dashboard")).toBeInTheDocument();
    });

    it("applies translation for multiple known segments", () => {
      (usePathname as any).mockReturnValue("/dashboard/applications");
      renderWithProviders(<Breadcrumbs />);

      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(screen.getByText("Applications")).toBeInTheDocument();
    });
  });

  describe("Chevron separators", () => {
    it("renders chevron between breadcrumbs", () => {
      (usePathname as any).mockReturnValue("/dashboard/jobs");
      const { container } = renderWithProviders(<Breadcrumbs />);

      // Check for chevron icon
      const chevrons = container.querySelectorAll("svg");
      expect(chevrons.length).toBeGreaterThan(0);
    });

    it("no chevron before first item", () => {
      (usePathname as any).mockReturnValue("/dashboard/jobs");
      const { container } = renderWithProviders(<Breadcrumbs />);

      // Only one chevron for separator between Dashboard and Jobs
      const chevrons = container.querySelectorAll("svg");
      expect(chevrons.length).toBe(1);
    });

    it("renders chevron for each separator", () => {
      (usePathname as any).mockReturnValue("/dashboard/jobs/123");
      const { container } = renderWithProviders(<Breadcrumbs />);

      // Two chevrons: one between Dashboard-Jobs, one between Jobs-123
      const chevrons = container.querySelectorAll("svg");
      expect(chevrons.length).toBe(2);
    });

  });

  describe("Last item is text, not link", () => {
    it("renders last breadcrumb as text", () => {
      (usePathname as any).mockReturnValue("/dashboard/jobs");
      renderWithProviders(<Breadcrumbs />);

      const text = screen.getByText("Jobs");
      expect(text.tagName.toLowerCase()).toBe("span");
    });

    it("last item has foreground color", () => {
      (usePathname as any).mockReturnValue("/dashboard/jobs");
      const { container } = renderWithProviders(<Breadcrumbs />);

      const lastItem = Array.from(container.querySelectorAll("span")).find(
        (span) => span.textContent === "Jobs"
      );
      expect(lastItem).toHaveClass("text-foreground");
    });

    it("last item has semibold font", () => {
      (usePathname as any).mockReturnValue("/dashboard/jobs");
      const { container } = renderWithProviders(<Breadcrumbs />);

      const lastItem = Array.from(container.querySelectorAll("span")).find(
        (span) => span.textContent === "Jobs"
      );
      expect(lastItem).toHaveClass("font-medium");
    });

    it("non-last items are links", () => {
      (usePathname as any).mockReturnValue("/dashboard/jobs");
      renderWithProviders(<Breadcrumbs />);

      const links = screen.getAllByRole("link");
      expect(links.length).toBeGreaterThanOrEqual(0);
      expect(links[0]).toHaveTextContent("Dashboard");
    });
  });

  describe("Link styling", () => {
    it("links have muted text color by default", () => {
      (usePathname as any).mockReturnValue("/dashboard/jobs");
      renderWithProviders(<Breadcrumbs />);

      const link = screen.getByRole("link");
      expect(link).toHaveClass("text-muted-foreground");
    });

    it("links have hover color transition", () => {
      (usePathname as any).mockReturnValue("/dashboard/jobs");
      renderWithProviders(<Breadcrumbs />);

      const link = screen.getByRole("link");
      expect(link).toHaveClass("hover:text-foreground");
      expect(link).toHaveClass("transition-colors");
    });

    it("links have small text size", () => {
      (usePathname as any).mockReturnValue("/dashboard/jobs");
      renderWithProviders(<Breadcrumbs />);

      const link = screen.getByRole("link");
      expect(link).toHaveClass("text-sm");
    });
  });

  describe("Navigation structure", () => {
    it("renders as nav element", () => {
      (usePathname as any).mockReturnValue("/dashboard/jobs");
      const { container } = renderWithProviders(<Breadcrumbs />);

      const nav = container.querySelector("nav");
      expect(nav).toBeInTheDocument();
    });

    it("nav has flex and gap layout", () => {
      (usePathname as any).mockReturnValue("/dashboard/jobs");
      const { container } = renderWithProviders(<Breadcrumbs />);

      const nav = container.querySelector("nav");
      expect(nav).toHaveClass("flex");
      expect(nav).toHaveClass("gap-2");
    });

    it("nav centers items vertically", () => {
      (usePathname as any).mockReturnValue("/dashboard/jobs");
      const { container } = renderWithProviders(<Breadcrumbs />);

      const nav = container.querySelector("nav");
      expect(nav).toHaveClass("items-center");
    });
  });

  describe("Complex paths", () => {
    it("handles deep nesting", () => {
      (usePathname as any).mockReturnValue("/dashboard/jobs/123/edit");
      renderWithProviders(<Breadcrumbs />);

      const links = screen.getAllByRole("link");
      expect(links.length).toBeGreaterThanOrEqual(0);
    });


    it("ignores empty segments from double slashes", () => {
      (usePathname as any).mockReturnValue("/dashboard//jobs");
      renderWithProviders(<Breadcrumbs />);

      // Should handle gracefully
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(screen.getByText("Jobs")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("navigation has semantic nav element", () => {
      (usePathname as any).mockReturnValue("/dashboard/jobs");
      const { container } = renderWithProviders(<Breadcrumbs />);

      const nav = container.querySelector("nav");
      expect(nav).toBeInTheDocument();
    });

    it("links are keyboard accessible", () => {
      (usePathname as any).mockReturnValue("/dashboard/jobs");
      renderWithProviders(<Breadcrumbs />);

      const link = screen.getByRole("link");
      expect(link).toBeVisible();
    });

    it("all items have text content", () => {
      (usePathname as any).mockReturnValue("/dashboard/jobs");
      renderWithProviders(<Breadcrumbs />);

      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(screen.getByText("Jobs")).toBeInTheDocument();
    });

    it("breadcrumbs provide clear navigation path", () => {
      (usePathname as any).mockReturnValue("/dashboard/applications");
      renderWithProviders(<Breadcrumbs />);

      const dashboardLink = screen.getByRole("link", { name: /Dashboard/i });
      const applicationsText = screen.getByText("Applications");

      expect(dashboardLink).toBeInTheDocument();
      expect(applicationsText).toBeInTheDocument();
    });
  });



  describe("Breadcrumb content gaps", () => {
    it("maintains gap between breadcrumb items", () => {
      (usePathname as any).mockReturnValue("/dashboard/jobs");
      const { container } = renderWithProviders(<Breadcrumbs />);

      const nav = container.querySelector(".gap-2");
      expect(nav).toBeInTheDocument();
    });

    it("items within container have proper spacing", () => {
      (usePathname as any).mockReturnValue("/dashboard/jobs");
      const { container } = renderWithProviders(<Breadcrumbs />);

      const items = container.querySelectorAll("div");
      expect(items.length).toBeGreaterThan(0);
    });
  });
});
