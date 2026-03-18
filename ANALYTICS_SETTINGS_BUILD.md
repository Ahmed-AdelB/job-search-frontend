# Analytics & Settings Pages - Build Documentation

**Author:** Ahmed Adel Bakr Alderai
**Date:** 2026-03-19
**Project:** JobFlow Frontend (Next.js 16, React 19, TypeScript)

## Overview

This document describes the comprehensive Analytics and Settings pages built for the JobFlow frontend application. Both pages are fully functional client components with React Query integration, form handling via React Hook Form + Zod validation, and responsive Recharts visualizations.

## Files Created

### 1. Custom Hooks

#### `/src/hooks/use-analytics.ts` (2.5 KB)
React Query hooks for fetching analytics data from the backend API.

**Exported Functions:**
- `useAnalyticsOverview()` - GET `/api/v1/analytics/overview`
  - Returns total jobs, applications, interviews, offers, success rate, response time
  - 5-minute stale time, 10-minute cache duration

- `useFunnel()` - GET `/api/v1/analytics/funnel`
  - Returns application stages with count and percentage

- `useByATS()` - GET `/api/v1/analytics/by-ats`
  - Returns application distribution by ATS system (Workday, Greenhouse, Lever, etc.)

- `useTimeline(days)` - GET `/api/v1/analytics/timeline?days=`
  - Accepts: 7, 30, 90, or "all" (maps to -1 in query)
  - Returns daily discovered jobs, applications, and success rate
  - Used for trend charts and heatmaps

- `useTopSources()` - GET `/api/v1/analytics/sources`
  - Returns top job sources (LinkedIn, Indeed, etc.) with counts and percentages

- `useTopCompanies()` - GET `/api/v1/analytics/companies`
  - Returns top companies by application count with success rates

**Type Definitions:**
```typescript
interface AnalyticsOverview {
  total_jobs_discovered: number;
  total_applications: number;
  total_interviews: number;
  total_offers: number;
  application_success_rate: number;
  avg_response_time_days: number;
}

interface ATSData {
  ats_type: string;
  count: number;
  percentage: number;
}

interface TimelineData {
  date: string;
  jobs_discovered: number;
  applications: number;
  success_rate: number;
}

interface SourceData {
  source: string;
  count: number;
  percentage: number;
}

interface CompanyData {
  company: string;
  count: number;
  applications: number;
  success_rate: number;
}
```

---

#### `/src/hooks/use-settings.ts` (5.3 KB)
React Query hooks for managing user settings with mutation support.

**Query Hooks:**
- `useSettings()` - GET `/api/v1/settings`
  - Fetches all settings at once
  - 10-minute stale time

- `useLLMConfig()` - GET `/api/v1/settings/llm`
  - Separate query for LLM configuration

**Mutation Hooks (auto-toast + cache update):**
- `useUpdateSettings()` - PUT `/api/v1/settings`
  - Updates all settings at once

- `useUpdateGeneralSettings()` - PUT `/api/v1/settings/general`
  - Updates: theme, language, timezone, notifications_enabled

- `useUpdatePipelineSettings()` - PUT `/api/v1/settings/pipeline`
  - Updates: max_applications_per_day, auto_apply_min_score, locations, excluded_companies, remote_types

- `useUpdateLLMConfig()` - PUT `/api/v1/settings/llm`
  - Updates: provider, model, temperature, api_key

- `useUpdateNotificationSettings()` - PUT `/api/v1/settings/notifications`
  - Updates: email_notifications, status_updates, interview_reminders, daily_digest, email

- `useUpdateAdvancedSettings()` - PUT `/api/v1/settings/advanced`
  - Updates: proxy config, rate limiting, debug mode

**Type Definitions:**
```typescript
interface GeneralSettings {
  theme: "light" | "dark" | "system";
  language: "en" | "ar";
  timezone: string;
  notifications_enabled: boolean;
}

interface PipelineSettings {
  max_applications_per_day: number;
  auto_apply_min_score: number;
  preferred_locations: string[];
  excluded_companies: string[];
  preferred_remote_types: string[];
}

interface LLMConfig {
  provider: "anthropic" | "openai" | "nvidia";
  model: string;
  temperature: number;
  api_key?: string;
}

interface NotificationSettings {
  email_notifications: boolean;
  application_status_updates: boolean;
  interview_reminders: boolean;
  daily_digest: boolean;
  notification_email: string;
}

interface AdvancedSettings {
  proxy_url?: string;
  proxy_username?: string;
  proxy_password?: string;
  rate_limit_per_minute: number;
  debug_mode: boolean;
}

interface AllSettings {
  general: GeneralSettings;
  pipeline: PipelineSettings;
  llm: LLMConfig;
  notifications: NotificationSettings;
  advanced: AdvancedSettings;
}
```

