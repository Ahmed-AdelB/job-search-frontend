# Quick Start - Analytics & Settings Pages

**Author:** Ahmed Adel Bakr Alderai

## Routes

Navigate to:
- **Analytics:** `http://localhost:3000/dashboard/analytics`
- **Settings:** `http://localhost:3000/dashboard/settings`

## Features at a Glance

### Analytics Dashboard
- 6 key metric cards (jobs, apps, interviews, offers, success rate, response time)
- 4 interactive chart rows
- Date range selector (7d, 30d, 90d, all)
- Real-time data from `/api/v1/analytics/*` endpoints

### Settings Panel
- 5 organized tabs
- Form validation with Zod
- Auto-save with React Query mutations
- Toast notifications for feedback
- Import/Export settings as JSON

## Backend API Requirements

Ensure your backend has these endpoints:

```bash
# Analytics
GET /api/v1/analytics/overview
GET /api/v1/analytics/funnel
GET /api/v1/analytics/by-ats
GET /api/v1/analytics/timeline?days=30
GET /api/v1/analytics/sources
GET /api/v1/analytics/companies

# Settings
GET  /api/v1/settings
PUT  /api/v1/settings
PUT  /api/v1/settings/general
PUT  /api/v1/settings/pipeline
PUT  /api/v1/settings/llm
PUT  /api/v1/settings/notifications
PUT  /api/v1/settings/advanced
```

## Code Architecture

### Hooks
```typescript
// /src/hooks/use-analytics.ts
import { useAnalyticsOverview, useFunnel, useByATS, useTimeline, useTopSources, useTopCompanies } from '@/hooks/use-analytics'

// /src/hooks/use-settings.ts
import { useSettings, useUpdateGeneralSettings, useUpdatePipelineSettings, useUpdateLLMConfig, useUpdateNotificationSettings, useUpdateAdvancedSettings } from '@/hooks/use-settings'
```

### Pages
```typescript
// /src/app/(dashboard)/analytics/page.tsx
// Client component with chart visualizations

// /src/app/(dashboard)/settings/page.tsx
// Client component with 5 tabbed forms
```

## Key Components Used

**UI Components:**
- Card, Button, Input, Select, Label, Tabs

**Charts:**
- BarChart, PieChart, LineChart from Recharts
- Custom SuccessChart, PipelineChart components

**Form Libraries:**
- React Hook Form + Zod validation
- @hookform/resolvers for Zod integration

**State Management:**
- React Query for server state
- Zustand (usePreferencesStore) for client state

## Common Tasks

### Add a New Setting
1. Add type to `use-settings.ts`
2. Add Zod schema
3. Add form field in settings/page.tsx
4. Add mutation hook if needed

### Add a New Chart
1. Fetch data with custom hook in `use-analytics.ts`
2. Add chart component in `analytics/page.tsx`
3. Transform data as needed
4. Add loading + empty states

### Update Form Validation
```typescript
// In use-settings.ts or settings/page.tsx
const mySchema = z.object({
  field: z.string().min(1),
  number: z.number().positive(),
  array: z.array(z.string()),
});
```

## Styling Notes

- **Responsive Breakpoints:** Mobile (sm) → Tablet (md) → Desktop (lg)
- **Dark Mode:** Built-in via Tailwind, Recharts colors manually mapped
- **Spacing:** Uses Tailwind `space-y-*` and `gap-*` utilities
- **Colors:** Custom HSL values for Recharts, Tailwind classes for UI

## Testing Endpoints

Use curl or Postman:

```bash
# Test analytics
curl http://localhost:8082/api/v1/analytics/overview \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test settings
curl http://localhost:8082/api/v1/settings \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Troubleshooting

**Charts not loading:**
- Check `/api/v1/analytics/*` endpoints return correct JSON
- Verify date range format (use `days=-1` for "all")

**Settings not saving:**
- Ensure `/api/v1/settings/*` endpoints are implemented
- Check authorization headers
- Verify request body matches expected types

**Form validation errors:**
- Check console for Zod validation errors
- Verify input types match schema (number vs string)

**Responsive issues:**
- Check Tailwind config includes responsive breakpoints
- Use browser DevTools to test viewport sizes

## Next Steps

1. **Connect Backend:** Implement missing API endpoints
2. **Test Flows:** Use date range selector, submit forms
3. **Error Handling:** Implement error fallbacks
4. **Add Analytics:** Extend with more charts/metrics
5. **Customize:** Brand colors, add company logo to charts

---

**Need help?** Check `ANALYTICS_SETTINGS_BUILD.md` for detailed documentation.
