"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiGet, apiPost, apiDelete } from "@/lib/api-client"
import type { Invitation, InvitationsResponse, InvitationStatus } from "@/types/api"
import { toast } from "sonner"

export interface InvitationFilters {
  type?: "incoming" | "outgoing"
  status?: InvitationStatus
  search?: string
  page?: number
  per_page?: number
}

/**
 * Fetch paginated incoming invitations
 */
export function useIncomingInvitations(filters?: Omit<InvitationFilters, "type">) {
  const queryParams = new URLSearchParams()

  if (filters) {
    if (filters.status) queryParams.append("status", filters.status)
    if (filters.search) queryParams.append("search", filters.search)
    if (filters.page) queryParams.append("page", String(filters.page))
    if (filters.per_page) queryParams.append("per_page", String(filters.per_page))
  }

  const endpoint =
    queryParams.toString()
      ? `/api/invitations/incoming?${queryParams.toString()}`
      : "/api/invitations/incoming"

  return useQuery({
    queryKey: ["invitations-incoming", filters],
    queryFn: () => apiGet<InvitationsResponse>(endpoint),
    staleTime: 30000,
  })
}

/**
 * Fetch paginated outgoing invitations
 */
export function useOutgoingInvitations(filters?: Omit<InvitationFilters, "type">) {
  const queryParams = new URLSearchParams()

  if (filters) {
    if (filters.status) queryParams.append("status", filters.status)
    if (filters.search) queryParams.append("search", filters.search)
    if (filters.page) queryParams.append("page", String(filters.page))
    if (filters.per_page) queryParams.append("per_page", String(filters.per_page))
  }

  const endpoint =
    queryParams.toString()
      ? `/api/invitations/outgoing?${queryParams.toString()}`
      : "/api/invitations/outgoing"

  return useQuery({
    queryKey: ["invitations-outgoing", filters],
    queryFn: () => apiGet<InvitationsResponse>(endpoint),
    staleTime: 30000,
  })
}

/**
 * Fetch a single invitation by ID
 */
export function useInvitation(id: string) {
  return useQuery({
    queryKey: ["invitations", id],
    queryFn: () => apiGet<Invitation>(`/api/invitations/${id}`),
    enabled: !!id,
    staleTime: 60000,
  })
}

/**
 * Accept an incoming invitation
 */
export function useAcceptInvitation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (invitationId: string) =>
      apiPost<Invitation>(`/api/invitations/${invitationId}/accept`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations-incoming"] })
      queryClient.invalidateQueries({ queryKey: ["invitations-outgoing"] })
      toast.success("Invitation accepted")
    },
    onError: () => {
      toast.error("Failed to accept invitation")
    },
  })
}

/**
 * Decline an incoming invitation
 */
export function useDeclineInvitation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (invitationId: string) =>
      apiPost<Invitation>(`/api/invitations/${invitationId}/decline`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations-incoming"] })
      toast.success("Invitation declined")
    },
    onError: () => {
      toast.error("Failed to decline invitation")
    },
  })
}

/**
 * Withdraw an outgoing invitation
 */
export function useWithdrawInvitation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (invitationId: string) =>
      apiDelete(`/api/invitations/${invitationId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations-outgoing"] })
      toast.success("Invitation withdrawn")
    },
    onError: () => {
      toast.error("Failed to withdraw invitation")
    },
  })
}

/**
 * Send a new invitation
 */
export function useSendInvitation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { email: string; message?: string }) =>
      apiPost<Invitation>("/api/invitations", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations-outgoing"] })
      toast.success("Invitation sent")
    },
    onError: () => {
      toast.error("Failed to send invitation")
    },
  })
}
