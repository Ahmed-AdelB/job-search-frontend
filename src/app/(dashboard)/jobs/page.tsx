"use client";

/**
 * Jobs Page - Browse and manage job opportunities
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
import { Checkbox } from "@/components/ui/checkbox";
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
  Briefcase,
  Search,
  MoreHorizontal,
  ExternalLink,
  Archive,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Filter,
  MapPin,
  Building2,
  Clock,
} from "lucide-react";
import { apiGet, apiPost, apiDelete } from "@/lib/api-client";
import type { JobsResponse, Job } from "@/types/api";

const STATUS_COLOR: Record<string, string> = {
  new: "bg-blue-600",
  applied: "bg-indigo-600",
  interview: "bg-amber-500",
  offer: "bg-green-600",
  rejected: "bg-red-600",
  archived: "bg-gray-500",
};

const REMOTE_COLOR: Record<string, string> = {
  remote: "border-green-300 text-green-700",
  hybrid: "border-amber-300 text-amber-700",
  "on-site": "border-gray-300 text-gray-700",
};

export default function JobsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [remoteType, setRemoteType] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const perPage = 25;

  const { data, isLoading } = useQuery({
    queryKey: ["jobs", search, status, remoteType, sortBy, sortOrder, page],
    queryFn: () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (status !== "all") params.set("status", status);
      if (remoteType !== "all") params.set("remote_type", remoteType);
      params.set("sort_by", sortBy);
      params.set("sort_order", sortOrder);
      params.set("page", String(page));
      params.set("per_page", String(perPage));
      return apiGet<JobsResponse>(`/api/v1/jobs?${params.toString()}`);
    },
  });

  const bulkActionMutation = useMutation({
    mutationFn: (payload: { job_ids: string[]; action: string }) =>
      apiPost<{ status: string }>("/api/v1/jobs/bulk-action", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      setSelected(new Set());
    },
  });

  const deleteJobMutation = useMutation({
    mutationFn: (id: string) => apiDelete<{ status: string }>(`/api/v1/jobs/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["jobs"] }),
  });

  const jobs = data?.jobs ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const toggleAll = () => {
    if (selected.size === jobs.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(jobs.map((j) => j.job_id)));
    }
  };

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Jobs</h1>
          <p className="text-muted-foreground">
            Browse and manage {total} job opportunities
          </p>
        </div>
        {selected.size > 0 && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                bulkActionMutation.mutate({
                  job_ids: Array.from(selected),
                  action: "archive",
                })
              }
            >
              <Archive className="w-4 h-4 me-1" />
              Archive ({selected.size})
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                bulkActionMutation.mutate({
                  job_ids: Array.from(selected),
                  action: "apply",
                })
              }
            >
              Apply ({selected.size})
            </Button>
          </div>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2 flex-1">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <Input
                placeholder="Search by title, company, or location..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="max-w-md"
              />
            </div>
            <Select value={status} onValueChange={(v) => { setStatus(v ?? "all"); setPage(1); }}>
              <SelectTrigger className="w-[140px]">
                <Filter className="w-4 h-4 me-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="applied">Applied</SelectItem>
                <SelectItem value="interview">Interview</SelectItem>
                <SelectItem value="offer">Offer</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select value={remoteType} onValueChange={(v) => { setRemoteType(v ?? "all"); setPage(1); }}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Remote" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="remote">Remote</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
                <SelectItem value="on-site">On-site</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Jobs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Job Listings
          </CardTitle>
          <CardDescription>{total} jobs found</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{search || status !== "all" ? "No jobs match your filters" : "No jobs discovered yet. Run the pipeline to start discovering jobs."}</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40px]">
                        <Checkbox
                          checked={selected.size === jobs.length && jobs.length > 0}
                          onCheckedChange={toggleAll}
                        />
                      </TableHead>
                      <TableHead>
                        <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => toggleSort("title")}>
                          Title
                          <ArrowUpDown className="w-3 h-3 ms-1" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => toggleSort("company")}>
                          Company
                          <ArrowUpDown className="w-3 h-3 ms-1" />
                        </Button>
                      </TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Salary</TableHead>
                      <TableHead>
                        <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => toggleSort("created_at")}>
                          Found
                          <ArrowUpDown className="w-3 h-3 ms-1" />
                        </Button>
                      </TableHead>
                      <TableHead className="w-[60px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobs.map((job) => (
                      <TableRow key={job.job_id} className={selected.has(job.job_id) ? "bg-muted/50" : ""}>
                        <TableCell>
                          <Checkbox
                            checked={selected.has(job.job_id)}
                            onCheckedChange={() => toggleSelect(job.job_id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[250px]">
                            <p className="font-medium truncate">{job.title}</p>
                            <p className="text-xs text-muted-foreground truncate">{job.source}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            <span className="text-sm truncate max-w-[150px]">{job.company}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {job.location ? (
                            <div className="flex items-center gap-1 text-sm">
                              <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                              <span className="truncate max-w-[120px]">{job.location}</span>
                            </div>
                          ) : "\u2014"}
                        </TableCell>
                        <TableCell>
                          {job.remote_type ? (
                            <Badge variant="outline" className={REMOTE_COLOR[job.remote_type] ?? ""}>
                              {job.remote_type}
                            </Badge>
                          ) : "\u2014"}
                        </TableCell>
                        <TableCell>
                          <Badge className={STATUS_COLOR[job.status] ?? "bg-gray-500"}>
                            {job.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {job.salary_min && job.salary_max
                            ? `${(job.salary_min / 1000).toFixed(0)}k\u2013${(job.salary_max / 1000).toFixed(0)}k ${job.currency ?? ""}`
                            : job.salary_min
                            ? `${(job.salary_min / 1000).toFixed(0)}k+ ${job.currency ?? ""}`
                            : "\u2014"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(job.created_at).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <a href={job.url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="w-4 h-4 me-2" />
                                  View Posting
                                </a>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  bulkActionMutation.mutate({
                                    job_ids: [job.job_id],
                                    action: "archive",
                                  })
                                }
                              >
                                <Archive className="w-4 h-4 me-2" />
                                Archive
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => deleteJobMutation.mutate(job.job_id)}
                              >
                                <Trash2 className="w-4 h-4 me-2" />
                                Delete
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
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Page {page} of {totalPages} ({total} total)
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
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
