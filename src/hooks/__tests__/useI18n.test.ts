/**
 * Test Suite: useI18n Hook
 * Author: Ahmed Adel Bakr Alderai
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useI18n } from "../useI18n";

// Mock the preferences store
vi.mock("@/stores/preferences-store");

// Mock the translation files
vi.mock("@/i18n/en.json", () => ({
  default: {
    common: {
      dashboard: "Dashboard",
      jobs: "Jobs",
      applications: "Applications",
    },
    messages: {
      success: "Success",
      error: "Error message",
    },
  },
}));

vi.mock("@/i18n/ar.json", () => ({
  default: {
    common: {
      dashboard: "لوحة التحكم",
      jobs: "الوظائف",
    },
    messages: {
      success: "نجح",
    },
  },
}));

import { usePreferencesStore } from "@/stores/preferences-store";

describe("useI18n Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Setup default mock to return English
    vi.mocked(usePreferencesStore).mockReturnValue("en" as any);
  });

  it("should return translation function", () => {
    vi.mocked(usePreferencesStore).mockImplementation((selector) => {
      return selector({ language: "en" });
    });

    const { result } = renderHook(() => useI18n());
    expect(typeof result.current.t).toBe("function");
  });

  it("should return current language", () => {
    vi.mocked(usePreferencesStore).mockImplementation((selector) => {
      return selector({ language: "en" });
    });

    const { result } = renderHook(() => useI18n());
    expect(result.current.language).toBe("en");
  });

  it("should return messages object", () => {
    vi.mocked(usePreferencesStore).mockImplementation((selector) => {
      return selector({ language: "en" });
    });

    const { result } = renderHook(() => useI18n());
    expect(typeof result.current.messages).toBe("object");
  });

  it("should translate English keys", () => {
    vi.mocked(usePreferencesStore).mockImplementation((selector) => {
      return selector({ language: "en" });
    });

    const { result } = renderHook(() => useI18n());
    expect(result.current.t("common.dashboard")).toBe("Dashboard");
    expect(result.current.t("common.jobs")).toBe("Jobs");
    expect(result.current.t("messages.success")).toBe("Success");
  });

  it("should handle missing keys with fallback", () => {
    vi.mocked(usePreferencesStore).mockImplementation((selector) => {
      return selector({ language: "en" });
    });

    const { result } = renderHook(() => useI18n());
    expect(result.current.t("missing.key", "Fallback")).toBe("Fallback");
  });

  it("should return key when no fallback provided", () => {
    vi.mocked(usePreferencesStore).mockImplementation((selector) => {
      return selector({ language: "en" });
    });

    const { result } = renderHook(() => useI18n());
    expect(result.current.t("missing.key")).toBe("missing.key");
  });

  it("should translate Arabic keys when language is Arabic", () => {
    vi.mocked(usePreferencesStore).mockImplementation((selector) => {
      return selector({ language: "ar" });
    });

    const { result } = renderHook(() => useI18n());
    expect(result.current.t("common.dashboard")).toBe("لوحة التحكم");
    expect(result.current.t("common.jobs")).toBe("الوظائف");
  });

  it("should return English as fallback for unknown language", () => {
    vi.mocked(usePreferencesStore).mockImplementation((selector) => {
      return selector({ language: "fr" });
    });

    const { result } = renderHook(() => useI18n());
    // Should fallback to English
    expect(result.current.t("common.dashboard")).toBe("Dashboard");
  });

  it("should have translation function for accessing nested keys", () => {
    vi.mocked(usePreferencesStore).mockImplementation((selector) => {
      return selector({ language: "en" });
    });

    const { result } = renderHook(() => useI18n());
    const translation = result.current.t("common.applications");
    expect(translation).toBe("Applications");
  });

  it("should handle error message translations", () => {
    vi.mocked(usePreferencesStore).mockImplementation((selector) => {
      return selector({ language: "en" });
    });

    const { result } = renderHook(() => useI18n());
    expect(result.current.t("messages.error")).toBe("Error message");
  });

  it("should work with use case pattern", () => {
    vi.mocked(usePreferencesStore).mockImplementation((selector) => {
      return selector({ language: "en" });
    });

    const { result } = renderHook(() => useI18n());
    const { t, language, messages } = result.current;

    expect(typeof t).toBe("function");
    expect(typeof language).toBe("string");
    expect(typeof messages).toBe("object");

    // Test actual usage
    const dashboard = t("common.dashboard");
    expect(dashboard).toBe("Dashboard");
  });
});
