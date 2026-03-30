# E2E Testing Guide - JobFlow Frontend

Comprehensive guide for writing and running Playwright E2E tests for the JobFlow frontend application.

**Author:** Ahmed Adel Bakr Alderai

## Overview

The E2E test suite includes 5 test files with 50+ test cases covering:

1. **Authentication** - Login, register, logout, session management
2. **Navigation** - Sidebar, sub-navigation, routing
3. **Intelligence Hub** - Work mode, employment type, visa detection
4. **Portals** - Create, read, update, delete portal operations
5. **Responsive Design** - Mobile, tablet, desktop layouts

## Quick Start

### 1. Install Dependencies
```bash
cd /Users/aadel/projects/17jobsearch/frontend
npm install
```

### 2. Start the Application
```bash
npm run dev
# Frontend will run on http://localhost:3001
# Ensure backend API is running on http://localhost:8082
```

### 3. Run Tests
```bash
# Run all E2E tests
npm run test:e2e

# Run specific test file
npm run test:e2e -- auth.spec.ts

# Run with UI (interactive mode)
npm run test:e2e:ui

# Run in debug mode
npx playwright test --debug

# Run with headed browser (see what's happening)
npx playwright test --headed
```

## Test Files Structure

### File: `e2e/auth.spec.ts` (9 tests)
**Purpose:** Authentication flows and security

```typescript
test('should successfully log in and redirect to dashboard', async ({ page }) => {
  // 1. Navigate to /login
  // 2. Fill email and password
  // 3. Submit form
  // 4. Verify redirect to /dashboard
  // 5. Verify auth token in localStorage
});
```

**Key Tests:**
- ✅ Successful login flow
- ✅ Protected route redirection
- ✅ Logout and session cleanup
- ✅ User registration
- ✅ Invalid credentials handling
- ✅ Form validation
- ✅ Password visibility toggle
- ✅ Session persistence across page reload
- ✅ Login form error messages

**API Mocks:**
```typescript
await page.route('**/auth/login', (route) => {
  route.fulfill({
    status: 200,
    body: JSON.stringify({
      token: 'test-jwt-token-12345',
      user_id: 'u-test-001',
      email: 'test@example.com',
      name: 'Test User'
    })
  });
});
```

### File: `e2e/navigation.spec.ts` (10 tests)
**Purpose:** Navigation flows and page routing

```typescript
test('should navigate through all sidebar links without 404s', async ({ page }) => {
  const navItems = [
    '/dashboard',
    '/dashboard/analytics',
    '/dashboard/jobs',
    // ... more routes
  ];

  for (const href of navItems) {
    const link = page.locator(`a[href="${href}"]`).first();
    await link.click();
    await expect(page).toHaveURL(href);
  }
});
```

**Key Tests:**
- ✅ Sidebar navigation (all major links)
- ✅ Intelligence sub-navigation
- ✅ Back button functionality
- ✅ Page loading without errors
- ✅ Sidebar collapse/expand
- ✅ Mobile menu
- ✅ Breadcrumb navigation
- ✅ Scroll position context
- ✅ Active link highlighting
- ✅ External link handling

**Routes Tested:**
- `/dashboard` - Main dashboard
- `/dashboard/analytics` - Analytics
- `/dashboard/jobs` - Jobs
- `/dashboard/applications` - Applications
- `/dashboard/contacts` - Contacts
- `/dashboard/recruiters` - Recruiters
- `/dashboard/intelligence` - Intelligence hub
- `/dashboard/intelligence/work-mode` - Work mode
- `/dashboard/intelligence/employment-type` - Employment type
- `/dashboard/intelligence/visa` - Visa detection
- `/dashboard/intelligence/skills` - Skills
- `/dashboard/intelligence/salary` - Salary
- `/dashboard/settings` - Settings
- `/dashboard/billing` - Billing

### File: `e2e/intelligence.spec.ts` (10 tests)
**Purpose:** Intelligence Hub features and detection

