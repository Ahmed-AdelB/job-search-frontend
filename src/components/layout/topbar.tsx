"use client";

/**
 * Topbar Component - Command Center / Mission Control Aesthetic
 * Author: Ahmed Adel Bakr Alderai
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { useAuthStore } from "@/stores/auth-store";
import { usePreferencesStore } from "@/stores/preferences-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Sun,
  Moon,
  Monitor,
  Globe,
  LogOut,
  User,
  Settings,
  CreditCard,
  Bell,
  ChevronRight,
  Command,
  Radio,
} from "lucide-react";

interface TopbarProps {
  onMenuClick?: () => void;
}

// Mock unread count - in real app would come from notifications store
const UNREAD_COUNT = 3;

export function Topbar({ onMenuClick }: TopbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { language, theme, setLanguage, setTheme } = usePreferencesStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect for enhanced glass border
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Keyboard shortcut for search (⌘K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        const searchInput = document.querySelector(
          "[data-search-input]"
        ) as HTMLInputElement;
        searchInput?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Generate breadcrumbs from pathname
  const generateBreadcrumbs = () => {
    const segments = pathname
      .split("/")
      .filter((segment) => segment && segment !== "dashboard");

    const breadcrumbs = [
      {
        label: "Dashboard",
        href: "/jobs",
      },
    ];

    let currentPath = "";
    segments.forEach((segment) => {
      currentPath += `/${segment}`;
      const label = segment.replace(/-/g, " ");
      breadcrumbs.push({
        label: label.charAt(0).toUpperCase() + label.slice(1),
        href: currentPath,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn(
        "sticky top-0 z-50 w-full",
        "backdrop-blur-xl",
        "bg-background/60",
        "border-b border-white/10",
        "transition-all duration-300 ease-out",
        scrolled && "shadow-lg shadow-black/10"
      )}
    >
      <div className="flex h-16 items-center gap-4 px-4 sm:px-6">
        {/* Logo / Brand - Mission Control Style */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="flex items-center gap-3 shrink-0"
        >
          <Link
            href="/jobs"
            className="flex items-center gap-2.5 group"
          >
            {/* Mission Control Indicator */}
            <div className="relative">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-600/30 group-hover:shadow-indigo-600/50 transition-shadow duration-300">
                <Radio className="w-4 h-4 text-white" />
              </div>
              {/* Status pulse */}
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-cyan-400 rounded-full border-2 border-background animate-pulse">
                <span className="absolute inset-0 rounded-full bg-cyan-400 animate-ping opacity-75" />
              </span>
            </div>
            {/* Brand Text */}
            <div className="hidden sm:flex flex-col">
              <span
                className="text-sm font-semibold tracking-tight text-foreground"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                COMMAND
              </span>
              <span className="text-[10px] text-muted-foreground -mt-1 tracking-widest uppercase">
                Center
              </span>
            </div>
          </Link>

          {/* Breadcrumb Separator */}
          <div className="hidden md:flex items-center text-muted-foreground/40">
            <span className="text-xs">/</span>
          </div>

          {/* Breadcrumbs */}
          <nav className="hidden md:flex items-center gap-1.5">
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.href} className="flex items-center gap-1.5">
                {index > 0 && (
                  <span className="text-muted-foreground/40 text-xs">/</span>
                )}
                {index === breadcrumbs.length - 1 ? (
                  <span className="text-xs font-medium text-foreground/90">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    {crumb.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </motion.div>

        {/* Refined Search - Command Center Style */}
        <motion.form
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.3 }}
          onSubmit={handleSearch}
          className="flex-1 max-w-xl hidden sm:block"
        >
          <div
            className={cn(
              "relative group",
              "transition-all duration-300 ease-out"
            )}
          >
            {/* Glow effect on focus */}
            <div
              className={cn(
                "absolute -inset-0.5 rounded-xl",
                "bg-gradient-to-r from-indigo-500/20 via-violet-500/20 to-indigo-500/20",
                "opacity-0 blur-sm",
                "transition-opacity duration-300",
                isSearchFocused ? "opacity-100" : "group-hover:opacity-50"
              )}
            />
            <div className="relative">
              <Search
                className={cn(
                  "absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4",
                  "transition-colors duration-200",
                  isSearchFocused ? "text-indigo-600" : "text-muted-foreground/60"
                )}
              />
              <Input
                type="search"
                data-search-input
                placeholder="Search missions, contacts, intel..."
                className={cn(
                  "w-full h-10 pl-10 pr-20",
                  "bg-white/50 dark:bg-white/5",
                  "border border-white/20 dark:border-white/10",
                  "rounded-xl",
                  "text-sm placeholder:text-muted-foreground/50",
                  "transition-all duration-200",
                  "focus:bg-white/70 dark:focus:bg-white/10",
                  "focus:border-indigo-500/50 dark:focus:border-indigo-500/30",
                  "focus:ring-0",
                  "backdrop-blur-sm"
                )}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
              {/* Keyboard Shortcut Hint */}
              <kbd
                className={cn(
                  "absolute right-3 top-1/2 -translate-y-1/2",
                  "hidden sm:flex items-center gap-0.5",
                  "px-1.5 py-0.5",
                  "text-[10px] font-medium",
                  "bg-white/80 dark:bg-white/10",
                  "text-muted-foreground",
                  "rounded-md border border-white/20 dark:border-white/10",
                  "transition-opacity duration-200",
                  isSearchFocused ? "opacity-0" : "opacity-100"
                )}
              >
                <Command className="w-2.5 h-2.5" />
                <span>K</span>
              </kbd>
            </div>
          </div>
        </motion.form>

        <div className="flex-1 sm:hidden" />

        {/* Actions - Mission Control Style */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="flex items-center gap-1 sm:gap-2"
        >
          {/* Language Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/10 dark:hover:bg-white/5 transition-all duration-200"
              >
                <Globe className="w-4 h-4" />
                <span className="sr-only">Toggle language</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-40 bg-background/95 backdrop-blur-xl border border-white/10"
            >
              <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">
                Language
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuRadioGroup
                value={language}
                onValueChange={(v) => setLanguage(v as "en" | "ar")}
              >
                <DropdownMenuRadioItem
                  value="en"
                  className="text-sm cursor-pointer focus:bg-white/10"
                >
                  English
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value="ar"
                  className="text-sm cursor-pointer focus:bg-white/10"
                >
                  العربية
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/10 dark:hover:bg-white/5 transition-all duration-200"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {theme === "light" && (
                    <motion.div
                      key="sun"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Sun className="w-4 h-4" />
                    </motion.div>
                  )}
                  {theme === "dark" && (
                    <motion.div
                      key="moon"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Moon className="w-4 h-4" />
                    </motion.div>
                  )}
                  {theme === "system" && (
                    <motion.div
                      key="monitor"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Monitor className="w-4 h-4" />
                    </motion.div>
                  )}
                </AnimatePresence>
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-40 bg-background/95 backdrop-blur-xl border border-white/10"
            >
              <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">
                Theme
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuRadioGroup
                value={theme}
                onValueChange={(v) =>
                  setTheme(v as "light" | "dark" | "system")
                }
              >
                <DropdownMenuRadioItem
                  value="light"
                  className="text-sm cursor-pointer focus:bg-white/10"
                >
                  <Sun className="w-3.5 h-3.5 mr-2" />
                  Light
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value="dark"
                  className="text-sm cursor-pointer focus:bg-white/10"
                >
                  <Moon className="w-3.5 h-3.5 mr-2" />
                  Dark
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value="system"
                  className="text-sm cursor-pointer focus:bg-white/10"
                >
                  <Monitor className="w-3.5 h-3.5 mr-2" />
                  System
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications - Animated Badge */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative"
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/10 dark:hover:bg-white/5 transition-all duration-200"
            >
              <Bell className="w-4 h-4" />
              <span className="sr-only">Notifications</span>

              {/* Animated Badge with Pulse */}
              {UNREAD_COUNT > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 15,
                  }}
                  className="absolute top-1.5 right-1.5"
                >
                  <Badge
                    variant="destructive"
                    className="h-4 min-w-4 px-1 flex items-center justify-center text-[9px] font-bold bg-rose-500 border-0 shadow-lg shadow-rose-500/30"
                  >
                    {UNREAD_COUNT > 9 ? "9+" : UNREAD_COUNT}
                  </Badge>
                  {/* Pulse ring */}
                  <span className="absolute inset-0 rounded-full bg-rose-500 animate-ping opacity-40" />
                </motion.div>
              )}
            </Button>
          </motion.div>

          {/* User Menu - Gradient Ring Avatar */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-9 w-9 p-0.5 rounded-full group"
              >
                {/* Gradient Ring Border */}
                <div
                  className={cn(
                    "absolute inset-0 rounded-full",
                    "bg-gradient-to-br from-indigo-600 to-violet-600",
                    "p-[2px]",
                    "group-hover:from-indigo-500 group-hover:to-violet-500",
                    "transition-all duration-300"
                  )}
                >
                  <div className="w-full h-full rounded-full bg-background" />
                </div>
                {/* Avatar */}
                <Avatar className="relative h-full w-full rounded-full">
                  <AvatarImage
                    src={user?.avatar}
                    alt={user?.email}
                    className="object-cover"
                  />
                  <AvatarFallback
                    className="bg-gradient-to-br from-indigo-600/10 to-violet-600/10 text-foreground text-xs font-medium"
                  >
                    {user?.name
                      ? getInitials(user.name)
                      : user?.email?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                {/* Online indicator */}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-cyan-400 rounded-full border-2 border-background" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-64 bg-background/95 backdrop-blur-xl border border-white/10"
            >
              {/* User Info Header */}
              <DropdownMenuLabel className="font-normal p-3">
                <div className="flex items-center gap-3">
                  {/* Avatar in dropdown */}
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 p-[2px]">
                      <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                        <span className="text-sm font-medium text-foreground">
                          {user?.name
                            ? getInitials(user.name)
                            : user?.email?.[0]?.toUpperCase() || "U"}
                        </span>
                      </div>
                    </div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-cyan-400 rounded-full border-2 border-background" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {user?.name || "Commander"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.email || "ops@command.center"}
                    </p>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />

              {/* Menu Items */}
              <DropdownMenuItem asChild>
                <Link
                  href="/profile"
                  className="cursor-pointer flex items-center gap-2 text-sm focus:bg-white/10"
                >
                  <User className="w-4 h-4 text-muted-foreground" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="/settings"
                  className="cursor-pointer flex items-center gap-2 text-sm focus:bg-white/10"
                >
                  <Settings className="w-4 h-4 text-muted-foreground" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="/billing"
                  className="cursor-pointer flex items-center gap-2 text-sm focus:bg-white/10"
                >
                  <CreditCard className="w-4 h-4 text-muted-foreground" />
                  Billing
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem
                onClick={logout}
                className="cursor-pointer flex items-center gap-2 text-sm text-rose-500 focus:text-rose-500 focus:bg-rose-500/10"
              >
                <LogOut className="w-4 h-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </motion.div>
      </div>
    </motion.header>
  );
}

// Import cn utility function
import { cn } from "@/lib/utils";
