# Dashboard Layout Components

Author: Ahmed Adel Bakr Alderai

This document outlines the dashboard layout shell and navigation components for the JobFlow frontend.

## Overview

The dashboard layout consists of the following main components:

- **Sidebar**: Fixed left navigation with collapsible sidebar
- **Topbar**: Fixed top navigation with search, theme toggle, language toggle, notifications, and user menu
- **Mobile Nav**: Sheet-based mobile navigation menu
- **Breadcrumbs**: Dynamic breadcrumb navigation
- **Dashboard Layout**: Main layout wrapper for all dashboard pages

## File Structure

```
src/
├── app/
│   └── (dashboard)/
│       ├── layout.tsx          # Main dashboard layout wrapper
│       └── page.tsx            # Dashboard home page
├── components/
│   └── layout/
│       ├── sidebar.tsx         # Sidebar navigation
│       ├── topbar.tsx          # Top navigation bar
│       ├── mobile-nav.tsx      # Mobile navigation sheet
│       └── breadcrumbs.tsx     # Dynamic breadcrumbs
├── hooks/
│   └── useI18n.ts             # i18n translation hook
└── lib/
    └── nav-keys.ts            # Navigation key mappings
```

## Components

### 1. Sidebar (`src/components/layout/sidebar.tsx`)

The sidebar provides the main navigation for desktop users with the following features:

- **App Logo**: "JobFlow" logo at the top
- **Navigation Groups**: Organized navigation items in 5 categories:
  - MAIN: Dashboard, Jobs, Applications, Agents
  - PEOPLE: Contacts, Outreach, Recruiters, Interviews
  - INSIGHTS: Analytics, Intelligence, Target List, Triage
  - ACCOUNT: Profile, Settings, Billing
  - SYSTEM: Deploy, Logs, Notifications, Admin (admin-only)
- **Active State Highlighting**: Current page is highlighted
- **Collapsible**: Can be toggled to show only icons with tooltips
- **User Section**: Avatar, name, email, and logout button
- **Responsive**: Hidden on mobile, visible on desktop

**Props**:
```typescript
interface SidebarProps {
  isAdmin?: boolean; // Show admin-only items
}
```

**Usage**:
```tsx
<Sidebar isAdmin={true} />
```

### 2. Topbar (`src/components/layout/topbar.tsx`)

The top navigation bar provides quick access to key features:

- **Mobile Menu Button**: Shows mobile navigation on small screens
- **Breadcrumbs**: Dynamic breadcrumb navigation (desktop only)
- **Search Input**: Global search functionality (desktop)
- **Theme Toggle**: Light/Dark/System theme switcher
- **Language Toggle**: EN/AR language switcher
- **Notifications**: Bell icon with notification badge
- **User Dropdown**: Profile, Settings, Billing, Logout options

**Props**:
```typescript
interface TopbarProps {
  notificationCount?: number; // Number of unread notifications
}
```

**Usage**:
```tsx
<Topbar notificationCount={3} />
```

### 3. Mobile Nav (`src/components/layout/mobile-nav.tsx`)

Mobile navigation implemented as a slide-out sheet:

- **Sheet Menu**: Slides in from left on mobile
- **Same Navigation Structure**: Uses same navigation items as sidebar
- **User Info**: Shows user avatar, name, and email at top
- **Auto-Close**: Closes when a navigation link is clicked
- **Logout Button**: Bottom action button

**Usage**:
```tsx
<MobileNav isAdmin={false} />
```

### 4. Breadcrumbs (`src/components/layout/breadcrumbs.tsx`)

Dynamic breadcrumb navigation that auto-generates from the URL:

- **Auto-Generated**: Parses pathname to create breadcrumbs
- **Clickable**: Intermediate segments are clickable links
- **Current Page**: Last segment is non-clickable text
- **i18n Aware**: Uses translation keys from i18n files

**Usage**:
```tsx
<Breadcrumbs />
```

### 5. Dashboard Layout (`src/app/(dashboard)/layout.tsx`)

Main layout wrapper for all dashboard pages:

