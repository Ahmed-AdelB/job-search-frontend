# Operations & Admin Pages - Implementation Guide

**Created:** March 19, 2026
**Author:** Ahmed Adel Bakr Alderai

## Overview

Four new operations/admin pages for Next.js 16 frontend with real-time monitoring, deployment management, system logs, and administrative controls.

## Pages Created

### 1. Deploy Management (`src/app/(dashboard)/deploy/page.tsx`)

**Purpose:** Monitor and control application deployments

**Features:**
- Real-time status badge (idle/building/deploying/running/error)
- Status card with current version, last deploy time, uptime
- Deploy history table with version, date, status, duration, triggered by
- Action buttons: Rebuild, View Logs, Rollback (per version)
- Auto-refresh every 5 seconds

**API Endpoints Used:**
- `GET /api/deploy/status` - Current deployment status
- `GET /api/deploy/history` - Deploy history list
- `POST /api/deploy/rebuild` - Trigger rebuild
- `POST /api/deploy/rollback` - Rollback to version

**Styling:**
- Color-coded status badges (green=running, gray=idle, blue=building, amber=deploying, red=error)
- Monospace font for versions and timestamps
- Dark mode compatible

---

### 2. System Logs (`src/app/(dashboard)/logs/page.tsx`)

**Purpose:** Real-time system log viewer with advanced filtering

**Features:**
- Real-time log viewer with monospace font
- Auto-scroll to bottom when new logs arrive (can be toggled)
- Color-coded log levels:
  - DEBUG = gray
  - INFO = blue
  - WARNING = yellow/amber
  - ERROR = red
  - CRITICAL = bold red
- Multi-level filtering:
  - Search text in message/agent
  - Filter by log level
  - Filter by agent name
- Log statistics cards:
  - Total entries
  - Errors today
  - Warnings today
- Context expansion for structured logging
- Manual refresh button

**API Endpoints Used:**
- `GET /api/logs?level=&agent=&search=&limit=&offset=` - Fetch logs with filters

**Query Parameters:**
- `level` - Optional log level filter (DEBUG/INFO/WARNING/ERROR/CRITICAL)
- `agent` - Optional agent name filter
- `search` - Optional search text
- `limit` - Number of logs (default 100)
- `offset` - Pagination offset (default 0)

**Styling:**
- Terminal-like dark background (slate-950)
- Hover highlight effect on log entries
- Icon indicators for each log level
- Responsive layout

---

### 3. Notifications (`src/app/(dashboard)/notifications/page.tsx`)

**Purpose:** Manage application notifications and alerts

**Features:**
- Unread badge in header
- "Mark All Read" button
- Notification filtering:
  - By read status (All/Unread/Read)
  - By type (info/success/warning/error)
- Rich notification cards with:
  - Type-specific icon
  - Title and message
  - "Time ago" formatting
  - Unread indicator (white dot)
  - Click to mark as read
  - Action URL navigation
- Color-coded notification types:
  - Success = green background
  - Error = red background
  - Warning = amber background
  - Info = blue background

**API Endpoints Used:**
- `GET /api/alerts` - Fetch notifications with unread count
- `PUT /api/alerts/{id}/read` - Mark single notification as read
- `PUT /api/alerts/read-all` - Mark all as read

**Styling:**
- Notification cards with type-specific background colors
- Dark mode compatible
- Smooth transitions on hover
- Responsive layout

---

### 4. Admin Panel (`src/app/(dashboard)/admin/page.tsx`)

**Purpose:** System administration with four tabbed sections

**Warning Banner:**
- Red background with shield icon
- "Admin Only Access" warning
- Mentions action logging and audit review

#### Tab 1: Tenants
- Tenant management table
- Columns: Name, Slug, Plan, User Count, Status, Created, Actions
- Add Tenant dialog with:
  - Name input
  - Slug input
  - Plan selector (free/starter/professional/enterprise)
- Edit action buttons (placeholder)

**API Endpoints:**
- `GET /api/admin/tenants` - List all tenants
- `POST /api/admin/tenants` - Create new tenant

#### Tab 2: Maintenance
- System health stats with visual progress bars:
  - CPU Usage (green < 50%, amber 50-80%, red > 80%)
  - Memory Usage (same color scheme)
  - Disk Usage (green < 70%, amber 70-90%, red > 90%)
- Additional stats:
  - Uptime (formatted as days + hours)
  - Request count (last hour)
  - Error count (last hour)
- "Clean Abandoned Tasks" button for database maintenance

**API Endpoints:**
- `GET /api/admin/health` - System health metrics
- `POST /api/admin/maintenance/clean-tasks` - Run cleanup

