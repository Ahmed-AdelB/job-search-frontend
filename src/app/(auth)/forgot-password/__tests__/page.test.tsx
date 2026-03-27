/**
 * Forgot Password Page Integration Tests
 * Author: Ahmed Adel Bakr Alderai
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/__tests__/setup/render-with-providers";
import ForgotPasswordPage from "../page";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock API client - define functions first, then use in mock
vi.mock("@/lib/api-client", () => {
  const mockApiPost = vi.fn();
  return {
    apiPost: mockApiPost,
  };
});

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Import the mocked apiPost after mocking
import { apiPost as mockApiPost } from "@/lib/api-client";

describe("ForgotPasswordPage Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mockApiPost).mockResolvedValue({ success: true } as any);
  });

  it("renders forgot password form with email input and submit button", async () => {
    renderWithProviders(<ForgotPasswordPage />);

    await waitFor(() => {
      // Check for form title
      expect(screen.getByText("Reset Password")).toBeInTheDocument();
      expect(screen.getByText("Enter your email to receive reset instructions")).toBeInTheDocument();

      // Check for email input
      const emailInput = screen.getByRole("textbox", { name: /email/i });
      expect(emailInput).toBeInTheDocument();
      expect(emailInput).toHaveAttribute("type", "email");
      expect(emailInput).toHaveAttribute("placeholder", "name@example.com");

      // Check for submit button
      const submitButton = screen.getByRole("button", { name: /send reset instructions/i });
      expect(submitButton).toBeInTheDocument();
    });
  });

  it("submits form with valid email and calls apiPost", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ForgotPasswordPage />);

    await waitFor(() => {
      expect(screen.getByRole("textbox", { name: /email/i })).toBeInTheDocument();
    });

    const emailInput = screen.getByRole("textbox", { name: /email/i });
    const submitButton = screen.getByRole("button", { name: /send reset instructions/i });

    await user.type(emailInput, "user@example.com");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockApiPost).toHaveBeenCalledWith("/auth/forgot-password", { email: "user@example.com" });
    });
  });

  it("shows loading state while submitting", async () => {
    const user = userEvent.setup();
    vi.mocked(mockApiPost).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve({ success: true }), 100);
        })
    );

    renderWithProviders(<ForgotPasswordPage />);

    await waitFor(() => {
      expect(screen.getByRole("textbox", { name: /email/i })).toBeInTheDocument();
    });

    const emailInput = screen.getByRole("textbox", { name: /email/i });
    const submitButton = screen.getByRole("button", { name: /send reset instructions/i });

    await user.type(emailInput, "user@example.com");
    await user.click(submitButton);

    // Check for loading state
    await waitFor(() => {
      const sendingButton = screen.queryByRole("button", { name: /sending/i });
      expect(sendingButton).toBeInTheDocument();
    });
  });

  it("shows success screen after successful submission", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ForgotPasswordPage />);

    await waitFor(() => {
      expect(screen.getByRole("textbox", { name: /email/i })).toBeInTheDocument();
    });

    const emailInput = screen.getByRole("textbox", { name: /email/i });
    const submitButton = screen.getByRole("button", { name: /send reset instructions/i });

    await user.type(emailInput, "user@example.com");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Check Your Email")).toBeInTheDocument();
      expect(screen.getByText(/We've sent password reset instructions to/i)).toBeInTheDocument();
    });
  });

  it("displays email address in success message", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ForgotPasswordPage />);

    await waitFor(() => {
      expect(screen.getByRole("textbox", { name: /email/i })).toBeInTheDocument();
    });

    const emailInput = screen.getByRole("textbox", { name: /email/i });
    const submitButton = screen.getByRole("button", { name: /send reset instructions/i });

    const testEmail = "test@example.com";
    await user.type(emailInput, testEmail);
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(new RegExp(testEmail))).toBeInTheDocument();
    });
  });

  it("shows spam folder warning in success state", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ForgotPasswordPage />);

    await waitFor(() => {
      expect(screen.getByRole("textbox", { name: /email/i })).toBeInTheDocument();
    });

    const emailInput = screen.getByRole("textbox", { name: /email/i });
    const submitButton = screen.getByRole("button", { name: /send reset instructions/i });

    await user.type(emailInput, "user@example.com");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/check your spam folder/i)).toBeInTheDocument();
    });
  });

  it("has back to login button", async () => {
    renderWithProviders(<ForgotPasswordPage />);

    await waitFor(() => {
      const backButton = screen.getByRole("link", { name: /back to login/i });
      expect(backButton).toBeInTheDocument();
      expect(backButton).toHaveAttribute("href", "/login");
    });
  });

  it("has back to login button in success state", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ForgotPasswordPage />);

    await waitFor(() => {
      expect(screen.getByRole("textbox", { name: /email/i })).toBeInTheDocument();
    });

    const emailInput = screen.getByRole("textbox", { name: /email/i });
    const submitButton = screen.getByRole("button", { name: /send reset instructions/i });

    await user.type(emailInput, "user@example.com");
    await user.click(submitButton);

    await waitFor(() => {
      const backButtons = screen.getAllByRole("link", { name: /back to login/i });
      expect(backButtons.length).toBeGreaterThan(0);
      expect(backButtons[0]).toHaveAttribute("href", "/login");
    });
  });

  it("renders with email input required attribute", async () => {
    renderWithProviders(<ForgotPasswordPage />);

    await waitFor(() => {
      const emailInput = screen.getByRole("textbox", { name: /email/i }) as HTMLInputElement;
      expect(emailInput.required).toBe(true);
    });
  });

  it("handles API error gracefully", async () => {
    const user = userEvent.setup();
    const errorMessage = "Invalid email address";
    vi.mocked(mockApiPost).mockRejectedValueOnce(new Error(errorMessage));

    renderWithProviders(<ForgotPasswordPage />);

    await waitFor(() => {
      expect(screen.getByRole("textbox", { name: /email/i })).toBeInTheDocument();
    });

    const emailInput = screen.getByRole("textbox", { name: /email/i });
    const submitButton = screen.getByRole("button", { name: /send reset instructions/i });

    await user.type(emailInput, "invalid@example.com");
    await user.click(submitButton);

    // Should remain on form, not show success state
    await waitFor(() => {
      expect(screen.getByRole("textbox", { name: /email/i })).toBeInTheDocument();
    });
  });
});