- **Authentication Check**: Redirects to login if not authenticated
- **Responsive Layout**: Adjusts sidebar margin based on screen size
- **Language Support**: RTL support for Arabic
- **Content Wrapper**: Proper padding and spacing for main content

**Usage** (Automatic in app routing):
```tsx
export default function DashboardLayout({ children }) {
  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  );
}
```

## Hooks

### useI18n Hook (`src/hooks/useI18n.ts`)

Translation hook for accessing i18n strings:

**Returns**:
```typescript
{
  t: (key: string, defaultValue?: string) => string;
  language: Language; // 'en' | 'ar'
  messages: TranslationKeys;
}
```

**Usage**:
```tsx
import { useI18n } from "@/hooks/useI18n";

export function MyComponent() {
  const { t, language } = useI18n();

  return <h1>{t("nav.dashboard")}</h1>;
}
```

## Stores

### Auth Store (`src/stores/auth-store.ts`)

Zustand store for authentication state and actions:

- `user`: Current user data
- `token`: JWT token
- `isAuthenticated`: Auth status
- `login()`: Login action
- `logout()`: Logout action
- `checkAuth()`: Check if user is authenticated

### Preferences Store (`src/stores/preferences-store.ts`)

Zustand store for user preferences:

- `language`: Current language ('en' | 'ar')
- `theme`: Current theme ('light' | 'dark' | 'system')
- `sidebarCollapsed`: Sidebar collapsed state
- `setLanguage()`: Set language
- `setTheme()`: Set theme
- `toggleLanguage()`: Toggle between EN and AR
- `toggleSidebar()`: Toggle sidebar collapse state

## Styling

### Color Scheme

The dashboard uses CSS variables defined in `src/app/globals.css`:

- **Sidebar Colors**:
  - `--sidebar`: Sidebar background
  - `--sidebar-foreground`: Sidebar text
  - `--sidebar-primary`: Active item background
  - `--sidebar-accent`: Hover/accent background

- **Theme Support**:
  - Light mode: Light backgrounds and dark text
  - Dark mode: Dark backgrounds and light text
  - System: Follows OS preference

### Responsive Breakpoints

- **Mobile**: Below `md` (768px) - Only topbar visible, sidebar hidden
- **Tablet/Desktop**: `md` and above - Sidebar visible with topbar
- **Sidebar Breakpoint**: Below `lg` (1024px) - Sidebar can be collapsed

## Navigation Structure

The navigation is organized in 5 main groups:

### MAIN Group
- Dashboard (`/dashboard`)
- Jobs (`/dashboard/jobs`)
- Applications (`/dashboard/applications`)
- Agents (`/dashboard/agents`)

### PEOPLE Group
- Contacts (`/dashboard/contacts`)
- Outreach (`/dashboard/outreach`)
- Recruiters (`/dashboard/recruiters`)
- Interviews (`/dashboard/interviews`)

### INSIGHTS Group
- Analytics (`/dashboard/analytics`)
- Intelligence (`/dashboard/intelligence`)
- Target List (`/dashboard/target-list`)
- Triage (`/dashboard/triage`)

### ACCOUNT Group
- Profile (`/dashboard/profile`)
- Settings (`/dashboard/settings`)
- Billing (`/dashboard/billing`)

### SYSTEM Group
- Deploy (`/dashboard/deploy`)
- Logs (`/dashboard/logs`)
- Notifications (`/dashboard/notifications`)
- Admin (`/dashboard/admin`) - Admin only

## i18n Integration

Navigation labels are translated using i18n JSON files:

**File**: `src/i18n/en.json`
```json
{
  "nav": {
    "dashboard": "Dashboard",
    "jobs": "Jobs",
    "applications": "Applications",
    "agents": "Agents",
    "contacts": "Contacts",
    "outreach": "Outreach",
    "recruiters": "Recruiters",
    "interviews": "Interviews",
    "analytics": "Analytics",
    "intelligence": "Intelligence",
    "settings": "Settings",
    "billing": "Billing",
    "profile": "Profile",
    "deploy": "Deploy",
    "logs": "Logs",
    "admin": "Admin",
    "targetList": "Target List",
    "triage": "Triage",
    "notifications": "Notifications"
  }
}
```

