# Jobs & Applications Pages Implementation

**Author:** Ahmed Adel Bakr Alderai

## Overview

Complete implementation of Jobs and Applications pages for the Next.js 16 frontend with App Router, React 19, TypeScript, Tailwind CSS v4, shadcn/ui components, TanStack React Query, and @tanstack/react-table.

## Files Created

### Core Hooks (`/src/hooks/`)

#### `use-jobs.ts` (Enhanced)
- `useJobs(filters)` - Fetch paginated jobs with server-side filtering
- `useJob(jobId)` - Fetch a single job by ID
- `useUpdateJobStatus()` - Mutate job status
- `useBulkAction()` - Perform bulk actions (apply, archive, delete)
- `useDeleteJob()` - Delete individual job (NEW)
- Toast notifications integrated for success/error feedback

#### `use-applications.ts` (Enhanced)
- `useApplications(filters)` - Fetch paginated applications
- `useApplication(applicationId)` - Fetch single application
- `useUpdateApplication()` - Update application data
- `useWithdrawApplication()` - Withdraw application (NEW)
- Exports `ApplicationFilters` interface
- Toast notifications for all mutations

### UI Components

#### Jobs Components (`/src/components/jobs/`)

**`job-table.tsx`**
- Full-featured data table using @tanstack/react-table
- Features:
  - Checkbox bulk selection with multi-select action bar
  - Score column (color-coded: red <30, yellow 30-60, green >60)
  - Title, Company, Location, Source badges
  - Status badges using StatusBadge component
  - Remote type indicators (100% Remote, Hybrid, On-site)
  - Salary range formatting
  - Expandable rows showing:
    - Full job description
    - Requirements
    - Visa sponsorship status
    - Ghost score warning badges
  - Row-level actions dropdown (Apply, Archive, Delete)
  - Server-side pagination (Page/Previous/Next)
  - Column sorting with visual indicators

**`job-filters.tsx`**
- Collapsible filter panel (mobile sheet, desktop card)
- Filters:
  - Search input (debounced 500ms)
  - Min score slider (0-100, 5-step increments)
  - Status multi-select (New, Scored, Applied, Interview, Archived, Rejected)
  - Source multi-select (LinkedIn, Indeed, Glassdoor, Built In, Greenhouse, Workday)
  - Remote type multi-select (Remote, Hybrid, On-site)
  - Clear All button
  - Active filters badge indicator
- Responsive: Mobile sheet + desktop collapsible panel

**`job-card.tsx`**
- Card component for individual job display
- Features:
  - Score indicator with color coding
  - Location, remote type, source badges
  - Salary range with formatting
  - Status badge
  - Ghost job detection badge (warning if >70)
  - Visa sponsorship indicator
  - Description and requirements preview (line-clamped)
  - Action buttons: Apply, Archive, Delete, External link

**`index.ts`**
- Public API exporting JobTable, JobFilters, JobCard

#### Applications Components (`/src/components/applications/`)

**`applications-table.tsx`**
- Data table using @tanstack/react-table
- Features:
  - Job title, company, status
  - Applied date (formatted as relative time: "Today", "2 days ago", etc.)
  - ATS type badge
  - Application method badge
  - Row-level actions dropdown (View Details, Withdraw, Delete)
  - Expandable rows showing:
    - Notes
    - Resume version
    - Confirmation email
    - Cover letter (line-clamped)
  - Column sorting
  - Server-side pagination

**`index.ts`**
- Public API exporting ApplicationsTable

### Pages (`/src/app/(dashboard)/`)

#### `jobs/page.tsx`
- Client component ("use client")
- Header with job queue title and total count
- "Discover Jobs" button (routes to pipeline discovery)
- Integrated JobFilters component
- JobTable with:
  - Loading state (TableSkeleton)
  - Error state (EmptyState with retry)
  - Empty state (EmptyState with discovery action)
  - Data loading and display
- Handlers:
  - `handleFiltersChange` - Update filters with pagination reset
  - `handleApplySelected` - Bulk apply to selected jobs
  - `handleArchiveSelected` - Bulk archive selected jobs
  - `handleDeleteSelected` - Bulk delete with confirmation
  - `handleStatusChange` - Individual job status update
- Responsive layout with proper spacing

#### `applications/page.tsx`
- Client component ("use client")
- Header with "Applications" title
- Stats grid showing:
  - Total Applications (with pending count)
  - Submitted count
  - Interview count
  - Offer count
  - Loading skeletons during data fetch
- Tabs for filtering by status:
  - All, Pending, Submitted, Confirmed, Interview, Offer, Rejected
  - Each tab shows count
- ApplicationsTable with:
  - Loading state
  - Error state with retry
  - Empty state for "no applications"
  - Data display with proper sorting
