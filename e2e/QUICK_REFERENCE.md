# E2E Tests - Quick Reference

**Author:** Ahmed Adel Bakr Alderai

## One-Liner Commands

```bash
# Run all E2E tests
npm run test:e2e

# Run specific test file
npm run test:e2e -- auth.spec.ts

# Run with UI (see it in browser)
npm run test:e2e:ui

# Debug mode (opens inspector)
npx playwright test --debug

# See with browser window
npx playwright test --headed

# Run single test by name
npx playwright test -g "should login"

# View HTML report
npx playwright show-report
```

## Test Files at a Glance

| File | Tests | Features |
|------|-------|----------|
| `auth.spec.ts` | 8 | Login, register, logout, session |
| `navigation.spec.ts` | 10 | Sidebar, routing, back button |
| `intelligence.spec.ts` | 10 | Detection (work mode, employment, visa) |
| `portals.spec.ts` | 15 | CRUD portals, search, categories |
| `responsive.spec.ts` | 16 | Mobile, tablet, desktop layouts |
| **TOTAL** | **59** | **All critical flows** |

## Test Counts by Feature

```
Authentication (8 tests)
├── Login flow
├── Registration
├── Logout
├── Session persistence
├── Redirect protection
├── Form validation
├── Error handling
└── Password toggle

Navigation (10 tests)
├── Sidebar links (10+ routes)
├── Sub-navigation
├── Back button
├── Mobile menu
├── Breadcrumbs
├── Page loading
├── Active links
└── External links

Intelligence (10 tests)
├── Work mode detection
├── Employment type
├── Visa detection
├── Statistics
├── Confidence scores
├── Error handling
├── Result clearing
└── Batch processing

Portals (15 tests)
├── List view
├── Create portal
├── Edit settings
├── Delete with confirmation
├── Activate/deactivate
├── Search/filter
├── Categories
├── Pagination
└── Bulk actions

Responsive (16 tests)
├── Mobile (375px)
│  ├── Hamburger menu
│  ├── Touch targets
│  └── Form width
├── Tablet (768px)
│  └── Two-column layout
├── Desktop (1280px)
│  ├── Full sidebar
│  └── Grid layout
└── All sizes
   ├── Images
   ├── Modals
   ├── Typography
   └── Meta tags
```

## Common Setup Code

### Authenticate User
```typescript
await page.evaluate(() => {
  localStorage.setItem('auth-token', 'test-jwt-token-12345');
  localStorage.setItem('auth-user', JSON.stringify({
    user_id: 'u-test-001',
    email: 'test@example.com',
    name: 'Test User'
  }));
});
```

### Mock Login API
```typescript
await page.route('**/auth/login', (route) => {
  route.fulfill({
    status: 200,
    body: JSON.stringify({
      token: 'test-jwt-token-12345',
      user_id: 'u1',
      email: 'test@example.com',
      name: 'Test User'
    })
  });
});
```

### Mock All APIs
```typescript
await page.route('**/api/**', (route) => {
  route.fulfill({
    status: 200,
    body: JSON.stringify({})
  });
});
```

## Common Selectors

```typescript
// By test ID (BEST)
page.locator('[data-testid="button"]')

// By aria-label (GOOD)
page.locator('button[aria-label="Close"]')

// By text (OK)
page.locator('text="Login"')
page.locator('text=/login/i')

// By role
page.locator('button')
page.locator('input[type="email"]')
```

## Common Assertions

```typescript
// Navigation
await expect(page).toHaveURL('/dashboard');
await expect(page).toHaveTitle(/Dashboard/);

// Visibility
await expect(element).toBeVisible();
await expect(element).toBeHidden();

// Text
await expect(element).toHaveText('Login');
await expect(element).toContainText('Login');

// Attributes
await expect(element).toHaveAttribute('disabled');
await expect(input).toHaveValue('test@example.com');

// Count
expect(await locator.count()).toBeGreaterThan(0);
```

## Common Waits

```typescript
// Wait for URL
await page.waitForURL('/dashboard');

// Wait for network idle
await page.waitForLoadState('networkidle');

// Wait for element
await element.waitFor({ timeout: 5000 });

// Wait for function
await page.waitForFunction(() => {
  return document.querySelectorAll('.card').length > 0;
});
```

## Debugging Shortcuts

```typescript
// Take screenshot
await page.screenshot({ path: 'debug.png' });

// Print HTML
console.log(await page.content());

// Pause execution (opens inspector)
await page.pause();

// Print console logs
page.on('console', msg => console.log(msg.text()));

// Network logs
page.on('response', r => console.log(`${r.status()} ${r.url()}`));
```

## Viewport Sizes

```typescript
// Mobile
await page.setViewportSize({ width: 375, height: 667 });

// Tablet
await page.setViewportSize({ width: 768, height: 1024 });

// Desktop
await page.setViewportSize({ width: 1280, height: 800 });

// Reset
await page.setViewportSize({ width: 1280, height: 720 });
```

## Key Routes

```
/login              - Login page
/signup             - Registration page
/dashboard          - Main dashboard
/dashboard/jobs     - Jobs listing
/dashboard/applications  - Applications
/dashboard/contacts      - Contacts
/dashboard/recruiters    - Recruiters
/dashboard/intelligence  - Intelligence hub
/dashboard/intelligence/work-mode
/dashboard/intelligence/employment-type
/dashboard/intelligence/visa
/dashboard/intelligence/skills
/dashboard/intelligence/salary
/dashboard/analytics     - Analytics
/dashboard/portals       - Portals
/dashboard/settings      - Settings
/dashboard/billing       - Billing
```

## Configuration

**Browser:** Chrome, Firefox, Safari
**Timeout:** 30 seconds per test
**Retries:** 0 local, 2 in CI
**Base URL:** http://localhost:3001

## Test Isolation

- Each test is independent
- Auth setup in `beforeEach` or test
- APIs mocked per test
- No state sharing between tests

## Best Practices Checklist

- [x] Use stable selectors (data-testid)
- [x] Use explicit waits (waitFor*)
- [x] Mock all APIs
- [x] Test error scenarios
- [x] Keep tests focused
- [x] No hard-coded delays
- [x] No test interdependencies
- [x] Test accessibility (aria-label)
- [x] Test responsive design
- [x] Clear test names

## Files & Docs

| File | Purpose |
|------|---------|
| `auth.spec.ts` | Auth tests |
| `navigation.spec.ts` | Navigation tests |
| `intelligence.spec.ts` | Intelligence Hub tests |
| `portals.spec.ts` | Portal tests |
| `responsive.spec.ts` | Responsive tests |
| `README.md` | Test descriptions |
| `QUICK_REFERENCE.md` | This file |

## Playwright Docs

- [Main Docs](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging](https://playwright.dev/docs/debug)
- [Selectors](https://playwright.dev/docs/locators)
- [Assertions](https://playwright.dev/docs/test-assertions)

---

**Quick Start:**
```bash
npm run dev          # Terminal 1: Start frontend (port 3001)
npm run test:e2e     # Terminal 2: Run tests
npm run test:e2e:ui  # Or use interactive UI mode
```
