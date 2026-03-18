/**
 * Target Companies Page
 * Author: Ahmed Adel Bakr Alderai
 */

"use client"

import { useState } from "react"
import {
  useTargetCompanies,
  useCreateTargetCompany,
  useUpdateTargetCompanyTier,
  useDeleteTargetCompany,
  useImportTargetCompanies,
} from "@/hooks"
import { useDebounce } from "@/hooks/useDebounce"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { TableSkeleton } from "@/components/shared/loading-skeleton"
import { EmptyState } from "@/components/shared/empty-state"
import { StatusBadge } from "@/components/shared/status-badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  ColumnDef,
} from "@tanstack/react-table"
import {
  Plus,
  Search,
  Download,
  MoreHorizontal,
  Trash2,
  Edit,
  Loader2,
  Building2,
  ExternalLink,
} from "lucide-react"
import type { TargetCompany, TierType } from "@/types/api"

// Tier color mapping
function getTierColor(tier: TierType) {
  switch (tier) {
    case "A":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
    case "B":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
    case "C":
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
  }
}

// Table column definitions
const columns: ColumnDef<TargetCompany>[] = [
  {
    accessorKey: "name",
    header: "Company Name",
    cell: ({ row }) => {
      const company = row.original
      return (
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <Building2 className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="font-medium">{company.name}</p>
            {company.company_size && (
              <p className="text-xs text-muted-foreground">{company.company_size}</p>
            )}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "tier",
    header: "Tier",
    cell: ({ row }) => {
      const tier = row.getValue("tier") as TierType
      return (
        <Badge className={`${getTierColor(tier)} font-semibold`}>
          Tier {tier}
        </Badge>
      )
    },
  },
  {
    accessorKey: "industry",
    header: "Industry",
    cell: ({ row }) => {
      const industry = row.getValue("industry") as string | undefined
      return industry ? (
        <span className="text-sm">{industry}</span>
      ) : (
        <span className="text-sm text-muted-foreground">—</span>
      )
    },
  },
  {
    accessorKey: "open_roles",
    header: "Open Roles",
    cell: ({ row }) => {
      const roles = (row.getValue("open_roles") as number) || 0
      return <span className="font-medium">{roles}</span>
    },
  },
  {
    accessorKey: "applied_count",
    header: "Applied",
    cell: ({ row }) => {
      const applied = (row.getValue("applied_count") as number) || 0
      return <span className="text-sm">{applied}</span>
    },
  },
  {
    accessorKey: "careers_url",
    header: "Careers URL",
    cell: ({ row }) => {
      const url = row.getValue("careers_url") as string | undefined
      return url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline inline-flex items-center gap-1"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      ) : (
        <span className="text-muted-foreground">—</span>
      )
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => <CompanyRowActions company={row.original} />,
  },
]

interface CompanyRowActionsProps {
  company: TargetCompany
}

function CompanyRowActions({ company }: CompanyRowActionsProps) {
  const deleteCompany = useDeleteTargetCompany()
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  const handleDelete = () => {
    if (confirm(`Delete "${company.name}"?`)) {
      deleteCompany.mutate(company.id)
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
          <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
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

      <EditCompanyDialog
        company={company}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />
    </>
  )
}

interface EditCompanyDialogProps {
  company: TargetCompany
  open: boolean
  onOpenChange: (open: boolean) => void
}

function EditCompanyDialog({
  company,
  open,
  onOpenChange,
}: EditCompanyDialogProps) {
  const [tier, setTier] = useState<TierType>(company.tier)
  const updateTier = useUpdateTargetCompanyTier()

  const handleSave = () => {
    updateTier.mutate(
      { id: company.id, tier },
      {
        onSuccess: () => {
          onOpenChange(false)
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Company</DialogTitle>
          <DialogDescription>Update company information</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="name">Company Name</Label>
            <Input
              id="name"
              value={company.name}
              disabled
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="tier">Tier</Label>
            <Select value={tier} onValueChange={(val) => setTier(val as TierType)}>
              <SelectTrigger id="tier" className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A">Tier A (High Priority)</SelectItem>
                <SelectItem value="B">Tier B (Medium Priority)</SelectItem>
                <SelectItem value="C">Tier C (Low Priority)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="industry">Industry</Label>
            <Input
              id="industry"
              value={company.industry || ""}
              disabled
              className="mt-1"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateTier.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={updateTier.isPending || tier === company.tier}
            >
              {updateTier.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface AddCompanyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function AddCompanyDialog({ open, onOpenChange }: AddCompanyDialogProps) {
  const [name, setName] = useState("")
  const [tier, setTier] = useState<TierType>("B")
  const [industry, setIndustry] = useState("")
  const [careersUrl, setCareersUrl] = useState("")
  const [notes, setNotes] = useState("")

  const createCompany = useCreateTargetCompany()

  const handleSubmit = () => {
    if (!name.trim()) return

    createCompany.mutate(
      {
        name,
        tier,
        industry: industry || undefined,
        careers_url: careersUrl || undefined,
        notes: notes || undefined,
      },
      {
        onSuccess: () => {
          setName("")
          setTier("B")
          setIndustry("")
          setCareersUrl("")
          setNotes("")
          onOpenChange(false)
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Target Company</DialogTitle>
          <DialogDescription>
            Add a new company to your target list
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="company-name">Company Name *</Label>
            <Input
              id="company-name"
              placeholder="e.g., Google, Microsoft..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="tier">Tier</Label>
            <Select value={tier} onValueChange={(val) => setTier(val as TierType)}>
              <SelectTrigger id="tier" className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A">Tier A (High Priority)</SelectItem>
                <SelectItem value="B">Tier B (Medium Priority)</SelectItem>
                <SelectItem value="C">Tier C (Low Priority)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="industry">Industry</Label>
            <Input
              id="industry"
              placeholder="e.g., Technology, Finance..."
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="careers-url">Careers URL</Label>
            <Input
              id="careers-url"
              placeholder="https://careers.company.com"
              type="url"
              value={careersUrl}
              onChange={(e) => setCareersUrl(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about this company..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 resize-none"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createCompany.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createCompany.isPending || !name.trim()}
            >
              {createCompany.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Add Company
            </Button>
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
  const importCompanies = useImportTargetCompanies()
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
        importCompanies.mutate(file, {
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
      importCompanies.mutate(file, {
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
          <DialogTitle>Import Companies</DialogTitle>
          <DialogDescription>
            Upload a CSV file with target companies
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
            disabled={importCompanies.isPending}
          />

          <div className="space-y-2">
            <Download className="mx-auto h-8 w-8 text-muted-foreground" />
            <div>
              <p className="font-medium">Drag and drop your CSV file here</p>
              <p className="text-sm text-muted-foreground">
                or click to browse
              </p>
            </div>
            {importCompanies.isPending && (
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

export default function TargetListPage() {
  const [page, setPage] = useState(1)
  const [perPage] = useState(10)
  const [searchQuery, setSearchQuery] = useState("")
  const [tierFilter, setTierFilter] = useState<TierType | "all">("all")
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)

  const debouncedSearch = useDebounce(searchQuery, 300)

  const { data, isLoading, error } = useTargetCompanies({
    search: debouncedSearch,
    tier: tierFilter !== "all" ? tierFilter : undefined,
    page,
    per_page: perPage,
  })

  const table = useReactTable({
    data: data?.companies || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const totalPages = data ? Math.ceil(data.total / perPage) : 1

  const tierCounts = data?.companies
    ? {
        A: data.companies.filter((c) => c.tier === "A").length,
        B: data.companies.filter((c) => c.tier === "B").length,
        C: data.companies.filter((c) => c.tier === "C").length,
      }
    : { A: 0, B: 0, C: 0 }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Target Companies</h1>
          <p className="text-muted-foreground">
            Manage your list of target companies by priority tier
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Company
              </Button>
            </DialogTrigger>
            <AddCompanyDialog
              open={addDialogOpen}
              onOpenChange={setAddDialogOpen}
            />
          </Dialog>

          <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Import
              </Button>
            </DialogTrigger>
            <ImportCSVDialog
              open={importDialogOpen}
              onOpenChange={setImportDialogOpen}
            />
          </Dialog>
        </div>
      </div>

      {/* Stats by Tier */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="p-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                Tier A (High)
              </p>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                {tierCounts.A}
              </Badge>
            </div>
            <p className="text-3xl font-bold">{tierCounts.A}</p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                Tier B (Medium)
              </p>
              <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
                {tierCounts.B}
              </Badge>
            </div>
            <p className="text-3xl font-bold">{tierCounts.B}</p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                Tier C (Low)
              </p>
              <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100">
                {tierCounts.C}
              </Badge>
            </div>
            <p className="text-3xl font-bold">{tierCounts.C}</p>
          </div>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by company name or industry..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setPage(1)
                }}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={tierFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setTierFilter("all")
                setPage(1)
              }}
            >
              All Tiers
            </Button>
            {(["A", "B", "C"] as const).map((tier) => (
              <Button
                key={tier}
                variant={tierFilter === tier ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setTierFilter(tier)
                  setPage(1)
                }}
              >
                Tier {tier}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={5} />
        ) : error ? (
          <EmptyState
            title="Error loading companies"
            description="There was an error loading your target companies. Please try again."
            action={
              <Button onClick={() => window.location.reload()}>
                Retry
              </Button>
            }
          />
        ) : !data?.companies || data.companies.length === 0 ? (
          <EmptyState
            title="No target companies yet"
            description="Start by adding companies you'd like to work for."
            action={
              <Button onClick={() => setAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Company
              </Button>
            }
          />
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
                {data?.total || 0} companies
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