Navigation labels use the `getNavKey()` utility function to map label names to i18n keys.

## Features

### Sidebar Collapse
Users can toggle the sidebar to maximize content space:

- **Expanded**: Shows full labels (w-64)
- **Collapsed**: Shows only icons with tooltips (w-16)
- **Smooth Transition**: 300ms ease-in-out animation
- **Persistent**: State saved in localStorage via Zustand

### Dark Mode
Theme switching via topbar dropdown:

- **Light**: Light backgrounds, dark text
- **Dark**: Dark backgrounds, light text
- **System**: Follows OS preference
- **Persistent**: State saved in localStorage

### Language Support
Language toggling via topbar button:

- **English**: LTR layout
- **Arabic**: RTL layout
- **Auto-dir**: Document direction updated automatically
- **Persistent**: State saved in localStorage

### Search
Global search input in topbar (desktop):

- **Placeholder**: Translated via i18n
- **Focus State**: Expands background on focus
- **Desktop Only**: Hidden on mobile

### Notifications
Bell icon with badge in topbar:

- **Badge**: Shows unread count (max 9+)
- **Color**: Red destructive variant
- **Clickable**: Ready for notification menu implementation

### User Menu
Dropdown menu in topbar with user options:

- **Profile Link**: Link to profile page
- **Settings Link**: Link to settings page
- **Billing Link**: Link to billing page
- **Logout**: Logs out user and redirects to login

## Accessibility

The layout includes several accessibility features:

- **Semantic HTML**: Uses proper heading levels and navigation semantics
- **ARIA Labels**: Buttons have descriptive labels
- **Keyboard Navigation**: All components are keyboard accessible
- **Focus States**: Visible focus indicators on interactive elements
- **Color Contrast**: Text meets WCAG AA contrast requirements

## Performance

### Optimization Techniques

- **Code Splitting**: Components are lazy-loaded where applicable
- **Icon Optimization**: lucide-react icons are tree-shaken
- **CSS Variables**: Efficient theme switching without full re-renders
- **Memoization**: Navigation items are memoized to prevent unnecessary re-renders
- **Zustand Stores**: Efficient state management with selective subscriptions

## Example: Creating a Dashboard Page

To create a new dashboard page:

1. Create a directory under `src/app/(dashboard)/`
2. Create a `page.tsx` file
3. The layout automatically wraps your content

**Example**:
```tsx
// src/app/(dashboard)/jobs/page.tsx
"use client";

import { useI18n } from "@/hooks/useI18n";

export default function JobsPage() {
  const { t } = useI18n();

  return (
    <div>
      <h1>{t("nav.jobs")}</h1>
      {/* Page content */}
    </div>
  );
}
```

The sidebar will automatically highlight the active "Jobs" link, and the breadcrumb will show "Dashboard > Jobs".

## Future Enhancements

Potential improvements for the dashboard layout:

1. **Notification Center**: Implement full notification panel
2. **Search Implementation**: Wire up global search to API
3. **Customizable Sidebar**: Allow users to customize sidebar order
4. **Keyboard Shortcuts**: Add keyboard shortcuts for navigation
5. **Breadcrumb Skip Links**: Skip to main content functionality
6. **Mobile Optimizations**: Further optimize mobile experience
7. **Theme Customization**: Allow custom color themes

## Troubleshooting

### Sidebar Not Collapsing
- Check if `toggleSidebar()` is being called properly
- Verify Zustand store is persisting state to localStorage
- Check browser DevTools > Application > Local Storage

### Translation Not Showing
- Verify i18n key exists in both `en.json` and `ar.json`
- Use `getNavKey()` utility to map label to i18n key
- Check if language is properly set in preferences store

### Mobile Menu Not Opening
- Ensure `MobileNav` component is rendered in topbar
- Check if Sheet component from shadcn/ui is working
- Verify button click handler is not being prevented

### Authentication Redirecting
- Check if user token is properly stored in localStorage
- Verify `checkAuth()` is returning correct status
- Look at browser console for auth errors
