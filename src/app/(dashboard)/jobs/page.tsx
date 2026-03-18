"use client";

import { useState, useMemo } from "react";
import {
  ColumnDef,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useJobs } from "@/hooks/use-jobs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Progress,
  ProgressTrack,
  ProgressIndicator,
  ProgressValue,
} from "@/components/ui/progress";
import { Briefcase, Plus, Search, ChevronDown, ArrowUpDown } from "lucide-react";
import { format } from "date-fns";
import type { Job, JobFilters } from "@/types/api";

/**
 * Status badge color mapping
 */
function getStatusBadgeVariant(
  status: string
): "default" | "secondary" | "destructive" | "outline" {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    new: "default",
    applied: "secondary",
    interview: "outline",
    offer: "secondary",
    rejected: "destructive",
    archived: "outline",
  };
  return variants[status] || "default";
}

/**
 * Get color class for status badge
 */
function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    new: "bg-blue-50 text-blue-700 border-blue-200",
    applied: "bg-green-50 text-green-700 border-green-200",
    interview: "bg-yellow-50 text-yellow-700 border-yellow-200",
    offer: "bg-emerald-50 text-emerald-700 border-emerald-200",
    rejected: "bg-red-50 text-red-700 border-red-200",
    archived: "bg-slate-50 text-slate-700 border-slate-200",
  };
  return colors[status] || "bg-slate-50 text-slate-700 border-slate-200";
}

/**
 * Get progress bar color for score
 */
function getScoreColor(score: number): string {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-yellow-500";
  if (score >= 40) return "bg-orange-500";
  return "bg-red-500";
}

/**
 * Format score display
 */
function formatScore(score: number | undefined): string {
  if (score === undefined) return "N/A";
  return `${Math.round(score)}%`;
}

/**
 * Jobs page data table columns
 */
