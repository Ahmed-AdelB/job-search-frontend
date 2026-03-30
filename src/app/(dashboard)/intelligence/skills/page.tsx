"use client";

/**
 * Skills Gap Analysis Page
 * Author: Ahmed Adel Bakr Alderai
 */

import { motion } from "motion/react";
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    },
  },
} as any;

export default function SkillsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["intelligence", "skills-gap"],
    queryFn: () => apiGet<{ analysis: SkillGapAnalysis }>("/api/skills-gap/analysis"),
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
          <h1 className="text-2xl font-display font-bold tracking-tight">Skills Gap Analysis</h1>
          <p className="text-muted-foreground">
            Identify skill gaps and get improvement recommendations
          </p>
        </div>
      </div>

      {isLoading ? (
        <motion.div
          className="space-y-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <motion.div key={i} variants={itemVariants}>
              <Skeleton className="h-32 w-full" />
            </motion.div>
          ))}
        </motion.div>
      ) : !analysis ? (
        <Card className="card-glow">
          <CardContent className="p-12 text-center text-muted-foreground">
            <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No skills analysis available. Upload a resume and apply to some jobs first.</p>
          </CardContent>
        </Card>
      ) : (
        <motion.div
          className="space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Match Score */}
          <motion.div variants={itemVariants}>
            <Card className="card-glow">
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
                      <span className="text-xl font-display font-bold">{analysis.match_percentage}%</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-display font-bold">Overall Skills Match</h3>
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
          </motion.div>

          {/* Possessed Skills */}
          <motion.div variants={itemVariants}>
            <Card className="card-glow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-display text-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  Skills You Have
                </CardTitle>
                <CardDescription>{analysis.possessed_skills.length} skills matched from your profile</CardDescription>
              </CardHeader>
              <CardContent>
                <motion.div
                  className="flex flex-wrap gap-2"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {analysis.possessed_skills.map((skill) => (
                    <motion.div
                      key={skill}
                      variants={itemVariants}
                      whileHover={{ scale: 1.08 }}
                      transition={{ type: "spring" as const, stiffness: 300, damping: 30 }}
                    >
                      <Badge variant="outline" className="bg-gradient-to-r from-emerald-500/20 to-emerald-400/20 text-emerald-400 border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3 me-1" />
                        {skill}
                      </Badge>
                    </motion.div>
                  ))}
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Missing Skills */}
          <motion.div variants={itemVariants}>
            <Card className="card-glow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-display text-lg">
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
                      <TableRow className="table-row-hover">
                        <TableHead>Skill</TableHead>
                        <TableHead>Importance</TableHead>
                        <TableHead>Recommendation</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analysis.missing_skills.map((skill) => {
                        const config = IMPORTANCE_CONFIG[skill.importance] ?? IMPORTANCE_CONFIG.preferred;
                        return (
                          <motion.tr
                            key={skill.skill}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ type: "spring" as const, stiffness: 100, damping: 15 }}
                            whileHover={{ backgroundColor: "var(--muted)" }}
                          >
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
                          </motion.tr>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Required Skills Breakdown */}
          <motion.div variants={itemVariants}>
            <Card className="card-glow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-display text-lg">
                  <BookOpen className="w-5 h-5" />
                  Required Skills Breakdown
                </CardTitle>
                <CardDescription>All skills required by your target jobs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {analysis.required_skills.map((req) => {
                  const possessed = analysis.possessed_skills.includes(req.skill);
                  return (
                    <motion.div
                      key={req.skill}
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ type: "spring" as const, stiffness: 100, damping: 15 }}
                      whileHover={{ x: 5 }}
                    >
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
                    </motion.div>
                  );
                })}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
