# End-to-End Tests

Comprehensive Playwright E2E test suite for JobFlow frontend.

**Author:** Ahmed Adel Bakr Alderai

## Test Files

### 1. **auth.spec.ts**
Authentication and authorization flows.

**Tests:**
- Login flow: email + password → dashboard
- Auth redirect: protected routes redirect to login
- Logout: clears session and returns to login
- Registration: new user signup flow
- Invalid credentials: error handling
- Email validation: HTML5 form validation
- Password visibility: toggle show/hide
- Session persistence: reload maintains auth

**Mocking Strategy:**
- `POST /auth/login` → returns JWT token
- `POST /auth/register` → creates user account
- localStorage: `auth-token` and `auth-user`

### 2. **navigation.spec.ts**
Sidebar navigation, sub-navigation, and page routing.

**Tests:**
- Sidebar navigation: click through all major links
- Intelligence sub-navigation: work-mode, employment-type, visa, etc.
- Back button: browser back and UI back buttons
- Page loading: all pages load without 404s
- Sidebar toggle: collapse/expand on desktop
- Mobile menu: hamburger menu on small screens
- Breadcrumb navigation: navigate via breadcrumbs
- Scroll context: maintain position on navigation
- Active link highlighting: visual indicator
- External links: open in new tab

**Key Routes:**
- `/dashboard` - Main dashboard
- `/dashboard/analytics` - Analytics
- `/dashboard/jobs` - Job listings
- `/dashboard/applications` - Applications
- `/dashboard/intelligence` - Intelligence hub
- `/dashboard/intelligence/work-mode` - Work mode detection
- `/dashboard/intelligence/employment-type` - Employment type
- `/dashboard/intelligence/visa` - Visa sponsorship
- `/dashboard/contacts` - Contacts
- `/dashboard/recruiters` - Recruiters
- `/dashboard/settings` - Settings
- `/dashboard/billing` - Billing

### 3. **intelligence.spec.ts**
Intelligence Hub features: work mode, employment type, visa detection.

**Tests:**
- Work mode detection: detects remote/hybrid/on-site
- Employment type detection: full-time/contract/part-time
- Visa sponsorship detection: sponsorship eligibility
- Statistics display: shows detection statistics
- Confidence scores: displays confidence percentages
- Hub navigation: links to sub-pages
- Error handling: graceful error messages
- Clear results: reset detection
- Batch detection: multiple detections in sequence
- Responsive layout: mobile/tablet/desktop views

**API Endpoints Mocked:**
- `POST /intelligence/work-mode/detect`
- `GET /intelligence/work-mode/stats`
- `POST /intelligence/employment-type/detect`
- `POST /intelligence/visa/detect`

### 4. **portals.spec.ts**
Portal management: view, create, edit, delete portals.

**Tests:**
- View portals: display portal cards
- Portal information: name, status, connection
- Add portal form: open and submit
- Portal actions: activate/deactivate
- Connection status: connected/disconnected badges
- Configuration modal: settings access
- Delete portal: with confirmation
- Search/filter: filter portals
- Categories: group portals by type
- Sync/refresh: refresh portal status
- Responsive: mobile/tablet/desktop
- Pagination: handle multiple portals
- Bulk actions: select multiple portals

**API Endpoints Mocked:**
- `GET /portals` - List portals
- `POST /portals` - Create portal
- `DELETE /portals/:id` - Delete portal

### 5. **responsive.spec.ts**
Responsive design across mobile, tablet, and desktop.

**Tests:**

#### Mobile (375px)
- Hamburger menu visible
- Menu interaction and display
- Touch target sizing (44x44px minimum)
- No horizontal scroll
- Form inputs full width
- Text legible and readable

#### Tablet (768px)
- Two-column layout
- Navigation visibility
- Form inputs properly sized

#### Desktop (1280px)
- Full sidebar visible
- Multi-column card grid
- Sidebar toggle functionality
- Fluid typography scaling

