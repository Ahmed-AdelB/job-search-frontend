"use client"

import React from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/shared/status-badge"
import { cn } from "@/lib/utils"
import type { Job } from "@/types/api"
import { ExternalLink, AlertTriangle, CheckCircle2 } from "lucide-react"

interface JobCardProps {
  job: Job
  onApply?: () => void
  onArchive?: () => void
  onDelete?: () => void
  onClick?: () => void
  isSelectable?: boolean
}

export function JobCard({
  job,
  onApply,
  onArchive,
  onDelete,
  onClick,
  isSelectable,
}: JobCardProps) {
  const getScoreColor = (score: number) => {
    if (score < 30) return "bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-100"
    if (score < 60) return "bg-yellow-100 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100"
    return "bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100"
  }

  const isGhostJob = job.ghost_score ? job.ghost_score > 70 : false

  return (
    <Card
      className={cn(
        "p-4 transition-all hover:shadow-md cursor-pointer",
        isSelectable && "border-primary/50"
      )}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base truncate">{job.title}</h3>
          <p className="text-sm text-muted-foreground truncate">{job.company}</p>
        </div>
        <div className={cn("px-2 py-1 rounded font-semibold text-sm", getScoreColor(job.score))}>
          {job.score}
        </div>
      </div>

      {/* Location and Remote */}
      <div className="flex flex-wrap gap-2 mb-3">
        <Badge variant="outline" className="text-xs">
          {job.location}
        </Badge>
        {job.remote_type && (
          <Badge variant="secondary" className="text-xs">
            {job.remote_type === "remote" && "100% Remote"}
            {job.remote_type === "hybrid" && "Hybrid"}
            {job.remote_type === "onsite" && "On-site"}
          </Badge>
        )}
        <Badge variant="outline" className="text-xs">
          {job.source}
        </Badge>
      </div>

      {/* Salary and Status */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="text-sm">
          {job.salary_min && job.salary_max ? (
            <span className="font-medium">
              ${(job.salary_min / 1000).toFixed(0)}K - ${(job.salary_max / 1000).toFixed(0)}K
            </span>
          ) : job.salary_min ? (
            <span className="font-medium">${(job.salary_min / 1000).toFixed(0)}K+</span>
          ) : (
            <span className="text-muted-foreground">Salary not listed</span>
          )}
        </div>
        <StatusBadge status={job.status} />
      </div>

      {/* Warnings and Special Badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        {isGhostJob && (
          <Badge variant="destructive" className="text-xs">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Potential Ghost Job ({job.ghost_score})
          </Badge>
        )}
        {job.visa_sponsored && (
          <Badge variant="outline" className="text-xs">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Visa Sponsored
          </Badge>
        )}
      </div>

      {/* Description Preview */}
      {job.description && (
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {job.description}
        </p>
      )}

      {/* Requirements Preview */}
      {job.requirements && (
        <div className="text-sm mb-4 p-2 bg-muted rounded">
          <p className="font-medium text-xs mb-1">Requirements:</p>
          <p className="text-muted-foreground line-clamp-2">{job.requirements}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="default"
          onClick={(e) => {
            e.stopPropagation()
            onApply?.()
          }}
          className="flex-1"
        >
          Apply
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation()
            onArchive?.()
          }}
        >
          Archive
        </Button>
        {onDelete && (
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
          >
            Delete
          </Button>
        )}
        {job.url && (
          <Button
            size="sm"
            variant="ghost"
            asChild
          >
            <a href={job.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        )}
      </div>
    </Card>
  )
}
