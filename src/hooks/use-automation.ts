"use client"

/**
 * Automation Hooks — React Query hooks for browser-based ATS automation
 * Author: Ahmed Adel Bakr Alderai
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiGet, apiPost, apiDelete, apiPatch } from "@/lib/api-client"
import type {
  AutomationHealth,
  BatchApplyAutomationRequest,
  BatchApplyAutomationResponse,
  AutomationRunsResponse,
  BatchRun,
  DiscoverRequest,
  DiscoverResponse,
  CleanupResponse,
  BatchProgressEvent,
  AutomationSchedule,
  ScheduleRequest,
  BatchScreenshot,
  BatchLog,
} from "@/types/api"
import { toast } from "sonner"
import { useSSE } from "@/hooks/use-sse"
import { useState, useCallback } from "react"

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/**
 * System health: IMAP, Capsolver, Playwright, DB stats
 */
export function useAutomationHealth() {
  return useQuery({
    queryKey: ["automation", "health"],
    queryFn: () => apiGet<AutomationHealth>("/api/automation/health"),
    refetchInterval: 30000,
    staleTime: 15000,
  })
}

/**
 * List active + recent batch runs
 */
export function useAutomationRuns() {
  return useQuery({
    queryKey: ["automation", "runs"],
    queryFn: () => apiGet<AutomationRunsResponse>("/api/automation/runs"),
    refetchInterval: 5000,
    staleTime: 3000,
  })
}

/**
 * Get status of a specific batch run
 */
export function useBatchStatus(runId: string | null) {
  return useQuery({
    queryKey: ["automation", "batch", runId],
    queryFn: () => apiGet<BatchRun>(`/api/automation/batch-apply/${runId}`),
    enabled: !!runId,
    refetchInterval: 3000,
    staleTime: 2000,
  })
}

/**
 * List automation schedules
 */
export function useAutomationSchedules() {
  return useQuery({
    queryKey: ["automation", "schedules"],
    queryFn: () => apiGet<{ schedules: AutomationSchedule[]; total: number }>("/api/automation/schedules"),
    refetchInterval: 10000,
    staleTime: 5000,
  })
}

/**
 * Get screenshots for a batch run
 */
export function useBatchScreenshots(runId: string | null) {
  return useQuery({
    queryKey: ["automation", "batch", runId, "screenshots"],
    queryFn: () => apiGet<{ screenshots: BatchScreenshot[] }>(`/api/automation/batch-apply/${runId}/screenshots`),
    enabled: !!runId,
    staleTime: 30000,
  })
}

/**
 * Get logs for a batch run
 */
export function useBatchLogs(runId: string | null) {
  return useQuery({
    queryKey: ["automation", "batch", runId, "logs"],
    queryFn: () => apiGet<BatchLog>(`/api/automation/batch-apply/${runId}/logs`),
    enabled: !!runId,
    staleTime: 30000,
  })
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/**
 * Launch a batch browser automation run
 */
export function useLaunchBatchApply() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: BatchApplyAutomationRequest) =>
      apiPost<BatchApplyAutomationResponse>("/api/automation/batch-apply", data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["automation", "runs"] })
      toast.success(
        `Batch ${result.run_id} started with ${result.total_jobs} jobs`
      )
    },
    onError: (error: Error) => {
      toast.error("Failed to launch batch", { description: error.message })
    },
  })
}

/**
 * Cancel a running batch
 */
export function useCancelBatch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (runId: string) =>
      apiDelete<{ run_id: string; status: string }>(
        `/api/automation/batch-apply/${runId}`
      ),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["automation", "runs"] })
      queryClient.invalidateQueries({
        queryKey: ["automation", "batch", result.run_id],
      })
      toast.info(`Batch ${result.run_id} cancelled`)
    },
    onError: (error: Error) => {
      toast.error("Failed to cancel batch", { description: error.message })
    },
  })
}

/**
 * Launch LinkedIn job discovery
 */
export function useLaunchDiscovery() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data?: DiscoverRequest) =>
      apiPost<DiscoverResponse>("/api/automation/discover", data ?? {}),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["automation", "runs"] })
      toast.success(`Discovery ${result.run_id} started`)
    },
    onError: (error: Error) => {
      toast.error("Failed to launch discovery", {
        description: error.message,
      })
    },
  })
}

/**
 * Cleanup expired jobs via URL pre-filtering
 */
export function useLaunchCleanup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data?: Record<string, unknown>) =>
      apiPost<CleanupResponse>("/api/automation/cleanup", data ?? {}),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["automation", "runs"] })
      toast.success(
        `Cleanup started: ${result.total_jobs} jobs to check`
      )
    },
    onError: (error: Error) => {
      toast.error("Cleanup failed", { description: error.message })
    },
  })
}

/**
 * Create a new automation schedule
 */
export function useCreateSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ScheduleRequest) =>
      apiPost<AutomationSchedule>("/api/automation/schedules", data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["automation", "schedules"] })
      toast.success(`Schedule "${result.name}" created`)
    },
    onError: (error: Error) => {
      toast.error("Failed to create schedule", { description: error.message })
    },
  })
}

/**
 * Delete an automation schedule
 */
export function useDeleteSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (scheduleId: string) =>
      apiDelete<{ id: string }>(`/api/automation/schedules/${scheduleId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automation", "schedules"] })
      toast.success("Schedule deleted")
    },
    onError: (error: Error) => {
      toast.error("Failed to delete schedule", { description: error.message })
    },
  })
}

/**
 * Toggle schedule enabled/disabled status
 */
export function useToggleSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ scheduleId, enabled }: { scheduleId: string; enabled: boolean }) =>
      apiPatch<AutomationSchedule>(`/api/automation/schedules/${scheduleId}`, { enabled }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["automation", "schedules"] })
      toast.success(
        `Schedule "${result.name}" ${result.enabled ? "enabled" : "disabled"}`
      )
    },
    onError: (error: Error) => {
      toast.error("Failed to toggle schedule", { description: error.message })
    },
  })
}

// ---------------------------------------------------------------------------
// SSE — Real-time batch progress
// ---------------------------------------------------------------------------

/**
 * Subscribe to SSE progress events for a batch run
 */
export function useBatchStream(runId: string | null) {
  const [events, setEvents] = useState<BatchProgressEvent[]>([])

  const handleMessage = useCallback((data: unknown) => {
    const event = data as BatchProgressEvent
    setEvents((prev) => [...prev, event])
  }, [])

  const { disconnect } = useSSE(
    `/api/automation/batch-apply/${runId}/stream`,
    handleMessage,
    { enabled: !!runId }
  )

  return { events, disconnect }
}
