"use client";

import { cn } from "@/lib/utils";

interface GhostIconProps {
  detected: boolean;
  confidence?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Ghost Icon Component
 * A wobbling ghost icon for ghost-detected jobs.
 * Author: Ahmed Adel Bakr Alderai
 */
export function GhostIcon({ detected, confidence, size = "md", className }: GhostIconProps) {
  if (!detected) return null;

  const sizes = { sm: "h-4 w-4", md: "h-5 w-5", lg: "h-6 w-6" };

  return (
    <div
      className={cn("group relative inline-flex items-center", className)}
      title={confidence ? `Ghost probability: ${confidence}%` : "Ghost job detected"}
    >
      <svg
        className={cn(sizes[size], "text-rose-500 animate-wobble")}
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 2C7.58 2 4 5.58 4 10v8.5c0 .83.67 1.5 1.5 1.5s1-.5 1.5-1 1-1 1.5-1 1 .5 1.5 1 1 1 1.5 1 1-.5 1.5-1 1-1 1.5-1 1 .5 1.5 1 1 1 1.5 1 1.5-.67 1.5-1.5V10c0-4.42-3.58-8-8-8zm-2 10c-.83 0-1.5-.67-1.5-1.5S9.17 9 10 9s1.5.67 1.5 1.5S10.83 12 10 12zm4 0c-.83 0-1.5-.67-1.5-1.5S13.17 9 14 9s1.5.67 1.5 1.5S14.83 12 14 12z" />
      </svg>
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
        <div className="rounded-lg bg-rose-950 border border-rose-500/20 px-3 py-1.5 text-xs text-rose-200 whitespace-nowrap">
          Ghost job detected{confidence ? ` (${confidence}%)` : ""}
        </div>
      </div>
    </div>
  );
}
