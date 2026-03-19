"use client";

/**
 * Sidebar Component - Command Center Navigation
 * Author: Ahmed Adel Bakr Alderai
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Zap,
  LayoutDashboard,
  Briefcase,
  Bot,
  FileText,
  Calendar,
  Users,
  Mail,
  BarChart3,
  Brain,
  Settings,
  CreditCard,
  User,
  Rocket,
  FileClock,
  Shield,
  UsersRound,
  MailOpen,
  Target,
  ListFilter,
  Bell,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface SidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

const navSections = [
  {
    label: "Overview",
    items: [
      { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { href: "/dashboard/analytics", icon: BarChart3, label: "Analytics" },
      { href: "/dashboard/notifications", icon: Bell, label: "Alerts", count: 3 },
    ],
  },
  {
    label: "Pipeline",
    items: [
      { href: "/dashboard/jobs", icon: Briefcase, label: "Jobs" },
      { href: "/dashboard/applications", icon: FileText, label: "Applications" },
      { href: "/dashboard/triage", icon: ListFilter, label: "Triage" },
      { href: "/dashboard/targets", icon: Target, label: "Targets" },
    ],
  },
  {
    label: "Network",
    items: [
      { href: "/dashboard/contacts", icon: Users, label: "Contacts" },
      { href: "/dashboard/recruiters", icon: User, label: "Recruiters" },
      { href: "/dashboard/outreach", icon: Mail, label: "Outreach" },
      { href: "/dashboard/invitations", icon: MailOpen, label: "Invitations" },
      { href: "/dashboard/interviews", icon: Calendar, label: "Interviews" },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { href: "/dashboard/agents", icon: Bot, label: "Agents" },
      { href: "/dashboard/intelligence", icon: Brain, label: "Intel Hub" },
      { href: "/dashboard/community", icon: UsersRound, label: "Community" },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/dashboard/deploy", icon: Rocket, label: "Deploy" },
      { href: "/dashboard/logs", icon: FileClock, label: "Logs" },
      { href: "/dashboard/admin", icon: Shield, label: "Admin" },
      { href: "/dashboard/settings", icon: Settings, label: "Settings" },
      { href: "/dashboard/billing", icon: CreditCard, label: "Billing" },
    ],
  },
];

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return pathname === "/dashboard" || pathname === "/dashboard/";
    }
    return pathname.startsWith(path);
  };

  return (
    <aside
      className={cn(
        "fixed inset-y-0 start-0 z-40 flex flex-col border-e border-border/50 transition-all duration-300",
        "bg-sidebar-background/80 backdrop-blur-xl",
        isCollapsed ? "w-[60px]" : "w-60"
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center justify-between px-3 border-b border-border/50">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl gradient-brand flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
            <Zap className="w-4.5 h-4.5 text-white" />
          </div>
          {!isCollapsed && (
            <span className="text-lg font-bold text-gradient-brand tracking-tight">
              JobFlow
            </span>
          )}
        </Link>
        {onToggle && !isCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </Button>
        )}
        {onToggle && isCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-7 w-7 text-muted-foreground hover:text-foreground absolute -end-3 top-3.5 bg-card border border-border/50 rounded-full shadow-sm"
          >
            <ChevronRight className="w-3 h-3" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-3">
        <nav className="space-y-5 px-2">
          {navSections.map((section) => (
            <div key={section.label} className="space-y-0.5">
              {!isCollapsed && (
                <p className="px-3 mb-1.5 text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-[0.15em]">
                  {section.label}
                </p>
              )}
              {section.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all duration-200",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                      isCollapsed && "justify-center px-0"
                    )}
                  >
                    {/* Active indicator bar */}
                    {active && (
                      <div className="absolute start-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-e-full bg-primary" />
                    )}
                    <item.icon className={cn("w-4 h-4 shrink-0", active && "text-primary")} />
                    {!isCollapsed && (
                      <>
                        <span className="flex-1 truncate">{item.label}</span>
                        {item.count !== undefined && (
                          <span className={cn(
                            "text-[10px] font-semibold px-1.5 py-0.5 rounded-full min-w-[20px] text-center",
                            active
                              ? "bg-primary/20 text-primary"
                              : "bg-muted text-muted-foreground"
                          )}>
                            {item.count}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </ScrollArea>
    </aside>
  );
}
