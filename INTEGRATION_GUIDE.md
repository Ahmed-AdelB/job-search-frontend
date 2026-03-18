# Operations Pages - Integration Guide

**Created:** March 19, 2026
**Author:** Ahmed Adel Bakr Alderai

## Quick Start

### 4 Pages Created (Ready to Use)
1. **Deploy** - `/dashboard/deploy` - Deployment monitoring and control
2. **Logs** - `/dashboard/logs` - Real-time system log viewer
3. **Notifications** - `/dashboard/notifications` - Alert management
4. **Admin** - `/dashboard/admin` - Tenant and system administration

## Frontend Integration Steps

### Step 1: Update Sidebar Navigation
Add to `src/components/layout/sidebar.tsx`:

```typescript
import { Rocket, FileText, Bell, Shield } from "lucide-react"

// In navigation items array:
{
  title: "Operations",
  items: [
    {
      title: "Deploy",
      href: "/dashboard/deploy",
      icon: Rocket,
    },
    {
      title: "Logs",
      href: "/dashboard/logs",
      icon: FileText,
    },
    {
      title: "Notifications",
      href: "/dashboard/notifications",
      icon: Bell,
    },
    {
      title: "Admin",
      href: "/dashboard/admin",
      icon: Shield,
    },
  ]
}
```

### Step 2: Add Types to API
Update `src/types/api.ts` with types from INTEGRATION_CHECKLIST.md

### Step 3: Test Pages
```bash
npm run dev
# Navigate to:
# http://localhost:3000/dashboard/deploy
# http://localhost:3000/dashboard/logs
# http://localhost:3000/dashboard/notifications
# http://localhost:3000/dashboard/admin
```

---

## Backend Integration Checklist

### Required API Endpoints (16 total)

#### Deploy (4 endpoints)
- `GET /api/deploy/status`
- `GET /api/deploy/history`
- `POST /api/deploy/rebuild`
- `POST /api/deploy/rollback`

#### Logs (1 endpoint)
- `GET /api/logs?level=&agent=&search=&limit=&offset=`

#### Alerts (3 endpoints)
- `GET /api/alerts`
- `PUT /api/alerts/{id}/read`
- `PUT /api/alerts/read-all`

#### Admin (8 endpoints)
- `GET /api/admin/tenants`
- `POST /api/admin/tenants`
- `GET /api/admin/health`
- `POST /api/admin/maintenance/clean-tasks`
- `GET /api/admin/mcp`
- `GET /api/admin/trash`
- `POST /api/admin/trash/{id}/restore`
- `POST /api/admin/trash/{id}/delete`

### Response Format Reference
See `API_RESPONSE_EXAMPLES.md` for exact JSON response structures

### Implementation Priority
1. **HIGH**: Deploy status, Logs, Notifications (user-facing)
2. **MEDIUM**: Admin tenants, Health monitoring
3. **LOW**: MCP debug, Trash management

---

## File Locations

```
frontend/
├── src/app/(dashboard)/
│   ├── deploy/
│   │   └── page.tsx           [11 KB] Deploy management
│   ├── logs/
│   │   └── page.tsx           [12 KB] Real-time logs
│   ├── notifications/
│   │   └── page.tsx           [10 KB] Alert management
│   └── admin/
│       └── page.tsx           [22 KB] System admin
│
├── OPERATIONS_PAGES_README.md  Feature documentation
├── API_RESPONSE_EXAMPLES.md    API response examples
└── INTEGRATION_GUIDE.md        This file
```

---

## Dark Mode Support

All pages are fully dark-mode compatible using Tailwind's `dark:` prefix:
- Color-coded status indicators work in both themes
- Logs viewer uses dark background in both modes
- Cards and borders adjust appropriately
- Text contrast meets WCAG AA standards

---

## Responsive Design

All pages are mobile-first with breakpoints:
- **Mobile**: Full width, single column
- **Tablet** (md): Two-column layouts
- **Desktop** (lg): Three+ column layouts

