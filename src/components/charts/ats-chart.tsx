/**
 * ATS Distribution Donut Chart - Shows applications by ATS type
 * Author: Ahmed Adel Bakr Alderai
 */

"use client"

import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface ATSChartData {
  name: string
  value: number
  percentage: number
}

interface ATSChartProps {
  data: ATSChartData[]
  isLoading?: boolean
  className?: string
}

export function ATSChart({
  data,
  isLoading,
  className,
}: ATSChartProps) {
  // Define colors for ATS types
  const colors = [
    "hsl(217.2 91.2% 59.8%)",  // Blue
    "hsl(142.1 76.2% 36.3%)",  // Green
    "hsl(38.7 92.1% 50.2%)",   // Amber
    "hsl(0 84.2% 60.2%)",      // Red
    "hsl(280.9 93.1% 56.7%)",  // Purple
    "hsl(16.6 100% 50%)",      // Orange
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
          No ATS data available
        </p>
      </Card>
    )
  }

  const total = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <Card className={cn("p-6", className)}>
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-sm text-foreground">
            Applications by ATS
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Application tracking system distribution
          </p>
        </div>

        <ResponsiveContainer width="100%" height={250}>
          <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <Pie
              data={data}
              cx="40%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(222.2 84% 4.9%)",
                border: "1px solid hsl(217.2 91.2% 59.8%)",
                borderRadius: "0.5rem",
                color: "hsl(210 40% 98%)",
              }}
              formatter={(value) => [value as number, "Applications"]}
            />
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              formatter={(value, entry) => {
                const dataEntry = data.find((d) => d.name === value)
                const percentage = dataEntry
                  ? ((dataEntry.value / total) * 100).toFixed(0)
                  : 0
                return `${value} (${percentage}%)`
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="flex items-center justify-center gap-2 text-sm">
          <span className="text-muted-foreground">Total:</span>
          <span className="font-semibold text-foreground">{total} applications</span>
        </div>
      </div>
    </Card>
  )
}
