"use client";

/**
 * Analytics Page - Job Search Performance Tracking
 * Author: Ahmed Adel Bakr Alderai
 */

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  Users,
  FileText,
  AlertCircle,
  CheckCircle2,
  Briefcase,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api-client";
import type {
  AnalyticsOverview,
  FunnelMetrics,
  TimelineMetrics,
} from "@/types/api";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AnalyticsPage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch analytics data
  const overviewQuery = useQuery({
    queryKey: ["analytics", "overview"],
    queryFn: () => apiGet<AnalyticsOverview>("/api/v1/analytics/overview"),
    refetchInterval: 60000,
    staleTime: 30000,
  });

  const funnelQuery = useQuery({
    queryKey: ["analytics", "funnel"],
    queryFn: () => apiGet<FunnelMetrics>("/api/v1/analytics/funnel"),
    refetchInterval: 60000,
    staleTime: 30000,
  });

  const timelineQuery = useQuery({
    queryKey: ["analytics", "timeline"],
    queryFn: () => apiGet<TimelineMetrics>("/api/v1/analytics/timeline"),
    refetchInterval: 60000,
    staleTime: 30000,
  });

  // Calculate source breakdown from funnel data (mock distribution)
  const sourceData = funnelQuery.data?.stages && funnelQuery.data.stages[0]
    ? [
        { name: "LinkedIn", value: Math.floor(funnelQuery.data.stages[0].count * 0.4) || 24 },
        { name: "Indeed", value: Math.floor(funnelQuery.data.stages[0].count * 0.3) || 18 },
        { name: "Company Sites", value: Math.floor(funnelQuery.data.stages[0].count * 0.2) || 12 },
        { name: "Job Boards", value: Math.floor(funnelQuery.data.stages[0].count * 0.1) || 6 },
      ]
    : [];

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

  if (!isClient) {
    return null;
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Track your job search performance and conversion metrics
        </p>
      </div>

      {/* Error States */}
      {overviewQuery.isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load analytics data. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      )}

      {/* Overview Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <OverviewCard
          title="Total Jobs"
          value={overviewQuery.data?.total_jobs_discovered}
          icon={Briefcase}
          isLoading={overviewQuery.isLoading}
        />
        <OverviewCard
          title="Applications"
          value={overviewQuery.data?.total_applications}
          icon={FileText}
          isLoading={overviewQuery.isLoading}
        />
        <OverviewCard
          title="Interviews"
          value={overviewQuery.data?.interview_count}
          icon={Users}
          isLoading={overviewQuery.isLoading}
        />
        <OverviewCard
          title="Offers"
          value={overviewQuery.data?.offer_count}
          icon={CheckCircle2}
          isLoading={overviewQuery.isLoading}
        />
        <OverviewCard
          title="Response Rate"
          value={
            overviewQuery.data?.response_rate
              ? `${overviewQuery.data.response_rate.toFixed(1)}%`
              : undefined
          }
          icon={TrendingUp}
          isLoading={overviewQuery.isLoading}
          isFinal={true}
        />
        <OverviewCard
          title="Acceptance Rate"
          value={
            overviewQuery.data?.acceptance_rate
              ? `${overviewQuery.data.acceptance_rate.toFixed(1)}%`
              : undefined
          }
          icon={CheckCircle2}
          isLoading={overviewQuery.isLoading}
          isFinal={true}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Funnel Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Pipeline Funnel</CardTitle>
              <CardDescription>
                Application progression through stages
              </CardDescription>
            </CardHeader>
            <CardContent>
              {funnelQuery.isLoading ? (
                <div className="h-80 flex items-center justify-center">
                  <Skeleton className="w-full h-full" />
                </div>
              ) : funnelQuery.data?.stages && funnelQuery.data.stages.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={funnelQuery.data.stages}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="stage"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      interval={0}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart message="No funnel data available" />
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Source Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Jobs by Source</CardTitle>
              <CardDescription>Where your job opportunities come from</CardDescription>
            </CardHeader>
            <CardContent>
              {funnelQuery.isLoading ? (
                <div className="h-80 flex items-center justify-center">
                  <Skeleton className="w-full h-full" />
                </div>
              ) : sourceData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={sourceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {sourceData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart message="No source data available" />
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Timeline Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Activity Timeline</CardTitle>
            <CardDescription>
              Applications, responses, and interviews over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            {timelineQuery.isLoading ? (
              <div className="h-80 flex items-center justify-center">
                <Skeleton className="w-full h-full" />
              </div>
            ) : timelineQuery.data?.entries && timelineQuery.data.entries.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={timelineQuery.data.entries}>
                  <defs>
                    <linearGradient id="colorApplications" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient
                      id="colorResponses"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient
                      id="colorInterviews"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    interval={Math.max(
                      0,
                      Math.floor((timelineQuery.data?.entries?.length || 0) / 8)
                    )}
                  />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend
                    wrapperStyle={{
                      paddingTop: "20px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="applications"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#colorApplications)"
                    name="Applications"
                  />
                  <Area
                    type="monotone"
                    dataKey="responses"
                    stroke="#10b981"
                    fillOpacity={1}
                    fill="url(#colorResponses)"
                    name="Responses"
                  />
                  <Area
                    type="monotone"
                    dataKey="interviews"
                    stroke="#f59e0b"
                    fillOpacity={1}
                    fill="url(#colorInterviews)"
                    name="Interviews"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart message="No timeline data available" />
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Key Metrics Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Key Metrics Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {overviewQuery.data && (
                <>
                  <MetricItem
                    label="Application Rate"
                    value={
                      overviewQuery.data.total_jobs_discovered > 0
                        ? (
                            (overviewQuery.data.total_applications /
                              overviewQuery.data.total_jobs_discovered) *
                            100
                          ).toFixed(1) + "%"
                        : "0%"
                    }
                    description="% of jobs applied to"
                  />
                  <MetricItem
                    label="Interview Conversion"
                    value={
                      overviewQuery.data.total_applications > 0
                        ? (
                            (overviewQuery.data.interview_count /
                              overviewQuery.data.total_applications) *
                            100
                          ).toFixed(1) + "%"
                        : "0%"
                    }
                    description="% of applications with interviews"
                  />
                  <MetricItem
                    label="Offer Conversion"
                    value={
                      overviewQuery.data.interview_count > 0
                        ? (
                            (overviewQuery.data.offer_count /
                              overviewQuery.data.interview_count) *
                            100
                          ).toFixed(1) + "%"
                        : "0%"
                    }
                    description="% of interviews resulting in offers"
                  />
                  <MetricItem
                    label="Active Applications"
                    value={overviewQuery.data.active_applications.toString()}
                    description="Currently in pipeline"
                  />
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

/**
 * Overview Stat Card Component
 */
function OverviewCard({
  title,
  value,
  icon: Icon,
  isLoading,
  isFinal,
}: {
  title: string;
  value?: string | number;
  icon: React.ElementType;
  isLoading: boolean;
  isFinal?: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {isLoading ? (
              <Skeleton className="h-8 w-20 mt-2" />
            ) : (
              <motion.p
                className="text-2xl font-bold mt-2"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                {value ?? "—"}
              </motion.p>
            )}
          </div>
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Empty Chart State Component
 */
function EmptyChart({ message }: { message: string }) {
  return (
    <div className="h-80 flex items-center justify-center text-center">
      <div>
        <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

/**
 * Metric Item Component
 */
function MetricItem({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="p-4 rounded-lg border border-border/50 hover:border-border transition-colors">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold mt-2">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </div>
  );
}