```typescript
test('should detect work mode from job title', async ({ page }) => {
  await page.goto('/dashboard/intelligence/work-mode');

  // Fill title input
  const titleInput = page.locator('input[placeholder*="Job Title"]').first();
  await titleInput.fill('Senior Remote SWE');

  // Click detect button
  const detectButton = page.locator('button:has-text("Detect")').first();
  await detectButton.click();

  // Verify result badge appears with work mode
  const badge = page.locator('[class*="badge"]').first();
  await expect(badge).toBeVisible();

  const text = await badge.textContent();
  expect(text).toMatch(/remote|hybrid|on-site/i);
});
```

**Key Tests:**
- ✅ Work mode detection (remote/hybrid/on-site)
- ✅ Employment type detection (full-time/contract/part-time)
- ✅ Visa sponsorship detection
- ✅ Statistics display
- ✅ Confidence score display
- ✅ Hub navigation
- ✅ Error handling
- ✅ Clear results
- ✅ Batch detection
- ✅ Responsive layout

**API Endpoints Mocked:**
```typescript
// Work mode detection
POST /intelligence/work-mode/detect
GET /intelligence/work-mode/stats

// Employment type
POST /intelligence/employment-type/detect

// Visa sponsorship
POST /intelligence/visa/detect
```

### File: `e2e/portals.spec.ts` (15 tests)
**Purpose:** Portal management (CRUD operations)

```typescript
test('should display portal cards', async ({ page }) => {
  await page.goto('/dashboard/portals');

  // Verify portal list loads
  const portalCards = page.locator('[class*="card"]');
  await expect(portalCards.first()).toBeVisible();

  // Verify portal info displayed
  const linkedinText = page.locator('text=/linkedin/i').first();
  await expect(linkedinText).toBeVisible();
});

test('should submit add portal form', async ({ page }) => {
  // Click add button
  const addButton = page.locator('button:has-text("Add")').first();
  await addButton.click();

  // Fill form
  const form = page.locator('form').first();
  await form.locator('input[id*="name"]').fill('New Portal');
  await form.locator('input[type="url"]').fill('https://newportal.com');

  // Submit
  await form.locator('button[type="submit"]').click();
});
```

**Key Tests:**
- ✅ View portal list
- ✅ Portal card display
- ✅ Open add portal form
- ✅ Form fields validation
- ✅ Submit new portal
- ✅ Toggle portal status
- ✅ Connection status display
- ✅ Portal configuration
- ✅ Delete portal with confirmation
- ✅ Search/filter portals
- ✅ Portal categories
- ✅ Sync/refresh status
- ✅ Responsive layout
- ✅ Pagination
- ✅ Bulk actions

**API Endpoints Mocked:**
```typescript
GET /portals          // List portals
POST /portals         // Create portal
DELETE /portals/:id   // Delete portal
```

### File: `e2e/responsive.spec.ts` (16 tests)
**Purpose:** Responsive design across all viewports

```typescript
test('should show hamburger menu on mobile (375px)', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });

  // Hamburger should be visible
  const hamburger = page.locator('button[aria-label*="menu"]').first();
  await expect(hamburger).toBeVisible();

  // Desktop sidebar should be hidden
  const sidebar = page.locator('aside, nav[class*="sidebar"]');
  const isHidden = await sidebar.evaluate(el =>
    window.getComputedStyle(el).display === 'none'
  );
  expect(isHidden).toBeTruthy();
});

test('should display full sidebar on desktop (1280px)', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });

  const sidebar = page.locator('aside, nav[class*="sidebar"]').first();
  await expect(sidebar).toBeVisible();

  // Sidebar should be expanded (not collapsed)
  const width = await sidebar.evaluate(el =>
    window.getComputedStyle(el).width
  );
  expect(parseInt(width)).toBeGreaterThan(100);
});
```

**Viewport Sizes Tested:**
- **Mobile:** 375x667 (iPhone SE)
- **Tablet:** 768x1024 (iPad)
- **Desktop:** 1280x800 (Laptop)

**Key Tests:**
- ✅ Mobile hamburger menu
- ✅ Mobile touch interactions
- ✅ No horizontal scroll
- ✅ Form inputs full width
- ✅ Tablet two-column layout
- ✅ Desktop full sidebar
- ✅ Multi-column cards
- ✅ Responsive typography
- ✅ Image scaling
- ✅ Navigation accessibility
- ✅ Modal responsiveness
- ✅ CSS media queries
- ✅ Viewport meta tag
- ✅ Touch target sizing (44x44px)
- ✅ Sidebar toggle

