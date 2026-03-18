"use client";

/**
 * Dashboard Error Boundary
 * Handles errors in dashboard pages and protected routes
 * Author: Ahmed Adel Bakr Alderai
 */

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface DashboardErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <div className="p-8">
          {/* Error Icon */}
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-destructive/10 rounded-full">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
          </div>

          {/* Error Content */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-2">Dashboard Error</h1>
            <p className="text-muted-foreground text-sm">
              Something went wrong in the dashboard. Please try refreshing or going back.
            </p>
            {error.message && (
              <p className="text-xs text-muted-foreground mt-3 p-3 bg-muted rounded-md break-words">
                {error.message}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            <Button
              onClick={reset}
              className="flex-1"
              variant="default"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Link href="/dashboard" className="flex-1">
              <Button
                variant="outline"
                className="w-full"
              >
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
          </div>

          {/* Footer Note */}
          <p className="text-xs text-muted-foreground text-center">
            Error ID: {error.digest || "unknown"}
          </p>
        </div>
      </Card>
    </div>
  );
}
