"use client";

/**
 * Intelligence Hub - AI-powered insights dashboard
 * Author: Ahmed Adel Bakr Alderai
 */

import { motion } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Brain,
  Target,
  Globe2,
  DollarSign,
  Wifi,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Briefcase,
  Building2,
} from "lucide-react";
import { apiGet } from "@/lib/api-client";
import type { SkillGapAnalysis, VisaScore, SalaryBenchmark, RemoteScore } from "@/types/api";
import Link from "next/link";

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

export default function IntelligencePage() {
  const { data: skillGap, isLoading: skillLoading } = useQuery({
    queryKey: ["intelligence", "skills-gap"],
    queryFn: () => apiGet<SkillGapAnalysis>("/api/skills-gap/analysis"),
    staleTime: 1000 * 60 * 5,
  });

  const { data: visa, isLoading: visaLoading } = useQuery({
    queryKey: ["intelligence", "visa"],
    queryFn: () => apiGet<VisaScore>("/api/visa/score"),
    staleTime: 1000 * 60 * 5,
  });

  const { data: salary, isLoading: salaryLoading } = useQuery({
    queryKey: ["intelligence", "salary"],
    queryFn: () => apiGet<SalaryBenchmark>("/api/salary/benchmark"),
    staleTime: 1000 * 60 * 5,
  });

  const { data: remote, isLoading: remoteLoading } = useQuery({
    queryKey: ["intelligence", "remote"],
    queryFn: () => apiGet<RemoteScore>("/api/remote-scoring/score"),
    staleTime: 1000 * 60 * 5,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold tracking-tight">Intelligence Hub</h1>
        <p className="text-muted-foreground">
          AI-powered insights to optimize your job search strategy
        </p>
      </div>

      {/* Quick Stats Row */}
      <motion.div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <IntelCard
            title="Skills Match"
            icon={Target}
            loading={skillLoading}
            value={skillGap ? `${skillGap.match_percentage}%` : undefined}
            description={
              skillGap
                ? `${skillGap.missing_skills.length} skills to develop`
                : "Analyzing your profile..."
            }
            color="blue"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <IntelCard
            title="Visa Eligibility"
            icon={Globe2}
            loading={visaLoading}
            value={visa ? `${visa.eligibility_score}%` : undefined}
            description={
              visa
                ? `${visa.eligible_countries.length} eligible countries`
                : "Checking eligibility..."
            }
            color="emerald"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <IntelCard
            title="Salary Benchmark"
            icon={DollarSign}
            loading={salaryLoading}
            value={
              salary
                ? `${salary.currency} ${salary.percentile_50.toLocaleString()}`
                : undefined
            }
            description={salary ? `Median for ${salary.title}` : "Calculating..."}
            color="amber"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <IntelCard
            title="Remote Score"
            icon={Wifi}
            loading={remoteLoading}
            value={remote ? `${remote.remote_score}/100` : undefined}
            description={
              remote ? `${remote.remote_type} fit` : "Evaluating..."
            }
            color="purple"
          />
        </motion.div>
      </motion.div>

      {/* Skills Gap Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring" as const, stiffness: 100, damping: 15, delay: 0.2 }}
      >
        <Card className="card-glow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 font-display text-lg">
                  <Target className="w-5 h-5 text-blue-600" />
                  Skills Gap Analysis
                </CardTitle>
                <CardDescription>
                  Compare your skills against market requirements
                </CardDescription>
              </div>
              <Link href="/intelligence/skills">
                <Button variant="outline" size="sm">
                  Details <ArrowRight className="w-4 h-4 ms-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {skillLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : skillGap ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-muted-foreground w-24">
                    Match Score
                  </span>
                  <Progress value={skillGap.match_percentage} className="flex-1 h-3" />
                  <span className="text-sm font-display font-bold w-12 text-end">
                    {skillGap.match_percentage}%
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      Your Skills ({skillGap.possessed_skills.length})
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {skillGap.possessed_skills.slice(0, 10).map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs bg-gradient-to-r from-emerald-500/20 to-emerald-400/20 text-emerald-400">
                          {skill}
                        </Badge>
                      ))}
                      {skillGap.possessed_skills.length > 10 && (
                        <Badge variant="outline" className="text-xs bg-gradient-to-r from-slate-500/20 to-slate-400/20">
                          +{skillGap.possessed_skills.length - 10} more
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      Missing Skills ({skillGap.missing_skills.length})
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {skillGap.missing_skills.slice(0, 8).map((gap) => (
                        <Badge
                          key={gap.skill}
                          variant="outline"
                          className={`text-xs ${
                            gap.importance === "critical"
                              ? "bg-gradient-to-r from-red-500/20 to-red-400/20 text-red-400 border-red-500/30"
                              : gap.importance === "preferred"
                              ? "bg-gradient-to-r from-amber-500/20 to-amber-400/20 text-amber-400 border-amber-500/30"
                              : "bg-gradient-to-r from-slate-500/20 to-slate-400/20"
                          }`}
                        >
                          {gap.skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState icon={Target} message="Upload your resume to see skills analysis" />
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Salary + Visa Row */}
      <motion.div
        className="grid gap-6 lg:grid-cols-2"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Salary Benchmark */}
        <motion.div variants={itemVariants}>
          <Card className="card-glow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 font-display text-lg">
                    <DollarSign className="w-5 h-5 text-amber-600" />
                    Salary Benchmark
                  </CardTitle>
                  <CardDescription>Market salary ranges for your role</CardDescription>
                </div>
                <Link href="/intelligence/salary">
                  <Button variant="outline" size="sm">
                    Details <ArrowRight className="w-4 h-4 ms-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {salaryLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                  ))}
                </div>
              ) : salary ? (
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground mb-2">
                    {salary.title} in {salary.location} ({salary.sample_size} data points)
                  </div>
                  {[
                    { label: "25th Percentile", value: salary.percentile_25, pct: 25 },
                    { label: "Median (50th)", value: salary.percentile_50, pct: 50 },
                    { label: "75th Percentile", value: salary.percentile_75, pct: 75 },
                    { label: "90th Percentile", value: salary.percentile_90, pct: 90 },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground w-32 shrink-0">
                        {row.label}
                      </span>
                      <Progress value={row.pct} className="flex-1 h-2" />
                      <span className="text-sm font-display font-medium w-28 text-end">
                        {salary.currency} {row.value.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState icon={DollarSign} message="Set your target role to see salary data" />
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Visa Eligibility */}
        <motion.div variants={itemVariants}>
          <Card className="card-glow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 font-display text-lg">
                    <Globe2 className="w-5 h-5 text-emerald-600" />
                    Visa Eligibility
                  </CardTitle>
                  <CardDescription>Sponsorship likelihood by country</CardDescription>
                </div>
                <Link href="/intelligence/visa">
                  <Button variant="outline" size="sm">
                    Details <ArrowRight className="w-4 h-4 ms-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {visaLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                  ))}
                </div>
              ) : visa ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">Occupation:</span>
                    <Badge variant="secondary" className="bg-gradient-to-r from-blue-500/20 to-blue-400/20 text-blue-400">{visa.occupation}</Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">Likelihood:</span>
                    <Badge
                      className={`bg-gradient-to-r ${
                        visa.sponsorship_likelihood === "high"
                          ? "from-emerald-500/20 to-emerald-400/20 text-emerald-400"
                          : visa.sponsorship_likelihood === "medium"
                          ? "from-amber-500/20 to-amber-400/20 text-amber-400"
                          : "from-slate-500/20 to-slate-400/20 text-slate-400"
                      }`}
                    >
                      {visa.sponsorship_likelihood.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">Score:</span>
                    <Progress value={visa.eligibility_score} className="flex-1 h-3" />
                    <span className="text-sm font-display font-bold">{visa.eligibility_score}%</span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Eligible Countries:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {visa.eligible_countries.map((country) => (
                        <Badge key={country} variant="outline" className="text-xs">
                          {country}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{visa.details}</p>
                </div>
              ) : (
                <EmptyState icon={Globe2} message="Complete your profile for visa analysis" />
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Remote Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring" as const, stiffness: 100, damping: 15, delay: 0.3 }}
      >
        <Card className="card-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display text-lg">
              <Wifi className="w-5 h-5 text-purple-600" />
              Remote Work Compatibility
            </CardTitle>
            <CardDescription>
              How well your profile matches remote positions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {remoteLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : remote ? (
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-4xl font-display font-bold">{remote.remote_score}</div>
                  <div className="text-sm text-muted-foreground">out of 100</div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      className={
                        remote.remote_type === "remote"
                          ? "bg-green-600"
                          : remote.remote_type === "hybrid"
                          ? "bg-blue-600"
                          : "bg-gray-600"
                      }
                    >
                      {remote.remote_type}
                    </Badge>
                    <span className="text-sm text-muted-foreground">best fit</span>
                  </div>
                  <Progress value={remote.remote_score} className="h-3 mb-2" />
                  <p className="text-sm text-muted-foreground">{remote.reasoning}</p>
                </div>
              </div>
            ) : (
              <EmptyState icon={Wifi} message="Complete your profile for remote compatibility scoring" />
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Work Mode & Employment Type Links */}
      <motion.div
        className="grid gap-6 lg:grid-cols-2"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <Card className="card-glow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 font-display text-lg">
                    <Building2 className="w-5 h-5 text-indigo-600" />
                    Work Mode Analysis
                  </CardTitle>
                  <CardDescription>
                    Detect remote, hybrid, and on-site patterns across jobs
                  </CardDescription>
                </div>
                <Link href="/intelligence/work-mode">
                  <Button variant="outline" size="sm">
                    Analyze <ArrowRight className="w-4 h-4 ms-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card className="card-glow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 font-display text-lg">
                    <Briefcase className="w-5 h-5 text-teal-600" />
                    Employment Type
                  </CardTitle>
                  <CardDescription>
                    Detect full-time, part-time, contract, and freelance patterns
                  </CardDescription>
                </div>
                <Link href="/intelligence/employment-type">
                  <Button variant="outline" size="sm">
                    Analyze <ArrowRight className="w-4 h-4 ms-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}

function IntelCard({
  title,
  icon: Icon,
  loading,
  value,
  description,
  color,
}: {
  title: string;
  icon: React.ElementType;
  loading: boolean;
  value?: string;
  description: string;
  color: "blue" | "emerald" | "amber" | "purple";
}) {
  const bgColor = {
    blue: "bg-blue-100 dark:bg-blue-900/30",
    emerald: "bg-emerald-100 dark:bg-emerald-900/30",
    amber: "bg-amber-100 dark:bg-amber-900/30",
    purple: "bg-purple-100 dark:bg-purple-900/30",
  }[color];

  const textColor = {
    blue: "text-blue-600 dark:text-blue-400",
    emerald: "text-emerald-600 dark:text-emerald-400",
    amber: "text-amber-600 dark:text-amber-400",
    purple: "text-purple-600 dark:text-purple-400",
  }[color];

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring" as const, stiffness: 300, damping: 30 }}
    >
      <Card className="card-glow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              {loading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <p className="text-2xl font-display font-bold">{value ?? "—"}</p>
              )}
            </div>
            <div className={`w-10 h-10 rounded-full ${bgColor} flex items-center justify-center`}>
              <Icon className={`w-5 h-5 ${textColor}`} />
            </div>
          </div>
          {loading ? (
            <Skeleton className="h-4 w-32 mt-2" />
          ) : (
            <p className="text-xs text-muted-foreground mt-2">{description}</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function EmptyState({ icon: Icon, message }: { icon: React.ElementType; message: string }) {
  return (
    <div className="text-center py-8 text-muted-foreground">
      <Icon className="w-10 h-10 mx-auto mb-3 opacity-50" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
