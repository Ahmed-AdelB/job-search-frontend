"use client"

import { useState } from "react"
import { useNotifications, useMarkAllNotificationsAsRead, useMarkNotificationAsRead, useDeleteNotification } from "@/hooks/use-notifications"
import { isSafeUrl, formatRelativeTime, getNotificationTypeConfig } from "@/lib/notification-utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import {
  AlertCircle,
  Bell,
  CheckCircle,
  InfoIcon,
  XCircle,
  ChevronRight,
  Trash2,
} from "lucide-react"
import Link from "next/link"
import type { Notification } from "@/types/api"

const ITEMS_PER_PAGE = 10

type FilterType = "all" | "info" | "success" | "warning" | "error" | "unread"

export default function NotificationsPage() {
  const [currentFilter, setCurrentFilter] = useState<FilterType>("all")
  const [currentPage, setCurrentPage] = useState(1)

  // Determine API filter based on current filter
  const getApiFilter = () => {
    if (currentFilter === "unread") {
      return {
        type: "all" as const,
        read: false,
        page: currentPage,
        per_page: ITEMS_PER_PAGE,
      }
    }
    return {
      type: (currentFilter === "all" ? undefined : currentFilter) as
        | "info"
        | "success"
        | "warning"
        | "error"
        | undefined,
      page: currentPage,
      per_page: ITEMS_PER_PAGE,
    }
  }

  const { data, isLoading, error } = useNotifications(getApiFilter())
  const { mutate: markAsRead, isPending: isMarkingRead } = useMarkNotificationAsRead()
  const { mutate: markAllAsRead, isPending: isMarkingAllRead } = useMarkAllNotificationsAsRead()
  const { mutate: deleteNotification, isPending: isDeleting } = useDeleteNotification()

  const notifications = data?.notifications || []
  const total = data?.total || 0
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleMarkAsRead = (notificationId: string, isRead: boolean) => {
    if (!isRead) {
      markAsRead(notificationId)
    }
  }

  const handleMarkAllAsRead = () => {
    markAllAsRead()
  }

  const handleDelete = (notificationId: string) => {
    deleteNotification(notificationId)
  }

  const renderIcon = (type: Notification["type"]) => {
    const iconProps = { className: "w-5 h-5" }
    switch (type) {
      case "info":
        return <InfoIcon {...iconProps} />
      case "success":
        return <CheckCircle {...iconProps} />
      case "warning":
        return <AlertCircle {...iconProps} />
      case "error":
        return <XCircle {...iconProps} />
      default:
        return <Bell {...iconProps} />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
              : "All caught up"}
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            onClick={handleMarkAllAsRead}
            disabled={isMarkingAllRead || notifications.length === 0}
            variant="outline"
          >
            Mark all as read
          </Button>
        )}
      </div>

      {/* Tabs and Content */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Notifications</CardTitle>
              <CardDescription>
                {total === 0 ? "No notifications" : `${total} total notification${total > 1 ? "s" : ""}`}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Filter Tabs */}
          <Tabs value={currentFilter} onValueChange={(value) => {
            setCurrentFilter(value as FilterType)
            setCurrentPage(1)
          }}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">
                Unread
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="info">Info</TabsTrigger>
              <TabsTrigger value="success">Success</TabsTrigger>
              <TabsTrigger value="warning">Warning</TabsTrigger>
              <TabsTrigger value="error">Error</TabsTrigger>
            </TabsList>

            <TabsContent value={currentFilter} className="space-y-3">
              {/* Loading State */}
              {isLoading && (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex gap-4 p-4 rounded-lg border">
                      <Skeleton className="w-5 h-5 rounded-full flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
                  Failed to load notifications. Please try again.
                </div>
              )}

              {/* Empty State */}
              {!isLoading && !error && notifications.length === 0 && (
                <div className="rounded-lg border border-dashed p-8 text-center">
                  <Bell className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">
                    {currentFilter === "unread"
                      ? "No unread notifications"
                      : currentFilter === "all"
                        ? "No notifications yet"
                        : `No ${currentFilter} notifications`}
                  </p>
                </div>
              )}

              {/* Notification List */}
              {!isLoading && notifications.length > 0 && (
                <div className="space-y-2">
                  {notifications.map((notification) => {
                    const typeConfig = getNotificationTypeConfig(notification.type)
                    const hasSafeUrl = isSafeUrl(notification.action_url || "")

                    return (
                      <div
                        key={notification.id}
                        className={`group flex gap-4 rounded-lg border p-4 transition-colors ${
                          !notification.read
                            ? "bg-muted/50"
                            : "bg-background hover:bg-muted/30"
                        }`}
                      >
                        {/* Icon */}
                        <div
                          className={`flex-shrink-0 mt-0.5 ${typeConfig.color}`}
                        >
                          {renderIcon(notification.type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <h3
                                className={`text-sm font-semibold leading-tight ${
                                  !notification.read ? "font-bold" : "font-semibold"
                                }`}
                              >
                                {notification.title}
                              </h3>
                              {notification.message && (
                                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                                  {notification.message}
                                </p>
                              )}
                            </div>

                            {/* Read Indicator */}
                            {!notification.read && (
                              <div className="flex-shrink-0 mt-1">
                                <div className="h-2 w-2 rounded-full bg-blue-500" />
                              </div>
                            )}
                          </div>

                          {/* Metadata and Actions */}
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {formatRelativeTime(notification.created_at)}
                            </span>

                            {/* Badge */}
                            <Badge variant="outline" className="text-xs">
                              {notification.type}
                            </Badge>

                            {/* Action Link */}
                            {hasSafeUrl && notification.action_url && (
                              <Link
                                href={notification.action_url}
                                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                              >
                                View
                                <ChevronRight className="w-3 h-3" />
                              </Link>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkAsRead(notification.id, notification.read)}
                              disabled={isMarkingRead}
                              title="Mark as read"
                              className="h-8 w-8 p-0"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(notification.id)}
                            disabled={isDeleting}
                            title="Delete"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <>
                  <Separator className="my-4" />
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
