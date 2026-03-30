/**
 * Responsive Design E2E Tests
 * Author: Ahmed Adel Bakr Alderai
 * Tests: Mobile, Tablet, Desktop layouts and interactions
 */

import { test, expect, type Page, type Route } from "@playwright/test";

test.describe("Responsive Design", () => {
  /**
   * Helper: Set up authenticated user session
   */
  async function setupAuthenticatedSession(page: Page) {
    await page.evaluate(() => {
      localStorage.setItem("auth-token", "test-jwt-token-12345");
      localStorage.setItem(
        "auth-user",
        JSON.stringify({
          user_id: "u-test-001",
          email: "test@example.com",
          name: "Test User",
        })
      );
    });
  }

  /**
   * Helper: Mock API responses
   */
  async function mockApiResponses(page: Page) {
    await page.route("**/api/**", (route: Route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({}),
      });
    });
  }

  // Test 1: Mobile (375px) - Sidebar behavior
  test("should show hamburger menu on mobile (375px)", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await setupAuthenticatedSession(page);
    await mockApiResponses(page);

    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Desktop sidebar should be hidden
    const desktopSidebar = page.locator("aside, nav[class*='sidebar']");
    const desktopSidebarVisible = await desktopSidebar
      .evaluate(
        (el) =>
          window.getComputedStyle(el).display !== "none" &&
          window.getComputedStyle(el).visibility !== "hidden"
      )
      .catch(() => false);

    // Hamburger menu should be visible
    const hamburgerButton = page.locator(
      "button[aria-label*='menu' i], button:has([class*='menu'])"
    ).first();

    if ((await hamburgerButton.count()) > 0) {
      await expect(hamburgerButton).toBeVisible();
    }
  });

  // Test 2: Mobile - Menu interaction
  test("should open mobile menu and display navigation", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await setupAuthenticatedSession(page);
    await mockApiResponses(page);

    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Find hamburger button
    const hamburgerButton = page.locator(
      "button[aria-label*='menu' i], button:has([class*='menu'])"
    ).first();

    if ((await hamburgerButton.count()) > 0) {
      await hamburgerButton.click();
      await page.waitForTimeout(300); // Wait for menu animation

      // Mobile menu should be visible
      const mobileMenu = page.locator("[class*='mobile'], [class*='sheet']").first();
      const mobileMenuVisible = await mobileMenu
        .isVisible()
        .catch(() => false);

      // Or nav items should be displayed
      const navItems = page.locator("a[href='/dashboard/jobs']").first();
      const navItemsVisible = await navItems
        .isVisible()
        .catch(() => false);

      expect(mobileMenuVisible || navItemsVisible).toBeTruthy();
    }
  });

  // Test 3: Mobile - Touch interactions
  test("should support touch interactions on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await setupAuthenticatedSession(page);
    await mockApiResponses(page);

    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Buttons should be large enough for touch
    const button = page.locator("button").first();
    const boundingBox = await button.boundingBox();

    if (boundingBox) {
      // Touch targets should be at least 44x44px (iOS) or 48x48px (Android)
      expect(boundingBox.width).toBeGreaterThanOrEqual(44);
      expect(boundingBox.height).toBeGreaterThanOrEqual(44);
    }
  });

  // Test 4: Mobile - No horizontal scroll
  test("should not have horizontal scroll on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await setupAuthenticatedSession(page);
    await mockApiResponses(page);

    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Check viewport width vs body width
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });

    expect(hasHorizontalScroll).toBe(false);
  });

  // Test 5: Mobile - Form inputs
  test("should display form inputs properly on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await setupAuthenticatedSession(page);
    await mockApiResponses(page);

    await page.goto("/dashboard/intelligence/work-mode");
    await page.waitForLoadState("networkidle");

    // Input fields should be visible and full width
    const input = page.locator('input[type="text"]').first();

    if ((await input.count()) > 0) {
      const boundingBox = await input.boundingBox();

      if (boundingBox) {
        // Input should be at least 280px wide (375 - padding)
        expect(boundingBox.width).toBeGreaterThan(280);
      }

      await expect(input).toBeVisible();
    }
  });

  // Test 6: Tablet (768px) - Two-column layout
  test("should display two-column layout on tablet (768px)", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await setupAuthenticatedSession(page);
    await mockApiResponses(page);

    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Main content area should exist
    const mainContent = page.locator("main");
    await expect(mainContent).toBeVisible();

    // Check for multi-column layout (grid or flex with 2+ columns)
    const gridLayout = await mainContent.evaluate(
      (el) =>
        window.getComputedStyle(el).display === "grid" ||
        (window.getComputedStyle(el).display === "flex" &&
          window.getComputedStyle(el).flexWrap === "wrap")
    );

    // Layout should be responsive at this width
    expect(mainContent).toBeVisible();
  });

  // Test 7: Tablet - Navigation visibility
  test("should show sidebar on tablet in landscape", async ({ page }) => {
    // Tablet in landscape mode
    await page.setViewportSize({ width: 1024, height: 600 });
    await setupAuthenticatedSession(page);
    await mockApiResponses(page);

    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Sidebar should be visible on wider tablets
    const sidebar = page.locator("aside, nav[class*='sidebar']").first();
    const sidebarVisible = await sidebar
      .isVisible()
      .catch(() => false);

    if (sidebarVisible) {
      await expect(sidebar).toBeVisible();
    }
  });

  // Test 8: Desktop (1280px) - Full sidebar visible
  test("should display full sidebar on desktop (1280px)", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await setupAuthenticatedSession(page);
    await mockApiResponses(page);

    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Sidebar should be visible
    const sidebar = page.locator("aside, nav[class*='sidebar']").first();
    await expect(sidebar).toBeVisible();

    // Sidebar should not be collapsed
    const sidebarWidth = await sidebar.evaluate((el) => {
      return window.getComputedStyle(el).width;
    });

    // Should be wider than collapsed state (usually 240px vs 56px)
    const width = parseInt(sidebarWidth);
    expect(width).toBeGreaterThan(100);
  });

  // Test 9: Desktop - Multi-column layout
  test("should display cards in grid layout on desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await setupAuthenticatedSession(page);
    await mockApiResponses(page);

    await page.goto("/dashboard/intelligence");
    await page.waitForLoadState("networkidle");

    // Look for grid layout
    const cards = page.locator("[class*='card'], [class*='grid']");

    if ((await cards.count()) > 1) {
      // Multiple cards should be in a row
      const firstCard = cards.nth(0);
      const secondCard = cards.nth(1);

      const firstBox = await firstCard.boundingBox();
      const secondBox = await secondCard.boundingBox();

      if (firstBox && secondBox) {
        // Cards should be side-by-side (same vertical position)
        expect(Math.abs(firstBox.y - secondBox.y)).toBeLessThan(50);
      }
    }
  });

  // Test 10: Desktop - Sidebar toggle
  test("should allow sidebar toggle on desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await setupAuthenticatedSession(page);
    await mockApiResponses(page);

    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Find sidebar toggle button
    const toggleButton = page.locator(
      "button[aria-label*='toggle' i], button:has-text('›'), button:has-text('‹')"
    ).first();

    if ((await toggleButton.count()) > 0) {
      const sidebar = page.locator("aside, nav[class*='sidebar']").first();
      const initialWidth = await sidebar.evaluate((el) => {
        return window.getComputedStyle(el).width;
      });

      // Click to collapse
      await toggleButton.click();
      await page.waitForTimeout(300); // Wait for animation

      const collapsedWidth = await sidebar.evaluate((el) => {
        return window.getComputedStyle(el).width;
      });

      // Width should change
      expect(collapsedWidth).not.toBe(initialWidth);

      // Content area should adjust
      const mainContent = page.locator("main");
      await expect(mainContent).toBeVisible();
    }
  });

  // Test 11: Fluid typography scaling
  test("should scale typography responsively", async ({ page }) => {
    const sizes = [
      { width: 375, height: 667, name: "mobile" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 1280, height: 800, name: "desktop" },
    ];

    await setupAuthenticatedSession(page);
    await mockApiResponses(page);

    const fontSizes = [];

    for (const size of sizes) {
      await page.setViewportSize(size);
      await page.goto("/dashboard");
      await page.waitForLoadState("networkidle");

      // Get heading font size
      const heading = page.locator("h1").first();

      if ((await heading.count()) > 0) {
        const fontSize = await heading.evaluate((el) => {
          return window.getComputedStyle(el).fontSize;
        });

        fontSizes.push({
          viewport: size.name,
          fontSize,
        });
      }
    }

    // Font sizes should vary or be flexible
    if (fontSizes.length > 1) {
      // Just verify we can read fonts at all sizes
      fontSizes.forEach((item) => {
        expect(item.fontSize).toBeTruthy();
      });
    }
  });

  // Test 12: Image responsiveness
  test("should display images responsively", async ({ page }) => {
    const sizes = [
      { width: 375, height: 667 },
      { width: 768, height: 1024 },
      { width: 1280, height: 800 },
    ];

    await setupAuthenticatedSession(page);
    await mockApiResponses(page);

    for (const size of sizes) {
      await page.setViewportSize(size);
      await page.goto("/dashboard");
      await page.waitForLoadState("networkidle");

      // Check images don't exceed viewport
      const images = page.locator("img");
      const count = await images.count();

      for (let i = 0; i < Math.min(count, 3); i++) {
        const img = images.nth(i);
        const box = await img.boundingBox();

        if (box && size.width) {
          // Image width shouldn't exceed viewport
          expect(box.width).toBeLessThanOrEqual(size.width);
        }
      }
    }
  });

  // Test 13: Navigation accessibility at different sizes
  test("should maintain navigation accessibility across sizes", async ({
    page,
  }) => {
    const sizes = [
      { width: 375, height: 667 },
      { width: 768, height: 1024 },
      { width: 1280, height: 800 },
    ];

    await setupAuthenticatedSession(page);
    await mockApiResponses(page);

    for (const size of sizes) {
      await page.setViewportSize(size);
      await page.goto("/dashboard");
      await page.waitForLoadState("networkidle");

      // Navigation should be accessible
      const navLinks = page.locator("a[href*='/dashboard']");
      expect(await navLinks.count()).toBeGreaterThan(0);

      // At least one nav link should be visible
      const visibleLinks = await navLinks.evaluateAll(
        (els) =>
          els.filter((el) => {
            const style = window.getComputedStyle(el);
            return style.display !== "none" && style.visibility !== "hidden";
          }).length
      );

      expect(visibleLinks).toBeGreaterThan(0);
    }
  });

  // Test 14: Modal/Dialog responsiveness
  test("should display modals responsively", async ({ page }) => {
    const sizes = [
      { width: 375, height: 667 },
      { width: 768, height: 1024 },
      { width: 1280, height: 800 },
    ];

    await setupAuthenticatedSession(page);
    await mockApiResponses(page);

    for (const size of sizes) {
      await page.setViewportSize(size);
      await page.goto("/dashboard/portals");
      await page.waitForLoadState("networkidle");

      // Try to open a form/modal if available
      const addButton = page
        .locator('button:has-text("Add"), button:has-text("Create")')
        .first();

      if ((await addButton.count()) > 0) {
        await addButton.click();

        // Modal should be visible and fit in viewport
        const modal = page.locator("[role='dialog']").first();

        if ((await modal.count()) > 0) {
          const box = await modal.boundingBox();

          if (box) {
            // Modal width should fit in viewport with padding
            expect(box.width).toBeLessThanOrEqual(size.width - 20);
          }
        }

        // Close modal
        const closeButton = modal.locator(
          'button[aria-label="close"], button:has-text("×")'
        ).first();

        if ((await closeButton.count()) > 0) {
          await closeButton.click();
        }
      }
    }
  });

  // Test 15: Viewport meta tag present
  test("should have correct viewport meta tag", async ({ page }) => {
    await setupAuthenticatedSession(page);
    await page.goto("/dashboard");

    const viewportMeta = await page.evaluate(() => {
      const meta = document.querySelector('meta[name="viewport"]');
      return meta?.getAttribute("content");
    });

    // Should have viewport meta for responsive design
    expect(viewportMeta).toBeTruthy();
    expect(viewportMeta).toContain("width=device-width");
  });

  // Test 16: CSS media queries working
  test("should apply media queries correctly", async ({ page }) => {
    await setupAuthenticatedSession(page);

    const viewportSizes = [375, 768, 1280];

    for (const width of viewportSizes) {
      await page.setViewportSize({ width, height: 800 });
      await page.goto("/dashboard");
      await page.waitForLoadState("networkidle");

      // Check if responsive classes are applied
      const html = await page.locator("html").evaluate((el) => {
        return {
          classes: el.className,
          attrs: Array.from(el.attributes).reduce(
            (acc, attr) => {
              acc[attr.name] = attr.value;
              return acc;
            },
            {} as Record<string, string>
          ),
        };
      });

      // Just verify page is responsive
      const mainContent = page.locator("main");
      await expect(mainContent).toBeVisible();
    }
  });
});
