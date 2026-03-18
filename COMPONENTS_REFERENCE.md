# Components Reference Guide

**Author:** Ahmed Adel Bakr Alderai

## Jobs Components

### JobTable

Full-featured data table for displaying jobs with sorting, filtering, and bulk actions.

**Props:**
```typescript
interface JobTableProps {
  data: Job[]
  isLoading?: boolean
  onApply?: (jobIds: number[]) => void
  onArchive?: (jobIds: number[]) => void
  onDelete?: (jobIds: number[]) => void
  onStatusChange?: (jobId: number, status: string) => void
}
```

**Features:**
- Checkbox selection for bulk operations
- Sortable columns (click header)
- Color-coded score (0-100)
- Expandable rows with full details
- Status badges
- Remote type indicators
- Salary formatting
- Pagination controls
- Actions dropdown per row

**Usage:**
```typescript
import { JobTable } from "@/components/jobs"

<JobTable
  data={jobs}
  isLoading={isLoading}
  onApply={handleApply}
  onArchive={handleArchive}
  onDelete={handleDelete}
  onStatusChange={handleStatusChange}
/>
```

---

### JobFilters

Comprehensive filter panel for job search with responsive design.

**Props:**
```typescript
interface JobFiltersProps {
  onFiltersChange: (filters: JobFilters) => void
  isCollapsed?: boolean
}
```

**Features:**
- Search input (debounced)
- Score slider (0-100)
- Status multi-select (6 options)
- Source multi-select (6 options)
- Remote type multi-select (3 options)
- Clear all filters button
- Active filters badge
- Mobile sheet / desktop card
- Collapsible on desktop

**Usage:**
```typescript
import { JobFilters } from "@/components/jobs"

<JobFilters
  onFiltersChange={handleFiltersChange}
  isCollapsed={false}
/>
```

**Filter Object:**
```typescript
{
  search?: string
  min_score?: number
  status?: string  // CSV of statuses
  source?: string  // CSV of sources
  remote_type?: string  // CSV of types
  page?: number
  per_page?: number
}
```

---

### JobCard

Card component for individual job display with action buttons.

**Props:**
```typescript
interface JobCardProps {
  job: Job
  onApply?: () => void
  onArchive?: () => void
  onDelete?: () => void
  onClick?: () => void
  isSelectable?: boolean
}
```

**Features:**
- Score indicator (color-coded)
- Company and title
- Location, remote, source badges
- Salary range
- Ghost job warning (if ghost_score > 70)
- Visa sponsorship indicator
- Description preview
- Requirements preview
- Action buttons
- External link to posting

**Usage:**
```typescript
import { JobCard } from "@/components/jobs"

<JobCard
  job={job}
  onApply={handleApply}
  onArchive={handleArchive}
  onDelete={handleDelete}
/>
```

---

## Applications Components

### ApplicationsTable

Data table for tracking applications with expandable details.

**Props:**
```typescript
interface ApplicationsTableProps {
  data: Application[]
  isLoading?: boolean
  onViewDetails?: (applicationId: number) => void
  onWithdraw?: (applicationId: number) => void
  onDelete?: (applicationId: number) => void
}
```

**Features:**
- Job title, company, status
- Applied date (relative format)
- ATS type badge
- Application method badge
- Expandable rows with:
  - Notes
  - Resume version
  - Confirmation email
  - Cover letter preview
- Column sorting
- Actions dropdown per row
- Pagination controls

**Usage:**
```typescript
import { ApplicationsTable } from "@/components/applications"

<ApplicationsTable
  data={applications}
  isLoading={isLoading}
  onViewDetails={handleViewDetails}
  onWithdraw={handleWithdraw}
  onDelete={handleDelete}
/>
```

---

## Hooks Reference

### useJobs

Fetch paginated jobs with optional filters.

```typescript
const { data, isLoading, error } = useJobs({
  status: "new",
  min_score: 50,
  page: 1,
  per_page: 20
})

// data structure
{
  jobs: Job[]
  total: number
  page: number
  per_page: number
}
```

### useJob

Fetch a single job by ID.

```typescript
const { data, isLoading, error } = useJob(jobId)
// data: Job
```

### useUpdateJobStatus

Mutation to update job status.

```typescript
const { mutateAsync, isPending } = useUpdateJobStatus()

await mutateAsync({
  jobId: 123,
  status: "applied"
})
```

### useBulkAction

Mutation for bulk operations on jobs.

```typescript
const { mutateAsync, isPending } = useBulkAction()

await mutateAsync({
  action: "apply",  // "apply" | "archive" | "delete"
  jobIds: [1, 2, 3],
  data: {}  // Optional additional data
})

// Response: { count: number }
```

### useDeleteJob

Mutation to delete a single job.

```typescript
const { mutateAsync, isPending } = useDeleteJob()

await mutateAsync(jobId)
```

### useApplications

Fetch paginated applications with optional filters.

```typescript
const { data, isLoading, error } = useApplications({
  status: "pending",
  page: 1,
  per_page: 20
})

// data structure
{
  applications: Application[]
  total: number
  page: number
  per_page: number
}
```

### useApplication

Fetch a single application by ID.

```typescript
const { data, isLoading, error } = useApplication(appId)
// data: Application
```

### useUpdateApplication

Mutation to update application details.

```typescript
const { mutateAsync, isPending } = useUpdateApplication()

await mutateAsync({
  applicationId: 123,
  data: {
    status: "confirmed",
    notes: "Follow up next week"
  }
})
```

