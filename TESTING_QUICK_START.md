# Frontend Testing Quick Start Guide

Author: Ahmed Adel Bakr Alderai

## Test Files Location

All page integration tests are located in `__tests__` directories alongside their respective page components:

```
src/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       ├── page.tsx
│   │       └── __tests__/
│   │           └── page.test.tsx          (8 tests)
│   └── (dashboard)/
│       ├── jobs/
│       │   ├── page.tsx
│       │   └── __tests__/
│       │       └── page.test.tsx          (13 tests)
│       ├── portals/
│       │   ├── page.tsx
│       │   └── __tests__/
│       │       └── page.test.tsx          (20 tests)
│       └── intelligence/
│           ├── work-mode/
│           │   ├── page.tsx
│           │   └── __tests__/
│           │       └── page.test.tsx      (15 tests)
│           └── employment-type/
│               ├── page.tsx
│               └── __tests__/
│                   └── page.test.tsx      (18 tests)
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run specific page tests
```bash
# Login page
npm test -- login

# Jobs page
npm test -- jobs

# Portals page
npm test -- portals

# Work mode intelligence
npm test -- work-mode

# Employment type intelligence
npm test -- employment-type
```

### Run tests in watch mode
```bash
npm test -- --watch
```

### Run with coverage report
```bash
npm test -- --coverage
```

### Run specific test by name
```bash
npm test -- --grep "renders login form"
```

## Test Structure

Each test file follows this structure:

```typescript
import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/__tests__/setup/render-with-providers";
import PageComponent from "../page";

// 1. Mock external dependencies
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

// 2. Setup test suite
describe("PageName Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset any test data counters
  });

  // 3. Write tests
  it("description of what it tests", () => {
    renderWithProviders(<PageComponent />);
    expect(screen.getByText("...")).toBeInTheDocument();
  });
});
```

## Common Test Patterns

### Test Page Renders
```typescript
it("renders page with title", () => {
  renderWithProviders(<Page />);
  expect(screen.getByText("Page Title")).toBeInTheDocument();
});
```

### Test Form Input
```typescript
it("accepts user input", async () => {
  const user = userEvent.setup();
  renderWithProviders(<Page />);

  const input = screen.getByRole("textbox");
  await user.type(input, "test value");

  expect(input).toHaveValue("test value");
});
```

### Test Button Click
```typescript
it("calls handler on button click", async () => {
  const user = userEvent.setup();
  const mockFn = vi.fn();

  renderWithProviders(<Page />);

  const button = screen.getByRole("button", { name: /click me/i });
  await user.click(button);

  expect(mockFn).toHaveBeenCalled();
});
```

### Test Async Loading
```typescript
it("shows data after loading", async () => {
  mockApiCall.mockResolvedValueOnce({ data: [1, 2, 3] });

  renderWithProviders(<Page />);

  await waitFor(() => {
    expect(screen.getByText("1")).toBeInTheDocument();
  });
});
```

### Test Error State
```typescript
it("shows error message", async () => {
  mockApiCall.mockRejectedValueOnce(new Error("API Error"));

  renderWithProviders(<Page />);

  await waitFor(() => {
    expect(screen.getByText("API Error")).toBeInTheDocument();
  });
});
```

### Test Navigation
```typescript
it("navigates on action", async () => {
  const user = userEvent.setup();
  renderWithProviders(<Page />);

  const link = screen.getByRole("link", { name: /go to page/i });
  expect(link).toHaveAttribute("href", "/expected-path");
});
```

## Testing Queries Priority

Use queries in this order (best to worst):

1. **Role queries** - Most accessible
   ```typescript
   screen.getByRole("button", { name: /submit/i })
   screen.getByRole("textbox", { name: /email/i })
   screen.getByRole("link", { name: /home/i })
   ```

2. **Label queries** - For form inputs
   ```typescript
   screen.getByLabelText(/password/i)
   ```

3. **Placeholder queries** - For placeholders
   ```typescript
   screen.getByPlaceholderText(/search/i)
   ```

4. **Text queries** - For text content
   ```typescript
   screen.getByText(/welcome/i)
   screen.getByText("Exact text")
   ```

5. **Test ID queries** - Last resort
   ```typescript
   screen.getByTestId("custom-id")
   ```

## Writing Good Assertions

### Good ✅
```typescript
// Check existence
expect(screen.getByText("Success")).toBeInTheDocument();

// Check attributes
expect(input).toHaveValue("test");
expect(button).toBeDisabled();
expect(link).toHaveAttribute("href", "/path");

