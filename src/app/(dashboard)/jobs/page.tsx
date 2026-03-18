"use client"

import React, { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { EmptyState } from "@/components/shared/empty-state"
import { TableSkeleton } from "@/components/shared/loading-skeleton"
import { JobFilters } from "@/components/jobs/job-filters"
import { JobTable } from "@/components/jobs/job-table"
import { useJobs, useUpdateJobStatus, useBulkAction, useDeleteJob } from "@/hooks/use-jobs"
import type { JobFilters as JobFiltersType } from "@/types/api"
import { Plus, Briefcase } from "lucide-react"
import { toast } from "sonner"

export default function JobsPage() {
  const router = useRouter()
  const [filters, setFilters] = useState<JobFiltersType>({
    page: 1,
    per_page: 20,
  })

  const { data, isLoading, error } = useJobs(filters)
  const updateJobStatus = useUpdateJobStatus()
  const bulkAction = useBulkAction()
  const deleteJob = useDeleteJob()

  const handleFiltersChange = useCallback((newFilters: JobFiltersType) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }))
  }, [])

  const handleApplySelected = async (jobIds: number[]) => {
    await bulkAction.mutateAsync({
      action: "apply",
      jobIds,
    })
  }

  const handleArchiveSelected = async (jobIds: number[]) => {
    await bulkAction.mutateAsync({
      action: "archive",
      jobIds,
    })
  }

  const handleDeleteSelected = async (jobIds: number[]) => {
    if (confirm(`Delete ${jobIds.length} job(s)? This action cannot be undone.`)) {
      for (const jobId of jobIds) {
        await deleteJob.mutateAsync(jobId)
      }
    }
  }

  const handleStatusChange = async (jobId: number, status: string) => {
    await updateJobStatus.mutateAsync({
      jobId,
      status,
    })
  }

  const totalJobs = data?.total ?? 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Job Queue</h1>
          <p className="text-muted-foreground">
            {totalJobs} {totalJobs === 1 ? "job" : "jobs"} in your queue
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push("/pipeline/discover")}
          >
            <Plus className="mr-2 h-4 w-4" />
            Discover Jobs
          </Button>
        </div>
      </div>

      {/* Filters */}
      <JobFilters
        onFiltersChange={handleFiltersChange}
        isCollapsed={false}
      />

      {/* Content */}
      {isLoading ? (
        <Card className="p-4">
          <TableSkeleton rows={5} />
        </Card>
      ) : error ? (
        <EmptyState
          icon={Briefcase}
          title="Error loading jobs"
          description="There was an error loading your jobs. Please try again."
          action={{
            label: "Retry",
            onClick: () => window.location.reload(),
          }}
        />
      ) : !data?.jobs || data.jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No jobs found"
          description="Run job discovery to find jobs matching your criteria."
          action={{
            label: "Start Discovery",
            onClick: () => router.push("/pipeline/discover"),
          }}
        />
      ) : (
        <Card className="p-4">
          <JobTable
            data={data.jobs}
            isLoading={isLoading}
            onApply={handleApplySelected}
            onArchive={handleArchiveSelected}
            onDelete={handleDeleteSelected}
            onStatusChange={handleStatusChange}
          />
        </Card>
      )}
    </div>
  )
}
