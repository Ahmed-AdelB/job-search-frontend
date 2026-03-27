"use client";

/**
 * Triage Page - Daily digest and job recommendation review
 * Author: Ahmed Adel Bakr Alderai
 */

import { useState } from "react";
import { motion } from "motion/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  ListFilter,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Info,
  XCircle,
  Sparkles,
  Settings,
  History,
  Eye,
} from "lucide-react";
import { apiGet, apiPost, apiPut } from "@/lib/api-client";
import type {
  TriageDigestPreview,
  TriageConfig,
  TriageDigestHistory,
  TriageAlert,
} from "@/types/api";

const ALERT_CONFIG: Record<string, { color: string; icon: React.ElementType }> = {
  info: { color: "bg-blue-600", icon: Info },
  warning: { color: "bg-amber-500", icon: AlertTriangle },
  success: { color: "bg-green-600", icon: CheckCircle2 },
  error: { color: "bg-red-600", icon: XCircle },
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

const slideInVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    },
  },
} as any;

export default function TriagePage() {
  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Triage</h1>
          <p className="text-muted-foreground">
            Daily digest, job recommendations, and actionable alerts
          </p>
        </div>
      </div>

      <Tabs defaultValue="digest">
        <TabsList>
          <TabsTrigger value="digest">
            <Sparkles className="w-4 h-4 me-2" />
            Today&apos;s Digest
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="w-4 h-4 me-2" />
            History
          </TabsTrigger>
          <TabsTrigger value="config">
            <Settings className="w-4 h-4 me-2" />
            Configuration
          </TabsTrigger>
        </TabsList>

        <TabsContent value="digest" className="mt-6">
          <DigestTab />
        </TabsContent>
        <TabsContent value="history" className="mt-6">
          <HistoryTab />
        </TabsContent>
        <TabsContent value="config" className="mt-6">
          <ConfigTab />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

function DigestTab() {
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["triage", "preview"],
    queryFn: () => apiGet<{ preview: TriageDigestPreview }>("/api/triage/preview"),
    staleTime: 1000 * 60 * 5,
  });

  const preview = data?.preview;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`w-4 h-4 me-2 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : !preview ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <ListFilter className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No digest available yet. Configure your triage settings to get started.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <motion.div
          className="space-y-4"
          initial="hidden"
          animate="visible"
          variants={containerVariants as any}
        >
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Digest for {new Date(preview.date).toLocaleDateString()}
                </CardTitle>
                {preview.summary && (
                  <CardDescription>{preview.summary}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="p-4 rounded-lg border text-center">
                    <div className="text-3xl font-bold">{preview.jobs_discovered ?? 0}</div>
                    <div className="text-sm text-muted-foreground">Jobs Discovered</div>
                  </div>
                  <div className="p-4 rounded-lg border text-center">
                    <div className="text-3xl font-bold">{preview.recommended_actions.length}</div>
                    <div className="text-sm text-muted-foreground">Recommended Actions</div>
                  </div>
                  <div className="p-4 rounded-lg border text-center">
                    <div className="text-3xl font-bold">{preview.alerts.length}</div>
                    <div className="text-sm text-muted-foreground">Alerts</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {preview.recommended_actions.length > 0 && (
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle>Recommended Actions</CardTitle>
                  <CardDescription>Steps to optimize your job search today</CardDescription>
                </CardHeader>
                <CardContent>
                  <motion.ul
                    className="space-y-3"
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: {
                          staggerChildren: 0.08,
                        },
                      },
                    }}
                  >
                    {preview.recommended_actions.map((action, i) => (
                      <motion.li
                        key={i}
                        className="flex items-start gap-3 p-3 rounded-lg border"
                        variants={slideInVariants}
                      >
                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                        <span className="text-sm">{action}</span>
                      </motion.li>
                    ))}
                  </motion.ul>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {preview.alerts.length > 0 && (
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle>Alerts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: {
                          staggerChildren: 0.08,
                        },
                      },
                    }}
                  >
                    {preview.alerts.map((alert, index) => {
                      const config = ALERT_CONFIG[alert.type] ?? ALERT_CONFIG.info;
                      const AlertIcon = config.icon;
                      return (
                        <motion.div
                          key={alert.id}
                          className="flex items-start gap-3 p-3 rounded-lg border"
                          variants={{
                            hidden: { opacity: 0, x: -20 },
                            visible: {
                              opacity: 1,
                              x: 0,
                              transition: {
                                delay: index * 0.05,
                                type: "spring",
                                stiffness: 100,
                                damping: 15,
                              },
                            },
                          } as any}
                        >
                          <Badge className={`${config.color} shrink-0`}>
                            <AlertIcon className="w-3 h-3 me-1" />
                            {alert.type}
                          </Badge>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{alert.title}</p>
                            {alert.description && (
                              <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                            )}
                          </div>
                          {alert.action_url && alert.action_label && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={alert.action_url}>{alert.action_label}</a>
                            </Button>
                          )}
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}

function HistoryTab() {
  const [page, setPage] = useState(1);
  const perPage = 20;

  const { data, isLoading } = useQuery({
    queryKey: ["triage", "history", page],
    queryFn: () =>
      apiGet<{ history: TriageDigestHistory[]; total: number }>(
        `/api/triage/history?page=${page}&per_page=${perPage}`
      ),
  });

  const history = data?.history ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5" />
          Digest History
        </CardTitle>
        <CardDescription>{total} past digests</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No digest history yet</p>
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Jobs Discovered</TableHead>
                    <TableHead>Actions</TableHead>
                    <TableHead>Alerts</TableHead>
                    <TableHead className="w-[80px]">View</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((entry, index) => (
                    <motion.tr
                      key={entry.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: index * 0.05,
                        type: "spring",
                        stiffness: 120,
                        damping: 20,
                      } as any}
                    >
                      <TableCell className="font-medium">
                        {new Date(entry.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{entry.jobs_discovered}</TableCell>
                      <TableCell>{entry.recommended_actions.length}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{entry.alerts_count}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
            {totalPages > 1 && (
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
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
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
  );
}

function ConfigTab() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["triage", "config"],
    queryFn: () => apiGet<{ config: TriageConfig }>("/api/triage/config"),
  });

  const [localConfig, setLocalConfig] = useState<TriageConfig | null>(null);
  const config = localConfig ?? data?.config;

  const updateMutation = useMutation({
    mutationFn: (newConfig: TriageConfig) =>
      apiPut<{ status: string }>("/api/triage/config", newConfig),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["triage", "config"] }),
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (!config) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Unable to load triage configuration</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleChange = (updates: Partial<TriageConfig>) => {
    setLocalConfig({ ...config, ...updates });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Triage Configuration</CardTitle>
        <CardDescription>Configure how your daily digest is generated</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Digest Frequency</p>
            <p className="text-sm text-muted-foreground">How often to generate digests</p>
          </div>
          <Select
            value={config.digest_frequency}
            onValueChange={(v) => handleChange({ digest_frequency: (v ?? "daily") as TriageConfig["digest_frequency"] })}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="never">Never</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {config.digest_frequency !== "never" && (
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Notification Time</p>
              <p className="text-sm text-muted-foreground">When to send the digest</p>
            </div>
            <Input
              type="time"
              value={config.notification_time ?? "09:00"}
              onChange={(e) => handleChange({ notification_time: e.target.value })}
              className="w-[140px]"
            />
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Minimum Match Score</p>
            <p className="text-sm text-muted-foreground">Only include jobs above this score</p>
          </div>
          <Input
            type="number"
            min={0}
            max={100}
            value={config.min_match_score ?? 50}
            onChange={(e) => handleChange({ min_match_score: parseInt(e.target.value) || 0 })}
            className="w-[100px]"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Job Recommendations</p>
              <p className="text-sm text-muted-foreground">Include job matches in digest</p>
            </div>
            <Switch
              checked={config.include_job_recommendations}
              onCheckedChange={(v) => handleChange({ include_job_recommendations: v })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Recruiter Alerts</p>
              <p className="text-sm text-muted-foreground">Include recruiter activity alerts</p>
            </div>
            <Switch
              checked={config.include_recruiter_alerts}
              onCheckedChange={(v) => handleChange({ include_recruiter_alerts: v })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Interview Reminders</p>
              <p className="text-sm text-muted-foreground">Include upcoming interview reminders</p>
            </div>
            <Switch
              checked={config.include_interview_reminders}
              onCheckedChange={(v) => handleChange({ include_interview_reminders: v })}
            />
          </div>
        </div>

        <Button
          onClick={() => {
            if (config) updateMutation.mutate(config);
          }}
          disabled={updateMutation.isPending}
        >
          {updateMutation.isPending ? "Saving..." : "Save Configuration"}
        </Button>

        {updateMutation.isSuccess && (
          <motion.p
            className="text-sm text-green-600 flex items-center gap-1"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 15 } as any}
          >
            <CheckCircle2 className="w-4 h-4" /> Configuration saved
          </motion.p>
        )}
      </CardContent>
    </Card>
  );
}
