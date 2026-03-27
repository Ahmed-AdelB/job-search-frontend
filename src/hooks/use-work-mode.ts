"use client"

/**
 * Work Mode Hooks - React Query hooks for work mode detection
 * Author: Ahmed Adel Bakr Alderai
 */

import { useQuery, useMutation } from "@tanstack/react-query"
import { apiGet, apiPost } from "@/lib/api-client"
import type { WorkModeDetection, WorkModeStats } from "@/types/api"
import { toast } from "sonner"

/**
 * Detect work mode for a job description
 */
export function useWorkModeDetect() {
  return useMutation({
    mutationFn: (data: { title: string; description: string }) =>
      apiPost<WorkModeDetection>("/api/work-mode/detect", data),
    onError: (error: Error) => {
      toast.error("Detection failed", { description: error.message })
    },
  })
}

/**
 * Get work mode statistics across all analyzed jobs
 */
export function useWorkModeStats() {
  return useQuery({
    queryKey: ["work-mode", "stats"],
    queryFn: () => apiGet<WorkModeStats>("/api/work-mode/stats"),
    staleTime: 5 * 60 * 1000,
  })
}
