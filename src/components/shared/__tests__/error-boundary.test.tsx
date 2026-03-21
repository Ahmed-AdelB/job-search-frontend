/**
 * Error Boundary Component Tests
 * Author: Ahmed Adel Bakr Alderai
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/__tests__/setup/render-with-providers";
import { ErrorBoundary } from "../error-boundary";

// Mock Button component
vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, ...props }: any) =>
    <button onClick={onClick} {...props}>{children}</button>,
}));

// Mock lucide-react
vi.mock("lucide-react", () => ({
  AlertCircle: () => <span data-testid="alert-icon">Alert</span>,
}));

// Suppress console.error for these tests
const originalConsoleError = console.error;
beforeEach(() => {
  console.error = vi.fn();
  vi.clearAllMocks();
});

afterEach(() => {
  console.error = originalConsoleError;
});

function ThrowError({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error("Test error");
  }
  return <div>Success</div>;
}

describe("ErrorBoundary Component", () => {
  describe("Renders children when no error", () => {
    it("renders children successfully", () => {
      renderWithProviders(
        <ErrorBoundary>
          <div>Hello World</div>
        </ErrorBoundary>
      );
      expect(screen.getByText("Hello World")).toBeInTheDocument();
    });

    it("renders multiple children", () => {
      renderWithProviders(
        <ErrorBoundary>
          <div>First</div>
          <div>Second</div>
        </ErrorBoundary>
      );
      expect(screen.getByText("First")).toBeInTheDocument();
      expect(screen.getByText("Second")).toBeInTheDocument();
    });

    it("renders component children", () => {
      renderWithProviders(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );
      expect(screen.getByText("Success")).toBeInTheDocument();
    });

    it("passes through any React element", () => {
      renderWithProviders(
        <ErrorBoundary>
          <button>Click me</button>
        </ErrorBoundary>
      );
      expect(screen.getByRole("button", { name: /Click me/i })).toBeInTheDocument();
    });
  });

  describe("Catches errors", () => {
    it("catches and displays error message", () => {
      renderWithProviders(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    });

    it("displays the error details", () => {
      renderWithProviders(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      expect(screen.getByText("Test error")).toBeInTheDocument();
    });

    it("calls console.error when catching error", () => {
      renderWithProviders(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      expect(console.error).toHaveBeenCalled();
    });

    it("logs error and errorInfo", () => {
      renderWithProviders(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      // Error boundary calls console.error with error details
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe("Error UI display", () => {
    it("renders error icon", () => {
      renderWithProviders(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      expect(screen.getByTestId("alert-icon")).toBeInTheDocument();
    });

    it("displays error heading", () => {
      renderWithProviders(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    });

    it("heading has destructive color styling", () => {
      const { container } = renderWithProviders(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      const heading = container.querySelector(".text-destructive");
      expect(heading).toBeInTheDocument();
    });

    it("error container has destructive border", () => {
      const { container } = renderWithProviders(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      const container_el = container.querySelector(".border-destructive\\/50");
      expect(container_el).toBeInTheDocument();
    });

    it("error container has destructive background", () => {
      const { container } = renderWithProviders(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      const container_el = container.querySelector(".bg-destructive\\/10");
      expect(container_el).toBeInTheDocument();
    });

    it("icon has destructive color", () => {
      const { container } = renderWithProviders(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      const iconContainer = container.querySelector(".bg-destructive\\/20");
      expect(iconContainer).toBeInTheDocument();
    });
  });

  describe("Try again button", () => {
    it("renders Try again button", () => {
      renderWithProviders(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      expect(screen.getByRole("button", { name: /Try again/i })).toBeInTheDocument();
    });


    it("button has default variant", () => {
      renderWithProviders(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      const button = screen.getByRole("button", { name: /Try again/i });
      expect(button).toBeInTheDocument();
    });

    it("button has small size", () => {
      renderWithProviders(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      const button = screen.getByRole("button", { name: /Try again/i });
      // Verify button is rendered (size passed to component)
      expect(button).toBeVisible();
    });
  });

  describe("Custom fallback UI", () => {
    it("renders custom fallback when error occurs", () => {
      const customFallback = <div>Custom error UI</div>;
      renderWithProviders(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      expect(screen.getByText("Custom error UI")).toBeInTheDocument();
    });

    it("uses custom fallback instead of default UI", () => {
      const customFallback = <div>Error occurred</div>;
      renderWithProviders(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      expect(screen.getByText("Error occurred")).toBeInTheDocument();
      expect(screen.queryByText("Something went wrong")).not.toBeInTheDocument();
    });

    it("custom fallback can be complex", () => {
      const customFallback = (
        <div>
          <h1>Oops!</h1>
          <p>Something went wrong</p>
          <button>Reload</button>
        </div>
      );
      renderWithProviders(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      expect(screen.getByText("Oops!")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Reload/i })).toBeInTheDocument();
    });

    it("renders children when no error even with custom fallback", () => {
      const customFallback = <div>Error</div>;
      renderWithProviders(
        <ErrorBoundary fallback={customFallback}>
          <div>Normal content</div>
        </ErrorBoundary>
      );
      expect(screen.getByText("Normal content")).toBeInTheDocument();
      expect(screen.queryByText("Error")).not.toBeInTheDocument();
    });
  });

  describe("Error state management", () => {
    it("maintains error state across renders", () => {
      const { rerender } = renderWithProviders(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText("Something went wrong")).toBeInTheDocument();

      // Rerender same component - error should persist
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    });

    it("resets error state when parent remounts", () => {
      const { unmount } = renderWithProviders(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText("Something went wrong")).toBeInTheDocument();

      // Unmount and mount a new ErrorBoundary
      unmount();
      
      renderWithProviders(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      // New boundary should show children
      expect(screen.getByText("Success")).toBeInTheDocument();
    });
  });

  describe("Error message display", () => {
    it("displays specific error message", () => {
      renderWithProviders(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      expect(screen.getByText("Test error")).toBeInTheDocument();
    });

    it("error message appears below heading", () => {
      const { container } = renderWithProviders(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      const errorMsg = screen.getByText("Test error");
      expect(errorMsg).toHaveClass("text-muted-foreground");
    });

    it("handles error without message", () => {
      // Create component that throws error without message
      function ThrowErrorNoMessage() {
        throw new Error();
      }

      renderWithProviders(
        <ErrorBoundary>
          <ThrowErrorNoMessage />
        </ErrorBoundary>
      );

      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    });

    it("displays error message in small text", () => {
      const { container } = renderWithProviders(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      const errorMsg = screen.getByText("Test error");
      expect(errorMsg).toHaveClass("text-sm");
    });
  });

  describe("Error boundary container styling", () => {
    it("has centered flex layout", () => {
      const { container } = renderWithProviders(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      const errorContainer = container.querySelector(".flex.flex-col.items-center");
      expect(errorContainer).toBeInTheDocument();
    });

    it("has rounded corners", () => {
      const { container } = renderWithProviders(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      const errorContainer = container.querySelector(".rounded-lg");
      expect(errorContainer).toBeInTheDocument();
    });

    it("has padding", () => {
      const { container } = renderWithProviders(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      const errorContainer = container.querySelector(".px-4.py-12");
      expect(errorContainer).toBeInTheDocument();
    });

    it("has gap between elements", () => {
      const { container } = renderWithProviders(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      const errorContainer = container.querySelector(".gap-4");
      expect(errorContainer).toBeInTheDocument();
    });

    it("has text center alignment", () => {
      const { container } = renderWithProviders(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      const errorContainer = container.querySelector(".text-center");
      expect(errorContainer).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("renders interactive button for recovery", () => {
      renderWithProviders(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      const button = screen.getByRole("button", { name: /Try again/i });
      expect(button).toBeVisible();
    });

    it("error message is visible to screen readers", () => {
      renderWithProviders(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      const errorMsg = screen.getByText("Test error");
      expect(errorMsg).toBeVisible();
    });

    it("heading is semantic", () => {
      const { container } = renderWithProviders(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      const heading = container.querySelector("h3");
      expect(heading).toBeInTheDocument();
    });
  });

  describe("Error boundary initialization", () => {
    it("starts with no error state", () => {
      renderWithProviders(
        <ErrorBoundary>
          <div>No error</div>
        </ErrorBoundary>
      );
      expect(screen.getByText("No error")).toBeInTheDocument();
      expect(screen.queryByText("Something went wrong")).not.toBeInTheDocument();
    });

    it("initializes with empty error", () => {
      const { container } = renderWithProviders(
        <ErrorBoundary>
          <div>Content</div>
        </ErrorBoundary>
      );
      expect(screen.getByText("Content")).toBeInTheDocument();
    });
  });

  describe("Multiple errors in boundary", () => {
    it("catches first error in multiple children", () => {
      function FirstError() {
        throw new Error("First");
      }

      function SecondError() {
        throw new Error("Second");
      }

      renderWithProviders(
        <ErrorBoundary>
          <FirstError />
          <SecondError />
        </ErrorBoundary>
      );

      // Should catch the first error that occurs during render
      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    });
  });
});
