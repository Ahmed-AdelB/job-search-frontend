"use client";

/**
 * Invitations Page - Manage job referrals and invitations
 * Author: Ahmed Adel Bakr Alderai
 */

import { useState } from "react";
import { motion } from "motion/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  MailOpen,
  ArrowDownLeft,
  ArrowUpRight,
  Check,
  X,
  Clock,
  TrendingUp,
  Users,
} from "lucide-react";
import { apiGet, apiPost } from "@/lib/api-client";
import type { Invitation, InvitationsResponse } from "@/types/api";

const STATUS_CONFIG: Record<string, { color: string; icon: React.ElementType }> = {
  pending: { color: "bg-amber-500", icon: Clock },
  accepted: { color: "bg-green-600", icon: Check },
  declined: { color: "bg-red-600", icon: X },
  expired: { color: "bg-gray-500", icon: Clock },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    },
  },
} as any;

export default function InvitationsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["invitations"],
    queryFn: () => apiGet<InvitationsResponse>("/api/invitations"),
  });

  const invitations = data?.invitations ?? [];
  const acceptanceRate = data?.acceptance_rate;
  const incoming = invitations.filter((i) => i.type === "incoming");
  const outgoing = invitations.filter((i) => i.type === "outgoing");
  const pending = invitations.filter((i) => i.status === "pending");

  return (
    <motion.div className="space-y-6" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.4}}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Invitations</h1>
        <p className="text-muted-foreground">
          Manage job referrals and network invitations
        </p>
      </div>

      {/* Stats Cards */}
      <motion.div
        className="grid gap-4 sm:grid-cols-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <StatsCard
            title="Total"
            value={invitations.length}
            icon={MailOpen}
            loading={isLoading}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatsCard
            title="Pending"
            value={pending.length}
            icon={Clock}
            loading={isLoading}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatsCard
            title="Incoming"
            value={incoming.length}
            icon={ArrowDownLeft}
            loading={isLoading}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatsCard
            title="Acceptance Rate"
            value={acceptanceRate != null ? `${Math.round(acceptanceRate * 100)}%` : "—"}
            icon={TrendingUp}
            loading={isLoading}
          />
        </motion.div>
      </motion.div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">
            <MailOpen className="w-4 h-4 me-2" />
            All ({invitations.length})
          </TabsTrigger>
          <TabsTrigger value="incoming">
            <ArrowDownLeft className="w-4 h-4 me-2" />
            Incoming ({incoming.length})
          </TabsTrigger>
          <TabsTrigger value="outgoing">
            <ArrowUpRight className="w-4 h-4 me-2" />
            Outgoing ({outgoing.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <InvitationTable invitations={invitations} isLoading={isLoading} />
        </TabsContent>
        <TabsContent value="incoming" className="mt-6">
          <InvitationTable invitations={incoming} isLoading={isLoading} />
        </TabsContent>
        <TabsContent value="outgoing" className="mt-6">
          <InvitationTable invitations={outgoing} isLoading={isLoading} />
        </TabsContent>
      </Tabs>
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

function InvitationTable({
  invitations,
  isLoading,
}: {
  invitations: Invitation[];
  isLoading: boolean;
}) {
  const queryClient = useQueryClient();

  const respondMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: "accept" | "decline" }) =>
      apiPost<{ status: string }>(`/api/invitations/${id}/${action}`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["invitations"] }),
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (invitations.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            <MailOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No invitations in this category</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="rounded-md border-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Person</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-[160px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invitations.map((inv) => {
                const statusConfig = STATUS_CONFIG[inv.status] ?? STATUS_CONFIG.pending;
                const StatusIcon = statusConfig.icon;
                return (
                  <motion.tr
                    key={inv.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ type: "spring" as const, stiffness: 100, damping: 15 }}
                    whileHover={{ backgroundColor: "var(--muted)" }}
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium">{inv.person_name}</p>
                        {inv.email && (
                          <p className="text-xs text-muted-foreground">{inv.email}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{inv.company}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {inv.type === "incoming" ? (
                          <ArrowDownLeft className="w-3 h-3 me-1" />
                        ) : (
                          <ArrowUpRight className="w-3 h-3 me-1" />
                        )}
                        {inv.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusConfig.color}>
                        <StatusIcon className="w-3 h-3 me-1" />
                        {inv.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(inv.sent_at ?? inv.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {inv.status === "pending" && inv.type === "incoming" && (
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              respondMutation.mutate({ id: inv.id, action: "accept" })
                            }
                            disabled={respondMutation.isPending}
                          >
                            <Check className="w-4 h-4 me-1" />
                            Accept
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              respondMutation.mutate({ id: inv.id, action: "decline" })
                            }
                            disabled={respondMutation.isPending}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                      {inv.message && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                          {inv.message}
                        </p>
                      )}
                    </TableCell>
                  </motion.tr>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
