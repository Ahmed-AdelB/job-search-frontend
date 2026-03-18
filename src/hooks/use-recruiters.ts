"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiGet, apiPatch } from "@/lib/api-client"
import type { Recruiter, RecruitersResponse } from "@/types/api"
import { toast } from "sonner"

interface RecruiterFilters {
  specialization?: string
  min_response_rate?: number
  search?: string
  page?: number
  per_page?: number
  sort_by?: string
  sort_order?: "asc" | "desc"
}

/**
 * Fetch paginated recruiters with optional filters
 */
export function useRecruiters(filters?: RecruiterFilters) {
  const queryParams = new URLSearchParams()

  if (filters) {
    if (filters.specialization) queryParams.append("specialization", filters.specialization)
    if (filters.min_response_rate !== undefined)
      queryParams.append("min_response_rate", String(filters.min_response_rate))
    if (filters.search) queryParams.append("search", filters.search)
    if (filters.page) queryParams.append("page", String(filters.page))
    if (filters.per_page) queryParams.append("per_page", String(filters.per_page))
    if (filters.sort_by) queryParams.append("sort_by", filters.sort_by)
    if (filters.sort_order) queryParams.append("sort_order", filters.sort_order)
  }

  const endpoint =
    queryParams.toString()
      ? `/api/recruiters?${queryParams.toString()}`
      : "/api/recruiters"

  return useQuery({
    queryKey: ["recruiters", filters],
    queryFn: () => apiGet<RecruitersResponse>(endpoint),
    staleTime: 30000,
  })
}

/**
 * Fetch a single recruiter by LinkedIn ID
 */
export function useRecruiter(linkedinId: string) {
  return useQuery({
    queryKey: ["recruiters", linkedinId],
    queryFn: () => apiGet<Recruiter>(`/api/recruiters/${linkedinId}`),
    enabled: !!linkedinId,
    staleTime: 60000,
  })
}

/**
 * Update recruiter details and interaction log
 */
export function useUpdateRecruiter() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      linkedinId,
      data,
    }: {
      linkedinId: string
      data: Partial<Recruiter>
    }) =>
      apiPatch<Recruiter>(`/api/recruiters/${linkedinId}`, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["recruiters"] })
      queryClient.setQueryData(["recruiters", data.linkedin_id], data)
      toast.success("Recruiter updated")
    },
    onError: () => {
      toast.error("Failed to update recruiter")
    },
  })
}

/**
 * Fetch all recruiters with specialization filter
 */
export function useRecruitersBySpecialization(specialization?: string) {
  return useQuery({
    queryKey: ["recruiters-by-spec", specialization],
    queryFn: () =>
      apiGet<RecruitersResponse>(
        `/api/recruiters?specialization=${specialization || ""}`
      ),
    enabled: !!specialization,
    staleTime: 30000,
  })
}

/**
 * Fetch recruiter recommendations
 */
export function useRecruiterRecommendations(recruiterLinkedinId: string) {
  return useQuery({
    queryKey: ["recruiters", recruiterLinkedinId, "recommendations"],
    queryFn: () =>
      apiGet<{ recommended_outreach: string }>(
        `/api/recruiters/${recruiterLinkedinId}/recommendations`
      ),
    enabled: !!recruiterLinkedinId,
    staleTime: 60000,
  })
}

/**
 * Get unique specializations for filtering
 */
export function useSpecializations() {
  return useQuery({
    queryKey: ["recruiters-specializations"],
    queryFn: () =>
      apiGet<{ specializations: string[] }>("/api/recruiters/specializations"),
    staleTime: 3600000, // Cache for 1 hour
  })
}
