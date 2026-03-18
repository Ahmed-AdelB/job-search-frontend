# Jobs & Applications Integration Checklist

## Pre-Deployment Verification

### 1. Dependencies
- [x] `@tanstack/react-query` - Data fetching
- [x] `@tanstack/react-table` - Table logic
- [x] `@base-ui/react` - Base UI components
- [x] `lucide-react` - Icons
- [x] `sonner` - Toast notifications
- [x] `class-variance-authority` - CVA for styling
- [x] `clsx` / `classnames` - Conditional classes

### 2. File Structure
- [x] `src/hooks/use-jobs.ts` - Jobs hooks
- [x] `src/hooks/use-applications.ts` - Applications hooks
- [x] `src/hooks/index.ts` - Updated exports
- [x] `src/components/jobs/job-table.tsx` - Jobs table
- [x] `src/components/jobs/job-filters.tsx` - Jobs filters
- [x] `src/components/jobs/job-card.tsx` - Job card
- [x] `src/components/jobs/index.ts` - Jobs exports
- [x] `src/components/applications/applications-table.tsx` - Apps table
- [x] `src/components/applications/index.ts` - Apps exports
- [x] `src/components/ui/checkbox.tsx` - New checkbox
- [x] `src/app/(dashboard)/jobs/page.tsx` - Jobs page
- [x] `src/app/(dashboard)/applications/page.tsx` - Apps page

### 3. API Endpoints Required

**Jobs API:**
```
GET /api/jobs
  Query params: page, per_page, status, source, min_score, remote_type, search, sort_by, sort_order
  Response: { jobs: Job[], total: number, page: number, per_page: number }

GET /api/jobs/{id}
  Response: Job

PATCH /api/jobs/{id}
  Body: { status: string, ... }
  Response: Job

PUT /api/jobs/bulk-action
  Body: { action: string, job_ids: number[], ... }
  Response: { count: number }

DELETE /api/jobs/{id}
  Response: 204 No Content
```

**Applications API:**
```
GET /api/applications
  Query params: status, job_id, page, per_page, sort_by, sort_order
  Response: { applications: Application[], total: number, page: number, per_page: number }

GET /api/applications/{id}
  Response: Application

PATCH /api/applications/{id}
  Body: { status: string, notes?: string, ... }
  Response: Application

POST /api/applications/{id}/withdraw
  Body: {}
  Response: Application
```

### 4. Type Definitions
- [x] `Job` interface - All fields defined
- [x] `JobsResponse` interface - List response format
- [x] `JobFilters` interface - Filter options
- [x] `Application` interface - All fields defined
- [x] `ApplicationsResponse` interface - List response
- [x] `ApplicationFilters` interface - Filter options

### 5. UI Components Available
- [x] Button
- [x] Card
- [x] Input
- [x] Select
- [x] Badge
- [x] Table
- [x] Tabs
- [x] Checkbox (NEW)
- [x] DropdownMenu
- [x] Sheet
- [x] Dialog (available if needed)
- [x] Alert (available if needed)

### 6. Shared Components Available
- [x] EmptyState
- [x] TableSkeleton / StatSkeleton
- [x] StatusBadge

### 7. Navigation

Update sidebar/navigation to include:
```typescript
// Add to navigation menu
{
  name: "Jobs",
  path: "/jobs",
  icon: Briefcase,
}
{
  name: "Applications",
  path: "/applications",
  icon: FileText,
}
```

### 8. Testing Notes

Before deployment test:

**Jobs Page:**
- [ ] Navigate to `/jobs` - Should show job queue
- [ ] Filter by status - Query params should update
- [ ] Search with text - Debounce working
- [ ] Adjust min score slider - Filters apply
- [ ] Click job row - Should expand
- [ ] Select multiple jobs - Bulk action bar shows
- [ ] Click "Apply to Selected" - Toast shows success
- [ ] Click delete - Confirmation dialog
- [ ] Pagination works - Next/Previous buttons
- [ ] Sorting on columns - Arrow icon updates
- [ ] Mobile view - Filters in sheet
- [ ] Dark mode - Colors readable

**Applications Page:**
- [ ] Navigate to `/applications` - Shows all apps
- [ ] Stats grid loads - Shows correct counts
- [ ] Click status tab - Filters correctly
- [ ] Click application row - Expands to show details
- [ ] Click "Withdraw" - Confirmation dialog
- [ ] Click "Delete" - Confirmation dialog
- [ ] Pagination works
- [ ] Mobile tabs are readable
- [ ] Dark mode colors correct

### 9. Common Issues & Solutions

**Issue:** Checkbox not rendering
- **Solution:** Verify `@base-ui/react` is installed and imports work

**Issue:** Table not sorting
- **Solution:** Check TanStack React Table version compatibility

**Issue:** Toast not showing
- **Solution:** Verify `sonner` is installed and `<Sonner />` component is in layout

**Issue:** Styles not applying
- **Solution:** Clear `.next` and rebuild: `npm run build`

**Issue:** API 401 errors
- **Solution:** Check JWT token in localStorage, verify auth is working

### 10. Performance Optimization

Current optimizations:
- [x] Debounced search (500ms)
- [x] Pagination reduces data size
- [x] Lazy loaded expandable rows
- [x] Memoized callbacks in pages
- [x] Query stale times configured (30s list, 60s detail)

Potential future improvements:
- Virtual scrolling for very large lists
- Search history in localStorage
- Filter presets
- Caching of frequently accessed jobs

### 11. Accessibility Checklist

- [x] Checkbox has proper labels
- [x] Status badges use semantic colors
- [x] Buttons have proper ARIA labels
- [x] Table headers are semantic
- [x] Color not sole indicator (includes text)
- [x] Proper contrast ratios
- [x] Keyboard navigation supported

### 12. Configuration

Verify in `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8082
```

### 13. Build & Deployment

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

### 14. Monitoring

After deployment, monitor:
- API response times
- Error rates in job/application pages
- User interactions with filters
- Mobile vs desktop usage
- Dark mode toggle usage

## Sign-Off

- [ ] All files present
- [ ] API endpoints verified
- [ ] Manual testing complete
- [ ] Dark mode tested
- [ ] Mobile responsive verified
- [ ] Performance acceptable
- [ ] No console errors
- [ ] Ready for deployment

---

**Notes:**
- All code is TypeScript strict mode compatible
- Components follow shadcn/ui patterns
- Styling uses Tailwind CSS v4
- Dark mode support included
- Fully responsive design
- Author: Ahmed Adel Bakr Alderai
