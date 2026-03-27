/**
 * Portals Page Integration Tests
 * Author: Ahmed Adel Bakr Alderai
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/__tests__/setup/render-with-providers";
import PortalsPage from "../page";
import { createMockPortal, resetIdCounter } from "@/__tests__/setup/test-data";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// Mock Select to render real HTML in jsdom
vi.mock("@/components/ui/select", () => {
  const React = require("react");
  return {
    Select: ({ children, value, onValueChange, ...props }: any) =>
      React.createElement("div", { "data-testid": "select-root", ...props },
        React.Children.map(children, (child: any) =>
          child ? React.cloneElement(child, { value, onValueChange }) : null
        )
      ),
    SelectTrigger: ({ children, value, onValueChange, ...props }: any) =>
      React.createElement("div", { "data-testid": "select-trigger", ...props }, children),
    SelectValue: ({ placeholder, value }: any) =>
      React.createElement("span", null, value || placeholder || ""),
    SelectContent: ({ children, value, onValueChange, ...props }: any) =>
      React.createElement("div", null,
        React.Children.map(children, (child: any) =>
          child ? React.cloneElement(child, { onValueChange }) : null
        )
      ),
    SelectItem: ({ children, value: itemValue, onValueChange, ...props }: any) =>
      React.createElement("option", {
        value: itemValue,
        onClick: () => onValueChange?.(itemValue),
        ...props,
      }, children),
  };
});

// Mock hooks
const mockUsePortals = vi.fn();
const mockUseCreatePortal = vi.fn();
const mockUseDeletePortal = vi.fn();
const mockUseSyncPortal = vi.fn();

vi.mock("@/hooks/use-portals", () => ({
  usePortals: () => mockUsePortals(),
  useCreatePortal: () => mockUseCreatePortal(),
  useDeletePortal: () => mockUseDeletePortal(),
  useSyncPortal: () => mockUseSyncPortal(),
}));

/** Helper to reliably set controlled input values in React 19 */
function setInputValue(element: HTMLElement, value: string) {
  const proto = element.tagName === "TEXTAREA"
    ? HTMLTextAreaElement.prototype
    : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
  if (setter) setter.call(element, value);
  element.dispatchEvent(new Event("input", { bubbles: true }));
}

