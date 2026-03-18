"use client"

import React, { useState } from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { StatusBadge } from "@/components/shared/status-badge"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { Job } from "@/types/api"
import {
  ChevronDown,
  MoreHorizontal,
  ArrowUpDown,
  Archive,
  Trash2,
} from "lucide-react"

interface JobTableProps {
  data: Job[]
  isLoading?: boolean
  onApply?: (jobIds: number[]) => void
  onArchive?: (jobIds: number[]) => void
  onDelete?: (jobIds: number[]) => void
  onStatusChange?: (jobId: number, status: string) => void
}

export function JobTable({
  data,
  isLoading,
  onApply,
  onArchive,
  onDelete,
  onStatusChange,
}: JobTableProps) {
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())

  const toggleExpandedRow = (jobId: number) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(jobId)) {
      newExpanded.delete(jobId)
    } else {
      newExpanded.add(jobId)
    }
    setExpandedRows(newExpanded)
  }

  const getScoreColor = (score: number) => {
    if (score < 30) return "text-red-600"
    if (score < 60) return "text-yellow-600"
    return "text-green-600"
  }

  const columns: ColumnDef<Job>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "score",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 p-0"
        >
          Score
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const score = row.getValue("score") as number
        return (
          <div className={cn("font-semibold", getScoreColor(score))}>
            {score}
          </div>
        )
      },
    },
    {
      accessorKey: "title",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 p-0"
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="max-w-[200px]">
          <div className="font-medium truncate">{row.getValue("title")}</div>
        </div>
      ),
    },
    {
      accessorKey: "company",
      header: "Company",
      cell: ({ row }) => (
        <div className="max-w-[150px] truncate">{row.getValue("company")}</div>
      ),
    },
    {
      accessorKey: "location",
      header: "Location",
      cell: ({ row }) => (
        <div className="max-w-[120px] truncate">{row.getValue("location")}</div>
      ),
    },
    {
      accessorKey: "source",
      header: "Source",
      cell: ({ row }) => (
        <Badge variant="outline" className="text-xs">
          {row.getValue("source")}
        </Badge>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge status={row.getValue("status") as string} />
      ),
    },
    {
      accessorKey: "remote_type",
      header: "Remote",
      cell: ({ row }) => {
        const remote = row.getValue("remote_type") as string | undefined
        if (!remote) return "-"
        return (
          <Badge variant="secondary" className="text-xs">
            {remote === "remote" && "100% Remote"}
            {remote === "hybrid" && "Hybrid"}
            {remote === "onsite" && "On-site"}
          </Badge>
        )
      },
    },
    {
      accessorKey: "salary_min",
      header: "Salary",
      cell: ({ row }) => {
        const min = row.original.salary_min
        const max = row.original.salary_max
        if (!min && !max) return "-"
        if (min && max) {
          return `$${(min / 1000).toFixed(0)}K - $${(max / 1000).toFixed(0)}K`
        }
        if (min) return `$${(min / 1000).toFixed(0)}K+`
        return `$${(max! / 1000).toFixed(0)}K`
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const job = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => onStatusChange?.(job.id, "applied")}
              >
                Apply Now
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onStatusChange?.(job.id, "archived")}
              >
                Archive
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete?.([job.id])}
                className="text-red-600"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedJobIds = selectedRows.map((row) => row.original.id)

  return (
    <div className="space-y-4">
      {/* Bulk Action Bar */}
      {selectedRows.length > 0 && (
        <Card className="p-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between gap-4">
            <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
              {selectedRows.length} job(s) selected
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="default"
                onClick={() => onApply?.(selectedJobIds)}
              >
                Apply to Selected
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => onArchive?.(selectedJobIds)}
              >
                <Archive className="mr-2 h-4 w-4" />
                Archive
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onDelete?.(selectedJobIds)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-muted hover:bg-muted">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="h-12">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <React.Fragment key={row.id}>
                  <TableRow
                    data-state={row.getIsSelected() && "selected"}
                    className="hover:bg-muted/50"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>

                  {/* Expandable Detail Row */}
                  {expandedRows.has(row.original.id) && (
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableCell colSpan={columns.length} className="py-4">
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-semibold mb-2">
                              Job Description
                            </h4>
                            <p className="text-sm text-muted-foreground line-clamp-3">
                              {row.original.description || "No description available"}
                            </p>
                          </div>

                          {row.original.requirements && (
                            <div>
                              <h4 className="font-semibold mb-2">
                                Requirements
                              </h4>
                              <p className="text-sm text-muted-foreground line-clamp-3">
                                {row.original.requirements}
                              </p>
                            </div>
                          )}

                          <div className="flex gap-2 pt-2">
                            {row.original.visa_sponsored && (
                              <Badge variant="outline">
                                Visa Sponsored
                              </Badge>
                            )}
                            {row.original.ghost_score !== undefined && (
                              <Badge
                                variant={
                                  row.original.ghost_score > 70
                                    ? "destructive"
                                    : "secondary"
                                }
                              >
                                Ghost Score: {row.original.ghost_score}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No jobs found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-muted-foreground">
          Page{" "}
          <span className="font-medium">
            {table.getState().pagination.pageIndex + 1}
          </span>{" "}
          of{" "}
          <span className="font-medium">{table.getPageCount()}</span>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
