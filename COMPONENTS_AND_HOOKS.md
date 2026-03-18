# Shared Components and Hooks

This document describes the shared components and custom hooks available for use across the JobFlow frontend.

## Shared Components (`src/components/shared/`)

### EmptyState
A reusable component for displaying empty states with optional CTA.

```tsx
import { EmptyState } from "@/components/shared"
import { Search } from "lucide-react"

<EmptyState
  icon={Search}
  title="No jobs found"
  description="Try adjusting your filters"
  action={{
    label: "Clear filters",
    onClick: () => setFilters({}),
  }}
/>
```

**Props:**
- `icon?: LucideIcon` - Icon to display
- `title: string` - Empty state title
- `description?: string` - Optional description text
- `action?: { label: string; onClick: () => void }` - Optional action button
- `className?: string` - Additional CSS classes

### ErrorBoundary
React error boundary for catching and displaying errors.

```tsx
import { ErrorBoundary } from "@/components/shared"

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

**Features:**
- Catches child component errors
- Displays error card with retry button
- Logs errors to console
- Optional fallback UI

### Loading Skeletons
Multiple skeleton layouts for different content types.

```tsx
import {
  CardSkeleton,
  TableSkeleton,
  StatSkeleton,
  PageSkeleton,
} from "@/components/shared"

// Card skeleton
<CardSkeleton />

// Table with rows
<TableSkeleton rows={10} />

// Statistics card
<StatSkeleton />

// Full page layout
<PageSkeleton />
```

### StatusBadge
Color-coded badge for displaying status with automatic formatting.

```tsx
import { StatusBadge } from "@/components/shared"

<StatusBadge status="pending" />
<StatusBadge status="error" variant="destructive" />
<StatusBadge status="interview" className="mr-2" />
```

**Supported statuses:**
- Success: `running`, `active`, `submitted`, `completed`, `confirmed`, `offer`, `applied`
- Warning: `pending`, `paused`, `starting`, `draft`
- Error: `error`, `rejected`, `failed`, `cancelled`, `withdrawn`, `stopped`, `bounced`
- Info: `interview`, `new`, `archived`, `half_open`, `open`, `closed`, `sent`, `delivered`, `opened`, `replied`

## Custom Hooks (`src/hooks/`)

### useAuth
Authentication hook with automatic auth checking.

```tsx
import { useAuth } from "@/hooks"

const { user, isAuthenticated, login, logout } = useAuth(requireAuth = true)

// Auto-redirects to login if requireAuth=true and not authenticated
```

**Returns:**
- `user: User | null` - Current user
- `token: string | null` - Auth token
- `isAuthenticated: boolean` - Auth status
- `isLoading: boolean` - Login/signup loading state
- `error: string | null` - Error message
- `login(email, password): Promise<boolean>` - Login function
- `signup(email, password): Promise<boolean>` - Signup function
- `logout(): void` - Logout function
- `checkAuth(): boolean` - Check auth status
- `clearError(): void` - Clear error state

### Dashboard Hooks
Real-time dashboard data fetching with auto-refresh.

```tsx
import {
  usePipelineStats,
  useAnalyticsOverview,
  useFunnelData,
} from "@/hooks"

// Pipeline statistics (auto-refreshes every 30s)
const { data: stats, isLoading } = usePipelineStats()

// Analytics overview (auto-refreshes every 60s)
const { data: overview } = useAnalyticsOverview()

// Funnel conversion data (auto-refreshes every 60s)
const { data: funnel } = useFunnelData()
```

### Jobs Hooks
Manage jobs with filtering, pagination, and bulk actions.

```tsx
import {
  useJobs,
  useJob,
  useUpdateJobStatus,
  useBulkAction,
} from "@/hooks"

// List jobs with filters
const { data: response, isLoading } = useJobs({
  status: "new",
  min_score: 80,
  page: 1,
  per_page: 20,
})

// Get single job
const { data: job } = useJob(123)

// Update job status
const updateStatus = useUpdateJobStatus()
await updateStatus.mutateAsync({ jobId: 123, status: "applied" })

