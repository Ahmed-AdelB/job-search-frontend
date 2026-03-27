/**
 * Login Page Integration Tests
 * Author: Ahmed Adel Bakr Alderai
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/__tests__/setup/render-with-providers";
import LoginPage from "../page";

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
const mockLogin = vi.fn();
const mockClearError = vi.fn();
vi.mock("@/stores/auth-store", () => ({
  useAuthStore: () => ({
    login: mockLogin,
    error: null,
    clearError: mockClearError,
    isAuthenticated: false,
  }),
}));

describe("LoginPage Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLogin.mockResolvedValue(true);
  });

  it("renders login form with email input, password input, and submit button", async () => {
    renderWithProviders(<LoginPage />);

    await waitFor(() => {
      // Check for form title
      expect(screen.getByText("Welcome Back")).toBeInTheDocument();
      expect(screen.getByText("Sign in to your JobFlow account")).toBeInTheDocument();

      // Check for email input
      const emailInput = screen.getByRole("textbox", { name: /email/i });
      expect(emailInput).toBeInTheDocument();
      expect(emailInput).toHaveAttribute("type", "email");
      expect(emailInput).toHaveAttribute("placeholder", "name@example.com");

      // Check for password input
      const passwordInput = screen.getByLabelText(/password/i);
      expect(passwordInput).toBeInTheDocument();
      expect(passwordInput).toHaveAttribute("type", "password");

      // Check for submit button
      const submitButton = screen.getByRole("button", { name: /sign in/i });
      expect(submitButton).toBeInTheDocument();
    });
  });

  it("submits form with valid data and calls login function", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    await waitFor(() => {
      expect(screen.getByRole("textbox", { name: /email/i })).toBeInTheDocument();
    });

    const emailInput = screen.getByRole("textbox", { name: /email/i });
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    await user.type(emailInput, "user@example.com");
    await user.type(passwordInput, "password123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("user@example.com", "password123");
    });
  });

  it("shows validation error when submitting with empty fields", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    await waitFor(() => {
      expect(screen.getByRole("textbox", { name: /email/i })).toBeInTheDocument();
    });

    const submitButton = screen.getByRole("button", { name: /sign in/i });

    // Try to submit with empty fields
    // HTML5 validation will prevent submission
    await user.click(submitButton);

    // Email input should have required attribute
    const emailInput = screen.getByRole("textbox", { name: /email/i }) as HTMLInputElement;
    expect(emailInput.required).toBe(true);

    // Password input should have required attribute
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;
    expect(passwordInput.required).toBe(true);
  });

  it("has link to signup page", async () => {
    renderWithProviders(<LoginPage />);

    await waitFor(() => {
      const signupLink = screen.getByRole("link", { name: /sign up/i });
      expect(signupLink).toBeInTheDocument();
      expect(signupLink).toHaveAttribute("href", "/signup");
    });
  });

  it("has link to forgot-password page", async () => {
    renderWithProviders(<LoginPage />);

    await waitFor(() => {
      const forgotPasswordLink = screen.getByRole("link", { name: /forgot password/i });
      expect(forgotPasswordLink).toBeInTheDocument();
      expect(forgotPasswordLink).toHaveAttribute("href", "/forgot-password");
    });
  });

  it("hides password when eye icon is clicked and shows when clicked again", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    await waitFor(() => {
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;
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

  it("shows loading state while submitting", async () => {
    const user = userEvent.setup();
    mockLogin.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve(true), 100);
        })
    );

    renderWithProviders(<LoginPage />);

    await waitFor(() => {
      expect(screen.getByRole("textbox", { name: /email/i })).toBeInTheDocument();
    });

    const emailInput = screen.getByRole("textbox", { name: /email/i });
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    await user.type(emailInput, "user@example.com");
    await user.type(passwordInput, "password123");
    await user.click(submitButton);

    // Check for loading state
    await waitFor(() => {
      const signingInButton = screen.queryByRole("button", { name: /signing in/i });
      expect(signingInButton).toBeInTheDocument();
    });
  });

  it("redirects to dashboard on successful login", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    await waitFor(() => {
      expect(screen.getByRole("textbox", { name: /email/i })).toBeInTheDocument();
    });

    const emailInput = screen.getByRole("textbox", { name: /email/i });
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    await user.type(emailInput, "user@example.com");
    await user.type(passwordInput, "password123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });
});
