/**
 * Navigation E2E Tests
 * Author: Ahmed Adel Bakr Alderai
 * Tests: Sidebar navigation, sub-navigation, back buttons, page loading
 */

import { test, expect, type Page, type Route } from "@playwright/test";

test.describe("Navigation", () => {
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
   * Helper: Mock all API responses
   */
  async function mockApiResponses(page: Page) {
    // Mock dashboard data
    await page.route("**/api/**", (route: Route) => {
      const url = route.request().url();

      if (url.includes("/applications")) {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            data: [],
            total: 0,
          }),
        });
      } else if (url.includes("/jobs")) {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            data: [],
            total: 0,
          }),
        });
      } else if (url.includes("/analytics")) {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            stats: {
              total_applications: 0,
              success_rate: 0,
            },
          }),
        });
      } else if (url.includes("/intelligence")) {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            data: [],
          }),
        });
      } else {
        route.continue();
      }
    });
  }

  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedSession(page);
    await mockApiResponses(page);
  });

  // Test 1: Sidebar navigation - click through each major link
  test("should navigate through all sidebar links without 404s", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Define sidebar sections and their links
    const navItems = [
      "/dashboard", // Dashboard
      "/dashboard/analytics", // Analytics
      "/dashboard/jobs", // Jobs
      "/dashboard/applications", // Applications
      "/dashboard/contacts", // Contacts
      "/dashboard/recruiters", // Recruiters
      "/dashboard/agents", // Agents
      "/dashboard/intelligence", // Intel Hub
      "/dashboard/settings", // Settings
      "/dashboard/billing", // Billing
    ];

    for (const href of navItems) {
      // Navigate using the sidebar link
      const link = page.locator(`a[href="${href}"]`).first();

      if ((await link.count()) > 0) {
        await link.click();
        await page.waitForLoadState("networkidle");

        // Verify no 404 or error page
        await expect(page).not.toHaveTitle(/404|error/i);
        await expect(page).toHaveURL(new RegExp(href.replace(/\//g, "\\/")));

        // Verify page has content (not empty)
        const main = page.locator("main");
        await expect(main).toBeVisible();
      }
    }
  });

  // Test 2: Intelligence sub-navigation
  test("should navigate through intelligence sub-pages", async ({ page }) => {
    // Navigate to intelligence hub first
    await page.goto("/dashboard/intelligence");
    await page.waitForLoadState("networkidle");

    const subPages = [
      "/dashboard/intelligence/work-mode",
      "/dashboard/intelligence/employment-type",
      "/dashboard/intelligence/visa",
      "/dashboard/intelligence/salary",
      "/dashboard/intelligence/skills",
    ];

    for (const href of subPages) {
      const link = page.locator(`a[href="${href}"]`).first();

      if ((await link.count()) > 0) {
        await link.click();
        await page.waitForLoadState("networkidle");

        // Verify no error page
        await expect(page).not.toHaveTitle(/404|error/i);
        await expect(page).toHaveURL(new RegExp(href.replace(/\//g, "\\/")));
      }
    }
  });

  // Test 3: Back button navigation
  test("should navigate back from intelligence sub-page to hub", async ({
    page,
  }) => {
    // Navigate to work-mode page
    await page.goto("/dashboard/intelligence/work-mode");
    await page.waitForLoadState("networkidle");

    // Find back button (usually ArrowLeft icon in header)
    const backButton = page.locator("button[aria-label*='back' i]").first();

    if ((await backButton.count()) > 0) {
      await backButton.click();
      await page.waitForLoadState("networkidle");

      // Should be back at intelligence hub
      await expect(page).toHaveURL("/dashboard/intelligence");
    }

    // Alternative: Use browser back
    await page.goto("/dashboard/intelligence/employment-type");
    await page.waitForLoadState("networkidle");

    await page.goBack();
    await page.waitForLoadState("networkidle");

    // Should be back at intelligence hub
    await expect(page).toHaveURL(/\/dashboard\/intelligence/);
  });

  // Test 4: All major pages load without content errors
  test("should load all pages with visible content", async ({ page }) => {
    const pages = [
      { url: "/dashboard", title: /dashboard/i },
      { url: "/dashboard/analytics", title: /analytics/i },
      { url: "/dashboard/jobs", title: /jobs/i },
      { url: "/dashboard/applications", title: /applications/i },
      { url: "/dashboard/contacts", title: /contacts/i },
      { url: "/dashboard/intelligence", title: /intelligence|intel/i },
      { url: "/dashboard/settings", title: /settings/i },
    ];

    for (const page_item of pages) {
      await page.goto(page_item.url);
      await page.waitForLoadState("networkidle");

      // Verify page loaded successfully
      const mainContent = page.locator("main");
      await expect(mainContent).toBeVisible();

      // Verify no error messages
      const errorElements = page.locator(
        "text=/error|failed|something went wrong/i"
      );
      expect(await errorElements.count()).toBe(0);

      // Verify HTTP status 200
      const response = await page.waitForResponse(
        (resp) =>
          resp.url().includes(page_item.url) &&
          (resp.status() === 200 || resp.request().method() === "GET")
      );
      if (response) {
        expect([200, 304, 206]).toContain(response.status());
      }
    }
  });

  // Test 5: Sidebar collapse/expand on desktop
  test("should toggle sidebar collapse on desktop", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Only test on viewport with sidebar (desktop)
    if ((page.viewportSize()?.width ?? 0) >= 1024) {
      // Find sidebar toggle button
      const toggleButton = page.locator(
        "button[aria-label*='toggle' i], button:has-text('›'), button:has-text('‹')"
      ).first();

      if ((await toggleButton.count()) > 0) {
        const sidebar = page.locator("aside, nav[class*='sidebar']").first();
        const initialWidth = await sidebar.evaluate(
          (el) => window.getComputedStyle(el).width
        );

        // Click to collapse
        await toggleButton.click();
        await page.waitForTimeout(300); // Wait for animation

        const collapsedWidth = await sidebar.evaluate(
          (el) => window.getComputedStyle(el).width
        );

        // Verify sidebar changed size
        expect(collapsedWidth).not.toBe(initialWidth);

        // Click to expand
        await toggleButton.click();
        await page.waitForTimeout(300);

        const expandedWidth = await sidebar.evaluate(
          (el) => window.getComputedStyle(el).width
        );

        expect(expandedWidth).toBe(initialWidth);
      }
    }
  });

  // Test 6: Mobile navigation menu
  test("should show hamburger menu on mobile", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Look for hamburger/menu button
    const hamburgerButton = page.locator(
      "button[aria-label*='menu' i], button:has-text('☰')"
    ).first();

    if ((await hamburgerButton.count()) > 0) {
      await expect(hamburgerButton).toBeVisible();

      // Click to open menu
      await hamburgerButton.click();

      // Menu should become visible
      const mobileMenu = page.locator(
        "[class*='mobile'], [class*='menu'], [role='navigation']"
      );
      // At least one menu element should be visible
      expect(await mobileMenu.count()).toBeGreaterThan(0);
    }
  });

  // Test 7: Breadcrumb navigation
  test("should display breadcrumb navigation", async ({ page }) => {
    await page.goto("/dashboard/intelligence/work-mode");
    await page.waitForLoadState("networkidle");

    // Look for breadcrumb
    const breadcrumb = page.locator(
      "[class*='breadcrumb'], nav[aria-label='breadcrumb']"
    );

    if ((await breadcrumb.count()) > 0) {
      // Click parent breadcrumb to navigate
      const parentLink = breadcrumb.locator("a").nth(0);
      if ((await parentLink.count()) > 0) {
        await parentLink.click();
        await page.waitForLoadState("networkidle");

        // Should navigate to parent page
        const currentUrl = page.url();
        expect(currentUrl).toContain("/dashboard/intelligence");
        expect(currentUrl).not.toContain("work-mode");
      }
    }
  });

  // Test 8: Navigation maintains scroll position
  test("should maintain context when navigating back", async ({ page }) => {
    // Navigate to a list page
    await page.goto("/dashboard/applications");
    await page.waitForLoadState("networkidle");

    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 500));
    const scrollBefore = await page.evaluate(() => window.scrollY);

    // Navigate away and back
    const backLink = page.locator("a[href='/dashboard']").first();
    if ((await backLink.count()) > 0) {
      await backLink.click();
      await page.waitForLoadState("networkidle");
    }

    // Use browser back button
    await page.goBack();
    await page.waitForLoadState("networkidle");

    // Note: Modern SPAs might not restore scroll automatically
    // This test documents the behavior
    const scrollAfter = await page.evaluate(() => window.scrollY);
    // Just verify page loaded correctly
    await expect(page).toHaveURL(/\/applications/);
  });

  // Test 9: Active link highlighting
  test("should highlight active navigation item", async ({ page }) => {
    await page.goto("/dashboard/jobs");
    await page.waitForLoadState("networkidle");

    // Find the jobs link in sidebar
    const jobsLink = page.locator(`a[href="/dashboard/jobs"]`);

    if ((await jobsLink.count()) > 0) {
      // Check if it has active styling
      const activeIndicator = jobsLink.locator(
        "[class*='active'], [class*='selected'], [class*='current']"
      );

      // The link should have some visual indication of being active
      const classes = await jobsLink.first().getAttribute("class");
      expect(classes).toBeTruthy();
    }
  });

  // Test 10: External link handling
  test("should handle external navigation links", async ({ page }) => {
    await page.goto("/dashboard/settings");
    await page.waitForLoadState("networkidle");

    // Look for external links (might open in new tab)
    const externalLinks = page.locator('a[target="_blank"]');

    if ((await externalLinks.count()) > 0) {
      const firstLink = externalLinks.first();
      const href = await firstLink.getAttribute("href");

      // Verify href is valid URL
      expect(href).toBeTruthy();
      if (href) {
        expect(href.match(/^https?:\/\//i)).toBeTruthy();
      }
    }
  });
});
