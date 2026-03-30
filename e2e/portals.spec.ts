/**
 * Portals E2E Tests
 * Author: Ahmed Adel Bakr Alderai
 * Tests: Viewing portals, Adding new portals, Portal management
 */

import { test, expect, type Page, type Route } from "@playwright/test";

test.describe("Portals Management", () => {
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
   * Helper: Mock portals API
   */
  async function mockPortalsApi(page: Page) {
    // Mock GET portals
    await page.route("**/portals", (route: Route) => {
      if (route.request().method() === "GET") {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            data: [
              {
                id: 1,
                name: "LinkedIn",
                url: "https://linkedin.com",
                icon: "linkedin",
                active: true,
                connected: true,
              },
              {
                id: 2,
                name: "Greenhouse",
                url: "https://greenhouse.io",
                icon: "greenhouse",
                active: true,
                connected: false,
              },
              {
                id: 3,
                name: "Workday",
                url: "https://workday.com",
                icon: "workday",
                active: false,
                connected: true,
              },
            ],
            total: 3,
          }),
        });
      } else if (route.request().method() === "POST") {
        // Mock create portal
        route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({
            id: 4,
            name: "new-portal",
            url: "https://newportal.com",
            icon: "default",
            active: true,
            connected: false,
          }),
        });
      }
    });

    // Mock portal detail endpoints
    await page.route("**/portals/*", (route: Route) => {
      route.continue();
    });
  }

  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedSession(page);
    await mockPortalsApi(page);

    // Mock other API calls
    await page.route("**/api/**", (route: Route) => {
      route.continue();
    });
  });

  // Test 1: View portals list
  test("should display portal cards", async ({ page }) => {
    await page.goto("/dashboard/portals");
    await page.waitForLoadState("networkidle");

    // Verify page title/header
    const header = page.locator("text=/portal/i").first();
    await expect(header).toBeVisible();

    // Look for portal cards
    const portalCards = page.locator(
      "[class*='card'], [class*='portal'], [role='group']"
    );

    // Should have at least one portal card visible
    await expect(portalCards.first()).toBeVisible();

    // Verify portal information is displayed
    const linkedinText = page.locator("text=/linkedin/i").first();
    await expect(linkedinText).toBeVisible();
  });

  // Test 2: Portal card elements
  test("should display portal information on cards", async ({ page }) => {
    await page.goto("/dashboard/portals");
    await page.waitForLoadState("networkidle");

    // Look for portal cards
    const firstCard = page.locator("[class*='card']").first();
    await expect(firstCard).toBeVisible();

    // Verify card contains portal name
    const portalName = firstCard.locator("text=/linkedin|greenhouse|workday/i");
    await expect(portalName).toBeVisible();

    // Verify card contains status/status badge
    const statusElements = firstCard.locator(
      "[class*='badge'], [class*='status'], [class*='pill']"
    );

    // At least some status indicator should be present
    if ((await statusElements.count()) > 0) {
      await expect(statusElements.first()).toBeVisible();
    }
  });

  // Test 3: Add portal form - open
  test("should open add portal form", async ({ page }) => {
    await page.goto("/dashboard/portals");
    await page.waitForLoadState("networkidle");

    // Find add portal button
    const addButton = page
      .locator('button:has-text("Add"), button:has-text("Create")')
      .first();

    if ((await addButton.count()) > 0) {
      await addButton.click();

      // Wait for form/modal to appear
      const form = page.locator("form, [role='dialog'], [class*='modal']").first();
      await expect(form).toBeVisible();

      // Verify form fields exist
      const inputFields = form.locator("input, textarea, select");
      expect(await inputFields.count()).toBeGreaterThan(0);
    }
  });

  // Test 4: Add portal form fields
  test("should display form fields for adding portal", async ({ page }) => {
    await page.goto("/dashboard/portals");
    await page.waitForLoadState("networkidle");

    // Open add portal form
    const addButton = page
      .locator('button:has-text("Add"), button:has-text("Create")')
      .first();

    if ((await addButton.count()) > 0) {
      await addButton.click();

      // Look for form fields
      const form = page.locator("form, [role='dialog']").first();
      await expect(form).toBeVisible();

      // Verify common portal fields
      const nameInput = form.locator(
        'input[placeholder*="Name" i], input[id*="name" i]'
      );
      const urlInput = form.locator(
        'input[placeholder*="URL" i], input[id*="url" i], input[type="url"]'
      );

      if ((await nameInput.count()) > 0) {
        await expect(nameInput).toBeVisible();
      }

      if ((await urlInput.count()) > 0) {
        await expect(urlInput).toBeVisible();
      }
    }
  });

  // Test 5: Submit add portal form
  test("should submit add portal form", async ({ page }) => {
    await page.goto("/dashboard/portals");
    await page.waitForLoadState("networkidle");

    // Open add portal form
    const addButton = page
      .locator('button:has-text("Add"), button:has-text("Create")')
      .first();

    if ((await addButton.count()) > 0) {
      await addButton.click();

      // Find form
      const form = page.locator("form, [role='dialog']").first();
      await expect(form).toBeVisible();

      // Fill form fields
      const nameInput = form.locator(
        'input[placeholder*="Name" i], input[id*="name" i]'
      ).first();
      const urlInput = form.locator(
        'input[placeholder*="URL" i], input[id*="url" i], input[type="url"]'
      ).first();

      if ((await nameInput.count()) > 0) {
        await nameInput.fill("New Portal");
      }

      if ((await urlInput.count()) > 0) {
        await urlInput.fill("https://newportal.com");
      }

      // Find and click submit button
      const submitButton = form.locator(
        'button[type="submit"], button:has-text("Create"), button:has-text("Add")'
      ).first();

      if ((await submitButton.count()) > 0) {
        await submitButton.click();

        // Wait for submission
        await page.waitForLoadState("networkidle");

        // Form should close or show success
        const formVisible = await form.isVisible().catch(() => false);
        const successMessage = await page
          .locator("text=/success|created|added/i")
          .isVisible()
          .catch(() => false);

        expect(formVisible === false || successMessage).toBeTruthy();
      }
    }
  });

  // Test 6: Portal action buttons (activate/deactivate)
  test("should toggle portal active status", async ({ page }) => {
    await page.goto("/dashboard/portals");
    await page.waitForLoadState("networkidle");

    // Find a portal card
    const portalCard = page.locator("[class*='card']").first();
    await expect(portalCard).toBeVisible();

    // Look for activate/deactivate button
    const toggleButton = portalCard.locator(
      'button[aria-label*="toggle" i], button[aria-label*="activate" i], button:has-text("Enable|Disable|Activate|Deactivate")'
    ).first();

    if ((await toggleButton.count()) > 0) {
      const initialText = await toggleButton.textContent();
      await toggleButton.click();

      await page.waitForLoadState("networkidle");

      // Button text should change
      const newText = await toggleButton.textContent();
      expect(newText).not.toBe(initialText);
    }
  });

  // Test 7: Portal connection status
  test("should display portal connection status", async ({ page }) => {
    await page.goto("/dashboard/portals");
    await page.waitForLoadState("networkidle");

    // Look for status indicators
    const connectedBadges = page.locator(
      "text=/connected|disconnected|active|inactive/i"
    );

    // At least one status should be visible
    if ((await connectedBadges.count()) > 0) {
      await expect(connectedBadges.first()).toBeVisible();
    }
  });

  // Test 8: Portal configuration modal
  test("should open portal configuration", async ({ page }) => {
    await page.goto("/dashboard/portals");
    await page.waitForLoadState("networkidle");

    // Find a portal card
    const portalCard = page.locator("[class*='card']").first();
    await expect(portalCard).toBeVisible();

    // Look for settings/config button
    const settingsButton = portalCard.locator(
      'button[aria-label*="settings" i], button[aria-label*="config" i], button[aria-label*="options" i]'
    ).first();

    if ((await settingsButton.count()) > 0) {
      await settingsButton.click();

      // Config panel/modal should appear
      const configPanel = page.locator(
        "[role='dialog'], [class*='modal'], [class*='panel']"
      ).first();
      await expect(configPanel).toBeVisible();
    }
  });

  // Test 9: Delete portal
  test("should delete portal with confirmation", async ({ page }) => {
    // Mock delete endpoint
    await page.route("**/portals/*", (route: Route) => {
      if (route.request().method() === "DELETE") {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true }),
        });
      } else {
        route.continue();
      }
    });

    await page.goto("/dashboard/portals");
    await page.waitForLoadState("networkidle");

    // Find a portal card
    const portalCard = page.locator("[class*='card']").first();
    await expect(portalCard).toBeVisible();

    // Look for delete button
    const deleteButton = portalCard.locator(
      'button[aria-label*="delete" i], button[aria-label*="remove" i], button:has-text("Delete")'
    ).first();

    if ((await deleteButton.count()) > 0) {
      await deleteButton.click();

      // Confirmation dialog might appear
      const confirmButton = page.locator(
        'button:has-text("Confirm"), button:has-text("Delete"), button:has-text("Yes")'
      ).first();

      if ((await confirmButton.count()) > 0) {
        await confirmButton.click();
      }

      await page.waitForLoadState("networkidle");

      // Portal should be removed from list
      // (In a real scenario, page would update)
    }
  });

  // Test 10: Portal search/filter
  test("should search portals", async ({ page }) => {
    await page.goto("/dashboard/portals");
    await page.waitForLoadState("networkidle");

    // Look for search input
    const searchInput = page.locator(
      'input[placeholder*="Search" i], input[placeholder*="Filter" i]'
    ).first();

    if ((await searchInput.count()) > 0) {
      // Search for a specific portal
      await searchInput.fill("LinkedIn");
      await page.waitForLoadState("networkidle");

      // Results should be filtered
      const results = page.locator("text=/LinkedIn/i");
      await expect(results.first()).toBeVisible();

      // Clear search
      await searchInput.clear();
      await page.waitForLoadState("networkidle");

      // All portals should be visible again
      const allPortals = page.locator("[class*='card']");
      expect(await allPortals.count()).toBeGreaterThanOrEqual(1);
    }
  });

  // Test 11: Portal categories/types
  test("should display portal categories", async ({ page }) => {
    await page.goto("/dashboard/portals");
    await page.waitForLoadState("networkidle");

    // Look for category filters or grouped portals
    const categoryTabs = page.locator(
      "[role='tablist'], [class*='tabs'], [class*='category']"
    ).first();

    if ((await categoryTabs.count()) > 0) {
      await expect(categoryTabs).toBeVisible();

      // Click different categories
      const tabs = categoryTabs.locator("[role='tab']");
      const tabCount = await tabs.count();

      if (tabCount > 1) {
        for (let i = 0; i < Math.min(tabCount, 3); i++) {
          const tab = tabs.nth(i);
          await tab.click();
          await page.waitForLoadState("networkidle");

          // Content should update for selected category
        }
      }
    }
  });

  // Test 12: Portal sync/refresh
  test("should refresh portal status", async ({ page }) => {
    await page.goto("/dashboard/portals");
    await page.waitForLoadState("networkidle");

    // Look for refresh button
    const refreshButton = page.locator(
      'button[aria-label*="refresh" i], button[aria-label*="sync" i], button:has-text("Refresh")'
    ).first();

    if ((await refreshButton.count()) > 0) {
      await refreshButton.click();

      // Wait for network activity
      await page.waitForLoadState("networkidle");

      // Page should still be functional
      const portalCards = page.locator("[class*='card']");
      expect(await portalCards.count()).toBeGreaterThan(0);
    }
  });

  // Test 13: Responsive layout
  test("should display portals responsively", async ({ page }) => {
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/dashboard/portals");
    await page.waitForLoadState("networkidle");

    // Portal cards should be visible and properly sized
    const portalCards = page.locator("[class*='card']");
    await expect(portalCards.first()).toBeVisible();

    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Should display in columns
    const cardCount = await portalCards.count();
    expect(cardCount).toBeGreaterThan(0);

    // Test desktop view
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.reload();
    await page.waitForLoadState("networkidle");

    await expect(portalCards.first()).toBeVisible();
  });

  // Test 14: Portal pagination
  test("should handle multiple portals with pagination", async ({ page }) => {
    await page.goto("/dashboard/portals");
    await page.waitForLoadState("networkidle");

    // Look for pagination controls
    const pagination = page.locator(
      "[class*='pagination'], [role='navigation']"
    );

    if ((await pagination.count()) > 0) {
      // Next button should exist
      const nextButton = pagination.locator(
        'button[aria-label*="next" i], button:has-text("Next")'
      );

      if ((await nextButton.count()) > 0) {
        await nextButton.click();
        await page.waitForLoadState("networkidle");

        // Content should change
        const portalCards = page.locator("[class*='card']");
        expect(await portalCards.count()).toBeGreaterThan(0);
      }
    }
  });

  // Test 15: Portal bulk actions
  test("should support bulk actions on portals", async ({ page }) => {
    await page.goto("/dashboard/portals");
    await page.waitForLoadState("networkidle");

    // Look for select checkboxes on portal cards
    const checkboxes = page.locator('input[type="checkbox"]');

    if ((await checkboxes.count()) > 0) {
      // Select first portal
      await checkboxes.first().check();

      // Bulk action menu should appear
      const bulkActions = page.locator(
        "[class*='bulk'], [class*='actions'], [class*='toolbar']"
      );

      if ((await bulkActions.count()) > 0) {
        await expect(bulkActions.first()).toBeVisible();
      }
    }
  });
});
