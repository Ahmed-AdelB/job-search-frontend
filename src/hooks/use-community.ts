"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiGet, apiPost, apiDelete } from "@/lib/api-client"
import type {
  Community,
  CommunityRecommendation,
  CommunitiesResponse,
  CommunityRecommendationsResponse,
  CommunityPlatform,
} from "@/types/api"
import { toast } from "sonner"

export interface CommunityFilters {
  platform?: CommunityPlatform
  tracked_only?: boolean
  search?: string
  page?: number
  per_page?: number
}

/**
 * Fetch paginated communities with optional filters
 */
export function useCommunities(filters?: CommunityFilters) {
  const queryParams = new URLSearchParams()

  if (filters) {
    if (filters.platform) queryParams.append("platform", filters.platform)
    if (filters.tracked_only) queryParams.append("tracked_only", String(true))
    if (filters.search) queryParams.append("search", filters.search)
    if (filters.page) queryParams.append("page", String(filters.page))
    if (filters.per_page) queryParams.append("per_page", String(filters.per_page))
  }

  const endpoint =
    queryParams.toString() ? `/api/community/communities?${queryParams.toString()}` : "/api/community/communities"

  return useQuery({
    queryKey: ["communities", filters],
    queryFn: () => apiGet<CommunitiesResponse>(endpoint),
    staleTime: 30000,
  })
}

/**
 * Fetch a single community by ID
 */
export function useCommunity(id: string) {
  return useQuery({
    queryKey: ["communities", id],
    queryFn: () => apiGet<Community>(`/api/community/communities/${id}`),
    enabled: !!id,
    staleTime: 60000,
  })
}

/**
 * Fetch AI-recommended communities
 */
export function useCommunityRecommendations() {
  return useQuery({
    queryKey: ["community-recommendations"],
    queryFn: () => apiGet<CommunityRecommendationsResponse>("/api/community/recommendations"),
    staleTime: 300000, // 5 minutes
  })
}

/**
 * Track a community
 */
export function useTrackCommunity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (communityId: string) =>
      apiPost<Community>(`/api/community/communities/${communityId}/track`, {}),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["communities"] })
      queryClient.setQueryData(["communities", data.id], data)
      toast.success("Community tracked successfully")
    },
    onError: () => {
      toast.error("Failed to track community")
    },
  })
}

/**
 * Untrack a community
 */
export function useUntrackCommunity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (communityId: string) =>
      apiDelete(`/api/community/communities/${communityId}/track`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communities"] })
      toast.success("Community untracked successfully")
    },
    onError: () => {
      toast.error("Failed to untrack community")
    },
  })
}

/**
 * Add a recommended community
 */
export function useAddRecommendedCommunity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (recommendation: CommunityRecommendation) =>
      apiPost<Community>("/api/community/communities", {
        name: recommendation.name,
        platform: recommendation.platform,
        url: recommendation.url,
        description: recommendation.reason,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communities"] })
      toast.success("Community added successfully")
    },
    onError: () => {
      toast.error("Failed to add community")
    },
  })
}
