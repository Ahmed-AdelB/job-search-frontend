/**
 * Notifications Management Page
 * Author: Ahmed Adel Bakr Alderai
 */

"use client"

import { useState } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Info,
  AlertTriangle,
  Trash2,
  CheckAll,
  Filter,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageSkeleton } from "@/components/shared/loading-skeleton"
import { EmptyState } from "@/components/shared/empty-state"
import { apiGet, apiPut } from "@/lib/api-client"
import { toast } from "sonner"

interface Notification {
  id: string
  type: "info" | "success" | "warning" | "error"
  title: string
  message: string
  read: boolean
  created_at: string
  action_url?: string
}

interface NotificationsResponse {
  notifications: Notification[]
  unread_count: number
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "success":
      return <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
    case "error":
      return <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
    case "warning":
      return <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
    case "info":
    default:
      return <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
  }
}

const getNotificationColor = (type: string) => {
  switch (type) {
    case "success":
      return "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900"
    case "error":
      return "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900"
    case "warning":
      return "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900"
    case "info":
    default:
      return "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900"
  }
}

export default function NotificationsPage() {
  const [filterType, setFilterType] = useState<string | null>(null)
  const [filterRead, setFilterRead] = useState<"all" | "unread" | "read">("all")

  // Fetch notifications
  const {
    data: response,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      return await apiGet<NotificationsResponse>("/api/alerts")
    },
    refetchInterval: 5000, // Auto-refresh every 5 seconds
  })

  const notifications = response?.notifications || []
  const unreadCount = response?.unread_count || 0

  // Mark as read mutation
  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiPut<{ success: boolean }>(
        `/api/alerts/${id}/read`,
        {}
      )
    },
    onSuccess: () => {
      refetch()
    },
    onError: (error: Error) => {
      toast.error("Failed to mark notification as read", {
        description: error.message,
      })
    },
  })

  // Mark all as read mutation
  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      return await apiPut<{ success: boolean }>(
        "/api/alerts/read-all",
        {}
      )
    },
    onSuccess: () => {
      toast.success("All notifications marked as read")
      refetch()
    },
    onError: (error: Error) => {
      toast.error("Failed to mark all as read", {
        description: error.message,
      })
    },
  })

  // Filter notifications
  const filteredNotifications = notifications.filter((notif) => {
    const typeMatch = !filterType || notif.type === filterType
    let readMatch = true

    if (filterRead === "unread") {
      readMatch = !notif.read
    } else if (filterRead === "read") {
      readMatch = notif.read
    }

    return typeMatch && readMatch
  })

  const formatTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

      if (seconds < 60) return "just now"
      if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
      if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
      if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
      return date.toLocaleDateString()
    } catch {
      return dateString
    }
  }

  if (isLoading) {
    return <PageSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-base px-3 py-1">
                {unreadCount}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            {filteredNotifications.length} notifications
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
            variant="outline"
            className="gap-2"
          >
            <CheckAll className="h-4 w-4" />
            Mark All Read
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className="p-6 space-y-4">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </h3>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Read Status Filter */}
          <div className="space-y-2">
            <label className="text-xs font-medium">Status</label>
            <div className="flex gap-2">
              {[
                { label: "All", value: "all" },
                { label: "Unread", value: "unread" },
                { label: "Read", value: "read" },
              ].map((option) => (
                <Button
                  key={option.value}
                  size="sm"
                  variant={filterRead === option.value ? "default" : "outline"}
                  onClick={() =>
                    setFilterRead(
                      option.value as "all" | "unread" | "read"
                    )
                  }
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Type Filter */}
          <div className="space-y-2">
            <label className="text-xs font-medium">Type</label>
            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                variant={!filterType ? "default" : "outline"}
                onClick={() => setFilterType(null)}
              >
                All Types
              </Button>
              {["info", "success", "warning", "error"].map((type) => (
                <Button
                  key={type}
                  size="sm"
                  variant={filterType === type ? "default" : "outline"}
                  onClick={() =>
                    setFilterType(filterType === type ? null : type)
                  }
                  className="capitalize"
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notif) => (
            <Card
              key={notif.id}
              className={`p-4 transition-all cursor-pointer border ${
                notif.read
                  ? "opacity-75 bg-muted/30 border-muted"
                  : getNotificationColor(notif.type)
              } hover:shadow-md`}
              onClick={() => {
                if (!notif.read) {
                  markReadMutation.mutate(notif.id)
                }
                if (notif.action_url) {
                  window.location.href = notif.action_url
                }
              }}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="flex-shrink-0 mt-0.5">
                  {getNotificationIcon(notif.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-semibold text-sm leading-tight">
                        {notif.title}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notif.message}
                      </p>
                    </div>

                    {/* Unread indicator */}
                    {!notif.read && (
                      <div className="h-2 w-2 rounded-full bg-current flex-shrink-0 mt-1" />
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between gap-2 mt-3">
                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(notif.created_at)}
                    </span>

                    {!notif.read && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          markReadMutation.mutate(notif.id)
                        }}
                        disabled={markReadMutation.isPending}
                        className="h-6 text-xs"
                      >
                        Mark as read
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <EmptyState
            icon={Bell}
            title={
              filterRead === "unread"
                ? "No unread notifications"
                : "No notifications"
            }
            description={
              filterRead === "unread"
                ? "You're all caught up!"
                : "Notifications will appear here"
            }
          />
        )}
      </div>
    </div>
  )
}
