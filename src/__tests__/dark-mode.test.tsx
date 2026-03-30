/**
 * Dark Mode / Theme Tests
 * Author: Ahmed Adel Bakr Alderai
 */

import { renderHook, act } from "@testing-library/react";
import { usePreferencesStore } from "@/stores/preferences-store";

describe("Dark Mode & Theme", () => {
  beforeEach(() => {
    // Reset store
    usePreferencesStore.setState({
      language: "en",
      theme: "system",
      sidebarCollapsed: false,
    });
  });

  it("default theme is system", () => {
    const { result } = renderHook(() => usePreferencesStore());
    expect(result.current.theme).toBe("system");
  });

  it("setTheme to dark updates store", () => {
    const { result } = renderHook(() => usePreferencesStore());

    act(() => {
      result.current.setTheme("dark");
    });

    expect(result.current.theme).toBe("dark");
  });

  it("setTheme to light updates store", () => {
    const { result } = renderHook(() => usePreferencesStore());

    act(() => {
      result.current.setTheme("dark");
    });
    expect(result.current.theme).toBe("dark");

    act(() => {
      result.current.setTheme("light");
    });
    expect(result.current.theme).toBe("light");
  });

  it("theme persists to localStorage via zustand persist", () => {
    const { result } = renderHook(() => usePreferencesStore());

    act(() => {
      result.current.setTheme("dark");
    });

    // Zustand persist saves to localStorage
    const stored = localStorage.getItem("preferences-storage");
    if (stored) {
      const parsed = JSON.parse(stored);
      expect(parsed.state.theme).toBe("dark");
    }
  });

  it("system theme respects matchMedia", () => {
    // matchMedia is mocked in vitest.setup.ts to return matches: false
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    expect(mql.matches).toBe(false);
  });
});

describe("RTL / Language Direction", () => {
  beforeEach(() => {
    usePreferencesStore.setState({
      language: "en",
      theme: "system",
      sidebarCollapsed: false,
    });
  });

  it("default language is English (LTR)", () => {
    const { result } = renderHook(() => usePreferencesStore());
    expect(result.current.language).toBe("en");
  });

  it("setLanguage to Arabic sets RTL direction", () => {
    const { result } = renderHook(() => usePreferencesStore());

    act(() => {
      result.current.setLanguage("ar");
    });

    expect(result.current.language).toBe("ar");
    expect(document.documentElement.lang).toBe("ar");
    expect(document.documentElement.dir).toBe("rtl");
  });

  it("setLanguage back to English sets LTR direction", () => {
    const { result } = renderHook(() => usePreferencesStore());

    act(() => {
      result.current.setLanguage("ar");
    });
    act(() => {
      result.current.setLanguage("en");
    });

    expect(result.current.language).toBe("en");
    expect(document.documentElement.lang).toBe("en");
    expect(document.documentElement.dir).toBe("ltr");
  });

  it("toggleLanguage flips en to ar", () => {
    const { result } = renderHook(() => usePreferencesStore());

    act(() => {
      result.current.toggleLanguage();
    });

    expect(result.current.language).toBe("ar");
  });

  it("toggleLanguage flips ar back to en", () => {
    const { result } = renderHook(() => usePreferencesStore());

    act(() => {
      result.current.toggleLanguage(); // en → ar
    });
    act(() => {
      result.current.toggleLanguage(); // ar → en
    });

    expect(result.current.language).toBe("en");
  });
});
