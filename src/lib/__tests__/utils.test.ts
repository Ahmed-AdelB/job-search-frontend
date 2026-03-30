/**
 * Tests for Utility Functions
 * Author: Ahmed Adel Bakr Alderai
 */

import { describe, it, expect } from "vitest";
import { cn, formatDate } from "@/lib/utils";

describe("Utility Functions", () => {
  describe("cn", () => {
    it("merges two classes", () => {
      const result = cn("bg-red", "text-white");
      expect(result).toBe("bg-red text-white");
    });

    it("resolves Tailwind conflicts with twMerge", () => {
      const result = cn("bg-red-500", "bg-blue-500");
      // twMerge removes conflicting utilities, keeping the last one
      expect(result).toBe("bg-blue-500");
    });

    it("filters falsy values", () => {
      const result = cn("bg-red", false, undefined, null, "", "text-white");
      expect(result).toBe("bg-red text-white");
    });

    it("handles empty args", () => {
      const result = cn();
      expect(result).toBe("");
    });

    it("handles conditional classes", () => {
      const isActive = true;
      const result = cn(
        "px-4 py-2",
        isActive && "bg-blue-500",
        !isActive && "bg-gray-500"
      );
      expect(result).toBe("px-4 py-2 bg-blue-500");
    });

    it("merges arrays of classes", () => {
      const result = cn(["flex", "gap-4"], ["items-center", "justify-between"]);
      expect(result).toBe("flex gap-4 items-center justify-between");
    });

    it("handles object notation for conditional classes", () => {
      const result = cn({
        "bg-red-500": true,
        "bg-blue-500": false,
        "text-white": true,
      });
      expect(result).toBe("bg-red-500 text-white");
    });
  });

  describe("formatDate", () => {
    it("formats ISO string to readable date", () => {
      const date = "2024-03-15";
      const result = formatDate(date);
      expect(result).toBe("March 15, 2024");
    });

    it("formats Date object to readable date", () => {
      const date = new Date("2024-03-15");
      const result = formatDate(date);
      expect(result).toBe("March 15, 2024");
    });

    it("formats full ISO datetime string", () => {
      const date = "2024-12-25T10:30:00Z";
      const result = formatDate(date);
      expect(result).toBe("December 25, 2024");
    });

    it("formats with numeric month and day", () => {
      const date = new Date("2024-01-05");
      const result = formatDate(date);
      expect(result).toBe("January 5, 2024");
    });

    it("formats new Date() correctly", () => {
      const date = new Date(2024, 0, 1); // January 1, 2024
      const result = formatDate(date);
      expect(result).toBe("January 1, 2024");
    });

    it("handles future dates", () => {
      const date = "2025-12-31";
      const result = formatDate(date);
      expect(result).toBe("December 31, 2025");
    });

    it("handles past dates", () => {
      const date = "2020-01-01";
      const result = formatDate(date);
      expect(result).toBe("January 1, 2020");
    });
  });

  describe("cn with complex scenarios", () => {
    it("handles nested objects and arrays", () => {
      const result = cn("base", {
        "hover:bg-blue-500": true,
        "dark:text-white": true,
      });
      expect(result).toContain("base");
      expect(result).toContain("hover:bg-blue-500");
      expect(result).toContain("dark:text-white");
    });

    it("overrides base utility classes", () => {
      const result = cn(
        "p-4 rounded-lg",
        "p-8", // Should override p-4
        "rounded-xl" // Should override rounded-lg
      );
      expect(result).toBe("p-8 rounded-xl");
    });

    it("handles space-separated classes", () => {
      const result = cn("flex gap-4 items-center");
      expect(result).toBe("flex gap-4 items-center");
    });
  });
});