## Common Patterns

### Setting Up Authentication

**Pattern 1: Via localStorage**
```typescript
async function setupAuthenticatedSession(page) {
  await page.evaluate(() => {
    localStorage.setItem('auth-token', 'test-jwt-token-12345');
    localStorage.setItem('auth-user', JSON.stringify({
      user_id: 'u-test-001',
      email: 'test@example.com',
      name: 'Test User'
    }));
  });
}

test('should load dashboard', async ({ page }) => {
  await setupAuthenticatedSession(page);
  await page.goto('/dashboard');
  // Page loads without redirect to /login
});
```

**Pattern 2: Via Form Submission**
```typescript
test('should login via form', async ({ page }) => {
  await page.route('**/auth/login', route => {
    route.fulfill({
      status: 200,
      body: JSON.stringify({
        token: 'test-jwt-token',
        user_id: 'u1',
        email: 'test@example.com',
        name: 'Test User'
      })
    });
  });

  await page.goto('/login');
  await page.fill('input[type="email"]', 'test@example.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForURL('/dashboard');
});
```

### Mocking APIs

**Pattern: Route-based Mocking**
```typescript
// Mock GET request
await page.route('**/api/data', (route) => {
  route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ data: [] })
  });
});

// Mock POST request
await page.route('**/api/create', (route) => {
  if (route.request().method() === 'POST') {
    const data = route.request().postDataJSON?.();
    route.fulfill({
      status: 201,
      body: JSON.stringify({ id: 1, ...data })
    });
  }
});

// Conditional mocking
await page.route('**/api/users/*', (route) => {
  const url = route.request().url();
  const userId = url.split('/').pop();

  if (userId === '404') {
    route.fulfill({ status: 404, body: 'Not found' });
  } else {
    route.fulfill({
      status: 200,
      body: JSON.stringify({ id: userId, name: 'User' })
    });
  }
});
```

### Waiting Strategies

```typescript
// Wait for navigation
await page.waitForURL('/dashboard');
await page.waitForURL(/\/dashboard\/intelligence/);

// Wait for network idle
await page.waitForLoadState('networkidle');

// Wait for specific element
await page.locator('[data-testid="badge"]').waitFor();

// Wait with custom condition
await page.waitForFunction(() => {
  return document.querySelectorAll('[class*="card"]').length > 0;
});
```

### Selecting Elements

```typescript
// By data-testid (recommended)
page.locator('[data-testid="submit-button"]')

// By aria-label (accessible)
page.locator('button[aria-label="Close"]')

// By visible text
page.locator('text="Submit"')
page.locator('text=/submit/i')

// By role
page.locator('button:has-text("Login")')
page.locator('input[type="email"]')

// By class (less reliable)
page.locator('[class*="card"]')
```

### Assertions

```typescript
// Navigation
await expect(page).toHaveURL('/dashboard');
await expect(page).toHaveTitle(/Dashboard/);

// Visibility
await expect(element).toBeVisible();
await expect(element).toBeHidden();

// Text content
await expect(element).toContainText('Login');
await expect(element).toHaveText(/Submit|Cancel/);

// Attributes
await expect(element).toHaveAttribute('disabled');
await expect(input).toHaveValue('test@example.com');

// Count
expect(await page.locator('button').count()).toBeGreaterThan(0);

// State
await expect(input).toBeEnabled();
await expect(input).toBeDisabled();
```

## Debugging

### View Page Content
```typescript
test('debug test', async ({ page }) => {
  await page.goto('/dashboard');
  console.log(await page.content()); // Print HTML
});
```

### Take Screenshots
```typescript
await page.screenshot({ path: 'screenshot.png' });
```

### Pause Execution
```typescript
await page.pause(); // Opens inspector
```

### Print Console Messages
```typescript
page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
```

### Network Inspector
```typescript
page.on('response', (response) => {
  console.log(`${response.status()} ${response.url()}`);
});
```

### Enable Debug Logs
```bash
PWDEBUG=1 npx playwright test auth.spec.ts
```

## CI/CD Configuration

