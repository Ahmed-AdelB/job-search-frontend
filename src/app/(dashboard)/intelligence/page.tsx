/**
 * Intelligence Hub - Main dashboard for AI-powered career insights
 * Author: Ahmed Adel Bakr Alderai
 */

"use client"

import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  TrendingUp,
  Globe,
  Wifi,
  Zap,
  ArrowRight,
} from "lucide-react"
import { useSalaryReport } from "@/hooks/use-intelligence"

export default function IntelligenceHubPage() {
  const { data: salaryData } = useSalaryReport()

  // Extract quick stats
  const marketValue = salaryData?.report?.market_median || 0
  const percentileRank = salaryData?.report?.percentile_rank || 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Zap className="h-8 w-8 text-amber-500" />
          <h1 className="text-4xl font-bold tracking-tight">
            Intelligence Hub
          </h1>
        </div>
        <p className="text-lg text-muted-foreground">
          AI-powered career insights. Analyze your market value, visa eligibility,
          skill gaps, and remote opportunities.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-blue-200 dark:border-blue-800">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Overall Match
            </p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {percentileRank || "—"}%
            </p>
            <p className="text-xs text-muted-foreground">
              Market percentile rank
            </p>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 border-emerald-200 dark:border-emerald-800">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Market Value
            </p>
            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              ${marketValue.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">
              Median salary estimate
            </p>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-purple-200 dark:border-purple-800">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Opportunities
            </p>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              4
            </p>
            <p className="text-xs text-muted-foreground">
              Intelligence modules
            </p>
          </div>
        </Card>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Skills Gap Card */}
        <Link href="/intelligence/skills">
          <Card className="h-full p-8 hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-blue-300 dark:hover:border-blue-600 group">
            <div className="space-y-4 h-full flex flex-col">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                  <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
              </div>

              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Skills Gap Analysis
                </h3>
                <p className="text-muted-foreground text-sm">
                  Analyze your skills against market demands. Get recommendations
                  for courses and certifications to bridge the gap.
                </p>
              </div>

              <div className="pt-4 flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm font-medium">
                Explore <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </Card>
        </Link>

        {/* Visa Eligibility Card */}
        <Link href="/intelligence/visa">
          <Card className="h-full p-8 hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-emerald-300 dark:hover:border-emerald-600 group">
            <div className="space-y-4 h-full flex flex-col">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900 rounded-lg group-hover:bg-emerald-200 dark:group-hover:bg-emerald-800 transition-colors">
                  <Globe className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
              </div>

              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Visa Eligibility
                </h3>
                <p className="text-muted-foreground text-sm">
                  Check sponsorship opportunities worldwide. Discover countries
                  where your occupation is in high demand.
                </p>
              </div>

              <div className="pt-4 flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                Explore <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </Card>
        </Link>

        {/* Salary Benchmark Card */}
        <Link href="/intelligence/salary">
          <Card className="h-full p-8 hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-cyan-300 dark:hover:border-cyan-600 group">
            <div className="space-y-4 h-full flex flex-col">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-cyan-100 dark:bg-cyan-900 rounded-lg group-hover:bg-cyan-200 dark:group-hover:bg-cyan-800 transition-colors">
                  <TrendingUp className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors" />
              </div>

              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                  Salary Benchmark
                </h3>
                <p className="text-muted-foreground text-sm">
                  Compare your value to market rates. View salary percentiles,
                  trends, and negotiation data by location and role.
                </p>
              </div>

              <div className="pt-4 flex items-center gap-2 text-cyan-600 dark:text-cyan-400 text-sm font-medium">
                Explore <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </Card>
        </Link>

        {/* Remote Flexibility Card */}
        <Link href="/intelligence/remote">
          <Card className="h-full p-8 hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-violet-300 dark:hover:border-violet-600 group">
            <div className="space-y-4 h-full flex flex-col">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-violet-100 dark:bg-violet-900 rounded-lg group-hover:bg-violet-200 dark:group-hover:bg-violet-800 transition-colors">
                  <Wifi className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors" />
              </div>

              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                  Remote Flexibility
                </h3>
                <p className="text-muted-foreground text-sm">
                  Score jobs by remote-friendliness. Find opportunities that match
                  your preferred work location and flexibility needs.
                </p>
              </div>

              <div className="pt-4 flex items-center gap-2 text-violet-600 dark:text-violet-400 text-sm font-medium">
                Explore <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* Bottom CTA Section */}
      <Card className="p-8 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 border-indigo-200 dark:border-indigo-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold mb-2">
              Ready to accelerate your job search?
            </h3>
            <p className="text-muted-foreground">
              Use intelligence insights to tailor your applications and stand out
              to recruiters.
            </p>
          </div>
          <Button
            size="lg"
            className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            Get Started
          </Button>
        </div>
      </Card>
    </div>
  )
}
