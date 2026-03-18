"use client";

import React, { useState } from "react";
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
} from "@tanstack/react-table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Users,
  Plus,
  MoreHorizontal,
  Search,
  Eye,
  Edit,
  Mail,
  Trash2,
  Download,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { useContacts, useDeleteContact, useImportContacts } from "@/hooks/use-contacts";
import type { LinkedInContact } from "@/types/api";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";

/**
 * Contact Type Badge with color coding
 */
function ContactTypeBadge({ type }: { type: string }) {
  const typeConfig: Record<
    string,
    { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
  > = {
    recruiter: { label: "Recruiter", variant: "default" },
    hiring_manager: { label: "Hiring Manager", variant: "outline" },
    referral: { label: "Referral", variant: "outline" },
    network: { label: "Network", variant: "secondary" },
    other: { label: "Other", variant: "outline" },
  };

  const config = typeConfig[type] || { label: type, variant: "outline" };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

/**
 * Contact Row Actions Menu
 */
function ContactActionsMenu({
  contact,
  onDelete,
}: {
  contact: LinkedInContact;
  onDelete: (id: string) => void;
}) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const deleteContact = useDeleteContact();

  const handleDelete = async () => {
    try {
      await deleteContact.mutateAsync(contact.linkedin_id);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Failed to delete contact:", error);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <Eye className="w-4 h-4 mr-2" />
            View Profile
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Edit className="w-4 h-4 mr-2" />
            Edit Contact
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Mail className="w-4 h-4 mr-2" />
            Send Outreach
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contact</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold">
                {contact.first_name} {contact.last_name}
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteContact.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteContact.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/**
 * Import Contacts Button
 */
function ImportContactsButton() {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const importContacts = useImportContacts();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      toast.error("Please select a CSV file");
      return;
    }

    try {
      await importContacts.mutateAsync(file);
    } catch (error) {
      console.error("Failed to import contacts:", error);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileSelect}
        className="hidden"
      />
      <Button
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        disabled={importContacts.isPending}
      >
        <Download className="w-4 h-4 mr-2" />
        {importContacts.isPending ? "Importing..." : "Import CSV"}
      </Button>
    </>
  );
}

/**
 * Contacts Data Table
 */
function ContactsTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const debouncedSearch = useDebounce(searchTerm, 300);

  const { data: contactsData, isLoading, error } = useContacts({
    search: debouncedSearch,
    page: pagination.pageIndex + 1,
    per_page: pagination.pageSize,
  });

  const contacts = contactsData?.contacts || [];
  const totalContacts = contactsData?.total || 0;

  // Filter by type if selected
  const filteredContacts = typeFilter
    ? contacts.filter((c) => c.score && Number(c.score) > 0) // Placeholder filter
    : contacts;

  const columns: ColumnDef<LinkedInContact>[] = [
    {
      accessorKey: "first_name",
      header: "Name",
      cell: ({ row }) => {
        const firstName = row.getValue("first_name") as string;
        const lastName = (row.original as LinkedInContact).last_name;
        return (
          <div className="font-medium">
            {firstName} {lastName}
          </div>
        );
      },
    },
    {
      accessorKey: "company",
      header: "Company",
      cell: ({ row }) => (
        <div className="text-sm">{row.getValue("company") || "-"}</div>
      ),
    },
    {
      accessorKey: "position",
      header: "Title",
      cell: ({ row }) => (
        <div className="text-sm max-w-xs truncate">
          {row.getValue("position") || "-"}
        </div>
      ),
    },
    {
      id: "type",
      header: "Type",
      cell: ({ row }) => {
        // Determine type based on position and company context
        const position = (row.original as LinkedInContact).position?.toLowerCase() || "";
        let type = "network";
        if (position.includes("recruiter")) type = "recruiter";
        else if (position.includes("hiring") || position.includes("manager"))
          type = "hiring_manager";
        return <ContactTypeBadge type={type} />;
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => {
        const email = row.getValue("email") as string | undefined;
        if (!email) return <span className="text-muted-foreground">-</span>;
        return (
          <a
            href={`mailto:${email}`}
            className="text-sm text-blue-600 hover:underline"
          >
            {email}
          </a>
        );
      },
    },
    {
      id: "linkedin",
      header: "LinkedIn",
      cell: ({ row }) => {
        const linkedinId = (row.original as LinkedInContact).linkedin_id;
        return (
          <a
            href={`https://linkedin.com/in/${linkedinId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        );
      },
    },
    {
      accessorKey: "connected_on",
      header: "Last Contact",
      cell: ({ row }) => {
        const date = row.getValue("connected_on") as string | undefined;
        if (!date) return <span className="text-muted-foreground text-sm">Never</span>;
        return (
          <span className="text-sm">
            {new Date(date).toLocaleDateString()}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <ContactActionsMenu contact={row.original} onDelete={() => {}} />
      ),
    },
  ];

  const table = useReactTable({
    data: filteredContacts,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    manualPagination: true,
    rowCount: totalContacts,
    onPaginationChange: setPagination,
  });

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load contacts. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return <TableSkeleton rows={10} />;
  }

  if (contacts.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p className="mb-4">No contacts found</p>
        <ImportContactsButton />
      </div>
    );
  }

  const pageCount = Math.ceil(totalContacts / pagination.pageSize);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or company..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPagination({ pageIndex: 0, pageSize: pagination.pageSize });
            }}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <select
            className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPagination({ pageIndex: 0, pageSize: pagination.pageSize });
            }}
          >
            <option value="">All Types</option>
            <option value="recruiter">Recruiter</option>
            <option value="hiring_manager">Hiring Manager</option>
            <option value="referral">Referral</option>
            <option value="network">Network</option>
          </select>

          <ImportContactsButton />
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="bg-muted/50">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} className="hover:bg-muted/50">
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {pagination.pageIndex * pagination.pageSize + 1} to{" "}
          {Math.min(
            (pagination.pageIndex + 1) * pagination.pageSize,
            totalContacts
          )}{" "}
          of {totalContacts} contacts
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setPagination((prev) => ({
                ...prev,
                pageIndex: Math.max(0, prev.pageIndex - 1),
              }))
            }
            disabled={pagination.pageIndex === 0}
          >
            Previous
          </Button>

          <div className="flex items-center gap-1 px-2">
            <span className="text-sm">
              Page {pagination.pageIndex + 1} of {pageCount}
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setPagination((prev) => ({
                ...prev,
                pageIndex: Math.min(pageCount - 1, prev.pageIndex + 1),
              }))
            }
            disabled={pagination.pageIndex >= pageCount - 1}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Main Contacts Page
 */
export default function ContactsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Contacts</h1>
          <p className="text-muted-foreground">
            Manage your professional network and reach out to connections
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Contact
        </Button>
      </div>

      {/* Contacts Section */}
      <Card>
        <CardHeader>
          <CardTitle>Your Contacts</CardTitle>
          <CardDescription>
            Search, filter, and manage your professional contacts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ContactsTable />
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="bg-background/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardDescription className="text-xs font-medium uppercase tracking-wide">
              Total Contacts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">Across all types</p>
          </CardContent>
        </Card>

        <Card className="bg-background/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardDescription className="text-xs font-medium uppercase tracking-wide">
              Recently Active
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">In the last 7 days</p>
          </CardContent>
        </Card>

        <Card className="bg-background/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardDescription className="text-xs font-medium uppercase tracking-wide">
              Response Rate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0%</div>
            <p className="text-xs text-muted-foreground mt-1">Average response</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
