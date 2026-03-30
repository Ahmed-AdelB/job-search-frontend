/**
 * Accessibility Tests
 * Author: Ahmed Adel Bakr Alderai
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("Accessibility", () => {
  describe("Button Accessibility", () => {
    it("buttons should have accessible names", () => {
      render(
        <div>
          <button aria-label="Delete job">X</button>
          <button>Save Changes</button>
        </div>
      );

      expect(screen.getByRole("button", { name: "Delete job" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Save Changes" })).toBeInTheDocument();
    });

    it("icon-only buttons must have aria-label", () => {
      render(
        <button aria-label="Close dialog">
          <svg data-testid="close-icon" />
        </button>
      );

      const button = screen.getByRole("button", { name: "Close dialog" });
      expect(button).toHaveAttribute("aria-label");
    });
  });

  describe("Form Label Association", () => {
    it("inputs should have associated labels via htmlFor", () => {
      render(
        <form>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" />
          <label htmlFor="password">Password</label>
          <input id="password" type="password" />
        </form>
      );

      expect(screen.getByLabelText("Email")).toBeInTheDocument();
      expect(screen.getByLabelText("Password")).toBeInTheDocument();
    });

    it("inputs with placeholder should still be findable", () => {
      render(<input placeholder="Search jobs..." />);
      expect(screen.getByPlaceholderText("Search jobs...")).toBeInTheDocument();
    });
  });

  describe("Keyboard Navigation", () => {
    it("should be able to tab through form elements", async () => {
      const user = userEvent.setup();

      render(
        <form>
          <input data-testid="input-1" />
          <input data-testid="input-2" />
          <button data-testid="submit">Submit</button>
        </form>
      );

      await user.tab();
      expect(screen.getByTestId("input-1")).toHaveFocus();

      await user.tab();
      expect(screen.getByTestId("input-2")).toHaveFocus();

      await user.tab();
      expect(screen.getByTestId("submit")).toHaveFocus();
    });

    it("disabled buttons should not receive focus via tab", async () => {
      const user = userEvent.setup();

      render(
        <div>
          <input data-testid="input-1" />
          <button disabled data-testid="disabled-btn">
            Disabled
          </button>
          <button data-testid="enabled-btn">Enabled</button>
        </div>
      );

      await user.tab();
      expect(screen.getByTestId("input-1")).toHaveFocus();

      await user.tab();
      // Should skip disabled button
      expect(screen.getByTestId("enabled-btn")).toHaveFocus();
    });
  });

  describe("Dialog/Modal Accessibility", () => {
    it("dialog should have role=dialog", () => {
      render(
        <div role="dialog" aria-label="Confirm delete" aria-modal="true">
          <p>Are you sure?</p>
          <button>Cancel</button>
          <button>Confirm</button>
        </div>
      );

      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByRole("dialog")).toHaveAttribute("aria-label", "Confirm delete");
      expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
    });

    it("escape key should be handled on dialogs", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(
        <div
          role="dialog"
          aria-label="Test dialog"
          tabIndex={-1}
          onKeyDown={(e) => {
            if (e.key === "Escape") onClose();
          }}
        >
          <p>Content</p>
        </div>
      );

      const dialog = screen.getByRole("dialog");
      dialog.focus();
      await user.keyboard("{Escape}");

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe("ARIA Attributes", () => {
    it("loading spinner should have aria-busy", () => {
      render(
        <div aria-busy="true" aria-label="Loading jobs">
          <div data-testid="spinner" />
        </div>
      );

      const loadingRegion = screen.getByLabelText("Loading jobs");
      expect(loadingRegion).toHaveAttribute("aria-busy", "true");
    });

    it("progress bars should have proper ARIA", () => {
      render(
        <div role="progressbar" aria-valuenow={65} aria-valuemin={0} aria-valuemax={100} aria-label="Application progress">
          65%
        </div>
      );

      const progressbar = screen.getByRole("progressbar");
      expect(progressbar).toHaveAttribute("aria-valuenow", "65");
      expect(progressbar).toHaveAttribute("aria-valuemin", "0");
      expect(progressbar).toHaveAttribute("aria-valuemax", "100");
    });
  });
});
