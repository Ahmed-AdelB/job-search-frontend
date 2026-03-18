# Settings Page Implementation

**Author**: Ahmed Adel Bakr Alderai
**Date**: 2026-03-19
**Location**: `/Users/aadel/projects/17jobsearch/frontend/src/app/(dashboard)/settings/page.tsx`

## Overview

The settings page has been enhanced from a stub to a fully functional, multi-tab interface with 4 major sections:

1. **Pipeline Settings** - Job application automation preferences
2. **Appearance** - Theme and language configuration
3. **Notifications** - Email and alert preferences
4. **Account** - Password management, data export, account deletion

## New UI Components Created

### 1. Slider Component (`src/components/ui/slider.tsx`)
- Built on `@base-ui/react/slider`
- Range input with visual track indicator
- Supports min, max, step configuration
- Full accessibility (keyboard, focus states)
- Used for: Min match score (0-100%)

### 2. RadioGroup Component (`src/components/ui/radio-group.tsx`)
- Built on `@base-ui/react/radio-group`
- Exclusive selection (only one option at a time)
- Includes `RadioGroup` (root) and `RadioGroupItem` (individual option)
- Full accessibility support
- Used for: Theme selection (System/Light/Dark)

### 3. TagInput Component (`src/components/ui/tag-input.tsx`)
- Custom component for adding/removing items
- Add items by typing and pressing Enter
- Visual tags with remove buttons
- Prevents duplicate entries
- Used for: Preferred locations, excluded companies

## Tab Structure and Features

### Tab 1: Pipeline Settings
**API Endpoint**: `GET/PUT /api/v1/settings/pipeline`

**Fields**:
- **Auto Apply Toggle** (`auto_apply_enabled: boolean`)
  - Switch component
  - Enable/disable automatic job applications

- **Min Match Score Slider** (`min_match_score: number`, 0-100)
  - Slider with real-time value display
  - Only apply to jobs above this score

- **Max Applications Per Day** (`max_applications_per_day: number`)
  - Text input, min=1, max=100
  - Rate limiting for applications

- **Preferred Locations** (`preferred_locations: string[]`)
  - TagInput component
  - Multi-select locations (e.g., "San Francisco", "NYC", "Remote")

- **Excluded Companies** (`excluded_companies: string[]`)
  - TagInput component
  - Companies to skip during applications

- **Remote Type Preferences** (`remote_types: string[]`)
  - Checkbox group: "remote", "hybrid", "on-site"
  - Work arrangement preferences

### Tab 2: Appearance
**API Endpoint**: `GET/PUT /api/v1/settings/general`

**Fields**:
- **Theme** (System, Light, Dark)
  - RadioGroup for exclusive selection
  - Integrated with `next-themes`
  - Connected to Zustand `preferences-store`

- **Language** (English, Arabic)
  - Select dropdown
  - Shows RTL layout warning when switching
  - Updates HTML `lang` and `dir` attributes
  - Connected to Zustand `preferences-store`

**Features**:
- Language-aware UI layout hints
- Timezone auto-detection

### Tab 3: Notifications
**API Endpoint**: `GET/PUT /api/v1/settings/notifications`

**Fields**:
- **Email Notifications** (`email_notifications: boolean`)
  - Toggle switch
  - Master control for all email alerts

- **Job Match Alerts** (`application_status_updates: boolean`)
  - Toggle switch
  - Notified when matching jobs found

- **Interview Reminders** (`interview_reminders: boolean`)
  - Toggle switch
  - Reminders before interviews

- **Weekly Digest** (`daily_digest: boolean`)
  - Toggle switch
  - Weekly summary email

- **Notification Email** (`notification_email: string`)
  - Email input field
  - Configurable receiving address

### Tab 4: Account
No API calls required for local state management.

**Subsections**:

#### Change Password
- **Current Password** (password input with visibility toggle)
- **New Password** (password input with visibility toggle)
- **Confirm Password** (password input with visibility toggle)
- Validation:
  - All fields required
  - Passwords must match
  - Minimum 8 characters
- TODO: Implement actual password change API call

#### Export Data
- Download button exports settings as JSON
- File format: `job-search-data-YYYY-MM-DD.json`
- Contains: pipeline settings, notification settings, timestamp

#### Delete Account
- AlertDialog confirmation modal
- Safety mechanism: requires user to type "DELETE" to confirm
- Shows warnings about irreversible deletion
- TODO: Implement account deletion API call

## Component Integration

### React Query Hooks
The page uses specialized mutation hooks from `src/hooks/use-settings.ts`:

```typescript
- useSettings()                      // Fetch all settings
- useUpdatePipelineSettings()        // Update pipeline
- useUpdateGeneralSettings()         // Update appearance
- useUpdateNotificationSettings()    // Update notifications
```

Each mutation includes:
- Automatic cache updates
- Success/error toasts (via `sonner`)
- Loading state management
- Disabled button state during requests

### Zustand Store Integration
Connected to `src/stores/preferences-store.ts`:

```typescript
const { theme, language, setTheme, setLanguage } = usePreferencesStore()
```

- `theme`: System/Light/Dark preference
- `language`: en/ar language setting
- `setTheme()`: Update theme (integrates with next-themes)
- `setLanguage()`: Update language (updates HTML dir/lang)

