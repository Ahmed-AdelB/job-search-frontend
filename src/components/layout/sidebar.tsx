/**
 * Sidebar - Dashboard sidebar navigation
 * Author: Ahmed Adel Bakr Alderai
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  Inbox,
  User,
  Settings,
  CreditCard,
  Code,
  Terminal,
  Bell,
  Shield,
  Users2,
  MessageCircle,
  Target,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { usePreferencesStore } from "@/stores/preferences-store";
import { useAuthStore } from "@/stores/auth-store";
import { useI18n } from "@/hooks/useI18n";
import { cn } from "@/lib/utils";
import { getNavKey } from "@/lib/nav-keys";

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

interface SidebarProps {
  isAdmin?: boolean;
}

export function Sidebar({ isAdmin = false }: SidebarProps) {
  const pathname = usePathname();
  const sidebarCollapsed = usePreferencesStore(
    (state) => state.sidebarCollapsed
  );
  const toggleSidebar = usePreferencesStore((state) => state.toggleSidebar);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { t } = useI18n();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!mounted) {
    return null;
  }

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 ease-in-out",
        sidebarCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo/App Name */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
        {!sidebarCollapsed && (
          <Link href="/dashboard" className="font-bold text-lg">
            JobFlow
          </Link>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="h-8 w-8 p-0"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-6">
        {(["main", "people", "insights", "account", "system"] as const).map(
          (group) => {
            const items = groupedItems[group];
            if (!items || items.length === 0) return null;

            return (
              <div key={group}>
                {!sidebarCollapsed && (
                  <h3 className="px-2 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
                    {GROUP_LABELS[group]}
                  </h3>
                )}
                <div className={sidebarCollapsed ? "space-y-1" : "space-y-1 mt-2"}>
                  {items.map((item) => {
                    const active = isActive(item.href);
                    const navKey = getNavKey(item.label);
                    const translatedLabel = t(`nav.${navKey}`) || item.label;

                    return sidebarCollapsed ? (
                      <Tooltip key={item.href}>
                        <TooltipTrigger asChild>
                          <Link href={item.href}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className={cn(
                                "w-full h-10 p-0 justify-center",
                                active &&
                                  "bg-sidebar-accent text-sidebar-accent-foreground"
                              )}
                            >
                              {item.icon}
                            </Button>
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right" align="center">
                          {translatedLabel}
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <Link key={item.href} href={item.href}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "w-full justify-start gap-3 px-3",
                            active &&
                              "bg-sidebar-accent text-sidebar-accent-foreground"
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

      {/* Separator */}
      <Separator className="my-2" />

      {/* User Section */}
      <div className="p-4 border-t border-sidebar-border">
        {sidebarCollapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center justify-center">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">
              <div className="text-center">
                <p className="font-medium">{user?.name || user?.email}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </TooltipContent>
          </Tooltip>
        ) : (
          <div className="flex flex-col gap-3">
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
                <p className="text-xs text-sidebar-foreground/50 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="w-full text-xs"
            >
              {t("auth.logoutSuccess") || "Logout"}
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
}
