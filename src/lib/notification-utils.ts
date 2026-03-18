/**
 * Notification utilities - Safe URL validation and formatting
 * Author: Ahmed Adel Bakr Alderai
 */

/**
 * Validate that a URL is safe (internal only, no open redirects)
 * Only allows URLs starting with "/" and NOT starting with "//"
 */
export function isSafeUrl(url: string): boolean {
  if (!url) return false
  if (!url.startsWith("/")) return false
  if (url.startsWith("//")) return false
  return true
}

/**
 * Format a timestamp to relative time (e.g. "2 hours ago")
 */
export function formatRelativeTime(timestamp: string): string {
  try {
    const date = new Date(timestamp)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (seconds < 60) {
      return "just now"
    }

    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) {
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`
    }

    const hours = Math.floor(minutes / 60)
    if (hours < 24) {
      return `${hours} hour${hours > 1 ? "s" : ""} ago`
    }

    const days = Math.floor(hours / 24)
    if (days < 7) {
      return `${days} day${days > 1 ? "s" : ""} ago`
    }

    const weeks = Math.floor(days / 7)
    if (weeks < 4) {
      return `${weeks} week${weeks > 1 ? "s" : ""} ago`
    }

    const months = Math.floor(days / 30)
    return `${months} month${months > 1 ? "s" : ""} ago`
  } catch {
    return timestamp
  }
}

/**
 * Get icon style and color for notification type
 */
export function getNotificationTypeConfig(type: "info" | "success" | "warning" | "error") {
  const config = {
    info: {
      icon: "info-circle",
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950",
      borderColor: "border-blue-200 dark:border-blue-800",
    },
    success: {
      icon: "check-circle",
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-950",
      borderColor: "border-green-200 dark:border-green-800",
    },
    warning: {
      icon: "alert-circle",
      color: "text-yellow-500",
      bgColor: "bg-yellow-50 dark:bg-yellow-950",
      borderColor: "border-yellow-200 dark:border-yellow-800",
    },
    error: {
      icon: "x-circle",
      color: "text-red-500",
      bgColor: "bg-red-50 dark:bg-red-950",
      borderColor: "border-red-200 dark:border-red-800",
    },
  }
  return config[type]
}
