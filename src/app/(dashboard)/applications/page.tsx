"use client";

/**
 * Applications Page - Track job applications
 * Author: Ahmed Adel Bakr Alderai
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FileText,
  Search,
  MoreHorizontal,
  Archive,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Send,
  Eye,
  XCircle,
  CheckCircle2,
  Clock,
  Loader2,
} from "lucide-react";
import { apiGet, apiPost } from "@/lib/api-client";
import type { ApplicationsResponse, Application } from "@/types/api";

const STATUS_CONFIG: Record<string, { color: string; icon: React.ElementType }> = {
  draft: { color: "bg-gray-500", icon: FileText },
  submitted: { color: "bg-blue-600", icon: Send },
  screening: { color: "bg-indigo-600", icon: Eye },
  interview: { color: "bg-amber-500", icon: Clock },
  offer: { color: "bg-green-600", icon: CheckCircle2 },
  hired: { color: "bg-emerald-700", icon: CheckCircle2 },
  rejected: { color: "bg-red-600", icon: XCircle },
  withdrawn: { color: "bg-gray-500", icon: Archive },
};

export default function ApplicationsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const perPage = 25;

  const { data, isLoading } = useQuery({
    queryKey: ["applications", search, statusFilter, page],
    queryFn: () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "all") params.set("status", statusFilter);
      params.set("page", String(page));
      params.set("per_page", String(perPage));
      return apiGet<ApplicationsResponse>(`/api/v1/applications?${params.toString()}`);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiPost<{ status: string }>(`/api/v1/applications/${id}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["applications"] }),
  });

  const reapplyMutation = useMutation({
    mutationFn: (id: string) =>
      apiPost<{ status: string }>(`/api/v1/applications/${id}/reapply`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["applications"] }),
  });

  const applications = data?.applications ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  // Summary counts
  const counts = applications.reduce(
    (acc, app) => {
      acc[app.status] = (acc[app.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Applications</h1>
        <p className="text-muted-foreground">
          Track and manage your {total} job applications
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {(["submitted", "screening", "interview", "offer", "rejected"] as const).map((s) => {
          const config = STATUS_CONFIG[s];
          const StatusIcon = config.icon;
          return (
            <Card key={s} className="cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => { setStatusFilter(s); setPage(1); }}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground capitalize">{s}</p>
                    <p className="text-2xl font-bold">{counts[s] ?? 0}</p>
                  </div>
                  <StatusIcon className="w-6 h-6 text-muted-foreground opacity-60" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2 flex-1">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <Input
                placeholder="Search by company or job title..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="max-w-md"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v ?? "all"); setPage(1); }}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
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
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Applications
          </CardTitle>
          <CardDescription>{total} total applications</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{search || statusFilter !== "all" ? "No applications match your filters" : "No applications yet. Apply to jobs to see them here."}</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Applied</TableHead>
                      <TableHead>Resume</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="w-[60px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((app) => {
                      const config = STATUS_CONFIG[app.status] ?? STATUS_CONFIG.draft;
                      const StatusIcon = config.icon;
                      return (
                        <TableRow key={app.application_id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{app.job_id}</p>
                              {app.cover_letter && (
                                <p className="text-xs text-muted-foreground">Has cover letter</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${config.color} text-xs`}>
                              <StatusIcon className="w-3 h-3 me-1" />
                              {app.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                            {app.applied_at
                              ? new Date(app.applied_at).toLocaleDateString()
                              : "\u2014"}
                          </TableCell>
                          <TableCell>
                            {app.resume_url ? (
                              <Badge variant="outline" className="text-xs">
                                <FileText className="w-3 h-3 me-1" />
                                Attached
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">None</span>
                            )}
                          </TableCell>
                          <TableCell className="max-w-[200px] text-sm truncate">
                            {app.notes || "\u2014"}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() =>
                                    updateStatusMutation.mutate({
                                      id: app.application_id,
                                      status: "interview",
                                    })
                                  }
                                >
                                  <Clock className="w-4 h-4 me-2" />
                                  Mark Interview
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    updateStatusMutation.mutate({
                                      id: app.application_id,
                                      status: "offer",
                                    })
                                  }
                                >
                                  <CheckCircle2 className="w-4 h-4 me-2" />
                                  Mark Offer
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    updateStatusMutation.mutate({
                                      id: app.application_id,
                                      status: "withdrawn",
                                    })
                                  }
                                >
                                  <Archive className="w-4 h-4 me-2" />
                                  Withdraw
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {(app.status === "rejected" || app.status === "withdrawn") && (
                                  <DropdownMenuItem
                                    onClick={() => reapplyMutation.mutate(app.application_id)}
                                    disabled={reapplyMutation.isPending}
                                  >
                                    {reapplyMutation.isPending ? (
                                      <Loader2 className="w-4 h-4 me-2 animate-spin" />
                                    ) : (
                                      <RotateCcw className="w-4 h-4 me-2" />
                                    )}
                                    Reapply
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() =>
                                    updateStatusMutation.mutate({
                                      id: app.application_id,
                                      status: "rejected",
                                    })
                                  }
                                >
                                  <XCircle className="w-4 h-4 me-2" />
                                  Mark Rejected
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Page {page} of {totalPages} ({total} total)
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
                    Next <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
