/**
 * Contacts CRM Page
 * Author: Ahmed Adel Bakr Alderai
 */

"use client"

import { useState } from "react"
import { useDebounce } from "@/hooks/useDebounce"
import { useContacts, useDeleteContact, useImportContacts } from "@/hooks"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { TableSkeleton } from "@/components/shared/loading-skeleton"
import { StatusBadge } from "@/components/shared/status-badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  ColumnDef,
} from "@tanstack/react-table"
import { Download, Loader2, MoreHorizontal, Plus, Search, Trash2, Edit, MessageSquare, AlertCircle, Inbox } from "lucide-react"
import type { LinkedInContact } from "@/types/api"

// Table column definitions
const columns: ColumnDef<LinkedInContact>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllRowsSelected()}
        onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const contact = row.original
      const initials = `${contact.first_name[0]}${contact.last_name[0]}`.toUpperCase()
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-sm">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">
              {contact.first_name} {contact.last_name}
            </p>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "company",
    header: "Company",
    cell: ({ row }) => <span className="text-sm">{row.getValue("company")}</span>,
  },
  {
    accessorKey: "position",
    header: "Position",
    cell: ({ row }) => <span className="text-sm">{row.getValue("position")}</span>,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => {
      const email = row.getValue("email") as string | undefined
      return email ? (
        <a href={`mailto:${email}`} className="text-sm text-primary hover:underline">
          {email}
        </a>
      ) : (
        <span className="text-sm text-muted-foreground">N/A</span>
      )
    },
  },
  {
    accessorKey: "score",
    header: "Score",
    cell: ({ row }) => {
      const score = (row.getValue("score") as number) || 0
      return (
        <div className="flex items-center gap-2">
          <div className="h-2 w-16 rounded-full bg-muted">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-green-500 to-blue-500"
              style={{ width: `${score}%` }}
            />
          </div>
          <span className="text-xs font-medium">{score}%</span>
        </div>
      )
    },
  },
  {
    accessorKey: "connected_on",
    header: "Connected",
    cell: ({ row }) => {
      const date = row.getValue("connected_on") as string | undefined
      return date ? (
        <span className="text-sm text-muted-foreground">
          {new Date(date).toLocaleDateString()}
        </span>
      ) : (
        <span className="text-sm text-muted-foreground">N/A</span>
      )
    },
  },
  {
    accessorKey: "tags",
    header: "Tags",
    cell: ({ row }) => {
      const tags = (row.getValue("tags") as string[] | undefined) || []
      return (
        <div className="flex flex-wrap gap-1">
          {tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground"
            >
              {tag}
            </span>
          ))}
          {tags.length > 2 && (
            <span className="text-xs text-muted-foreground">+{tags.length - 2}</span>
          )}
        </div>
      )
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => <ContactRowActions contact={row.original} />,
  },
]

interface ContactRowActionsProps {
  contact: LinkedInContact
}

function ContactRowActions({ contact }: ContactRowActionsProps) {
  const deleteContact = useDeleteContact()
  const [showDetailDialog, setShowDetailDialog] = useState(false)

  const handleDelete = () => {
    if (confirm(`Delete ${contact.first_name} ${contact.last_name}?`)) {
      deleteContact.mutate(contact.linkedin_id)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setShowDetailDialog(true)}>
            <MessageSquare className="mr-2 h-4 w-4" />
            Send Outreach
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowDetailDialog(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleDelete}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ContactDetailDialog
        contact={contact}
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
      />
    </>
  )
}

interface ContactDetailDialogProps {
  contact: LinkedInContact
  open: boolean
  onOpenChange: (open: boolean) => void
}

