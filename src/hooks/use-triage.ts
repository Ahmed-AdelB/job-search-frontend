"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiGet, apiPost, apiPut } from "@/lib/api-client"
import type {
  TriageDigestPreview,
  TriageDigestHistory,
  TriageConfig,
  TriagePreviewResponse,
  TriageHistoryResponse,
  TriageConfigResponse,
} from "@/types/api"
import { toast } from "sonner"

export interface TriageHistoryFilters {
  page?: number
  per_page?: number
  days_back?: number
}

/**
 * Fetch today's triage preview
 */
export function useTriagePreview() {
  return useQuery({
    queryKey: ["triage-preview"],
    queryFn: () => apiGet<TriagePreviewResponse>("/api/triage/preview"),
    staleTime: 60000, // 1 minute
    refetchInterval: 300000, // Refetch every 5 minutes
  })
}

/**
 * Fetch past triage digests
 */
export function useTriageHistory(filters?: TriageHistoryFilters) {
  const queryParams = new URLSearchParams()

  if (filters) {
    if (filters.page) queryParams.append("page", String(filters.page))
    if (filters.per_page) queryParams.append("per_page", String(filters.per_page))
    if (filters.days_back) queryParams.append("days_back", String(filters.days_back))
  }

  const endpoint =
    queryParams.toString() ? `/api/triage/history?${queryParams.toString()}` : "/api/triage/history"

  return useQuery({
    queryKey: ["triage-history", filters],
    queryFn: () => apiGet<TriageHistoryResponse>(endpoint),
    staleTime: 300000, // 5 minutes
  })
}

/**
 * Fetch triage configuration
 */
export function useTriageConfig() {
  return useQuery({
    queryKey: ["triage-config"],
    queryFn: () => apiGet<TriageConfigResponse>("/api/triage/config"),
    staleTime: 600000, // 10 minutes
  })
}

/**
 * Get a specific digest by date
 */
export function useTriageDigest(date: string) {
  return useQuery({
    queryKey: ["triage-digest", date],
    queryFn: () => apiGet<TriageDigestPreview>(`/api/triage/digest/${date}`),
    enabled: !!date,
    staleTime: 600000,
  })
}

/**
 * Generate today's digest
 */
export function useGenerateTriageDigest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => apiPost<TriageDigestPreview>("/api/triage/digest", {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["triage-preview"] })
      queryClient.invalidateQueries({ queryKey: ["triage-history"] })
      toast.success("Digest generated successfully")
    },
    onError: () => {
      toast.error("Failed to generate digest")
    },
  })
}

/**
 * Update triage configuration
 */
export function useUpdateTriageConfig() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (config: Partial<TriageConfig>) =>
      apiPut<TriageConfig>("/api/triage/config", config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["triage-config"] })
      toast.success("Triage settings updated")
    },
    onError: () => {
      toast.error("Failed to update triage settings")
    },
  })
}

/**
 * Mark digest actions as completed
 */
export function useCompleteTriageActions() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (digestId: string) =>
      apiPost(`/api/triage/digest/${digestId}/complete`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["triage-preview"] })
      queryClient.invalidateQueries({ queryKey: ["triage-history"] })
      toast.success("Actions marked as completed")
    },
    onError: () => {
      toast.error("Failed to mark actions as completed")
    },
  })
}
