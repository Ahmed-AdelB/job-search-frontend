"use client"

/**
 * Portals Hooks - React Query hooks for job portal management
 * Author: Ahmed Adel Bakr Alderai
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiGet, apiPost, apiDelete } from "@/lib/api-client"
import type { Portal, PortalsResponse } from "@/types/api"
import { toast } from "sonner"

/**
 * Fetch all registered portals
 */
export function usePortals() {
  return useQuery({
    queryKey: ["portals"],
    queryFn: () => apiGet<PortalsResponse>("/api/portals"),
    staleTime: 60000,
  })
}

/**
 * Fetch a single portal by ID
 */
export function usePortal(portalId: string) {
  return useQuery({
    queryKey: ["portals", portalId],
    queryFn: () => apiGet<Portal>(`/api/portals/${portalId}`),
    enabled: !!portalId,
    staleTime: 60000,
  })
}

/**
 * Register a new portal
 */
export function useCreatePortal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { name: string; type: string; url: string; config?: Record<string, unknown> }) =>
      apiPost<Portal>(`/api/portals/${data.name}/register`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portals"] })
      toast.success("Portal registered successfully")
    },
    onError: (error: Error) => {
      toast.error("Failed to register portal", { description: error.message })
    },
  })
}

/**
 * Unregister a portal
 */
export function useDeletePortal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (portalId: string) =>
      apiDelete<{ status: string }>(`/api/portals/${portalId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portals"] })
      toast.success("Portal removed")
    },
    onError: (error: Error) => {
      toast.error("Failed to remove portal", { description: error.message })
    },
  })
}

/**
 * Force sync from portal
 */
export function useSyncPortal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (portalName: string) =>
      apiPost<{ status: string; jobs_synced: number }>(`/api/portals/${portalName}/register`, {}),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["portals"] })
      queryClient.invalidateQueries({ queryKey: ["jobs"] })
      toast.success(`Sync complete: ${data.jobs_synced} jobs`)
    },
    onError: (error: Error) => {
      toast.error("Sync failed", { description: error.message })
    },
  })
}
