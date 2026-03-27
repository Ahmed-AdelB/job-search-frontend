"use client"

/**
 * GDPR Hooks - React Query hooks for data export and account deletion
 * Author: Ahmed Adel Bakr Alderai
 */

import { useQuery, useMutation } from "@tanstack/react-query"
import { apiGet, apiPost } from "@/lib/api-client"
import type { GDPRExportRequest, GDPRExportResponse, GDPRDeleteResponse } from "@/types/api"
import { toast } from "sonner"

/**
 * Request data export
 */
export function useGDPRExport() {
  return useMutation({
    mutationFn: (data: GDPRExportRequest | void) =>
      apiPost<GDPRExportResponse>("/api/gdpr/export", data ?? {}),
    onSuccess: () => {
      toast.success("Data export requested. You'll be notified when it's ready.")
    },
    onError: (error: Error) => {
      toast.error("Export request failed", { description: error.message })
    },
  })
}

/**
 * Check export status
 */
export function useGDPRExportStatus(requestId?: string) {
  return useQuery({
    queryKey: ["gdpr", "export", requestId],
    queryFn: () => apiGet<GDPRExportResponse>(`/api/gdpr/status/${requestId}`),
    enabled: !!requestId,
    refetchInterval: (query) =>
      query.state.data?.status === "processing" ? 5000 : false,
  })
}

/**
 * Request account deletion
 */
export function useGDPRDeleteAccount() {
  return useMutation({
    mutationFn: () =>
      apiPost<GDPRDeleteResponse>("/api/gdpr/delete", {}),
    onSuccess: () => {
      toast.success("Account deletion scheduled. You have 30 days to cancel.")
    },
    onError: (error: Error) => {
      toast.error("Deletion request failed", { description: error.message })
    },
  })
}
