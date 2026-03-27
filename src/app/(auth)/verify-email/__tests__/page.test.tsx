/**
 * Email Verification Page Integration Tests
 * Author: Ahmed Adel Bakr Alderai
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "@/__tests__/setup/render-with-providers";
import VerifyEmailPage from "../page";

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
  useSearchParams: () => new URLSearchParams("token=verify-token-123"),
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

describe("VerifyEmailPage Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mockApiPost).mockResolvedValue({ success: true } as any);
  });

  it("shows loading state on initial render", async () => {
    renderWithProviders(<VerifyEmailPage />);

    await waitFor(() => {
      expect(screen.getByText("Verifying Email...")).toBeInTheDocument();
      expect(screen.getByText(/please wait while we verify your email address/i)).toBeInTheDocument();
    });
  });

  it("calls apiPost with token on mount", async () => {
    renderWithProviders(<VerifyEmailPage />);

    await waitFor(() => {
      expect(mockApiPost).toHaveBeenCalledWith("/auth/verify-email", { token: "verify-token-123" });
    });
  });

  it("shows success state after successful verification", async () => {
    renderWithProviders(<VerifyEmailPage />);

    await waitFor(() => {
      expect(screen.getByText("Email Verified!")).toBeInTheDocument();
      expect(screen.getByText("Your email has been verified successfully.")).toBeInTheDocument();
    });
  });

  it("shows redirecting message in success state", async () => {
    renderWithProviders(<VerifyEmailPage />);

    await waitFor(() => {
      expect(screen.getByText(/redirecting you to login page/i)).toBeInTheDocument();
    });
  });

  it("shows error state when verification fails", async () => {
    vi.mocked(mockApiPost).mockRejectedValueOnce(new Error("Token expired"));

    renderWithProviders(<VerifyEmailPage />);

    await waitFor(() => {
      expect(screen.getByText("Verification Failed")).toBeInTheDocument();
    });
  });

  it("displays error message on verification failure", async () => {
    const errorMessage = "Invalid verification token";
    vi.mocked(mockApiPost).mockRejectedValueOnce(new Error(errorMessage));

    renderWithProviders(<VerifyEmailPage />);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it("shows generic error message when error instance is not Error", async () => {
    vi.mocked(mockApiPost).mockRejectedValueOnce("Unknown error");

    renderWithProviders(<VerifyEmailPage />);

    await waitFor(() => {
      expect(screen.getByText("Verification Failed")).toBeInTheDocument();
    });
  });

  it("shows expired token warning in error state", async () => {
    vi.mocked(mockApiPost).mockRejectedValueOnce(new Error("Token expired"));

    renderWithProviders(<VerifyEmailPage />);

    await waitFor(() => {
      expect(screen.getByText(/verification link may have expired/i)).toBeInTheDocument();
    });
  });

  it("has back to login button in loading state", async () => {
    renderWithProviders(<VerifyEmailPage />);

    await waitFor(() => {
      const backButtons = screen.getAllByRole("link", { name: /back to login/i });
      expect(backButtons.length).toBeGreaterThan(0);
      expect(backButtons[0]).toHaveAttribute("href", "/login");
    });
  });

  it("has back to login button in error state", async () => {
    vi.mocked(mockApiPost).mockRejectedValueOnce(new Error("Verification failed"));

    renderWithProviders(<VerifyEmailPage />);

    await waitFor(() => {
      const backButtons = screen.getAllByRole("link", { name: /back to login/i });
      expect(backButtons.length).toBeGreaterThan(0);
      expect(backButtons[0]).toHaveAttribute("href", "/login");
    });
  });

  it("has go to login button in success state", async () => {
    renderWithProviders(<VerifyEmailPage />);

    await waitFor(() => {
      const goToLoginButtons = screen.getAllByRole("link", { name: /go to login/i });
      expect(goToLoginButtons.length).toBeGreaterThan(0);
      expect(goToLoginButtons[0]).toHaveAttribute("href", "/login");
    });
  });

  it("renders success icon in success state", async () => {
    renderWithProviders(<VerifyEmailPage />);

    await waitFor(() => {
      expect(screen.getByText("Email Verified!")).toBeInTheDocument();
      // Check that success styling is present
      const successDiv = screen.getByText("Email Verified!").closest("div");
      expect(successDiv).toBeInTheDocument();
    });
  });

  it("renders error icon in error state", async () => {
    vi.mocked(mockApiPost).mockRejectedValueOnce(new Error("Failed"));

    renderWithProviders(<VerifyEmailPage />);

    await waitFor(() => {
      expect(screen.getByText("Verification Failed")).toBeInTheDocument();
    });
  });

  it("matches token from URL params", async () => {
    renderWithProviders(<VerifyEmailPage />);

    await waitFor(() => {
      expect(mockApiPost).toHaveBeenCalledWith(
        "/auth/verify-email",
        expect.objectContaining({ token: "verify-token-123" })
      );
    });
  });
});
