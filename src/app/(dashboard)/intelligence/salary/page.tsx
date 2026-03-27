"use client";

/**
 * Salary Benchmark Page
 * Author: Ahmed Adel Bakr Alderai
 */

import { motion } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
  DollarSign,
  TrendingUp,
  BarChart3,
  MapPin,
  Users,
} from "lucide-react";
import Link from "next/link";
import { apiGet } from "@/lib/api-client";
import type { SalaryBenchmark } from "@/types/api";

function formatSalary(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

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

export default function SalaryPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["intelligence", "salary"],
    queryFn: () => apiGet<{ benchmarks: SalaryBenchmark[] }>("/api/salary/benchmarks"),
    staleTime: 5 * 60 * 1000,
  });

  const benchmarks = data?.benchmarks ?? [];

  const avgMedian = benchmarks.length > 0
    ? Math.round(benchmarks.reduce((sum, b) => sum + b.percentile_50, 0) / benchmarks.length)
    : 0;
  const topP90 = benchmarks.length > 0
    ? Math.max(...benchmarks.map((b) => b.percentile_90))
    : 0;
  const totalSamples = benchmarks.reduce((sum, b) => sum + b.sample_size, 0);
  const topCurrency = benchmarks[0]?.currency ?? "USD";

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
          <h1 className="text-2xl font-bold tracking-tight">Salary Benchmarks</h1>
          <p className="text-muted-foreground">
            Salary data and compensation analysis for your target roles
          </p>
        </div>
      </div>

      {/* Summary */}
      <motion.div
        className="grid gap-4 sm:grid-cols-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Median Salary</p>
                  <p className="text-2xl font-bold">{formatSalary(avgMedian, topCurrency)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-muted-foreground opacity-50" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Top P90</p>
                  <p className="text-2xl font-bold text-green-600">{formatSalary(topP90, topCurrency)}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Data Points</p>
                  <p className="text-2xl font-bold">{totalSamples.toLocaleString()}</p>
                </div>
                <Users className="w-8 h-8 text-muted-foreground opacity-50" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Salary Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Salary Benchmarks by Role
          </CardTitle>
          <CardDescription>{benchmarks.length} roles analyzed</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : benchmarks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No salary data available yet. Apply to jobs to build salary benchmarks.</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-end">P25</TableHead>
                    <TableHead className="text-end">Median</TableHead>
                    <TableHead className="text-end">P75</TableHead>
                    <TableHead className="text-end">P90</TableHead>
                    <TableHead>Range</TableHead>
                    <TableHead className="text-end">Samples</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {benchmarks.map((b, idx) => {
                    const range = b.percentile_90 - b.percentile_25;
                    const medianPct = range > 0 ? ((b.percentile_50 - b.percentile_25) / range) * 100 : 50;
                    return (
                      <motion.tr
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ type: "spring" as const, stiffness: 100, damping: 15, delay: idx * 0.05 }}
                        whileHover={{
                          backgroundColor: "var(--muted)",
                          scale: 1.01,
                        }}
                      >
                        <TableCell className="font-medium">{b.title}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                            {b.location}
                          </div>
                        </TableCell>
                        <TableCell className="text-end text-sm font-mono">
                          {formatSalary(b.percentile_25, b.currency)}
                        </TableCell>
                        <TableCell className="text-end text-sm font-mono font-bold">
                          {formatSalary(b.percentile_50, b.currency)}
                        </TableCell>
                        <TableCell className="text-end text-sm font-mono">
                          {formatSalary(b.percentile_75, b.currency)}
                        </TableCell>
                        <TableCell className="text-end text-sm font-mono text-green-600">
                          {formatSalary(b.percentile_90, b.currency)}
                        </TableCell>
                        <TableCell>
                          <motion.div
                            className="w-32"
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring" as const, stiffness: 300, damping: 30 }}
                          >
                            <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                              <div
                                className="absolute h-full bg-gradient-to-r from-blue-200 via-blue-500 to-green-500 rounded-full"
                                style={{ left: "0%", right: "0%" }}
                              />
                              <motion.div
                                className="absolute w-1.5 h-full bg-primary rounded-full"
                                style={{ left: `${medianPct}%` }}
                                whileHover={{ scaleY: 1.5 }}
                                transition={{ type: "spring" as const, stiffness: 300, damping: 30 }}
                              />
                            </div>
                            <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                              <span>{(b.percentile_25 / 1000).toFixed(0)}k</span>
                              <span>{(b.percentile_90 / 1000).toFixed(0)}k</span>
                            </div>
                          </motion.div>
                        </TableCell>
                        <TableCell className="text-end text-sm text-muted-foreground">
                          {b.sample_size.toLocaleString()}
                        </TableCell>
                      </motion.tr>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
