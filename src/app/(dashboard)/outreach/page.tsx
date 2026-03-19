"use client";

/**
 * Outreach Page - Email campaigns and outreach management
 * Author: Ahmed Adel Bakr Alderai
 */

import { useState } from "react";
import { motion } from "motion/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Mail,
  Plus,
  Send,
  Eye,
  Reply,
  MailOpen,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { apiGet, apiPost } from "@/lib/api-client";
import type { OutreachMessage, OutreachStats, OutreachCampaign } from "@/types/api";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-500",
  sent: "bg-blue-600",
  delivered: "bg-indigo-600",
  opened: "bg-amber-500",
  replied: "bg-green-600",
  bounced: "bg-red-600",
};

export default function OutreachPage() {
  const [page, setPage] = useState(1);
  const [showNewCampaign, setShowNewCampaign] = useState(false);
  const perPage = 20;

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["outreach", "stats"],
    queryFn: () => apiGet<OutreachStats>("/api/v1/outreach/stats"),
    refetchInterval: 30000,
  });

  const { data: messagesData, isLoading: messagesLoading, refetch } = useQuery({
    queryKey: ["outreach", "messages", page],
    queryFn: () =>
      apiGet<{ messages: OutreachMessage[]; total: number }>(
        `/api/v1/outreach/messages?page=${page}&per_page=${perPage}`
      ),
  });

  const { data: campaignsData } = useQuery({
    queryKey: ["outreach", "campaigns"],
    queryFn: () => apiGet<{ campaigns: OutreachCampaign[] }>("/api/v1/outreach/campaigns"),
  });

  const messages = messagesData?.messages ?? [];
  const total = messagesData?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const campaigns = campaignsData?.campaigns ?? [];

  return (
    <motion.div className="space-y-6" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.4}}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Outreach</h1>
          <p className="text-muted-foreground">
            Manage email campaigns and outreach messages
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 me-2" />
            Refresh
          </Button>
          <NewCampaignDialog open={showNewCampaign} onOpenChange={setShowNewCampaign} />
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 sm:grid-cols-4">
        <StatsCard
          title="Total Sent"
          value={statsData?.total_sent ?? 0}
          icon={Send}
          loading={statsLoading}
        />
        <StatsCard
          title="Open Rate"
          value={statsData ? `${Math.round(statsData.open_rate * 100)}%` : "0%"}
          icon={Eye}
          loading={statsLoading}
        />
        <StatsCard
          title="Reply Rate"
          value={statsData ? `${Math.round(statsData.reply_rate * 100)}%` : "0%"}
          icon={Reply}
          loading={statsLoading}
        />
        <StatsCard
          title="Replied"
          value={statsData?.total_replied ?? 0}
          icon={TrendingUp}
          loading={statsLoading}
        />
      </div>

      {/* Campaigns */}
      {campaigns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Campaigns</CardTitle>
            <CardDescription>{campaigns.length} campaigns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {campaigns.filter((c) => c.status === "active").map((campaign) => (
                <div key={campaign.campaign_id} className="p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{campaign.name}</span>
                    <Badge variant="outline" className="text-xs">{campaign.type}</Badge>
                  </div>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>Sent: {campaign.sent_count}</span>
                    <span>Opened: {campaign.opened_count}</span>
                    <span>Replied: {campaign.replied_count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Messages Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Message Queue
          </CardTitle>
          <CardDescription>{total} total messages</CardDescription>
        </CardHeader>
        <CardContent>
          {messagesLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No messages yet. Create a campaign to get started.</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sent</TableHead>
                      <TableHead>Opened</TableHead>
                      <TableHead>Replied</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {messages.map((msg) => (
                      <TableRow key={msg.message_id}>
                        <TableCell className="font-medium max-w-[250px] truncate">
                          {msg.subject}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {msg.message_type.replace(/_/g, " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${STATUS_COLORS[msg.status] ?? "bg-gray-500"} text-xs`}>
                            {msg.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {msg.sent_at
                            ? new Date(msg.sent_at).toLocaleDateString()
                            : "—"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {msg.opened_at
                            ? new Date(msg.opened_at).toLocaleDateString()
                            : "—"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {msg.replied_at
                            ? new Date(msg.replied_at).toLocaleDateString()
                            : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
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
    </motion.div>
  );
}

function StatsCard({
  title,
  value,
  icon: Icon,
  loading,
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  loading: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            {loading ? (
              <Skeleton className="h-8 w-12 mt-1" />
            ) : (
              <p className="text-2xl font-bold">{value}</p>
            )}
          </div>
          <Icon className="w-8 h-8 text-muted-foreground opacity-50" />
        </div>
      </CardContent>
    </Card>
  );
}

function NewCampaignDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [type, setType] = useState("cold_email");

  const createMutation = useMutation({
    mutationFn: (data: { name: string; type: string }) =>
      apiPost<{ campaign_id: string }>("/api/v1/outreach/campaigns", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outreach"] });
      onOpenChange(false);
      setName("");
      setType("cold_email");
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 me-2" />
          New Campaign
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Campaign</DialogTitle>
          <DialogDescription>
            Set up a new outreach campaign
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Campaign Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Q1 Recruiter Outreach"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Campaign Type</label>
            <Select value={type} onValueChange={(v) => setType(v ?? "email")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cold_email">Cold Email</SelectItem>
                <SelectItem value="follow_up">Follow Up</SelectItem>
                <SelectItem value="networking">Networking</SelectItem>
                <SelectItem value="thank_you">Thank You</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={() => createMutation.mutate({ name, type })}
            disabled={!name || createMutation.isPending}
          >
            {createMutation.isPending ? (
              <Loader2 className="w-4 h-4 me-2 animate-spin" />
            ) : null}
            Create Campaign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
