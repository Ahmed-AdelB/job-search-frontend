"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiGet, apiPatch, apiPost } from "@/lib/api-client"
import type { Notification } from "@/types/api"
import { toast } from "sonner"

export interface NotificationsFilters {
  type?: "info" | "success" | "warning" | "error" | "all"
  read?: boolean
  page?: number
  per_page?: number
}

export interface NotificationsResponse {
  notifications: Notification[]
  total: number
  page: number
  per_page: number
}

/**
 * Fetch paginated notifications with optional filters
 */
export function useNotifications(filters?: NotificationsFilters) {
  const queryParams = new URLSearchParams()

  if (filters) {
    if (filters.type && filters.type !== "all") queryParams.append("type", filters.type)
    if (filters.read !== undefined) queryParams.append("read", String(filters.read))
    if (filters.page) queryParams.append("page", String(filters.page))
    if (filters.per_page) queryParams.append("per_page", String(filters.per_page))
  }

  const endpoint =
    queryParams.toString()
      ? `/api/v1/notifications?${queryParams.toString()}`
      : "/api/v1/notifications"

  return useQuery({
    queryKey: ["notifications", filters],
    queryFn: () => apiGet<NotificationsResponse>(endpoint),
    staleTime: 10000,
  })
}

/**
 * Mark a single notification as read
 */
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (notificationId: string) =>
      apiPatch<Notification>(
        `/api/v1/notifications/${notificationId}`,
        { read: true }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
    onError: () => {
      toast.error("Failed to mark notification as read")
    },
  })
}

/**
 * Mark all notifications as read
 */
export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () =>
      apiPost<{ count: number }>(
        `/api/v1/notifications/mark-all-read`,
        {}
      ),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
      toast.success(`Marked ${data.count} notification(s) as read`)
    },
    onError: () => {
      toast.error("Failed to mark all notifications as read")
    },
  })
}

/**
 * Delete a notification
 */
export function useDeleteNotification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (notificationId: string) =>
      apiPost<{ success: boolean }>(
        `/api/v1/notifications/${notificationId}/delete`,
        {}
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
      toast.success("Notification deleted")
    },
    onError: () => {
      toast.error("Failed to delete notification")
    },
  })
}
