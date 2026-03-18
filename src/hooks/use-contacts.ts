"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiGet, apiPut, apiDelete, apiPost } from "@/lib/api-client"
import type { LinkedInContact, ContactsResponse } from "@/types/api"
import { toast } from "sonner"

export interface ContactFilters {
  search?: string
  company?: string
  page?: number
  per_page?: number
}

/**
 * Fetch paginated contacts with optional filters
 */
export function useContacts(filters?: ContactFilters) {
  const queryParams = new URLSearchParams()

  if (filters) {
    if (filters.search) queryParams.append("search", filters.search)
    if (filters.company) queryParams.append("company", filters.company)
    if (filters.page) queryParams.append("page", String(filters.page))
    if (filters.per_page) queryParams.append("per_page", String(filters.per_page))
  }

  const endpoint =
    queryParams.toString() ? `/api/contacts?${queryParams.toString()}` : "/api/contacts"

  return useQuery({
    queryKey: ["contacts", filters],
    queryFn: () => apiGet<ContactsResponse>(endpoint),
    staleTime: 30000,
  })
}

/**
 * Fetch a single contact by LinkedIn ID
 */
export function useContact(linkedinId: string) {
  return useQuery({
    queryKey: ["contacts", linkedinId],
    queryFn: () => apiGet<LinkedInContact>(`/api/contacts/${linkedinId}`),
    enabled: !!linkedinId,
    staleTime: 60000,
  })
}

/**
 * Update a contact
 */
export function useUpdateContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      linkedinId,
      data,
    }: {
      linkedinId: string
      data: Partial<LinkedInContact>
    }) => apiPut<LinkedInContact>(`/api/contacts/${linkedinId}`, data),
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["contacts"] })
      queryClient.setQueryData(["contacts", data.linkedin_id], data)
      toast.success("Contact updated")
    },
    onError: () => {
      toast.error("Failed to update contact")
    },
  })
}

/**
 * Delete a contact
 */
export function useDeleteContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (linkedinId: string) =>
      apiDelete(`/api/contacts/${linkedinId}`),
    onSuccess: () => {
      // Invalidate all contacts queries
      queryClient.invalidateQueries({ queryKey: ["contacts"] })
      toast.success("Contact deleted")
    },
    onError: () => {
      toast.error("Failed to delete contact")
    },
  })
}

/**
 * Import contacts from CSV
 */
export function useImportContacts() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData()
      formData.append("file", file)

      return fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8082"}/api/contacts/import`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth-token") || ""}`,
        },
      }).then((res) => {
        if (!res.ok) {
          throw new Error("Failed to import contacts")
        }
        return res.json()
      })
    },
    onSuccess: () => {
      // Invalidate all contacts queries
      queryClient.invalidateQueries({ queryKey: ["contacts"] })
      toast.success("Contacts imported successfully")
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to import contacts"
      )
    },
  })
}