The tests are configured for CI via `playwright.config.ts`:

```typescript
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: 30000,
  use: {
    baseURL: "http://localhost:3001",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "npm run dev -- -p 3001",
    port: 3001,
    reuseExistingServer: !process.env.CI,
  },
});
```

**CI Settings:**
- Single worker (no parallelization)
- 2 retries for flaky tests
- Screenshots on failure
- Trace recording on first retry

## Best Practices

### 1. Use Stable Selectors
```typescript
// GOOD: data-testid (add to component)
page.locator('[data-testid="login-button"]')

// GOOD: aria-label (accessible)
page.locator('button[aria-label="Close menu"]')

// AVOID: class-based (brittle)
page.locator('[class="btn btn-primary md"]')
```

### 2. Wait Properly
```typescript
// GOOD: Wait for element
await element.waitFor({ timeout: 5000 });

// GOOD: Wait for network idle
await page.waitForLoadState('networkidle');

// AVOID: Hard-coded delays
await page.waitForTimeout(2000); // Don't do this

// AVOID: Fixed delays
await new Promise(r => setTimeout(r, 1000));
```

### 3. Avoid Test Interdependencies
```typescript
// GOOD: Each test is independent
test('test 1', async ({ page }) => {
  await setupAuth(page);
  // Test code
});

test('test 2', async ({ page }) => {
  await setupAuth(page); // Setup again
  // Test code
});

// AVOID: Tests that depend on previous tests
test.only('test 1', async ({ page }) => { /* ... */ });
test('test 2', async ({ page }) => { /* depends on test 1 */ });
```

### 4. Mock External Dependencies
```typescript
// Mock all API calls to avoid flakiness
await page.route('**/api/**', (route) => {
  route.fulfill({
    status: 200,
    body: JSON.stringify(mockData)
  });
});
```

### 5. Keep Tests Focused
```typescript
// GOOD: Single responsibility
test('should display login form fields', async ({ page }) => {
  await page.goto('/login');
  await expect(page.locator('input[type="email"]')).toBeVisible();
  await expect(page.locator('input[type="password"]')).toBeVisible();
});

// AVOID: Testing too much in one test
test('should login and create user and delete user', async ({ page }) => {
  // Too many steps - hard to debug when it fails
});
```

## Troubleshooting

### Tests Timeout
**Cause:** Slow or unresponsive page
**Solution:**
```typescript
test.setTimeout(60000); // Increase timeout
await page.waitForLoadState('networkidle'); // Wait properly
```

### Selector Not Found
**Cause:** Element hasn't loaded or is hidden
**Solution:**
```typescript
// Use debugger
npx playwright test --debug

// Or wait for element
await page.locator('[data-testid="element"]').waitFor();
```

### Flaky Tests
**Cause:** Timing issues, random failures
**Solution:**
```typescript
// Use explicit waits
await page.waitForURL('/expected-url');
await element.waitFor({ state: 'visible' });

// Avoid timeouts
await Promise.race([
  page.waitForURL('/path', { timeout: 5000 }),
  page.locator('text=error').waitFor({ timeout: 5000 })
]);
```

### API Not Mocking
**Cause:** Route pattern doesn't match
**Solution:**
```typescript
// Check URL pattern
console.log('Request URL:', request.url());

// More specific routes first
await page.route('**/api/users/123', ...); // Specific
await page.route('**/api/users/**', ...);  // General
await page.route('**/api/**', ...);        // Catch-all

// Verify method
if (route.request().method() === 'POST') {
  route.fulfill({ status: 201 });
}
```

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging](https://playwright.dev/docs/debug)
- [CI/CD Integration](https://playwright.dev/docs/ci)
- [Visual Comparisons](https://playwright.dev/docs/test-snapshots)

## Summary

This test suite provides comprehensive coverage of the JobFlow frontend:

- **50+ Tests** across 5 test files
- **Auth flows:** Login, register, logout, session management
- **Navigation:** All major routes and sidebar interactions
- **Features:** Intelligence hub detection, portal management
- **Responsive:** Mobile, tablet, desktop layouts
- **Quality:** Error handling, accessibility, performance

All tests use Playwright best practices with proper waiting, mocking, and assertions.