---

### 2. Analytics Page

**File:** `/src/app/(dashboard)/analytics/page.tsx` (17 KB)

**Route:** `/dashboard/analytics`
**Component Type:** Client Component (`"use client"`)

#### Features

1. **Date Range Selector**
   - Buttons: 7d, 30d, 90d, All
   - Dynamically updates all charts
   - State: `const [dateRange, setDateRange] = useState<7 | 30 | 90 | "all">(30)`

2. **Row 1: Key Statistics (6 Stat Cards)**
   - Total Jobs Discovered
   - Total Applications
   - Total Interviews
   - Total Offers
   - Success Rate (%)
   - Average Response Time (days)
   - Loading state: animated skeleton
   - Responsive grid: 1 col mobile → 2 cols tablet → 6 cols desktop

3. **Row 2: Application Funnel & Success Rate Trend**
   - **Left:** Vertical bar chart showing job conversion stages
     - Data from `useFunnel()`
     - Stages: Discovered → Viewed → Applied → Interviewed → Offered
   - **Right:** Line chart showing daily success rate trend
     - Data from `useTimeline()`
     - Success rate = applications / jobs_discovered
   - Responsive: 1 col mobile → 2 cols tablet+

4. **Row 3: ATS Distribution & Top Sources**
   - **Left:** Pie chart of applications by ATS system
     - Data from `useByATS()`
     - Workday, Greenhouse, Lever, SmartRecruiter, etc.
   - **Right:** Horizontal bar chart of top job sources
     - Data from `useTopSources()`
     - LinkedIn, Indeed, Glassdoor, company careers pages, etc.

5. **Row 4: Top Companies & Daily Activity**
   - **Left:** Scrollable table of top companies
     - Company name, app count, success rate
     - Displays top 8
   - **Right:** Dual-line chart showing daily jobs and applications
     - Blue line: Jobs discovered
     - Green line: Applications sent
     - Used for trend analysis

#### Styling & UX
- **Colors:** Uses Recharts with custom HSL colors matching Tailwind
  - Primary: `hsl(217.2 91.2% 59.8%)` (blue)
  - Success: `hsl(142.1 76.2% 36.3%)` (green)
  - Warning: `hsl(38.6 92.1% 50.2%)` (orange)
  - Error: `hsl(0 84.2% 60.2%)` (red)
- **Loading States:** Animated skeleton cards while data loads
- **Empty States:** Helpful messages when no data available
- **Responsive:** Mobile-first design, adapts to tablet and desktop
- **Dark Mode:** Full Tailwind dark mode support via Recharts theme colors

#### Data Transformations
```typescript
// Timeline → Success Rate Chart
const successData = timeline.map(d => ({
  date: d.date,
  rate: (d.applications / d.jobs_discovered) * 100,
  count: d.applications,
}))

// Timeline → Activity Heatmap
const activityData = timeline.map(d => ({
  date: d.date,
  jobs: d.jobs_discovered,
  applications: d.applications,
}))
```

---

### 3. Settings Page

**File:** `/src/app/(dashboard)/settings/page.tsx` (28 KB)

**Route:** `/dashboard/settings`
**Component Type:** Client Component (`"use client"`)

#### Features

Settings are organized into 5 tabs, each with dedicated forms and validation.

##### Tab 1: General Settings
**Schema Validation:** `generalSettingsSchema` (Zod)

**Fields:**
- **Theme** (Select)
  - Options: Light, Dark, System
  - Syncs with global `usePreferencesStore().setTheme()`
  - Triggers app-wide theme change

- **Language** (Select)
  - Options: English, العربية (Arabic)
  - Syncs with global `usePreferencesStore().setLanguage()`
  - Updates `document.documentElement.lang` and `dir`

- **Timezone** (Text Input)
  - Free-form input: "UTC", "America/New_York", "Europe/London"
  - Used for scheduling notifications and interview times

- **Enable Notifications** (Checkbox)
  - Master toggle for all notification types

