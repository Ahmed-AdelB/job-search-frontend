"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiGet, apiPatch, apiPost } from "@/lib/api-client"
import type { Application, ApplicationsResponse } from "@/types/api"
import { toast } from "sonner"

export interface ApplicationFilters {
  status?: string
  job_id?: string
  page?: number
  per_page?: number
  sort_by?: string
  sort_order?: "asc" | "desc"
}

/**
 * Fetch paginated applications with optional filters
 */
export function useApplications(filters?: ApplicationFilters) {
  const queryParams = new URLSearchParams()

  if (filters) {
    if (filters.status) queryParams.append("status", filters.status)
    if (filters.job_id) queryParams.append("job_id", filters.job_id)
    if (filters.page) queryParams.append("page", String(filters.page))
    if (filters.per_page) queryParams.append("per_page", String(filters.per_page))
    if (filters.sort_by) queryParams.append("sort_by", filters.sort_by)
    if (filters.sort_order) queryParams.append("sort_order", filters.sort_order)
  }

  const endpoint =
    queryParams.toString()
      ? `/api/applications?${queryParams.toString()}`
      : "/api/applications"

  return useQuery({
    queryKey: ["applications", filters],
    queryFn: () => apiGet<ApplicationsResponse>(endpoint),
    staleTime: 30000,
  })
}

/**
 * Fetch a single application by ID
 */
export function useApplication(applicationId: string) {
  return useQuery({
    queryKey: ["applications", applicationId],
    queryFn: () => apiGet<Application>(`/api/applications/${applicationId}`),
    enabled: !!applicationId,
    staleTime: 60000,
  })
}

/**
 * Update application status and details
 */
export function useUpdateApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      applicationId,
      data,
    }: {
      applicationId: string
      data: Partial<Application>
    }) =>
      apiPatch<Application>(
        `/api/applications/${applicationId}`,
        data
      ),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["applications"] })
      queryClient.setQueryData(["applications", data.application_id], data)
      toast.success("Application updated")
    },
    onError: () => {
      toast.error("Failed to update application")
    },
  })
}

/**
 * Withdraw an application
 */
export function useWithdrawApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (applicationId: string) =>
      apiPost<Application>(
        `/api/applications/${applicationId}/withdraw`,
        {}
      ),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["applications"] })
      queryClient.setQueryData(["applications", data.application_id], data)
      toast.success("Application withdrawn")
    },
    onError: () => {
      toast.error("Failed to withdraw application")
    },
  })
}
