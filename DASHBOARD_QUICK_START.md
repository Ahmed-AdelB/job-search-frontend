# Dashboard Quick Start Guide

**Author:** Ahmed Adel Bakr Alderai
**Last Updated:** March 19, 2026

## What Was Built

A complete Next.js dashboard with real-time job search analytics and agent management system.

### Components Created

| Component | Purpose | Location |
|-----------|---------|----------|
| Pipeline Chart | Funnel bar chart (Discovered→Applied) | `components/charts/pipeline-chart.tsx` |
| Success Chart | 30-day success rate trend | `components/charts/success-chart.tsx` |
| ATS Chart | Application distribution by platform | `components/charts/ats-chart.tsx` |
| Agent Card | Individual agent status & control | `components/agents/agent-card.tsx` |
| Agent Grid | Responsive grid of agent cards | `components/agents/agent-grid.tsx` |
| Agent Config Modal | Agent settings dialog | `components/agents/agent-config-modal.tsx` |
| Dashboard Home | Main stats & analytics page | `app/(dashboard)/page.tsx` |
| Agents Page | Agent management & control hub | `app/(dashboard)/agents/page.tsx` |

---

## Pages

### `/dashboard` (Home)
Shows job search metrics, charts, and agent status overview.

**Sections:**
- 4 stat cards (Total Jobs, Applications, Interviews, Offers)
- Pipeline funnel chart
- Success rate trend chart
- ATS distribution chart
- Agent status summary

### `/dashboard/agents` (Control)
Manage and monitor all automation agents.

**Sections:**
- Summary stats (running, stopped, paused, errors)
- Bulk actions (Start All, Stop All)
- Search and filter
- Agent grid with individual controls

---

## Key Features

### 1. Real-Time Data
- React Query caching with auto-refetch (every 15-60 seconds)
- SSE (Server-Sent Events) for live agent updates
- Toast notifications for all operations

### 2. Charts
- **Pipeline Funnel**: Shows job conversion stages with color gradient
- **Success Rate**: 30-day trend line with daily data points
- **ATS Distribution**: Donut chart of applications by platform

### 3. Agent Management
- View agent status (running/stopped/paused/error)
- Control agents (start/stop/pause/resume/run-now)
- Configure poll intervals and custom settings
- Bulk operations (start/stop all agents)
- Circuit breaker state visualization

### 4. Search & Filter
- Search agents by name
- Filter by status (running, stopped, error)
- Real-time result updates

### 5. Responsive Design
- Mobile: 1 column layout
- Tablet: 2 columns
- Desktop: 3-4 columns
- Dark mode compatible

---

## API Endpoints Required

### Dashboard Home
```bash
GET /api/pipeline/status         # Job pipeline stats
GET /api/analytics/overview      # Analytics data
GET /api/analytics/funnel        # Funnel stages
GET /api/agents/status           # All agents status
```

### Agent Control
```bash
GET /api/agents/status           # All agents (refetch every 15s)
POST /api/agents/{name}/start    # Start agent
POST /api/agents/{name}/stop     # Stop agent
POST /api/agents/{name}/pause    # Pause agent
POST /api/agents/{name}/resume   # Resume agent
POST /api/agents/{name}/run-now  # Run immediately
POST /api/agents/start-all       # Bulk start
POST /api/agents/stop-all        # Bulk stop
GET /api/agents/{name}/config    # Get config
POST /api/agents/{name}/config   # Update config
SSE /api/agents/events           # Real-time updates
```

---

## Data Types

All types are in `/src/types/api.ts`

### PipelineStats
```typescript
{
  total_jobs: number
  total_applied: number
  total_interviews: number
  total_offers: number
  success_rate: number         // 0-1
  avg_score: number            // 0-100
  jobs_today: number
  applications_today: number
}
```

### AnalyticsOverview
```typescript
{
  total_jobs_discovered: number
  total_applications: number
  total_interviews: number
  total_offers: number
  application_success_rate: number
  avg_response_time_days: number
  top_sources: Array<{ source: string; count: number }>
  top_companies: Array<{ company: string; count: number }>
  daily_activity: Array<{ date: string; jobs: number; applications: number }>
}
```

### FunnelData
```typescript
{
  stage: string       // "discovered", "scored", "applied", etc.
  count: number
  percentage: number
}
```

### Agent
```typescript
{
  name: string
  display_name: string
  status: "running" | "stopped" | "paused" | "error" | "starting"
  poll_interval: number          // seconds
  last_run?: string              // ISO datetime
  next_run?: string              // ISO datetime
  consecutive_failures: number
  circuit_state: "closed" | "open" | "half_open"
  total_runs: number
  total_errors: number
  config?: Record<string, unknown>
}
```

---

## Hooks Used

All hooks are in `/src/hooks/`

### Dashboard Hooks
```typescript
import {
  usePipelineStats,
  useAnalyticsOverview,
  useFunnelData
} from "@/hooks/use-dashboard"

// Usage
const { data: stats, isLoading } = usePipelineStats()
const { data: analytics } = useAnalyticsOverview()
const { data: funnel } = useFunnelData()
```

### Agent Hooks
```typescript
import {
  useAgents,
  useAgentAction,
  useAgentConfig,
  useUpdateAgentConfig
} from "@/hooks/use-agents"

// Usage
const { data: agents } = useAgents()
const { mutate } = useAgentAction(name, action)
const { data: config } = useAgentConfig(name)
const { mutateAsync } = useUpdateAgentConfig(name)
```

