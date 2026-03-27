/**
 * Analytics Hooks - React Query hooks for analytics API endpoints
 * Author: Ahmed Adel Bakr Alderai
 */

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api-client";
import { AnalyticsOverview, FunnelData } from "@/types/api";

export interface ATSData {
  ats_type: string;
  count: number;
  percentage: number;
}

export interface TimelineData {
  date: string;
  jobs_discovered: number;
  applications: number;
  success_rate: number;
}

export interface SourceData {
  source: string;
  count: number;
  percentage: number;
}

export interface CompanyData {
  company: string;
  count: number;
  applications: number;
  success_rate: number;
}

/**
 * Fetch analytics overview (total stats, success rate, etc.)
 */
export function useAnalyticsOverview() {
  return useQuery({
    queryKey: ["analytics", "overview"],
    queryFn: () => apiGet<AnalyticsOverview>("/api/analytics/overview"),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
}

/**
 * Fetch application funnel data
 */
export function useFunnel() {
  return useQuery({
    queryKey: ["analytics", "funnel"],
    queryFn: () => apiGet<FunnelData[]>("/api/analytics/funnel"),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Fetch applications by ATS type
 */
export function useByATS() {
  return useQuery({
    queryKey: ["analytics", "ats"],
    queryFn: () => apiGet<ATSData[]>("/api/analytics/by-ats"),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Fetch timeline data for charts
 * @param days - Number of days to fetch (7, 30, 90, or "all")
 */
export function useTimeline(days: 7 | 30 | 90 | "all" = 30) {
  return useQuery({
    queryKey: ["analytics", "timeline", days],
    queryFn: () =>
      apiGet<TimelineData[]>(
        `/api/analytics/timeline?days=${days === "all" ? -1 : days}`
      ),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Fetch top job sources
 */
export function useTopSources() {
  return useQuery({
    queryKey: ["analytics", "sources"],
    queryFn: () => apiGet<SourceData[]>("/api/analytics/sources"),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Fetch top companies
 */
export function useTopCompanies() {
  return useQuery({
    queryKey: ["analytics", "companies"],
    queryFn: () => apiGet<CompanyData[]>("/api/analytics/companies"),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
