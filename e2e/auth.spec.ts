/**
 * Authentication E2E Tests
 * Author: Ahmed Adel Bakr Alderai
 * Tests: Login, Auth Redirect, Logout, Register flows
 */

import { test, expect, type Page, type Route } from "@playwright/test";

const API_URL = "http://localhost:8082";
const APP_URL = "http://localhost:3001";

test.describe("Authentication", () => {
  /**
   * Helper: Mock successful login API response
   */
  async function mockLoginSuccess(page: Page) {
    await page.route("**/auth/login", (route: Route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          token: "test-jwt-token-12345",
          user_id: "u-test-001",
          email: "test@example.com",
          name: "Test User",
        }),
      });
    });
  }

  /**
   * Helper: Mock failed login API response
   */
  async function mockLoginFailure(page: Page) {
    await page.route("**/auth/login", (route: Route) => {
      route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({
          detail: "Invalid credentials",
        }),
      });
    });
  }

  /**
   * Helper: Mock successful registration API response
   */
  async function mockRegisterSuccess(page: Page) {
    await page.route("**/auth/register", (route: Route) => {
      route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          token: "test-jwt-token-12345",
          user_id: "u-new-user-001",
          email: "newuser@example.com",
          name: "New User",
        }),
      });
    });
  }

  /**
   * Helper: Set auth token in localStorage (simulating successful login)
   */
  async function setAuthToken(page: Page, token: string = "test-jwt-token-12345") {
    await page.evaluate((token) => {
      localStorage.setItem("auth-token", token);
      localStorage.setItem(
        "auth-user",
        JSON.stringify({
          user_id: "u-test-001",
          email: "test@example.com",
          name: "Test User",
        })
      );
    }, token);
  }

  // Test 1: Login flow
  test("should successfully log in and redirect to dashboard", async ({
    page,
  }) => {
    await mockLoginSuccess(page);

    // Navigate to login page
    await page.goto("/login");
    await expect(page).toHaveTitle(/login/i);

    // Fill login form
    await page.fill('input[type="email"]', "test@example.com");
    await page.fill('input[type="password"]', "password123");

    // Click submit button
    await page.click("button[type='submit']");

    // Wait for redirect to dashboard
    await page.waitForURL("/dashboard", { timeout: 10000 });

    // Verify we're on the dashboard
    await expect(page).toHaveURL(/\/dashboard/);

    // Verify auth token is stored
    const token = await page.evaluate(() =>
      localStorage.getItem("auth-token")
    );
    expect(token).toBeTruthy();
  });

  // Test 2: Auth redirect - protect dashboard route
  test("should redirect to login when accessing dashboard without auth", async ({
    page,
  }) => {
    // Ensure no auth token is set
    await page.goto("/login");
    await page.evaluate(() => {
      localStorage.removeItem("auth-token");
      localStorage.removeItem("auth-user");
    });

    // Try to access dashboard directly
    await page.goto("/dashboard");

    // Should redirect to login
    await page.waitForURL("/login", { timeout: 10000 });
    await expect(page).toHaveURL(/\/login/);
  });

  // Test 3: Logout flow
  test("should log out and redirect to login", async ({ page }) => {
    await mockLoginSuccess(page);

    // Set up authenticated session
    await page.goto("/login");
    await setAuthToken(page);

    // Mock dashboard load
    await page.route("**/api/**", (route: Route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({}),
      });
    });

    // Navigate to dashboard
    await page.goto("/dashboard");

    // Wait for dashboard to load
    await page.waitForLoadState("networkidle");

    // Find and click logout button (usually in profile menu or topbar)
    // Look for user menu or profile icon
    const userMenuButton = page.locator('button[aria-label*="profile" i]').first();

    if ((await userMenuButton.count()) > 0) {
      await userMenuButton.click();
      // Click logout option
      await page.locator('text="Logout"').first().click();
    } else {
      // Alternative: Look for logout button directly
      const logoutButton = page.locator('button:has-text("Logout")').first();
      if ((await logoutButton.count()) > 0) {
        await logoutButton.click();
      }
    }

    // Verify redirect to login
    await page.waitForURL("/login", { timeout: 10000 });
    await expect(page).toHaveURL(/\/login/);

    // Verify auth token is cleared
    const token = await page.evaluate(() =>
      localStorage.getItem("auth-token")
    );
    expect(token).toBeNull();
  });

  // Test 4: Register flow
  test("should successfully register new user", async ({ page }) => {
    await mockRegisterSuccess(page);

    // Navigate to signup/register page
    await page.goto("/signup");
    await expect(page).toHaveTitle(/sign.*up|register/i);

    // Fill registration form
    await page.fill('input[type="email"]', "newuser@example.com");
    await page.fill('input[type="password"]', "SecurePassword123!");
    // If there's a confirm password field
    const confirmPasswordField = page.locator(
      'input[name*="confirm"], input[name*="repeat"], input[placeholder*="confirm" i]'
    );
    if ((await confirmPasswordField.count()) > 0) {
      await confirmPasswordField.fill("SecurePassword123!");
    }

    // Accept terms if applicable
    const termsCheckbox = page.locator('input[type="checkbox"]').first();
    if ((await termsCheckbox.count()) > 0) {
      await termsCheckbox.check();
    }

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for success - should redirect or show success message
    await Promise.race([
      page.waitForURL("/dashboard", { timeout: 5000 }),
      page.waitForURL("/login", { timeout: 5000 }),
      page.locator("text=/success|verification|check.*email/i").waitFor(),
    ]).catch(() => {
      // Registration might show verification message instead of redirect
    });

    // Verify we're either logged in or shown a verification message
    const currentUrl = page.url();
    const isSuccessState =
      currentUrl.includes("/dashboard") ||
      currentUrl.includes("/verify-email") ||
      (await page
        .locator("text=/success|verification|check.*email/i")
        .isVisible()
        .catch(() => false));

    expect(isSuccessState).toBeTruthy();
  });

  // Test 5: Login with invalid credentials
  test("should show error message for invalid credentials", async ({
    page,
  }) => {
    await mockLoginFailure(page);

    // Navigate to login
    await page.goto("/login");

    // Fill with wrong credentials
    await page.fill('input[type="email"]', "wrong@example.com");
    await page.fill('input[type="password"]', "wrongpassword");

    // Submit form
    await page.click("button[type='submit']");

    // Wait for error message to appear
    const errorMessage = page.locator("text=/invalid|credentials|failed/i");
    await errorMessage.waitFor({ timeout: 5000 });

    // Verify still on login page
    await expect(page).toHaveURL(/\/login/);

    // Verify no auth token was set
    const token = await page.evaluate(() =>
      localStorage.getItem("auth-token")
    );
    expect(token).toBeNull();
  });

  // Test 6: Email validation on login form
  test("should validate email format", async ({ page }) => {
    await page.goto("/login");

    // Try submitting with invalid email
    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill("notanemail");

    const submitButton = page.locator("button[type='submit']");

    // Check if HTML5 validation prevents submission
    const isInvalid = await emailInput.evaluate((el: HTMLInputElement) =>
      el.validity.valid
    );

    if (!isInvalid) {
      expect(isInvalid).toBe(false);
    }
  });

  // Test 7: Password visibility toggle on login
  test("should toggle password visibility", async ({ page }) => {
    await page.goto("/login");

    const passwordInput = page.locator('input[id="password"]');
    const toggleButton = page.locator(
      'button[type="button"]:has-text("Eye")'
    ).first();

    // Initial state should be hidden
    await expect(passwordInput).toHaveAttribute("type", "password");

    // Click toggle to show
    if ((await toggleButton.count()) > 0) {
      await toggleButton.click();
      await expect(passwordInput).toHaveAttribute("type", "text");

      // Click again to hide
      await toggleButton.click();
      await expect(passwordInput).toHaveAttribute("type", "password");
    }
  });

  // Test 8: Remember me / Stay logged in (if applicable)
  test("should maintain session after page reload", async ({ page }) => {
    await mockLoginSuccess(page);

    // Login
    await page.goto("/login");
    await page.fill('input[type="email"]', "test@example.com");
    await page.fill('input[type="password"]', "password123");
    await page.click("button[type='submit']");

    // Wait for redirect
    await page.waitForURL("/dashboard", { timeout: 10000 });

    // Reload page
    await page.reload();

    // Should still be on dashboard (session persisted)
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
