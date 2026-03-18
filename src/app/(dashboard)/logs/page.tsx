/**
 * System Logs Page - Real-time log viewer with filtering
 * Author: Ahmed Adel Bakr Alderai
 */

"use client"

import { useState, useEffect, useRef } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Search,
  Filter,
  AlertCircle,
  AlertTriangle,
  Info,
  Bug,
  Zap,
  RotateCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { PageSkeleton } from "@/components/shared/loading-skeleton"
import { EmptyState } from "@/components/shared/empty-state"
import { apiGet } from "@/lib/api-client"
import { toast } from "sonner"

interface LogEntry {
  timestamp: string
  level: "DEBUG" | "INFO" | "WARNING" | "ERROR" | "CRITICAL"
  agent: string
  message: string
  context?: Record<string, unknown>
}

interface LogStats {
  error_count_today: number
  warning_count_today: number
  total_entries: number
}

const LOG_LEVELS = ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"] as const

const getLogLevelColor = (level: string) => {
  switch (level) {
    case "DEBUG":
      return "text-gray-500 dark:text-gray-400"
    case "INFO":
      return "text-blue-600 dark:text-blue-400"
    case "WARNING":
      return "text-amber-600 dark:text-amber-400"
    case "ERROR":
      return "text-red-600 dark:text-red-400"
    case "CRITICAL":
      return "font-bold text-red-700 dark:text-red-300"
    default:
      return "text-foreground"
  }
}

const getLogLevelIcon = (level: string) => {
  switch (level) {
    case "DEBUG":
      return <Bug className="h-3 w-3" />
    case "INFO":
      return <Info className="h-3 w-3" />
    case "WARNING":
      return <AlertTriangle className="h-3 w-3" />
    case "ERROR":
      return <AlertCircle className="h-3 w-3" />
    case "CRITICAL":
      return <Zap className="h-3 w-3" />
    default:
      return null
  }
}

const getLogLevelBgColor = (level: string) => {
  switch (level) {
    case "DEBUG":
      return "bg-gray-500/10"
    case "INFO":
      return "bg-blue-500/10"
    case "WARNING":
      return "bg-amber-500/10"
    case "ERROR":
      return "bg-red-500/10"
    case "CRITICAL":
      return "bg-red-500/20"
    default:
      return "bg-background"
  }
}

export default function LogsPage() {
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null)
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [limit, setLimit] = useState(100)
  const logsEndRef = useRef<HTMLDivElement>(null)
  const [autoScroll, setAutoScroll] = useState(true)

  // Fetch logs
  const {
    data: logsResponse,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["logs", selectedLevel, selectedAgent, searchQuery, limit],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (selectedLevel) params.append("level", selectedLevel)
      if (selectedAgent) params.append("agent", selectedAgent)
      if (searchQuery) params.append("search", searchQuery)
      params.append("limit", limit.toString())
      params.append("offset", "0")

      return await apiGet<{
        logs: LogEntry[]
        stats: LogStats
        agents: string[]
      }>(`/api/logs?${params.toString()}`)
    },
    refetchInterval: 2000, // Auto-refresh every 2 seconds
  })

  const logs = logsResponse?.logs || []
  const stats = logsResponse?.stats || { error_count_today: 0, warning_count_today: 0, total_entries: 0 }
  const agents = logsResponse?.agents || []

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [logs, autoScroll])

  const filteredLogs = logs.filter((log) => {
    const matchesLevel = !selectedLevel || log.level === selectedLevel
    const matchesAgent = !selectedAgent || log.agent === selectedAgent
    const matchesSearch =
      !searchQuery ||
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.agent.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesLevel && matchesAgent && matchesSearch
  })

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp)
      return date.toLocaleTimeString()
    } catch {
      return timestamp
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">System Logs</h1>
        <p className="text-muted-foreground">
          Real-time system logs with filtering and search
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase">
              Total Logs
            </p>
            <p className="text-2xl font-bold">{stats.total_entries}</p>
          </div>
        </Card>

        <Card className="p-4">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-2">
              <AlertTriangle className="h-3 w-3 text-amber-600" />
              Warnings Today
            </p>
            <p className="text-2xl font-bold text-amber-600">
              {stats.warning_count_today}
            </p>
          </div>
        </Card>

        <Card className="p-4">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-2">
              <AlertCircle className="h-3 w-3 text-red-600" />
              Errors Today
            </p>
            <p className="text-2xl font-bold text-red-600">
              {stats.error_count_today}
            </p>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </h3>
          <Button
            size="sm"
            variant="outline"
            onClick={() => refetch()}
            className="gap-1"
          >
            <RotateCw className="h-3 w-3" />
            Refresh
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {/* Search */}
          <div className="space-y-2">
            <label className="text-xs font-medium">Search</label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {/* Log Level */}
          <div className="space-y-2">
            <label className="text-xs font-medium">Log Level</label>
            <Select value={selectedLevel || "all"} onValueChange={(v) => setSelectedLevel(v === "all" ? null : v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {LOG_LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Agent */}
          <div className="space-y-2">
            <label className="text-xs font-medium">Agent</label>
            <Select value={selectedAgent || "all"} onValueChange={(v) => setSelectedAgent(v === "all" ? null : v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agents</SelectItem>
                {agents.map((agent) => (
                  <SelectItem key={agent} value={agent}>
                    {agent}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Display count */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted-foreground">
            Showing {filteredLogs.length} logs
          </p>
          <Button
            size="sm"
            variant={autoScroll ? "default" : "outline"}
            onClick={() => setAutoScroll(!autoScroll)}
          >
            {autoScroll ? "Auto-scroll enabled" : "Auto-scroll disabled"}
          </Button>
        </div>
      </Card>

      {/* Log Viewer */}
      <Card className="overflow-hidden bg-background border border-border">
        {isLoading ? (
          <PageSkeleton />
        ) : filteredLogs.length > 0 ? (
          <div className="max-h-[600px] overflow-y-auto font-mono text-xs bg-slate-950 dark:bg-slate-950">
            {filteredLogs.map((log, idx) => (
              <div
                key={idx}
                className={`border-b border-slate-800 px-4 py-2 transition-colors hover:bg-slate-900 ${getLogLevelBgColor(
                  log.level
                )}`}
              >
                <div className="flex gap-3 items-start">
                  {/* Icon */}
                  <div
                    className={`flex-shrink-0 mt-0.5 ${getLogLevelColor(
                      log.level
                    )}`}
                  >
                    {getLogLevelIcon(log.level)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center gap-2 flex-wrap text-slate-400">
                      <span className="text-slate-500">
                        [{formatTimestamp(log.timestamp)}]
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {log.level}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {log.agent}
                      </Badge>
                    </div>

                    {/* Message */}
                    <p className={`mt-1 break-words text-slate-200 ${getLogLevelColor(log.level)}`}>
                      {log.message}
                    </p>

                    {/* Context */}
                    {log.context && Object.keys(log.context).length > 0 && (
                      <div className="mt-2 pl-4 border-l border-slate-700 text-slate-400 text-xs">
                        {Object.entries(log.context).map(([key, value]) => (
                          <div key={key}>
                            <span className="text-slate-500">{key}:</span>{" "}
                            {JSON.stringify(value)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        ) : (
          <div className="p-6">
            <EmptyState
              icon={Search}
              title="No logs found"
              description="No logs match your current filters. Try adjusting your search criteria."
            />
          </div>
        )}
      </Card>
    </div>
  )
}
