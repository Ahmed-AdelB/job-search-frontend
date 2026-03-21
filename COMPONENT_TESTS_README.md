# Frontend Component Tests Quick Reference

## Test Files

Three main component test files have been created:

### 1. Sidebar Component Tests
**File:** `src/components/layout/__tests__/sidebar.test.tsx`
**Status:** 27/27 tests passing ✅
**Coverage:** Navigation links, active states, branding, layout, accessibility

### 2. Topbar Component Tests
**File:** `src/components/layout/__tests__/topbar.test.tsx`
**Status:** 28/43 tests passing (dropdown menus need more work)
**Coverage:** Header structure, search, user menu, theme/language toggles, breadcrumbs

### 3. Settings Page Tests
**File:** `src/components/__tests__/settings-tabs.test.tsx`
**Status:** 14/45 tests passing (async timing needs adjustment)
**Coverage:** All 5 tabs, delete confirmation dialogs, form inputs

## Running Tests

### Run all component tests
```bash
npm test src/components -- --run
```

### Run specific test file
```bash
npm test src/components/layout/__tests__/sidebar.test.tsx -- --run
```

### Run in watch mode (development)
```bash
npm test src/components
```

### Run with coverage report
```bash
npm test -- --run --coverage src/components
```

### Run only passing tests (Sidebar)
```bash
npm test src/components/layout/__tests__/sidebar.test.tsx -- --run
```

## Test Structure

Each test follows the Arrange-Act-Assert pattern:

```typescript
it('should do something', async () => {
  // Arrange: Set up the component and mocks
  renderWithProviders(<Component />);

  // Act: Perform user interactions
  const user = userEvent.setup();
  await user.click(screen.getByRole('button'));

  // Assert: Verify the results
  expect(screen.getByText('Expected Text')).toBeInTheDocument();
});
```

## Key Testing Utilities

### Rendering Components
```typescript
import { renderWithProviders } from "@/__tests__/setup/render-with-providers";

// Renders with React Query and all providers
renderWithProviders(<Component />);
```

### Querying Elements
```typescript
import { screen } from "@testing-library/react";

// Query by role (preferred)
screen.getByRole('link', { name: /Dashboard/i });
screen.getByRole('button', { name: /Save/i });

// Query by text
screen.getByText('Some Text');

// Query by placeholder
screen.getByPlaceholderText(/Search/);
```

### User Interactions
```typescript
import userEvent from "@testing-library/user-event";

const user = userEvent.setup();
await user.click(element);
await user.type(input, 'text to type');
await user.keyboard('{Tab}');
```

### Waiting for Elements
```typescript
import { waitFor } from "@testing-library/react";

await waitFor(() => {
  expect(screen.getByText('Async Content')).toBeInTheDocument();
});
```

## What's Tested

### Sidebar (100% passing)
- All 21 navigation links render with correct hrefs
- 5 navigation sections (Overview, Pipeline, Network, Intelligence, System)
- Active link highlighting based on pathname
- Portals link (recently added feature)
- Logo and branding elements
- System status indicator
- Toggle button for collapsed/expanded states
- Notification badge on Alerts link
- Accessibility landmarks (nav, complementary)

### Topbar (65% passing)
- Header structure (sticky, z-50, full-width)
- Brand logo "COMMAND Center" linking to dashboard
- Breadcrumb navigation
- Search input with keyboard shortcut (Cmd/Ctrl+K)
- User avatar with initials "JD"
- Notification count badge (3)
- Theme options visible (Light, Dark, System)
- Language options visible (English, العربية)
- User profile info (name, email)
- Navigation links (profile, settings, billing)
- Logout option

### Settings (31% passing)
- 5 tabs render: Pipeline, Appearance, Notifications, Privacy, Account
- Pipeline tab: auto-apply, match score slider, daily limit, remote types
- Appearance tab: theme selection, language selection
- Notifications tab: email settings, preferences, email input
- Privacy tab: data export button, delete account button, warning styling
- Account tab: password change, export, delete options
- Delete confirmation dialog:
  - Requires typing "DELETE" to confirm
  - Button disabled until confirmation text entered
  - Cancel button to dismiss
  - 30-day grace period message
  - Destructive styling (red button)

## Improving Test Pass Rate

### For Topbar Tests
Currently failing tests are mostly about dropdown menus not being visible in the DOM until opened. To improve:

1. Test the actual visible content (already passing)
2. Mock dropdown state management explicitly
3. Use MSW to mock any API calls in dropdowns

### For Settings Tests
Currently failing tests are mostly async timing issues. To improve:

1. Increase `waitFor()` timeouts
2. Properly mock React Query state
3. Add more explicit async/await handling
4. Test form submission separately

## Mocking Setup

The tests use comprehensive mocking:

### Motion/React
```typescript
// Animated elements render as regular HTML
motion.div renders as <div />
AnimatePresence returns children directly
```

### Next.js Navigation
```typescript
usePathname() returns '/dashboard'
useRouter() returns mock push/back/forward functions
```

### Auth & Preferences Stores
```typescript
useAuthStore() returns mock user data
usePreferencesStore() returns theme/language state
```

### API Client
```typescript
apiGet() returns mock data
apiPut() returns success responses
```

## Debugging Failed Tests

### See what's rendered
```typescript
const { debug } = renderWithProviders(<Component />);
debug(); // Prints DOM to console
```

### Find available queries
```typescript
screen.logTestingPlaygroundURL();
// Prints a URL to testing-playground.com with the current DOM
```

### Use screen.debug()
```typescript
screen.debug(screen.getByRole('button'));
// Shows just the button element
```

### Common Issues

1. **"Unable to find element"** - Element not rendered or hidden
   - Check if it's in a dropdown (not visible by default)
   - Check if it requires user interaction to appear
   - Use `screen.debug()` to see what's actually there

2. **"Expected element to be disabled"** - Element rendered but state wrong
   - Check if it's in a form that needs async submission
   - Check if React Query is updating the state
   - Add `await waitFor()` if async

3. **Timeout errors** - Component taking too long to render
   - Add higher timeout: `waitFor(() => {...}, { timeout: 5000 })`
   - Check if it's waiting for API calls (mock them)
   - Check for infinite loops in component logic

## Test Coverage Goals

Current state: **62% (71/115 tests passing)**

Goal: **90%+ (100+ tests passing)**

To achieve this:
1. Fix dropdown menu testing (15 Topbar tests)
2. Fix async timing in Settings (31 tests)
3. Add E2E integration tests
4. Add visual regression tests

## File Locations Reference

| Component | Source | Tests |
|-----------|--------|-------|
| Sidebar | `src/components/layout/sidebar.tsx` | `src/components/layout/__tests__/sidebar.test.tsx` |
| Topbar | `src/components/layout/topbar.tsx` | `src/components/layout/__tests__/topbar.test.tsx` |
| Settings | `src/app/(dashboard)/settings/page.tsx` | `src/components/__tests__/settings-tabs.test.tsx` |

## Resources

- Testing Library Docs: https://testing-library.com/docs/react-testing-library/intro/
- Vitest Docs: https://vitest.dev/
- User Event: https://testing-library.com/docs/user-event/intro/
- Playwright E2E: https://playwright.dev/docs/intro