**Form Behavior:**
- Auto-loads from `useSettings()` via `useEffect`
- Save button disabled during mutation
- Toast notification on success/error

---

##### Tab 2: Pipeline Settings
**Schema Validation:** `pipelineSettingsSchema` (Zod)

**Fields:**
- **Max Applications per Day** (Number Input)
  - Range: 1-100
  - Default: 10
  - Controls auto-apply rate limiting

- **Auto-apply Minimum Score** (Slider + Display)
  - Range: 0-100
  - Real-time percentage display
  - Default: 70
  - Threshold for automatic applications

- **Preferred Locations** (Tag Input + Add Button)
  - Add new: Text input + "Add" button, or Enter key
  - Tags displayed as chips with × close button
  - Removes on click
  - Array stored in form state

- **Excluded Companies** (Tag Input + Add Button)
  - Same UI as locations
  - Companies to skip in auto-apply
  - Red/destructive badge styling

- **Preferred Remote Types** (Checkbox Group)
  - Options: Remote, Hybrid, On-site
  - Multi-select (can choose 1, 2, or all 3)
  - Stored as string array

**Form Behavior:**
- Tag input: Enter key triggers add, × button removes
- Validation: Zod ensures arrays are properly typed
- Independent mutation from other settings

---

##### Tab 3: LLM Settings
**Schema Validation:** `llmConfigSchema` (Zod)

**Fields:**
- **Provider** (Select, Controls Model Options)
  - Options: Anthropic, OpenAI, NVIDIA
  - Triggers dynamic model list update
  - Resets model on change

- **Model** (Dependent Select)
  - **Anthropic:** Claude Opus 4, Claude Sonnet 3, Claude Haiku 3
  - **OpenAI:** GPT-4 Turbo, GPT-4, GPT-3.5 Turbo
  - **NVIDIA:** Nemotron 4 340B, Llama 2 70B
  - Only shows models for selected provider

- **Temperature** (Slider + Display)
  - Range: 0.0-2.0 (float, step 0.1)
  - Real-time display of current value
  - Lower = focused, Higher = creative

- **API Key** (Password Input with Toggle)
  - Eye icon to show/hide
  - Masked by default (type="password")
  - Optional field (only sent if changed)
  - Placeholder: "Enter your API key"
  - Help text: "Your API key is encrypted and never shared"

**Form Behavior:**
- API key not sent on save if empty (preserves existing)
- Provider change resets model field
- Mutation includes success toast

---

##### Tab 4: Notification Settings
**Schema Validation:** `notificationSettingsSchema` (Zod)

**Checkboxes:**
1. **Email Notifications** - Master toggle for email
2. **Application Status Updates** - Send on status changes (submitted, rejected, interview)
3. **Interview Reminders** - Reminder before scheduled interviews
4. **Daily Digest** - Summary email of day's activity

**Fields:**
- **Notification Email** (Email Input)
  - Validated as valid email format
  - Placeholder: "your@email.com"
  - Where emails are sent

**Form Behavior:**
- Individual checkboxes for granular control
- Email field required when notifications enabled
- Form state manages all boolean flags

---

##### Tab 5: Advanced Settings
**Schema Validation:** `advancedSettingsSchema` (Zod)

**Proxy Configuration (Optional):**
- **Proxy URL** (Text Input)
  - Format: "http://proxy.example.com:8080"
  - Optional field

- **Proxy Username** (Text Input)
  - Optional, used with proxy

- **Proxy Password** (Password Input with Toggle)
  - Eye icon to show/hide
  - Masked by default

**Rate Limiting:**
- **Rate Limit Per Minute** (Number Input)
  - Range: 1-100
  - Default: 30
  - Requests per minute limit

**Debug Mode:**
- **Enable Debug Mode** (Checkbox)
  - Enables verbose logging
  - Useful for troubleshooting

**Import/Export Buttons:**
```typescript
// Export: Downloads JSON file of current settings
handleExportSettings()
// Filename: job-search-settings-2026-03-19.json

// Import: Opens file picker, loads JSON
handleImportSettings()
// Parses JSON and updates form
```

**Form Behavior:**
- Password toggle for proxy password
- Optional fields can be left empty
- Export/Import below Save button
- All Advanced settings saved together

---

#### Settings Form Architecture

All tabs follow this pattern:

