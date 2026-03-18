# Profile & Billing Pages - Implementation Guide

Author: Ahmed Adel Bakr Alderai

## Overview

Complete implementation of Profile and Billing pages for the Next.js 16 frontend with React 19, TypeScript, Tailwind CSS, shadcn/ui, React Query, and React Hook Form.

## Files Created

### 1. Custom Hooks

#### `src/hooks/use-profile.ts` (3.1 KB)
Hooks for managing user profile and resume operations:

```typescript
// Fetch current user profile
useProfile()

// Update profile information
useUpdateProfile()

// Upload CV (multipart/form-data)
useUploadCV()

// Fetch list of resumes
useResumes()

// Delete resume by ID
useDeleteResume()

// Set resume as primary
useSetPrimaryResume()
```

**Usage:**
```typescript
const { data: profile, isLoading } = useProfile()
const updateMutation = useUpdateProfile()

await updateMutation.mutateAsync({
  name: "John Doe",
  phone: "+1...",
  location: "San Francisco, CA"
})
```

#### `src/hooks/use-billing.ts` (2.3 KB)
Hooks for billing and subscription management:

```typescript
// Fetch available plans
usePlans()

// Get current subscription
useSubscription()

// Create Stripe checkout session
useCreateCheckout()

// Cancel current subscription
useCancelSubscription()

// Fetch invoice history
useInvoices()

// Open Stripe customer portal
usePortal()
```

**Usage:**
```typescript
const { data: plans } = usePlans()
const createCheckout = useCreateCheckout()

createCheckout.mutate("plan_123") // Redirects to Stripe
```

### 2. Components

#### `src/components/forms/file-upload.tsx` (7.2 KB)
Reusable file upload component with drag-and-drop support.

**Features:**
- Drag-and-drop zone with visual feedback
- File type validation (PDF, DOCX only)
- File size validation (configurable, default 10MB)
- Progress bar during upload
- File preview with metadata (name, size, type)
- Remove button to clear selection
- Error messages for validation failures
- Dark mode support

**Props:**
```typescript
interface FileUploadProps {
  onFileSelect: (file: File) => void
  isLoading?: boolean
  acceptedTypes?: string[]
  maxSizeMB?: number
  className?: string
}
```

**Usage:**
```tsx
<FileUpload
  onFileSelect={(file) => uploadMutation.mutate(file)}
  isLoading={uploadMutation.isPending}
  maxSizeMB={10}
/>
```

### 3. Pages

#### `src/app/(dashboard)/profile/page.tsx` (16 KB)
Complete profile management page with multiple sections:

**Sections:**
1. **Personal Information**
   - Editable form with React Hook Form + Zod validation
   - Edit/Save mode toggle
   - Fields: Name (required), Email (read-only), Phone, Location, Bio
   - Loading states and error handling

2. **CV Manager**
   - Upload new CV with file-upload component
   - List of existing resumes with metadata
   - Set primary resume button
   - Delete resume with confirmation dialog
   - Empty state when no CVs uploaded

3. **Parsed Profile Data** (read-only)
   - Skills (from resume parsing)
   - Experience (job history)
   - Education (degrees and institutions)

4. **Onboarding Progress**
   - Step completion tracker
   - 4 steps: Email Verified, Profile Completed, Resume Uploaded, Preferences Set
   - Visual progress indicators

**Features:**
- Form validation with Zod schema
- React Hook Form for state management
- TanStack React Query for data fetching
- Loading skeletons for async operations
- Alert dialogs for confirmations
- Responsive design
- Dark mode support

#### `src/app/(dashboard)/billing/page.tsx` (18 KB)
Complete billing and subscription management page.

**Sections:**
1. **Current Plan Card**
   - Plan name and tier
   - Status badge (active, cancelled, past_due)
   - Included features list
   - Usage statistics (applications left, days until renewal, renewal date)
   - Cancel subscription button
   - Update payment method button

2. **Plan Comparison Grid**
   - 4 plan cards: Free, Starter, Professional, Enterprise
   - Monthly/annual billing toggle
   - Price calculation based on period
   - Feature list (first 4 features + count of remaining)
   - "Current" badge on active plan
   - Upgrade button (disabled for current plan)
   - Enterprise plan contact CTA

3. **Payment Method**
   - Masked card display
   - Card brand and last 4 digits
   - Expiration date
   - Update button (opens Stripe portal)

