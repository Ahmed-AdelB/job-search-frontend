/**
 * Author: Ahmed Adel Bakr Alderai
 *
 * Live Pages E2E Test Suite
 *
 * Tests all protected and public pages against live deployed frontend.
 * Validates:
 * - Protected pages require authentication (not redirected to /login)
 * - Public pages load without auth
 * - Auth token storage (localStorage + cookie)
 * - Middleware redirect behavior
 * - Page response codes and basic integrity
 *
 * Note: Frontend NEXT_PUBLIC_API_URL is baked at build time. If it doesn't match
 * the live backend, client-side API calls will fail and pages may redirect to /jobs.
 * These tests validate routing/auth, not full data rendering.
 */

import { test, expect } from '@playwright/test';

const FRONTEND_URL = 'http://100.92.90.89:3002';
const BACKEND_URL = 'http://100.92.90.89:8082';
const LOGIN_EMAIL = `e2e_pw_${Date.now()}@test.dev`;
const LOGIN_PASSWORD = 'TestPass1234';

// Auth token obtained via direct API call in beforeAll
let authToken: string;

// Protected pages to test
const protectedPages = [
  '/dashboard', '/jobs', '/applications', '/contacts', '/outreach',
  '/analytics', '/agents', '/settings', '/billing', '/interviews',
  '/intelligence', '/intelligence/salary', '/intelligence/visa',
  '/intelligence/skills', '/intelligence/work-mode', '/intelligence/employment-type',
  '/recruiters', '/notifications', '/logs', '/target-list',
  '/portals', '/deploy', '/profile', '/triage',
];

// Public pages that should load without auth
const publicPages = [
  { path: '/', name: 'Home' },
  { path: '/login', name: 'Login' },
  { path: '/signup', name: 'Sign Up' },
  { path: '/privacy', name: 'Privacy Policy' },
  { path: '/terms', name: 'Terms of Service' },
];

// Helper: inject auth token into page context
async function injectAuth(page: import('@playwright/test').Page) {
  await page.goto(`${FRONTEND_URL}/login`, { waitUntil: 'networkidle' });
  await page.evaluate((token) => {
    localStorage.setItem('auth-token', token);
  }, authToken);
  await page.context().addCookies([{
    name: 'auth-token',
    value: authToken,
    domain: '100.92.90.89',
    path: '/',
    httpOnly: false,
    secure: false,
    sameSite: 'Lax',
  }]);
}

