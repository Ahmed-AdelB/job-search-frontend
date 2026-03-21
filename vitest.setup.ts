/**
 * Vitest Global Setup
 * Author: Ahmed Adel Bakr Alderai
 */

import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";
import React from "react";
import { server } from "./src/__mocks__/server";

// MSW setup
beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
afterEach(() => {
  server.resetHandlers();
  cleanup();
});
afterAll(() => server.close());

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/dashboard",
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
  redirect: vi.fn(),
  notFound: vi.fn(),
}));

// Mock next/image
vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return vi.fn().mockReturnValue(null)(props);
  },
}));

// Mock next-themes
vi.mock("next-themes", () => ({
  useTheme: () => ({
    theme: "light",
    setTheme: vi.fn(),
    resolvedTheme: "light",
    themes: ["light", "dark", "system"],
    systemTheme: "light",
  }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
    promise: vi.fn(),
  }),
  Toaster: () => null,
}));

// Mock motion/react (avoid animation issues in tests)
vi.mock("motion/react", () => {
  const React = require("react");

  const createMotionElement = (elementName: string) => {
    return React.forwardRef(
      (
        {
          children,
          ...props
        }: {
          children?: React.ReactNode;
          [key: string]: unknown;
        },
        ref: React.Ref<unknown>
      ) => {
        // Remove animation-related props that we don't need in tests
        const { initial, animate, exit, variants, transition, whileHover, whileTap, layoutId, ...rest } = props;
        void initial; void animate; exit; void variants; void transition; void whileHover; void whileTap; void layoutId;

        // Create the actual HTML element
        return React.createElement(elementName, { ...rest, ref }, children);
      }
    );
  };

  return {
    motion: new Proxy(
      {},
      {
        get: (_target, prop) => {
          if (typeof prop === "string") {
            return createMotionElement(prop);
          }
          return undefined;
        },
      }
    ),
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
    useAnimation: () => ({ start: vi.fn(), stop: vi.fn() }),
    useMotionValue: (initial: number) => ({ get: () => initial, set: vi.fn() }),
    useTransform: () => ({ get: () => 0 }),
  };
});

// Mock ResizeObserver - must be a proper class
class ResizeObserverMock {
  constructor(callback?: ResizeObserverCallback) {
    void callback;
  }

  observe() {
    return null;
  }

  unobserve() {
    return null;
  }

  disconnect() {
    return null;
  }
}

global.ResizeObserver = ResizeObserverMock as any;

// Mock IntersectionObserver - must be a proper class
class IntersectionObserverMock {
  constructor(callback?: IntersectionObserverCallback) {
    void callback;
  }

  observe() {
    return null;
  }

  unobserve() {
    return null;
  }

  disconnect() {
    return null;
  }
}

global.IntersectionObserver = IntersectionObserverMock as any;

// Mock matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock scrollTo
window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;

// Mock localStorage for tests (jsdom provides one, but ensure it's clean)
beforeEach(() => {
  localStorage.clear();
});
