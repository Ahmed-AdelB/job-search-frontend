"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiGet, apiPost } from "@/lib/api-client"
import { getToken } from "@/lib/auth"
import type {
  SkillGapAnalysis,
  VisaScore,
  SalaryBenchmark,
} from "@/types/api"
import { toast } from "sonner"

/**
 * Analyze skill gap against a job or market
 */
export function useSkillGap(jobId?: number) {
  return useMutation({
    mutationFn: (params: { job_id?: number }) =>
      apiPost<SkillGapAnalysis>("/api/skills-gap/analyze", params),
    onError: () => {
      toast.error("Failed to analyze skill gap")
    },
  })
}

/**
 * Get skill gap recommendations
 */
export function useSkillRecommendations() {
  return useQuery({
    queryKey: ["skill-recommendations"],
    queryFn: () =>
      apiGet<{
        recommendations: Array<{
          skill: string
          courses: Array<{
            name: string
            provider: string
            duration: string
            cost: string
          }>
        }>
      }>("/api/skills-gap/recommendations"),
    staleTime: 3600000, // 1 hour
  })
}

/**
 * Score visa eligibility
 */
export function useVisaScore() {
  return useMutation({
    mutationFn: (params: { occupation?: string; country?: string }) =>
      apiPost<VisaScore>("/api/visa-scoring/score", params),
    onError: () => {
      toast.error("Failed to calculate visa score")
    },
  })
}

/**
 * Get eligible occupations for visa sponsorship
 */
export function useEligibleOccupations() {
  return useQuery({
    queryKey: ["eligible-occupations"],
    queryFn: () =>
      apiGet<{
        occupations: Array<{
          occupation: string
          countries: string[]
          demand: "high" | "medium" | "low"
        }>
      }>("/api/visa-scoring/eligible-occupations"),
    staleTime: 3600000, // 1 hour
  })
}

/**
 * Get salary benchmark for a title and location
 */
export function useSalaryBenchmark(title: string, location: string) {
  return useQuery({
    queryKey: ["salary-benchmark", title, location],
    queryFn: () =>
      apiGet<SalaryBenchmark>(
        `/api/salary/benchmark?title=${encodeURIComponent(title)}&location=${encodeURIComponent(location)}`
      ),
    enabled: !!title && !!location,
    staleTime: 86400000, // 24 hours
  })
}

/**
 * Get comprehensive salary report
 */
export function useSalaryReport() {
  return useQuery({
    queryKey: ["salary-report"],
    queryFn: () =>
      apiGet<{
        report: {
          current_salary?: number
          target_salary?: number
          market_median: number
          percentile_rank: number
          location: string
          title: string
        }
      }>("/api/salary/report"),
    staleTime: 3600000, // 1 hour
  })
}

/**
 * Score a job's remote-friendliness
 */
export function useRemoteScore(jobId?: number) {
  return useMutation({
    mutationFn: (params: { job_id: number }) =>
      apiPost<{
        remote_score: number
        remote_type: "remote" | "hybrid" | "onsite"
        reasoning: string
      }>("/api/remote-scoring/score", params),
    onError: () => {
      toast.error("Failed to score remote flexibility")
    },
  })
}

/**
 * Export salary report as PDF
 */
export function useSalaryReportPDF() {
  return useMutation({
    mutationFn: () => {
      const token = getToken()
      return fetch("/api/salary/report/pdf", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token || ""}`,
        },
      }).then((res) => res.blob())
    },
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `salary-report-${new Date().toISOString().split("T")[0]}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      toast.success("Salary report downloaded")
    },
    onError: () => {
      toast.error("Failed to download salary report")
    },
  })
}
