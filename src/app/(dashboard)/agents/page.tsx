/**
 * Agents Control Page - Manage and monitor automation agents
 * Author: Ahmed Adel Bakr Alderai
 */

"use client"

import { useState, useEffect } from "react"
import { Play, Square } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { PageSkeleton } from "@/components/shared/loading-skeleton"
import { AgentGrid } from "@/components/agents/agent-grid"
import { AgentConfigModal } from "@/components/agents/agent-config-modal"
import { useAgents, useAgentAction } from "@/hooks/use-agents"
import { useSSE } from "@/hooks/use-sse"
import { Agent } from "@/types/api"
import { toast } from "sonner"

export default function AgentsPage() {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string | null>(null)
  const [isStartingAll, setIsStartingAll] = useState(false)
  const [isStoppingAll, setIsStoppingAll] = useState(false)

  // Fetch agents
  const { data: agents, isLoading, refetch } = useAgents()

  // Setup SSE for real-time updates
  useSSE("/api/agents/events", (data: unknown) => {
    // Refetch agents when we receive an event
    refetch()
  })

  // Filter agents
  const filteredAgents = (agents || []).filter((agent) => {
    const matchesSearch = agent.display_name
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    const matchesStatus = !filterStatus || agent.status === filterStatus

    return matchesSearch && matchesStatus
  })

  // Calculate summary stats
  const agentStats = {
    total: agents?.length || 0,
    running: agents?.filter((a) => a.status === "running").length || 0,
    stopped: agents?.filter((a) => a.status === "stopped").length || 0,
    paused: agents?.filter((a) => a.status === "paused").length || 0,
    error: agents?.filter((a) => a.status === "error").length || 0,
  }

  // Handle start all agents
  const handleStartAll = async () => {
    setIsStartingAll(true)
    try {
      const response = await fetch("/api/agents/start-all", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("auth-token")}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to start all agents")
      }

      toast.success("All agents started")
      refetch()
    } catch (error) {
      toast.error("Failed to start all agents")
    } finally {
      setIsStartingAll(false)
    }
  }

  // Handle stop all agents
  const handleStopAll = async () => {
    setIsStoppingAll(true)
    try {
      const response = await fetch("/api/agents/stop-all", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("auth-token")}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to stop all agents")
      }

      toast.success("All agents stopped")
      refetch()
    } catch (error) {
      toast.error("Failed to stop all agents")
    } finally {
      setIsStoppingAll(false)
    }
  }

  if (isLoading) {
    return <PageSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Agents</h1>
        <p className="text-muted-foreground">
          Manage and monitor your automation agents. Control execution, view
          status, and configure settings.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="p-4">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase">
              Total Agents
            </p>
            <p className="text-2xl font-bold text-foreground">
              {agentStats.total}
            </p>
          </div>
        </Card>

        <Card className="p-4">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase">
              Running
            </p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-green-600">
                {agentStats.running}
              </p>
              <div className="w-2 h-2 rounded-full bg-green-500" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase">
              Stopped
            </p>
            <p className="text-2xl font-bold text-amber-600">
              {agentStats.stopped}
            </p>
          </div>
        </Card>

        <Card className="p-4">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase">
              Paused
            </p>
            <p className="text-2xl font-bold text-blue-600">
              {agentStats.paused}
            </p>
          </div>
        </Card>

        <Card className="p-4">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase">
              Errors
            </p>
            <p className="text-2xl font-bold text-red-600">
              {agentStats.error}
            </p>
          </div>
        </Card>
      </div>

      {/* Controls */}
      <Card className="p-6 space-y-4">
        <div>
          <h3 className="font-semibold text-sm text-foreground mb-4">
            Bulk Actions
          </h3>
          <div className="flex gap-2">
            <Button
              onClick={handleStartAll}
              disabled={isStartingAll || agentStats.running === agentStats.total}
              className="gap-2"
            >
              <Play className="h-4 w-4" />
              Start All
            </Button>
            <Button
              variant="destructive"
              onClick={handleStopAll}
              disabled={isStoppingAll || agentStats.stopped === agentStats.total}
              className="gap-2"
            >
              <Square className="h-4 w-4" />
              Stop All
            </Button>
          </div>
        </div>
      </Card>

      {/* Search and Filter */}
      <Card className="p-6 space-y-4">
        <div>
          <h3 className="font-semibold text-sm text-foreground mb-4">
            Search & Filter
          </h3>
          <div className="flex flex-col gap-4 md:flex-row">
            <Input
              placeholder="Search agents by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />

            <div className="flex gap-2">
              <Button
                variant={!filterStatus ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus(null)}
              >
                All
              </Button>
              <Button
                variant={filterStatus === "running" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("running")}
              >
                Running
              </Button>
              <Button
                variant={filterStatus === "stopped" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("stopped")}
              >
                Stopped
              </Button>
              <Button
                variant={filterStatus === "error" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("error")}
              >
                Errors
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Agents Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-sm text-foreground">
              All Agents
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {filteredAgents.length} of {agentStats.total} agents
              {searchQuery && ` matching "${searchQuery}"`}
              {filterStatus && ` with status "${filterStatus}"`}
            </p>
          </div>
        </div>

        <AgentGrid
          agents={filteredAgents}
          isLoading={isLoading}
          onConfigClick={(agent) => {
            setSelectedAgent(agent)
            setIsConfigModalOpen(true)
          }}
        />
      </div>

      {/* Configuration Modal */}
      <AgentConfigModal
        agent={selectedAgent}
        isOpen={isConfigModalOpen}
        onClose={() => {
          setIsConfigModalOpen(false)
          setSelectedAgent(null)
        }}
        onSave={() => {
          refetch()
        }}
      />
    </div>
  )
}
