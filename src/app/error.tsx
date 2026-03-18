"use client";

/**
 * Global Error Boundary
 * Handles errors from all pages in the application
 * Author: Ahmed Adel Bakr Alderai
 */

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30 p-4">
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
            <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
            <p className="text-muted-foreground text-sm">
              An unexpected error occurred. Please try again or go back home.
            </p>
            {error.message && (
              <p className="text-xs text-muted-foreground mt-3 p-3 bg-muted rounded-md break-words">
                {error.message}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={reset}
              className="flex-1"
              variant="default"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button
              asChild
              variant="outline"
              className="flex-1"
            >
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Link>
            </Button>
          </div>

          {/* Footer Note */}
          <p className="text-xs text-muted-foreground text-center mt-6">
            Error ID: {error.digest || "unknown"}
          </p>
        </div>
      </Card>
    </div>
  );
}
