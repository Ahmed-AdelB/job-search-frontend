"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface SkeletonLayoutProps {
  className?: string
}

/**
 * Card-like skeleton layout
 */
export function CardSkeleton({ className }: SkeletonLayoutProps) {
  return (
    <div
      className={cn(
        "space-y-4 rounded-lg border border-border bg-background p-4",
        className
      )}
    >
      <Skeleton className="h-6 w-32" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  )
}

/**
 * Table row skeleton layout
 */
export function TableRowSkeleton({ className }: SkeletonLayoutProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 border-b border-border px-4 py-3",
        className
      )}
    >
      <Skeleton className="h-4 w-4 rounded" />
      <Skeleton className="h-4 w-24 flex-shrink-0" />
      <Skeleton className="h-4 flex-1" />
      <Skeleton className="h-4 w-20 flex-shrink-0" />
      <Skeleton className="h-4 w-20 flex-shrink-0" />
    </div>
  )
}

/**
 * Full table skeleton layout
 */
export function TableSkeleton({
  rows = 5,
  className,
}: SkeletonLayoutProps & { rows?: number }) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border overflow-hidden",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-border bg-muted px-4 py-3">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-4 w-24 flex-shrink-0" />
        <Skeleton className="h-4 flex-1" />
        <Skeleton className="h-4 w-20 flex-shrink-0" />
        <Skeleton className="h-4 w-20 flex-shrink-0" />
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <TableRowSkeleton key={i} />
      ))}
    </div>
  )
}

/**
 * Stats card skeleton layout
 */
export function StatSkeleton({ className }: SkeletonLayoutProps) {
  return (
    <div
      className={cn(
        "space-y-3 rounded-lg border border-border bg-background p-4",
        className
      )}
    >
      <Skeleton className="h-4 w-20" />
      <div className="space-y-1">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  )
}

/**
 * Full page skeleton layout
 */
export function PageSkeleton({ className }: SkeletonLayoutProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatSkeleton key={i} />
        ))}
      </div>

      {/* Charts/Content Section */}
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <CardSkeleton key={i} className="h-64" />
        ))}
      </div>

      {/* Table Section */}
      <div className="space-y-4 rounded-lg border border-border bg-background p-4">
        <Skeleton className="h-6 w-32" />
        <TableSkeleton rows={5} />
      </div>
    </div>
  )
}
