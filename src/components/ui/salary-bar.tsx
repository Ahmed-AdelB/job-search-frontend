"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface SalaryBarProps {
  min: number;
  max: number;
  currency?: string;
  className?: string;
}

function formatSalary(value: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Salary Bar Component
 * Animated gradient bar for salary ranges.
 * Author: Ahmed Adel Bakr Alderai
 */
export function SalaryBar({ min, max, currency = "USD", className }: SalaryBarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  // Normalize to a max of ~300k for visual purposes
  const maxSalary = 300000;
  const minWidth = Math.max((min / maxSalary) * 100, 5);
  const maxWidth = Math.max((max / maxSalary) * 100, 10);

  return (
    <div ref={ref} className={cn("space-y-1.5", className)}>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{formatSalary(min, currency)}</span>
        <span>{formatSalary(max, currency)}</span>
      </div>
      <div className="relative h-3 rounded-full bg-white/5 overflow-hidden">
        <div
          className={cn(
            "absolute left-0 h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 transition-all duration-1000 ease-out",
            isVisible ? "" : "!w-0"
          )}
          style={{ width: isVisible ? `${maxWidth}%` : "0%", marginLeft: `${minWidth * 0.3}%` }}
        />
      </div>
    </div>
  );
}