const columns: ColumnDef<Job>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <button
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center gap-2 hover:text-foreground"
      >
        Title
        <ArrowUpDown className="w-4 h-4" />
      </button>
    ),
    cell: ({ row }) => (
      <div className="font-medium text-foreground max-w-xs truncate">
        {row.getValue("title")}
      </div>
    ),
  },
  {
    accessorKey: "company",
    header: ({ column }) => (
      <button
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center gap-2 hover:text-foreground"
      >
        Company
        <ArrowUpDown className="w-4 h-4" />
      </button>
    ),
    cell: ({ row }) => <div className="font-medium">{row.getValue("company")}</div>,
  },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ row }) => {
      const location = row.getValue("location") as string | undefined;
      return <div className="text-sm text-muted-foreground">{location || "Remote"}</div>;
    },
  },
  {
    accessorKey: "remote_type",
    header: "Remote",
    cell: ({ row }) => {
      const remoteType = row.getValue("remote_type") as string | undefined;
      const badgeVariant: Record<string, string> = {
        remote: "bg-purple-50 text-purple-700 border-purple-200",
        hybrid: "bg-blue-50 text-blue-700 border-blue-200",
        "on-site": "bg-slate-50 text-slate-700 border-slate-200",
      };
      const variant = badgeVariant[remoteType || ""] || badgeVariant["on-site"];
      return (
        <Badge variant="outline" className={variant}>
          {remoteType || "On-site"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "score",
    header: ({ column }) => (
      <button
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center gap-2 hover:text-foreground"
      >
        Score
        <ArrowUpDown className="w-4 h-4" />
      </button>
    ),
    cell: ({ row }) => {
      const score = row.getValue("score") as number | undefined;
      if (score === undefined) return <span className="text-muted-foreground">N/A</span>;

      return (
        <div className="w-full max-w-xs flex items-center gap-2">
          <Progress value={score} className="flex-1">
            <ProgressTrack>
              <ProgressIndicator
                style={{ width: `${score}%` }}
                className={getScoreColor(score)}
              />
            </ProgressTrack>
          </Progress>
          <span className="text-sm font-medium whitespace-nowrap">{formatScore(score)}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge variant="outline" className={getStatusColor(status)}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "source",
    header: "Source",
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">{row.getValue("source")}</div>
    ),
  },
  {
    accessorKey: "posted_at",
    header: ({ column }) => (
      <button
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center gap-2 hover:text-foreground"
      >
        Posted
        <ArrowUpDown className="w-4 h-4" />
      </button>
    ),
    cell: ({ row }) => {
      const postedAt = row.getValue("posted_at") as string | undefined;
      if (!postedAt) return <span className="text-muted-foreground">Unknown</span>;
      return (
        <div className="text-sm text-muted-foreground">
          {format(new Date(postedAt), "MMM d, yyyy")}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <ChevronDown className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>View Details</DropdownMenuItem>
          <DropdownMenuItem>Mark as Applied</DropdownMenuItem>
          <DropdownMenuItem>Archive</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

/**
 * Loading skeleton for table rows
 */
function TableRowSkeleton() {
  return (
    <TableRow>
      <TableCell>
        <Skeleton className="h-4 w-32" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-24" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-20" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-16" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-20" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-16" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-16" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-24" />
      </TableCell>
    </TableRow>
  );
}

/**
 * Empty state component
 */
function EmptyState() {
  return (
    <div className="text-center py-12">
      <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
      <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
      <p className="text-muted-foreground">
        Try adjusting your filters or search for different keywords
      </p>
    </div>
  );
}

/**
 * Jobs page component
 */
export default function JobsPage() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  // Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [remoteTypeFilter, setRemoteTypeFilter] = useState<string>("");
  const [minScoreFilter, setMinScoreFilter] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Build filters object for query
  const filters: JobFilters = useMemo(
    () => ({
      search: searchTerm || undefined,
      status: statusFilter || undefined,
      remote_type: remoteTypeFilter || undefined,
      min_score: minScoreFilter > 0 ? minScoreFilter : undefined,
      page: currentPage,
      per_page: 20,
      sort_by: sorting[0]?.id || "created_at",
      sort_order: sorting[0]?.desc ? "desc" : "asc",
    }),
    [searchTerm, statusFilter, remoteTypeFilter, minScoreFilter, currentPage, sorting]
  );

  // Fetch jobs with filters
  const { data, isLoading, error } = useJobs(filters);

  // Setup table
  const table = useReactTable({
    data: data?.jobs || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    manualPagination: true,
  });

  // Calculate pagination info
  const totalPages = Math.ceil((data?.total || 0) / 20);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Jobs</h1>
          <p className="text-muted-foreground">
            Browse and manage job opportunities
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 me-2" />
          Add Job
        </Button>
      </div>

      {/* Filters Card */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search and filter job opportunities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={(value) => {
              setStatusFilter(value === "all" ? "" : value);
              setCurrentPage(1);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="applied">Applied</SelectItem>
                <SelectItem value="interview">Interview</SelectItem>
                <SelectItem value="offer">Offer</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            {/* Remote Type Filter */}
            <Select value={remoteTypeFilter} onValueChange={(value) => {
              setRemoteTypeFilter(value === "all" ? "" : value);
              setCurrentPage(1);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Remote Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="remote">Remote</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
                <SelectItem value="on-site">On-site</SelectItem>
              </SelectContent>
            </Select>

            {/* Min Score Filter */}
            <div>
              <Input
                type="number"
                placeholder="Min Score"
                min={0}
                max={100}
                value={minScoreFilter || ""}
                onChange={(e) => {
                  const value = e.target.value ? parseInt(e.target.value) : 0;
                  setMinScoreFilter(Math.max(0, Math.min(100, value)));
                  setCurrentPage(1);
                }}
                className="w-full"
              />
            </div>
          </div>

          {/* Clear Filters */}
          {(searchTerm || statusFilter || remoteTypeFilter || minScoreFilter > 0) && (
            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("");
                  setRemoteTypeFilter("");
                  setMinScoreFilter(0);
                  setCurrentPage(1);
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Jobs Table Card */}
      <Card>
        <CardHeader>
          <CardTitle>Job Listings</CardTitle>
          <CardDescription>
            {isLoading
              ? "Loading jobs..."
              : data?.total
              ? `Showing ${(currentPage - 1) * 20 + 1}-${Math.min(currentPage * 20, data.total)} of ${data.total} jobs`
              : "No jobs found"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-12">
              <p className="text-red-500 font-medium mb-2">Error loading jobs</p>
              <p className="text-muted-foreground text-sm">
                {error instanceof Error ? error.message : "Please try again"}
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableHead key={header.id} className="text-sm font-semibold">
                            {header.isPlaceholder
                              ? null
                              : flexRender(header.column.columnDef.header, header.getContext())}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <>
                        {Array.from({ length: 10 }).map((_, i) => (
                          <TableRowSkeleton key={i} />
                        ))}
                      </>
                    ) : table.getRowModel().rows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={columns.length}>
                          <EmptyState />
                        </TableCell>
                      </TableRow>
                    ) : (
                      table.getRowModel().rows.map((row) => (
                        <TableRow key={row.id}>
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {!isLoading && (data?.total || 0) > 0 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => p - 1)}
                      disabled={!hasPrevPage}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => p + 1)}
                      disabled={!hasNextPage}
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
    </div>
  );
}
