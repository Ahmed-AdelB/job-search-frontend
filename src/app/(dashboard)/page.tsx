"use client";

/**
 * Dashboard Home - Command Center with Bento Grid
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
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "motion/react";

export default function DashboardPage() {
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
        {/* Primary Stat - Emphasized */}
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
                  <AnimatedNumber value={24} className="text-4xl font-display font-bold mt-2" />
                </div>
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center ring-1 ring-indigo-500/20">
                  <FileText className="w-6 h-6 text-indigo-500" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                  +3 this week
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Secondary Stat */}
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
                    Jobs Matched
                  </p>
                  <AnimatedNumber value={156} className="text-3xl font-display font-bold mt-2" />
                </div>
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center ring-1 ring-violet-500/20">
                  <Target className="w-5 h-5 text-violet-500" />
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-3">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-xs text-emerald-600 dark:text-emerald-400">
                  +12 today
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tertiary Stat */}
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
                  <AnimatedNumber value={3} className="text-3xl font-display font-bold mt-2" />
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center ring-1 ring-emerald-500/20">
                  <Calendar className="w-5 h-5 text-emerald-500" />
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-3">
                <Flame className="w-3.5 h-3.5 text-orange-500" />
                <span className="text-xs text-muted-foreground">
                  Next: Tomorrow
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
                <Badge variant="outline" className="text-xs font-mono">
                  <Activity className="w-3 h-3 me-1" />
                  Live
                </Badge>
              </div>
              <CardDescription>Application funnel progression</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 flex-1">
              {pipelineStages.map((stage, index) => (
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
              ))}
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
              <CardTitle className="font-display text-lg">Recent Applications</CardTitle>
              <CardDescription>Latest submissions</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
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
              <CardTitle className="font-display text-lg">Agent Status</CardTitle>
              <CardDescription>System health</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {agentStatuses.map((agent, index) => (
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
              ))}
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
                {aiInsights.map((insight, index) => (
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

/* ─── Data ─── */

const pipelineStages = [
  { name: "Applied", count: 24, percentage: 100, color: "#6366f1", colorEnd: "#818cf8" },
  { name: "Phone Screen", count: 8, percentage: 33, color: "#7c3aed", colorEnd: "#a78bfa" },
  { name: "Technical", count: 5, percentage: 21, color: "#22d3ee", colorEnd: "#67e8f9" },
  { name: "Final Round", count: 2, percentage: 8, color: "#22c55e", colorEnd: "#4ade80" },
  { name: "Offer", count: 1, percentage: 4, color: "#f59e0b", colorEnd: "#fbbf24" },
];

const recentApplications = [
  {
    id: 1,
    company: "TechCorp",
    role: "Senior Frontend Developer",
    status: "Applied",
    statusColor: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400",
  },
  {
    id: 2,
    company: "Google",
    role: "Product Engineer",
    status: "In Review",
    statusColor: "bg-violet-500/10 text-violet-700 dark:text-violet-400",
  },
  {
    id: 3,
    company: "Meta",
    role: "Full Stack Engineer",
    status: "Phone Screen",
    statusColor: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400",
  },
  {
    id: 4,
    company: "Stripe",
    role: "Engineering Manager",
    status: "Interview",
    statusColor: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  },
];

const agentStatuses = [
  { name: "Discovery Agent", status: "Scanning jobs", active: true, uptime: "24h" },
  { name: "Apply Agent", status: "Idle", active: true, uptime: "24h" },
  { name: "Outreach Agent", status: "Sending messages", active: true, uptime: "12h" },
  { name: "Analytics Agent", status: "Offline", active: false, uptime: "2h" },
];

const aiInsights = [
  {
    title: "Optimize Application Rate",
    description: "You have a 45% application rate. Increasing target-list size could improve conversion.",
  },
  {
    title: "Follow Up with Recruiters",
    description: "3 applications from last week have no response. Send friendly follow-ups today.",
  },
  {
    title: "Enhance Your Profile",
    description: "Adding 2-3 recent projects to your portfolio could boost response rate by 15%.",
  },
];
