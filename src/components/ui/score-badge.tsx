"use client";

import { cn } from "@/lib/utils";

interface ScoreBadgeProps {
  score: number; // 0-100
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Score Badge Component
 * A gradient ring like Apple Watch activity rings showing match score.
 * Author: Ahmed Adel Bakr Alderai
 */
export function ScoreBadge({ score, size = "md", className }: ScoreBadgeProps) {
  const sizes = { sm: 40, md: 56, lg: 72 };
  const strokeWidths = { sm: 3, md: 4, lg: 5 };
  const fontSizes = { sm: "text-xs", md: "text-sm", lg: "text-lg" };

  const dim = sizes[size];
  const stroke = strokeWidths[size];
  const radius = (dim - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color = score >= 80 ? "text-emerald-400" : score >= 50 ? "text-amber-400" : "text-rose-400";
  const gradientId = `score-gradient-${score}`;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={dim} height={dim} className="-rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop
              offset="0%"
              stopColor={score >= 80 ? "#34d399" : score >= 50 ? "#fbbf24" : "#fb7185"}
            />
            <stop
              offset="100%"
              stopColor={score >= 80 ? "#22d3ee" : score >= 50 ? "#f59e0b" : "#f43f5e"}
            />
          </linearGradient>
        </defs>
        {/* Background track */}
        <circle
          cx={dim / 2}
          cy={dim / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-white/10"
        />
        {/* Score arc */}
        <circle
          cx={dim / 2}
          cy={dim / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <span className={cn("absolute font-display font-bold", fontSizes[size], color)}>
        {score}
      </span>
    </div>
  );
}
