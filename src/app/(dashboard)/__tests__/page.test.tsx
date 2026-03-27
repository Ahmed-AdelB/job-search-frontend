/**
 * Dashboard Home Page Integration Tests
 * Author: Ahmed Adel Bakr Alderai
 */

import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/__tests__/setup/render-with-providers";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock motion/react - critical for this page
// MotionValues rendered as children need special handling in mock motion components
const resolveChild = (child: any) =>
  child && typeof child === "object" && typeof child.get === "function"
    ? child.get()
    : child;

vi.mock("motion/react", () => ({
  motion: {
    div: React.forwardRef(({ children, ...props }: any, ref: any) => (
      <div ref={ref} {...props}>{children}</div>
    )),
    p: React.forwardRef(({ children, ...props }: any, ref: any) => (
      <p ref={ref} {...props}>{resolveChild(children)}</p>
    )),
    li: React.forwardRef(({ children, ...props }: any, ref: any) => (
      <li ref={ref} {...props}>{children}</li>
    )),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
  useMotionValue: (initial: number) => {
    let _val = initial;
    return {
      get: () => _val,
      set: (v: number) => { _val = v; },
      on: () => () => {},
    };
  },
  useTransform: (value: any, transform: (v: number) => number) => {
    const val = transform(value?.get?.() ?? 0);
    return {
      get: () => val,
      set: () => {},
      on: () => () => {},
    };
  },
  animate: (motionValue: any, target: number, _config?: any) => {
    // Immediately set to target value (no animation in test)
    motionValue?.set?.(target);
    return { stop: () => {} };
  },
}));

import DashboardPage from "../page";

describe("DashboardPage (Mission Control) Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders page with Mission Control title", () => {
    renderWithProviders(<DashboardPage />);
    expect(screen.getByText("Mission Control")).toBeInTheDocument();
  });

  it("displays subtitle about job search campaign", () => {
    renderWithProviders(<DashboardPage />);
    expect(screen.getByText("Your job search campaign at a glance")).toBeInTheDocument();
  });

  it("displays Agents button", () => {
    renderWithProviders(<DashboardPage />);
    expect(screen.getByText("Agents")).toBeInTheDocument();
  });

  it("displays Launch Pipeline button", () => {
    renderWithProviders(<DashboardPage />);
    expect(screen.getByText("Launch Pipeline")).toBeInTheDocument();
  });

  it("Agents link points to /dashboard/agents", () => {
    renderWithProviders(<DashboardPage />);
    const links = screen.getAllByRole("link");
    const agentsLink = links.find((l) => l.getAttribute("href") === "/dashboard/agents");
    expect(agentsLink).toBeTruthy();
  });

  it("Pipeline link points to /dashboard/jobs", () => {
    renderWithProviders(<DashboardPage />);
    const links = screen.getAllByRole("link");
    const pipelineLink = links.find((l) => l.getAttribute("href") === "/dashboard/jobs");
    expect(pipelineLink).toBeTruthy();
  });

  it("displays stat card titles", () => {
    renderWithProviders(<DashboardPage />);
    expect(screen.getByText("Active Applications")).toBeInTheDocument();
    expect(screen.getByText("Jobs Matched")).toBeInTheDocument();
    expect(screen.getByText("Outreach Sent")).toBeInTheDocument();
    expect(screen.getByText("Interviews")).toBeInTheDocument();
  });

  it("displays change indicators on stat cards", () => {
    renderWithProviders(<DashboardPage />);
    expect(screen.getByText("+3 this week")).toBeInTheDocument();
    expect(screen.getByText("+12 today")).toBeInTheDocument();
    expect(screen.getByText("12% reply rate")).toBeInTheDocument();
    expect(screen.getByText("Next: Tomorrow")).toBeInTheDocument();
  });

  it("displays Application Pipeline card", () => {
    renderWithProviders(<DashboardPage />);
    expect(screen.getByText("Application Pipeline")).toBeInTheDocument();
  });

  it("displays pipeline stage names", () => {
    renderWithProviders(<DashboardPage />);
    expect(screen.getByText("Applied")).toBeInTheDocument();
    expect(screen.getByText("Phone Screen")).toBeInTheDocument();
    expect(screen.getByText("Technical")).toBeInTheDocument();
    expect(screen.getByText("Final Round")).toBeInTheDocument();
    expect(screen.getByText("Offer")).toBeInTheDocument();
  });

  it("displays Live badge on Application Pipeline", () => {
    renderWithProviders(<DashboardPage />);
    expect(screen.getByText("Live")).toBeInTheDocument();
  });

  it("displays Recent Activity card", () => {
    renderWithProviders(<DashboardPage />);
    expect(screen.getByText("Recent Activity")).toBeInTheDocument();
  });

  it("displays activity items with descriptions", () => {
    renderWithProviders(<DashboardPage />);
    expect(screen.getByText("Application submitted")).toBeInTheDocument();
    expect(screen.getByText("Interview scheduled")).toBeInTheDocument();
    expect(screen.getByText("Outreach campaign completed")).toBeInTheDocument();
  });

  it("displays AI Insights card with suggestions", () => {
    renderWithProviders(<DashboardPage />);
    expect(screen.getByText("AI Insights")).toBeInTheDocument();
    expect(screen.getByText("Update resume with recent achievements")).toBeInTheDocument();
  });

  it("displays Quick Actions card", () => {
    renderWithProviders(<DashboardPage />);
    expect(screen.getByText("Quick Actions")).toBeInTheDocument();
  });

  it("Quick Actions has navigation links", () => {
    renderWithProviders(<DashboardPage />);
    expect(screen.getByText("Browse Jobs")).toBeInTheDocument();
    expect(screen.getByText("Applications")).toBeInTheDocument();
    expect(screen.getByText("Send Outreach")).toBeInTheDocument();
    expect(screen.getByText("Manage Agents")).toBeInTheDocument();
  });

  it("renders all main sections", () => {
    renderWithProviders(<DashboardPage />);
    expect(screen.getByText("Mission Control")).toBeInTheDocument();
    expect(screen.getByText("Application Pipeline")).toBeInTheDocument();
    expect(screen.getByText("Recent Activity")).toBeInTheDocument();
    expect(screen.getByText("AI Insights")).toBeInTheDocument();
    expect(screen.getByText("Quick Actions")).toBeInTheDocument();
  });
});
