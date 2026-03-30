"use client";

import { cn } from "@/lib/utils";

interface PipelineStage {
  name: string;
  count: number;
  color: string;
}

const defaultStages: PipelineStage[] = [
  { name: "Discover", count: 150, color: "from-blue-500 to-indigo-500" },
  { name: "Score", count: 120, color: "from-indigo-500 to-violet-500" },
  { name: "Tailor", count: 80, color: "from-violet-500 to-purple-500" },
  { name: "Apply", count: 45, color: "from-purple-500 to-fuchsia-500" },
  { name: "Track", count: 45, color: "from-fuchsia-500 to-pink-500" },
  { name: "Alert", count: 12, color: "from-pink-500 to-rose-500" },
];

/**
 * Pipeline Sankey Diagram
 * Animated flow diagram showing jobs moving through pipeline stages.
 * Author: Ahmed Adel Bakr Alderai
 */
export function PipelineSankey({ stages = defaultStages }: { stages?: PipelineStage[] }) {
  const maxCount = Math.max(...stages.map((s) => s.count));

  return (
    <div className="space-y-3">
      {stages.map((stage, i) => {
        const width = Math.max((stage.count / maxCount) * 100, 15);
        return (
          <div key={stage.name} className="flex items-center gap-3">
            <span className="w-16 text-xs text-muted-foreground font-mono">{stage.name}</span>
            <div className="flex-1 relative h-8">
              <div
                className={cn(
                  "h-full rounded-lg bg-gradient-to-r transition-all duration-1000 ease-out",
                  stage.color
                )}
                style={{
                  width: `${width}%`,
                  animationDelay: `${i * 100}ms`,
                }}
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-white/80">
                {stage.count}
              </span>
            </div>
          </div>
        );
      })}
      {/* Flow connectors */}
      <div className="flex items-center justify-between px-20 text-muted-foreground">
        {stages.slice(0, -1).map((_, i) => (
          <svg key={i} className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0l8 8-8 8V0z" opacity="0.3" />
          </svg>
        ))}
      </div>
    </div>
  );
}
