"use client";

/**
 * Dashboard Layout - Protected route with sidebar and topbar
 * Author: Ahmed Adel Bakr Alderai
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { usePreferencesStore } from "@/stores/preferences-store";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const { isAuthenticated, checkAuth, isLoading } = useAuthStore();
  const { language } = usePreferencesStore();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    checkAuth();
  }, [checkAuth]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (isMounted && !isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isMounted, isLoading, isAuthenticated, router]);

  // Set HTML lang and dir attributes
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = language;
      document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    }
  }, [language]);

  // Show loading state while checking auth
  if (!isMounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Don't render dashboard if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar 
          isCollapsed={isSidebarCollapsed} 
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
        />
      </div>

      {/* Main Content Area */}
      <div
        className={`
          transition-all duration-300
          ${isSidebarCollapsed ? "lg:ms-16" : "lg:ms-64"}
        `}
      >
        {/* Topbar with mobile nav */}
        <div className="flex items-center">
          <div className="lg:hidden p-4">
            <MobileNav />
          </div>
          <div className="flex-1">
            <Topbar />
          </div>
        </div>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
