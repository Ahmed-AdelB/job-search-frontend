# Settings Page - Quick Reference

## File Locations

| File | Purpose | Lines |
|------|---------|-------|
| `src/app/(dashboard)/settings/page.tsx` | Main settings page | 907 |
| `src/components/ui/slider.tsx` | Range slider input | 27 |
| `src/components/ui/radio-group.tsx` | Exclusive selection | 60 |
| `src/components/ui/tag-input.tsx` | Tag management | 82 |

## Tab Navigation

```
Settings Page
├── Tab 1: Pipeline
│   ├── Auto Apply (Switch)
│   ├── Min Match Score (Slider 0-100)
│   ├── Max Apps/Day (Input)
│   ├── Preferred Locations (TagInput)
│   ├── Excluded Companies (TagInput)
│   └── Remote Types (Checkboxes)
│
├── Tab 2: Appearance
│   ├── Theme (RadioGroup: System/Light/Dark)
│   └── Language (Select: English/Arabic)
│
├── Tab 3: Notifications
│   ├── Email Notifications (Switch)
│   ├── Job Match Alerts (Switch)
│   ├── Interview Reminders (Switch)
│   ├── Weekly Digest (Switch)
│   └── Notification Email (Input)
│
└── Tab 4: Account
    ├── Change Password Card
    │   ├── Current Password (Input + visibility toggle)
    │   ├── New Password (Input + visibility toggle)
    │   └── Confirm Password (Input + visibility toggle)
    ├── Export Data Card
    │   └── Export Button (downloads JSON)
    └── Delete Account Card
        └── Delete Button (AlertDialog confirmation)
```

## Component Usage Examples

### TagInput
```typescript
<TagInput
  value={pipelineSettings.preferred_locations}
  onChange={(locations) =>
    setPipelineSettings({
      ...pipelineSettings,
      preferred_locations: locations,
    })
  }
  placeholder="Add location and press Enter"
/>
```

### Slider
```typescript
<Slider
  value={[pipelineSettings.min_match_score]}
  onValueChange={(value) =>
    setPipelineSettings({
      ...pipelineSettings,
      min_match_score: value[0],
    })
  }
  min={0}
  max={100}
  step={5}
/>
```

### RadioGroup
```typescript
<RadioGroup value={theme} onValueChange={setTheme}>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="system" id="theme-system" />
    <Label htmlFor="theme-system">System</Label>
  </div>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="light" id="theme-light" />
    <Label htmlFor="theme-light">Light</Label>
  </div>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="dark" id="theme-dark" />
    <Label htmlFor="theme-dark">Dark</Label>
  </div>
</RadioGroup>
```

## State Management

### Pipeline Settings
```typescript
const [pipelineSettings, setPipelineSettings] = useState<PipelineSettings>({
  auto_apply_enabled: false,
  min_match_score: 70,
  max_applications_per_day: 5,
  preferred_locations: [],
  excluded_companies: [],
  remote_types: [],
})
```

### Notifications
```typescript
const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
  email_notifications: true,
  application_status_updates: true,
  interview_reminders: true,
  daily_digest: true,
  notification_email: "",
})
```

## API Integration

### Fetch Settings
```typescript
const { data: settings, isLoading } = useSettings()

useEffect(() => {
  if (settings) {
    if (settings.pipeline) setPipelineSettings(settings.pipeline)
    if (settings.notifications) setNotificationSettings(settings.notifications)
  }
}, [settings])
```

### Save Settings
```typescript
const updatePipeline = useUpdatePipelineSettings()

const handleSavePipelineSettings = async () => {
  await updatePipeline.mutateAsync(pipelineSettings)
  // Success/error toast shown automatically
}
```

## Hooks Used

