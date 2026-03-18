# Interviews & Recruiters Feature Documentation

Author: Ahmed Adel Bakr Alderai

## Overview

This document describes the Interviews and Recruiters pages built for the Next.js 16 frontend using App Router, React 19, TypeScript, Tailwind CSS v4, shadcn/ui, and TanStack React Query.

## Project Structure

```
src/
├── hooks/
│   ├── use-interviews.ts    # Interview data fetching hooks
│   ├── use-recruiters.ts    # Recruiter data fetching hooks
│   └── index.ts             # Public API exports
│
├── components/
│   ├── interviews/
│   │   ├── interview-list.tsx      # Interview cards with actions
│   │   ├── interview-form.tsx      # Schedule/edit interview dialog
│   │   ├── prep-notes.tsx          # AI-generated prep notes viewer
│   │   └── index.ts                # Public API exports
│   │
│   ├── recruiters/
│   │   ├── recruiter-table.tsx     # Recruiter table with filters
│   │   ├── recruiter-detail.tsx    # Recruiter profile panel
│   │   └── index.ts                # Public API exports
│   │
│   ├── ui/
│   │   └── form.tsx                # React Hook Form wrapper
│   │
│   └── shared/
│       ├── empty-state.tsx
│       ├── loading-skeleton.tsx
│       └── status-badge.tsx
│
├── types/
│   └── api.ts                      # TypeScript API interfaces
│
├── lib/
│   └── api-client.ts               # Typed fetch wrapper
│
└── app/
    └── (dashboard)/
        ├── interviews/
        │   └── page.tsx            # Interviews page
        └── recruiters/
            └── page.tsx            # Recruiters page
```

## Features

### 1. Interviews Page (`/interviews`)

#### Page Layout
- **Header**: Title + "Schedule Interview" button
- **Tabs**: Upcoming, Completed, Cancelled, All
- **Content**: Interview list with cards
- **Detail Panel**: Modal for prep notes
- **Empty State**: When no interviews exist

#### Interview Card (`InterviewList`)
- Company/position display
- Interview type badge (phone, video, onsite, technical, behavioral, final)
- Date and time (highlights "Today" in blue)
- Duration, location, meeting URL
- Status badge (scheduled, completed, cancelled, no-show)
- Expandable details (interviewer names, notes, feedback, rating)
- Quick actions via dropdown menu:
  - View Prep Notes
  - Edit
  - Reschedule
  - Mark Completed
  - Delete

#### Schedule/Edit Interview (`InterviewForm`)
- React Hook Form + Zod validation
- Dialog wrapper (shadcn)
- Fields:
  - Interview Type (select dropdown)
  - Scheduled Date & Time (calendar picker + time input)
  - Duration in minutes
  - Location
  - Meeting URL (with validation)
  - Interviewer Names (add/remove tags)
  - Notes (textarea)
- Mutations: Schedule new, update existing
- Success/error toasts

#### Interview Prep Notes (`PrepNotes`)
- Fetches AI-generated notes from API
- Parses into sections:
  - Company Research
  - Common Interview Questions
  - Your Talking Points
  - Questions to Ask
- Loading state (skeleton)
- "Regenerate" button
- Fallback to raw text if sections not detected
- Error handling

### 2. Recruiters Page (`/recruiters`)

#### Page Layout
- **Header**: Title + recruiter count
- **Filters**: Search, Specialization dropdown, Response Rate filter
- **Content**: Recruiter table (sortable, selectable)
- **Detail Sheet**: Recruiter profile on selection

#### Recruiter Table (`RecruiterTable`)
- Columns:
  - Checkbox (select/deselect all)
  - Name (clickable)
  - Company
  - Specialization (badge)
  - Response Rate (color-coded badge: high/medium/low)
  - Interactions (count)
  - Last Contact (formatted date)
  - Actions (dropdown menu)
- Row hover effect
- Bulk selection support (not yet implemented)
- Actions:
  - View Profile
  - Send Message (navigates to `/outreach` with pre-filled params)
  - View on LinkedIn (external link)
- Empty state when no recruiters