### useWithdrawApplication

Mutation to withdraw an application.

```typescript
const { mutateAsync, isPending } = useWithdrawApplication()

await mutateAsync(applicationId)
```

---

## Pages Reference

### Jobs Page (`/jobs`)

Main jobs queue page with filters and table.

**Features:**
- Job count in header
- Filter panel
- Full data table
- Loading/error/empty states
- "Discover Jobs" button

**State Management:**
- Filters state
- Pagination state
- Data from `useJobs` hook

**Handlers:**
- `handleFiltersChange` - Update filters
- `handleApplySelected` - Bulk apply
- `handleArchiveSelected` - Bulk archive
- `handleDeleteSelected` - Bulk delete with confirmation
- `handleStatusChange` - Update single job

---

### Applications Page (`/applications`)

Main applications tracker page with stats and tabs.

**Features:**
- Stats grid (Total, Submitted, Interviews, Offers)
- Status tabs (All, Pending, Submitted, etc.)
- Application table with expandable rows
- Loading/error/empty states

**State Management:**
- Selected status tab
- Pagination state
- Data from `useApplications` hook

**Handlers:**
- `handleViewDetails` - View full details (modal placeholder)
- `handleWithdraw` - Withdraw with confirmation
- `handleDelete` - Delete with confirmation

---

## Type Definitions

### Job
```typescript
{
  id: number
  title: string
  company: string
  location: string
  url: string
  source: string
  status: "new" | "scored" | "applied" | "archived" | "rejected" | "interview"
  score: number  // 0-100
  salary_min?: number
  salary_max?: number
  remote_type?: "remote" | "hybrid" | "onsite"
  description?: string
  requirements?: string
  visa_sponsored?: boolean
  ghost_score?: number  // 0-100
  created_at: string
  updated_at?: string
}
```

### Application
```typescript
{
  id: number
  job_id: number
  job_title?: string
  company?: string
  status: "pending" | "submitted" | "confirmed" | "rejected" | "interview" | "offer" | "withdrawn"
  applied_at: string
  ats_type?: string
  method?: string
  notes?: string
  resume_version?: string
  cover_letter?: string
  confirmation_email?: string
}
```

---

## Styling & Customization

### Color Coding
- **Score:** Red (<30), Yellow (30-60), Green (>60)
- **Ghost Job:** Red destructive badge
- **Visa Sponsored:** Green/outline badge
- **Status badges:** Context-aware colors via `StatusBadge`

### Responsive Breakpoints
- Mobile: < 768px
  - Filters in sheet
  - Stacked layout
  - Simplified tables
- Desktop: >= 768px (lg)
  - Filters as collapsible card
  - Side-by-side layout
  - Full table with all columns

### Dark Mode
All components support light/dark mode with proper contrast.

---

## Common Patterns

### Loading State
```typescript
if (isLoading) {
  return <TableSkeleton rows={5} />
}
```

### Error State
```typescript
if (error) {
  return (
    <EmptyState
      icon={AlertIcon}
      title="Error"
      description="Failed to load"
      action={{ label: "Retry", onClick: () => refetch() }}
    />
  )
}
```

### Empty State
```typescript
if (!data?.jobs?.length) {
  return (
    <EmptyState
      icon={Briefcase}
      title="No jobs"
      description="Run discovery to find jobs"
      action={{ label: "Discover", onClick: handleDiscover }}
    />
  )
}
```

### Toast Notifications
```typescript
import { toast } from "sonner"

toast.success("Job applied!")
toast.error("Failed to apply")
toast.info("Processing...")
```

---

## Testing Examples

### Testing Filters
```typescript
it("filters jobs by status", async () => {
  render(<JobsPage />)
  const statusCheckbox = screen.getByLabelText("Applied")
  fireEvent.click(statusCheckbox)
  await waitFor(() => {
    expect(mockApi).toHaveBeenCalledWith(
      expect.objectContaining({ status: "applied" })
    )
  })
})
```

### Testing Bulk Actions
```typescript
it("applies to selected jobs", async () => {
  render(<JobsPage />)
  const checkboxes = screen.getAllByRole("checkbox")
  fireEvent.click(checkboxes[0])
  fireEvent.click(checkboxes[1])
  fireEvent.click(screen.getByText("Apply to Selected"))
  await waitFor(() => {
    expect(mockApi).toHaveBeenCalledWith("/api/jobs/bulk-action", ...)
  })
})
```

### Testing Expandable Rows
```typescript
it("expands job details", async () => {
  render(<JobsPage />)
  fireEvent.click(screen.getByText("Senior Engineer"))
  expect(screen.getByText("Full description")).toBeInTheDocument()
})
```

---

## Troubleshooting

### Table not showing
- Check `data` prop is array
- Verify API response format matches `Job[]`
- Check network requests in DevTools

### Filters not working
- Verify `onFiltersChange` is called
- Check filters object structure
- Ensure debounce isn't blocking

### Pagination not working
- Verify API supports `page` and `per_page` params
- Check total count in response
- Ensure data length matches per_page

### Mutations not updating UI
- Verify `queryClient.invalidateQueries` called
- Check query keys match
- Ensure mutation resolves

---

## Performance Tips

1. **Pagination:** Keep per_page < 50 for performance
2. **Filters:** Use debouncing for text input (already implemented)
3. **Sorting:** Let server handle sorting when possible
4. **Caching:** Configure stale times appropriately
5. **Virtualization:** Consider for 1000+ rows

---

Last Updated: 2026-03-19
