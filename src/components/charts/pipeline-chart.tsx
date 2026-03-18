/**
 * Pipeline Funnel Chart - Shows job conversion funnel
 * Author: Ahmed Adel Bakr Alderai
 */

"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface PipelineChartData {
  stage: string
  count: number
}

interface PipelineChartProps {
  data: PipelineChartData[]
  isLoading?: boolean
  className?: string
}

export function PipelineChart({
  data,
  isLoading,
  className,
}: PipelineChartProps) {
  // Define gradient colors from blue to green
  const colors = [
    "hsl(217.2 91.2% 59.8%)", // Primary blue
    "hsl(210 40% 96.1%)",      // Lighter blue
    "hsl(142.1 76.2% 36.3%)",  // Green
    "hsl(142.1 70.6% 45.3%)",  // Darker green
    "hsl(141.7 58.8% 30.1%)",  // Dark green
  ]

  if (isLoading) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="h-64 bg-muted animate-pulse rounded" />
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card className={cn("p-6", className)}>
        <p className="text-center text-muted-foreground text-sm py-12">
          No pipeline data available
        </p>
      </Card>
    )
  }

  return (
    <Card className={cn("p-6", className)}>
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-sm text-foreground">
            Application Funnel
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Job conversion stages
          </p>
        </div>

        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
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
              cursor={{ fill: "rgba(59, 130, 246, 0.1)" }}
            />
            <Bar
              dataKey="count"
              fill="hsl(217.2 91.2% 59.8%)"
              radius={[8, 8, 0, 0]}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
