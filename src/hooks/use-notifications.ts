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
      ? `/api/notifications?${queryParams.toString()}`
      : "/api/notifications"

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
        `/api/notifications/${notificationId}`,
        { read: true }
      ),
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] })
      const previousNotifications = queryClient.getQueriesData<NotificationsResponse>({ queryKey: ["notifications"] })
      queryClient.setQueriesData<NotificationsResponse>(
        { queryKey: ["notifications"] },
        (old) => old ? {
          ...old,
          notifications: old.notifications.map((n) =>
            n.id === notificationId ? { ...n, read: true } : n
          ),
        } : old
      )
      return { previousNotifications }
    },
    onError: (_err, _vars, context) => {
      if (context?.previousNotifications) {
        for (const [key, data] of context.previousNotifications) {
          if (data) queryClient.setQueryData(key, data)
        }
      }
      toast.error("Failed to mark notification as read")
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
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
        `/api/notifications/mark-all-read`,
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
        `/api/notifications/${notificationId}/delete`,
        {}
      ),
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] })
      const previousNotifications = queryClient.getQueriesData<NotificationsResponse>({ queryKey: ["notifications"] })
      queryClient.setQueriesData<NotificationsResponse>(
        { queryKey: ["notifications"] },
        (old) => old ? {
          ...old,
          notifications: old.notifications.filter((n) => n.id !== notificationId),
          total: old.total - 1,
        } : old
      )
      return { previousNotifications }
    },
    onSuccess: () => {
      toast.success("Notification deleted")
    },
    onError: (_err, _vars, context) => {
      if (context?.previousNotifications) {
        for (const [key, data] of context.previousNotifications) {
          if (data) queryClient.setQueryData(key, data)
        }
      }
      toast.error("Failed to delete notification")
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })
}