#### All Sizes
- Image responsiveness
- Navigation accessibility
- Modal/dialog fitting
- CSS media queries working
- Viewport meta tag present

## Running Tests

### Run all tests
```bash
npm run test:e2e
```

### Run specific test file
```bash
npm run test:e2e auth.spec.ts
npm run test:e2e navigation.spec.ts
npm run test:e2e intelligence.spec.ts
npm run test:e2e portals.spec.ts
npm run test:e2e responsive.spec.ts
```

### Run tests in UI mode (interactive)
```bash
npm run test:e2e:ui
```

### Run tests with debugging
```bash
npx playwright test --debug
```

### Run tests in headed mode (see browser)
```bash
npx playwright test --headed
```

### Run specific test by name
```bash
npx playwright test -g "should login successfully"
```

## Configuration

`playwright.config.ts`:
- Base URL: `http://localhost:3001`
- Timeout: 30 seconds per test
- Retries: 2 in CI, 0 locally
- Reporters: HTML + screenshot on failure
- Browsers: Chromium, Firefox, WebKit

## Setup

### Prerequisites
1. Frontend running: `npm run dev` (port 3001)
2. Backend API running: (port 8082)
3. Node.js 18+

### Environment
- Tests run against `http://localhost:3001`
- API calls mocked via `page.route()`
- No real backend API needed

## Best Practices

### Authentication
- Each test sets up auth via localStorage
- Or mocks `/auth/login` and submits form
- Token stored in localStorage as `auth-token`

### API Mocking
```typescript
await page.route('**/api/endpoint', (route) => {
  route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ /* data */ })
  });
});
```

### Waiting for Navigation
```typescript
await page.waitForURL('/dashboard');
await page.waitForLoadState('networkidle');
```

### Selectors
- Prefer `data-testid` attributes (add to components)
- Use `aria-label` for accessible selectors
- Fall back to `text=` for visible content
- Avoid brittle class-based selectors

### Assertions
```typescript
await expect(page).toHaveURL('/dashboard');
await expect(element).toBeVisible();
await expect(element).toHaveText(/regex/);
```

## Debugging

### View HTML
```typescript
console.log(await page.content());
```

### Take screenshot
```typescript
await page.screenshot({ path: 'screenshot.png' });
```

### Print console logs
```typescript
page.on('console', (msg) => console.log(msg.text()));
```

### Pause test
```typescript
await page.pause();
```

## CI/CD Integration

Tests run in CI with:
- `--workers 1` (single worker)
- `--retries 2` (retry failed tests)
- `--forbid-only` (fail if `.only` found)
- Artifacts: HTML report + screenshots

## Future Enhancements

- [ ] Add visual regression tests (screenshots)
- [ ] Add accessibility tests (axe)
- [ ] Add performance tests (Lighthouse)
- [ ] Add network throttling tests
- [ ] Add geolocation tests
- [ ] Add device emulation tests (phone/tablet)
- [ ] Add multi-user interaction tests
- [ ] Add real-time feature tests (WebSockets)

## Troubleshooting

### Tests timeout
- Increase timeout: `test.setTimeout(60000)`
- Check if API is running
- Check network: `--proxy-server`

### Selector not found
- Use Playwright Inspector: `npx playwright test --debug`
- Check element visibility
- Wait for element: `await element.waitFor()`

### Flaky tests
- Add explicit waits: `waitForLoadState('networkidle')`
- Avoid hard-coded waits: `page.waitForTimeout()`
- Use stable selectors: `data-testid`

### API mocking not working
- Check route pattern: `**/api/**`
- Verify mock order (most specific first)
- Check request method: GET, POST, etc.

## Related Files

- `playwright.config.ts` - Configuration
- `package.json` - Scripts and dependencies
- `src/` - Application source code

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Web Testing Best Practices](https://playwright.dev/docs/best-practices)
