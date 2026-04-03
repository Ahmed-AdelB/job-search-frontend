"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiGet, apiPatch, apiPost } from "@/lib/api-client"
import { getToken } from "@/lib/auth"
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
    onMutate: async ({ applicationId, data }) => {
      await queryClient.cancelQueries({ queryKey: ["applications"] })
      const previousApplication = queryClient.getQueryData<Application>(["applications", applicationId])
      if (previousApplication) {
        queryClient.setQueryData(["applications", applicationId], { ...previousApplication, ...data })
      }
      return { previousApplication }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["applications", data.application_id], data)
      toast.success("Application updated")
    },
    onError: (_err, { applicationId }, context) => {
      if (context?.previousApplication) {
        queryClient.setQueryData(["applications", applicationId], context.previousApplication)
      }
      toast.error("Failed to update application")
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] })
    },
  })
}

/**
 * Approve an application (mark as interview/offer)
 * Author: Ahmed Adel Bakr Alderai
 */
export function useApproveApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (applicationId: string) =>
      apiPost<{ success: boolean; status: string }>(
        `/api/applications/${applicationId}/status`,
        { status: "interview" }
      ),
    onMutate: async (applicationId) => {
      await queryClient.cancelQueries({ queryKey: ["applications"] })
      const previousApplication = queryClient.getQueryData<Application>(["applications", applicationId])
      if (previousApplication) {
        queryClient.setQueryData(["applications", applicationId], {
          ...previousApplication,
          status: "interview"
        })
      }
      return { previousApplication }
    },
    onSuccess: (_data, applicationId) => {
      queryClient.setQueryData(["applications", applicationId], (old: Application) => ({
        ...old,
        status: "interview",
      }))
      toast.success("Application approved - marked as interview")
    },
    onError: (_err, applicationId, context) => {
      if (context?.previousApplication) {
        queryClient.setQueryData(["applications", applicationId], context.previousApplication)
      }
      toast.error("Failed to approve application")
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] })
    },
  })
}

/**
 * Reject an application
 * Author: Ahmed Adel Bakr Alderai
 */
export function useRejectApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (applicationId: string) =>
      apiPost<{ success: boolean; status: string }>(
        `/api/applications/${applicationId}/skip`,
        {}
      ),
    onMutate: async (applicationId) => {
      await queryClient.cancelQueries({ queryKey: ["applications"] })
      const previousApplication = queryClient.getQueryData<Application>(["applications", applicationId])
      if (previousApplication) {
        queryClient.setQueryData(["applications", applicationId], {
          ...previousApplication,
          status: "rejected"
        })
      }
      return { previousApplication }
    },
    onSuccess: (_data, applicationId) => {
      queryClient.setQueryData(["applications", applicationId], (old: Application) => ({
        ...old,
        status: "rejected",
      }))
      toast.success("Application rejected")
    },
    onError: (_err, applicationId, context) => {
      if (context?.previousApplication) {
        queryClient.setQueryData(["applications", applicationId], context.previousApplication)
      }
      toast.error("Failed to reject application")
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] })
    },
  })
}

/**
 * Retry an application
 * Author: Ahmed Adel Bakr Alderai
 */
export function useRetryApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (applicationId: string) =>
      apiPost<{ success: boolean; status: string; message: string }>(
        `/api/applications/${applicationId}/reapply`,
        {}
      ),
    onMutate: async (applicationId) => {
      await queryClient.cancelQueries({ queryKey: ["applications"] })
      const previousApplication = queryClient.getQueryData<Application>(["applications", applicationId])
      if (previousApplication) {
        queryClient.setQueryData(["applications", applicationId], {
          ...previousApplication,
          status: "new"
        })
      }
      return { previousApplication }
    },
    onSuccess: (_data, applicationId) => {
      queryClient.setQueryData(["applications", applicationId], (old: Application) => ({
        ...old,
        status: "new",
      }))
      toast.success("Application re-queued for processing")
    },
    onError: (_err, applicationId, context) => {
      if (context?.previousApplication) {
        queryClient.setQueryData(["applications", applicationId], context.previousApplication)
      }
      toast.error("Failed to retry application")
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] })
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
    onMutate: async (applicationId) => {
      await queryClient.cancelQueries({ queryKey: ["applications"] })
      const previousApplication = queryClient.getQueryData<Application>(["applications", applicationId])
      if (previousApplication) {
        queryClient.setQueryData(["applications", applicationId], { ...previousApplication, status: "withdrawn" })
      }
      return { previousApplication }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["applications", data.application_id], data)
      toast.success("Application withdrawn")
    },
    onError: (_err, applicationId, context) => {
      if (context?.previousApplication) {
        queryClient.setQueryData(["applications", applicationId], context.previousApplication)
      }
      toast.error("Failed to withdraw application")
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] })
    },
  })
}

/**
 * Export applications as CSV
 * Author: Ahmed Adel Bakr Alderai
 */
export function useExportApplications() {
  return useMutation({
    mutationFn: async (status?: string) => {
      const url = status
        ? `/api/applications/export/csv?status=${status}`
        : "/api/applications/export/csv"

      const token = getToken()
      const response = await fetch(url, {
        method: "GET",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })

      if (!response.ok) {
        throw new Error("Failed to export applications")
      }

      // Get the CSV data as blob
      const blob = await response.blob()

      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = downloadUrl
      link.download = `applications-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(downloadUrl)

      return { success: true }
    },
    onSuccess: () => {
      toast.success("Applications exported successfully")
    },
    onError: () => {
      toast.error("Failed to export applications")
    },
  })
}
