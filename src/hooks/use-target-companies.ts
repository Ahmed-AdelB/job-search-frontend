"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api-client"
import { getToken } from "@/lib/auth"
import type {
  TargetCompany,
  TargetListResponse,
  CreateTargetCompanyRequest,
  UpdateTargetCompanyRequest,
  TierType,
} from "@/types/api"
import { toast } from "sonner"

export interface TargetCompanyFilters {
  tier?: TierType
  search?: string
  page?: number
  per_page?: number
}

/**
 * Fetch paginated target companies with optional filters
 */
export function useTargetCompanies(filters?: TargetCompanyFilters) {
  const queryParams = new URLSearchParams()

  if (filters) {
    if (filters.tier) queryParams.append("tier", filters.tier)
    if (filters.search) queryParams.append("search", filters.search)
    if (filters.page) queryParams.append("page", String(filters.page))
    if (filters.per_page) queryParams.append("per_page", String(filters.per_page))
  }

  const endpoint =
    queryParams.toString() ? `/api/target-list?${queryParams.toString()}` : "/api/target-list"

  return useQuery({
    queryKey: ["target-companies", filters],
    queryFn: () => apiGet<TargetListResponse>(endpoint),
    staleTime: 30000,
  })
}

/**
 * Fetch a single target company by ID
 */
export function useTargetCompany(id: string) {
  return useQuery({
    queryKey: ["target-companies", id],
    queryFn: () => apiGet<TargetCompany>(`/api/target-list/${id}`),
    enabled: !!id,
    staleTime: 60000,
  })
}

/**
 * Create a new target company
 */
export function useCreateTargetCompany() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTargetCompanyRequest) =>
      apiPost<TargetCompany>("/api/target-list", data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["target-companies"] })
      queryClient.setQueryData(["target-companies", data.id], data)
      toast.success("Company added successfully")
    },
    onError: () => {
      toast.error("Failed to add company")
    },
  })
}

/**
 * Update a target company tier
 */
export function useUpdateTargetCompanyTier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, tier }: { id: string; tier: TierType }) =>
      apiPut<TargetCompany>(`/api/target-list/${id}/tier`, { tier }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["target-companies"] })
      queryClient.setQueryData(["target-companies", data.id], data)
      toast.success("Tier updated successfully")
    },
    onError: () => {
      toast.error("Failed to update tier")
    },
  })
}

/**
 * Update a target company
 */
export function useUpdateTargetCompany() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTargetCompanyRequest }) =>
      apiPut<TargetCompany>(`/api/target-list/${id}`, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["target-companies"] })
      queryClient.setQueryData(["target-companies", data.id], data)
      toast.success("Company updated successfully")
    },
    onError: () => {
      toast.error("Failed to update company")
    },
  })
}

/**
 * Delete a target company
 */
export function useDeleteTargetCompany() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiDelete(`/api/target-list/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["target-companies"] })
      toast.success("Company deleted successfully")
    },
    onError: () => {
      toast.error("Failed to delete company")
    },
  })
}

/**
 * Import target companies from CSV
 */
export function useImportTargetCompanies() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData()
      formData.append("file", file)
      const token = getToken()

      return fetch(
        `/api/target-list/import`,
        {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${token || ""}`,
          },
        }
      ).then((res) => {
        if (!res.ok) {
          throw new Error("Failed to import companies")
        }
        return res.json()
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["target-companies"] })
      toast.success("Companies imported successfully")
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to import companies"
      )
    },
  })
}
