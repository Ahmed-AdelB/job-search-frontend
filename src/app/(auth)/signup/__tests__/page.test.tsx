/**
 * Signup Page Integration Tests
 * Author: Ahmed Adel Bakr Alderai
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/__tests__/setup/render-with-providers";
import SignupPage from "../page";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => new URLSearchParams(),
}));

// Mock auth store
const mockSignup = vi.fn();
const mockClearError = vi.fn();
vi.mock("@/stores/auth-store", () => ({
  useAuthStore: () => ({
    signup: mockSignup,
    error: null,
    clearError: mockClearError,
    isAuthenticated: false,
  }),
}));

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("SignupPage Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignup.mockResolvedValue(true);
  });

  it("renders signup form with name, email, password, and confirm password inputs", async () => {
    renderWithProviders(<SignupPage />);

    await waitFor(() => {
      // Check for form description
      expect(screen.getByText("Start your AI-powered job search")).toBeInTheDocument();

      // Check for name input
      const nameInput = screen.getByRole("textbox", { name: /full name/i });
      expect(nameInput).toBeInTheDocument();
      expect(nameInput).toHaveAttribute("placeholder", "John Doe");

      // Check for email input
      const emailInput = screen.getByRole("textbox", { name: /email/i });
      expect(emailInput).toBeInTheDocument();
      expect(emailInput).toHaveAttribute("type", "email");
      expect(emailInput).toHaveAttribute("placeholder", "name@example.com");

      // Check for password inputs using getLabelText
      const passwordInput = screen.getByLabelText(/^password/i);
      expect(passwordInput).toBeInTheDocument();
      expect(passwordInput).toHaveAttribute("type", "password");

      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      expect(confirmPasswordInput).toBeInTheDocument();
      expect(confirmPasswordInput).toHaveAttribute("type", "password");

      // Check for submit button
      const submitButton = screen.getByRole("button", { name: /create account/i });
      expect(submitButton).toBeInTheDocument();
    });
  });

  it("submits form with valid data and calls signup function", async () => {
    const user = userEvent.setup();
    renderWithProviders(<SignupPage />);

    await waitFor(() => {
      expect(screen.getByRole("textbox", { name: /email/i })).toBeInTheDocument();
    });

    const nameInput = screen.getByRole("textbox", { name: /full name/i });
    const emailInput = screen.getByRole("textbox", { name: /email/i });
    const passwordInput = screen.getByLabelText(/^password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole("button", { name: /create account/i });

    await user.type(nameInput, "John Doe");
    await user.type(emailInput, "user@example.com");
    await user.type(passwordInput, "password123");
    await user.type(confirmPasswordInput, "password123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalledWith("user@example.com", "password123");
    });
  });

  it("shows validation error when passwords do not match", async () => {
    const user = userEvent.setup();
    renderWithProviders(<SignupPage />);

    await waitFor(() => {
      expect(screen.getByRole("textbox", { name: /email/i })).toBeInTheDocument();
    });

    const emailInput = screen.getByRole("textbox", { name: /email/i });
    const passwordInput = screen.getByLabelText(/^password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole("button", { name: /create account/i });

    await user.type(emailInput, "user@example.com");
    await user.type(passwordInput, "password123");
    await user.type(confirmPasswordInput, "password456");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
    });
  });

  it("shows validation error when password is less than 8 characters", async () => {
    const user = userEvent.setup();
    renderWithProviders(<SignupPage />);

    await waitFor(() => {
      expect(screen.getByRole("textbox", { name: /email/i })).toBeInTheDocument();
    });

    const emailInput = screen.getByRole("textbox", { name: /email/i });
    const passwordInput = screen.getByLabelText(/^password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole("button", { name: /create account/i });

    await user.type(emailInput, "user@example.com");
    await user.type(passwordInput, "pass123");
    await user.type(confirmPasswordInput, "pass123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Password must be at least 8 characters")).toBeInTheDocument();
    });
  });

  it("has link to login page", async () => {
    renderWithProviders(<SignupPage />);

    await waitFor(() => {
      const loginLink = screen.getByRole("link", { name: /sign in/i });
      expect(loginLink).toBeInTheDocument();
      expect(loginLink).toHaveAttribute("href", "/login");
    });
  });

  it("shows loading state while submitting", async () => {
    const user = userEvent.setup();
    mockSignup.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve(true), 100);
        })
    );

    renderWithProviders(<SignupPage />);

    await waitFor(() => {
      expect(screen.getByRole("textbox", { name: /email/i })).toBeInTheDocument();
    });

    const emailInput = screen.getByRole("textbox", { name: /email/i });
    const passwordInput = screen.getByLabelText(/^password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole("button", { name: /create account/i });

    await user.type(emailInput, "user@example.com");
    await user.type(passwordInput, "password123");
    await user.type(confirmPasswordInput, "password123");
    await user.click(submitButton);

    // Check for loading state
    await waitFor(() => {
      const creatingButton = screen.queryByRole("button", { name: /creating account/i });
      expect(creatingButton).toBeInTheDocument();
    });
  });

  it("redirects to login after successful signup", async () => {
    const user = userEvent.setup();
    renderWithProviders(<SignupPage />);

    await waitFor(() => {
      expect(screen.getByRole("textbox", { name: /email/i })).toBeInTheDocument();
    });

    const emailInput = screen.getByRole("textbox", { name: /email/i });
    const passwordInput = screen.getByLabelText(/^password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole("button", { name: /create account/i });

    await user.type(emailInput, "user@example.com");
    await user.type(passwordInput, "password123");
    await user.type(confirmPasswordInput, "password123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });

  it("toggles password visibility when eye icon is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<SignupPage />);

    await waitFor(() => {
      expect(screen.getByRole("textbox", { name: /email/i })).toBeInTheDocument();
    });

    const passwordInput = screen.getByLabelText(/^password/i) as HTMLInputElement;
    expect(passwordInput).toBeInTheDocument();
    expect(passwordInput.type).toBe("password");

    // Find the password visibility toggle button
    const eyeButton = passwordInput.parentElement?.querySelector("button");
    expect(eyeButton).toBeInTheDocument();

    if (eyeButton) {
      // Click to show password
      await user.click(eyeButton);
      await waitFor(() => {
        expect(passwordInput.type).toBe("text");
      });

      // Click to hide password
      await user.click(eyeButton);
      await waitFor(() => {
        expect(passwordInput.type).toBe("password");
      });
    }
  });

  it("renders with email input required attribute", async () => {
    renderWithProviders(<SignupPage />);

    await waitFor(() => {
      const emailInput = screen.getByRole("textbox", { name: /email/i }) as HTMLInputElement;
      expect(emailInput.required).toBe(true);
    });
  });
});
