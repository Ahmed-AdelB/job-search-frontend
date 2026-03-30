/**
 * Agent Grid - Responsive grid of agent cards with real-time pulse dots and mini sparklines
 * Author: Ahmed Adel Bakr Alderai
 */

"use client"

import { Agent } from "@/types/api"
import { AgentCard } from "./agent-card"
import { CardSkeleton } from "@/components/shared/loading-skeleton"
import { EmptyState } from "@/components/shared/empty-state"
import { Users } from "lucide-react"
import { cn } from "@/lib/utils"

interface AgentGridProps {
  agents: Agent[]
  isLoading?: boolean
  onConfigClick?: (agent: Agent) => void
  className?: string
}

/**
 * Mini Sparkline component - Renders a small line chart from data points
 * Used to visualize agent activity trends (last 10 cycles)
 */
function MiniSparkline({
  data,
  color = "stroke-cyan-400",
}: {
  data: number[]
  color?: string
}) {
  if (!data || data.length < 2) return null

  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const width = 80
  const height = 24

  const points = data
    .map((val, i) => {
      const x = (i / (data.length - 1)) * width
      const y = height - ((val - min) / range) * height
      return `${x},${y}`
    })
    .join(" ")

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        className={cn(color, "stroke-[1.5]")}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * Status Dot component - Animated pulse indicator for agent status
 * Running: cyan with ping animation
 * Error: red (no animation)
 * Idle/Paused: amber
 * Stopped: gray
 */
function StatusDot({ status }: { status: Agent["status"] }) {
  const colors = {
    running: "bg-cyan-400",
    stopped: "bg-zinc-500",
    error: "bg-rose-500",
    idle: "bg-amber-400",
    paused: "bg-yellow-400",
    completed: "bg-emerald-400",
  }

  const statusColor = colors[status] || colors.idle

  return (
    <span className="relative flex h-2.5 w-2.5">
      {status === "running" && (
        <span
          className={cn(
            "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
            statusColor
          )}
        />
      )}
      <span
        className={cn("relative inline-flex h-2.5 w-2.5 rounded-full", statusColor)}
      />
    </span>
  )
}

/**
 * Enhanced Agent Card with sparkline and status indicator
 * Wraps the existing AgentCard with visual enhancements
 */
function EnhancedAgentCard({
  agent,
  onConfigClick,
  sparklineData,
}: {
  agent: Agent
  onConfigClick?: (agent: Agent) => void
  sparklineData?: number[]
}) {
  const getSparklineColor = () => {
    switch (agent.status) {
      case "running":
        return "stroke-cyan-400"
      case "error":
        return "stroke-rose-500"
      case "idle":
        return "stroke-amber-400"
      case "paused":
        return "stroke-yellow-400"
      case "completed":
        return "stroke-emerald-400"
      default:
        return "stroke-zinc-500"
    }
  }

  return (
    <div className="relative">
      {/* Enhanced card container with hover effects */}
      <div
        className={cn(
          "group relative rounded-2xl border p-5 transition-all hover:-translate-y-0.5",
          "bg-white/5 backdrop-blur-xl border-white/10",
          "hover:shadow-[0_0_30px_rgba(124,58,237,0.1)]",
          agent.status === "error" && "border-rose-500/30"
        )}
      >
        {/* Header with status dot and name */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <StatusDot status={agent.status} />
            <h3 className="font-display text-sm font-semibold">
              {agent.display_name}
            </h3>
          </div>
          <span
            className={cn(
              "text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full",
              agent.status === "running"
                ? "bg-cyan-400/10 text-cyan-400"
                : agent.status === "error"
                  ? "bg-rose-500/10 text-rose-400"
                  : agent.status === "idle"
                    ? "bg-amber-400/10 text-amber-400"
                    : agent.status === "paused"
                      ? "bg-yellow-400/10 text-yellow-400"
                      : agent.status === "completed"
                        ? "bg-emerald-400/10 text-emerald-400"
                        : "bg-zinc-500/10 text-zinc-400"
            )}
          >
            {agent.status}
          </span>
        </div>

        {/* Agent type description */}
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
          {agent.type && `${agent.type.charAt(0).toUpperCase() + agent.type.slice(1)} Agent`}
          {agent.consecutive_failures ? ` • ${agent.consecutive_failures} failures` : ""}
        </p>

        {/* Mini sparkline visualization */}
        {sparklineData && sparklineData.length > 1 && (
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Activity</span>
            <MiniSparkline data={sparklineData} color={getSparklineColor()} />
          </div>
        )}

        {/* Stats row */}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Runs: {agent.total_runs ?? 0}</span>
          {agent.total_runs ? (
            <span className="font-mono">
              {(
                (((agent.total_runs ?? 0) - (agent.total_errors ?? 0)) /
                  (agent.total_runs ?? 1)) *
                100
              ).toFixed(0)}
              % success
            </span>
          ) : null}
        </div>
      </div>

      {/* Fallback to original AgentCard component for full functionality */}
      <div className="hidden">
        <AgentCard agent={agent} onConfigClick={onConfigClick} />
      </div>
    </div>
  )
}

/**
 * Agent Grid component - Main export
 * Displays agents in a responsive grid with enhanced visual indicators
 */
export function AgentGrid({
  agents,
  isLoading,
  onConfigClick,
  className,
}: AgentGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (!agents || agents.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No agents found"
        description="No agents are configured or available at this time."
      />
    )
  }

  return (
    <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-3", className)}>
      {agents.map((agent) => {
        // Generate mock sparkline data from agent stats if available
        // In production, this would come from real agent metrics
        const sparklineData = agent.total_runs
          ? [
              Math.floor(Math.random() * (agent.total_runs * 0.3)),
              Math.floor(Math.random() * (agent.total_runs * 0.3)),
              Math.floor(Math.random() * (agent.total_runs * 0.3)),
              Math.floor(Math.random() * (agent.total_runs * 0.3)),
              Math.floor(Math.random() * (agent.total_runs * 0.3)),
              Math.floor(Math.random() * (agent.total_runs * 0.3)),
              Math.floor(Math.random() * (agent.total_runs * 0.3)),
              Math.floor(Math.random() * (agent.total_runs * 0.3)),
              Math.floor(Math.random() * (agent.total_runs * 0.3)),
              Math.floor(Math.random() * (agent.total_runs * 0.3)),
            ]
          : undefined

        return (
          <EnhancedAgentCard
            key={agent.agent_id}
            agent={agent}
            onConfigClick={onConfigClick}
            sparklineData={sparklineData}
          />
        )
      })}
    </div>
  )
}

/**
 * Mock agent data for development/storybook preview
 * Demonstrates all agent statuses and activity patterns
 */
export const mockAgents: Agent[] = [
  {
    agent_id: "discovery-1",
    user_id: "user-1",
    name: "discovery",
    type: "search",
    display_name: "Discovery",
    status: "running",
    config: {},
    last_run_at: new Date(Date.now() - 2 * 60000).toISOString(),
    next_run_at: new Date(Date.now() + 58 * 60000).toISOString(),
    circuit_state: "closed",
    poll_interval: 3600,
    total_runs: 142,
    total_errors: 3,
    consecutive_failures: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    agent_id: "application-1",
    user_id: "user-1",
    name: "application",
    type: "apply",
    display_name: "Application",
    status: "running",
    config: {},
    last_run_at: new Date(Date.now() - 5 * 60000).toISOString(),
    next_run_at: new Date(Date.now() + 55 * 60000).toISOString(),
    circuit_state: "closed",
    poll_interval: 3600,
    total_runs: 89,
    total_errors: 2,
    consecutive_failures: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    agent_id: "outreach-1",
    user_id: "user-1",
    name: "outreach",
    type: "email",
    display_name: "Outreach",
    status: "idle",
    config: {},
    last_run_at: new Date(Date.now() - 60 * 60000).toISOString(),
    next_run_at: new Date(Date.now() + 60 * 60000).toISOString(),
    circuit_state: "closed",
    poll_interval: 3600,
    total_runs: 34,
    total_errors: 0,
    consecutive_failures: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    agent_id: "scorer-1",
    user_id: "user-1",
    name: "scorer",
    type: "search",
    display_name: "Scorer",
    status: "running",
    config: {},
    last_run_at: new Date(Date.now() - 1 * 60000).toISOString(),
    next_run_at: new Date(Date.now() + 59 * 60000).toISOString(),
    circuit_state: "closed",
    poll_interval: 3600,
    total_runs: 256,
    total_errors: 5,
    consecutive_failures: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    agent_id: "ghost-detector-1",
    user_id: "user-1",
    name: "ghost_detector",
    type: "search",
    display_name: "Ghost Detector",
    status: "stopped",
    config: {},
    last_run_at: new Date(Date.now() - 180 * 60000).toISOString(),
    next_run_at: undefined,
    circuit_state: "closed",
    poll_interval: 3600,
    total_runs: 67,
    total_errors: 1,
    consecutive_failures: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    agent_id: "inbox-defender-1",
    user_id: "user-1",
    name: "inbox_defender",
    type: "email",
    display_name: "Inbox Defender",
    status: "error",
    config: {},
    last_run_at: new Date(Date.now() - 30 * 60000).toISOString(),
    next_run_at: undefined,
    circuit_state: "open",
    poll_interval: 3600,
    total_runs: 12,
    total_errors: 8,
    consecutive_failures: 4,
    error_message: "Connection timeout",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]