### SSE Hook
```typescript
import { useSSE } from "@/hooks/use-sse"

// Usage
useSSE("/api/agents/events", (data) => {
  // Handle real-time update
  console.log(data)
})
```

---

## Testing Locally

### 1. Start Dev Server
```bash
npm run dev
```

### 2. Mock API (if backend not ready)
Create a hook that returns mock data:

```typescript
// Example mock data in use-dashboard.ts
if (process.env.NODE_ENV === "development") {
  return {
    data: {
      total_jobs: 150,
      total_applied: 45,
      total_interviews: 8,
      total_offers: 2,
      success_rate: 0.25,
      avg_score: 75,
      jobs_today: 5,
      applications_today: 2,
    },
    isLoading: false,
  }
}
```

### 3. Visit Pages
- **Home**: http://localhost:3000/dashboard
- **Agents**: http://localhost:3000/dashboard/agents

---

## Styling

### Colors (CSS Variables)
```
Primary Blue:    hsl(217.2 91.2% 59.8%)
Success Green:   hsl(142.1 76.2% 36.3%)
Warning Amber:   hsl(38.7 92.1% 50.2%)
Error Red:       hsl(0 84.2% 60.2%)
```

### Layout
- Page sections: `gap-6`
- Card padding: `p-6`
- Stats grid: `md:grid-cols-2 lg:grid-cols-4`
- Charts: `lg:grid-cols-2`

### Components
All components use:
- shadcn/ui for base components
- Tailwind CSS for styling
- Recharts for charts
- Lucide icons for icons

---

## Common Tasks

### Add a New Stat Card
```typescript
// In dashboard/page.tsx
{
  label: "New Stat",
  value: data?.new_field || 0,
  trend: data?.new_trend,
  icon: <NewIcon className="h-4 w-4" />,
  color: "blue"
}
```

### Add a New Agent Action
```typescript
// In agent-card.tsx
<DropdownMenuItem onClick={() => handleAction("new-action")}>
  <IconComponent className="h-3 w-3" />
  New Action
</DropdownMenuItem>
```

### Customize Chart Colors
```typescript
// In pipeline-chart.tsx
const colors = [
  "hsl(217.2 91.2% 59.8%)",  // Blue
  "hsl(142.1 76.2% 36.3%)",  // Green
  // ... add more colors
]
```

### Add Chart Filtering
```typescript
// In dashboard/page.tsx
const [dateRange, setDateRange] = useState("30d")

// Pass to chart
<SuccessChart data={filterByDateRange(data, dateRange)} />
```

---

## Troubleshooting

### Charts Not Rendering
- ✅ Check data is not null/undefined
- ✅ Verify Recharts is installed
- ✅ Check ResponsiveContainer has height

### Agent Actions Not Working
- ✅ Verify auth token in localStorage
- ✅ Check API endpoint is correct
- ✅ Check response status in network tab

### Real-Time Updates Not Working
- ✅ Verify SSE endpoint exists
- ✅ Check browser console for errors
- ✅ Verify refetchInterval in useAgents

### Styling Looks Wrong
- ✅ Check Tailwind CSS is imported
- ✅ Verify dark mode class on html element
- ✅ Check CSS variables in globals.css

---

## Performance Tips

1. **Data Fetching**
   - Use React Query caching (already configured)
   - Adjust refetchInterval based on needs

2. **Rendering**
   - Use `useMemo()` for expensive calculations (already done)
   - Avoid re-renders with proper dependencies

3. **Charts**
   - Use ResponsiveContainer for responsive sizing
   - Limit data points (30-day window already set)

4. **Images**
   - Use Next.js Image component
   - Add proper sizes prop

---

## Next Steps

1. **Connect Backend**
   - Replace mock data with real API calls
   - Verify all endpoints return expected types

2. **Add Features**
   - Agent logs viewer
   - Export analytics reports
   - Custom dashboards

3. **Optimize**
   - Add loading indicators
   - Optimize chart rendering
   - Add error boundaries

4. **Test**
   - Unit tests for components
   - Integration tests with API
   - E2E tests for workflows

---

## File Manifest

```
src/
├── app/(dashboard)/
│   ├── page.tsx                    (310 lines) - Home dashboard
│   ├── agents/page.tsx             (290 lines) - Agent control
│   └── layout.tsx                  (existing)
├── components/
│   ├── charts/
│   │   ├── pipeline-chart.tsx      (100 lines)
│   │   ├── success-chart.tsx       (105 lines)
│   │   └── ats-chart.tsx           (120 lines)
│   └── agents/
│       ├── agent-card.tsx          (180 lines)
│       ├── agent-grid.tsx          (60 lines)
│       └── agent-config-modal.tsx  (140 lines)
└── hooks/
    ├── use-dashboard.ts            (existing)
    ├── use-agents.ts               (existing)
    └── use-sse.ts                  (existing)
```

---

## Support

For issues or questions:
1. Check `/src/types/api.ts` for type definitions
2. Review hook implementations in `/src/hooks/`
3. Check component props and interfaces
4. Review API integration in network tab

---

**Status**: ✅ Ready for backend integration
**Last Build**: March 19, 2026