```typescript
function [TabName]Tab() {
  const { data: settings, isLoading } = useSettings();
  const updateMutation = use[Update]();
  const form = useForm<[Type]>({
    resolver: zodResolver([schema]),
    defaultValues: settings?.[key] || {...},
  });

  useEffect(() => {
    if (settings?.[key]) form.reset(settings[key]);
  }, [settings?.[key], form]);

  const onSubmit = async (data: [Type]) => {
    updateMutation.mutate(data);
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Fields */}
      <Button type="submit" disabled={updateMutation.isPending}>
        {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
      </Button>
    </form>
  );
}
```

**Features:**
- **Zod Validation:** Type-safe form data
- **React Hook Form:** Efficient field management
- **Auto-load:** Pulls from cache on mount
- **Loading States:** Spinner while fetching
- **Disabled Submit:** During mutation
- **Toast Notifications:** Success/error feedback
- **Global State Sync:** General & Language update preferences store

---

## Integration Points

### API Endpoints Required

**Analytics:**
```
GET /api/v1/analytics/overview
GET /api/v1/analytics/funnel
GET /api/v1/analytics/by-ats
GET /api/v1/analytics/timeline?days={7|30|90|-1}
GET /api/v1/analytics/sources
GET /api/v1/analytics/companies
```

**Settings:**
```
GET  /api/v1/settings
PUT  /api/v1/settings
PUT  /api/v1/settings/general
PUT  /api/v1/settings/pipeline
PUT  /api/v1/settings/llm
PUT  /api/v1/settings/notifications
PUT  /api/v1/settings/advanced
GET  /api/v1/settings/llm
```

### Dependencies

**Already Installed:**
- `@tanstack/react-query` - Data fetching
- `react-hook-form` - Form state management
- `zod` - Schema validation
- `@hookform/resolvers` - Zod + React Hook Form integration
- `recharts` - Chart library
- `sonner` - Toast notifications
- `lucide-react` - Icons (Eye, EyeOff, Download, Upload, Loader2)
- `@radix-ui/react-tabs` - Tabs component
- `clsx` / `tailwind-merge` - cn() utility

**Existing Components Used:**
- `Card` - from `@/components/ui/card`
- `Button` - from `@/components/ui/button`
- `Input` - from `@/components/ui/input`
- `Select` - from `@/components/ui/select`
- `Label` - from `@/components/ui/label`
- `Tabs` - from `@/components/ui/tabs`
- `usePreferencesStore()` - from `@/stores/preferences-store`
- `cn()` utility - from `@/lib/utils`

---

## Component Hierarchy

```
Analytics Page (Client)
├── Header + Date Range Buttons
├── Row 1: 6 Stat Cards
│   ├── StatCard (reusable component)
│   └── Loading skeleton
├── Row 2: Funnel + Success Trend
│   ├── Bar Chart (Recharts)
│   └── Line Chart (Recharts)
├── Row 3: ATS Pie + Top Sources Bar
│   ├── Pie Chart
│   └── Bar Chart (horizontal)
└── Row 4: Companies Table + Activity Line
    ├── Table (div-based)
    └── Dual-line Chart

Settings Page (Client)
├── Header
└── Tabs Container
    ├── Tab 1: General (Form)
    ├── Tab 2: Pipeline (Form + Tags)
    ├── Tab 3: LLM (Form + Dynamic Select)
    ├── Tab 4: Notifications (Form)
    └── Tab 5: Advanced (Form + Import/Export)
```

---

## Styling & Theme

### Analytics Page
- **Stat Cards:** Grid-based, responsive
- **Charts:** 250px height, full width, 5px radius
- **Colors:** Custom Recharts theme matching Tailwind
- **Loading:** `animate-pulse` on skeleton divs
- **Responsive Breakpoints:**
  - Mobile: 1 column
  - Tablet (md): 2 columns
  - Desktop (lg): 3-6 columns depending on content

### Settings Page
- **Tabs:** Scrollable on mobile, grid on desktop
- **Forms:** Max-width card container
- **Input Groups:** Flex layout with 2px gap
- **Tag Chips:** Primary color on general, destructive on companies
- **Buttons:** Full width per tab
- **Loading:** Spinner during data fetch/mutation

