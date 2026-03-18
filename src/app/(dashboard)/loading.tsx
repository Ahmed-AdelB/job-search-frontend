/**
 * Dashboard Loading State
 * Displayed while dashboard content is loading
 * Author: Ahmed Adel Bakr Alderai
 */

import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar skeleton - hidden on mobile */}
      <div className="hidden lg:block fixed left-0 top-0 w-64 h-screen border-r bg-muted/30"></div>

      {/* Main content area */}
      <div className="lg:ms-64">
        {/* Topbar skeleton */}
        <div className="border-b h-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"></div>

        {/* Content area with skeleton */}
        <main className="p-4 sm:p-6 lg:p-8">
          <div className="space-y-8">
            {/* Header skeleton */}
            <div className="space-y-2">
              <div className="h-8 bg-muted rounded-md w-1/3 animate-pulse"></div>
              <div className="h-4 bg-muted rounded-md w-1/2 animate-pulse"></div>
            </div>

            {/* Grid of cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="p-6">
                  <div className="space-y-3">
                    <div className="h-4 bg-muted rounded-md w-2/3 animate-pulse"></div>
                    <div className="h-6 bg-muted rounded-md animate-pulse"></div>
                    <div className="h-4 bg-muted rounded-md w-1/2 animate-pulse"></div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Large content skeleton */}
            <Card className="p-6">
              <div className="space-y-4">
                <div className="h-6 bg-muted rounded-md w-1/3 animate-pulse"></div>
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-10 bg-muted rounded-md animate-pulse"></div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Center loader indicator */}
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-muted-foreground animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Loading dashboard...</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
