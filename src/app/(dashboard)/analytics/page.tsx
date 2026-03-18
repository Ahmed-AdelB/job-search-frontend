/**
 * Analytics Page - Comprehensive job search analytics and metrics
 * Author: Ahmed Adel Bakr Alderai
 */

"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  useAnalyticsOverview,
  useFunnel,
  useByATS,
  useTimeline,
  useTopSources,
  useTopCompanies,
} from "@/hooks/use-analytics";
import { PipelineChart } from "@/components/charts/pipeline-chart";
import { SuccessChart } from "@/components/charts/success-chart";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const COLORS = [
  "hsl(217.2 91.2% 59.8%)",
  "hsl(142.1 76.2% 36.3%)",
  "hsl(38.6 92.1% 50.2%)",
  "hsl(0 84.2% 60.2%)",
  "hsl(280.9 81.2% 53.7%)",
];

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  isLoading?: boolean;
}

function StatCard({ label, value, change, isLoading }: StatCardProps) {
  return (
    <Card className="p-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {isLoading ? (
          <div className="h-8 bg-muted animate-pulse rounded" />
        ) : (
          <>
            <p className="text-3xl font-bold">{value}</p>
            {change && (
              <p className="text-xs text-muted-foreground">{change}</p>
            )}
          </>
        )}
      </div>
    </Card>
  );
}

