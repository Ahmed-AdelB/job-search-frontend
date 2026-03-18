"use client";

/**
 * Dashboard Home Page - Placeholder for Wave 2
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
  Sparkles
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Welcome back! 👋
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s what&apos;s happening with your job search today.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/jobs">
            <Button>
              <Briefcase className="w-4 h-4 me-2" />
              Browse Jobs
            </Button>
          </Link>
          <Link href="/dashboard/agents">
            <Button variant="outline">
              <Zap className="w-4 h-4 me-2" />
              Run Agents
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Applications"
          value="24"
          change="+3 this week"
          trend="up"
          icon={FileText}
          description="5 in interview stage"
        />
        <StatCard
          title="Jobs Matched"
          value="156"
          change="+12 today"
          trend="up"
          icon={Target}
          description="Based on your preferences"
        />
        <StatCard
          title="Emails Sent"
          value="48"
          change="+8 this week"
          trend="up"
          icon={Mail}
          description="12% response rate"
        />
        <StatCard
          title="Upcoming Interviews"
          value="3"
          change="Next: Tomorrow 2PM"
          trend="neutral"
          icon={Calendar}
          description="2 phone, 1 video"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates from your job search</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${activity.iconBg}`}>
                    <activity.icon className={`w-5 h-5 ${activity.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{activity.title}</p>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                  </div>
                  <Badge variant={activity.badgeVariant}>{activity.badge}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sidebar Content */}
        <div className="space-y-6">
          {/* Application Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Application Pipeline</CardTitle>
              <CardDescription>Your current application status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {pipelineStages.map((stage) => (
                <div key={stage.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{stage.name}</span>
                    <span className="font-medium">{stage.count}</span>
                  </div>
                  <Progress value={stage.percentage} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/dashboard/jobs">
                <Button variant="outline" className="w-full justify-start">
                  <Briefcase className="w-4 h-4 me-2" />
                  Find Jobs
                </Button>
              </Link>
              <Link href="/dashboard/applications">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 me-2" />
                  View Applications
                </Button>
              </Link>
              <Link href="/dashboard/outreach">
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="w-4 h-4 me-2" />
                  Send Outreach
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* AI Suggestions */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <CardTitle className="text-base">AI Suggestions</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Based on your profile, here are recommended actions:
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                  <span>Update your resume with recent achievements</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                  <span>Follow up on 3 pending applications</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                  <span>Apply to 5 new Senior Developer positions</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Components
function StatCard({
  title,
  value,
  change,
  trend,
  icon: Icon,
  description,
}: {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  icon: React.ElementType;
  description: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="w-5 h-5 text-primary" />
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4">
          {trend === "up" && <TrendingUp className="w-4 h-4 text-green-600" />}
          <span className={`text-sm ${trend === "up" ? "text-green-600" : "text-muted-foreground"}`}>
            {change}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}

// Data
const recentActivities = [
  {
    id: 1,
    title: "Application submitted",
    description: "Senior Frontend Developer at TechCorp",
    time: "2 hours ago",
    icon: FileText,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    badge: "Applied",
    badgeVariant: "default" as const,
  },
  {
    id: 2,
    title: "Interview scheduled",
    description: "Phone screening with Google recruiter",
    time: "5 hours ago",
    icon: Calendar,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    badge: "Tomorrow",
    badgeVariant: "secondary" as const,
  },
  {
    id: 3,
    title: "Email campaign completed",
    description: "50 outreach emails sent to hiring managers",
    time: "Yesterday",
    icon: Mail,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    badge: "Completed",
    badgeVariant: "outline" as const,
  },
  {
    id: 4,
    title: "New job matches",
    description: "12 new jobs match your criteria",
    time: "Yesterday",
    icon: Bot,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    badge: "New",
    badgeVariant: "secondary" as const,
  },
];

const pipelineStages = [
  { name: "Applied", count: 24, percentage: 100 },
  { name: "Phone Screen", count: 8, percentage: 33 },
  { name: "Technical Interview", count: 5, percentage: 21 },
  { name: "Final Round", count: 2, percentage: 8 },
  { name: "Offer", count: 1, percentage: 4 },
];
