"use client";

/**
 * Skills Gap Analysis Page
 * Author: Ahmed Adel Bakr Alderai
 */

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Target,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingUp,
  BookOpen,
  Lightbulb,
} from "lucide-react";
import Link from "next/link";
import { apiGet } from "@/lib/api-client";
import type { SkillGapAnalysis } from "@/types/api";

const IMPORTANCE_CONFIG: Record<string, { color: string; badge: string }> = {
  critical: { color: "text-red-600", badge: "bg-red-600" },
  preferred: { color: "text-amber-600", badge: "bg-amber-500" },
  nice_to_have: { color: "text-blue-600", badge: "bg-blue-500" },
};

export default function SkillsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["intelligence", "skills-gap"],
    queryFn: () => apiGet<{ analysis: SkillGapAnalysis }>("/api/v1/skills-gap/analysis"),
    staleTime: 5 * 60 * 1000,
  });

  const analysis = data?.analysis;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/intelligence">
            <ArrowLeft className="w-4 h-4 me-1" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Skills Gap Analysis</h1>
          <p className="text-muted-foreground">
            Identify skill gaps and get improvement recommendations
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : !analysis ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No skills analysis available. Upload a resume and apply to some jobs first.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Match Score */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                <div className="relative w-24 h-24 shrink-0">
                  <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="8" fill="none" className="text-muted" />
                    <circle
                      cx="50" cy="50" r="42"
                      stroke="currentColor" strokeWidth="8" fill="none"
                      className={analysis.match_percentage >= 70 ? "text-green-600" : analysis.match_percentage >= 40 ? "text-amber-500" : "text-red-600"}
                      strokeDasharray={`${(analysis.match_percentage / 100) * 264} 264`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold">{analysis.match_percentage}%</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold">Overall Skills Match</h3>
                  <p className="text-sm text-muted-foreground">
                    Based on {analysis.required_skills.length} required skills from target jobs
                  </p>
                  <div className="flex gap-4 mt-2 text-sm">
                    <span className="flex items-center gap-1 text-green-600">
                      <CheckCircle2 className="w-4 h-4" />
                      {analysis.possessed_skills.length} possessed
                    </span>
                    <span className="flex items-center gap-1 text-red-600">
                      <XCircle className="w-4 h-4" />
                      {analysis.missing_skills.length} missing
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Possessed Skills */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                Skills You Have
              </CardTitle>
              <CardDescription>{analysis.possessed_skills.length} skills matched from your profile</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {analysis.possessed_skills.map((skill) => (
                  <Badge key={skill} variant="outline" className="border-green-300 text-green-700 dark:text-green-400">
                    <CheckCircle2 className="w-3 h-3 me-1" />
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Missing Skills */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Skills to Develop
              </CardTitle>
              <CardDescription>
                {analysis.missing_skills.length} skills needed for your target roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Skill</TableHead>
                      <TableHead>Importance</TableHead>
                      <TableHead>Recommendation</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analysis.missing_skills.map((skill) => {
                      const config = IMPORTANCE_CONFIG[skill.importance] ?? IMPORTANCE_CONFIG.preferred;
                      return (
                        <TableRow key={skill.skill}>
                          <TableCell className="font-medium">{skill.skill}</TableCell>
                          <TableCell>
                            <Badge className={config.badge}>{skill.importance.replace("_", " ")}</Badge>
                          </TableCell>
                          <TableCell className="text-sm max-w-[300px]">
                            {skill.recommendation ? (
                              <div className="flex items-start gap-1.5">
                                <Lightbulb className="w-3.5 h-3.5 mt-0.5 text-amber-500 shrink-0" />
                                <span>{skill.recommendation}</span>
                              </div>
                            ) : "\u2014"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Required Skills Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Required Skills Breakdown
              </CardTitle>
              <CardDescription>All skills required by your target jobs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {analysis.required_skills.map((req) => {
                const possessed = analysis.possessed_skills.includes(req.skill);
                return (
                  <div key={req.skill} className="flex items-center gap-3">
                    {possessed ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{req.skill}</span>
                        <Badge variant="outline" className="text-xs capitalize">
                          {req.importance.replace("_", " ")}
                        </Badge>
                      </div>
                      <Progress
                        value={possessed ? 100 : 0}
                        className="h-1.5 mt-1"
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
