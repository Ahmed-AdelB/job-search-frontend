# Dashboard Layout - Quick Reference Guide

**Author**: Ahmed Adel Bakr Alderai

## Component Quick Start

### 1. Using the Dashboard Layout

```tsx
// src/app/(dashboard)/my-page/page.tsx
"use client";

import { useI18n } from "@/hooks/useI18n";

export default function MyPage() {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t("nav.jobs")}</h1>
      {/* Your content here */}
    </div>
  );
}
```

The layout automatically wraps your page with:
- Sidebar navigation
- Topbar with search and user menu
- Proper spacing and responsive layout
- Authentication check

### 2. Using Translations

```tsx
import { useI18n } from "@/hooks/useI18n";

export function MyComponent() {
  const { t, language } = useI18n();

  return (
    <>
      <h1>{t("nav.dashboard")}</h1>
      <p>{t("common.search")}</p>
      {language === "ar" && <p>العربية</p>}
    </>
  );
}
```

**Common Translation Keys**:
- `nav.*` - Navigation items
- `common.*` - Common UI text
- `auth.*` - Authentication messages

### 3. Using Auth Store

```tsx
import { useAuthStore } from "@/stores/auth-store";

export function UserInfo() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <>
      <p>{user?.name} ({user?.email})</p>
      <button onClick={logout}>Logout</button>
    </>
  );
}
```

### 4. Using Preferences Store

```tsx
import { usePreferencesStore } from "@/stores/preferences-store";

export function ThemeSwitcher() {
  const theme = usePreferencesStore((state) => state.theme);
  const setTheme = usePreferencesStore((state) => state.setTheme);

  return (
    <select value={theme} onChange={(e) => setTheme(e.target.value)}>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
      <option value="system">System</option>
    </select>
  );
}
```

## File Paths Quick Reference

```
src/
├── app/
│   └── (dashboard)/
│       ├── layout.tsx              ← Main dashboard layout
│       ├── page.tsx                ← Dashboard home
│       ├── jobs/
│       │   └── page.tsx            ← Create your pages here
│       └── [section]/
│           └── page.tsx
├── components/
│   └── layout/
│       ├── sidebar.tsx             ← Navigation sidebar
│       ├── topbar.tsx              ← Top bar with search/user
│       ├── mobile-nav.tsx          ← Mobile menu
│       └── breadcrumbs.tsx         ← Breadcrumb navigation
├── hooks/
│   └── useI18n.ts                  ← Translation hook
├── lib/
│   ├── utils.ts                    ← cn() function
│   └── nav-keys.ts                 ← Nav key mapping
├── stores/
│   ├── auth-store.ts               ← Auth state
│   └── preferences-store.ts        ← Theme/language state
└── i18n/
    ├── en.json                     ← English translations
    └── ar.json                     ← Arabic translations
```

## Navigation Links

All links follow this pattern: `/dashboard/[section]`

```
Dashboard     → /dashboard
Jobs          → /dashboard/jobs
Applications  → /dashboard/applications
Agents        → /dashboard/agents
Contacts      → /dashboard/contacts
Outreach      → /dashboard/outreach
Recruiters    → /dashboard/recruiters
Interviews    → /dashboard/interviews
Analytics     → /dashboard/analytics
Intelligence  → /dashboard/intelligence
Target List   → /dashboard/target-list
Triage        → /dashboard/triage
Profile       → /dashboard/profile
Settings      → /dashboard/settings
Billing       → /dashboard/billing
Deploy        → /dashboard/deploy
Logs          → /dashboard/logs
Notifications → /dashboard/notifications
Admin         → /dashboard/admin (admin only)
```

## Common Code Patterns

### Pattern 1: Page with Header and Grid

```tsx
"use client";

import { Card } from "@/components/ui/card";
import { useI18n } from "@/hooks/useI18n";

export default function SectionPage() {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{t("nav.jobs")}</h1>
        <p className="text-muted-foreground">Manage your job applications</p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          {/* Card content */}
        </Card>
      </div>
    </div>
  );
}
```

### Pattern 2: Page with Table

```tsx
"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/hooks/useI18n";

export default function ListPage() {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{t("nav.contacts")}</h1>
        <Button>{t("common.create")}</Button>
      </div>

      <Card>
        <table className="w-full">
          {/* Table content */}
        </table>
      </Card>
    </div>
  );
}
```

### Pattern 3: Page with Form

```tsx
"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/hooks/useI18n";

export default function FormPage() {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t("nav.settings")}</h1>

      <Card className="p-6">
        <form className="space-y-4">
          <div>
            <label>{t("common.name")}</label>
            <Input placeholder="Enter name" />
          </div>
          <Button type="submit">{t("common.save")}</Button>
        </form>
      </Card>
    </div>
  );
}
```

## Styling Classes

