"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type StatusType =
  | "running"
  | "active"
  | "submitted"
  | "pending"
  | "paused"
  | "error"
  | "rejected"
  | "failed"
  | "interview"
  | "new"
  | "applied"
  | "archived"
  | "completed"
  | "cancelled"
  | "confirmed"
  | "offer"
  | "withdrawn"
  | "starting"
  | "stopped"
  | "half_open"
  | "open"
  | "closed"
  | "draft"
  | "sent"
  | "delivered"
  | "opened"
  | "replied"
  | "bounced"
  | string

export interface StatusBadgeProps {
  status: StatusType
  variant?: "default" | "secondary" | "destructive" | "outline" | "ghost" | "link"
  className?: string
}

/**
 * Get color variant based on status
 */
function getStatusVariant(
  status: StatusType
): "default" | "secondary" | "destructive" | "outline" | "ghost" | "link" {
  const successStatuses = [
    "running",
    "active",
    "submitted",
    "completed",
    "confirmed",
    "offer",
    "applied",
  ]
  const warningStatuses = ["pending", "paused", "starting", "draft"]
  const errorStatuses = [
    "error",
    "rejected",
    "failed",
    "cancelled",
    "withdrawn",
    "stopped",
    "bounced",
  ]
  const infoStatuses = [
    "interview",
    "new",
    "archived",
    "half_open",
    "open",
    "closed",
    "sent",
    "delivered",
    "opened",
    "replied",
  ]

  if (successStatuses.includes(status)) return "default"
  if (warningStatuses.includes(status)) return "secondary"
  if (errorStatuses.includes(status)) return "destructive"
  if (infoStatuses.includes(status)) return "outline"

  return "outline"
}

/**
 * Format status text
 */
function formatStatus(status: StatusType): string {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

export function StatusBadge({
  status,
  variant,
  className,
}: StatusBadgeProps) {
  const computedVariant = variant || getStatusVariant(status)
  const displayText = formatStatus(status)

  return (
    <Badge variant={computedVariant} className={className}>
      {displayText}
    </Badge>
  )
}
