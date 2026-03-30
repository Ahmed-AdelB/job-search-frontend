# Frontend Testing Reference Card

Author: Ahmed Adel Bakr Alderai

## Quick File Locations

```
frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/__tests__/page.test.tsx          ← 8 tests
│   │   └── (dashboard)/
│   │       ├── jobs/__tests__/page.test.tsx           ← 13 tests
│   │       ├── portals/__tests__/page.test.tsx        ← 20 tests
│   │       └── intelligence/
│   │           ├── work-mode/__tests__/page.test.tsx  ← 15 tests
│   │           └── employment-type/__tests__/page.test.tsx ← 18 tests
├── TEST_IMPLEMENTATION_SUMMARY.md
├── TESTING_QUICK_START.md
├── TEST_COVERAGE_DETAILS.md
├── FILES_CREATED.md
└── TESTING_REFERENCE.md (this file)
```

## Running Tests

| Command | Purpose |
|---------|---------|
| `npm test` | Run all tests |
| `npm test -- login` | Run login page tests |
| `npm test -- jobs` | Run jobs page tests |
| `npm test -- portals` | Run portals page tests |
| `npm test -- work-mode` | Run work mode tests |
| `npm test -- employment-type` | Run employment type tests |
| `npm test -- --watch` | Watch mode (re-run on file change) |
| `npm test -- --coverage` | Generate coverage report |
| `npm test -- --grep "pattern"` | Run tests matching pattern |

## Test Anatomy

```typescript
import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/__tests__/setup/render-with-providers";

// 1. Mock dependencies
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

// 2. Define test suite
describe("PageName Integration Tests", () => {
  // 3. Setup
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 4. Write tests
  it("does something", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Component />);

    const element = screen.getByRole("button", { name: /label/i });
    await user.click(element);

    expect(screen.getByText("Result")).toBeInTheDocument();
  });
});
```

## Query Priority (Best to Worst)

```typescript
// 1. ✅ By Role (Most Accessible)
screen.getByRole("button", { name: /submit/i })
screen.getByRole("textbox", { name: /email/i })
screen.getByRole("checkbox")

// 2. ✅ By Label Text
screen.getByLabelText(/password/i)

// 3. ✅ By Placeholder Text
screen.getByPlaceholderText(/search/i)

// 4. ⚠️ By Text
screen.getByText(/welcome/i)
screen.getByText("Exact text")

// 5. ❌ By Test ID (Last Resort)
screen.getByTestId("custom-id")
```

## Common Assertions

```typescript
// Existence
expect(element).toBeInTheDocument();
expect(element).toBeVisible();
expect(element).toBeEnabled();

// Values
expect(input).toHaveValue("text");
expect(input).toHaveAttribute("type", "email");
expect(button).toHaveTextContent(/click/i);

// State
expect(button).toBeDisabled();
expect(element).toHaveClass("active");

// Functions
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledWith(arg);
expect(mockFn).toHaveBeenCalledTimes(1);

// Lists
expect(elements).toHaveLength(5);
expect(list).toContainElement(child);
```

## User Interactions

```typescript
const user = userEvent.setup();

// Text Input
await user.type(input, "text");
await user.clear(input);

// Click
await user.click(button);
await user.dblClick(element);

// Select
await user.selectOptions(select, "value");

// Keyboard
await user.keyboard("{Enter}");
await user.keyboard("{Escape}");

// Hover
await user.hover(element);
await user.unhover(element);

// Tab Navigation
await user.tab();
await user.tab({ shift: true });
```

## Async Operations

```typescript
// Wait for element to appear
await waitFor(() => {
  expect(screen.getByText("Loaded")).toBeInTheDocument();
});

// With custom timeout
await waitFor(() => {
  expect(element).toBeInTheDocument();
}, { timeout: 5000 });

// Wait for function to be called
await waitFor(() => {
  expect(mockFn).toHaveBeenCalled();
});

// Wait for state change
await waitFor(() => {
  expect(screen.getByRole("button")).not.toBeDisabled();
});
```

