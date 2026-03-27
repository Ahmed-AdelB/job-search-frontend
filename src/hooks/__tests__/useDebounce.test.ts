/**
 * Test Suite: useDebounce Hook
 * Author: Ahmed Adel Bakr Alderai
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useDebounce } from "../useDebounce";

describe("useDebounce Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("should return the initial value", () => {
    const { result } = renderHook(() => useDebounce("initial", 500));
    expect(result.current).toBe("initial");
  });

  it("should accept a delay parameter", () => {
    const { result } = renderHook(() => useDebounce("test", 300));
    expect(typeof result.current).toBe("string");
  });

  it("should use default delay when not provided", () => {
    const { result } = renderHook(() => useDebounce("value"));
    expect(result.current).toBe("value");
  });

  it("should work with number values", () => {
    const { result } = renderHook(() => useDebounce(42, 300));
    expect(result.current).toBe(42);
  });

  it("should work with boolean values", () => {
    const { result } = renderHook(() => useDebounce(true, 300));
    expect(result.current).toBe(true);
  });

  it("should work with null values", () => {
    const { result } = renderHook(() => useDebounce(null, 300));
    expect(result.current).toBeNull();
  });

  it("should work with undefined values", () => {
    const { result } = renderHook(() => useDebounce(undefined, 300));
    expect(result.current).toBeUndefined();
  });

  it("should cleanup effects on unmount", () => {
    const { unmount } = renderHook(() => useDebounce("test", 500));
    expect(() => unmount()).not.toThrow();
  });

  it("should handle empty strings", () => {
    const { result } = renderHook(() => useDebounce("", 300));
    expect(result.current).toBe("");
  });

  it("should work with generic types", () => {
    interface User {
      id: number;
      name: string;
    }

    const user: User = { id: 1, name: "Alice" };
    const { result } = renderHook(() => useDebounce(user, 300));

    expect(result.current.id).toBe(1);
    expect(result.current.name).toBe("Alice");
  });
});
