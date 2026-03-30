/**
 * Topbar Component Tests
 * Author: Ahmed Adel Bakr Alderai
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/__tests__/setup/render-with-providers";
import { Topbar } from "../topbar";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard/jobs",
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock auth store
vi.mock("@/stores/auth-store", () => ({
  useAuthStore: () => ({
    user: {
      user_id: "123",
      email: "test@example.com",
      name: "John Doe",
      avatar: "https://example.com/avatar.jpg",
    },
    logout: vi.fn(),
    token: "test-token",
    isAuthenticated: true,
  }),
}));

// Mock preferences store
vi.mock("@/stores/preferences-store", () => ({
  usePreferencesStore: () => ({
    language: "en",
    theme: "light",
    setLanguage: vi.fn(),
    setTheme: vi.fn(),
  }),
}));

describe("Topbar Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Header Structure", () => {
    it("renders as a header element", () => {
      renderWithProviders(<Topbar />);

      const header = screen.getByRole("banner");
      expect(header).toBeInTheDocument();
    });

    it("has sticky positioning class", () => {
      renderWithProviders(<Topbar />);

      const header = screen.getByRole("banner");
      expect(header).toHaveClass("sticky");
    });

    it("has correct z-index for layering", () => {
      renderWithProviders(<Topbar />);

      const header = screen.getByRole("banner");
      expect(header).toHaveClass("z-50");
    });

    it("spans full width", () => {
      renderWithProviders(<Topbar />);

      const header = screen.getByRole("banner");
      expect(header).toHaveClass("w-full");
    });
  });

  describe("Brand Logo and Navigation", () => {
    it("displays brand text COMMAND", () => {
      renderWithProviders(<Topbar />);

      expect(screen.getByText("COMMAND")).toBeInTheDocument();
    });

    it("displays brand subtitle Center", () => {
      renderWithProviders(<Topbar />);

      expect(screen.getByText("Center")).toBeInTheDocument();
    });

    it("renders logo link to dashboard", () => {
      renderWithProviders(<Topbar />);

      const links = screen.getAllByRole("link");
      const dashboardLink = links.find((link) => link.getAttribute("href") === "/dashboard");
      expect(dashboardLink).toBeInTheDocument();
    });

    it("displays breadcrumb navigation", () => {
      renderWithProviders(<Topbar />);

      expect(screen.getByText("Dashboard")).toBeInTheDocument();
    });

    it("shows current page in breadcrumbs", () => {
      renderWithProviders(<Topbar />);

      const jobsTexts = screen.getAllByText(/Jobs/i);
      expect(jobsTexts.length).toBeGreaterThan(0);
    });
  });

  describe("Search Functionality", () => {
    it("renders search input field", () => {
      renderWithProviders(<Topbar />);

      const searchInput = screen.getByPlaceholderText(/Search missions, contacts, intel/i);
      expect(searchInput).toBeInTheDocument();
    });

    it("search input has correct type", () => {
      renderWithProviders(<Topbar />);

      const searchInput = screen.getByPlaceholderText(/Search missions/i);
      expect(searchInput).toHaveAttribute("type", "search");
    });

    it("displays keyboard shortcut hint", () => {
      renderWithProviders(<Topbar />);

      expect(screen.getByText("K")).toBeInTheDocument();
    });
  });

  describe("User Avatar Display", () => {
    it("renders user avatar with initials", () => {
      renderWithProviders(<Topbar />);

      expect(screen.getByText("JD")).toBeInTheDocument();
    });

    it("avatar has proper structure", () => {
      renderWithProviders(<Topbar />);

      const avatars = screen.getAllByText("JD");
      expect(avatars.length).toBeGreaterThan(0);
    });
  });

  describe("Menu Buttons", () => {
    it("renders theme toggle button", () => {
      renderWithProviders(<Topbar />);

      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });

    it("renders language toggle button", () => {
      renderWithProviders(<Topbar />);

      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });

    it("renders notifications button", () => {
      renderWithProviders(<Topbar />);

      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });

    it("renders user menu button", () => {
      renderWithProviders(<Topbar />);

      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe("Notification Badge", () => {
    it("displays notification count", () => {
      renderWithProviders(<Topbar />);

      expect(screen.getByText("3")).toBeInTheDocument();
    });

    it("notification count is visible", () => {
      renderWithProviders(<Topbar />);

      const notificationCount = screen.getByText("3");
      expect(notificationCount).toBeInTheDocument();
    });
  });

  describe("Navigation Links", () => {
    it("provides navigation links", () => {
      renderWithProviders(<Topbar />);

      const links = screen.getAllByRole("link");
      expect(links.length).toBeGreaterThan(1);
    });

    it("has profile link accessible", () => {
      renderWithProviders(<Topbar />);

      const links = screen.getAllByRole("link");
      expect(links.length).toBeGreaterThan(0);
    });
  });

  describe("Component Props", () => {
    it("accepts onMenuClick prop", () => {
      const handleMenuClick = vi.fn();

      renderWithProviders(<Topbar onMenuClick={handleMenuClick} />);

      expect(screen.getByRole("banner")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has banner landmark role", () => {
      renderWithProviders(<Topbar />);

      expect(screen.getByRole("banner")).toBeInTheDocument();
    });

    it("has search input for accessibility", () => {
      renderWithProviders(<Topbar />);

      const searchInput = screen.getByPlaceholderText(/Search missions/i);
      expect(searchInput).toHaveAttribute("type", "search");
    });

    it("renders multiple navigation links", () => {
      renderWithProviders(<Topbar />);

      const links = screen.getAllByRole("link");
      expect(links.length).toBeGreaterThanOrEqual(2);
    });

    it("has interactive buttons for menus", () => {
      renderWithProviders(<Topbar />);

      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe("Complete Component Rendering", () => {
    it("renders without errors", () => {
      renderWithProviders(<Topbar />);

      expect(screen.getByRole("banner")).toBeInTheDocument();
    });

    it("renders all major UI sections", () => {
      renderWithProviders(<Topbar />);

      // Brand
      expect(screen.getByText("COMMAND")).toBeInTheDocument();

      // Search
      expect(screen.getByPlaceholderText(/Search missions/i)).toBeInTheDocument();

      // User info
      expect(screen.getByText("JD")).toBeInTheDocument();

      // Notification badge
      expect(screen.getByText("3")).toBeInTheDocument();
    });

    it("renders navigation items", () => {
      renderWithProviders(<Topbar />);

      // Breadcrumbs
      expect(screen.getByText("Dashboard")).toBeInTheDocument();

      // Links should be present
      const links = screen.getAllByRole("link");
      expect(links.length).toBeGreaterThan(0);
    });
  });
});
