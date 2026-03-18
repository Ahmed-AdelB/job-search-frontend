# Intelligence Hub - Dependencies & Setup

## Required Packages (Already Installed)

### UI Components (shadcn/ui)
- `Card` - Container component
- `Button` - Button component with variants
- `Badge` - Status/importance badges
- `Input` - Form inputs
- `Label` - Form labels
- `Table` - Data table components

### Data Visualization
- `recharts` - Charts library (BarChart, RadarChart, PieChart, etc.)
- `react-circular-progressbar` - Circular progress visualization
  - CSS import: `"react-circular-progressbar/dist/styles.css"`

### State Management & Data Fetching
- `@tanstack/react-query` - TanStack Query for API calls
- `sonner` - Toast notifications

### Icons
- `lucide-react` - Icon library
  - Icons used:
    - `Zap` - Skill/energy icon
    - `Globe` - Visa/world icon
    - `Wifi` - Remote work icon
    - `TrendingUp` - Salary/growth icon
    - `ArrowRight` - Navigation arrows
    - `ArrowLeft` - Back button
    - `AlertCircle` - Info/warning
    - `CheckCircle` - Success indicator
    - `BookOpen` - Learning icon
    - `Download` - PDF export
    - `MapPin` - Location
    - `Loader2` - Loading spinner

## Component Usage Examples

### Recharts Radar Chart
```typescript
<RadarChart data={data}>
  <PolarGrid />
  <PolarAngleAxis dataKey="skill" />
  <PolarRadiusAxis domain={[0, 100]} />
  <Radar name="Required" dataKey="required" stroke="hsl(var(--primary))" />
  <Radar name="Possessed" dataKey="possessed" stroke="hsl(34 97% 53%)" />
  <Legend />
  <Tooltip />
</RadarChart>
```

### Circular Progress Bar
```typescript
import { CircularProgressbar, buildStyles } from "react-circular-progressbar"

<CircularProgressbar
  value={75}
  text="75%"
  styles={buildStyles({
    rotation: 0.25,
    strokeLinecap: "round",
    textSize: "1.5rem",
    pathColor: "hsl(var(--primary))",
    textColor: "currentColor",
    trailColor: "var(--muted)",
  })}
/>
```

### React Query Hook Pattern
```typescript
export function useSkillGap(jobId?: number) {
  return useMutation({
    mutationFn: (params) => apiPost<SkillGapAnalysis>("/api/skills-gap/analyze", params),
    onError: () => toast.error("Failed to analyze skill gap"),
  })
}
```

## Tailwind CSS Classes Used

### Spacing
- `space-y-4`, `space-y-6`, `space-y-8` - Vertical spacing
- `gap-2`, `gap-4`, `gap-6` - Grid gaps
- `p-4`, `p-6`, `p-8` - Padding
- `pt-4`, `mt-4` - Top padding/margin
- `px-4` - Horizontal padding

### Sizing
- `h-screen` - Full viewport height
- `w-full` - Full width
- `h-[400px]` - Custom height
- `md:col-span-2` - Grid spans

### Colors
- `text-muted-foreground` - Secondary text
- `bg-muted/50` - Hover backgrounds
- `border` - Border color
- `text-blue-600` - Theme colors
- `dark:text-blue-400` - Dark mode variants

### Flex/Grid
- `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3` - Responsive grids
- `flex items-center justify-between` - Flex layouts
- `flex-1` - Flexible growth

### Utilities
- `transition-all duration-200` - Smooth transitions
- `rounded-lg` - Border radius
- `hover:` - Hover states
- `dark:` - Dark mode variants

## API Hooks Setup

All hooks are in `/src/hooks/use-intelligence.ts`:

```typescript
// Import in your components
import {
  useSkillGap,
  useSkillRecommendations,
  useVisaScore,
  useEligibleOccupations,
  useSalaryBenchmark,
  useSalaryReport,
  useRemoteScore,
  useSalaryReportPDF,
} from "@/hooks/use-intelligence"
```

## Environment Variables

The API client uses:
- `NEXT_PUBLIC_API_URL` - API base URL (default: http://localhost:8082)

Update in `.env.local` if needed.

## Type Safety

All TypeScript types are defined in `/src/types/api.ts`:
- `SkillGapAnalysis`
- `VisaScore`
- `SalaryBenchmark`
- `RemoteScore`

## Dark Mode

All components use CSS variables for theming:
- `--background` - Page background
- `--foreground` - Text color
- `--primary` - Primary brand color
- `--border` - Border color
- `--muted` - Muted backgrounds

Works automatically with system/user preference.

## Testing

Demo data is hardcoded in each component for testing:
- `/intelligence` - Dashboard stats
- `/intelligence/skills` - 6 skills with 3 missing
- `/intelligence/visa` - 7 eligible countries
- `/intelligence/salary` - 4 salary percentiles
- `/intelligence/remote` - 5 recent jobs + distribution

Replace demo data with real API responses to connect backend.

## Accessibility

Components include:
- Semantic HTML (`<table>`, `<button>`)
- ARIA labels in tables
- Form labels with `htmlFor`
- Keyboard navigation on buttons
- Color + text for status indicators

## Performance

- Recharts: Lazy loaded, renders only visible data
- React Query: Caching with staleTime settings
- Circular Progress: Uses CSS animations
- Responsive Images: Icons are SVG (lightweight)

## Troubleshooting

### Radar Chart not rendering
- Ensure ResponsiveContainer is imported from recharts
- Data array must be present and valid
- Check PolarGrid, PolarAngleAxis are included

### Progress bars not displaying
- Check tailwind height classes (h-2, h-3)
- Ensure parent has width constraint
- Calculate percentage correctly (width: `${percent}%`)

### Dark mode not working
- Verify `dark:` class variants are used
- Check system dark mode is enabled
- Test with `prefers-color-scheme` CSS

## Author
Ahmed Adel Bakr Alderai