### Colors (Tailwind + Recharts)
```css
Primary Blue:     hsl(217.2 91.2% 59.8%)
Success Green:    hsl(142.1 76.2% 36.3%)
Warning Orange:   hsl(38.6 92.1% 50.2%)
Error Red:        hsl(0 84.2% 60.2%)
Purple:           hsl(280.9 81.2% 53.7%)
Grid Gray:        hsl(214.3 31.8% 91.4%)
Text Gray:        hsl(215.4 16.3% 46.9%)
Dark Background:  hsl(222.2 84% 4.9%)
Dark Border:      hsl(217.2 91.2% 59.8%)
```

---

## Error Handling

### API Errors
- Automatically caught by `apiFetch()` wrapper
- `onError` callbacks in mutations trigger toast
- User-friendly error messages
- 401 redirects to login, 403 shows permission error

### Form Errors
- Zod validation on submit
- Error messages stored in `form.formState.errors`
- Currently not displayed (can be added with `<FormError>` component)

### Query Errors
- Displayed via `useQuery.isError` flag
- Mutations auto-toast errors via `onError` callback

---

## Usage Examples

### Fetching Analytics Data
```typescript
function MyComponent() {
  const { data, isLoading, error } = useAnalyticsOverview();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage />;

  return <div>{data.total_jobs_discovered}</div>;
}
```

### Updating Settings
```typescript
function MyComponent() {
  const mutation = useUpdateGeneralSettings();

  const handleSave = (settings: GeneralSettings) => {
    mutation.mutate(settings); // Auto-toasts success/error
  };

  return <button disabled={mutation.isPending}>Save</button>;
}
```

### Tag Input Pattern
```typescript
const addTag = (tag: string) => {
  const current = form.getValues("preferred_locations");
  form.setValue("preferred_locations", [...current, tag]);
};

const removeTag = (index: number) => {
  const current = form.getValues("preferred_locations");
  form.setValue("preferred_locations",
    current.filter((_, i) => i !== index)
  );
};
```

---

## Testing Checklist

- [ ] Date range buttons update all charts dynamically
- [ ] All stat cards show correct values
- [ ] Pie chart renders ATS distribution
- [ ] Horizontal bar chart shows top sources
- [ ] Companies table scrolls and displays top 8
- [ ] Daily activity line chart shows dual lines
- [ ] General settings save and sync global theme/language
- [ ] Pipeline settings accept tag inputs and save
- [ ] LLM model dropdown updates on provider change
- [ ] Temperature slider updates real-time display
- [ ] Notification checkboxes save independently
- [ ] Advanced settings export downloads JSON file
- [ ] Import loads JSON and updates form
- [ ] All forms show loading spinner on submit
- [ ] Error toasts appear on API failure
- [ ] Responsive design works on mobile/tablet/desktop

---

## Performance Optimizations

1. **React Query Caching:**
   - 5-minute stale time on analytics
   - 10-minute stale time on settings
   - Prevents excessive API calls

2. **Form Field Memoization:**
   - React Hook Form only re-renders changed fields
   - No inline functions in render

3. **Chart Optimization:**
   - ResponsiveContainer prevents resize thrashing
   - Data transformations outside render loop

4. **Lazy Loading:**
   - Charts lazy-load on viewport entry (possible enhancement)

---

## Future Enhancements

1. **Export Analytics:**
   - Add CSV/PDF export buttons to analytics
   - Date range-aware exports

2. **Scheduled Reports:**
   - Settings tab for report scheduling
   - Daily/weekly email of analytics

3. **Advanced Filtering:**
   - Analytics by source, location, company
   - Custom date range picker (not just 7/30/90)

4. **Form Error Display:**
   - Add form error fields display under inputs
   - Better validation feedback

5. **Bulk Import:**
   - CSV import for excluded companies/locations
   - Deduplicate and validate on import

6. **Accessibility:**
   - ARIA labels on form inputs
   - Keyboard navigation for tag inputs
   - Color-blind friendly chart colors

---

## File Summary

| File | Size | Purpose |
|------|------|---------|
| `use-analytics.ts` | 2.5 KB | Analytics data hooks |
| `use-settings.ts` | 5.3 KB | Settings CRUD hooks |
| `analytics/page.tsx` | 17 KB | Analytics dashboard UI |
| `settings/page.tsx` | 28 KB | Settings forms & tabs |

**Total:** 52.8 KB of new frontend code

---

**Build Status:** ✅ Complete and ready for integration
**Author:** Ahmed Adel Bakr Alderai
**License:** Same as JobFlow project
