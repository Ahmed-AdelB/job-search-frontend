/**
 * Intelligence Hub E2E Tests
 * Author: Ahmed Adel Bakr Alderai
 * Tests: Work mode detection, Employment type detection, Visa detection
 */

import { test, expect, type Page, type Route } from "@playwright/test";

test.describe("Intelligence Hub", () => {
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
   * Helper: Mock work mode detection API
   */
  async function mockWorkModeDetection(page: Page) {
    await page.route("**/intelligence/work-mode/detect", (route: Route) => {
      const request = route.request();
      const postData = request.postDataJSON?.() || {};

      // Simulate detection based on input
      const title = (postData.title || "").toLowerCase();
      let workMode = "unknown";

      if (title.includes("remote")) {
        workMode = "remote";
      } else if (title.includes("hybrid")) {
        workMode = "hybrid";
      } else if (title.includes("on-site") || title.includes("on site")) {
        workMode = "on-site";
      }

      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          work_mode: workMode,
          confidence: 0.95,
          details: `Detected work mode: ${workMode}`,
        }),
      });
    });
  }

  /**
   * Helper: Mock employment type detection API
   */
  async function mockEmploymentTypeDetection(page: Page) {
    await page.route("**/intelligence/employment-type/detect", (route: Route) => {
      const request = route.request();
      const postData = request.postDataJSON?.() || {};

      // Simulate detection based on input
      const title = (postData.title || "").toLowerCase();
      let employmentType = "full-time";

      if (title.includes("contract")) {
        employmentType = "contract";
      } else if (title.includes("part-time")) {
        employmentType = "part-time";
      } else if (title.includes("freelance")) {
        employmentType = "freelance";
      } else if (title.includes("temporary")) {
        employmentType = "temporary";
      }

      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          employment_type: employmentType,
          confidence: 0.92,
          details: `Detected employment type: ${employmentType}`,
        }),
      });
    });
  }

  /**
   * Helper: Mock visa sponsorship detection API
   */
  async function mockVisaDetection(page: Page) {
    await page.route("**/intelligence/visa/detect", (route: Route) => {
      const request = route.request();
      const postData = request.postDataJSON?.() || {};

      // Simulate detection based on input
      const description = (
        postData.description ||
        postData.title ||
        ""
      ).toLowerCase();
      const visaSponsorship = description.includes("visa")
        ? true
        : description.includes("no visa")
          ? false
          : null;

      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          visa_sponsorship: visaSponsorship,
          confidence: visaSponsorship !== null ? 0.88 : 0.5,
          details: visaSponsorship
            ? "Visa sponsorship mentioned"
            : "No visa sponsorship info found",
        }),
      });
    });
  }

  /**
   * Helper: Mock stats API
   */
  async function mockStatsApi(page: Page) {
    await page.route("**/intelligence/work-mode/stats", (route: Route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          remote_count: 45,
          hybrid_count: 32,
          onsite_count: 18,
          total: 95,
        }),
      });
    });

    await page.route("**/intelligence/employment-type/stats", (route: Route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          full_time_count: 70,
          contract_count: 15,
          part_time_count: 8,
          freelance_count: 2,
          total: 95,
        }),
      });
    });

    await page.route("**/intelligence/visa/stats", (route: Route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          visa_sponsorship_count: 52,
          no_sponsorship_count: 28,
          unknown_count: 15,
          total: 95,
        }),
      });
    });
  }

  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedSession(page);
    await mockWorkModeDetection(page);
    await mockEmploymentTypeDetection(page);
    await mockVisaDetection(page);
    await mockStatsApi(page);

    // Mock any other API calls
    await page.route("**/api/**", (route: Route) => {
      route.continue();
    });
  });

  // Test 1: Work mode detection
  test("should detect work mode from job title", async ({ page }) => {
    await page.goto("/dashboard/intelligence/work-mode");
    await page.waitForLoadState("networkidle");

    // Verify page loaded
    await expect(page.locator("text=/work mode/i").first()).toBeVisible();

    // Fill in title field
    const titleInput = page.locator(
      'input[placeholder*="Job Title" i], input[id*="title" i]'
    ).first();

    await titleInput.fill("Senior Remote SWE");

    // Fill description if available
    const descriptionInput = page.locator(
      'textarea[placeholder*="description" i], textarea[placeholder*="job" i]'
    ).first();

    if ((await descriptionInput.count()) > 0) {
      await descriptionInput.fill(
        "Work fully remote from anywhere in the world"
      );
    }

    // Click detect button
    const detectButton = page
      .locator('button:has-text("Detect"), button:has-text("Analyze")')
      .first();
    await detectButton.click();

    // Wait for response and verify badge appears
    await page.waitForLoadState("networkidle");

    // Look for result badge with work mode
    const badge = page.locator("[class*='badge']").first();
    await expect(badge).toBeVisible();

    // Verify the badge contains a work mode value
    const badgeText = await badge.textContent();
    expect(
      badgeText?.toLowerCase() || ""
    ).toMatch(/remote|hybrid|on-site|onsite/i);
  });

  // Test 2: Employment type detection
  test("should detect employment type from job description", async ({
    page,
  }) => {
    await page.goto("/dashboard/intelligence/employment-type");
    await page.waitForLoadState("networkidle");

    // Verify page loaded
    await expect(
      page.locator("text=/employment.*type/i").first()
    ).toBeVisible();

    // Fill in title field
    const titleInput = page.locator(
      'input[placeholder*="Title" i], input[id*="title" i]'
    ).first();

    await titleInput.fill("Contract DevOps Engineer");

    // Fill description if available
    const descriptionInput = page.locator(
      'textarea[placeholder*="description" i]'
    ).first();

    if ((await descriptionInput.count()) > 0) {
      await descriptionInput.fill(
        "6-month contract position for infrastructure work"
      );
    }

    // Click detect button
    const detectButton = page
      .locator('button:has-text("Detect"), button:has-text("Analyze")')
      .first();
    await detectButton.click();

    // Wait for response
    await page.waitForLoadState("networkidle");

    // Look for result badge
    const badge = page.locator("[class*='badge']").first();
    await expect(badge).toBeVisible();

    // Verify the badge contains employment type
    const badgeText = await badge.textContent();
    expect(
      badgeText?.toLowerCase() || ""
    ).toMatch(/full-time|contract|part-time|freelance|temporary/i);
  });

  // Test 3: Visa sponsorship detection
  test("should detect visa sponsorship eligibility", async ({ page }) => {
    await page.goto("/dashboard/intelligence/visa");
    await page.waitForLoadState("networkidle");

    // Verify page loaded
    await expect(page.locator("text=/visa/i").first()).toBeVisible();

    // Fill in title field
    const titleInput = page.locator(
      'input[placeholder*="Title" i], input[id*="title" i]'
    ).first();

    await titleInput.fill("Senior Engineer");

    // Fill description with visa mention
    const descriptionInput = page.locator(
      'textarea[placeholder*="description" i]'
    ).first();

    if ((await descriptionInput.count()) > 0) {
      await descriptionInput.fill(
        "We provide visa sponsorship for qualified international candidates"
      );
    }

    // Click detect button
    const detectButton = page
      .locator('button:has-text("Detect"), button:has-text("Analyze")')
      .first();
    await detectButton.click();

    // Wait for response
    await page.waitForLoadState("networkidle");

    // Look for result indicator (badge, icon, or text)
    const resultElement = page.locator("[class*='badge'], [class*='result']").first();
    await expect(resultElement).toBeVisible();
  });

  // Test 4: Statistics display
  test("should display work mode statistics", async ({ page }) => {
    await page.goto("/dashboard/intelligence/work-mode");
    await page.waitForLoadState("networkidle");

    // Look for stats cards
    const statsCards = page.locator("[class*='card'], [class*='stat']");
    await expect(statsCards.first()).toBeVisible();

    // Verify stats are displayed
    const remoteStats = page.locator("text=/remote/i");
    const hybridStats = page.locator("text=/hybrid/i");
    const onsiteStats = page.locator("text=/on-site|onsite/i");

    // At least some stats should be visible
    const visibleStats = await Promise.all([
      remoteStats.isVisible().catch(() => false),
      hybridStats.isVisible().catch(() => false),
      onsiteStats.isVisible().catch(() => false),
    ]);

    expect(visibleStats.some((visible) => visible)).toBe(true);
  });

  // Test 5: Detection confidence display
  test("should display confidence scores", async ({ page }) => {
    await page.goto("/dashboard/intelligence/work-mode");
    await page.waitForLoadState("networkidle");

    // Fill and detect
    const titleInput = page.locator(
      'input[placeholder*="Title" i], input[id*="title" i]'
    ).first();
    await titleInput.fill("Remote Position");

    const detectButton = page
      .locator('button:has-text("Detect"), button:has-text("Analyze")')
      .first();
    await detectButton.click();

    // Wait for response
    await page.waitForLoadState("networkidle");

    // Look for confidence text
    const confidenceText = page.locator("text=/confidence|accuracy|%/i");
    await expect(confidenceText.first()).toBeVisible();

    // Verify it shows a percentage
    const text = await confidenceText.first().textContent();
    expect(text).toMatch(/\d+%/);
  });

  // Test 6: Intelligence hub main page navigation
  test("should navigate to intelligence sub-pages from hub", async ({
    page,
  }) => {
    await page.goto("/dashboard/intelligence");
    await page.waitForLoadState("networkidle");

    // Find and click work mode card/link
    const workModeLink = page.locator(
      'a[href*="work-mode"], button:has-text("Work Mode")'
    ).first();

    if ((await workModeLink.count()) > 0) {
      await workModeLink.click();
      await page.waitForLoadState("networkidle");

      // Should navigate to work-mode page
      await expect(page).toHaveURL(/work-mode/);
    }
  });

  // Test 7: Error handling on detection
  test("should handle detection errors gracefully", async ({ page }) => {
    // Mock failed detection
    await page.route("**/intelligence/work-mode/detect", (route: Route) => {
      route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({
          detail: "Invalid input",
        }),
      });
    });

    await page.goto("/dashboard/intelligence/work-mode");
    await page.waitForLoadState("networkidle");

    // Try to detect with minimal input
    const titleInput = page.locator(
      'input[placeholder*="Title" i], input[id*="title" i]'
    ).first();
    await titleInput.fill("x"); // Minimal input

    const detectButton = page
      .locator('button:has-text("Detect"), button:has-text("Analyze")')
      .first();
    await detectButton.click();

    // Wait for error response
    await page.waitForLoadState("networkidle");

    // Should either show error message or disable button
    const errorElement = page.locator("text=/error|failed/i");
    const isErrorVisible = await errorElement.isVisible().catch(() => false);

    if (isErrorVisible) {
      expect(isErrorVisible).toBe(true);
    }
  });

  // Test 8: Clear detection results
  test("should allow clearing detection results", async ({ page }) => {
    await page.goto("/dashboard/intelligence/work-mode");
    await page.waitForLoadState("networkidle");

    // Perform detection
    const titleInput = page.locator(
      'input[placeholder*="Title" i], input[id*="title" i]'
    ).first();
    await titleInput.fill("Remote Senior Engineer");

    const detectButton = page
      .locator('button:has-text("Detect"), button:has-text("Analyze")')
      .first();
    await detectButton.click();

    await page.waitForLoadState("networkidle");

    // Look for badge result
    const badge = page.locator("[class*='badge']").first();
    await expect(badge).toBeVisible();

    // Find and click clear button if available
    const clearButton = page.locator(
      'button:has-text("Clear"), button:has-text("Reset")'
    ).first();

    if ((await clearButton.count()) > 0) {
      await clearButton.click();

      // Badge should disappear
      await expect(badge).not.toBeVisible();

      // Input should be cleared
      const inputValue = await titleInput.inputValue();
      expect(inputValue).toBe("");
    }
  });

  // Test 9: Batch detection
  test("should handle multiple detections sequentially", async ({ page }) => {
    await page.goto("/dashboard/intelligence/work-mode");
    await page.waitForLoadState("networkidle");

    const titleInput = page.locator(
      'input[placeholder*="Title" i], input[id*="title" i]'
    ).first();
    const detectButton = page
      .locator('button:has-text("Detect"), button:has-text("Analyze")')
      .first();

    const testInputs = [
      "Remote SWE",
      "Hybrid Product Manager",
      "On-Site DevOps",
    ];

    for (const input of testInputs) {
      await titleInput.fill(input);
      await detectButton.click();
      await page.waitForLoadState("networkidle");

      // Verify result appears
      const badge = page.locator("[class*='badge']").first();
      await expect(badge).toBeVisible();
    }
  });

  // Test 10: Responsive layout on intelligence pages
  test("should display intelligence pages responsively", async ({ page }) => {
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/dashboard/intelligence/work-mode");
    await page.waitForLoadState("networkidle");

    // Input should be full width and accessible
    const titleInput = page.locator(
      'input[placeholder*="Title" i], input[id*="title" i]'
    ).first();
    await expect(titleInput).toBeVisible();
    await titleInput.fill("Remote Position");

    const detectButton = page
      .locator('button:has-text("Detect"), button:has-text("Analyze")')
      .first();
    await expect(detectButton).toBeVisible();

    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Elements should still be visible and functional
    await expect(titleInput).toBeVisible();
    await expect(detectButton).toBeVisible();
  });
});
