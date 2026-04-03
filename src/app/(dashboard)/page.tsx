"use client";

/**
 * Dashboard Home - Command Center with Bento Grid
 * Integrated with real API calls for live data
 * Author: Ahmed Adel Bakr Alderai
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Briefcase,
  FileText,
  Mail,
  Calendar,
  TrendingUp,
  Target,
  Zap,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Bot,
  Sparkles,
  Activity,
  Send,
  BarChart3,
  Users,
  Flame,
  AlertCircle,
  RotateCw,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "motion/react";
import { useAnalyticsOverview, useFunnel } from "@/hooks/use-analytics";
import { useApplications } from "@/hooks/use-applications";
import { useAgents } from "@/hooks/use-agents";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function DashboardPage() {
  const { data: overview, isLoading: overviewLoading, error: overviewError, refetch: refetchOverview } = useAnalyticsOverview();
  const { data: funnelData, isLoading: funnelLoading, error: funnelError, refetch: refetchFunnel } = useFunnel();
  const { data: applicationsData, isLoading: appsLoading, error: appsError, refetch: refetchApps } = useApplications({
    per_page: 5,
    sort_by: "created_at",
    sort_order: "desc",
  });
  const { data: agentsData, isLoading: agentsLoading, error: agentsError, refetch: refetchAgents } = useAgents();

  // Transform funnel data to pipeline stages
  const pipelineStages = funnelData?.map((stage) => {
    const colorMap: Record<string, { color: string; colorEnd: string }> = {
      "Applied": { color: "#6366f1", colorEnd: "#818cf8" },
      "Phone Screen": { color: "#7c3aed", colorEnd: "#a78bfa" },
      "Technical": { color: "#22d3ee", colorEnd: "#67e8f9" },
      "Final Round": { color: "#22c55e", colorEnd: "#4ade80" },
      "Offer": { color: "#f59e0b", colorEnd: "#fbbf24" },
    };
    const colors = colorMap[stage.stage] || { color: "#6366f1", colorEnd: "#818cf8" };
    return {
      name: stage.stage,
      count: stage.count,
      percentage: stage.percentage,
      ...colors,
    };
  }) || [];

  // Transform applications data to recent applications format
  const recentApplications = applicationsData?.applications?.map((app) => {
    const statusColorMap: Record<string, string> = {
      "draft": "bg-gray-500/10 text-gray-700 dark:text-gray-400",
      "submitted": "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400",
      "screening": "bg-violet-500/10 text-violet-700 dark:text-violet-400",
      "interview": "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400",
      "offer": "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
      "hired": "bg-green-500/10 text-green-700 dark:text-green-400",
      "rejected": "bg-red-500/10 text-red-700 dark:text-red-400",
      "withdrawn": "bg-gray-500/10 text-gray-700 dark:text-gray-400",
    };
    return {
      id: app.application_id,
      company: app.company || "Unknown Company",
      role: app.job_title || "Unknown Role",
      status: app.status.charAt(0).toUpperCase() + app.status.slice(1),
      statusColor: statusColorMap[app.status] || "bg-gray-500/10 text-gray-700 dark:text-gray-400",
    };
  }) || [];

  // Transform agents data to agent statuses format
  const agentStatuses = agentsData?.map((agent) => ({
    name: agent.display_name,
    status: agent.status === "running" ? "Active" : agent.status.charAt(0).toUpperCase() + agent.status.slice(1),
    active: agent.status === "running",
    uptime: agent.last_run_at ? formatUptime(agent.last_run_at) : "Unknown",
  })) || [];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <h1 className="text-4xl font-display font-bold tracking-tight">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Your job search command center
          </p>
        </motion.div>
        <motion.div
          className="flex gap-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
        >
          <Link href="/agents">
            <Button variant="outline" className="gap-2">
              <Bot className="w-4 h-4" />
              Agents
            </Button>
          </Link>
          <Link href="/jobs">
            <Button className="gap-2 gradient-brand border-0 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-shadow">
              <Zap className="w-4 h-4" />
              Launch Pipeline
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Stats Grid - 2+1+1 Bento Layout */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {/* Primary Stat - Active Applications */}
        <motion.div
          className="md:col-span-1 lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0 }}
          whileHover={{ scale: 1.02 }}
        >
          <Card className="card-glow h-full bg-gradient-to-br from-indigo-50/40 to-violet-50/40 dark:from-indigo-950/20 dark:to-violet-950/20">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Active Applications
                  </p>
                  {overviewLoading ? (
                    <Skeleton className="h-10 w-20 mt-2" />
                  ) : (
                    <AnimatedNumber value={overview?.active_applications || 0} className="text-4xl font-display font-bold mt-2" />
                  )}
                </div>
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center ring-1 ring-indigo-500/20">
                  <FileText className="w-6 h-6 text-indigo-500" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                  {overview?.response_rate ? `${Math.round(overview.response_rate * 100)}%` : "0%"} response rate
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Secondary Stat - Total Jobs Discovered */}
        <motion.div
          className="lg:col-span-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
          whileHover={{ scale: 1.02 }}
        >
          <Card className="card-glow h-full">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Jobs Discovered
                  </p>
                  {overviewLoading ? (
                    <Skeleton className="h-8 w-16 mt-2" />
                  ) : (
                    <AnimatedNumber value={overview?.total_jobs_discovered || 0} className="text-3xl font-display font-bold mt-2" />
                  )}
                </div>
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center ring-1 ring-violet-500/20">
                  <Target className="w-5 h-5 text-violet-500" />
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-3">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-xs text-emerald-600 dark:text-emerald-400">
                  {overview?.total_applications || 0} applied
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tertiary Stat - Interviews */}
        <motion.div
          className="lg:col-span-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
          whileHover={{ scale: 1.02 }}
        >
          <Card className="card-glow h-full">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Interviews
                  </p>
                  {overviewLoading ? (
                    <Skeleton className="h-8 w-8 mt-2" />
                  ) : (
                    <AnimatedNumber value={overview?.interview_count || 0} className="text-3xl font-display font-bold mt-2" />
                  )}
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center ring-1 ring-emerald-500/20">
                  <Calendar className="w-5 h-5 text-emerald-500" />
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-3">
                <Flame className="w-3.5 h-3.5 text-orange-500" />
                <span className="text-xs text-muted-foreground">
                  {overview?.offer_count || 0} offers
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Bento Layout - Asymmetric 2+1 and 1+1+1 */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Pipeline Overview - Spans 2 cols, tall */}
        <motion.div
          className="lg:col-span-7 lg:row-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}
        >
          <Card className="card-glow h-full flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="font-display text-lg">Pipeline Overview</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs font-mono">
                    <Activity className="w-3 h-3 me-1" />
                    {funnelLoading ? "Loading..." : "Live"}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => refetchFunnel()}
                    disabled={funnelLoading}
                    className="h-8 w-8 p-0"
                  >
                    <RotateCw className={`w-4 h-4 ${funnelLoading ? "animate-spin" : ""}`} />
                  </Button>
                </div>
              </div>
              <CardDescription>Application funnel progression</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 flex-1">
              {funnelError ? (
                <div className="text-sm text-red-500 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Failed to load pipeline data
                </div>
              ) : funnelLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-2.5 w-full" />
                    </div>
                  ))}
                </div>
              ) : pipelineStages.length > 0 ? (
                pipelineStages.map((stage, index) => (
                  <motion.div
                    key={stage.name}
                    className="space-y-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut", delay: 0.4 + index * 0.05 }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{stage.name}</span>
                      <span className="font-mono text-sm font-semibold text-muted-foreground">
                        {stage.count}
                      </span>
                    </div>
                    <div className="relative h-2.5 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        className="absolute inset-y-0 start-0 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${stage.percentage}%` }}
                        transition={{
                          duration: 1,
                          ease: "easeOut",
                          delay: 0.6 + index * 0.1
                        }}
                        style={{
                          background: `linear-gradient(90deg, ${stage.color}, ${stage.colorEnd})`,
                        }}
                      />
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground text-center py-4">
                  No pipeline data yet. Start applying to see progress.
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions - Right column, top */}
        <motion.div
          className="lg:col-span-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.4 }}
        >
          <Card className="card-glow h-full flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-lg">Quick Actions</CardTitle>
              <CardDescription>Common operations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <Button className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-6 text-sm font-medium text-white hover:shadow-lg hover:shadow-indigo-500/25 transition-all justify-start">
                  <Zap className="w-4 h-4 me-2" />
                  Run Pipeline
                </Button>
                <Button
                  variant="outline"
                  className="w-full rounded-xl px-4 py-6 text-sm justify-start"
                >
                  <Plus className="w-4 h-4 me-2" />
                  Add Job
                </Button>
              </div>
              <Button
                variant="ghost"
                className="w-full rounded-xl text-sm text-muted-foreground hover:text-foreground justify-start"
              >
                <BarChart3 className="w-4 h-4 me-2" />
                View Reports
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Applications - Spans 2 cols */}
        <motion.div
          className="lg:col-span-7"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.5 }}
        >
          <Card className="card-glow h-full flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-display text-lg">Recent Applications</CardTitle>
                  <CardDescription>Latest submissions</CardDescription>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => refetchApps()}
                  disabled={appsLoading}
                  className="h-8 w-8 p-0"
                >
                  <RotateCw className={`w-4 h-4 ${appsLoading ? "animate-spin" : ""}`} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              {appsError ? (
                <div className="text-sm text-red-500 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Failed to load applications
                </div>
              ) : appsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center justify-between py-3">
                      <div className="flex-1">
                        <Skeleton className="h-4 w-24 mb-1" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                      <Skeleton className="h-6 w-16" />
                    </div>
                  ))}
                </div>
              ) : recentApplications.length > 0 ? (
                <div className="divide-y divide-border">
                  {recentApplications.map((app, index) => (
                    <motion.div
                      key={app.id}
                      className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-muted/40 transition-colors cursor-pointer"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, ease: "easeOut", delay: 0.6 + index * 0.05 }}
                      whileHover={{ x: 4 }}
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{app.company}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{app.role}</p>
                      </div>
                      <Badge
                        variant="secondary"
                        className={`shrink-0 ms-2 font-mono text-xs ${app.statusColor}`}
                      >
                        {app.status}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground text-center py-4">
                  No applications yet. Submit your first application to get started!
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Agent Status - Right column */}
        <motion.div
          className="lg:col-span-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.6 }}
        >
          <Card className="card-glow h-full flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-display text-lg">Agent Status</CardTitle>
                  <CardDescription>System health</CardDescription>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => refetchAgents()}
                  disabled={agentsLoading}
                  className="h-8 w-8 p-0"
                >
                  <RotateCw className={`w-4 h-4 ${agentsLoading ? "animate-spin" : ""}`} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {agentsError ? (
                <div className="text-sm text-red-500 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Failed to load agent status
                </div>
              ) : agentsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-3 p-2">
                      <Skeleton className="h-2.5 w-2.5 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-24 mb-1" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                      <Skeleton className="h-4 w-12" />
                    </div>
                  ))}
                </div>
              ) : agentStatuses.length > 0 ? (
                agentStatuses.map((agent, index) => (
                  <motion.div
                    key={agent.name}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/40 transition-colors"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut", delay: 0.7 + index * 0.05 }}
                  >
                    <span className={cn(
                      "h-2.5 w-2.5 rounded-full shrink-0",
                      agent.active ? "bg-cyan-400 animate-pulse" : "bg-muted"
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{agent.name}</p>
                      <p className="text-xs text-muted-foreground">{agent.status}</p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">{agent.uptime}</span>
                  </motion.div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground text-center py-4">
                  No agents configured yet.
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Insights - Full width bottom */}
        <motion.div
          className="lg:col-span-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.7 }}
        >
          <Card className="card-glow bg-gradient-to-br from-indigo-50/30 to-violet-50/30 dark:from-indigo-950/10 dark:to-violet-950/10 border-primary/10">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg gradient-brand flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <CardTitle className="font-display text-lg">AI Insights & Recommendations</CardTitle>
              </div>
              <CardDescription>Smart suggestions to accelerate your job search</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {getAIInsights(overview).map((insight, index) => (
                  <motion.div
                    key={index}
                    className="p-4 rounded-lg bg-white/50 dark:bg-white/5 border border-primary/10 hover:border-primary/20 transition-colors"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut", delay: 0.8 + index * 0.05 }}
                    whileHover={{ y: -2 }}
                  >
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium text-sm mb-1">{insight.title}</p>
                        <p className="text-xs text-muted-foreground">{insight.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

/* ─── Helper Functions ─── */

/**
 * Generate AI insights based on analytics data
 */
function getAIInsights(overview: any) {
  if (!overview) {
    return [
      {
        title: "Get Started",
        description: "Start discovering and applying to jobs to see insights here.",
      },
      {
        title: "Track Progress",
        description: "Monitor your pipeline as applications move through stages.",
      },
      {
        title: "Optimize Strategy",
        description: "AI will suggest improvements as you gather more data.",
      },
    ];
  }

  const insights = [];

  // Response rate insight
  if (overview.response_rate < 0.2) {
    insights.push({
      title: "Improve Application Quality",
      description: `Your response rate is ${Math.round(overview.response_rate * 100)}%. Consider tailoring your application materials more carefully.`,
    });
  } else if (overview.response_rate > 0.4) {
    insights.push({
      title: "Strong Application Quality",
      description: `Your response rate is ${Math.round(overview.response_rate * 100)}%. Keep using your current strategy!`,
    });
  }

  // Volume insight
  if (overview.total_applications < 10) {
    insights.push({
      title: "Increase Application Volume",
      description: `You've submitted ${overview.total_applications} applications. Submit more to increase chances of interviews.`,
    });
  } else {
    insights.push({
      title: "Healthy Application Pace",
      description: `You've submitted ${overview.total_applications} applications with ${overview.interview_count} interview(s). Keep up the momentum!`,
    });
  }

  // Offer insight
  if (overview.offer_count === 0 && overview.total_applications > 20) {
    insights.push({
      title: "Advance More Candidates",
      description: "You have several applications in progress. Focus on moving them forward through interview rounds.",
    });
  } else if (overview.offer_count > 0) {
    insights.push({
      title: "Congratulations!",
      description: `You have ${overview.offer_count} offer(s)! Carefully evaluate your options.`,
    });
  } else {
    insights.push({
      title: "Build Your Pipeline",
      description: "Each application is a chance. Keep applying and you'll start seeing interviews soon.",
    });
  }

  return insights.slice(0, 3);
}

/**
 * Format uptime or last run time
 */
function formatUptime(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const hours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (hours < 1) {
      return "Just now";
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    }
  } catch {
    return "Unknown";
  }
}

/* ─── Animated Counter Component ─── */

function useAnimatedCounter(target: number, duration: number = 1.5) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    const controls = animate(count, target, {
      duration,
      ease: "easeOut",
    });

    return controls.stop;
  }, [count, target, duration]);

  return rounded;
}

interface AnimatedNumberProps {
  value: number;
  className?: string;
  duration?: number;
}

function AnimatedNumber({ value, className = "", duration = 1.5 }: AnimatedNumberProps) {
  const animated = useAnimatedCounter(value, duration);

  return (
    <motion.div className={className}>
      {animated}
    </motion.div>
  );
}

/* ─── Utility Helper ─── */

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

/* ─── Plus Icon ─── */

function Plus(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
