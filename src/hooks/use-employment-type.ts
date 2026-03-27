"use client"

/**
 * Employment Type Hooks - React Query hooks for employment type detection
 * Author: Ahmed Adel Bakr Alderai
 */

import { useQuery, useMutation } from "@tanstack/react-query"
import { apiGet, apiPost } from "@/lib/api-client"
import type { EmploymentTypeDetection, EmploymentTypeStats } from "@/types/api"
import { toast } from "sonner"

/**
 * Detect employment type from job description
 */
export function useEmploymentTypeDetect() {
  return useMutation({
    mutationFn: (data: { title: string; description: string }) =>
      apiPost<EmploymentTypeDetection>("/api/employment-type/detect", data),
    onError: (error: Error) => {
      toast.error("Detection failed", { description: error.message })
    },
  })
}

/**
 * Get employment type statistics
 */
export function useEmploymentTypeStats() {
  return useQuery({
    queryKey: ["employment-type", "stats"],
    queryFn: () => apiGet<EmploymentTypeStats>("/api/employment-type/stats"),
    staleTime: 5 * 60 * 1000,
  })
}