// Bulk actions
const bulk = useBulkAction()
await bulk.mutateAsync({
  action: "archive",
  jobIds: [1, 2, 3],
})
```

### Agents Hooks
Control and configure background agents.

```tsx
import {
  useAgents,
  useAgentAction,
  useAgentConfig,
  useUpdateAgentConfig,
} from "@/hooks"

// List all agents (real-time every 15s)
const { data: agents } = useAgents()

// Perform agent action
const action = useAgentAction("discovery", "start")
await action.mutateAsync()

// Get agent config
const { data: config } = useAgentConfig("discovery")

// Update agent config
const updateConfig = useUpdateAgentConfig("discovery")
await updateConfig.mutateAsync({ max_jobs: 100 })
```

### Applications Hooks
Track and manage job applications.

```tsx
import {
  useApplications,
  useApplication,
  useUpdateApplication,
} from "@/hooks"

// List applications with filters
const { data: response } = useApplications({
  status: "pending",
  page: 1,
})

// Get single application
const { data: app } = useApplication(123)

// Update application
const update = useUpdateApplication()
await update.mutateAsync({
  applicationId: 123,
  data: { status: "interview" },
})
```

### Interviews Hooks
Schedule and manage interviews with prep notes.

```tsx
import {
  useInterviews,
  useScheduleInterview,
  usePrepNotes,
  useUpdateInterview,
} from "@/hooks"

// List interviews
const { data: interviews } = useInterviews({ status: "scheduled" })

// Schedule interview
const schedule = useScheduleInterview()
await schedule.mutateAsync({
  company: "Google",
  position: "Senior Engineer",
  interview_type: "technical",
  scheduled_at: "2024-04-01T10:00:00Z",
  duration_minutes: 60,
})

// Get prep notes
const { data: notes } = usePrepNotes("interview-123")

// Update interview
const update = useUpdateInterview()
await update.mutateAsync({
  interviewId: "interview-123",
  data: { status: "completed", notes: "..." },
})
```

### useSSE
Subscribe to Server-Sent Events for real-time updates.

```tsx
import { useSSE } from "@/hooks"

const { disconnect } = useSSE(
  "/api/stream/jobs",
  (data) => {
    console.log("Job update:", data)
  },
  {
    enabled: true,
    onError: (error) => console.error("SSE error:", error),
  }
)

// Cleanup on component unmount is automatic
// Manual disconnect available via disconnect()
```

**Features:**
- Auto-connect and reconnect with exponential backoff
- Auto-cleanup on unmount
- TypeScript support for message typing
- Error handling with callbacks

## Provider Setup

The root layout (`src/app/layout.tsx`) uses `ClientProvider` to set up all necessary providers:

- **ThemeProvider** (next-themes) - Theme management (light/dark/system)
- **QueryClientProvider** (@tanstack/react-query) - Server state management
- **Language/Direction** - RTL support for Arabic

```tsx
// Automatic in root layout
// QueryClient configured with:
// - 5 minute stale time
// - No refetch on window focus
```

## Best Practices

1. **Error Handling**: Use `ErrorBoundary` around feature sections
2. **Loading States**: Use appropriate skeleton components during data fetching
3. **Empty States**: Always show helpful empty states with optional CTAs
4. **Status Display**: Use `StatusBadge` for consistent status visualization
5. **Real-time Updates**: Use `useSSE` for live data streams
6. **Cache Management**: Query keys are automatically managed by hooks
7. **Authentication**: Use `useAuth(true)` to protect pages

## Exports

All components and hooks are exported from their respective index files:

```tsx
// Components
import { EmptyState, ErrorBoundary, StatusBadge } from "@/components/shared"
import { CardSkeleton, TableSkeleton } from "@/components/shared"

// Hooks
import {
  useAuth,
  useJobs,
  usePipelineStats,
  useSSE,
  // ... all other hooks
} from "@/hooks"
```

---

Author: Ahmed Adel Bakr Alderai
