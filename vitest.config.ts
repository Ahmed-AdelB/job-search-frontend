/**
 * Vitest Configuration
 * Author: Ahmed Adel Bakr Alderai
 */

import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", ".next", "e2e"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: [
        "src/lib/**/*.{ts,tsx}",
        "src/stores/**/*.{ts,tsx}",
        "src/hooks/**/*.{ts,tsx}",
        "src/components/**/*.{ts,tsx}",
        "src/app/**/*.{ts,tsx}",
      ],
      exclude: [
        "src/**/*.{test,spec}.{ts,tsx}",
        "src/__mocks__/**",
        "src/__tests__/**",
        "src/types/**",
      ],
      thresholds: {
        // Current: ~40% lines/stmts, ~30% branches, ~37% functions
        statements: 35,
        branches: 25,
        functions: 30,
        lines: 35,
      },
    },
  },
});