#### Tab 3: MCP Debug
- Active MCP sessions table:
  - Session name
  - Status (connected/disconnected/error)
  - Last activity timestamp
- Available tools list:
  - Tool name (monospace)
  - Description
  - Expandable input schema (JSON)

**API Endpoints:**
- `GET /api/admin/mcp` - Fetch MCP sessions and tools

#### Tab 4: Trash
- Soft-deleted items management
- Columns: Entity Type, Entity ID, Deleted By, Deleted At, Actions
- Per-item actions:
  - Restore button (with RotateCcw icon)
  - Permanently Delete button (red)

**API Endpoints:**
- `GET /api/admin/trash` - List soft-deleted items
- `POST /api/admin/trash/{id}/restore` - Restore item
- `POST /api/admin/trash/{id}/delete` - Permanently delete

**Styling:**
- Alert banner with critical styling
- Tab-based navigation
- Dark mode compatible
- Color-coded status badges

---

## Component Usage

All pages use:
- **React Query** for data fetching and mutations
- **shadcn/ui** components (Button, Card, Badge, Table, Tabs, Dialog, Input, Select)
- **Lucide React** icons
- **Sonner** toast notifications
- **TailwindCSS v4** for styling

## Type Definitions

Add these to `src/types/api.ts`:

```typescript
// Deploy
export interface DeployStatus {
  status: "idle" | "building" | "deploying" | "running" | "error"
  current_version: string
  last_deploy_time?: string
  uptime_seconds: number
  running: boolean
}

export interface DeployHistory {
  version: string
  date: string
  status: "success" | "failed" | "in_progress"
  duration_seconds: number
  triggered_by: string
}

// Logs
export interface LogEntry {
  timestamp: string
  level: "DEBUG" | "INFO" | "WARNING" | "ERROR" | "CRITICAL"
  agent: string
  message: string
  context?: Record<string, unknown>
}

// Notifications
export interface Notification {
  id: string
  type: "info" | "success" | "warning" | "error"
  title: string
  message: string
  read: boolean
  created_at: string
  action_url?: string
}

// Admin
export interface Tenant {
  id: string
  name: string
  slug: string
  plan: "free" | "starter" | "professional" | "enterprise"
  user_count: number
  status: "active" | "suspended" | "cancelled"
  created_at: string
}
```

## API Routes Required

Create the following backend API routes:

### Deploy
- `GET /api/deploy/status`
- `GET /api/deploy/history`
- `POST /api/deploy/rebuild`
- `POST /api/deploy/rollback`

### Logs
- `GET /api/logs` (with level, agent, search, limit, offset params)

### Alerts/Notifications
- `GET /api/alerts`
- `PUT /api/alerts/{id}/read`
- `PUT /api/alerts/read-all`

### Admin
- `GET /api/admin/tenants`
- `POST /api/admin/tenants`
- `GET /api/admin/health`
- `POST /api/admin/maintenance/clean-tasks`
- `GET /api/admin/mcp`
- `GET /api/admin/trash`
- `POST /api/admin/trash/{id}/restore`
- `POST /api/admin/trash/{id}/delete`

## Styling Features

- **Operations Dashboard Aesthetic**: Clean, professional layout with focus on data clarity
- **Monospace Typography**: Used for versions, IDs, timestamps, and log entries
- **Dark Mode Compatible**: All colors support light and dark themes
- **Status Indicators**: Visual badges, progress bars, and color coding
- **Real-time Updates**: Auto-refresh with TanStack Query
- **Responsive Design**: Mobile-first approach with grid breakpoints

## Usage Notes

1. All pages use `"use client"` directive for Next.js 16 App Router
2. Authentication is handled by `apiFetch` via JWT token in localStorage
3. Errors are handled with Sonner toast notifications
4. Loading states use skeleton loaders from shared components
5. Empty states use the `EmptyState` component from shared
6. All data is typed with TypeScript interfaces

---

**Files Created:**
- `/Users/aadel/projects/17jobsearch/frontend/src/app/(dashboard)/deploy/page.tsx` (11 KB)
- `/Users/aadel/projects/17jobsearch/frontend/src/app/(dashboard)/logs/page.tsx` (12 KB)
- `/Users/aadel/projects/17jobsearch/frontend/src/app/(dashboard)/notifications/page.tsx` (10 KB)
- `/Users/aadel/projects/17jobsearch/frontend/src/app/(dashboard)/admin/page.tsx` (22 KB)

**Total Size:** ~55 KB of production-ready React code
