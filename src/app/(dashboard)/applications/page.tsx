"use client"

import { useState } from "react"
import { useApplications, useUpdateApplication, useWithdrawApplication } from "@/hooks/use-applications"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, MoreHorizontal, Eye, Edit2, Archive, LogOut } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import type { Application } from "@/types/api"

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800",
  submitted: "bg-blue-100 text-blue-800",
  screening: "bg-indigo-100 text-indigo-800",
  interview: "bg-yellow-100 text-yellow-800",
  offer: "bg-emerald-100 text-emerald-800",
  hired: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  withdrawn: "bg-slate-100 text-slate-800",
}

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  submitted: "Submitted",
  screening: "Screening",
  interview: "Interview",
  offer: "Offer",
  hired: "Hired",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
}

interface ApplicationsPageState {
  statusFilter: string
  searchQuery: string
  currentPage: number
  showWithdrawDialog: boolean
  withdrawingApplicationId: string | null
}

export default function ApplicationsPage() {
  const [state, setState] = useState<ApplicationsPageState>({
    statusFilter: "",
    searchQuery: "",
    currentPage: 1,
    showWithdrawDialog: false,
    withdrawingApplicationId: null,
  })

  const itemsPerPage = 10

  const filters = {
    status: state.statusFilter || undefined,
    page: state.currentPage,
    per_page: itemsPerPage,
  }

  const { data: applicationsData, isLoading, error } = useApplications(filters)
  const updateMutation = useUpdateApplication()
  const withdrawMutation = useWithdrawApplication()

  const applications = applicationsData?.applications || []
  const total = applicationsData?.total || 0
  const totalPages = Math.ceil(total / itemsPerPage)

  // Filter applications by search query (client-side since API doesn't support it)
  const filteredApplications = applications.filter((app) => {
    if (!state.searchQuery) return true
    const query = state.searchQuery.toLowerCase()
    // Search by job title and company (will be populated from related job data)
    return `${app.application_id}`.toLowerCase().includes(query)
  })

  const handleStatusChange = (applicationId: string, newStatus: string) => {
    updateMutation.mutate({
      applicationId: parseInt(applicationId),
      data: { status: newStatus as Application["status"] },
    })
  }

  const handleArchive = (applicationId: string) => {
    updateMutation.mutate({
      applicationId: parseInt(applicationId),
      data: { status: "withdrawn" },
    })
  }

  const handleWithdraw = (applicationId: string) => {
    setState((prev) => ({
      ...prev,
      showWithdrawDialog: true,
      withdrawingApplicationId: applicationId,
    }))
  }

  const confirmWithdraw = () => {
    if (state.withdrawingApplicationId) {
      withdrawMutation.mutate(parseInt(state.withdrawingApplicationId))
      setState((prev) => ({
        ...prev,
        showWithdrawDialog: false,
        withdrawingApplicationId: null,
      }))
    }
  }

  // Calculate stats from data
  const stats = {
    total: total,
    inProgress: applications.filter((a) =>
      ["submitted", "screening", "interview"].includes(a.status)
    ).length,
    interviews: applications.filter((a) => a.status === "interview").length,
    offers: applications.filter((a) => a.status === "offer").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Applications</h1>
          <p className="text-muted-foreground">
            Track and manage your job applications
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 me-2" />
          New Application
        </Button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <p className="text-2xl font-bold">{stats.total}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Interviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <p className="text-2xl font-bold text-yellow-600">{stats.interviews}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Offers
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <p className="text-2xl font-bold text-emerald-600">{stats.offers}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Rejected
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Your Applications</CardTitle>
              <CardDescription>
                Monitor application status and progress
              </CardDescription>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6">
            <div className="flex-1">
              <Input
                placeholder="Search applications..."
                value={state.searchQuery}
                onChange={(e) =>
                  setState((prev) => ({
                    ...prev,
                    searchQuery: e.target.value,
                    currentPage: 1,
                  }))
                }
                className="max-w-sm"
              />
            </div>

            <Select
              value={state.statusFilter}
              onValueChange={(value) =>
                setState((prev) => ({
                  ...prev,
                  statusFilter: value,
                  currentPage: 1,
                }))
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="screening">Screening</SelectItem>
                <SelectItem value="interview">Interview</SelectItem>
                <SelectItem value="offer">Offer</SelectItem>
                <SelectItem value="hired">Hired</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="withdrawn">Withdrawn</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="text-center py-8 text-red-600">
              <p>Failed to load applications. Please try again.</p>
            </div>
          )}

          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-12 flex-1" />
                  <Skeleton className="h-12 w-12" />
                </div>
              ))}
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="mb-2">No applications found</p>
              <p className="text-sm">
                {state.searchQuery || state.statusFilter
                  ? "Try adjusting your filters"
                  : "Get started by creating your first application"}
              </p>
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job Title</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Applied Date</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApplications.map((application) => (
                      <TableRow key={application.application_id}>
                        <TableCell className="font-medium">
                          {application.job_id ? `Job ${application.job_id}` : "N/A"}
                        </TableCell>
                        <TableCell>—</TableCell>
                        <TableCell>
                          <Badge className={STATUS_COLORS[application.status]}>
                            {STATUS_LABELS[application.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {application.applied_at
                            ? formatDistanceToNow(
                                new Date(application.applied_at),
                                { addSuffix: true }
                              )
                            : "—"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(application.updated_at), {
                            addSuffix: true,
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                className="h-8 w-8 p-0"
                              >
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit2 className="mr-2 h-4 w-4" />
                                Edit Application
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />

                              {/* Status Submenu */}
                              <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                              {[
                                "draft",
                                "submitted",
                                "screening",
                                "interview",
                                "offer",
                                "hired",
                                "rejected",
                              ].map((status) => (
                                <DropdownMenuItem
                                  key={status}
                                  onClick={() =>
                                    handleStatusChange(
                                      application.application_id,
                                      status
                                    )
                                  }
                                >
                                  {STATUS_LABELS[status]}
                                </DropdownMenuItem>
                              ))}

                              <DropdownMenuSeparator />

                              <DropdownMenuItem
                                onClick={() =>
                                  handleArchive(application.application_id)
                                }
                              >
                                <Archive className="mr-2 h-4 w-4" />
                                Archive
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() =>
                                  handleWithdraw(application.application_id)
                                }
                              >
                                <LogOut className="mr-2 h-4 w-4" />
                                Withdraw
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-6 border-t">
                  <div className="text-sm text-muted-foreground">
                    Showing page {state.currentPage} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setState((prev) => ({
                          ...prev,
                          currentPage: Math.max(1, prev.currentPage - 1),
                        }))
                      }
                      disabled={state.currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setState((prev) => ({
                          ...prev,
                          currentPage: Math.min(totalPages, prev.currentPage + 1),
                        }))
                      }
                      disabled={state.currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Withdraw Confirmation Dialog */}
      <AlertDialog
        open={state.showWithdrawDialog}
        onOpenChange={(open) =>
          setState((prev) => ({
            ...prev,
            showWithdrawDialog: open,
            withdrawingApplicationId: null,
          }))
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Withdraw Application</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to withdraw this application? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmWithdraw}
              disabled={withdrawMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {withdrawMutation.isPending ? "Withdrawing..." : "Withdraw"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
