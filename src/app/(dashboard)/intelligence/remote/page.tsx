/**
 * Remote Flexibility Page - Remote work scoring and analysis
 * Author: Ahmed Adel Bakr Alderai
 */

"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useRemoteScore } from "@/hooks/use-intelligence"
import { ArrowLeft, Wifi, AlertCircle, CheckCircle, MapPin } from "lucide-react"
import Link from "next/link"
import { CircularProgressbar, buildStyles } from "react-circular-progressbar"
import "react-circular-progressbar/dist/styles.css"

// Sample remote work distribution data
const remoteDistribution = [
  { name: "Fully Remote", value: 35, color: "#10b981" },
  { name: "Hybrid", value: 45, color: "#f59e0b" },
  { name: "On-site", value: 20, color: "#ef4444" },
]

// Remote score factors
const remoteScores = [
  { factor: "Explicit Policy", score: 95 },
  { factor: "Async-friendly", score: 78 },
  { factor: "Timezone Flexible", score: 65 },
  { factor: "Tools & Setup", score: 88 },
  { factor: "Company Culture", score: 72 },
]

// Sample recent jobs with remote scores
const recentJobs = [
  {
    id: 1,
    title: "Senior Software Engineer",
    company: "TechCorp",
    remote_score: 92,
    remote_type: "fully_remote",
    location: "Remote",
  },
  {
    id: 2,
    title: "Product Manager",
    company: "StartupCo",
    remote_score: 78,
    remote_type: "hybrid",
    location: "San Francisco, CA",
  },
  {
    id: 3,
    title: "DevOps Engineer",
    company: "CloudInc",
    remote_score: 85,
    remote_type: "hybrid",
    location: "Austin, TX",
  },
  {
    id: 4,
    title: "UX Designer",
    company: "DesignStudio",
    remote_score: 45,
    remote_type: "onsite",
    location: "New York, NY",
  },
  {
    id: 5,
    title: "Data Scientist",
    company: "Analytics Corp",
    remote_score: 88,
    remote_type: "fully_remote",
    location: "Remote",
  },
]