#### Recruiter Profile (`RecruiterDetail`)
- Name, title, company
- Contact info: email (mailto), phone (tel), LinkedIn URL
- Stats:
  - Response rate (%)
  - Interaction count
  - Last contact date
- Specialization badge
- Notes section
- Recommended Outreach (from API)
- Interaction History (log of emails/messages/calls/notes)
- "Send Message" button (CTA)

#### Filters
- **Search**: By name, company, email, title
- **Specialization**: Dropdown of unique specializations
- **Response Rate**: High (80%+), Medium (50%+), Low (0%+)
- Real-time filtering (debounced search)
- Sorting by response rate (desc), then by interaction count (desc)

### 3. API Hooks

#### Interviews Hooks (`use-interviews.ts`)

```typescript
useInterviews(filters?)          // GET /api/interviews
useInterview(id)                 // GET /api/interviews/{id}
useScheduleInterview()           // POST /api/interviews
useMarkCompleted()               // PATCH /api/interviews/{id}/mark-completed
usePrepNotes(id)                 // GET /api/interviews/{id}/prep-notes
useRegeneratePrepNotes()         // POST /api/interviews/{id}/prep-notes/regenerate
useCalendarExport(id)            // GET /api/interviews/{id}/calendar.ics (blob)
useUpdateInterview()             // PATCH /api/interviews/{id}
useDeleteInterview()             // DELETE /api/interviews/{id}
```

#### Recruiters Hooks (`use-recruiters.ts`)

```typescript
useRecruiters(filters?)                    // GET /api/recruiters
useRecruiter(linkedinId)                   // GET /api/recruiters/{id}
useUpdateRecruiter()                       // PATCH /api/recruiters/{id}
useRecruitersBySpecialization(spec?)       // GET /api/recruiters?specialization=
useRecruiterRecommendations(id)            // GET /api/recruiters/{id}/recommendations
useSpecializations()                       // GET /api/recruiters/specializations
```

### 4. Types

Added to `src/types/api.ts`:

```typescript
interface Recruiter extends Contact {
  specialization?: string
  response_rate?: number
  last_contact?: string
  interaction_count?: number
  interaction_log?: InteractionLog[]
  recommended_outreach?: string
}

interface InteractionLog {
  date: string
  type: "email" | "message" | "call" | "note"
  subject?: string
  body?: string
  status?: "pending" | "sent" | "delivered" | "opened" | "replied"
}

interface RecruitersResponse {
  recruiters: Recruiter[]
  total: number
  page: number
  per_page: number
}
```

The Interview type was already defined:

```typescript
interface Interview {
  interview_id: string
  application_id: string
  user_id: string
  type: "phone" | "video" | "onsite" | "technical" | "behavioral" | "final"
  scheduled_at: string
  duration_minutes?: number
  location?: string
  meeting_url?: string
  interviewer_names?: string[]
  status: "scheduled" | "completed" | "cancelled" | "no-show"
  notes?: string
  feedback?: string
  rating?: number
  created_at: string
  updated_at: string
}
```

## Integration Points

### Backend API Requirements

The following endpoints must be implemented in the backend:

**Interviews:**
- `GET /api/interviews` - List with pagination & filters
- `GET /api/interviews/{id}` - Single interview
- `POST /api/interviews` - Create/schedule
- `PATCH /api/interviews/{id}` - Update
- `PATCH /api/interviews/{id}/mark-completed` - Mark completed
- `GET /api/interviews/{id}/prep-notes` - Get prep notes
- `POST /api/interviews/{id}/prep-notes/regenerate` - Regenerate notes
- `GET /api/interviews/{id}/calendar.ics` - Download ICS file
- `DELETE /api/interviews/{id}` - Delete

**Recruiters:**
- `GET /api/recruiters` - List with pagination & filters
- `GET /api/recruiters/{id}` - Single recruiter
- `PATCH /api/recruiters/{id}` - Update
- `GET /api/recruiters/specializations` - List specializations
- `GET /api/recruiters/{id}/recommendations` - Get outreach recommendation

### Navigation

The "Send Message" action in recruiters navigates to `/outreach` with query params:
- `recruiter_id` - Contact ID
- `recruiter_name` - Full name
- `recruiter_email` - Email
- `recruiter_company` - Company

