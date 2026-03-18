/**
 * Global Loading State
 * Displayed while page content is loading
 * Author: Ahmed Adel Bakr Alderai
 */

import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30">
      <div className="text-center">
        {/* Loading Spinner */}
        <div className="flex justify-center mb-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-muted"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin"></div>
          </div>
        </div>

        {/* Loading Text */}
        <h2 className="text-lg font-semibold mb-2">Loading</h2>
        <p className="text-muted-foreground text-sm">
          Please wait while we prepare your content...
        </p>
      </div>
    </div>
  );
}
