"use client"

/**
 * Apply System Hooks - React Query hooks for job application endpoints
 * Author: Ahmed Adel Bakr Alderai
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiGet, apiPost } from "@/lib/api-client"
import type {
  ApplyRequest,
  ApplyResponse,
  ApplyStatus,
  BatchApplyRequest,
  BatchApplyResponse,
  RateLimits,
  DryRunResult,
} from "@/types/api"
import { toast } from "sonner"

/**
 * Apply to a single job
 */
export function useApplyToJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ jobId, data }: { jobId: string; data?: ApplyRequest }) =>
      apiPost<ApplyResponse>(`/api/apply/${jobId}`, data ?? {}),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["applications"] })
      queryClient.invalidateQueries({ queryKey: ["jobs"] })
      queryClient.invalidateQueries({ queryKey: ["apply", "status"] })
      toast.success(`Application submitted: ${result.status}`)
    },
    onError: (error: Error) => {
      toast.error("Failed to apply", { description: error.message })
    },
  })
}

/**
 * Dry-run (preview) an application without submitting
 */
export function useDryRunApply() {
  return useMutation({
    mutationFn: (data: { job_id: string; resume_id?: string }) =>
      apiPost<DryRunResult>("/api/apply/dry-run", data),
    onError: (error: Error) => {
      toast.error("Dry run failed", { description: error.message })
    },
  })
}

/**
 * Auto-apply to a job via ATS automation
 */
export function useAutoApply() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (jobId: string) =>
      apiPost<ApplyResponse>(`/api/apply/auto-apply/${jobId}`, {}),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["applications"] })
      queryClient.invalidateQueries({ queryKey: ["jobs"] })
      toast.success(`Auto-apply initiated: ${result.status}`)
    },
    onError: (error: Error) => {
      toast.error("Auto-apply failed", { description: error.message })
    },
  })
}

/**
 * Apply to a job via LinkedIn Easy Apply with CV optimization
 */
export function useLinkedInEasyApply() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ jobId, dryRun }: { jobId: string; dryRun?: boolean }) =>
      apiPost<{
        success: boolean
        job_id: number
        company: string
        title: string
        channel: string
        cv_tailored: boolean
        dry_run: boolean
        error?: string
      }>(`/api/apply/linkedin-easy-apply/${jobId}`, { dry_run: dryRun ?? false }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["applications"] })
      queryClient.invalidateQueries({ queryKey: ["jobs"] })
      queryClient.invalidateQueries({ queryKey: ["apply", "status"] })
      if (result.dry_run) {
        toast.info(`Dry run complete for ${result.title} at ${result.company}`)
      } else if (result.success) {
        toast.success(`LinkedIn Easy Apply sent: ${result.title} at ${result.company}${result.cv_tailored ? " (CV optimized)" : ""}`)
      } else {
        toast.error(`Application failed: ${result.error || "Unknown error"}`)
      }
    },
    onError: (error: Error) => {
      toast.error("LinkedIn Easy Apply failed", { description: error.message })
    },
  })
}

/**
 * Batch apply to top-scored LinkedIn jobs
 */
export function useBatchLinkedInEasyApply() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () =>
      apiPost<{
        success: boolean
        total: number
        applied: number
        failed: number
        skipped: number
        results: Array<{ job_id: number; title: string; company: string; success: boolean; error?: string }>
      }>("/api/apply/linkedin-easy-apply/batch", {}),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["applications"] })
      queryClient.invalidateQueries({ queryKey: ["jobs"] })
      toast.success(`Batch apply: ${result.applied} succeeded, ${result.failed} failed out of ${result.total}`)
    },
    onError: (error: Error) => {
      toast.error("Batch LinkedIn Easy Apply failed", { description: error.message })
    },
  })
}

/**
 * Retry a failed application
 */
export function useRetryApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (applicationId: string) =>
      apiPost<ApplyResponse>(`/api/apply/retry/${applicationId}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] })
      queryClient.invalidateQueries({ queryKey: ["apply", "status"] })
      toast.success("Application retry queued")
    },
    onError: (error: Error) => {
      toast.error("Retry failed", { description: error.message })
    },
  })
}

/**
 * Queue multiple jobs for batch application
 */
export function useBatchApply() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: BatchApplyRequest) =>
      apiPost<BatchApplyResponse>("/api/apply/batch-queue", data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["applications"] })
      queryClient.invalidateQueries({ queryKey: ["apply", "status"] })
      toast.success(`Queued ${result.queued} jobs, ${result.skipped} skipped`)
    },
    onError: (error: Error) => {
      toast.error("Batch apply failed", { description: error.message })
    },
  })
}

/**
 * Get apply status for a single job
 */
export function useApplyStatus(jobId: string) {
  return useQuery({
    queryKey: ["apply", "status", jobId],
    queryFn: () => apiGet<ApplyStatus>(`/api/apply/status/${jobId}`),
    enabled: !!jobId,
    refetchInterval: 10000,
    staleTime: 5000,
  })
}

/**
 * Get apply status for multiple jobs
 */
export function useBulkApplyStatus(jobIds?: string[]) {
  const params = jobIds?.length ? `?job_ids=${jobIds.join(",")}` : ""
  return useQuery({
    queryKey: ["apply", "bulk-status", jobIds],
    queryFn: () => apiGet<ApplyStatus[]>(`/api/apply/bulk-status${params}`),
    enabled: !!jobIds?.length,
    refetchInterval: 15000,
    staleTime: 5000,
  })
}

/**
 * Get current rate limits
 */
export function useRateLimits() {
  return useQuery({
    queryKey: ["apply", "rate-limits"],
    queryFn: () => apiGet<RateLimits>("/api/apply/rate-limits"),
    staleTime: 30000,
  })
}

/**
 * Update rate limits
 */
export function useUpdateRateLimits() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (limits: { max_per_hour?: number; max_per_day?: number }) =>
      apiPost<RateLimits>("/api/apply/rate-limits", limits),
    onSuccess: (data) => {
      queryClient.setQueryData(["apply", "rate-limits"], data)
      toast.success("Rate limits updated")
    },
    onError: (error: Error) => {
      toast.error("Failed to update rate limits", { description: error.message })
    },
  })
}
