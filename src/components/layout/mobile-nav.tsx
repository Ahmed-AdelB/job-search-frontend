/**
 * Mobile Navigation - Sheet-based mobile navigation menu
 * Author: Ahmed Adel Bakr Alderai
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useI18n } from "@/hooks/useI18n";
import { useAuthStore } from "@/stores/auth-store";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { getNavKey } from "@/lib/nav-keys";
import {
  LayoutDashboard,
  Briefcase,
  FileCheck,
  Bot,
  Users,
  MessageSquare,
  UserCheck,
  Video,
  BarChart3,
  Zap,
  ListTodo,
  Target,
  User,
  Settings,
  CreditCard,
  Code,
  Terminal,
  Bell,
  Shield,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  group: "main" | "people" | "insights" | "account" | "system";
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  // MAIN
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
    group: "main",
  },
  {
    label: "Jobs",
    href: "/dashboard/jobs",
    icon: <Briefcase className="h-5 w-5" />,
    group: "main",
  },
  {
    label: "Applications",
    href: "/dashboard/applications",
    icon: <FileCheck className="h-5 w-5" />,
    group: "main",
  },
  {
    label: "Agents",
    href: "/dashboard/agents",
    icon: <Bot className="h-5 w-5" />,
    group: "main",
  },

  // PEOPLE
  {
    label: "Contacts",
    href: "/dashboard/contacts",
    icon: <Users className="h-5 w-5" />,
    group: "people",
  },
  {
    label: "Outreach",
    href: "/dashboard/outreach",
    icon: <MessageSquare className="h-5 w-5" />,
    group: "people",
  },
  {
    label: "Recruiters",
    href: "/dashboard/recruiters",
    icon: <UserCheck className="h-5 w-5" />,
    group: "people",
  },
  {
    label: "Interviews",
    href: "/dashboard/interviews",
    icon: <Video className="h-5 w-5" />,
    group: "people",
  },

  // INSIGHTS
  {
    label: "Analytics",
    href: "/dashboard/analytics",
    icon: <BarChart3 className="h-5 w-5" />,
    group: "insights",
  },
  {
    label: "Intelligence",
    href: "/dashboard/intelligence",
    icon: <Zap className="h-5 w-5" />,
    group: "insights",
  },
  {
    label: "Target List",
    href: "/dashboard/target-list",
    icon: <Target className="h-5 w-5" />,
    group: "insights",
  },
  {
    label: "Triage",
    href: "/dashboard/triage",
    icon: <ListTodo className="h-5 w-5" />,
    group: "insights",
  },

  // ACCOUNT
  {
    label: "Profile",
    href: "/dashboard/profile",
    icon: <User className="h-5 w-5" />,
    group: "account",
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: <Settings className="h-5 w-5" />,
    group: "account",
  },
  {
    label: "Billing",
    href: "/dashboard/billing",
    icon: <CreditCard className="h-5 w-5" />,
    group: "account",
  },

  // SYSTEM
  {
    label: "Deploy",
    href: "/dashboard/deploy",
    icon: <Code className="h-5 w-5" />,
    group: "system",
  },
  {
    label: "Logs",
    href: "/dashboard/logs",
    icon: <Terminal className="h-5 w-5" />,
    group: "system",
  },
  {
    label: "Notifications",
    href: "/dashboard/notifications",
    icon: <Bell className="h-5 w-5" />,
    group: "system",
  },
  {
    label: "Admin",
    href: "/dashboard/admin",
    icon: <Shield className="h-5 w-5" />,
    group: "system",
    adminOnly: true,
  },
];

const GROUP_LABELS: Record<string, string> = {
  main: "Main",
  people: "People",
  insights: "Insights",
  account: "Account",
  system: "System",
};

interface MobileNavProps {
  isAdmin?: boolean;
}

export function MobileNav({ isAdmin = false }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { t } = useI18n();

  const filteredItems = NAV_ITEMS.filter(
    (item) => !item.adminOnly || isAdmin
  );

  const groupedItems = filteredItems.reduce(
    (acc, item) => {
      if (!acc[item.group]) {
        acc[item.group] = [];
      }
      acc[item.group].push(item);
      return acc;
    },
    {} as Record<string, NavItem[]>
  );

  const isActive = (href: string): boolean => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  const userInitials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U";

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="h-9 w-9 p-0 md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-64 flex flex-col">
        {/* App Name */}
        <div className="h-16 flex items-center px-4 border-b border-border">
          <h2 className="font-bold text-lg">JobFlow</h2>
        </div>

        {/* User Section */}
        <div className="px-4 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.name || user?.email}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1">
          <nav className="px-2 py-4 space-y-6">
            {(["main", "people", "insights", "account", "system"] as const).map(
              (group) => {
                const items = groupedItems[group];
                if (!items || items.length === 0) return null;

                return (
                  <div key={group}>
                    <h3 className="px-2 text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">
                      {GROUP_LABELS[group]}
                    </h3>
                    <div className="space-y-1 mt-2">
                      {items.map((item) => {
                        const active = isActive(item.href);
                        const navKey = getNavKey(item.label);
                        const translatedLabel = t(`nav.${navKey}`) || item.label;

                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              className={cn(
                                "w-full justify-start gap-3 px-3",
                                active &&
                                  "bg-accent text-accent-foreground"
                              )}
                            >
                              {item.icon}
                              <span>{translatedLabel}</span>
                            </Button>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              }
            )}
          </nav>
        </ScrollArea>

        {/* Logout Button */}
        <div className="border-t border-border p-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsOpen(false);
              logout();
            }}
            className="w-full"
          >
            {t("auth.logoutSuccess") || "Logout"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
