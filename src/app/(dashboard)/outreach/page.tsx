"use client";

import React, { useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/shared/status-badge";
import { StatSkeleton, TableSkeleton } from "@/components/shared/loading-skeleton";
import { Mail, Plus, MoreHorizontal, Send, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useOutreachStats, useOutreachMessages, useSendMessage } from "@/hooks/use-outreach";
import type { OutreachMessage, OutreachStats } from "@/types/api";
import { toast } from "sonner";

/**
 * Stats Card Component
 */
function StatsCard({
  title,
  value,
  description,
  isLoading,
}: {
  title: string;
  value: string | number;
  description?: string;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return <StatSkeleton />;
  }

  return (
    <Card className="bg-background/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardDescription className="text-xs font-medium uppercase tracking-wide">
          {title}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <div className="text-2xl font-bold">{value}</div>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Campaign Type Badge
 */
function CampaignTypeBadge({ type }: { type: string }) {
  const typeConfig: Record<
    string,
    { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
  > = {
    cold_email: { label: "Cold Email", variant: "secondary" },
    follow_up: { label: "Follow-up", variant: "outline" },
    networking: { label: "Networking", variant: "default" },
    thank_you: { label: "Thank You", variant: "outline" },
  };

  const config = typeConfig[type] || { label: type, variant: "outline" };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

/**
 * Message Status Badge with color coding
 */
function MessageStatusBadge({ status }: { status: string }) {
  const statusConfig: Record<
    string,
    { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
  > = {
    draft: { label: "Draft", variant: "secondary" },
    sent: { label: "Sent", variant: "outline" },
    delivered: { label: "Delivered", variant: "outline" },
    opened: { label: "Opened", variant: "default" },
    replied: { label: "Replied", variant: "default" },
    bounced: { label: "Bounced", variant: "destructive" },
  };

  const config = statusConfig[status] || { label: status, variant: "outline" };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

/**
 * New Campaign Dialog
 */
function NewCampaignDialog() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "cold_email",
    subject: "",
    body: "",
  });

  const sendMessage = useSendMessage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.subject || !formData.body) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await sendMessage.mutateAsync({
        contact_id: "", // Will be populated per contact in production
        message_type: formData.type,
        subject: formData.subject,
        body: formData.body,
        save_as_draft: true,
      });
      setOpen(false);
      setFormData({
        name: "",
        type: "cold_email",
        subject: "",
        body: "",
      });
    } catch (error) {
      console.error("Failed to create campaign:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Campaign
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Campaign</DialogTitle>
          <DialogDescription>
            Set up a new outreach campaign to contact your network
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="campaign-name">Campaign Name</Label>
            <Input
              id="campaign-name"
              placeholder="e.g., Q1 Recruiter Outreach"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="campaign-type">Campaign Type</Label>
            <select
              id="campaign-type"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
            >
              <option value="cold_email">Cold Email</option>
              <option value="follow_up">Follow-up</option>
              <option value="networking">Networking</option>
              <option value="thank_you">Thank You</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email-subject">Email Subject</Label>
            <Input
              id="email-subject"
              placeholder="Subject line for your emails"
              value={formData.subject}
              onChange={(e) =>
                setFormData({ ...formData, subject: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email-body">Email Body</Label>
            <Textarea
              id="email-body"
              placeholder="Email content (support {{firstName}}, {{lastName}}, {{company}} variables)"
              className="min-h-32"
              value={formData.body}
              onChange={(e) =>
                setFormData({ ...formData, body: e.target.value })
              }
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={sendMessage.isPending}>
              {sendMessage.isPending ? "Creating..." : "Create Campaign"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Messages Queue Table
 */
function MessagesQueueTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const { data: messagesData, isLoading, error } = useOutreachMessages({
    status: "draft",
    per_page: 10,
  });

  const messages = messagesData?.messages || [];

  const columns: ColumnDef<OutreachMessage>[] = [
    {
      accessorKey: "subject",
      header: "Subject",
      cell: ({ row }) => (
        <div className="max-w-xs truncate font-medium">
          {row.getValue("subject")}
        </div>
      ),
    },
    {
      accessorKey: "message_type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.getValue("message_type") as string;
        const typeLabel = type.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
        return <Badge variant="outline">{typeLabel}</Badge>;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <MessageStatusBadge status={row.getValue("status") as string} />
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const message = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Send className="w-4 h-4 mr-2" />
                Send Now
              </DropdownMenuItem>
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: messages,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
    },
    onSortingChange: setSorting,
  });

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load message queue. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return <TableSkeleton rows={5} />;
  }

  if (messages.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No pending messages</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
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
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex items-center justify-between p-4 border-t">
        <div className="text-sm text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
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
  );
}

/**
 * Main Outreach Page
 */
export default function OutreachPage() {
  const { data: statsData, isLoading: statsLoading } = useOutreachStats();

  const stats = statsData as OutreachStats | undefined;
  const openRate = stats && stats.total_sent > 0
    ? ((stats.total_opened / stats.total_sent) * 100).toFixed(1)
    : "0.0";
  const replyRate = stats && stats.total_sent > 0
    ? ((stats.total_replied / stats.total_sent) * 100).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Outreach</h1>
          <p className="text-muted-foreground">
            Manage email campaigns and track engagement
          </p>
        </div>
        <NewCampaignDialog />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Sent"
          value={stats?.total_sent || 0}
          isLoading={statsLoading}
        />
        <StatsCard
          title="Opened"
          value={stats?.total_opened || 0}
          description={`${openRate}% open rate`}
          isLoading={statsLoading}
        />
        <StatsCard
          title="Replied"
          value={stats?.total_replied || 0}
          description={`${replyRate}% reply rate`}
          isLoading={statsLoading}
        />
        <StatsCard
          title="Bounced"
          value="0"
          description="0% bounce rate"
          isLoading={statsLoading}
        />
      </div>

      {/* Campaigns Section */}
      <Card>
        <CardHeader>
          <CardTitle>Message Queue</CardTitle>
          <CardDescription>
            Pending messages ready to send to your contacts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MessagesQueueTable />
        </CardContent>
      </Card>

      {/* Campaign Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Performance</CardTitle>
          <CardDescription>
            Track performance metrics for each campaign
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Example campaign card */}
            <div className="border rounded-lg p-4 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium">Q1 Recruiter Outreach</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Started 2 days ago
                  </p>
                </div>
                <div className="flex gap-2">
                  <CampaignTypeBadge type="cold_email" />
                  <Badge variant="outline">Active</Badge>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Sent</p>
                  <p className="text-lg font-semibold">25</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Opened</p>
                  <p className="text-lg font-semibold">12</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Replied</p>
                  <p className="text-lg font-semibold">3</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Open Rate</span>
                  <span className="font-medium">48%</span>
                </div>
                <Progress value={48} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Reply Rate</span>
                  <span className="font-medium">12%</span>
                </div>
                <Progress value={12} className="h-2" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
