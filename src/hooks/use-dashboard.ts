"use client"

import { useQuery } from "@tanstack/react-query"
import { apiGet } from "@/lib/api-client"
import type {
  PipelineStats,
  AnalyticsOverview,
  FunnelData,
  TimelineData,
} from "@/types/api"

/**
 * Fetch pipeline statistics
 */
export function usePipelineStats() {
  return useQuery({
    queryKey: ["pipeline", "stats"],
    queryFn: () => apiGet<PipelineStats>("/api/pipeline/status"),
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000, // Data is fresh for 10 seconds
  })
}

/**
 * Fetch analytics overview data
 */
export function useAnalyticsOverview() {
  return useQuery({
    queryKey: ["analytics", "overview"],
    queryFn: () => apiGet<AnalyticsOverview>("/api/v1/analytics/overview"),
    refetchInterval: 60000, // Refetch every 60 seconds
    staleTime: 30000, // Data is fresh for 30 seconds
  })
}

/**
 * Fetch funnel data for conversion visualization
 */
export function useFunnelData() {
  return useQuery({
    queryKey: ["analytics", "funnel"],
    queryFn: async () => {
      const data = await apiGet<FunnelData[]>("/api/v1/analytics/funnel")
      return data
    },
    refetchInterval: 60000, // Refetch every 60 seconds
    staleTime: 30000, // Data is fresh for 30 seconds
  })
}

/**
 * Fetch timeline data for activity tracking
 */
export function useTimelineData() {
  return useQuery({
    queryKey: ["analytics", "timeline"],
    queryFn: () => apiGet<TimelineData[]>("/api/v1/analytics/timeline"),
    refetchInterval: 60000, // Refetch every 60 seconds
    staleTime: 30000, // Data is fresh for 30 seconds
  })
}