4. **Invoice History**
   - Table with date, amount, status, download link
   - Status badges (draft, open, paid, void, uncollectible)
   - Download button for PDF
   - Empty state when no invoices

5. **Cancel Subscription Dialog**
   - Confirmation with warning
   - Shows renewal date
   - Explains grace period behavior

**Features:**
- TanStack React Query for data management
- Stripe integration (checkout and portal)
- Billing period toggle (monthly/annual)
- Responsive table layout
- Alert dialogs for destructive actions
- Toast notifications
- Loading skeletons
- Dark mode support

### 4. Type Definitions

Updated `src/types/api.ts` with new interfaces:

```typescript
// Profile types
interface Profile { ... }
interface UpdateProfileRequest { ... }
interface Resume { ... }
interface ResumesResponse { ... }
interface ParsedProfileData { ... }
interface OnboardingStatus { ... }

// Billing types
interface BillingPlan { ... }
interface Subscription { ... }
interface Invoice { ... }
interface CheckoutSession { ... }
interface PortalSession { ... }
```

### 5. Exports

Updated `src/hooks/index.ts` to export all new hooks for convenient imports.

## API Endpoints Expected

### Profile Endpoints
```
GET    /api/profiles/me                      → Profile
PUT    /api/profiles/me                      → Update Profile
POST   /api/onboarding/cv                    → Upload CV (multipart/form-data)
GET    /api/profiles/resumes                 → List Resumes
PUT    /api/profiles/resumes/{id}/primary    → Set Primary Resume
DELETE /api/profiles/resumes/{id}            → Delete Resume
```

### Billing Endpoints
```
GET    /api/billing/plans                    → List Plans
GET    /api/billing/subscription             → Get Subscription
POST   /api/checkout/session                 → Create Checkout (plan_id)
POST   /api/billing/cancel                   → Cancel Subscription
GET    /api/billing/invoices                 → List Invoices
POST   /api/billing/portal                   → Stripe Portal Session
```

## Request/Response Examples

### Upload CV
**Request:**
```
POST /api/onboarding/cv
Content-Type: multipart/form-data

file: <File>
```

**Response:**
```json
{
  "id": "resume_123",
  "filename": "resume.pdf",
  "file_size": 245632,
  "file_type": "application/pdf",
  "uploaded_at": "2024-03-19T10:30:00Z",
  "is_primary": true
}
```

### Create Checkout
**Request:**
```json
POST /api/checkout/session
{
  "plan_id": "plan_starter"
}
```

**Response:**
```json
{
  "session_id": "cs_123...",
  "url": "https://checkout.stripe.com/..."
}
```

## Design & Styling

### Color Scheme
- Primary: Used for active plan, current badges
- Success (Green): Checkmarks, included features, paid status
- Warning (Yellow): Cancellation warnings
- Error (Red): Cancelled status, delete actions
- Muted: Secondary information, backgrounds

### Typography
- h1: Page titles (3xl, bold)
- h2: Section titles (lg, bold)
- h3: Subsection titles (font-medium)
- Body: Default text (text-sm)
- Caption: Metadata, secondary text (text-xs, muted)

### Spacing
- Page sections: gap-8
- Card sections: gap-4 to gap-6
- Form fields: gap-2
- Lists: gap-2 to gap-3

### Components Used
- Card (with CardHeader, CardTitle, CardDescription, CardContent, CardFooter)
- Button (variants: default, outline, ghost)
- Badge (variants: default, secondary)
- Input, Label, Textarea
- AlertDialog
- Tabs (for billing period toggle)
- Progress (for upload progress)

## Form Validation

### Profile Form
```typescript
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().optional(),
})
```

### File Validation
- MIME types: `application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- Max size: 10MB (configurable)
- Shows clear error messages for invalid files

## State Management

### Profile State
```typescript
// Form state (React Hook Form)
const form = useForm<ProfileFormData>({
  resolver: zodResolver(profileSchema),
  defaultValues: { /* ... */ },
})

// UI state
const [isEditingProfile, setIsEditingProfile] = useState(false)
const [deleteResumeId, setDeleteResumeId] = useState<string | null>(null)

// Data state (React Query)
const profileQuery = useProfile()
const updateProfileMutation = useUpdateProfile()
```

### Billing State
```typescript
// UI state
const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("monthly")
const [showCancelDialog, setShowCancelDialog] = useState(false)

