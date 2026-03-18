# Analytics & Settings - Type Definitions Reference

**Author:** Ahmed Adel Bakr Alderai

## Analytics Types

### AnalyticsOverview
```typescript
interface AnalyticsOverview {
  total_jobs_discovered: number;
  total_applications: number;
  total_interviews: number;
  total_offers: number;
  application_success_rate: number; // 0.0-1.0 (multiply by 100 for %)
  avg_response_time_days: number;
  top_sources: { source: string; count: number }[]; // Optional in current response
  top_companies: { company: string; count: number }[]; // Optional in current response
  daily_activity: { date: string; jobs: number; applications: number }[]; // Optional
}
```

### FunnelData
```typescript
interface FunnelData {
  stage: string; // e.g., "Discovered", "Viewed", "Applied", "Interviewed", "Offered"
  count: number;
  percentage: number; // 0-100
}
```

### ATSData
```typescript
interface ATSData {
  ats_type: string; // e.g., "Workday", "Greenhouse", "Lever", "SmartRecruiter"
  count: number;
  percentage: number; // 0-100
}
```

### TimelineData
```typescript
interface TimelineData {
  date: string; // ISO 8601 format: "2026-03-15"
  jobs_discovered: number;
  applications: number;
  success_rate: number; // 0-100, already calculated
}
```

### SourceData
```typescript
interface SourceData {
  source: string; // e.g., "LinkedIn", "Indeed", "Glassdoor", "company_careers"
  count: number;
  percentage: number; // 0-100
}
```

### CompanyData
```typescript
interface CompanyData {
  company: string; // Company name
  count: number; // Total times company appears in search results
  applications: number; // Apps sent to this company
  success_rate: number; // 0-1.0 (multiply by 100 for %)
}
```

---

## Settings Types

### GeneralSettings
```typescript
interface GeneralSettings {
  theme: "light" | "dark" | "system";
  language: "en" | "ar";
  timezone: string; // IANA timezone: "UTC", "America/New_York", "Europe/London"
  notifications_enabled: boolean;
}
```

### PipelineSettings
```typescript
interface PipelineSettings {
  max_applications_per_day: number; // 1-100, typically 10-20
  auto_apply_min_score: number; // 0-100, typically 70-80
  preferred_locations: string[]; // ["San Francisco", "London"]
  excluded_companies: string[]; // ["Google", "Meta"]
  preferred_remote_types: string[]; // ["remote", "hybrid", "onsite"]
}
```

### LLMConfig
```typescript
interface LLMConfig {
  provider: "anthropic" | "openai" | "nvidia";
  model: string; // Specific model ID for the provider
  temperature: number; // 0.0-2.0, typically 0.5-0.8
  api_key?: string; // Optional, only sent on update if changed
}
```

**Model Examples:**
```
Anthropic: "claude-opus-4", "claude-sonnet-3", "claude-haiku-3"
OpenAI: "gpt-4-turbo", "gpt-4", "gpt-3.5-turbo"
NVIDIA: "nemotron-4-340b", "llama-2-70b"
```

### NotificationSettings
```typescript
interface NotificationSettings {
  email_notifications: boolean; // Master toggle
  application_status_updates: boolean; // On submitted/rejected/interview
  interview_reminders: boolean; // Before scheduled interviews
  daily_digest: boolean; // Summary email each day
  notification_email: string; // Where emails go
}
```

### AdvancedSettings
```typescript
interface AdvancedSettings {
  proxy_url?: string; // "http://proxy.example.com:8080"
  proxy_username?: string;
  proxy_password?: string;
  rate_limit_per_minute: number; // 1-100, typically 30
  debug_mode: boolean; // Enable verbose logging
}
```

### AllSettings (Combined)
```typescript
interface AllSettings {
  general: GeneralSettings;
  pipeline: PipelineSettings;
  llm: LLMConfig;
  notifications: NotificationSettings;
  advanced: AdvancedSettings;
}
```

---

## Zod Schemas

### generalSettingsSchema
```typescript
const generalSettingsSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  language: z.enum(["en", "ar"]),
  timezone: z.string(),
  notifications_enabled: z.boolean(),
});
```

### pipelineSettingsSchema
```typescript
const pipelineSettingsSchema = z.object({
  max_applications_per_day: z.number().min(1).max(100),
  auto_apply_min_score: z.number().min(0).max(100),
  preferred_locations: z.array(z.string()),
  excluded_companies: z.array(z.string()),
  preferred_remote_types: z.array(z.string()),
});
```

### llmConfigSchema
```typescript
const llmConfigSchema = z.object({
  provider: z.enum(["anthropic", "openai", "nvidia"]),
  model: z.string(),
  temperature: z.number().min(0).max(2),
  api_key: z.string().optional(),
});
```

### notificationSettingsSchema
```typescript
const notificationSettingsSchema = z.object({
  email_notifications: z.boolean(),
  application_status_updates: z.boolean(),
  interview_reminders: z.boolean(),
  daily_digest: z.boolean(),
  notification_email: z.string().email(),
});
```

### advancedSettingsSchema
```typescript
const advancedSettingsSchema = z.object({
  proxy_url: z.string().optional(),
  proxy_username: z.string().optional(),
  proxy_password: z.string().optional(),
  rate_limit_per_minute: z.number().min(1).max(100),
  debug_mode: z.boolean(),
});
```

---

## API Request/Response Examples

### GET /api/v1/analytics/overview

**Response:**
```json
{
  "total_jobs_discovered": 245,
  "total_applications": 85,
  "total_interviews": 12,
  "total_offers": 3,
  "application_success_rate": 0.141,
  "avg_response_time_days": 7.3
}
```

