"use client";

/**
 * Sidebar Component - Command Center Navigation
 * Mission Control Aesthetic with Glass Morphism
 * Author: Ahmed Adel Bakr Alderai
 */

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
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

// Animation variants
const sidebarVariants = {
  expanded: {
    width: 240,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 30,
    },
  },
  collapsed: {
    width: 56,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 30,
    },
  },
};

const textVariants = {
  expanded: {
    opacity: 1,
    x: 0,
    transition: {
      delay: 0.05,
      duration: 0.2,
    },
  },
  collapsed: {
    opacity: 0,
    x: -10,
    transition: {
      duration: 0.15,
    },
  },
};

const sectionLabelVariants = {
  expanded: {
    opacity: 1,
    height: "auto",
    transition: {
      delay: 0.08,
      duration: 0.2,
    },
  },
  collapsed: {
    opacity: 0,
    height: 0,
    transition: {
      duration: 0.15,
    },
  },
};

export function Sidebar({ isCollapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);

  // Hover-to-expand: if externally collapsed, expand on hover
  const isActuallyExpanded = !isCollapsed || isHovered;

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return pathname === "/dashboard" || pathname === "/dashboard/";
    }
    return pathname.startsWith(path);
  };

  return (
    <motion.aside
      initial={isCollapsed ? "collapsed" : "expanded"}
      animate={isActuallyExpanded ? "expanded" : "collapsed"}
      variants={sidebarVariants}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "fixed inset-y-0 start-0 z-40 flex flex-col",
        "border-e border-border/30",
        "backdrop-blur-xl",
        "dark:bg-white/5 bg-white/80",
        "transition-shadow duration-300",
        isHovered && !isCollapsed && "shadow-2xl shadow-brand-500/5"
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center justify-between px-3 border-b border-border/30 shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2.5 overflow-hidden">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-8 h-8 rounded-xl gradient-brand flex items-center justify-center shrink-0 shadow-lg shadow-brand-500/20"
          >
            <Zap className="w-4.5 h-4.5 text-white" />
          </motion.div>
          <AnimatePresence mode="wait">
            {isActuallyExpanded && (
              <motion.span
                variants={textVariants}
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
                className="text-lg font-bold text-gradient-brand tracking-tight whitespace-nowrap"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                JobFlow
              </motion.span>
            )}
          </AnimatePresence>
        </Link>

        {/* Toggle Button - Only show when expanded */}
        <AnimatePresence mode="wait">
          {onToggle && isActuallyExpanded && (
            <motion.div
              variants={textVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggle}
                className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-white/10"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapsed toggle button - positioned absolutely */}
        {onToggle && !isActuallyExpanded && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-7 w-7 text-muted-foreground hover:text-foreground absolute -end-3 top-3.5 bg-card/80 backdrop-blur-sm border border-border/30 rounded-full shadow-sm hover:shadow-md hover:shadow-brand-500/20 transition-shadow"
          >
            <ChevronRight className="w-3 h-3" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-3">
        <nav className="space-y-1 px-2">
          {navSections.map((section, sectionIndex) => (
            <div key={section.label} className="space-y-1">
              {/* Section Label */}
              <AnimatePresence mode="wait">
                {isActuallyExpanded && (
                  <motion.div
                    variants={sectionLabelVariants}
                    initial="collapsed"
                    animate="expanded"
                    exit="collapsed"
                    className="overflow-hidden"
                  >
                    <p
                      className="px-3 mb-1.5 text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-[0.15em]"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      {section.label}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Nav Items */}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link key={item.href} href={item.href} className="block">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                          "relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-200",
                          "hover:shadow-md hover:shadow-brand-500/10",
                          active
                            ? "bg-brand-500/10 text-brand-400"
                            : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                          !isActuallyExpanded && "justify-center px-0"
                        )}
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        {/* Active indicator bar */}
                        {active && (
                          <motion.div
                            layoutId="activeIndicator"
                            className="absolute start-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-e-full"
                            style={{ backgroundColor: "var(--brand-500)" }}
                            initial={{ scaleY: 0 }}
                            animate={{ scaleY: 1 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          />
                        )}

                        {/* Icon */}
                        <item.icon
                          className={cn(
                            "w-4 h-4 shrink-0 transition-colors",
                            active ? "text-brand-400" : "text-muted-foreground/70"
                          )}
                        />

                        {/* Label & Count - Only show when expanded */}
                        <AnimatePresence mode="wait">
                          {isActuallyExpanded && (
                            <motion.div
                              variants={textVariants}
                              initial="collapsed"
                              animate="expanded"
                              exit="collapsed"
                              className="flex items-center flex-1 overflow-hidden"
                            >
                              <span className="flex-1 truncate">{item.label}</span>
                              {item.count !== undefined && (
                                <span
                                  className={cn(
                                    "text-[10px] font-semibold px-1.5 py-0.5 rounded-full min-w-[20px] text-center ml-2",
                                    active
                                      ? "bg-brand-500/20 text-brand-400"
                                      : "bg-white/10 text-muted-foreground"
                                  )}
                                >
                                  {item.count}
                                </span>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Tooltip for collapsed mode */}
                        {!isActuallyExpanded && (
                          <div className="absolute left-full ml-2 px-2 py-1 bg-popover border border-border/30 rounded-md text-xs font-medium text-popover-foreground opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-lg">
                            {item.label}
                          </div>
                        )}
                      </motion.div>
                    </Link>
                  );
                })}
              </div>

              {/* Gradient Divider between sections */}
              {sectionIndex < navSections.length - 1 && (
                <div className="my-3 mx-2">
                  <div
                    className={cn(
                      "h-px",
                      isActuallyExpanded
                        ? "bg-gradient-to-r from-transparent via-border/50 to-transparent"
                        : "bg-border/30"
                    )}
                  />
                </div>
              )}
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* Bottom Status Indicator - Optional mission control feel */}
      <div className="shrink-0 p-3 border-t border-border/30">
        <motion.div
          className={cn(
            "flex items-center gap-2 rounded-lg px-2 py-1.5",
            "bg-white/5 dark:bg-white/5",
            !isActuallyExpanded && "justify-center"
          )}
        >
          <div className="relative flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
            <div className="absolute w-3 h-3 rounded-full bg-success-500/30 animate-ping" />
          </div>
          <AnimatePresence mode="wait">
            {isActuallyExpanded && (
              <motion.span
                variants={textVariants}
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
                className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                System Online
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.aside>
  );
}