## Mocking Patterns

### Mock API Calls
```typescript
vi.mock("@/lib/api-client", () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
}));

// In test
const { apiGet } = await import("@/lib/api-client");
apiGet.mockResolvedValueOnce({ items: [1, 2, 3] });
apiGet.mockRejectedValueOnce(new Error("API Error"));
```

### Mock Hooks
```typescript
vi.mock("@/hooks/use-data", () => ({
  useData: () => ({
    data: { items: [] },
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
  useSearchParams: () => new URLSearchParams(),
}));

// In test
expect(mockPush).toHaveBeenCalledWith("/path");
```

## Test Data Factories

```typescript
import {
  createMockJob,
  createMockJobList,
  createMockPortal,
  createMockUser,
  createMockApplication,
  createMockWorkModeStats,
  createMockEmploymentTypeStats,
  resetIdCounter,
} from "@/__tests__/setup/test-data";

// Use in tests
beforeEach(() => {
  resetIdCounter(); // Reset IDs for each test
});

const job = createMockJob({ title: "Custom Title" });
const jobs = createMockJobList(5);
const portal = createMockPortal({ name: "LinkedIn", status: "active" });
```

## Common Test Patterns

### Test Form Submission
```typescript
it("submits form with valid data", async () => {
  const user = userEvent.setup();
  const mockSubmit = vi.fn();

  renderWithProviders(<Form onSubmit={mockSubmit} />);

  await user.type(screen.getByLabelText(/email/i), "test@example.com");
  await user.type(screen.getByLabelText(/password/i), "password123");
  await user.click(screen.getByRole("button", { name: /submit/i }));

  expect(mockSubmit).toHaveBeenCalledWith({
    email: "test@example.com",
    password: "password123",
  });
});
```

### Test Loading State
```typescript
it("shows loading then data", async () => {
  mockApi.mockImplementationOnce(
    () => new Promise(r => setTimeout(() => r({ data: [] }), 100))
  );

  renderWithProviders(<Page />);

  // Check loading
  expect(screen.getByRole("progressbar")).toBeInTheDocument();

  // Wait for data
  await waitFor(() => {
    expect(screen.getByText("No items")).toBeInTheDocument();
  });
});
```

### Test Navigation
```typescript
it("navigates on action", async () => {
  const user = userEvent.setup();
  const mockPush = vi.fn();

  vi.mock("next/navigation", () => ({
    useRouter: () => ({ push: mockPush }),
  }));

  renderWithProviders(<Page />);

  await user.click(screen.getByRole("link", { name: /home/i }));

  expect(mockPush).toHaveBeenCalledWith("/");
});
```

### Test Error Handling
```typescript
it("shows error message on failure", async () => {
  mockApi.mockRejectedValueOnce(new Error("Network error"));

  renderWithProviders(<Page />);

  await waitFor(() => {
    expect(screen.getByText("Network error")).toBeInTheDocument();
  });
});
```

## Debugging

```typescript
// Print entire DOM
screen.debug();

// Print specific element
screen.debug(element);

// Get all elements matching query
const elements = screen.getAllByRole("button");
elements.forEach(el => console.log(el.textContent));

// Check what's on screen
screen.logTestingPlaygroundURL();

// Find element by text (case-insensitive, partial)
const el = screen.getByText(/partial text/i);

// Query (returns null instead of throwing)
const optional = screen.queryByText("May not exist");

// Get by text ending
const el = screen.getByText((content, element) =>
  content.endsWith("specific text")
);
```

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Element not found" | Use correct query, check mock setup, add `waitFor()` |
| "Mock not working" | Move `vi.mock()` to top level, clear mocks in `beforeEach` |
| "Tests timeout" | Increase timeout, check async operations, verify mocks |
| "State not updating" | Use `waitFor()`, check hooks are called correctly |
| "Component not rendering" | Check providers, mocks, props, error in component |
| "Flaky tests" | Avoid hardcoded delays, use `waitFor()`, check cleanup |

## Best Practices Checklist

