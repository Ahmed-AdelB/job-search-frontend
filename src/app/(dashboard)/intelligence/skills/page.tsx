/**
 * Skills Gap Analysis Page - Radar chart visualization and recommendations
 * Author: Ahmed Adel Bakr Alderai
 */

"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { CircularProgressbar, buildStyles } from "react-circular-progressbar"
import "react-circular-progressbar/dist/styles.css"
import { Badge } from "@/components/ui/badge"
import { useSkillGap, useSkillRecommendations } from "@/hooks/use-intelligence"
import { AlertCircle, BookOpen, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

export default function SkillsGapPage() {
  const [jobId, setJobId] = useState<number | undefined>()
  const [showJobInput, setShowJobInput] = useState(false)

  const skillGapMutation = useSkillGap()
  const { data: recommendationsData } = useSkillRecommendations()

  // Sample data for demo - in production, this would come from the API
  const demoSkillGapData = {
    required_skills: [
      { skill: "Python", importance: "critical" as const },
      { skill: "System Design", importance: "critical" as const },
      { skill: "AWS", importance: "preferred" as const },
      { skill: "Docker", importance: "preferred" as const },
      { skill: "Kubernetes", importance: "nice_to_have" as const },
      { skill: "Terraform", importance: "nice_to_have" as const },
    ],
    possessed_skills: ["Python", "AWS", "System Design"],
    missing_skills: [
      {
        skill: "Docker",
        importance: "preferred",
        recommendation: "Docker mastery course",
      },
      {
        skill: "Kubernetes",
        importance: "nice_to_have",
        recommendation: "Kubernetes fundamentals",
      },
      {
        skill: "Terraform",
        importance: "nice_to_have",
        recommendation: "Infrastructure as Code",
      },
    ],
    match_percentage: 75,
  }

  // Transform data for radar chart
  const radarData = demoSkillGapData.required_skills.map((skill) => ({
    skill: skill.skill,
    required: 100,
    possessed: demoSkillGapData.possessed_skills.includes(skill.skill) ? 100 : 0,
  }))

  const handleAnalyzeJob = async () => {
    if (jobId) {
      skillGapMutation.mutate({ job_id: jobId })
    }
  }

  const getBadgeVariant = (importance: string) => {
    switch (importance) {
      case "critical":
        return "destructive"
      case "preferred":
        return "secondary"
      case "nice_to_have":
      default:
        return "outline"
    }
  }

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case "critical":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
      case "preferred":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100"
      case "nice_to_have":
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100"
    }
  }

  return (
    <div className="space-y-8">
      {/* Header with back button */}
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
        <h1 className="text-3xl font-bold tracking-tight">Skills Gap Analysis</h1>
        <p className="text-muted-foreground">
          Visualize the gap between your skills and market demands. Get
          recommendations to bridge the gap.
        </p>
      </div>

      {/* Match Score Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Radar Chart */}
          <Card className="p-8">
            <h2 className="text-lg font-semibold mb-6">Skills Comparison</h2>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid
                    stroke="var(--color-border)"
                    className="dark:stroke-slate-700"
                  />
                  <PolarAngleAxis dataKey="skill" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar
                    name="Required"
                    dataKey="required"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.2}
                  />
                  <Radar
                    name="Possessed"
                    dataKey="possessed"
                    stroke="hsl(34 97% 53%)"
                    fill="hsl(34 97% 53%)"
                    fillOpacity={0.2}
                  />
                  <Legend />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--background)",
                      border: "1px solid var(--border)",
                      borderRadius: "0.5rem",
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Blue area shows required skills, orange shows your current proficiency.
            </p>
          </Card>

          {/* Missing Skills Section */}
          <Card className="p-8">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Missing Skills ({demoSkillGapData.missing_skills.length})
            </h2>

            <div className="space-y-4">
              {demoSkillGapData.missing_skills.map((skill) => (
                <div
                  key={skill.skill}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold">{skill.skill}</h3>
                      <p className="text-sm text-muted-foreground">
                        {skill.recommendation}
                      </p>
                    </div>
                    <Badge className={getImportanceColor(skill.importance)}>
                      {skill.importance.replace(/_/g, " ")}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Match Percentage */}
          <Card className="p-8 flex flex-col items-center text-center">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">
              Overall Match
            </h3>
            <div className="w-32 h-32 mb-4">
              <CircularProgressbar
                value={demoSkillGapData.match_percentage}
                text={`${demoSkillGapData.match_percentage}%`}
                styles={buildStyles({
                  rotation: 0.25,
                  strokeLinecap: "round",
                  textSize: "1.5rem",
                  pathTransitionDuration: 0.5,
                  pathColor: "hsl(var(--primary))",
                  textColor: "currentColor",
                  trailColor: "var(--muted)",
                  backgroundColor: "transparent",
                })}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              You possess {demoSkillGapData.match_percentage}% of required skills
            </p>
          </Card>

          {/* Analyze Against Job */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Analyze Against Job</h3>
            {!showJobInput ? (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowJobInput(true)}
              >
                Select a Job
              </Button>
            ) : (
              <div className="space-y-4">
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
                <Button
                  onClick={handleAnalyzeJob}
                  disabled={!jobId || skillGapMutation.isPending}
                  className="w-full"
                >
                  {skillGapMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    "Analyze"
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => setShowJobInput(false)}
                >
                  Cancel
                </Button>
              </div>
            )}
          </Card>

          {/* Summary Stats */}
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold mb-4">Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Possessed</span>
                <span className="font-semibold">
                  {demoSkillGapData.possessed_skills.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Required</span>
                <span className="font-semibold">
                  {demoSkillGapData.required_skills.length}
                </span>
              </div>
              <div className="flex justify-between border-t pt-3">
                <span className="text-muted-foreground">Gap</span>
                <span className="font-semibold">
                  {demoSkillGapData.missing_skills.length} skills
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Recommendations Section */}
      <Card className="p-8">
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-blue-500" />
          Learning Recommendations
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {demoSkillGapData.missing_skills
            .filter((s) => s.importance !== "nice_to_have")
            .map((skill) => (
              <Card key={skill.skill} className="p-6 border-l-4 border-l-blue-500">
                <h3 className="font-semibold mb-2">{skill.skill}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Learn {skill.skill} to improve your match percentage
                </p>
                <div className="space-y-2 mb-4">
                  <div className="text-sm">
                    <span className="font-medium">Course</span>
                    <p className="text-muted-foreground">
                      {skill.recommendation}
                    </p>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Duration</span>
                    <p className="text-muted-foreground">4-8 weeks</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  View Courses
                </Button>
              </Card>
            ))}
        </div>
      </Card>
    </div>
  )
}
