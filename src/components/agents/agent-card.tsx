/**
 * Agent Status Card - Individual agent control card
 * Author: Ahmed Adel Bakr Alderai
 */

"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { MoreVertical, Play, Square, Pause, RotateCw, Zap } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/shared/status-badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAgentAction, useUpdateAgentConfig } from "@/hooks/use-agents"
import { Agent } from "@/types/api"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface AgentCardProps {
  agent: Agent
  onConfigClick?: (agent: Agent) => void
  className?: string
}

export function AgentCard({
  agent,
  onConfigClick,
  className,
}: AgentCardProps) {
  const [isActioning, setIsActioning] = useState(false)

  const { mutate: performAction } = useAgentAction(agent.name, "")

  const handleAction = async (action: "start" | "stop" | "pause" | "resume" | "run-now") => {
    setIsActioning(true)
    try {
      // Extract action from dropdown click
      const endpoint = `/api/agents/${agent.name}/${action}`
      await fetch(endpoint, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("auth-token")}`,
        },
      })
      toast.success(`Agent ${action} initiated`)
    } catch (error) {
      toast.error(`Failed to ${action} agent`)
    } finally {
      setIsActioning(false)
    }
  }

  const getCircuitBreaker = () => {
    if (agent.circuit_state === "closed") {
      return <div className="w-2 h-2 rounded-full bg-green-500" />
    }
    if (agent.circuit_state === "open") {
      return <div className="w-2 h-2 rounded-full bg-red-500" />
    }
    return <div className="w-2 h-2 rounded-full bg-yellow-500" />
  }

  const lastRunTime = agent.last_run_at
    ? formatDistanceToNow(new Date(agent.last_run_at), { addSuffix: true })
    : "Never"

  const nextRunTime = agent.next_run_at
    ? formatDistanceToNow(new Date(agent.next_run_at), { addSuffix: true })
    : "Not scheduled"

  return (
    <Card className={cn("p-4 space-y-4", className)}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm text-foreground">
              {agent.display_name}
            </h3>
            <div className="flex items-center gap-1">
              {getCircuitBreaker()}
              <span className="text-xs text-muted-foreground capitalize">
                {agent.circuit_state}
              </span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{agent.name}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              disabled={isActioning}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {agent.status !== "running" && (
              <DropdownMenuItem
                onClick={() => handleAction("start")}
                className="gap-2"
              >
                <Play className="h-3 w-3" />
                Start
              </DropdownMenuItem>
            )}
            {agent.status === "running" && (
              <DropdownMenuItem
                onClick={() => handleAction("stop")}
                className="gap-2"
              >
                <Square className="h-3 w-3" />
                Stop
              </DropdownMenuItem>
            )}
            {agent.status === "running" && (
              <DropdownMenuItem
                onClick={() => handleAction("pause")}
                className="gap-2"
              >
                <Pause className="h-3 w-3" />
                Pause
              </DropdownMenuItem>
            )}
            {agent.status === "paused" && (
              <DropdownMenuItem
                onClick={() => handleAction("resume")}
                className="gap-2"
              >
                <Play className="h-3 w-3" />
                Resume
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => handleAction("run-now")}
              className="gap-2"
            >
              <Zap className="h-3 w-3" />
              Run Now
            </DropdownMenuItem>
            {onConfigClick && (
              <DropdownMenuItem
                onClick={() => onConfigClick(agent)}
                className="gap-2"
              >
                <RotateCw className="h-3 w-3" />
                Configure
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Status Badge */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-medium">Status</span>
        <StatusBadge status={agent.status} />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="space-y-1 rounded-md bg-muted p-2">
          <p className="text-muted-foreground">Poll Interval</p>
          <p className="font-semibold text-foreground">
            {((agent.poll_interval ?? 0) / 60).toFixed(0)} min
          </p>
        </div>
        <div className="space-y-1 rounded-md bg-muted p-2">
          <p className="text-muted-foreground">Last Run</p>
          <p className="font-semibold text-foreground">{lastRunTime}</p>
        </div>
        <div className="space-y-1 rounded-md bg-muted p-2">
          <p className="text-muted-foreground">Next Run</p>
          <p className="font-semibold text-foreground">{nextRunTime}</p>
        </div>
        <div className="space-y-1 rounded-md bg-muted p-2">
          <p className="text-muted-foreground">Failures</p>
          <p className="font-semibold text-foreground">
            {agent.consecutive_failures ?? 0}/{agent.total_errors ?? 0}
          </p>
        </div>
      </div>

      {/* Execution Stats */}
      <div className="border-t border-border pt-3 space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Total Runs:</span>
          <span className="font-semibold text-foreground">{agent.total_runs ?? 0}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Success Rate:</span>
          <span className="font-semibold text-foreground">
            {(agent.total_runs ?? 0) > 0
              ? (
                  (((agent.total_runs ?? 0) - (agent.total_errors ?? 0)) / (agent.total_runs ?? 1)) *
                  100
                ).toFixed(0)
              : 0}
            %
          </span>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="flex gap-2 pt-2">
        <Button
          size="sm"
          variant="outline"
          className="flex-1 h-8 text-xs"
          onClick={() => handleAction("run-now")}
          disabled={isActioning}
        >
          Run Now
        </Button>
        {agent.status === "running" && (
          <Button
            size="sm"
            variant="destructive"
            className="flex-1 h-8 text-xs"
            onClick={() => handleAction("stop")}
            disabled={isActioning}
          >
            Stop
          </Button>
        )}
        {agent.status !== "running" && (
          <Button
            size="sm"
            variant="default"
            className="flex-1 h-8 text-xs"
            onClick={() => handleAction("start")}
            disabled={isActioning}
          >
            Start
          </Button>
        )}
      </div>
    </Card>
  )
}
