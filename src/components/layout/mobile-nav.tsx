"use client";

/**
 * Mobile Navigation Component
 * Author: Ahmed Adel Bakr Alderai
 */

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Menu, Zap, LayoutDashboard, Briefcase, Bot, FileText, Calendar, Users, Mail, BarChart3, Brain, Settings, CreditCard, User, Rocket, FileClock, Shield, UsersRound, MailOpen, Target, ListFilter, Bell } from "lucide-react";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/jobs" && pathname === "/") {
      return true;
    }
    return pathname === path || pathname.startsWith(path + "/");
  };

  const NavLink = ({ href, icon: Icon, label, onClick }: { href: string; icon: React.ElementType; label: string; onClick?: () => void }) => (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
        isActive(href)
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <Icon className="w-5 h-5 shrink-0" />
      <span className="flex-1">{label}</span>
    </Link>
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="w-5 h-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex h-16 items-center px-4 border-b">
            <Link href="/jobs" className="flex items-center gap-2" onClick={() => setOpen(false)}>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                JobFlow
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 py-4">
            <nav className="space-y-6 px-3">
              {/* Overview */}
              <div className="space-y-1">
                <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Overview
                </h3>
                <NavLink href="/jobs" icon={LayoutDashboard} label="Dashboard" onClick={() => setOpen(false)} />
                <NavLink href="/analytics" icon={BarChart3} label="Analytics" onClick={() => setOpen(false)} />
                <NavLink href="/notifications" icon={Bell} label="Notifications" onClick={() => setOpen(false)} />
              </div>

              <Separator />

              {/* Jobs */}
              <div className="space-y-1">
                <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Jobs
                </h3>
                <NavLink href="/jobs" icon={Briefcase} label="Jobs" onClick={() => setOpen(false)} />
                <NavLink href="/applications" icon={FileText} label="Applications" onClick={() => setOpen(false)} />
                <NavLink href="/triage" icon={ListFilter} label="Triage" onClick={() => setOpen(false)} />
                <NavLink href="/target-list" icon={Target} label="Target List" onClick={() => setOpen(false)} />
              </div>

              <Separator />

              {/* CRM */}
              <div className="space-y-1">
                <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  CRM
                </h3>
                <NavLink href="/contacts" icon={Users} label="Contacts" onClick={() => setOpen(false)} />
                <NavLink href="/recruiters" icon={User} label="Recruiters" onClick={() => setOpen(false)} />
                <NavLink href="/outreach" icon={Mail} label="Outreach" onClick={() => setOpen(false)} />
                <NavLink href="/invitations" icon={MailOpen} label="Invitations" onClick={() => setOpen(false)} />
                <NavLink href="/interviews" icon={Calendar} label="Interviews" onClick={() => setOpen(false)} />
              </div>

              <Separator />

              {/* Intelligence */}
              <div className="space-y-1">
                <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Intelligence
                </h3>
                <NavLink href="/agents" icon={Bot} label="Agents" onClick={() => setOpen(false)} />
                <NavLink href="/intelligence" icon={Brain} label="Intelligence" onClick={() => setOpen(false)} />
                <NavLink href="/community" icon={UsersRound} label="Community" onClick={() => setOpen(false)} />
              </div>

              <Separator />

              {/* Admin */}
              <div className="space-y-1">
                <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Admin
                </h3>
                <NavLink href="/deploy" icon={Rocket} label="Deploy" onClick={() => setOpen(false)} />
                <NavLink href="/logs" icon={FileClock} label="Logs" onClick={() => setOpen(false)} />
                <NavLink href="/admin" icon={Shield} label="Admin" onClick={() => setOpen(false)} />
                <NavLink href="/settings" icon={Settings} label="Settings" onClick={() => setOpen(false)} />
                <NavLink href="/billing" icon={CreditCard} label="Billing" onClick={() => setOpen(false)} />
              </div>
            </nav>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
