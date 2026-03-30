"use client";

/**
 * Work Mode Analysis Page - Remote/Hybrid/On-site detection insights
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
  Wifi,
  Building2,
  MapPin,
  ArrowLeft,
  Loader2,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useWorkModeDetect, useWorkModeStats } from "@/hooks/use-work-mode";
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

const WORK_MODE_COLORS: Record<string, { bg: string; text: string; iconBg: string }> = {
  remote: { bg: "bg-green-600", text: "text-green-600", iconBg: "bg-green-100 dark:bg-green-900/30" },
  hybrid: { bg: "bg-blue-600", text: "text-blue-600", iconBg: "bg-blue-100 dark:bg-blue-900/30" },
  "on-site": { bg: "bg-amber-600", text: "text-amber-600", iconBg: "bg-amber-100 dark:bg-amber-900/30" },
  onsite: { bg: "bg-amber-600", text: "text-amber-600", iconBg: "bg-amber-100 dark:bg-amber-900/30" },
  unknown: { bg: "bg-gray-500", text: "text-gray-600", iconBg: "bg-gray-100 dark:bg-gray-900/30" },
};

export default function WorkModePage() {
  const { data: stats, isLoading } = useWorkModeStats();
  const detectMutation = useWorkModeDetect();
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
          <h1 className="text-2xl font-bold tracking-tight">Work Mode Analysis</h1>
          <p className="text-muted-foreground">
            Detect and analyze remote, hybrid, and on-site work patterns
          </p>
        </div>
      </div>

      {/* Detection Tool */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Detect Work Mode
          </CardTitle>
          <CardDescription>Paste a job title and description to detect work arrangement</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Job Title (e.g. Senior Frontend Engineer)"
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
                <Wifi className="w-4 h-4 me-2" />
              )}
              Detect Work Mode
            </Button>
            {detectMutation.data && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2"
              >
                <Badge className={WORK_MODE_COLORS[detectMutation.data.work_mode]?.bg ?? "bg-gray-500"}>
                  {detectMutation.data.work_mode}
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
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : stats ? (
        <motion.div
          className="grid gap-4 sm:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {[
            { mode: "remote", icon: Wifi, bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-600", count: stats.remote_count ?? 0 },
            { mode: "hybrid", icon: Building2, bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-600", count: stats.hybrid_count ?? 0 },
            { mode: "on-site", icon: MapPin, bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-600", count: stats.onsite_count ?? 0 },
          ].map(({ mode, icon: Icon, bg, text, count }) => {
            const total = (stats.remote_count ?? 0) + (stats.hybrid_count ?? 0) + (stats.onsite_count ?? 0);
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <motion.div key={mode} variants={itemVariants}>
                <Card>
                  <CardContent className="pt-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full ${bg} flex items-center justify-center`}>
                          <Icon className={`w-4 h-4 ${text}`} />
                        </div>
                        <span className="font-medium capitalize">{mode}</span>
                      </div>
                      <span className="text-2xl font-bold">{count}</span>
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
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Wifi className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No work mode data available yet</p>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