// Data state (React Query)
const subscriptionQuery = useSubscription()
const plansQuery = usePlans()
const invoicesQuery = useInvoices()
```

## Error Handling

### API Errors
- Authentication errors (401): Redirect to login
- Forbidden errors (403): Toast notification
- Validation errors: Display field-specific messages
- Network errors: User-friendly toast messages

### File Upload Errors
- Invalid file type: Clear error message
- File too large: Show size limit
- Upload failure: Toast notification with details

## Loading States

### Skeleton Loaders
- `CardSkeleton`: For card sections
- `TableSkeleton`: For invoice table
- Custom pulse animations: For resume list

### Mutation Loading
- Buttons show loading spinner and "Uploading..." text
- Inputs disabled during form submission
- Dialogs prevent interaction during operations

## Testing Recommendations

1. **Profile Form**
   - Test form validation (empty name, invalid phone)
   - Test edit/save workflow
   - Test form reset on cancel

2. **File Upload**
   - Test drag-and-drop functionality
   - Test file type validation (accept PDF/DOCX, reject others)
   - Test file size validation
   - Test progress bar animation
   - Test remove button

3. **Resume Management**
   - Test upload success
   - Test resume list display
   - Test set primary functionality
   - Test delete with confirmation
   - Test empty state

4. **Billing**
   - Test plan selection and checkout redirect
   - Test billing period toggle (monthly/annual pricing)
   - Test cancel subscription with confirmation
   - Test payment method display
   - Test invoice download
   - Test portal redirect

5. **Error States**
   - Test 401 (unauthorized) handling
   - Test 403 (forbidden) handling
   - Test network errors
   - Test API validation errors

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Mobile)

## Accessibility

- Semantic HTML (buttons, forms, dialogs)
- ARIA labels on buttons and inputs
- Keyboard navigation support
- Focus indicators on interactive elements
- Color contrast ratios meet WCAG AA standards
- Error messages linked to form fields

## Dark Mode

All components support dark mode via Tailwind's `dark:` variant:
- Card backgrounds: `bg-card` / `dark:bg-slate-950`
- Text colors: `text-foreground` / `dark:text-white`
- Muted text: `text-muted-foreground` / `dark:text-slate-400`
- Success: `dark:bg-green-950` / `dark:text-green-200`
- Warning: `dark:bg-yellow-950` / `dark:text-yellow-200`
- Error: `dark:bg-red-950` / `dark:text-red-200`

## Performance Considerations

1. **React Query**
   - Stale time: 30-60s for profile/resumes
   - 5 minutes for plans (rarely change)
   - Auto-refetch on window focus

2. **Code Splitting**
   - Pages are automatically code-split by Next.js
   - Components lazy loaded where appropriate

3. **File Upload**
   - Progress bar updates without re-rendering entire component
   - File preview generated client-side (no server request)

4. **Images**
   - Use `next/image` for optimized logo/icons
   - SVG icons from lucide-react (lightweight)

## Future Enhancements

1. **Profile**
   - Avatar upload with image cropping
   - LinkedIn profile import
   - Skill endorsements
   - Export profile as PDF

2. **Billing**
   - Usage analytics dashboard
   - Detailed feature comparison modal
   - Annual vs monthly pricing comparison table
   - Billing history export
   - Tax ID management

3. **File Upload**
   - Drag-and-drop multiple files
   - Upload progress for each file
   - File preview before upload
   - Resume parsing with AI

## Troubleshooting

### Common Issues

**"Failed to load profile"**
- Check API endpoint is correct
- Verify authentication token is present
- Check network tab for 401/403 responses

**File upload not working**
- Verify API endpoint accepts multipart/form-data
- Check file size doesn't exceed limit
- Ensure file type is PDF or DOCX

**Billing page not loading**
- Check `/api/billing/plans` endpoint exists
- Verify subscription endpoint returns correct data
- Check Stripe keys are configured

**Form validation not working**
- Verify Zod schema matches form data types
- Check react-hook-form resolver is properly configured
- Ensure form submission handler is async

## Related Files

- `/src/types/api.ts` - API type definitions
- `/src/lib/api-client.ts` - HTTP client
- `/src/components/ui/*` - shadcn/ui components
- `/src/components/shared/*` - Reusable components
- `/src/app/(dashboard)/layout.tsx` - Dashboard layout

## License & Attribution

Author: Ahmed Adel Bakr Alderai

Components use:
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- TanStack React Query v5
- React Hook Form v7
- Zod v4
- Lucide React (icons)
- Sonner (toast notifications)
