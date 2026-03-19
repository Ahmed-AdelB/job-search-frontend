"use client";

/**
 * Deploy Page - Deployment management and status
 * Author: Ahmed Adel Bakr Alderai
 */

import { motion } from "motion/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Rocket,
  RefreshCw,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Server,
  Loader2,
  Activity,
} from "lucide-react";
import { apiGet, apiPost } from "@/lib/api-client";
import type { DeployStatus } from "@/types/api";

const STATUS_BADGE: Record<string, { color: string; icon: React.ElementType }> = {
  running: { color: "bg-green-600", icon: CheckCircle2 },
  deploying: { color: "bg-blue-600", icon: Loader2 },
  failed: { color: "bg-red-600", icon: XCircle },
  stopped: { color: "bg-gray-500", icon: Clock },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
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

const pulseVariants = {
  pulse: {
    scale: [1, 1.05, 1],
    boxShadow: [
      "0 0 0 0 rgba(34, 197, 94, 0.7)",
      "0 0 0 10px rgba(34, 197, 94, 0)",
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
    },
  },
} as any;

export default function DeployPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["deploy", "status"],
    queryFn: () => apiGet<DeployStatus>("/api/v1/deploy/status"),
    refetchInterval: 10000,
  });

  const rebuildMutation = useMutation({
    mutationFn: () => apiPost<{ status: string }>("/api/v1/deploy/rebuild", {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["deploy"] }),
  });

  const rollbackMutation = useMutation({
    mutationFn: () => apiPost<{ status: string }>("/api/v1/deploy/rollback", {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["deploy"] }),
  });

  const statusConfig = data ? STATUS_BADGE[data.status] ?? STATUS_BADGE.stopped : null;

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Deploy</h1>
        <p className="text-muted-foreground">
          Deploy and manage your job search agents
        </p>
      </div>

      {/* Status Overview */}
      <motion.div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        initial="hidden"
        animate="visible"
        variants={containerVariants as any}
      >
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-20 mt-1" />
                  ) : data && statusConfig ? (
                    <motion.div
                      variants={data.status === "running" ? pulseVariants : undefined}
                      animate={data.status === "running" ? "pulse" : undefined}
                    >
                      <Badge className={`${statusConfig.color} mt-1`}>
                        {data.status}
                      </Badge>
                    </motion.div>
                  ) : (
                    <p className="text-lg font-bold mt-1">Unknown</p>
                  )}
                </div>
                <Activity className="w-8 h-8 text-muted-foreground opacity-50" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Version</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-24 mt-1" />
                  ) : (
                    <p className="text-lg font-bold mt-1">{data?.version ?? "\u2014"}</p>
                  )}
                </div>
                <Server className="w-8 h-8 text-muted-foreground opacity-50" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Uptime</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-20 mt-1" />
                  ) : (
                    <p className="text-lg font-bold mt-1">{data?.uptime ?? "\u2014"}</p>
                  )}
                </div>
                <Clock className="w-8 h-8 text-muted-foreground opacity-50" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Last Deploy</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-28 mt-1" />
                  ) : (
                    <p className="text-sm font-medium mt-1">
                      {data?.last_deploy
                        ? new Date(data.last_deploy).toLocaleString()
                        : "\u2014"}
                    </p>
                  )}
                </div>
                <Rocket className="w-8 h-8 text-muted-foreground opacity-50" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Deployment Actions</CardTitle>
          <CardDescription>Manage deployment lifecycle</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <motion.div
            className="flex items-center justify-between p-4 rounded-lg border"
            whileHover={{
              backgroundColor: "rgba(0, 0, 0, 0.02)",
              transition: { duration: 0.2 },
            } as any}
          >
            <div>
              <h4 className="font-medium">Rebuild & Deploy</h4>
              <p className="text-sm text-muted-foreground">
                Rebuild all services and deploy the latest version
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button disabled={rebuildMutation.isPending}>
                  {rebuildMutation.isPending ? (
                    <Loader2 className="w-4 h-4 me-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 me-2" />
                  )}
                  Rebuild
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Rebuild & Deploy?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will rebuild all services and deploy the latest version.
                    Running agents will be briefly interrupted during the deployment.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => rebuildMutation.mutate()}>
                    Rebuild
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </motion.div>

          <motion.div
            className="flex items-center justify-between p-4 rounded-lg border"
            whileHover={{
              backgroundColor: "rgba(0, 0, 0, 0.02)",
              transition: { duration: 0.2 },
            } as any}
          >
            <div>
              <h4 className="font-medium">Rollback</h4>
              <p className="text-sm text-muted-foreground">
                Revert to the previous deployment version
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" disabled={rollbackMutation.isPending}>
                  {rollbackMutation.isPending ? (
                    <Loader2 className="w-4 h-4 me-2 animate-spin" />
                  ) : (
                    <RotateCcw className="w-4 h-4 me-2" />
                  )}
                  Rollback
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Rollback Deployment?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will revert to the previous deployment version.
                    All services will be restarted with the prior configuration.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => rollbackMutation.mutate()}>
                    Rollback
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </motion.div>

          {rebuildMutation.isSuccess && (
            <motion.div
              className="flex items-center gap-2 text-sm text-green-600"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: "spring", stiffness: 120, damping: 15 } as any}
            >
              <CheckCircle2 className="w-4 h-4" /> Rebuild initiated successfully
            </motion.div>
          )}
          {rebuildMutation.isError && (
            <motion.div
              className="flex items-center gap-2 text-sm text-red-600"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: "spring", stiffness: 120, damping: 15 } as any}
            >
              <XCircle className="w-4 h-4" /> Rebuild failed
            </motion.div>
          )}
          {rollbackMutation.isSuccess && (
            <motion.div
              className="flex items-center gap-2 text-sm text-green-600"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: "spring", stiffness: 120, damping: 15 } as any}
            >
              <CheckCircle2 className="w-4 h-4" /> Rollback initiated successfully
            </motion.div>
          )}
          {rollbackMutation.isError && (
            <motion.div
              className="flex items-center gap-2 text-sm text-red-600"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: "spring", stiffness: 120, damping: 15 } as any}
            >
              <XCircle className="w-4 h-4" /> Rollback failed
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
