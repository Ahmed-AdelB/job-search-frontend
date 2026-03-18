/**
 * Success Rate Line Chart - Shows daily success rate over time
 * Author: Ahmed Adel Bakr Alderai
 */

"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface SuccessChartData {
  date: string
  rate: number
  count: number
}

interface SuccessChartProps {
  data: SuccessChartData[]
  isLoading?: boolean
  className?: string
}

export function SuccessChart({
  data,
  isLoading,
  className,
}: SuccessChartProps) {
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
          No success rate data available
        </p>
      </Card>
    )
  }

  // Format data with percentage
  const formattedData = data.map((d) => ({
    ...d,
    displayDate: new Date(d.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }))

  return (
    <Card className={cn("p-6", className)}>
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-sm text-foreground">
            Success Rate Trend
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            30-day application success rate
          </p>
        </div>

        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={formattedData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(214.3 31.8% 91.4%)"
              vertical={false}
            />
            <XAxis
              dataKey="displayDate"
              tick={{ fontSize: 12, fill: "hsl(215.4 16.3% 46.9%)" }}
              axisLine={{ stroke: "hsl(214.3 31.8% 91.4%)" }}
              interval={Math.floor(formattedData.length / 5)}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "hsl(215.4 16.3% 46.9%)" }}
              axisLine={{ stroke: "hsl(214.3 31.8% 91.4%)" }}
              label={{ value: "Success %", angle: -90, position: "insideLeft" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(222.2 84% 4.9%)",
                border: "1px solid hsl(217.2 91.2% 59.8%)",
                borderRadius: "0.5rem",
                color: "hsl(210 40% 98%)",
              }}
              formatter={(value: number) => [
                `${value.toFixed(1)}%`,
                "Success Rate",
              ]}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Line
              type="monotone"
              dataKey="rate"
              stroke="hsl(217.2 91.2% 59.8%)"
              strokeWidth={2}
              dot={{ fill: "hsl(217.2 91.2% 59.8%)", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
