"use client"

/**
 * Automation Hooks — React Query hooks for browser-based ATS automation
 * Author: Ahmed Adel Bakr Alderai
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiGet, apiPost, apiDelete } from "@/lib/api-client"
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
  return useMutation({
    mutationFn: () =>
      apiPost<CleanupResponse>("/api/automation/cleanup", {}),
    onSuccess: (result) => {
      toast.success(
        `Cleanup: ${result.alive} alive, ${result.dead} dead, ${result.archived} archived`
      )
    },
    onError: (error: Error) => {
      toast.error("Cleanup failed", { description: error.message })
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
