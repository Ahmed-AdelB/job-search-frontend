"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api-client"
import type { Interview, ApiListResponse } from "@/types/api"
import { toast } from "sonner"

export interface InterviewFilters {
  status?: string
  application_id?: string
  page?: number
  per_page?: number
  sort_by?: string
  sort_order?: "asc" | "desc"
}

export interface ScheduleInterviewData {
  application_id?: string
  type: "phone" | "video" | "onsite" | "technical" | "behavioral" | "final"
  scheduled_at: string
  duration_minutes?: number
  location?: string
  meeting_url?: string
  interviewer_names?: string[]
  notes?: string
}

/**
 * Fetch paginated interviews with optional filters
 */
export function useInterviews(filters?: InterviewFilters) {
  const queryParams = new URLSearchParams()

  if (filters) {
    if (filters.status) queryParams.append("status", filters.status)
    if (filters.application_id) queryParams.append("application_id", filters.application_id)
    if (filters.page) queryParams.append("page", String(filters.page))
    if (filters.per_page) queryParams.append("per_page", String(filters.per_page))
    if (filters.sort_by) queryParams.append("sort_by", filters.sort_by)
    if (filters.sort_order) queryParams.append("sort_order", filters.sort_order)
  }

  const endpoint =
    queryParams.toString()
      ? `/api/interviews?${queryParams.toString()}`
      : "/api/interviews"

  return useQuery({
    queryKey: ["interviews", filters],
    queryFn: () => apiGet<ApiListResponse<Interview>>(endpoint),
    staleTime: 30000,
  })
}

/**
 * Fetch a single interview by ID
 */
export function useInterview(interviewId: string) {
  return useQuery({
    queryKey: ["interviews", interviewId],
    queryFn: () => apiGet<Interview>(`/api/interviews/${interviewId}`),
    enabled: !!interviewId,
    staleTime: 60000,
  })
}

/**
 * Schedule a new interview
 */
export function useScheduleInterview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ScheduleInterviewData) =>
      apiPost<Interview>("/api/interviews", data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["interviews"] })
      toast.success("Interview scheduled successfully")
    },
    onError: () => {
      toast.error("Failed to schedule interview")
    },
  })
}

/**
 * Mark interview as completed
 */
export function useMarkCompleted() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (interviewId: string) =>
      apiPatch<Interview>(`/api/interviews/${interviewId}/mark-completed`, {}),
    onMutate: async (interviewId) => {
      await queryClient.cancelQueries({ queryKey: ["interviews"] })
      const previousInterview = queryClient.getQueryData<Interview>(["interviews", interviewId])
      if (previousInterview) {
        queryClient.setQueryData(["interviews", interviewId], { ...previousInterview, status: "completed" })
      }
      return { previousInterview }
    },
    onSuccess: () => {
      toast.success("Interview marked as completed")
    },
    onError: (_err, interviewId, context) => {
      if (context?.previousInterview) {
        queryClient.setQueryData(["interviews", interviewId], context.previousInterview)
      }
      toast.error("Failed to mark interview as completed")
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["interviews"] })
    },
  })
}

/**
 * Fetch interview preparation notes
 */
export function usePrepNotes(interviewId: string) {
  return useQuery({
    queryKey: ["interviews", interviewId, "prep-notes"],
    queryFn: () =>
      apiGet<{ prep_notes: string }>(
        `/api/interviews/${interviewId}/prep-notes`
      ),
    enabled: !!interviewId,
    staleTime: 60000,
  })
}

/**
 * Regenerate interview preparation notes
 */
export function useRegeneratePrepNotes() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (interviewId: string) =>
      apiPost<{ prep_notes: string }>(
        `/api/interviews/${interviewId}/prep-notes/regenerate`,
        {}
      ),
    onSuccess: (_, interviewId) => {
      queryClient.invalidateQueries({
        queryKey: ["interviews", interviewId, "prep-notes"],
      })
      toast.success("Prep notes regenerated")
    },
    onError: () => {
      toast.error("Failed to regenerate prep notes")
    },
  })
}

/**
 * Export interview to calendar format (ICS)
 */
export function useCalendarExport(interviewId: string) {
  return useQuery({
    queryKey: ["interviews", interviewId, "calendar"],
    queryFn: async () => {
      const response = await fetch(
        `/api/interviews/${interviewId}/calendar.ics`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
          },
        }
      )
      if (!response.ok) throw new Error("Failed to export calendar")
      return response.blob()
    },
    enabled: !!interviewId,
  })
}

/**
 * Update interview details
 */
export function useUpdateInterview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      interviewId,
      data,
    }: {
      interviewId: string
      data: Partial<Interview>
    }) =>
      apiPatch<Interview>(`/api/interviews/${interviewId}`, data),
    onMutate: async ({ interviewId, data }) => {
      await queryClient.cancelQueries({ queryKey: ["interviews"] })
      const previousInterview = queryClient.getQueryData<Interview>(["interviews", interviewId])
      if (previousInterview) {
        queryClient.setQueryData(["interviews", interviewId], { ...previousInterview, ...data })
      }
      return { previousInterview }
    },
    onSuccess: () => {
      toast.success("Interview updated")
    },
    onError: (_err, { interviewId }, context) => {
      if (context?.previousInterview) {
        queryClient.setQueryData(["interviews", interviewId], context.previousInterview)
      }
      toast.error("Failed to update interview")
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["interviews"] })
    },
  })
}

/**
 * Delete interview
 */
export function useDeleteInterview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (interviewId: string) =>
      apiDelete(`/api/interviews/${interviewId}`),
    onMutate: async (interviewId) => {
      await queryClient.cancelQueries({ queryKey: ["interviews"] })
      const previousInterview = queryClient.getQueryData<Interview>(["interviews", interviewId])
      queryClient.removeQueries({ queryKey: ["interviews", interviewId] })
      return { previousInterview }
    },
    onSuccess: () => {
      toast.success("Interview deleted")
    },
    onError: (_err, interviewId, context) => {
      if (context?.previousInterview) {
        queryClient.setQueryData(["interviews", interviewId], context.previousInterview)
      }
      toast.error("Failed to delete interview")
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["interviews"] })
    },
  })
}