### Toast Notifications
Uses `sonner` toast library:
- `toast.success()` - Settings saved successfully
- `toast.error()` - Operation failed with message
- `toast.info()` - Data exporting

## State Management

Local component state for:
- Pipeline settings (all fields)
- Notification settings (all fields)
- Password form (current, new, confirm)
- Delete confirmation input
- Password visibility toggles

State is updated from API on mount via `useEffect`:

```typescript
useEffect(() => {
  if (settings) {
    if (settings.pipeline) setPipelineSettings(settings.pipeline)
    if (settings.notifications) setNotificationSettings(settings.notifications)
  }
}, [settings])
```

## UI/UX Features

### Responsive Design
- Full width on mobile
- Optimal layout on tablet/desktop
- Stacked buttons on mobile, inline on desktop

### Accessibility
- Semantic HTML with proper labels
- ARIA attributes on custom components
- Keyboard navigation support
- Focus states on all interactive elements
- Color contrast compliant

### Loading States
- Loading skeleton on initial fetch
- Disabled buttons during mutations
- "Saving..." button text feedback
- Toast notifications for results

### Visual Feedback
- Value display for slider (e.g., "70%")
- Tag badges with removal buttons
- Password visibility icons (Eye/EyeOff)
- AlertDialog for destructive actions
- Warning text for language changes

## TypeScript Types

```typescript
interface PipelineSettings {
  auto_apply_enabled: boolean
  min_match_score: number
  max_applications_per_day: number
  preferred_locations: string[]
  excluded_companies: string[]
  remote_types: string[]
  [key: string]: unknown
}

interface NotificationSettings {
  email_notifications: boolean
  application_status_updates: boolean
  interview_reminders: boolean
  daily_digest: boolean
  notification_email: string
}

interface GeneralSettings {
  theme: "light" | "dark" | "system"
  language: "en" | "ar"
  timezone: string
  notifications_enabled: boolean
}
```

## File Structure

```
frontend/
├── src/
│   ├── app/
│   │   └── (dashboard)/
│   │       └── settings/
│   │           └── page.tsx                    # Main page (907 lines)
│   ├── components/
│   │   └── ui/
│   │       ├── slider.tsx                      # New: 27 lines
│   │       ├── radio-group.tsx                 # New: 60 lines
│   │       └── tag-input.tsx                   # New: 82 lines
│   ├── hooks/
│   │   └── use-settings.ts                     # Settings mutations
│   └── stores/
│       └── preferences-store.ts                # Theme/language state
└── SETTINGS_PAGE_IMPLEMENTATION.md             # This file
```

## API Endpoints Used

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/settings` | Fetch all settings |
| GET | `/api/v1/settings/pipeline` | Fetch pipeline settings |
| GET | `/api/v1/settings/general` | Fetch appearance settings |
| GET | `/api/v1/settings/notifications` | Fetch notification settings |
| PUT | `/api/v1/settings/pipeline` | Save pipeline settings |
| PUT | `/api/v1/settings/general` | Save appearance settings |
| PUT | `/api/v1/settings/notifications` | Save notifications |
| POST | `/api/v1/auth/change-password` | Change password (TODO) |
| POST | `/api/v1/auth/delete-account` | Delete account (TODO) |
| GET | `/api/v1/user/export` | Export user data (TODO) |

## TODO Items

1. **Password Change API**
   - Implement `POST /api/v1/auth/change-password`
   - Validate current password
   - Hash new password
   - Update user record

2. **Account Deletion API**
   - Implement `POST /api/v1/auth/delete-account`
   - Verify user password
   - Delete user record
   - Delete related data (jobs, applications, etc.)
   - Revoke JWT tokens
   - Redirect to login

3. **Data Export API**
   - Implement `GET /api/v1/user/export`
   - Return JSON with user data
   - Include jobs, applications, contacts
   - Include settings and preferences

## Testing Checklist

- [ ] Load settings page, verify initial state loaded
- [ ] Toggle auto-apply switch, save pipeline settings
- [ ] Adjust min match score slider, verify value updates
- [ ] Add/remove items in TagInput components
- [ ] Change theme in dropdown, verify UI updates
- [ ] Change language, verify RTL layout change
- [ ] Toggle notification switches
- [ ] Test password visibility toggles
- [ ] Test password validation (length, match)
- [ ] Test export data download
- [ ] Test delete account confirmation modal
- [ ] Test form validation and error messages

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Considerations

- Settings cached with 10-minute stale time
- Mutations are optimistic with rollback on error
- No unnecessary re-renders via proper hook usage
- Lazy loading not applicable (minimal payload)

## Security Considerations

- Password visibility toggle for user convenience
- Delete account requires confirmation typing
- No sensitive data logged to console
- API calls use secure HTTP headers
- Form inputs properly escaped in templates

## Future Enhancements

1. **Advanced Settings Tab**
   - LLM configuration (provider, model, temperature)
   - Proxy settings
   - Rate limiting
   - Debug mode toggle

2. **Settings Presets**
   - Save/load preset configurations
   - Share presets between users

3. **Settings History**
   - Track setting changes over time
   - Revert to previous settings

4. **API Response Formatting**
   - Handle 400 Bad Request responses
   - Validation error messages per field
   - Server-side validation feedback

5. **Progressive Enhancement**
   - Save to local storage on form change
   - Warn before losing unsaved changes
   - Offline editing with sync on reconnect
