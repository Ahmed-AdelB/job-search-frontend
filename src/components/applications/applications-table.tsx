"use client"

import React, { useState } from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { StatusBadge } from "@/components/shared/status-badge"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import type { Application } from "@/types/api"
import { MoreHorizontal, ArrowUpDown, Eye, Trash2, RotateCcw } from "lucide-react"

interface ApplicationsTableProps {
  data: Application[]
  isLoading?: boolean
  onViewDetails?: (applicationId: number) => void
  onWithdraw?: (applicationId: number) => void
  onDelete?: (applicationId: number) => void
}

function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}

export function ApplicationsTable({
  data,
  isLoading,
  onViewDetails,
  onWithdraw,
  onDelete,
}: ApplicationsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())

  const toggleExpandedRow = (appId: number) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(appId)) {
      newExpanded.delete(appId)
    } else {
      newExpanded.add(appId)
    }
    setExpandedRows(newExpanded)
  }

  const columns: ColumnDef<Application>[] = [
    {
      accessorKey: "job_title",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 p-0"
        >
          Job Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="max-w-[250px]">
          <div className="font-medium truncate">{row.getValue("job_title")}</div>
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
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge status={row.getValue("status") as string} />
      ),
    },
    {
      accessorKey: "applied_at",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 p-0"
        >
          Applied
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const dateString = row.getValue("applied_at") as string
        return (
          <div className="text-sm">
            {formatRelativeDate(dateString)}
          </div>
        )
      },
    },
    {
      accessorKey: "ats_type",
      header: "ATS",
      cell: ({ row }) => {
        const ats = row.getValue("ats_type") as string | undefined
        return ats ? (
          <Badge variant="outline" className="text-xs">
            {ats}
          </Badge>
        ) : (
          <span className="text-xs text-muted-foreground">-</span>
        )
      },
    },
    {
      accessorKey: "method",
      header: "Method",
      cell: ({ row }) => {
        const method = row.getValue("method") as string | undefined
        return method ? (
          <Badge variant="secondary" className="text-xs">
            {method}
          </Badge>
        ) : (
          <span className="text-xs text-muted-foreground">-</span>
        )
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const app = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewDetails?.(app.id)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onWithdraw?.(app.id)}
                className="text-yellow-600"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Withdraw
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete?.(app.id)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
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
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  })

  return (
    <div className="space-y-4">
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
                    className="hover:bg-muted/50 cursor-pointer"
                    onClick={() => toggleExpandedRow(row.original.id)}
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {row.original.notes && (
                            <div>
                              <h4 className="font-semibold text-sm mb-1">
                                Notes
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {row.original.notes}
                              </p>
                            </div>
                          )}

                          {row.original.resume_version && (
                            <div>
                              <h4 className="font-semibold text-sm mb-1">
                                Resume Version
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {row.original.resume_version}
                              </p>
                            </div>
                          )}

                          {row.original.confirmation_email && (
                            <div>
                              <h4 className="font-semibold text-sm mb-1">
                                Confirmation Email
                              </h4>
                              <p className="text-sm text-muted-foreground break-all">
                                {row.original.confirmation_email}
                              </p>
                            </div>
                          )}

                          {row.original.cover_letter && (
                            <div>
                              <h4 className="font-semibold text-sm mb-1">
                                Cover Letter
                              </h4>
                              <p className="text-sm text-muted-foreground line-clamp-3">
                                {row.original.cover_letter}
                              </p>
                            </div>
                          )}
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
                  No applications found
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
