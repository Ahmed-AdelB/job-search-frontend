/**
 * Topbar - Top navigation bar with search, theme toggle, and user menu
 * Author: Ahmed Adel Bakr Alderai
 */

"use client";

import { useState } from "react";
import { Menu, Search, Sun, Moon, Globe, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { usePreferencesStore } from "@/stores/preferences-store";
import { useAuthStore } from "@/stores/auth-store";
import { useI18n } from "@/hooks/useI18n";
import { Breadcrumbs } from "./breadcrumbs";
import { MobileNav } from "./mobile-nav";

interface TopbarProps {
  notificationCount?: number;
}

export function Topbar({ notificationCount = 0 }: TopbarProps) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const theme = usePreferencesStore((state) => state.theme);
  const setTheme = usePreferencesStore((state) => state.setTheme);
  const language = usePreferencesStore((state) => state.language);
  const toggleLanguage = usePreferencesStore((state) => state.toggleLanguage);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { t } = useI18n();

  const userInitials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U";

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme as "light" | "dark" | "system");
    // Apply theme to document
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else if (newTheme === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      // system - check system preference
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      if (prefersDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-40">
      <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Mobile Menu & Breadcrumbs */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="md:hidden">
            <MobileNav />
          </div>
          <div className="hidden md:block flex-1 min-w-0">
            <Breadcrumbs />
          </div>
        </div>

        {/* Search (Desktop) */}
        <div className="hidden sm:flex items-center flex-1 max-w-sm mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("common.search") || "Search..."}
              className="pl-10 bg-muted/50 border-0 focus-visible:bg-background"
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Theme Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                {theme === "dark" ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                {t("common.theme") || "Theme"}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleThemeChange("light")}>
                <Sun className="h-4 w-4 mr-2" />
                {t("common.light") || "Light"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleThemeChange("dark")}>
                <Moon className="h-4 w-4 mr-2" />
                {t("common.dark") || "Dark"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleThemeChange("system")}>
                <Globe className="h-4 w-4 mr-2" />
                {t("common.system") || "System"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Language Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="h-9 w-9 p-0 hidden sm:inline-flex"
            title={language === "en" ? "العربية" : "English"}
          >
            <Globe className="h-4 w-4" />
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="h-9 w-9 p-0 relative">
            <Bell className="h-4 w-4" />
            {notificationCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {notificationCount > 9 ? "9+" : notificationCount}
              </Badge>
            )}
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">{user?.name || "User"}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <a href="/dashboard/profile">{t("nav.profile") || "Profile"}</a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/dashboard/settings">
                  {t("nav.settings") || "Settings"}
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/dashboard/billing">{t("nav.billing") || "Billing"}</a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={logout}
                className="text-destructive focus:text-destructive"
              >
                {t("auth.logoutSuccess") || "Logout"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