## Styling

- **Colors**: Uses Tailwind v4 semantic colors (muted, foreground, destructive, etc.)
- **Dark Mode**: Fully supported via `dark:` classes
- **Spacing**: Uses Tailwind spacing scale (gap-2, p-4, etc.)
- **Typography**: Semantic sizes (h1, h3, text-sm, text-muted-foreground)
- **Icons**: Lucide React icons
- **Shadows**: Card component with border + subtle shadows
- **Animations**: Smooth transitions (hover effects, expandable cards)

## Form Validation

Uses React Hook Form + Zod for type-safe validation:

```typescript
const schema = z.object({
  type: z.enum(["phone", "video", ...]),
  scheduled_at: z.string().min(1),
  duration_minutes: z.coerce.number().min(15).optional(),
  meeting_url: z.string().url().optional().or(z.literal("")),
  // ...
})

const form = useForm<Values>({
  resolver: zodResolver(schema),
})
```

## State Management

- **Data Fetching**: TanStack React Query (useQuery)
- **Mutations**: useMutation with optimistic updates
- **Local State**: React useState for:
  - Expanded rows
  - Tab selection
  - Selected recruiter ID
  - Detail sheet visibility
  - Search query
  - Filter selections

## Error Handling

- **API Errors**: Caught by `apiFetch` wrapper, shown via `toast.error()`
- **Form Errors**: Displayed inline via FormMessage
- **Loading States**: Skeleton loaders (CardSkeleton, TableSkeleton)
- **Empty States**: EmptyState component with icon, title, description, action

## Performance Optimizations

- **Caching**: staleTime of 30s for lists, 60s for details
- **Pagination**: per_page=100 on initial load
- **Sorting**: Client-side sort (response rate desc, then interaction count desc)
- **Search**: Debounced via URL param (already handled by API)
- **Date Parsing**: Uses date-fns for consistent formatting

## Known Limitations

1. **Bulk Actions**: Checkbox selection implemented but no bulk send/delete
2. **Calendar Export**: Not yet integrated into UI (hook available)
3. **Real-time**: No WebSocket updates (SSE available elsewhere)
4. **Pagination**: Currently loads 100 per page (no infinite scroll)
5. **Search**: Case-insensitive but local-side on client

## Future Enhancements

1. Bulk send messages to recruiters
2. Calendar sync (export ICS, Google Calendar integration)
3. Interview scheduling via Calendly/Outlook API
4. Recruiter scoring algorithm
5. Automated follow-up sequences
6. Interview feedback template
7. Statistics dashboard (acceptance rate, time to offer)
8. Interview analytics (by company, recruiter, type)
9. Export interviews to PDF
10. SMS/WhatsApp integration for recruiters

## Files Created

### Hooks
- `/src/hooks/use-interviews.ts` (updated)
- `/src/hooks/use-recruiters.ts` (new)
- `/src/hooks/index.ts` (updated)

### Components
- `/src/components/interviews/interview-list.tsx`
- `/src/components/interviews/interview-form.tsx`
- `/src/components/interviews/prep-notes.tsx`
- `/src/components/interviews/index.ts`
- `/src/components/recruiters/recruiter-table.tsx`
- `/src/components/recruiters/recruiter-detail.tsx`
- `/src/components/recruiters/index.ts`
- `/src/components/ui/form.tsx` (new)

### Pages
- `/src/app/(dashboard)/interviews/page.tsx`
- `/src/app/(dashboard)/recruiters/page.tsx`

### Types
- `/src/types/api.ts` (updated with Recruiter types)

## Testing Recommendations

1. **Unit Tests**: Form validation, component rendering
2. **Integration Tests**: Hook interactions with mock API
3. **E2E Tests**: Page flows (schedule → view prep notes, search → send message)
4. **API Contract Tests**: Ensure endpoints match hook assumptions

## Documentation

- Each file has author attribution: `Author: Ahmed Adel Bakr Alderai`
- Component props exported as interfaces
- Hook functions have JSDoc comments
- Form schema defined with Zod for clarity

---

**Last Updated**: March 2026
**Version**: 1.0
