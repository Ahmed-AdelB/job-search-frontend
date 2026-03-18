"use client";

/**
 * Sidebar Component
 * Author: Ahmed Adel Bakr Alderai
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return pathname === "/dashboard" || pathname === "/dashboard/";
    }
    return pathname.startsWith(path);
  };

  const NavLink = ({ href, icon: Icon, label, count }: { href: string; icon: React.ElementType; label: string; count?: number }) => (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
        isActive(href)
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <Icon className="w-4 h-4 shrink-0" />
      {!isCollapsed && (
        <>
          <span className="flex-1 truncate">{label}</span>
          {count !== undefined && (
            <span className="text-xs bg-muted-foreground/20 px-2 py-0.5 rounded-full">
              {count}
            </span>
          )}
        </>
      )}
    </Link>
  );

  return (
    <aside
      className={cn(
        "fixed inset-y-0 start-0 z-40 flex flex-col bg-card border-e transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              JobFlow
            </span>
          )}
        </Link>
        {onToggle && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-8 w-8"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-6 px-2">
          {/* Overview */}
          <div className="space-y-1">
            {!isCollapsed && (
              <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Overview
              </h3>
            )}
            <NavLink href="/dashboard" icon={LayoutDashboard} label="Dashboard" />
            <NavLink href="/dashboard/analytics" icon={BarChart3} label="Analytics" />
            <NavLink href="/dashboard/notifications" icon={Bell} label="Notifications" count={3} />
          </div>

          <Separator />

          {/* Jobs */}
          <div className="space-y-1">
            {!isCollapsed && (
              <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Jobs
              </h3>
            )}
            <NavLink href="/dashboard/jobs" icon={Briefcase} label="Jobs" />
            <NavLink href="/dashboard/applications" icon={FileText} label="Applications" />
            <NavLink href="/dashboard/triage" icon={ListFilter} label="Triage" />
            <NavLink href="/dashboard/targets" icon={Target} label="Target List" />
          </div>

          <Separator />

          {/* CRM */}
          <div className="space-y-1">
            {!isCollapsed && (
              <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                CRM
              </h3>
            )}
            <NavLink href="/dashboard/contacts" icon={Users} label="Contacts" />
            <NavLink href="/dashboard/recruiters" icon={User} label="Recruiters" />
            <NavLink href="/dashboard/outreach" icon={Mail} label="Outreach" />
            <NavLink href="/dashboard/invitations" icon={MailOpen} label="Invitations" />
            <NavLink href="/dashboard/interviews" icon={Calendar} label="Interviews" />
          </div>

          <Separator />

          {/* Intelligence */}
          <div className="space-y-1">
            {!isCollapsed && (
              <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Intelligence
              </h3>
            )}
            <NavLink href="/dashboard/agents" icon={Bot} label="Agents" />
            <NavLink href="/dashboard/intelligence" icon={Brain} label="Intelligence" />
            <NavLink href="/dashboard/community" icon={UsersRound} label="Community" />
          </div>

          <Separator />

          {/* Admin */}
          <div className="space-y-1">
            {!isCollapsed && (
              <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Admin
              </h3>
            )}
            <NavLink href="/dashboard/deploy" icon={Rocket} label="Deploy" />
            <NavLink href="/dashboard/logs" icon={FileClock} label="Logs" />
            <NavLink href="/dashboard/admin" icon={Shield} label="Admin" />
            <NavLink href="/dashboard/settings" icon={Settings} label="Settings" />
            <NavLink href="/dashboard/billing" icon={CreditCard} label="Billing" />
          </div>
        </nav>
      </ScrollArea>
    </aside>
  );
}
