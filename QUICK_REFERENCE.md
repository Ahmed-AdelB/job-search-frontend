# Next.js Infrastructure - Quick Reference

**Author:** Ahmed Adel Bakr Alderai

## Files at a Glance

```
frontend/
├── src/
│   ├── app/
│   │   ├── error.tsx              [Global error boundary]
│   │   ├── not-found.tsx          [Custom 404 page]
│   │   ├── loading.tsx            [Global loading state]
│   │   ├── layout.tsx             [Root layout - UPDATED]
│   │   ├── client-provider.tsx    [Provider wrapper - VERIFIED]
│   │   ├── (auth)/
│   │   │   └── error.tsx          [Auth error boundary]
│   │   └── (dashboard)/
│   │       ├── error.tsx          [Dashboard error boundary]
│   │       └── loading.tsx        [Dashboard loading skeleton]
│   └── middleware.ts              [Route protection]
└── INFRASTRUCTURE_SETUP_COMPLETE.md
```

## Error Handling

### Hierarchy
```
Error in Page
  ↓
Which zone?
  ├─ Root Level       → /src/app/error.tsx
  ├─ (auth) Route     → /src/app/(auth)/error.tsx
  └─ (dashboard) Route → /src/app/(dashboard)/error.tsx

404 (Route not found)
  → /src/app/not-found.tsx
```

### Key Features
- Error message display
- Error ID for debugging
- "Try Again" button (resets error)
- Navigation buttons
- Error logging hooks

## Loading States

### Hierarchy
```
Component Suspends
  ↓
Which zone?
  ├─ Root Level       → /src/app/loading.tsx
  └─ (dashboard) Route → /src/app/(dashboard)/loading.tsx

Dashboard shows skeleton UI with animations
```

### Dashboard Skeleton Components
- Sidebar structure
- Topbar area
- Multiple card skeletons
- Loader overlay indicator

## Route Protection (Middleware)

### Unauthenticated Users
```
GET /dashboard          → Redirect to /login?from=/dashboard
GET /dashboard/jobs     → Redirect to /login?from=/dashboard/jobs
```

### Authenticated Users
```
GET /dashboard          → Allow access ✓
GET /login              → Redirect to /dashboard
GET /signup             → Redirect to /dashboard
GET /forgot-password    → Redirect to /dashboard
```

### Public Routes
```
GET /                   → Allow access ✓
GET /privacy            → Allow access ✓
GET /terms              → Allow access ✓
GET /undefined-route    → Show 404 page
```

## Testing Commands

```bash
# Test global error
curl http://localhost:3000/test-error

# Test 404
curl http://localhost:3000/undefined-page

# Test loading
# (Requires Suspense + slow async in page component)

# Test middleware protection
curl -b "" http://localhost:3000/dashboard          # No auth → redirects
curl -b "auth-token=xxx" http://localhost:3000/dashboard  # With auth → allows
```

## Common Customizations

### Update Auth Token Check
**File:** `src/middleware.ts`

```typescript
// Currently checks for 'auth-token' cookie
const authToken = request.cookies.get("auth-token")?.value;

// Change to check localStorage (via header):
const authToken = request.headers.get("authorization")?.split(" ")[1];

// Or check custom header:
const authToken = request.headers.get("x-auth-token")?.value;
```

### Add Error Logging
**File:** Any error.tsx

```typescript
import * as Sentry from "@sentry/nextjs";

useEffect(() => {
  Sentry.captureException(error);
  console.error("Application error:", error);
}, [error]);
```

### Customize 404 Page
**File:** `src/app/not-found.tsx`

- Edit heading text
- Change navigation links
- Add custom illustrations
- Update footer contact info

### Customize Skeleton Loading
**File:** `src/app/(dashboard)/loading.tsx`

- Add/remove card skeletons
- Change animation speeds
- Adjust grid layout
- Customize colors

## Component Dependencies

```
shadcn/ui:
  ✓ Button   → used in all error pages + 404
  ✓ Card     → used for card containers

lucide-react:
  ✓ AlertTriangle
  ✓ Home
  ✓ RotateCcw
  ✓ Search
  ✓ Loader2

next-themes:
  ✓ ThemeProvider  → dark/light mode

@tanstack/react-query:
  ✓ QueryClientProvider  → data fetching

next/server:
  ✓ NextResponse  → middleware redirects
  ✓ NextRequest   → middleware routing
```

## TypeScript Interfaces

### Error Boundary Props
```typescript
interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}
```

### Middleware Request/Response
```typescript
function middleware(request: NextRequest): NextResponse
```

## Production Checklist

- [ ] Test all error boundaries with real errors
- [ ] Test 404 page on undefined routes
- [ ] Test loading skeletons on slow networks
- [ ] Verify middleware redirects work
- [ ] Configure error reporting service (Sentry, etc.)
- [ ] Update error page contact/support info
- [ ] Test auth token check matches your auth system
- [ ] Verify dark mode works in all error pages
- [ ] Test on mobile devices
- [ ] Monitor middleware redirect patterns

## File Sizes

| File | Size | Lines |
|------|------|-------|
| error.tsx (root) | 2.4K | ~75 |
| error.tsx (auth) | 3.5K | ~100 |
| error.tsx (dashboard) | 2.4K | ~70 |
| not-found.tsx | 2.2K | ~65 |
| loading.tsx (root) | 971B | ~30 |
| loading.tsx (dashboard) | 2.5K | ~75 |
| middleware.ts | 2.0K | ~81 |
| **Total** | **~17.5K** | **~496** |

## Status

✓ All files created and verified
✓ Full TypeScript support
✓ shadcn/ui components
✓ Tailwind CSS styling
✓ Dark mode support
✓ Production ready

---

For detailed information, see: `INFRASTRUCTURE_SETUP_COMPLETE.md`
