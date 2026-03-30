"use client";

/**
 * Employment Type Analysis Page - Full-time/Part-time/Contract detection insights
 * Author: Ahmed Adel Bakr Alderai
 */

import { motion } from "motion/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Briefcase,
  Clock,
  FileText,
  ArrowLeft,
  Loader2,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useEmploymentTypeDetect, useEmploymentTypeStats } from "@/hooks/use-employment-type";
import { toast } from "sonner";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 100, damping: 15 },
  },
};

const TYPE_COLORS: Record<string, { bg: string; text: string; iconBg: string }> = {
  "full-time": { bg: "bg-green-600", text: "text-green-600", iconBg: "bg-green-100 dark:bg-green-900/30" },
  fulltime: { bg: "bg-green-600", text: "text-green-600", iconBg: "bg-green-100 dark:bg-green-900/30" },
  "part-time": { bg: "bg-blue-600", text: "text-blue-600", iconBg: "bg-blue-100 dark:bg-blue-900/30" },
  parttime: { bg: "bg-blue-600", text: "text-blue-600", iconBg: "bg-blue-100 dark:bg-blue-900/30" },
  contract: { bg: "bg-amber-600", text: "text-amber-600", iconBg: "bg-amber-100 dark:bg-amber-900/30" },
  freelance: { bg: "bg-purple-600", text: "text-purple-600", iconBg: "bg-purple-100 dark:bg-purple-900/30" },
  internship: { bg: "bg-pink-600", text: "text-pink-600", iconBg: "bg-pink-100 dark:bg-pink-900/30" },
  temporary: { bg: "bg-orange-600", text: "text-orange-600", iconBg: "bg-orange-100 dark:bg-orange-900/30" },
  unknown: { bg: "bg-gray-500", text: "text-gray-600", iconBg: "bg-gray-100 dark:bg-gray-900/30" },
};

export default function EmploymentTypePage() {
  const { data: stats, isLoading } = useEmploymentTypeStats();
  const detectMutation = useEmploymentTypeDetect();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleDetect = () => {
    if (!title && !description) return;
    detectMutation.mutate({ title, description }, {
      onError: (error: Error) => {
        toast.error("Detection failed", { description: error.message });
      },
    });
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center gap-4">
        <Link href="/intelligence">
          <Button variant="ghost" size="icon" aria-label="Go back to intelligence hub">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-display font-bold tracking-tight">Employment Type Analysis</h1>
          <p className="text-muted-foreground">
            Detect and analyze employment types across job postings
          </p>
        </div>
      </div>

      {/* Detection Tool */}
      <Card className="card-glow bg-white/5 backdrop-blur-xl border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display text-lg">
            <Search className="w-5 h-5" />
            Detect Employment Type
          </CardTitle>
          <CardDescription>Paste a job title and description to detect employment arrangement</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Job Title (e.g. Contract DevOps Engineer)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            placeholder="Paste job description here..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />
          <div className="flex items-center gap-4">
            <Button onClick={handleDetect} disabled={detectMutation.isPending || (!title && !description)}>
              {detectMutation.isPending ? (
                <Loader2 className="w-4 h-4 me-2 animate-spin" />
              ) : (
                <Briefcase className="w-4 h-4 me-2" />
              )}
              Detect Type
            </Button>
            {detectMutation.data && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2"
              >
                <Badge className={`bg-gradient-to-r from-emerald-500/20 to-emerald-400/20 text-emerald-400`}>
                  {detectMutation.data.employment_type}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {Math.round((detectMutation.data.confidence ?? 0) * 100)}% confidence
                </span>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : stats ? (
        <motion.div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {[
            { type: "full-time", icon: Briefcase, bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-600", count: stats.breakdown["full-time"] ?? stats.breakdown["fulltime"] ?? 0 },
            { type: "part-time", icon: Clock, bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-600", count: stats.breakdown["part-time"] ?? stats.breakdown["parttime"] ?? 0 },
            { type: "contract", icon: FileText, bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-600", count: stats.breakdown["contract"] ?? 0 },
          ].map(({ type, icon: Icon, bg, text, count }) => {
            const bd = stats.breakdown;
            const total = Object.values(bd).reduce((sum, v) => sum + v, 0);
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <motion.div key={type} variants={itemVariants}>
                <Card className="card-glow bg-white/5 backdrop-blur-xl border-white/10">
                  <CardContent className="pt-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full ${bg} flex items-center justify-center`}>
                          <Icon className={`w-4 h-4 ${text}`} />
                        </div>
                        <span className="font-display font-medium capitalize">{type}</span>
                      </div>
                      <span className="text-2xl font-display font-bold">{count}</span>
                    </div>
                    <Progress value={pct} className="h-2" />
                    <p className="text-sm text-muted-foreground">{pct}% of analyzed jobs</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        <Card className="card-glow bg-white/5 backdrop-blur-xl border-white/10">
          <CardContent className="py-12 text-center text-muted-foreground">
            <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No employment type data available yet</p>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
