/**
 * Preferences Store Tests
 * Author: Ahmed Adel Bakr Alderai
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { usePreferencesStore } from "@/stores/preferences-store";

describe("Preferences Store", () => {
  beforeEach(() => {
    // Reset store to initial state
    usePreferencesStore.setState({
      language: "en",
      theme: "system",
      sidebarCollapsed: false,
    });
    // Clear localStorage
    localStorage.clear();
    // Clear all mocks
    vi.clearAllMocks();
  });

  it("should have initial state with language en, theme system, and sidebar not collapsed", () => {
    const state = usePreferencesStore.getState();
    expect(state.language).toBe("en");
    expect(state.theme).toBe("system");
    expect(state.sidebarCollapsed).toBe(false);
  });

  it("should set language to ar when calling setLanguage", () => {
    const store = usePreferencesStore.getState();
    store.setLanguage("ar");

    expect(usePreferencesStore.getState().language).toBe("ar");
  });

  it("should update document.documentElement.lang and dir to rtl when setLanguage is called with ar", () => {
    const store = usePreferencesStore.getState();
    store.setLanguage("ar");

    expect(document.documentElement.lang).toBe("ar");
    expect(document.documentElement.dir).toBe("rtl");
  });

  it("should set language to en and update document.documentElement.dir to ltr when setLanguage is called with en", () => {
    // First set to ar
    usePreferencesStore.setState({ language: "ar" });
    document.documentElement.lang = "ar";
    document.documentElement.dir = "rtl";

    const store = usePreferencesStore.getState();
    store.setLanguage("en");

    expect(usePreferencesStore.getState().language).toBe("en");
    expect(document.documentElement.lang).toBe("en");
    expect(document.documentElement.dir).toBe("ltr");
  });

  it("should set theme to dark when calling setTheme", () => {
    const store = usePreferencesStore.getState();
    store.setTheme("dark");

    expect(usePreferencesStore.getState().theme).toBe("dark");
  });

  it("should set theme to light when calling setTheme", () => {
    const store = usePreferencesStore.getState();
    store.setTheme("light");

    expect(usePreferencesStore.getState().theme).toBe("light");
  });

  it("should toggle language from en to ar when calling toggleLanguage", () => {
    usePreferencesStore.setState({ language: "en" });

    const store = usePreferencesStore.getState();
    store.toggleLanguage();

    expect(usePreferencesStore.getState().language).toBe("ar");
    expect(document.documentElement.lang).toBe("ar");
    expect(document.documentElement.dir).toBe("rtl");
  });

  it("should toggle language from ar to en when calling toggleLanguage", () => {
    usePreferencesStore.setState({ language: "ar" });
    document.documentElement.lang = "ar";
    document.documentElement.dir = "rtl";

    const store = usePreferencesStore.getState();
    store.toggleLanguage();

    expect(usePreferencesStore.getState().language).toBe("en");
    expect(document.documentElement.lang).toBe("en");
    expect(document.documentElement.dir).toBe("ltr");
  });

  it("should toggle sidebar collapsed state when calling toggleSidebar", () => {
    usePreferencesStore.setState({ sidebarCollapsed: false });

    const store = usePreferencesStore.getState();
    store.toggleSidebar();

    expect(usePreferencesStore.getState().sidebarCollapsed).toBe(true);
  });

  it("should toggle sidebar twice and return to original state", () => {
    usePreferencesStore.setState({ sidebarCollapsed: false });
    const store = usePreferencesStore.getState();

    // First toggle
    store.toggleSidebar();
    expect(usePreferencesStore.getState().sidebarCollapsed).toBe(true);

    // Second toggle
    store.toggleSidebar();
    expect(usePreferencesStore.getState().sidebarCollapsed).toBe(false);
  });

  it("should toggle sidebar from true to false when calling toggleSidebar", () => {
    usePreferencesStore.setState({ sidebarCollapsed: true });

    const store = usePreferencesStore.getState();
    store.toggleSidebar();

    expect(usePreferencesStore.getState().sidebarCollapsed).toBe(false);
  });

  it("should preserve other state properties when setLanguage is called", () => {
    usePreferencesStore.setState({
      language: "en",
      theme: "dark",
      sidebarCollapsed: true,
    });

    const store = usePreferencesStore.getState();
    store.setLanguage("ar");

    const state = usePreferencesStore.getState();
    expect(state.language).toBe("ar");
    expect(state.theme).toBe("dark");
    expect(state.sidebarCollapsed).toBe(true);
  });

  it("should preserve other state properties when setTheme is called", () => {
    usePreferencesStore.setState({
      language: "ar",
      theme: "system",
      sidebarCollapsed: true,
    });

    const store = usePreferencesStore.getState();
    store.setTheme("light");

    const state = usePreferencesStore.getState();
    expect(state.language).toBe("ar");
    expect(state.theme).toBe("light");
    expect(state.sidebarCollapsed).toBe(true);
  });

  it("should preserve other state properties when toggleSidebar is called", () => {
    usePreferencesStore.setState({
      language: "ar",
      theme: "dark",
      sidebarCollapsed: false,
    });

    const store = usePreferencesStore.getState();
    store.toggleSidebar();

    const state = usePreferencesStore.getState();
    expect(state.language).toBe("ar");
    expect(state.theme).toBe("dark");
    expect(state.sidebarCollapsed).toBe(true);
  });

  it("should handle multiple consecutive language toggles correctly", () => {
    usePreferencesStore.setState({ language: "en" });
    const store = usePreferencesStore.getState();

    // Toggle 1: en -> ar
    store.toggleLanguage();
    expect(usePreferencesStore.getState().language).toBe("ar");

    // Toggle 2: ar -> en
    store.toggleLanguage();
    expect(usePreferencesStore.getState().language).toBe("en");

    // Toggle 3: en -> ar
    store.toggleLanguage();
    expect(usePreferencesStore.getState().language).toBe("ar");
  });

  it("should handle multiple consecutive sidebar toggles correctly", () => {
    usePreferencesStore.setState({ sidebarCollapsed: false });
    const store = usePreferencesStore.getState();

    // Toggle 1: false -> true
    store.toggleSidebar();
    expect(usePreferencesStore.getState().sidebarCollapsed).toBe(true);

    // Toggle 2: true -> false
    store.toggleSidebar();
    expect(usePreferencesStore.getState().sidebarCollapsed).toBe(false);

    // Toggle 3: false -> true
    store.toggleSidebar();
    expect(usePreferencesStore.getState().sidebarCollapsed).toBe(true);
  });

  it("should handle switching theme multiple times correctly", () => {
    const store = usePreferencesStore.getState();

    store.setTheme("light");
    expect(usePreferencesStore.getState().theme).toBe("light");

    store.setTheme("dark");
    expect(usePreferencesStore.getState().theme).toBe("dark");

    store.setTheme("system");
    expect(usePreferencesStore.getState().theme).toBe("system");
  });
});