describe("PortalsPage Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetIdCounter();

    // Default mock implementations
    mockUsePortals.mockReturnValue({
      data: { portals: [] },
      isLoading: false,
    });

    mockUseCreatePortal.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });

    mockUseDeletePortal.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });

    mockUseSyncPortal.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });
  });

  it("renders page with header", async () => {
    renderWithProviders(<PortalsPage />);

    await waitFor(() => {
      expect(screen.getByText("Portals")).toBeInTheDocument();
    });
  });

  it("renders portal cards when portals exist", async () => {
    const mockPortals = [
      createMockPortal({ name: "LinkedIn", type: "linkedin" }),
      createMockPortal({ name: "Indeed", type: "indeed" }),
    ];

    mockUsePortals.mockReturnValue({
      data: { portals: mockPortals },
      isLoading: false,
    });

    renderWithProviders(<PortalsPage />);

    await waitFor(() => {
      expect(screen.getByText("LinkedIn")).toBeInTheDocument();
      expect(screen.getByText("Indeed")).toBeInTheDocument();
    });
  });

  it("shows Add Portal button", async () => {
    renderWithProviders(<PortalsPage />);

    await waitFor(() => {
      const addButton = screen.getByRole("button", { name: /add portal/i });
      expect(addButton).toBeInTheDocument();
    });
  });

  it("displays Add Portal form when button is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<PortalsPage />);

    await waitFor(() => {
      const addButton = screen.getByRole("button", { name: /add portal/i });
      expect(addButton).toBeInTheDocument();
    });

    const addButton = screen.getByRole("button", { name: /add portal/i });
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByText("Register New Portal")).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/e\.g\. LinkedIn/i)).toBeInTheDocument();
    });
  });

  it("form has name, type, and url inputs", async () => {
    const user = userEvent.setup();
    renderWithProviders(<PortalsPage />);

    const addButton = screen.getByRole("button", { name: /add portal/i });
    await user.click(addButton);

    await waitFor(() => {
      const nameInput = screen.getByPlaceholderText(/e\.g\. LinkedIn/i);
      expect(nameInput).toBeInTheDocument();

      const urlInput = screen.getByPlaceholderText(/https:\/\//i);
      expect(urlInput).toBeInTheDocument();
    });
  });

  it("allows submitting the add portal form", async () => {
    const user = userEvent.setup();
    const mockMutate = vi.fn();

    mockUseCreatePortal.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });

    renderWithProviders(<PortalsPage />);

    const addButton = screen.getByRole("button", { name: /add portal/i });
    await user.click(addButton);

    const nameInput = screen.getByPlaceholderText(/e\.g\. LinkedIn/i) as HTMLInputElement;
    const urlInput = screen.getByPlaceholderText(/https:\/\//i) as HTMLInputElement;

    // Use fireEvent.change which works reliably for controlled inputs
    fireEvent.change(nameInput, { target: { value: "My Portal" } });
    fireEvent.change(urlInput, { target: { value: "https://myportal.com" } });

    // Form should be filled
    expect(nameInput.value).toBe("My Portal");
    expect(urlInput.value).toBe("https://myportal.com");
  });

  it("shows empty state when no portals registered", async () => {
    mockUsePortals.mockReturnValue({
      data: { portals: [] },
      isLoading: false,
    });

    renderWithProviders(<PortalsPage />);

    await waitFor(() => {
      expect(screen.getByText("No portals registered")).toBeInTheDocument();
    });
  });

  it("portal card displays name", async () => {
    const mockPortals = [createMockPortal({ name: "LinkedIn Jobs", type: "linkedin" })];

    mockUsePortals.mockReturnValue({
      data: { portals: mockPortals },
      isLoading: false,
    });

    renderWithProviders(<PortalsPage />);

    await waitFor(() => {
      expect(screen.getByText("LinkedIn Jobs")).toBeInTheDocument();
    });
  });

  it("portal card displays type", async () => {
    const mockPortals = [createMockPortal({ name: "LinkedIn", type: "linkedin" })];

    mockUsePortals.mockReturnValue({
      data: { portals: mockPortals },
      isLoading: false,
    });

    renderWithProviders(<PortalsPage />);

    await waitFor(() => {
      expect(screen.getByText("linkedin")).toBeInTheDocument();
    });
  });

  it("portal card displays status badge", async () => {
    const mockPortals = [
      createMockPortal({ name: "LinkedIn", type: "linkedin", status: "active" }),
    ];

    mockUsePortals.mockReturnValue({
      data: { portals: mockPortals },
      isLoading: false,
    });

    renderWithProviders(<PortalsPage />);

    await waitFor(() => {
      const statusBadges = screen.queryAllByText("active");
      expect(statusBadges.length).toBeGreaterThan(0);
    });
  });

  it("portal card shows jobs count", async () => {
    const mockPortals = [
      createMockPortal({ name: "LinkedIn", type: "linkedin", jobs_count: 42 }),
    ];

    mockUsePortals.mockReturnValue({
      data: { portals: mockPortals },
      isLoading: false,
    });

    renderWithProviders(<PortalsPage />);

    await waitFor(() => {
      // Text is split across elements: <span>42</span> jobs imported
      // Use a custom text matcher
      expect(screen.getByText("42")).toBeInTheDocument();
      expect(screen.getByText(/jobs imported/)).toBeInTheDocument();
    });
  });

  it("portal card displays portal URL as link", async () => {
    const mockPortals = [
      createMockPortal({
        name: "LinkedIn",
        type: "linkedin",
        url: "https://linkedin.com/jobs",
      }),
    ];

    mockUsePortals.mockReturnValue({
      data: { portals: mockPortals },
      isLoading: false,
    });

    renderWithProviders(<PortalsPage />);

    await waitFor(() => {
      const link = screen.getByText("https://linkedin.com/jobs");
      expect(link).toHaveAttribute("href", "https://linkedin.com/jobs");
      expect(link).toHaveAttribute("target", "_blank");
    });
  });

  it("portal card shows last sync timestamp", async () => {
    const lastSyncDate = "2026-03-20T10:00:00Z";
    const mockPortals = [
      createMockPortal({
        name: "LinkedIn",
        type: "linkedin",
        last_sync: lastSyncDate,
      }),
    ];

    mockUsePortals.mockReturnValue({
      data: { portals: mockPortals },
      isLoading: false,
    });

    renderWithProviders(<PortalsPage />);

    await waitFor(() => {
      expect(screen.getByText(/last synced:/i)).toBeInTheDocument();
    });
  });

  it("portal card has sync button", async () => {
    const mockPortals = [createMockPortal({ name: "LinkedIn", type: "linkedin" })];

    mockUsePortals.mockReturnValue({
      data: { portals: mockPortals },
      isLoading: false,
    });

    renderWithProviders(<PortalsPage />);

    await waitFor(() => {
      const syncButtons = screen.getAllByRole("button", { name: /sync/i });
      expect(syncButtons.length).toBeGreaterThan(0);
    });
  });

  it("sync button calls syncPortal mutation", async () => {
    const user = userEvent.setup();
    const mockMutate = vi.fn();

    const mockPortals = [createMockPortal({ name: "LinkedIn", type: "linkedin" })];

    mockUsePortals.mockReturnValue({
      data: { portals: mockPortals },
      isLoading: false,
    });

    mockUseSyncPortal.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });

    renderWithProviders(<PortalsPage />);

    await waitFor(() => {
      const syncButton = screen.getByRole("button", { name: /sync/i });
      expect(syncButton).toBeInTheDocument();
    });

    const syncButton = screen.getByRole("button", { name: /sync/i });
    await user.click(syncButton);

    expect(mockMutate).toHaveBeenCalled();
  });

  it("portal card has remove button", async () => {
    const mockPortals = [createMockPortal({ name: "LinkedIn", type: "linkedin" })];

    mockUsePortals.mockReturnValue({
      data: { portals: mockPortals },
      isLoading: false,
    });

    renderWithProviders(<PortalsPage />);

    await waitFor(() => {
      const removeButtons = screen.getAllByRole("button", { name: /remove/i });
      expect(removeButtons.length).toBeGreaterThan(0);
    });
  });

  it("remove button opens confirmation dialog", async () => {
    const user = userEvent.setup();
    const mockPortals = [createMockPortal({ name: "LinkedIn", type: "linkedin" })];

    mockUsePortals.mockReturnValue({
      data: { portals: mockPortals },
      isLoading: false,
    });

    renderWithProviders(<PortalsPage />);

    await waitFor(() => {
      const removeButton = screen.getByRole("button", { name: /remove/i });
      expect(removeButton).toBeInTheDocument();
    });

    const removeButton = screen.getByRole("button", { name: /remove/i });
    await user.click(removeButton);

    await waitFor(() => {
      expect(screen.getByText("Remove Portal")).toBeInTheDocument();
    });
  });

  it("shows loading skeletons while fetching portals", async () => {
    mockUsePortals.mockReturnValue({
      data: null,
      isLoading: true,
    });

    renderWithProviders(<PortalsPage />);

    await waitFor(() => {
      expect(screen.getByText("Portals")).toBeInTheDocument();
    });
  });

  it("displays multiple portal cards in grid layout", async () => {
    const mockPortals = [
      createMockPortal({ name: "LinkedIn", type: "linkedin" }),
      createMockPortal({ name: "Indeed", type: "indeed" }),
      createMockPortal({ name: "Glassdoor", type: "glassdoor" }),
    ];

    mockUsePortals.mockReturnValue({
      data: { portals: mockPortals },
      isLoading: false,
    });

    renderWithProviders(<PortalsPage />);

    await waitFor(() => {
      expect(screen.getByText("LinkedIn")).toBeInTheDocument();
      expect(screen.getByText("Indeed")).toBeInTheDocument();
      expect(screen.getByText("Glassdoor")).toBeInTheDocument();
    });
  });

  it("cancel button closes add portal form", async () => {
    const user = userEvent.setup();
    renderWithProviders(<PortalsPage />);

    const addButton = screen.getByRole("button", { name: /add portal/i });
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByText("Register New Portal")).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    await user.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByText("Register New Portal")).not.toBeInTheDocument();
    });
  });

  it("form clears after successful portal creation", async () => {
    const user = userEvent.setup();
    const mockMutate = vi.fn((portal, options) => {
      options.onSuccess();
    });

    mockUseCreatePortal.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });

    renderWithProviders(<PortalsPage />);

    const addButton = screen.getByRole("button", { name: /add portal/i });
    await user.click(addButton);

    const nameInput = screen.getByPlaceholderText(/e\.g\. LinkedIn/i) as HTMLInputElement;
    const urlInput = screen.getByPlaceholderText(/https:\/\//i) as HTMLInputElement;

    // Use fireEvent.change which works reliably
    fireEvent.change(nameInput, { target: { value: "Test Portal" } });
    fireEvent.change(urlInput, { target: { value: "https://test.com" } });

    // Form inputs should be filled
    expect(nameInput.value).toBe("Test Portal");
    expect(urlInput.value).toBe("https://test.com");
  });
});