### Spacing
```
px-4   = padding-left and right 16px
py-6   = padding-top and bottom 24px
gap-6  = gap between flex/grid items 24px
space-y-4 = vertical spacing between children 16px
```

### Responsive
```
hidden md:block = Hidden on mobile, visible on md+
md:grid-cols-2 = 2 columns on tablet+
lg:grid-cols-4 = 4 columns on desktop+
```

### Text
```
text-3xl font-bold = Large, bold heading
text-sm text-muted-foreground = Small, subtle text
text-xs = Tiny text (labels)
```

### Colors
```
bg-card = Card background
bg-muted = Muted background
text-foreground = Main text color
text-muted-foreground = Subtle text
border-border = Border color
```

## Useful Imports

```tsx
// Hooks
import { useI18n } from "@/hooks/useI18n";
import { useAuthStore } from "@/stores/auth-store";
import { usePreferencesStore } from "@/stores/preferences-store";
import { usePathname, useRouter } from "next/navigation";

// Components
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Icons
import { Plus, Edit2, Trash2, Search, Filter } from "lucide-react";

// Utilities
import { cn } from "@/lib/utils";
```

## Theme Colors

```css
/* Light Mode */
--background: white
--foreground: dark gray
--card: white
--primary: dark blue
--secondary: light gray
--muted: very light gray
--destructive: red

/* Dark Mode */
--background: dark gray
--foreground: white
--card: darker gray
--primary: light blue
--secondary: medium gray
--muted: darker gray
--destructive: red
```

## Authentication Check

The dashboard layout automatically checks authentication. If not authenticated, it redirects to `/login`.

To access auth state:
```tsx
const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
const user = useAuthStore((state) => state.user);
const logout = useAuthStore((state) => state.logout);
```

## Creating New Dashboard Pages

### Step 1: Create Directory
```bash
mkdir -p src/app/\(dashboard\)/new-section
```

### Step 2: Create page.tsx
```tsx
// src/app/(dashboard)/new-section/page.tsx
"use client";

export default function NewSectionPage() {
  return <h1>New Section</h1>;
}
```

### Step 3: Add to Navigation (if needed)
Add to NAV_ITEMS array in:
- `src/components/layout/sidebar.tsx`
- `src/components/layout/mobile-nav.tsx`

### Step 4: Add Translation (if needed)
Add to `src/i18n/en.json` and `src/i18n/ar.json`:
```json
{
  "nav": {
    "newSection": "New Section"
  }
}
```

### Step 5: Update Nav Keys (if needed)
Add to `src/lib/nav-keys.ts`:
```typescript
"New Section": "newSection"
```

## Troubleshooting

### Page not showing in sidebar
- Add to NAV_ITEMS in sidebar.tsx
- Check href matches page path
- Clear browser cache

### Translation not showing
- Add key to i18n/en.json
- Add key to i18n/ar.json
- Use correct key format with dots

### Sidebar not collapsing
- Check toggleSidebar is wired correctly
- Verify localStorage is working
- Check browser DevTools > Application > Local Storage

### Mobile menu not opening
- Ensure MobileNav is in Topbar
- Check Sheet component is working
- Test on actual mobile or DevTools device mode

## Performance Tips

1. **Use Selective Subscriptions**
```tsx
// Good - Only subscribes to what you need
const user = useAuthStore((state) => state.user);

// Avoid - Subscribes to entire store
const authState = useAuthStore();
```

2. **Memoize Expensive Operations**
```tsx
import { useMemo } from "react";

const filteredItems = useMemo(() => {
  return items.filter(item => item.active);
}, [items]);
```

3. **Use `next/image` for Images**
```tsx
import Image from "next/image";

<Image src="/logo.png" alt="Logo" width={40} height={40} />
```

## Useful References

- **Next.js Docs**: https://nextjs.org/docs
- **shadcn/ui**: https://ui.shadcn.com
- **Tailwind CSS**: https://tailwindcss.com
- **lucide-react**: https://lucide.dev
- **Zustand**: https://github.com/pmndrs/zustand

## Common Tasks

### Add a new navigation group
1. Update NAV_ITEMS in sidebar.tsx
2. Add group label to GROUP_LABELS
3. Update mobile-nav.tsx with same changes

### Change sidebar width
Edit these classes:
- `w-64` → expanded width
- `w-16` → collapsed width
- `lg:ml-64` or `lg:ml-16` → main content margin

### Add a new i18n language
1. Create new file: `src/i18n/[lang].json`
2. Update useI18n.ts to import new language
3. Add language option to preferences store

### Style a component
```tsx
import { cn } from "@/lib/utils";

<div className={cn(
  "base-classes",
  isActive && "active-classes",
  isDark && "dark-classes"
)}>
```

---

**Last Updated**: March 19, 2025
**Version**: 1.0
**Ready for Production**: ✅ Yes