function ContactDetailDialog({
  contact,
  open,
  onOpenChange,
}: ContactDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {contact.first_name} {contact.last_name}
          </DialogTitle>
          <DialogDescription>
            {contact.company} • {contact.position}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-sm">{contact.email || "Not provided"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Phone</p>
              <p className="text-sm">{contact.phone || "Not provided"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Score</p>
              <p className="text-sm font-bold">{contact.score || 0}%</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Connected On
              </p>
              <p className="text-sm">
                {contact.connected_on
                  ? new Date(contact.connected_on).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
          </div>

          {contact.notes && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Notes
              </p>
              <p className="text-sm text-foreground">{contact.notes}</p>
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button>Send Outreach Message</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface ImportCSVDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function ImportCSVDialog({ open, onOpenChange }: ImportCSVDialogProps) {
  const importContacts = useImportContacts()
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        importContacts.mutate(file, {
          onSuccess: () => {
            onOpenChange(false)
          },
        })
      }
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      importContacts.mutate(file, {
        onSuccess: () => {
          onOpenChange(false)
        },
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Contacts</DialogTitle>
          <DialogDescription>
            Upload your LinkedIn connections CSV export
          </DialogDescription>
        </DialogHeader>

        <div
          className={`relative rounded-lg border-2 border-dashed p-8 text-center transition ${
            dragActive
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/50"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".csv"
            onChange={handleChange}
            className="absolute inset-0 cursor-pointer opacity-0"
            disabled={importContacts.isPending}
          />

          <div className="space-y-2">
            <Download className="mx-auto h-8 w-8 text-muted-foreground" />
            <div>
              <p className="font-medium">Drag and drop your CSV file here</p>
              <p className="text-sm text-muted-foreground">
                or click to browse
              </p>
            </div>
            {importContacts.isPending && (
              <div className="flex items-center justify-center gap-2 pt-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Importing...</span>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function ContactsPage() {
  const [page, setPage] = useState(1)
  const [perPage] = useState(10)
  const [searchQuery, setSearchQuery] = useState("")
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const debouncedSearch = useDebounce(searchQuery, 300)

  const { data, isLoading, error } = useContacts({
    search: debouncedSearch,
    page,
    per_page: perPage,
  })

  const table = useReactTable({
    data: data?.contacts || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const totalPages = data ? Math.ceil(data.total / perPage) : 1

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contacts</h1>
          <p className="text-muted-foreground">
            Manage your LinkedIn connections and outreach
          </p>
        </div>
        <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Import CSV
            </Button>
          </DialogTrigger>
          <ImportCSVDialog
            open={importDialogOpen}
            onOpenChange={setImportDialogOpen}
          />
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Total Contacts
            </p>
            <p className="text-3xl font-bold">{data?.total || 0}</p>
          </div>
        </Card>
        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              High Score (80+%)
            </p>
            <p className="text-3xl font-bold">
              {data?.contacts?.filter((c) => (c.score || 0) >= 80).length || 0}
            </p>
          </div>
        </Card>
        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              With Email
            </p>
            <p className="text-3xl font-bold">
              {data?.contacts?.filter((c) => c.email).length || 0}
            </p>
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card className="p-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, company, or email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setPage(1)
              }}
              className="pl-10"
            />
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={5} />
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border bg-background/50 px-4 py-12 text-center">
            <div className="rounded-lg bg-muted p-3">
              <AlertCircle className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">Error loading contacts</h3>
              <p className="text-sm text-muted-foreground">
                There was an error loading your contacts. Please try again.
              </p>
            </div>
            <Button onClick={() => window.location.reload()} size="sm">
              Retry
            </Button>
          </div>
        ) : !data?.contacts || data.contacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border bg-background/50 px-4 py-12 text-center">
            <div className="rounded-lg bg-muted p-3">
              <Inbox className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">No contacts imported yet</h3>
              <p className="text-sm text-muted-foreground">
                Upload your LinkedIn connections CSV to get started with outreach.
              </p>
            </div>
            <Button
              onClick={() => setImportDialogOpen(true)}
              size="sm"
            >
              <Plus className="mr-2 h-4 w-4" />
              Import CSV
            </Button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    {table.getHeaderGroups().map((headerGroup) =>
                      headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="px-6 py-3 text-left text-sm font-medium text-muted-foreground"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </th>
                      ))
                    )}
                  </tr>
                </thead>
                <tbody>
                  {table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-border hover:bg-muted/50 transition"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="px-6 py-4 text-sm"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-border px-6 py-4">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * perPage + 1} to{" "}
                {Math.min(page * perPage, data?.total || 0)} of{" "}
                {data?.total || 0} contacts
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}
