"use client"

import { useQuery } from "@tanstack/react-query"
import { apiGet } from "@/lib/api-client"
import type {
  PipelineStats,
  AnalyticsOverview,
  FunnelData,
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
    queryFn: () => apiGet<AnalyticsOverview>("/api/analytics/overview"),
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
      const data = await apiGet<FunnelData[]>("/api/analytics/funnel")
      return data
    },
    refetchInterval: 60000, // Refetch every 60 seconds
    staleTime: 30000, // Data is fresh for 30 seconds
  })
}
