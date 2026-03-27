/**
 * Contacts Page Integration Tests
 * Author: Ahmed Adel Bakr Alderai
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithProviders } from "@/__tests__/setup/render-with-providers";
import ContactsPage from "../page";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock API calls
vi.mock("@/lib/api-client", () => ({
  apiGet: vi.fn(),
  apiDelete: vi.fn(),
}));

// Mock React Query
vi.mock("@tanstack/react-query", async () => {
  const actual = await vi.importActual("@tanstack/react-query");
  return {
    ...actual,
    useQuery: vi.fn(() => ({
      data: { contacts: [], total: 0 },
      isLoading: false,
    })),
    useMutation: vi.fn(() => ({
      mutate: vi.fn(),
      isPending: false,
    })),
    useQueryClient: vi.fn(() => ({
      invalidateQueries: vi.fn(),
    })),
  };
});

import { useQuery } from "@tanstack/react-query";

describe("ContactsPage Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders page with title", () => {
    renderWithProviders(<ContactsPage />);
    expect(screen.getByText("Contacts")).toBeInTheDocument();
  });

  it("displays subtitle about managing network", () => {
    renderWithProviders(<ContactsPage />);
    expect(screen.getByText("Manage your professional network")).toBeInTheDocument();
  });

  it("displays Import CSV button", () => {
    renderWithProviders(<ContactsPage />);
    const importButton = screen.getByRole("button", { name: /import csv/i });
    expect(importButton).toBeInTheDocument();
  });

  it("displays Add Contact button", () => {
    renderWithProviders(<ContactsPage />);
    const addButton = screen.getByRole("button", { name: /add contact/i });
    expect(addButton).toBeInTheDocument();
  });

  it("displays search input field", () => {
    renderWithProviders(<ContactsPage />);
    const searchInput = screen.getByPlaceholderText(/search by name, company, or title/i);
    expect(searchInput).toBeInTheDocument();
  });

  it("allows typing in search field", () => {
    renderWithProviders(<ContactsPage />);
    const searchInput = screen.getByPlaceholderText(/search by name, company, or title/i) as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: "John" } });
    expect(searchInput.value).toBe("John");
  });

  it("displays Your Contacts card title", () => {
    renderWithProviders(<ContactsPage />);
    expect(screen.getByText("Your Contacts")).toBeInTheDocument();
  });

  it("displays contacts count description", () => {
    renderWithProviders(<ContactsPage />);
    expect(screen.getByText(/contacts in your network/i)).toBeInTheDocument();
  });

  it("displays table headers when contacts exist", () => {
    (useQuery as any).mockReturnValue({
      data: {
        contacts: [
          { linkedin_id: "1", first_name: "John", last_name: "Doe", company: "Acme", position: "Dev", score: 80, email: "j@d.com", connected_on: "2025-01-01" },
        ],
        total: 1,
      },
      isLoading: false,
    });
    renderWithProviders(<ContactsPage />);
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Company")).toBeInTheDocument();
    expect(screen.getByText("Position")).toBeInTheDocument();
    expect(screen.getByText("Score")).toBeInTheDocument();
    expect(screen.getByText("Connected")).toBeInTheDocument();
  });

  it("renders page structure correctly", () => {
    renderWithProviders(<ContactsPage />);
    const heading = screen.getByText("Contacts");
    expect(heading).toBeInTheDocument();
  });

  it("renders all main sections", () => {
    const { container } = renderWithProviders(<ContactsPage />);
    expect(container).toBeInTheDocument();
    expect(screen.getByText("Contacts")).toBeInTheDocument();
  });
});
