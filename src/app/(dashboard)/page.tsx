"use client";

/**
 * Dashboard Home - Command Center
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
          <h1 className="text-3xl font-bold tracking-tight">
            Mission Control
          </h1>
          <p className="text-muted-foreground mt-1">
            Your job search campaign at a glance
          </p>
        </motion.div>
        <motion.div 
          className="flex gap-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
        >
          <Link href="/dashboard/agents">
            <Button variant="outline" className="gap-2">
              <Bot className="w-4 h-4" />
              Agents
            </Button>
          </Link>
          <Link href="/dashboard/jobs">
            <Button className="gap-2 gradient-brand border-0 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-shadow">
              <Zap className="w-4 h-4" />
              Launch Pipeline
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Bento Stats Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Applications"
          value={24}
          change="+3 this week"
          trend="up"
          icon={FileText}
          color="indigo"
          delay={0}
        />
        <StatCard
          title="Jobs Matched"
          value={156}
          change="+12 today"
          trend="up"
          icon={Target}
          color="violet"
          delay={0.1}
        />
        <StatCard
          title="Outreach Sent"
          value={48}
          change="12% reply rate"
          trend="up"
          icon={Send}
          color="cyan"
          delay={0.2}
        />
        <StatCard
          title="Interviews"
          value={3}
          change="Next: Tomorrow"
          trend="neutral"
          icon={Calendar}
          color="emerald"
          delay={0.3}
        />
      </div>

      {/* Main Bento Layout */}
      <div className="grid gap-4 lg:grid-cols-12">
        {/* Pipeline Funnel - Wide */}
        <motion.div
          className="lg:col-span-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.4 }}
        >
          <Card className="card-glow h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Application Pipeline</CardTitle>
                <Badge variant="outline" className="text-xs font-mono">
                  <Activity className="w-3 h-3 me-1" />
                  Live
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {pipelineStages.map((stage, index) => (
                <div key={stage.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{stage.name}</span>
                    <span className="font-mono font-semibold text-foreground">{stage.count}</span>
                  </div>
                  <div className="relative h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className="absolute inset-y-0 start-0 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${stage.percentage}%` }}
                      transition={{ 
                        duration: 1, 
                        ease: "easeOut",
                        delay: 0.5 + index * 0.1
                      }}
                      style={{
                        background: `linear-gradient(90deg, ${stage.color}, ${stage.colorEnd})`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          className="lg:col-span-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.5 }}
        >
          <Card className="card-glow h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivities.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ 
                      duration: 0.4, 
                      ease: "easeOut",
                      delay: 0.6 + index * 0.1
                    }}
                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/40 transition-colors"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${activity.iconBg}`}>
                      <activity.icon className={`w-4 h-4 ${activity.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-tight">{activity.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{activity.description}</p>
                      <p className="text-[11px] text-muted-foreground/60 mt-1 font-mono">{activity.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Column - AI + Quick Actions */}
        <div className="lg:col-span-3 space-y-4">
          {/* AI Suggestions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.6 }}
          >
            <Card className="gradient-brand-subtle border-primary/20 card-glow">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg gradient-brand flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                  <CardTitle className="text-sm">AI Insights</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2.5">
                  {aiSuggestions.map((s, i) => (
                    <motion.li 
                      key={i} 
                      className="flex items-start gap-2 text-sm"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ 
                        duration: 0.3, 
                        ease: "easeOut",
                        delay: 0.7 + i * 0.1
                      }}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                      <span className="text-muted-foreground leading-tight">{s}</span>
                    </motion.li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.7 }}
          >
            <Card className="card-glow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5">
                <AnimatePresence>
                  {quickActions.map((action, index) => (
                    <motion.div
                      key={action.href}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ 
                        duration: 0.3, 
                        ease: "easeOut",
                        delay: 0.8 + index * 0.05
                      }}
                    >
                      <Link href={action.href}>
                        <Button
                          variant="ghost"
                          className="w-full justify-start h-9 text-sm text-muted-foreground hover:text-foreground"
                        >
                          <action.icon className="w-4 h-4 me-2.5" />
                          {action.label}
                          <ArrowUpRight className="w-3 h-3 ms-auto opacity-40" />
                        </Button>
                      </Link>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

/* ─── Animated Counter Hook ─── */

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

/* ─── StatCard Component ─── */

const colorMap = {
  indigo: { bg: "bg-indigo-500/10", text: "text-indigo-500", ring: "ring-indigo-500/20" },
  violet: { bg: "bg-violet-500/10", text: "text-violet-500", ring: "ring-violet-500/20" },
  cyan: { bg: "bg-cyan-500/10", text: "text-cyan-500", ring: "ring-cyan-500/20" },
  emerald: { bg: "bg-emerald-500/10", text: "text-emerald-500", ring: "ring-emerald-500/20" },
} as const;

function StatCard({
  title,
  value,
  change,
  trend,
  icon: Icon,
  color,
  delay = 0,
}: {
  title: string;
  value: number;
  change: string;
  trend: "up" | "down" | "neutral";
  icon: React.ElementType;
  color: keyof typeof colorMap;
  delay?: number;
}) {
  const colors = colorMap[color];
  const animatedValue = useAnimatedCounter(value, 1.5);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut", delay }}
      whileHover={{ 
        scale: 1.02, 
        boxShadow: "0 0 30px rgba(124,58,237,0.15)" 
      }}
    >
      <Card className="card-glow h-full">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
              <motion.p className="text-3xl font-bold mt-1.5 font-mono tracking-tight">
                {animatedValue}
              </motion.p>
            </div>
            <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center ring-1 ${colors.ring}`}>
              <Icon className={`w-5 h-5 ${colors.text}`} />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-3">
            {trend === "up" && <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />}
            <span className={`text-xs ${trend === "up" ? "text-emerald-500" : "text-muted-foreground"}`}>
              {change}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ─── Data ─── */

const recentActivities = [
  {
    id: 1,
    title: "Application submitted",
    description: "Senior Frontend Developer at TechCorp",
    time: "2h ago",
    icon: FileText,
    iconBg: "bg-indigo-500/10",
    iconColor: "text-indigo-500",
  },
  {
    id: 2,
    title: "Interview scheduled",
    description: "Phone screen with Google recruiter",
    time: "5h ago",
    icon: Calendar,
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-500",
  },
  {
    id: 3,
    title: "Outreach campaign completed",
    description: "50 emails sent to hiring managers",
    time: "Yesterday",
    icon: Mail,
    iconBg: "bg-violet-500/10",
    iconColor: "text-violet-500",
  },
  {
    id: 4,
    title: "12 new job matches",
    description: "Matching your search criteria",
    time: "Yesterday",
    icon: Bot,
    iconBg: "bg-cyan-500/10",
    iconColor: "text-cyan-500",
  },
];

const pipelineStages = [
  { name: "Applied", count: 24, percentage: 100, color: "#6366f1", colorEnd: "#818cf8" },
  { name: "Phone Screen", count: 8, percentage: 33, color: "#7c3aed", colorEnd: "#a78bfa" },
  { name: "Technical", count: 5, percentage: 21, color: "#22d3ee", colorEnd: "#67e8f9" },
  { name: "Final Round", count: 2, percentage: 8, color: "#22c55e", colorEnd: "#4ade80" },
  { name: "Offer", count: 1, percentage: 4, color: "#f59e0b", colorEnd: "#fbbf24" },
];

const aiSuggestions = [
  "Update resume with recent achievements",
  "Follow up on 3 pending applications",
  "Apply to 5 matching Senior Dev roles",
];

const quickActions = [
  { href: "/dashboard/jobs", icon: Briefcase, label: "Browse Jobs" },
  { href: "/dashboard/applications", icon: FileText, label: "Applications" },
  { href: "/dashboard/outreach", icon: Mail, label: "Send Outreach" },
  { href: "/dashboard/agents", icon: Bot, label: "Manage Agents" },
];