```typescript
// From react
import { useState, useEffect }

// From next
import { useRouter } from "next/navigation"

// From lucide-react (icons)
import { AlertTriangle, Download, Trash2, Eye, EyeOff }

// From stores
import { usePreferencesStore }

// From custom hooks
import {
  useSettings,
  useUpdatePipelineSettings,
  useUpdateGeneralSettings,
  useUpdateNotificationSettings,
} from "@/hooks/use-settings"

// From sonner (toasts)
import { toast }
```

## Form Validation Examples

### Password Change
```typescript
const handleChangePassword = async () => {
  // Validation
  if (!passwordForm.current || !passwordForm.new || !passwordForm.confirm) {
    toast.error("Please fill in all password fields")
    return
  }

  if (passwordForm.new !== passwordForm.confirm) {
    toast.error("New passwords do not match")
    return
  }

  if (passwordForm.new.length < 8) {
    toast.error("Password must be at least 8 characters")
    return
  }

  // API call...
}
```

### Delete Account Confirmation
```typescript
const handleDeleteAccount = async () => {
  if (showDeleteConfirm !== "DELETE") {
    toast.error("Please type DELETE to confirm")
    return
  }
  // API call...
}
```

## CSS Classes Reference

### Custom Components
- `Slider`: Range input with visual track
- `RadioGroup`: Container for radio options
- `RadioGroupItem`: Individual radio button
- `TagInput`: Flex container with tags and input

### Shadcn Components
- `Card`, `CardContent`, `CardHeader`, `CardTitle`, `CardDescription`
- `Button`: with variants (default, outline, ghost, destructive)
- `Input`, `Label`, `Switch`, `Checkbox`, `Select`
- `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`
- `AlertDialog`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogFooter`, `AlertDialogCancel`, `AlertDialogAction`

## Responsive Classes

```typescript
// Desktop/Mobile responsive
className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"

// Grid columns
className="grid w-full grid-cols-4"

// Button width
className="w-full sm:w-auto"

// Flex direction
className="flex flex-col-reverse gap-2 sm:flex-row"
```

## Toast Messages

```typescript
toast.success("Settings updated successfully")
toast.error("Failed to update settings", { description: error.message })
toast.info("Exporting data...")
toast.error("Please fill in all password fields")
toast.error("New passwords do not match")
```

## Loading States

```typescript
{isLoading && <div className="animate-pulse">Loading...</div>}

disabled={updatePipeline.isPending}

{updatePipeline.isPending ? "Saving..." : "Save Pipeline Settings"}
```

## Import Statements

```typescript
// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { TagInput } from "@/components/ui/tag-input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Stores & Hooks
import { usePreferencesStore } from "@/stores/preferences-store"
import { useSettings, useUpdatePipelineSettings, useUpdateGeneralSettings, useUpdateNotificationSettings } from "@/hooks/use-settings"
import { toast } from "sonner"
```

## Debugging Tips

1. **Check API endpoints exist**: Verify `/api/v1/settings/*` routes in backend
2. **Console logs**: Add `console.log(settings)` after data fetch
3. **Network tab**: Check XHR requests for API calls
4. **React DevTools**: Inspect `preferences-store` state
5. **Toast messages**: Check `sonner` toast visibility
6. **TypeScript errors**: Import types from `@/types/api` and `@/hooks/use-settings`

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Settings not loading | Check API endpoint exists, verify authentication |
| Toast not showing | Ensure `<Toaster />` in root layout |
| Theme not changing | Check `next-themes` provider in layout |
| Language not changing | Verify `setLanguage()` updates HTML dir attribute |
| Submit disabled | Check `isPending` state, verify API response |
| Tags not adding | Ensure TagInput receives proper `onChange` handler |

## Next Steps / TODO

1. Implement password change API endpoint
2. Implement account deletion API endpoint
3. Implement data export API endpoint
4. Add field-level validation with zod
5. Add success confirmation animations
6. Add settings change confirmation dialog
7. Add undo/redo functionality
8. Add settings search/filter
9. Add settings presets
10. Add settings history/audit log
