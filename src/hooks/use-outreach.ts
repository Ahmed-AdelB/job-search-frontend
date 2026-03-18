"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiGet, apiPost } from "@/lib/api-client"
import type { OutreachMessage, OutreachStats } from "@/types/api"
import { toast } from "sonner"

export interface OutreachFilters {
  status?: string
  message_type?: string
  page?: number
  per_page?: number
}

export interface SendMessagePayload {
  contact_id: string
  message_type: string
  subject: string
  body: string
  save_as_draft?: boolean
}

export interface OutreachTemplate {
  id: string
  name: string
  subject: string
  body: string
  message_type: string
}

/**
 * Fetch outreach statistics
 */
export function useOutreachStats() {
  return useQuery({
    queryKey: ["outreach-stats"],
    queryFn: () => apiGet<OutreachStats>("/api/outreach/stats"),
    staleTime: 60000,
  })
}

/**
 * Fetch paginated outreach messages with optional filters
 */
export function useOutreachMessages(filters?: OutreachFilters) {
  const queryParams = new URLSearchParams()

  if (filters) {
    if (filters.status) queryParams.append("status", filters.status)
    if (filters.message_type) queryParams.append("message_type", filters.message_type)
    if (filters.page) queryParams.append("page", String(filters.page))
    if (filters.per_page) queryParams.append("per_page", String(filters.per_page))
  }

  const endpoint =
    queryParams.toString() ? `/api/outreach/messages?${queryParams.toString()}` : "/api/outreach/messages"

  return useQuery({
    queryKey: ["outreach-messages", filters],
    queryFn: () => apiGet<{ messages: OutreachMessage[]; total: number }>(endpoint),
    staleTime: 30000,
  })
}

/**
 * Send or save an outreach message
 */
export function useSendMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: SendMessagePayload) =>
      apiPost<OutreachMessage>("/api/outreach/send", payload),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["outreach-messages"] })
      queryClient.invalidateQueries({ queryKey: ["outreach-stats"] })
      toast.success("Message sent successfully")
    },
    onError: () => {
      toast.error("Failed to send message")
    },
  })
}

/**
 * Resend a message
 */
export function useResendMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (messageId: string) =>
      apiPost(`/api/outreach/${messageId}/resend`, {}),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["outreach-messages"] })
      queryClient.invalidateQueries({ queryKey: ["outreach-stats"] })
      toast.success("Message resent successfully")
    },
    onError: () => {
      toast.error("Failed to resend message")
    },
  })
}

/**
 * Fetch available outreach templates
 */
export function useOutreachTemplates() {
  return useQuery({
    queryKey: ["outreach-templates"],
    queryFn: () => apiGet<OutreachTemplate[]>("/api/outreach/templates"),
    staleTime: 3600000, // Cache for 1 hour
  })
}
