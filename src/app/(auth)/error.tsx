"use client";

/**
 * Auth Error Boundary
 * Handles errors in authentication pages (login, signup, etc.)
 * Author: Ahmed Adel Bakr Alderai
 */

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface AuthErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AuthError({ error, reset }: AuthErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Auth error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">J</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                JobFlow
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content - Centered */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <Card className="w-full max-w-md">
          <div className="p-8">
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-destructive/10 rounded-full">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
            </div>

            {/* Error Content */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold mb-2">Authentication Error</h1>
              <p className="text-muted-foreground text-sm">
                An error occurred during authentication. Please try again.
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
              <Link href="/login" className="flex-1">
                <Button
                  variant="outline"
                  className="w-full"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Login
                </Button>
              </Link>
            </div>

            {/* Footer Note */}
            <p className="text-xs text-muted-foreground text-center mt-6">
              Error ID: {error.digest || "unknown"}
            </p>
          </div>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 text-center">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} JobFlow. Built by Ahmed Adel Bakr Alderai.
        </p>
      </footer>
    </div>
  );
}
