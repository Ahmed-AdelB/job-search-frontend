/**
 * Deploy Management Page - Monitor and control deployments
 * Author: Ahmed Adel Bakr Alderai
 */

"use client"

import { useState } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import {
  RefreshCw,
  RotateCcw,
  FileText,
  Clock,
  Server,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PageSkeleton } from "@/components/shared/loading-skeleton"
import { EmptyState } from "@/components/shared/empty-state"
import { StatusBadge } from "@/components/shared/status-badge"
import { apiGet, apiPost } from "@/lib/api-client"
import { toast } from "sonner"

interface DeployStatus {
  status: "idle" | "building" | "deploying" | "running" | "error"
  current_version: string
  last_deploy_time?: string
  uptime_seconds: number
  running: boolean
}

interface DeployHistory {
  version: string
  date: string
  status: "success" | "failed" | "in_progress"
  duration_seconds: number
  triggered_by: string
}

interface DeployResponse {
  success: boolean
  message: string
}

export default function DeployPage() {
  const [logsOpen, setLogsOpen] = useState(false)

  // Fetch deploy status
  const {
    data: deployStatus,
    isLoading: statusLoading,
    refetch: refetchStatus,
  } = useQuery({
    queryKey: ["deploy-status"],
    queryFn: async () => {
      return await apiGet<DeployStatus>("/api/deploy/status")
    },
    refetchInterval: 5000, // Auto-refresh every 5 seconds
  })

  // Fetch deploy history
  const {
    data: deployHistory,
    isLoading: historyLoading,
  } = useQuery({
    queryKey: ["deploy-history"],
    queryFn: async () => {
      const response = await apiGet<{ history: DeployHistory[] }>(
        "/api/deploy/history"
      )
      return response.history || []
    },
  })

  // Rebuild mutation
  const rebuildMutation = useMutation({
    mutationFn: async () => {
      return await apiPost<DeployResponse>("/api/deploy/rebuild", {})
    },
    onSuccess: () => {
      toast.success("Rebuild triggered successfully")
      refetchStatus()
    },
    onError: (error: Error) => {
      toast.error("Failed to trigger rebuild", {
        description: error.message,
      })
    },
  })

  // Rollback mutation
  const rollbackMutation = useMutation({
    mutationFn: async (version: string) => {
      return await apiPost<DeployResponse>("/api/deploy/rollback", {
        version,
      })
    },
    onSuccess: () => {
      toast.success("Rollback initiated successfully")
      refetchStatus()
    },
    onError: (error: Error) => {
      toast.error("Failed to rollback", {
        description: error.message,
      })
    },
  })

  if (statusLoading) {
    return <PageSkeleton />
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "bg-green-500/10 text-green-700 dark:text-green-400"
      case "idle":
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400"
      case "building":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400"
      case "deploying":
        return "bg-amber-500/10 text-amber-700 dark:text-amber-400"
      case "error":
        return "bg-red-500/10 text-red-700 dark:text-red-400"
      default:
        return "bg-gray-500/10 text-gray-700"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running":
        return <CheckCircle2 className="h-4 w-4" />
      case "idle":
        return <Server className="h-4 w-4" />
      case "building":
      case "deploying":
        return <Loader2 className="h-4 w-4 animate-spin" />
      case "error":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Server className="h-4 w-4" />
    }
  }

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString()
    } catch {
      return dateString
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Deploy</h1>
            {deployStatus && (
              <Badge
                className={`${getStatusColor(deployStatus.status)} border-0`}
              >
                <span className="mr-2">
                  {getStatusIcon(deployStatus.status)}
                </span>
                {deployStatus.status.charAt(0).toUpperCase() +
                  deployStatus.status.slice(1)}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            Monitor deployments and manage application versions
          </p>
        </div>
      </div>

      {/* Status Card */}
      {deployStatus && (
        <Card className="p-6">
          <div className="grid gap-4 md:grid-cols-3">
            {/* Current Version */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Current Version
              </p>
              <p className="text-2xl font-bold font-mono">
                {deployStatus.current_version}
              </p>
            </div>

            {/* Last Deploy Time */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Last Deploy
              </p>
              {deployStatus.last_deploy_time ? (
                <p className="text-sm">{formatDate(deployStatus.last_deploy_time)}</p>
              ) : (
                <p className="text-sm text-muted-foreground">Never deployed</p>
              )}
            </div>

            {/* Uptime */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Uptime</p>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <p className="text-sm font-mono">
                  {formatUptime(deployStatus.uptime_seconds)}
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Action Buttons */}
      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-sm">Actions</h3>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => rebuildMutation.mutate()}
              disabled={
                rebuildMutation.isPending ||
                deployStatus?.status === "building"
              }
              className="gap-2"
            >
              {rebuildMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Rebuild
            </Button>

            <Button
              variant="outline"
              onClick={() => setLogsOpen(true)}
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              View Logs
            </Button>

            <Button variant="outline" disabled className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Rollback
            </Button>
          </div>
        </div>
      </Card>

      {/* Deploy History */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-sm">Deploy History</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {deployHistory?.length || 0} deployments
            </p>
          </div>
        </div>

        {historyLoading ? (
          <PageSkeleton />
        ) : deployHistory && deployHistory.length > 0 ? (
          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Version</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Triggered By</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deployHistory.map((deploy) => (
                  <TableRow key={deploy.version}>
                    <TableCell className="font-mono text-sm">
                      {deploy.version}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(deploy.date)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        status={
                          deploy.status === "success"
                            ? "completed"
                            : deploy.status === "failed"
                              ? "error"
                              : "pending"
                        }
                      />
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {deploy.duration_seconds}s
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {deploy.triggered_by}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => rollbackMutation.mutate(deploy.version)}
                        disabled={
                          rollbackMutation.isPending ||
                          deploy.version === deployStatus?.current_version
                        }
                      >
                        Rollback
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        ) : (
          <EmptyState
            icon={FileText}
            title="No deployments yet"
            description="Deploy history will appear here once you trigger a build"
          />
        )}
      </div>
    </div>
  )
}