Example responsive grid:
```tsx
<div className="grid gap-4 md:grid-cols-3">
  {/* Stacks on mobile, 3 columns on desktop */}
</div>
```

---

## Performance Optimizations

1. **Data Fetching**
   - TanStack Query caching
   - Auto-refresh intervals (2-5 seconds)
   - Pagination for logs

2. **Rendering**
   - Code splitting via Next.js
   - Lazy component loading
   - Memoization where needed

3. **Styling**
   - Tailwind CSS purged builds
   - Minimal CSS in-JS

---

## Error Handling Pattern

All pages follow this pattern:
```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ["endpoint"],
  queryFn: async () => await apiGet("/api/endpoint")
})

if (error) {
  toast.error("Failed to load", {
    description: error.message
  })
}
```

---

## Real-Time Updates

Auto-refresh intervals:
- Deploy status: Every 5 seconds
- Logs: Every 2 seconds
- Notifications: Every 5 seconds
- Admin sections: On-demand

---

## Type Safety

All API calls are fully typed using TypeScript interfaces. Types are defined in:
- `src/types/api.ts` - Main API types
- Individual page files - Component-specific types

Example:
```typescript
const { data } = useQuery<DeployStatus>({
  queryKey: ["deploy-status"],
  queryFn: () => apiGet<DeployStatus>("/api/deploy/status")
})
```

---

## Authentication & Authorization

- All endpoints require JWT token (automatically handled)
- Admin endpoints require admin role (backend enforces)
- Sensitive operations are logged for audit

---

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Android)

---

## Known Issues & Workarounds

### Issue: Toast notifications not appearing
**Solution**: Ensure `<Toaster />` is in root layout

### Issue: Query data not refetching
**Solution**: Check `queryKey` - must match exactly with dependent filters

### Issue: Dark mode not applying
**Solution**: Ensure `dark:` classes are in CSS and Tailwind config includes dark mode

---

## Testing Tips

### Mock API Responses
```typescript
// In test files
jest.mock("@/lib/api-client", () => ({
  apiGet: jest.fn().mockResolvedValue({
    logs: [],
    stats: { /* ... */ }
  })
}))
```

### Test Real-Time Updates
```typescript
vi.useFakeTimers()
// Advance timers to trigger refetch
vi.advanceTimersByTime(5000)
await waitFor(() => expect(refetch).toHaveBeenCalled())
```

---

## Monitoring & Logging

All pages emit console logs for debugging:
```typescript
// Enable browser console to see:
// - API calls
// - Query state changes
// - Error events
// - Component lifecycle
```

---

## Accessibility Features

- Semantic HTML structure
- ARIA labels where needed
- Keyboard navigation support
- High contrast in light/dark modes
- Skip navigation links
- Focus indicators

---

## Security Considerations

1. **Token Storage**: JWT stored in localStorage (consider sessionStorage for higher security)
2. **CORS**: Should be configured on backend
3. **CSRF**: CSRF tokens should be included in mutation requests
4. **Input Validation**: All inputs validated on backend
5. **SQL Injection**: Use parameterized queries on backend

---

## Performance Metrics

**Page Load Times** (target):
- Deploy: < 1.5s
- Logs: < 2s
- Notifications: < 1s
- Admin: < 2s

**Network**:
- Deploy status: ~2KB
- Logs (100 entries): ~50KB
- Notifications: ~10KB
- Admin data: ~30KB

---

## Future API Considerations

- Implement WebSocket for real-time logs
- Add GraphQL option alongside REST
- Batch API requests for efficiency
- Implement server-sent events (SSE)
- Add request caching headers

---

## Debugging Checklist

If pages aren't loading:
1. Check browser console for errors
2. Verify API endpoints exist and respond
3. Confirm JWT token in localStorage
4. Check CORS headers
5. Review TanStack Query devtools (`@tanstack/react-query-devtools`)
6. Inspect Network tab for failed requests

---

**Total Implementation Time**: ~4-6 hours for backend APIs

**Files Ready**: 4 pages + 3 documentation files
**Status**: Frontend complete, awaiting backend APIs
