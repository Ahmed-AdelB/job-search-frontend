"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiGet, apiPut, apiPatch, apiDelete } from "@/lib/api-client"
import type { Job, JobsResponse, JobFilters } from "@/types/api"
import { toast } from "sonner"

/**
 * Fetch paginated jobs with optional filters
 */
export function useJobs(filters?: JobFilters) {
  const queryParams = new URLSearchParams()

  if (filters) {
    if (filters.status) queryParams.append("status", filters.status)
    if (filters.source) queryParams.append("source", filters.source)
    if (filters.min_score !== undefined)
      queryParams.append("min_score", String(filters.min_score))
    if (filters.remote_type) queryParams.append("remote_type", filters.remote_type)
    if (filters.search) queryParams.append("search", filters.search)
    if (filters.page) queryParams.append("page", String(filters.page))
    if (filters.per_page) queryParams.append("per_page", String(filters.per_page))
    if (filters.sort_by) queryParams.append("sort_by", filters.sort_by)
    if (filters.sort_order) queryParams.append("sort_order", filters.sort_order)
  }

  const endpoint =
    queryParams.toString() ? `/api/jobs?${queryParams.toString()}` : "/api/jobs"

  return useQuery({
    queryKey: ["jobs", filters],
    queryFn: () => apiGet<JobsResponse>(endpoint),
    staleTime: 30000,
  })
}

/**
 * Fetch a single job by ID
 */
export function useJob(jobId: string) {
  return useQuery({
    queryKey: ["jobs", jobId],
    queryFn: () => apiGet<Job>(`/api/jobs/${jobId}`),
    enabled: !!jobId,
    staleTime: 60000,
  })
}

/**
 * Update job status
 */
export function useUpdateJobStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      jobId,
      status,
    }: {
      jobId: string
      status: string
    }) => apiPatch<Job>(`/api/jobs/${jobId}`, { status }),
    onMutate: async ({ jobId, status }) => {
      await queryClient.cancelQueries({ queryKey: ["jobs"] })
      const previousJob = queryClient.getQueryData<Job>(["jobs", jobId])
      if (previousJob) {
        queryClient.setQueryData(["jobs", jobId], { ...previousJob, status })
      }
      return { previousJob }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["jobs", data.job_id], data)
      toast.success("Job status updated")
    },
    onError: (_err, { jobId }, context) => {
      if (context?.previousJob) {
        queryClient.setQueryData(["jobs", jobId], context.previousJob)
      }
      toast.error("Failed to update job status")
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] })
    },
  })
}

/**
 * Perform bulk actions on jobs
 */
export function useBulkAction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      action,
      jobIds,
      data,
    }: {
      action: string
      jobIds: string[]
      data?: Record<string, unknown>
    }) =>
      apiPut<{ count: number }>("/api/jobs/bulk-action", {
        action,
        job_ids: jobIds,
        ...data,
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] })
      toast.success(`Updated ${data.count} job(s)`)
    },
    onError: () => {
      toast.error("Failed to perform bulk action")
    },
  })
}

/**
 * Delete a single job
 */
export function useDeleteJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (jobId: string) => apiDelete(`/api/jobs/${jobId}`),
    onMutate: async (jobId) => {
      await queryClient.cancelQueries({ queryKey: ["jobs"] })
      const previousJob = queryClient.getQueryData<Job>(["jobs", jobId])
      queryClient.removeQueries({ queryKey: ["jobs", jobId] })
      return { previousJob }
    },
    onSuccess: () => {
      toast.success("Job deleted")
    },
    onError: (_err, jobId, context) => {
      if (context?.previousJob) {
        queryClient.setQueryData(["jobs", jobId], context.previousJob)
      }
      toast.error("Failed to delete job")
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] })
    },
  })
}
