# Auth Pages - Quick Start Guide

**Author:** Ahmed Adel Bakr Alderai

## Overview

Complete authentication UI with 5 pages + shared layout for Next.js frontend. All pages are fully functional with form validation, error handling, and state management.

## Pages

| Page | Route | Purpose |
|------|-------|---------|
| Layout | `(auth)` | Shared layout for all auth pages |
| Login | `/login` | User sign in |
| Signup | `/signup` | New user registration |
| Forgot Password | `/forgot-password` | Password reset request |
| Reset Password | `/reset-password?token=...` | Set new password |
| Verify Email | `/verify-email?token=...` | Email verification |

## Key Features

✓ Client Components with "use client"
✓ Zod + react-hook-form validation
✓ Zustand auth store integration
✓ Error/success state management
✓ Loading indicators
✓ Toast notifications
✓ Dark mode compatible
✓ Mobile responsive
✓ Accessible forms
✓ TypeScript support

## File Locations

```
src/app/(auth)/
├── layout.tsx              # Shared layout
├── login/page.tsx
├── signup/page.tsx
├── forgot-password/page.tsx
├── reset-password/page.tsx
└── verify-email/page.tsx
```

## Form Flows

### Login Flow
```
User enters email & password
→ Client-side Zod validation
→ Call useAuthStore().login()
→ API POST /auth/login
→ Store token & user data
→ Redirect to /dashboard
```

### Signup Flow
```
User enters email, password, confirm password
→ Client-side Zod validation
→ Call useAuthStore().signup()
→ API POST /auth/register
→ Redirect to /login?signup=success
```

### Forgot Password Flow
```
User enters email
→ Client-side Zod validation
→ Call apiPost('/auth/forgot-password')
→ Show success message
→ User checks email for reset link
```

### Reset Password Flow
```
User visits /reset-password?token=...
→ Token extracted from URL
→ User enters new password & confirm
→ Client-side Zod validation
→ Call apiPost('/auth/reset-password', { token, password })
→ Show success message
→ Auto-redirect to /login after 2 seconds
```

### Email Verification Flow
```
User visits /verify-email?token=...
→ Token extracted from URL
→ Auto-call apiPost('/auth/verify-email', { token })
→ Show loading state with animation
→ On success: show checkmark, auto-redirect to /login
→ On error: show error message and back to login link
```

## API Endpoints Required

The frontend expects these backend endpoints:

```
POST /auth/login
  Body: { email, password }
  Response: { token, user_id, email, name? }

POST /auth/register
  Body: { email, password }
  Response: { token, user_id, email, name? }

POST /auth/forgot-password
  Body: { email }
  Response: { success: true }

POST /auth/reset-password
  Body: { token, password }
  Response: { success: true }

POST /auth/verify-email
  Body: { token }
  Response: { success: true }
```

## State Management

### Auth Store (`useAuthStore`)

```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login(email: string, password: string): Promise<boolean>;
  signup(email: string, password: string): Promise<boolean>;
  logout(): void;
  checkAuth(): boolean;
  clearError(): void;
}
```

### Using Auth Store in Components

```typescript
const { login, isLoading, error, clearError } = useAuthStore();

// Clear errors on mount
useEffect(() => {
  clearError();
}, [clearError]);

// Call login
const success = await login(email, password);
if (success) {
  router.push("/dashboard");
}
```

## Form Validation

All forms use Zod schemas with react-hook-form:

```typescript
const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Min 8 characters"),
});

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema),
});
```

## Error Handling

Multiple error display methods:

1. **Form Field Errors** - Below each input
2. **Alert Component** - Full-width error alert
3. **Toast Notifications** - Temporary success/error toasts

```typescript
// Form field error
{errors.email && (
  <p className="text-xs text-destructive">
    {errors.email.message}
  </p>
)}

// Alert error
{error && (
  <Alert variant="destructive">
    {error}
  </Alert>
)}

// Toast
toast.error("Login failed");
```

## Styling

### Theme Variables

Uses Tailwind v4 with CSS custom properties:

```css
--primary: Primary color
--background: Background color
--foreground: Text color
--destructive: Error/danger color
--muted-foreground: Secondary text color
```

### Layout Classes

```
min-h-screen          # Full height
flex items-center     # Center vertically
justify-center        # Center horizontally
max-w-md             # Max width for form
px-4 py-8            # Responsive padding
```

## Mobile Responsiveness

All pages are mobile-first:

- Form max-width: 448px (md breakpoint)
- Padding: 4px on mobile, 8px on desktop
- Touch-friendly button sizes (h-10)
- Full-width on small screens

## Accessibility

- Semantic HTML with proper labels
- Error messages linked to inputs
- Keyboard navigation support
- Focus states on inputs
- Color contrast compliance
- ARIA labels where needed

## Testing

### Example Tests to Add

```typescript
// Login page
test("shows validation error for invalid email", () => {
  // ...
});

test("calls login on valid form submission", () => {
  // ...
});

// Signup page
test("validates password match", () => {
  // ...
});

test("disables form during submission", () => {
  // ...
});
```

## Common Customizations

### Change Logo/Brand

Edit in `src/app/(auth)/layout.tsx`:

```typescript
<h1 className="text-2xl font-bold">Your Brand</h1>
<p className="text-sm text-muted-foreground">
  Your tagline
</p>
```

### Change Colors

Edit in `src/app/globals.css` CSS custom properties:

```css
--primary: your-color;
--destructive: your-error-color;
```

### Change Toast Position

In any page, modify sonner usage:

```typescript
toast.success("Message", {
  position: "top-right",
});
```

### Add Social Login

Add buttons in login/signup pages:

```typescript
<Button variant="outline" className="w-full">
  Sign in with Google
</Button>
```

## Dependencies

Already installed in `package.json`:

- `react-hook-form` - Form state
- `@hookform/resolvers` - Zod integration
- `zod` - Validation
- `zustand` - State management
- `sonner` - Toast notifications
- `shadcn/ui` - UI components

## Support

For issues or questions about the auth implementation, refer to:

- Frontend code: `/src/app/(auth)/`
- Auth store: `/src/stores/auth-store.ts`
- API client: `/src/lib/api-client.ts`
- UI components: `/src/components/ui/`

## Next Steps

1. Ensure backend API endpoints are implemented
2. Test forms with actual API
3. Customize colors/branding
4. Add additional auth features (2FA, social login, etc.)
5. Set up proper error handling and rate limiting
6. Add analytics/logging for auth events
7. Implement session management/refresh tokens