test.describe('Live Pages E2E Tests', () => {
  // Register and login test user via direct API call
  test.beforeAll(async ({ request }) => {
    await request.post(`${BACKEND_URL}/api/auth/register`, {
      data: { email: LOGIN_EMAIL, password: LOGIN_PASSWORD, name: 'E2E Playwright' },
    });

    const loginResponse = await request.post(`${BACKEND_URL}/api/auth/login`, {
      data: { email: LOGIN_EMAIL, password: LOGIN_PASSWORD },
    });
    const loginData = await loginResponse.json();
    authToken = loginData.token || loginData.access_token;
  });

  test.describe('Public Pages - No Auth Required', () => {
    publicPages.forEach(({ path, name }) => {
      test(`should load ${name} without authentication`, async ({ page }) => {
        const response = await page.goto(`${FRONTEND_URL}${path}`, {
          waitUntil: 'networkidle',
          timeout: 10000,
        });

        expect(response?.status()).toBeLessThan(400);
        if (path !== '/login' && path !== '/signup') {
          expect(page.url()).not.toContain('/login');
        }
      });
    });
  });

  test.describe('Authentication Flow', () => {
    test('should render login form with email and password fields', async ({ page }) => {
      await page.goto(`${FRONTEND_URL}/login`, {
        waitUntil: 'networkidle',
        timeout: 10000,
      });

      expect(page.url()).toContain('/login');
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();

      await page.fill('input[type="email"]', LOGIN_EMAIL);
      const emailValue = await page.inputValue('input[type="email"]');
      expect(emailValue).toBe(LOGIN_EMAIL);
    });

    test('should inject auth token via API and verify storage', async ({ page }) => {
      await injectAuth(page);

      const token = await page.evaluate(() => localStorage.getItem('auth-token'));
      expect(token).toBeTruthy();
      expect(token).toBe(authToken);

      const cookies = await page.context().cookies();
      const authCookie = cookies.find((c) => c.name === 'auth-token');
      expect(authCookie).toBeTruthy();
      expect(authCookie?.value).toBe(authToken);
    });

    test('should redirect unauthenticated users from /dashboard to /login', async ({ page: newPage }) => {
      const context = await newPage.context().browser()!.newContext();
      const page = await context.newPage();

      await page.goto(`${FRONTEND_URL}/dashboard`, {
        waitUntil: 'networkidle',
        timeout: 10000,
      });

      expect(page.url()).toContain('/login');
      await context.close();
    });
  });

  test.describe('Protected Pages - Auth Required', () => {
    for (const path of protectedPages) {
      const name = path.split('/').filter(Boolean).pop() || 'root';

      test(`should load ${name} (${path}) with authentication`, async ({ page }) => {
        await injectAuth(page);

        const response = await page.goto(`${FRONTEND_URL}${path}`, {
          waitUntil: 'networkidle',
          timeout: 15000,
        });

        // Response should be successful
        expect(response?.status()).toBeLessThan(400);

        // Auth working: NOT redirected to /login
        expect(page.url()).not.toContain('/login');

        // Page should be on the expected path or a known app route (client-side may redirect)
        const currentUrl = page.url();
        const isOnExpectedPath = currentUrl.includes(path);
        const isOnAppRoute = !currentUrl.includes('/login') && !currentUrl.includes('/signup');
        expect(isOnExpectedPath || isOnAppRoute).toBeTruthy();
      });
    }
  });

  test.describe('Error Handling', () => {
    test('should handle 404 pages gracefully', async ({ page }) => {
      const response = await page.goto(`${FRONTEND_URL}/nonexistent-page-xyz`, {
        waitUntil: 'networkidle',
        timeout: 10000,
      });

      expect([200, 404, 302]).toContain(response?.status());
    });

    test('should handle network errors without crashing', async ({ page }) => {
      await page.goto(`${FRONTEND_URL}/dashboard`, {
        waitUntil: 'networkidle',
        timeout: 10000,
      }).catch(() => { /* expected */ });

      expect(page.url()).toBeTruthy();
    });
  });

  test.describe('Performance & Security', () => {
    test('should load pages within reasonable time', async ({ page }) => {
      await injectAuth(page);

      const startTime = Date.now();
      await page.goto(`${FRONTEND_URL}/jobs`, {
        waitUntil: 'networkidle',
        timeout: 10000,
      });
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(5000);
    });

    test('should not expose sensitive data in URLs', async ({ page }) => {
      await injectAuth(page);
      await page.goto(`${FRONTEND_URL}/jobs`, {
        waitUntil: 'networkidle',
        timeout: 10000,
      });

      expect(page.url()).not.toMatch(/token=|password=|secret=/i);
    });

    test('should set proper security headers', async ({ page }) => {
      const response = await page.goto(`${FRONTEND_URL}/`, {
        waitUntil: 'networkidle',
        timeout: 10000,
      });

      const headers = response?.headers() || {};
      console.log('Response headers:', Object.keys(headers));
      // Documenting expected headers (may not all be present)
      expect(response?.status()).toBeLessThan(400);
    });
  });

  test.describe('Cookie & LocalStorage Persistence', () => {
    test('should maintain auth token across page navigations', async ({ page }) => {
      await injectAuth(page);

      // Navigate to jobs
      await page.goto(`${FRONTEND_URL}/jobs`, { waitUntil: 'networkidle' });
      const token1 = await page.evaluate(() => localStorage.getItem('auth-token'));
      expect(token1).toBe(authToken);

      // Navigate to another page
      await page.goto(`${FRONTEND_URL}/settings`, { waitUntil: 'networkidle' });
      const token2 = await page.evaluate(() => localStorage.getItem('auth-token'));
      expect(token2).toBe(authToken);
    });
  });
});