- Handlers:
  - `handleViewDetails` - View application details (toast placeholder)
  - `handleWithdraw` - Withdraw application with confirmation
  - `handleDelete` - Delete application with confirmation

### UI Components (New)

**`/src/components/ui/checkbox.tsx`**
- New checkbox component using @base-ui/react/checkbox
- Integrates with Tailwind and existing design system
- Check icon using lucide-react

## Key Features

### Data Management
- TanStack Query for server state management
- Optimistic updates and invalidation
- Error handling with toast notifications
- Proper loading/error/empty states

### Responsive Design
- Mobile-first approach
- Sheet component for mobile filters
- Table responsive with proper overflow handling
- Grid layout adapts to screen size
- Collapsible components on mobile

### Performance
- Debounced search (500ms)
- Pagination with server-side support
- Lazy loading of expanded rows
- Proper memoization of callbacks

### Accessibility
- Semantic HTML
- ARIA labels for interactive elements
- Keyboard navigation support
- Status badges for screen readers
- Proper color contrast

### User Experience
- Toast notifications for all actions
- Confirmation dialogs for destructive actions
- Loading skeletons matching content shape
- Clear empty states with call-to-action
- Visual feedback for selections and actions

## Component Hierarchy

```
Pages
├── jobs/page.tsx
│   ├── JobFilters
│   │   └── (Checkbox, Select, Input, Sheet components)
│   └── JobTable
│       ├── (Checkbox for row selection)
│       ├── (Bulk action bar)
│       ├── (Table with TanStack)
│       │   ├── Header cells with sort
│       │   └── Body rows
│       │       ├── Data cells
│       │       └── Expandable detail rows
│       └── Pagination
│
└── applications/page.tsx
    ├── (Stats Grid with Cards)
    ├── (Tabs for status filtering)
    └── ApplicationsTable
        ├── (Table with TanStack)
        │   ├── Header cells
        │   └── Body rows
        │       ├── Data cells
        │       └── Expandable detail rows
        └── Pagination
```

## API Integration

### Jobs Endpoints
- `GET /api/jobs` - List jobs with filters
- `GET /api/jobs/{id}` - Get single job
- `PATCH /api/jobs/{id}` - Update job status
- `PUT /api/jobs/bulk-action` - Bulk operations
- `DELETE /api/jobs/{id}` - Delete job

### Applications Endpoints
- `GET /api/applications` - List applications
- `GET /api/applications/{id}` - Get single application
- `PATCH /api/applications/{id}` - Update application
- `POST /api/applications/{id}/withdraw` - Withdraw application

## Query Key Strategy

### Jobs
- `["jobs", filters]` - List query (invalidated on filter change)
- `["jobs", jobId]` - Single job query

### Applications
- `["applications", filters]` - List query
- `["applications", applicationId]` - Single application query

## Type Safety

All components and hooks are fully typed with TypeScript:
- `Job` interface from API types
- `JobFilters` interface with all filter options
- `Application` interface with all fields
- `ApplicationFilters` interface
- Proper generic types for mutation and query returns

## Dark Mode Support

All components support dark mode:
- Proper use of `bg-background`, `text-foreground` classes
- `dark:` prefixes for dark-mode specific styles
- Color-coding still readable in dark mode
- Badges and badges handle dark mode appropriately

## Testing Considerations

### Testable API
- Each component accepts handler props for testing
- Hooks can be mocked using msw or jest-mock
- Table sorting and pagination can be tested
- Filter state changes can be verified
- Expandable rows toggle can be tested

### Mock Data
Can be used with mock handlers:
```typescript
// Example test structure
describe("JobsPage", () => {
  it("displays jobs from API", () => { ... })
  it("filters jobs on status change", () => { ... })
  it("handles bulk actions", () => { ... })
  it("expands/collapses row details", () => { ... })
})
```

## Future Enhancements

1. **Detail Modal/Drawer** - Full job/application details view
2. **Bulk Export** - CSV/PDF export of jobs/applications
3. **Custom Reports** - Charts and analytics
4. **Email Integration** - Send application confirmations
5. **Calendar View** - Timeline of applications
6. **Comparison Tool** - Compare multiple jobs side-by-side
7. **Notes Modal** - Full note editor for applications
8. **Interview Prep** - Link to interview prep materials

## Environment Variables

Ensure these are set in `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8082
```

## Styling

Uses Tailwind CSS v4 with:
- Custom utility classes from existing setup
- `@base-ui/react` components for primitives
- `lucide-react` for icons
- `shadcn/ui` pattern for component structure
- Full support for light/dark mode

## Browser Support

Works on modern browsers supporting:
- ES2020+ JavaScript
- CSS Grid and Flexbox
- CSS custom properties
- Modern form APIs

All components are optimized for:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Android)
