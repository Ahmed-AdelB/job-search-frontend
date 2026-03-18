"use client"

import { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border bg-background/50 px-4 py-12 text-center",
        className
      )}
    >
      {Icon && (
        <div className="rounded-lg bg-muted p-3">
          <Icon className="size-6 text-muted-foreground" />
        </div>
      )}

      <div className="space-y-2">
        <h3 className="font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>

      {action && (
        <Button onClick={action.onClick} variant="default" size="sm">
          {action.label}
        </Button>
      )}
    </div>
  )
}