// Check calls
expect(mockFn).toHaveBeenCalledWith(expected);
expect(mockFn).toHaveBeenCalledTimes(1);
```

### Bad ❌
```typescript
// Testing implementation details
expect(component.state.isLoading).toBe(false);

// Checking inline styles
expect(element).toHaveStyle("color: red");

// Testing component names
expect(wrapper.find(Logo)).toHaveLength(1);
```

## Debugging Tests

### Print DOM
```typescript
import { screen } from "@testing-library/react";

it("debug test", () => {
  renderWithProviders(<Page />);
  screen.debug(); // Prints the entire DOM
});
```

### Find what's on screen
```typescript
it("find elements", () => {
  renderWithProviders(<Page />);

  // See all buttons
  const buttons = screen.getAllByRole("button");
  buttons.forEach(btn => console.log(btn.textContent));

  // See all text
  const texts = screen.getAllByText(/./);
  texts.forEach(txt => console.log(txt.textContent));
});
```

### Increase timeout for slow tests
```typescript
it("slow test", async () => {
  renderWithProviders(<Page />);

  await waitFor(() => {
    expect(screen.getByText("Loaded")).toBeInTheDocument();
  }, { timeout: 5000 });
});
```

## Mock Patterns

### Mock API Calls
```typescript
vi.mock("@/lib/api-client", () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
}));

// In test
const { apiGet } = await import("@/lib/api-client");
apiGet.mockResolvedValueOnce({ data: [] });
```

### Mock Hooks
```typescript
vi.mock("@/hooks/use-data", () => ({
  useData: () => ({
    data: mockData,
    isLoading: false,
    error: null,
  }),
}));
```

### Mock Router
```typescript
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));
```

## Test Data

Use test data factories from `@/__tests__/setup/test-data.ts`:

```typescript
import {
  createMockJob,
  createMockJobList,
  createMockPortal,
  createMockWorkModeStats,
  createMockEmploymentTypeStats,
  resetIdCounter,
} from "@/__tests__/setup/test-data";

// In beforeEach
beforeEach(() => {
  resetIdCounter(); // Reset IDs for each test
});

// In test
const job = createMockJob({ title: "Custom Title" });
const jobs = createMockJobList(10);
const portal = createMockPortal({ name: "LinkedIn" });
```

## Best Practices

1. **One assertion per test** (or related assertions)
   ```typescript
   // Good
   it("shows loading then data", async () => {
     mockApi.mockResolvedValueOnce({ items: [1, 2] });
     renderWithProviders(<Page />);

     await waitFor(() => {
       expect(screen.getByText("1")).toBeInTheDocument();
       expect(screen.getByText("2")).toBeInTheDocument();
     });
   });
   ```

2. **Use semantic queries**
   ```typescript
   // Good
   screen.getByRole("button", { name: /submit/i });

   // Bad
   screen.getByTestId("submit-btn");
   ```

3. **Test behavior, not implementation**
   ```typescript
   // Good - tests what user sees
   await user.click(screen.getByRole("button", { name: /submit/i }));
   expect(screen.getByText("Success")).toBeInTheDocument();

   // Bad - tests component internals
   expect(component.state.submitted).toBe(true);
   ```

4. **Clean up properly**
   ```typescript
   beforeEach(() => {
     vi.clearAllMocks();
     resetIdCounter();
   });
   ```

5. **Use userEvent over fireEvent**
   ```typescript
   // Good
   const user = userEvent.setup();
   await user.click(button);
   await user.type(input, "text");

   // Bad
   fireEvent.click(button);
   fireEvent.change(input, { target: { value: "text" } });
   ```

## Continuous Integration

Tests run automatically on:
- Pull requests
- Commits to main branch
- Pre-commit hooks (if configured)

View results in:
- GitHub Actions workflow logs
- Coverage reports in PR comments
- Test reports in CI dashboard

## Troubleshooting

### "Element not found"
- Wait for async operations: `await waitFor(() => ...)`
- Use correct query: `getByRole` > `getByLabelText` > `getByText`
- Check mocks are set up correctly

### "Mock not working"
- Ensure `vi.mock()` is at top level
- Clear mocks in `beforeEach`: `vi.clearAllMocks()`
- Check mock implementation matches actual function

### "Tests timeout"
- Increase timeout: `waitFor(..., { timeout: 5000 })`
- Check async operations complete
- Review infinite loops in component

### "Tests flaky"
- Use `waitFor()` instead of delays
- Ensure proper cleanup in `beforeEach`
- Check for race conditions

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [User Event](https://testing-library.com/user-event)

## Next Steps

1. Run the tests: `npm test`
2. Review test output and coverage
3. Add more tests for critical flows
4. Set up CI/CD integration
5. Monitor test health in dashboard