function LoadingChart() {
  return (
    <Card className="p-6">
      <div className="h-64 bg-muted animate-pulse rounded" />
    </Card>
  );
}

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<7 | 30 | 90 | "all">(30);

  // Fetch all analytics data
  const overviewQuery = useAnalyticsOverview();
  const funnelQuery = useFunnel();
  const atsQuery = useByATS();
  const timelineQuery = useTimeline(dateRange);
  const sourcesQuery = useTopSources();
  const companiesQuery = useTopCompanies();

  const overview = overviewQuery.data;
  const funnel = funnelQuery.data || [];
  const ats = atsQuery.data || [];
  const timeline = timelineQuery.data || [];
  const sources = sourcesQuery.data || [];
  const companies = companiesQuery.data || [];

  // Transform timeline data for success rate chart
  const successData = (timeline || []).map((d) => ({
    date: d.date,
    rate:
      d.applications > 0
        ? (d.applications / d.jobs_discovered) * 100
        : 0,
    count: d.applications,
  }));

  // Transform timeline data for activity heatmap
  const activityData = (timeline || []).map((d) => ({
    date: d.date,
    jobs: d.jobs_discovered,
    applications: d.applications,
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground">
              Track your job search performance and metrics
            </p>
          </div>

          {/* Date Range Selector */}
          <div className="flex gap-2">
            {(
              [
                { label: "7d", value: 7 },
                { label: "30d", value: 30 },
                { label: "90d", value: 90 },
                { label: "All", value: "all" },
              ] as Array<{ label: string; value: 7 | 30 | 90 | "all" }>
            ).map((option) => (
              <Button
                key={option.label}
                variant={dateRange === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => setDateRange(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Row 1: Key Statistics */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-6">
        <StatCard
          label="Total Discovered"
          value={overview?.total_jobs_discovered ?? 0}
          isLoading={overviewQuery.isLoading}
        />
        <StatCard
          label="Applications"
          value={overview?.total_applications ?? 0}
          isLoading={overviewQuery.isLoading}
        />
        <StatCard
          label="Interviews"
          value={overview?.total_interviews ?? 0}
          isLoading={overviewQuery.isLoading}
        />
        <StatCard
          label="Offers"
          value={overview?.total_offers ?? 0}
          isLoading={overviewQuery.isLoading}
        />
        <StatCard
          label="Success Rate"
          value={
            overview
              ? `${(overview.application_success_rate * 100).toFixed(1)}%`
              : "0%"
          }
          isLoading={overviewQuery.isLoading}
        />
        <StatCard
          label="Avg Response Time"
          value={`${overview?.avg_response_time_days.toFixed(1) ?? 0}d`}
          isLoading={overviewQuery.isLoading}
        />
      </div>

      {/* Row 2: Funnel & Success Rate Trend */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {funnelQuery.isLoading ? (
          <>
            <LoadingChart />
            <LoadingChart />
          </>
        ) : (
          <>
            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-sm text-foreground">
                    Application Funnel
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Job conversion pipeline
                  </p>
                </div>

                {funnel.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart
                      data={funnel}
                      margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(214.3 31.8% 91.4%)"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="stage"
                        tick={{ fontSize: 12, fill: "hsl(215.4 16.3% 46.9%)" }}
                        axisLine={{ stroke: "hsl(214.3 31.8% 91.4%)" }}
                      />
                      <YAxis
                        tick={{ fontSize: 12, fill: "hsl(215.4 16.3% 46.9%)" }}
                        axisLine={{ stroke: "hsl(214.3 31.8% 91.4%)" }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(222.2 84% 4.9%)",
                          border: "1px solid hsl(217.2 91.2% 59.8%)",
                          borderRadius: "0.5rem",
                          color: "hsl(210 40% 98%)",
                        }}
                        formatter={(value: number) => [
                          `${value} jobs`,
                          "Count",
                        ]}
                      />
                      <Bar dataKey="count" fill="hsl(217.2 91.2% 59.8%)" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground text-sm py-12">
                    No funnel data available
                  </p>
                )}
              </div>
            </Card>

            <SuccessChart
              data={successData}
              isLoading={timelineQuery.isLoading}
            />
          </>
        )}
      </div>

      {/* Row 3: ATS Types & Top Sources */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {atsQuery.isLoading || sourcesQuery.isLoading ? (
          <>
            <LoadingChart />
            <LoadingChart />
          </>
        ) : (
          <>
            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-sm text-foreground">
                    Applications by ATS
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Distribution across application systems
                  </p>
                </div>

                {ats.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={ats}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ ats_type, percentage }) =>
                          `${ats_type} (${percentage}%)`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {ats.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => `${value} apps`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground text-sm py-12">
                    No ATS data available
                  </p>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-sm text-foreground">
                    Top Sources
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Best performing job sources
                  </p>
                </div>

                {sources.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart
                      data={sources}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(214.3 31.8% 91.4%)"
                        horizontal={false}
                      />
                      <XAxis
                        type="number"
                        tick={{ fontSize: 12, fill: "hsl(215.4 16.3% 46.9%)" }}
                        axisLine={{ stroke: "hsl(214.3 31.8% 91.4%)" }}
                      />
                      <YAxis
                        dataKey="source"
                        type="category"
                        tick={{ fontSize: 12, fill: "hsl(215.4 16.3% 46.9%)" }}
                        axisLine={{ stroke: "hsl(214.3 31.8% 91.4%)" }}
                        width={90}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(222.2 84% 4.9%)",
                          border: "1px solid hsl(217.2 91.2% 59.8%)",
                          borderRadius: "0.5rem",
                          color: "hsl(210 40% 98%)",
                        }}
                        formatter={(value: number) => `${value} jobs`}
                      />
                      <Bar
                        dataKey="count"
                        fill="hsl(217.2 91.2% 59.8%)"
                        radius={[0, 8, 8, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground text-sm py-12">
                    No source data available
                  </p>
                )}
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Row 4: Top Companies & Daily Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {companiesQuery.isLoading ? (
          <>
            <LoadingChart />
            <LoadingChart />
          </>
        ) : (
          <>
            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-sm text-foreground">
                    Top Companies
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Most applications sent
                  </p>
                </div>

                {companies.length > 0 ? (
                  <div className="space-y-3">
                    {companies.slice(0, 8).map((company) => (
                      <div
                        key={company.company}
                        className="flex items-center justify-between pb-3 border-b last:border-0"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">
                            {company.company}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {company.applications} applications ·{" "}
                            {(company.success_rate * 100).toFixed(0)}% success
                          </p>
                        </div>
                        <div className="text-sm font-semibold text-foreground">
                          {company.count}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground text-sm py-12">
                    No company data available
                  </p>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-sm text-foreground">
                    Daily Activity
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Jobs discovered and applications
                  </p>
                </div>

                {activityData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart
                      data={activityData}
                      margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(214.3 31.8% 91.4%)"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12, fill: "hsl(215.4 16.3% 46.9%)" }}
                        axisLine={{ stroke: "hsl(214.3 31.8% 91.4%)" }}
                        interval={Math.floor(activityData.length / 5)}
                      />
                      <YAxis
                        tick={{ fontSize: 12, fill: "hsl(215.4 16.3% 46.9%)" }}
                        axisLine={{ stroke: "hsl(214.3 31.8% 91.4%)" }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(222.2 84% 4.9%)",
                          border: "1px solid hsl(217.2 91.2% 59.8%)",
                          borderRadius: "0.5rem",
                          color: "hsl(210 40% 98%)",
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="jobs"
                        stroke="hsl(217.2 91.2% 59.8%)"
                        strokeWidth={2}
                        dot={false}
                        name="Jobs Discovered"
                      />
                      <Line
                        type="monotone"
                        dataKey="applications"
                        stroke="hsl(142.1 76.2% 36.3%)"
                        strokeWidth={2}
                        dot={false}
                        name="Applications"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground text-sm py-12">
                    No activity data available
                  </p>
                )}
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
