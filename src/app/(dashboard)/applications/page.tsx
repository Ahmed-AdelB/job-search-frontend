"use client"

import React, { useState, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmptyState } from "@/components/shared/empty-state"
import { TableSkeleton } from "@/components/shared/loading-skeleton"
import { ApplicationsTable } from "@/components/applications/applications-table"
import { StatSkeleton } from "@/components/shared/loading-skeleton"
import {
  useApplications,
  useWithdrawApplication,
  useUpdateApplication,
  type ApplicationFilters,
} from "@/hooks/use-applications"
import { FileText, CheckCircle2, AlertCircle } from "lucide-react"
import { toast } from "sonner"

type ApplicationStatus =
  | "all"
  | "pending"
  | "submitted"
  | "confirmed"
  | "rejected"
  | "interview"
  | "offer"
  | "withdrawn"

export default function ApplicationsPage() {
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus>("all")
  const [page, setPage] = useState(1)

  const filters: ApplicationFilters = {
    status: selectedStatus === "all" ? undefined : selectedStatus,
    page,
    per_page: 20,
  }

  const { data, isLoading, error } = useApplications(filters)
  const withdrawApplication = useWithdrawApplication()
  const updateApplication = useUpdateApplication()

  // Calculate stats from all applications
  const allApps = data?.applications || []
  const stats = {
    total: data?.total || 0,
    pending: allApps.filter((a) => a.status === "pending").length,
    submitted: allApps.filter((a) => a.status === "submitted").length,
    interview: allApps.filter((a) => a.status === "interview").length,
    offer: allApps.filter((a) => a.status === "offer").length,
    confirmed: allApps.filter((a) => a.status === "confirmed").length,
    rejected: allApps.filter((a) => a.status === "rejected").length,
  }

  const handleViewDetails = useCallback((applicationId: number) => {
    // TODO: Open a detail modal or navigate to detail page
    toast.info(`View details for application ${applicationId}`)
  }, [])

  const handleWithdraw = useCallback(async (applicationId: number) => {
    if (
      confirm(
        "Are you sure you want to withdraw this application? This action cannot be undone."
      )
    ) {
      await withdrawApplication.mutateAsync(applicationId)
    }
  }, [withdrawApplication])

  const handleDelete = useCallback(async (applicationId: number) => {
    if (
      confirm(
        "Are you sure you want to delete this application record? This action cannot be undone."
      )
    ) {
      await updateApplication.mutateAsync({
        applicationId,
        data: { status: "rejected" },
      })
    }
  }, [updateApplication])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Applications</h1>
        <p className="text-muted-foreground">
          Track your application submissions and responses
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
          </>
        ) : (
          <>
            <Card className="p-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Total Applications
                </p>
                <p className="text-3xl font-bold">{stats.total}</p>
                {stats.pending > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {stats.pending} pending
                  </p>
                )}
              </div>
            </Card>

            <Card className="p-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Submitted
                </p>
                <p className="text-3xl font-bold">{stats.submitted}</p>
              </div>
            </Card>

            <Card className="p-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Interviews
                </p>
                <p className="text-3xl font-bold">{stats.interview}</p>
              </div>
            </Card>

            <Card className="p-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Offers
                </p>
                <p className="text-3xl font-bold">{stats.offer}</p>
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Tabs */}
      <Card className="p-4">
        {isLoading ? (
          <TableSkeleton rows={5} />
        ) : error ? (
          <EmptyState
            icon={AlertCircle}
            title="Error loading applications"
            description="There was an error loading your applications. Please try again."
            action={{
              label: "Retry",
              onClick: () => window.location.reload(),
            }}
          />
        ) : (
          <Tabs
            value={selectedStatus}
            onValueChange={(value) => {
              setSelectedStatus(value as ApplicationStatus)
              setPage(1)
            }}
          >
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 mb-4">
              <TabsTrigger value="all">
                All ({stats.total})
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pending ({stats.pending})
              </TabsTrigger>
              <TabsTrigger value="submitted">
                Submitted ({stats.submitted})
              </TabsTrigger>
              <TabsTrigger value="confirmed">
                Confirmed ({stats.confirmed})
              </TabsTrigger>
              <TabsTrigger value="interview">
                Interview ({stats.interview})
              </TabsTrigger>
              <TabsTrigger value="offer">
                Offer ({stats.offer})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Rejected ({stats.rejected})
              </TabsTrigger>
            </TabsList>

            {/* Tab Content */}
            <TabsContent
              value={selectedStatus}
              className="space-y-4 mt-4"
            >
              {allApps.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title={
                    selectedStatus === "all"
                      ? "No applications yet"
                      : `No ${selectedStatus} applications`
                  }
                  description="Your applications will appear here once you start applying to jobs."
                />
              ) : (
                <ApplicationsTable
                  data={allApps}
                  isLoading={isLoading}
                  onViewDetails={handleViewDetails}
                  onWithdraw={handleWithdraw}
                  onDelete={handleDelete}
                />
              )}
            </TabsContent>
          </Tabs>
        )}
      </Card>
    </div>
  )
}
