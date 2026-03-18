/**
 * 404 Not Found Page
 * Author: Ahmed Adel Bakr Alderai
 */

import Link from "next/link";
import { Search, Home, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <div className="p-8">
          {/* 404 Icon */}
          <div className="flex justify-center mb-6">
            <div className="text-6xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
              404
            </div>
          </div>

          {/* Content */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
            <p className="text-muted-foreground text-sm">
              The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>
          </div>

          {/* Illustration */}
          <div className="flex justify-center mb-8">
            <div className="p-4 bg-muted rounded-lg">
              <Search className="w-12 h-12 text-muted-foreground" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 mb-6">
            <Link href="/">
              <Button className="w-full">
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" className="w-full">
                <MessageSquare className="w-4 h-4 mr-2" />
                Go to Dashboard
              </Button>
            </Link>
          </div>

          {/* Help Text */}
          <p className="text-xs text-muted-foreground text-center">
            If you think this is a mistake, please{" "}
            <Link href="/" className="text-blue-500 hover:underline">
              contact support
            </Link>
            .
          </p>
        </div>
      </Card>
    </div>
  );
}