### GET /api/v1/analytics/funnel

**Response:**
```json
[
  { "stage": "Discovered", "count": 245, "percentage": 100 },
  { "stage": "Viewed", "count": 180, "percentage": 73 },
  { "stage": "Applied", "count": 85, "percentage": 35 },
  { "stage": "Interviewed", "count": 12, "percentage": 5 },
  { "stage": "Offered", "count": 3, "percentage": 1 }
]
```

### GET /api/v1/analytics/by-ats

**Response:**
```json
[
  { "ats_type": "Workday", "count": 35, "percentage": 41 },
  { "ats_type": "Greenhouse", "count": 28, "percentage": 33 },
  { "ats_type": "Lever", "count": 15, "percentage": 18 },
  { "ats_type": "Email", "count": 7, "percentage": 8 }
]
```

### GET /api/v1/analytics/timeline?days=30

**Response:**
```json
[
  {
    "date": "2026-02-18",
    "jobs_discovered": 8,
    "applications": 2,
    "success_rate": 25.0
  },
  {
    "date": "2026-02-19",
    "jobs_discovered": 12,
    "applications": 3,
    "success_rate": 25.0
  },
  // ... more days
]
```

### GET /api/v1/analytics/sources

**Response:**
```json
[
  { "source": "LinkedIn", "count": 125, "percentage": 51 },
  { "source": "Indeed", "count": 75, "percentage": 31 },
  { "source": "Glassdoor", "count": 30, "percentage": 12 },
  { "source": "Company Careers", "count": 15, "percentage": 6 }
]
```

### GET /api/v1/analytics/companies

**Response:**
```json
[
  {
    "company": "Google",
    "count": 15,
    "applications": 5,
    "success_rate": 0.33
  },
  {
    "company": "Meta",
    "count": 12,
    "applications": 4,
    "success_rate": 0.25
  },
  // ... more companies
]
```

### GET /api/v1/settings

**Response:**
```json
{
  "general": {
    "theme": "dark",
    "language": "en",
    "timezone": "America/New_York",
    "notifications_enabled": true
  },
  "pipeline": {
    "max_applications_per_day": 15,
    "auto_apply_min_score": 75,
    "preferred_locations": ["San Francisco", "Remote"],
    "excluded_companies": ["Company A"],
    "preferred_remote_types": ["remote", "hybrid"]
  },
  "llm": {
    "provider": "anthropic",
    "model": "claude-opus-4",
    "temperature": 0.7
  },
  "notifications": {
    "email_notifications": true,
    "application_status_updates": true,
    "interview_reminders": true,
    "daily_digest": false,
    "notification_email": "user@example.com"
  },
  "advanced": {
    "proxy_url": null,
    "rate_limit_per_minute": 30,
    "debug_mode": false
  }
}
```

### PUT /api/v1/settings/general

**Request:**
```json
{
  "theme": "light",
  "language": "en",
  "timezone": "UTC",
  "notifications_enabled": true
}
```

**Response:** Same as request

### PUT /api/v1/settings/pipeline

**Request:**
```json
{
  "max_applications_per_day": 20,
  "auto_apply_min_score": 70,
  "preferred_locations": ["New York", "San Francisco"],
  "excluded_companies": [],
  "preferred_remote_types": ["remote"]
}
```

**Response:** Same as request

### PUT /api/v1/settings/llm

**Request:**
```json
{
  "provider": "openai",
  "model": "gpt-4",
  "temperature": 0.8,
  "api_key": "sk-..."
}
```

**Response:**
```json
{
  "provider": "openai",
  "model": "gpt-4",
  "temperature": 0.8
}
```
Note: API key not returned for security

---

## Query Key Patterns

React Query uses these keys for caching:

```typescript
// Analytics
["analytics", "overview"]
["analytics", "funnel"]
["analytics", "ats"]
["analytics", "timeline", 7]
["analytics", "timeline", 30]
["analytics", "timeline", 90]
["analytics", "timeline", "all"]
["analytics", "sources"]
["analytics", "companies"]

// Settings
["settings"]
["settings", "llm"]
```

---

## Common Data Transformations

### Calculate Success Rate from Funnel
```typescript
const successRate = (offered / discovered) * 100
// Example: (3 / 245) * 100 = 1.22%
```

### Format Response Time
```typescript
const formatted = `${avg_response_time_days.toFixed(1)}d`
// Example: "7.3d"
```

### Transform Timeline to Success Chart
```typescript
const successData = timeline.map(d => ({
  date: d.date,
  rate: (d.applications / d.jobs_discovered) * 100,
  count: d.applications
}))
```

### Sort Top Companies
```typescript
const topCompanies = companies
  .sort((a, b) => b.applications - a.applications)
  .slice(0, 8)
```

### Calculate ATS Percentages
```typescript
const ats = [
  { ats_type: "Workday", count: 35 },
  // ...
]
const total = ats.reduce((sum, item) => sum + item.count, 0)
const withPercentages = ats.map(item => ({
  ...item,
  percentage: (item.count / total) * 100
}))
```

---

## Field Constraints & Limits

| Field | Min | Max | Default | Notes |
|-------|-----|-----|---------|-------|
| max_applications_per_day | 1 | 100 | 10 | Rate limiter |
| auto_apply_min_score | 0 | 100 | 70 | Job match threshold |
| temperature | 0.0 | 2.0 | 0.7 | LLM creativity |
| rate_limit_per_minute | 1 | 100 | 30 | API throttle |
| timezone | - | - | "UTC" | IANA format |
| notification_email | - | - | - | Must be valid email |

---

**Complete reference for Analytics & Settings integration**