- [ ] Tests describe behavior, not implementation
- [ ] Each test tests one thing
- [ ] Mocks are set up in `beforeEach()`
- [ ] Using accessibility queries (role first)
- [ ] Using `userEvent` instead of `fireEvent`
- [ ] Proper async handling with `waitFor()`
- [ ] Clear, descriptive test names
- [ ] Tests are deterministic (no flakiness)
- [ ] Mock data matches real API structure
- [ ] No hardcoded timeouts or waits

## Documentation Files

| File | Purpose | When to Use |
|------|---------|------------|
| TESTING_QUICK_START.md | Patterns and setup | Learning how to write tests |
| TEST_IMPLEMENTATION_SUMMARY.md | Architecture overview | Understanding the structure |
| TEST_COVERAGE_DETAILS.md | Detailed breakdown | Reviewing specific tests |
| FILES_CREATED.md | File inventory | Finding what exists |
| TESTING_REFERENCE.md | This quick guide | Quick lookup |

## Keyboard Shortcuts

```typescript
// Key combinations
await user.keyboard("{Control>}a{/Control}");  // Ctrl+A
await user.keyboard("{Shift>}hello{/Shift}");  // HELLO
await user.keyboard("{Meta>}z{/Meta}");        // Cmd+Z (Mac)
await user.keyboard("{Alt>}f4{/Alt}");         // Alt+F4

// Common keys
"{Enter}"
"{Escape}"
"{Tab}"
"{Backspace}"
"{Delete}"
"{ArrowUp}"
"{ArrowDown}"
"{ArrowLeft}"
"{ArrowRight}"
```

## React Query Patterns

```typescript
import { createTestQueryClient, createWrapper } from "@/__tests__/setup/render-with-providers";

// Option 1: Use renderWithProviders
renderWithProviders(<Component />);

// Option 2: Manual setup with wrapper
const wrapper = createWrapper();
const { result } = renderHook(() => useData(), { wrapper });

// Mock mutations
const mockMutation = vi.fn();
vi.mock("@tanstack/react-query", () => ({
  useMutation: () => ({
    mutate: mockMutation,
    isPending: false,
  }),
}));
```

## TypeScript Tips

```typescript
// Type assertions for inputs
const input = screen.getByRole("textbox") as HTMLInputElement;
expect(input.value).toBe("expected");

// Type assertions for elements
const element = screen.getByRole("button") as HTMLButtonElement;
expect(element).toBeDisabled();

// Overrides for partial mocks
mockFunction.mockReturnValueOnce(customValue);
mockFunction.mockRejectedValueOnce(new Error("Custom error"));
mockFunction.mockImplementationOnce(async () => {
  await delay(100);
  return customValue;
});
```

## Performance Tips

- Use `vi.clearAllMocks()` in `beforeEach()` to avoid memory leaks
- Don't use `getByText()` for large texts, use `getByRole()` instead
- Mock `next/image` to avoid loading issues
- Use `waitFor()` with assertions, not just delays
- Avoid testing implementation details (private functions, internal state)

## CI/CD Integration

```bash
# GitHub Actions
npm test -- --coverage --passWithNoTests

# GitLab CI
npm test -- --reporter=junit --coverage

# Jenkins
npm test -- --reporter=json > test-results.json

# Pre-commit hook
npm test -- --bail --findRelatedTests
```

## Resources

- [Vitest Docs](https://vitest.dev/)
- [Testing Library](https://testing-library.com/react)
- [User Event](https://testing-library.com/user-event)
- [Kent C. Dodds Blog](https://kentcdodds.com/blog/)

## Quick Reference Summary

**Total Tests:** 74
**Test Files:** 5
**Documentation:** 4 files (45+ KB)
**Code Coverage:** ~1,810 lines
**Supported Pages:**
- Login (8 tests)
- Jobs (13 tests)
- Portals (20 tests)
- Work Mode Intelligence (15 tests)
- Employment Type Intelligence (18 tests)

---

*Last Updated: 2026-03-21*
*Author: Ahmed Adel Bakr Alderai*
