/**
 * Dashboard Layout - Main layout for dashboard pages
 * Author: Ahmed Adel Bakr Alderai
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { useAuthStore } from "@/stores/auth-store";
import { usePreferencesStore } from "@/stores/preferences-store";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const sidebarCollapsed = usePreferencesStore(
    (state) => state.sidebarCollapsed
  );
  const language = usePreferencesStore((state) => state.language);

  useEffect(() => {
    setMounted(true);
    // Check authentication on mount
    const authenticated = checkAuth();
    if (!authenticated) {
      router.push("/login");
    }
  }, [checkAuth, router]);

  useEffect(() => {
    // Set language and direction on mount and when language changes
    if (typeof document !== "undefined") {
      document.documentElement.lang = language;
      document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    }
  }, [language]);

  if (!mounted || !isAuthenticated) {
    return null;
  }

  return (
    <div className="h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content wrapper */}
      <div
        className={cn(
          "transition-all duration-300 ease-in-out",
          sidebarCollapsed ? "lg:ml-16" : "lg:ml-64"
        )}
      >
        {/* Topbar */}
        <Topbar />

        {/* Main content */}
        <main className="h-[calc(100vh-64px)] overflow-y-auto pt-16">
          <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
