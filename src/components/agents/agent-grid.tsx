/**
 * Agent Grid - Responsive grid of agent cards
 * Author: Ahmed Adel Bakr Alderai
 */

"use client"

import { Agent } from "@/types/api"
import { AgentCard } from "./agent-card"
import { CardSkeleton } from "@/components/shared/loading-skeleton"
import { EmptyState } from "@/components/shared/empty-state"
import { Users } from "lucide-react"

interface AgentGridProps {
  agents: Agent[]
  isLoading?: boolean
  onConfigClick?: (agent: Agent) => void
}

export function AgentGrid({
  agents,
  isLoading,
  onConfigClick,
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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {agents.map((agent) => (
        <AgentCard
          key={agent.name}
          agent={agent}
          onConfigClick={onConfigClick}
        />
      ))}
    </div>
  )
}