export default function RemoteFlexibilityPage() {
  const [jobId, setJobId] = useState<number | undefined>()
  const [showJobInput, setShowJobInput] = useState(false)

  const remoteScoreMutation = useRemoteScore()

  const handleScoreJob = async () => {
    if (jobId) {
      remoteScoreMutation.mutate({ job_id: jobId })
    }
  }

  const getRemoteTypeColor = (type: string) => {
    switch (type) {
      case "fully_remote":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100"
      case "hybrid":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100"
      case "onsite":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100"
    }
  }

  const getRemoteTypeLabel = (type: string) => {
    switch (type) {
      case "fully_remote":
        return "Fully Remote"
      case "hybrid":
        return "Hybrid"
      case "onsite":
        return "On-site"
      default:
        return type
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 dark:text-emerald-400"
    if (score >= 60) return "text-amber-600 dark:text-amber-400"
    return "text-red-600 dark:text-red-400"
  }

  const barChartData = remoteScores.map((item) => ({
    ...item,
    unscore: 100 - item.score,
  }))

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/intelligence">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Hub
          </Button>
        </Link>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Remote Flexibility Score
        </h1>
        <p className="text-muted-foreground">
          Analyze job opportunities by remote-friendliness. Discover which
          companies and roles offer the flexibility you need.
        </p>
      </div>

      {/* Market Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Distribution Chart */}
        <Card className="p-8 lg:col-span-2">
          <h2 className="text-lg font-semibold mb-6">Market Distribution</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={remoteDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {remoteDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Distribution of job opportunities by work arrangement
          </p>
        </Card>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          <Card className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 border-emerald-200 dark:border-emerald-800">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  Fully Remote Jobs
                </p>
                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  35%
                </p>
              </div>
              <div className="pt-4 border-t border-emerald-200 dark:border-emerald-800">
                <p className="text-xs text-muted-foreground">
                  Of analyzed opportunities offer full remote work
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 border-amber-200 dark:border-amber-800">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Hybrid Jobs</p>
                <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                  45%
                </p>
              </div>
              <div className="pt-4 border-t border-amber-200 dark:border-amber-800">
                <p className="text-xs text-muted-foreground">
                  Allow mix of remote and office work
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Remote Score Factors */}
      <Card className="p-8">
        <h2 className="text-lg font-semibold mb-6">Remote Friendliness Factors</h2>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barChartData} layout="vertical">
              <CartesianGrid
                stroke="var(--color-border)"
                className="dark:stroke-slate-700"
              />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis dataKey="factor" type="category" width={130} />
              <Tooltip
                formatter={(value) => `${value}%`}
                contentStyle={{
                  backgroundColor: "var(--background)",
                  border: "1px solid var(--border)",
                  borderRadius: "0.5rem",
                }}
              />
              <Bar dataKey="score" fill="hsl(var(--primary))" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            These factors are evaluated when analyzing a job's remote-friendliness
            score. Companies with explicit remote policies, async-friendly
            practices, and good remote tools score higher.
          </p>
        </div>
      </Card>

      {/* Score a Job Section */}
      <Card className="p-8">
        <h2 className="text-lg font-semibold mb-6">Score a Specific Job</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {!showJobInput ? (
            <Button
              variant="outline"
              onClick={() => setShowJobInput(true)}
              className="w-full"
            >
              Select a Job
            </Button>
          ) : (
            <>
              <div>
                <Label htmlFor="job-id" className="text-sm">
                  Job ID
                </Label>
                <Input
                  id="job-id"
                  type="number"
                  placeholder="Enter job ID"
                  value={jobId || ""}
                  onChange={(e) =>
                    setJobId(e.target.value ? parseInt(e.target.value) : undefined)
                  }
                  className="mt-1"
                />
              </div>
              <div className="flex items-end gap-2">
                <Button
                  onClick={handleScoreJob}
                  disabled={!jobId || remoteScoreMutation.isPending}
                  className="flex-1"
                >
                  Score Job
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setShowJobInput(false)}
                >
                  Cancel
                </Button>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Recent Jobs Analysis */}
      <Card className="p-8">
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <Wifi className="h-5 w-5 text-violet-500" />
          Recent Jobs Analyzed
        </h2>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job Title</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Work Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-right">Remote Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentJobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-medium">{job.title}</TableCell>
                  <TableCell>{job.company}</TableCell>
                  <TableCell>
                    <Badge
                      className={getRemoteTypeColor(job.remote_type)}
                    >
                      {getRemoteTypeLabel(job.remote_type)}
                    </Badge>
                  </TableCell>
                  <TableCell className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    {job.location}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={`font-semibold ${getScoreColor(job.remote_score)}`}>
                      {job.remote_score}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Remote Work Considerations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Advantages */}
        <Card className="p-8">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-500" />
            Fully Remote Benefits
          </h3>
          <ul className="space-y-2">
            {[
              "Work from anywhere in the world",
              "No commute - save time and money",
              "Better work-life balance",
              "Increased productivity",
              "Access to global job market",
            ].map((benefit, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Considerations */}
        <Card className="p-8">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            Considerations
          </h3>
          <ul className="space-y-2">
            {[
              "Self-discipline and motivation required",
              "Timezone differences for team collaboration",
              "Home office setup costs",
              "May miss in-person networking",
              "Communication needs to be explicit",
            ].map((consideration, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <span>{consideration}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Info Section */}
      <Card className="p-8 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <div className="flex gap-4">
          <AlertCircle className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h3 className="font-semibold">About Remote Flexibility Scoring</h3>
            <p className="text-sm text-muted-foreground">
              This scoring analyzes job postings, company policies, and team
              structure to estimate remote-friendliness. A high score doesn't
              guarantee flexibility, but indicates better opportunities for
              remote work. Always clarify expectations during interviews.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
