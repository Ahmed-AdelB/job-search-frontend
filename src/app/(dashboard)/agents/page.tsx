"use client";

/**
 * Agents Page - AI agent control panel
 * Author: Ahmed Adel Bakr Alderai
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "motion/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Bot,
  Play,
  Pause,
  Square,
  RotateCcw,
  Settings2,
  Activity,
  Clock,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Zap,
} from "lucide-react";
import { apiGet, apiPost } from "@/lib/api-client";
import type { Agent, AgentAction } from "@/types/api";

const STATUS_CONFIG: Record<string, { color: string; badge: string; icon: React.ElementType }> = {
  running: { color: "text-green-600", badge: "bg-green-600", icon: CheckCircle2 },
  idle: { color: "text-gray-500", badge: "bg-gray-500", icon: Clock },
  paused: { color: "text-amber-500", badge: "bg-amber-500", icon: Pause },
  error: { color: "text-red-600", badge: "bg-red-600", icon: XCircle },
  completed: { color: "text-blue-600", badge: "bg-blue-600", icon: CheckCircle2 },
  stopped: { color: "text-gray-500", badge: "bg-gray-500", icon: Square },
};

// Animated counter hook
function useAnimatedCounter(targetValue: number, duration: number = 1000) {
  const [displayValue, setDisplayValue] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const startValueRef = useRef(0);

  useEffect(() => {
    startTimeRef.current = null;
    startValueRef.current = displayValue;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      const currentValue = Math.round(startValueRef.current + (targetValue - startValueRef.current) * easeOut);
      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [targetValue, duration]);

  return displayValue;
}

// Pulsing dot component for running status
function StatusPulse({ isRunning }: { isRunning: boolean }) {
  if (!isRunning) return null;

  return (
    <span className="relative flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
    </span>
  );
}

export default function AgentsPage() {
  const queryClient = useQueryClient();
  const [configAgent, setConfigAgent] = useState<Agent | null>(null);
  const [configValues, setConfigValues] = useState<Record<string, string>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["agents"],
    queryFn: () => apiGet<{ agents: Agent[] }>("/api/v1/agents"),
    refetchInterval: 5000,
  });

  const actionMutation = useMutation({
    mutationFn: ({ agentId, action }: { agentId: string; action: string }) =>
      apiPost<AgentAction>(`/api/v1/agents/${agentId}/${action}`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["agents"] }),
  });

  const configMutation = useMutation({
    mutationFn: ({ agentId, config }: { agentId: string; config: Record<string, unknown> }) =>
      apiPost<{ status: string }>(`/api/v1/agents/${agentId}/config`, config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      setConfigAgent(null);
    },
  });

  const startAllMutation = useMutation({
    mutationFn: () => apiPost<{ status: string }>("/api/v1/agents/start-all", {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["agents"] }),
  });

  const stopAllMutation = useMutation({
    mutationFn: () => apiPost<{ status: string }>("/api/v1/agents/stop-all", {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["agents"] }),
  });

  // SSE for real-time agent events
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
    const eventSource = new EventSource(`${apiUrl}/api/v1/agents/events`);

    eventSource.onmessage = () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => eventSource.close();
  }, [queryClient]);

  const openConfig = useCallback((agent: Agent) => {
    setConfigAgent(agent);
    const vals: Record<string, string> = {};
    if (agent.config) {
      Object.entries(agent.config).forEach(([k, v]) => {
        vals[k] = String(v ?? "");
      });
    }
    setConfigValues(vals);
  }, []);

  const agents = data?.agents ?? [];
  const runningCount = agents.filter((a) => a.status === "running").length;
  const errorCount = agents.filter((a) => a.status === "error").length;

  // Animated stat values
  const animatedTotalAgents = useAnimatedCounter(mounted ? agents.length : 0, 800);
  const animatedRunningCount = useAnimatedCounter(mounted ? runningCount : 0, 800);
  const animatedErrorCount = useAnimatedCounter(mounted ? errorCount : 0, 800);

  // Animation variants
  const headerVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.5, ease: "easeOut" as const }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.08,
        duration: 0.4,
        ease: "easeOut" as const
      }
    })
  };

  const summaryCardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.1 + i * 0.08,
        duration: 0.4,
        ease: "easeOut" as const
      }
    })
  };

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Page Header */}
      <motion.div 
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        initial="hidden"
        animate="visible"
        variants={headerVariants}
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Agents</h1>
          <p className="text-muted-foreground">
            Manage your AI automation agents
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => stopAllMutation.mutate()}
            disabled={stopAllMutation.isPending || runningCount === 0}
          >
            {stopAllMutation.isPending ? (
              <Loader2 className="w-4 h-4 me-2 animate-spin" />
            ) : (
              <Square className="w-4 h-4 me-2" />
            )}
            Stop All
          </Button>
          <Button
            onClick={() => startAllMutation.mutate()}
            disabled={startAllMutation.isPending}
          >
            {startAllMutation.isPending ? (
              <Loader2 className="w-4 h-4 me-2 animate-spin" />
            ) : (
              <Play className="w-4 h-4 me-2" />
            )}
            Start All
          </Button>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={summaryCardVariants}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Agents</p>
                  <p className="text-2xl font-bold">{animatedTotalAgents}</p>
                </div>
                <Bot className="w-8 h-8 text-muted-foreground opacity-50" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          custom={1}
          initial="hidden"
          animate="visible"
          variants={summaryCardVariants}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Running</p>
                  <p className="text-2xl font-bold text-green-600">{animatedRunningCount}</p>
                </div>
                <Activity className="w-8 h-8 text-green-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          custom={2}
          initial="hidden"
          animate="visible"
          variants={summaryCardVariants}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Errors</p>
                  <p className="text-2xl font-bold text-red-600">{animatedErrorCount}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Agent Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : agents.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground">
              <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No agents configured. Start the agent orchestrator to register agents.</p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {agents.map((agent, index) => {
              const config = STATUS_CONFIG[agent.status] ?? STATUS_CONFIG.idle;
              const StatusIcon = config.icon;
              const isRunning = agent.status === "running";
              const isPaused = agent.status === "paused";
              const isError = agent.status === "error";

              return (
                <motion.div
                  key={agent.agent_id}
                  custom={index}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, scale: 0.95 }}
                  variants={cardVariants}
                  whileHover={{ 
                    scale: 1.03, 
                    y: -4,
                    transition: { type: "spring", stiffness: 400, damping: 25 }
                  }}
                  layout
                >
                  <Card className={isError ? "border-red-300 dark:border-red-800" : ""}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-md ${isRunning ? "bg-green-100 dark:bg-green-900/30" : "bg-muted"}`}>
                            <Zap className={`w-4 h-4 ${config.color}`} />
                          </div>
                          <div>
                            <CardTitle className="text-base">{agent.display_name}</CardTitle>
                            <CardDescription className="text-xs">{agent.type}</CardDescription>
                          </div>
                        </div>
                        <Badge className={config.badge}>
                          <StatusIcon className="w-3 h-3 me-1" />
                          {agent.status}
                          {isRunning && <StatusPulse isRunning={isRunning} />}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <AnimatePresence mode="wait">
                        {isRunning && (
                          <motion.div 
                            className="space-y-1"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>Processing</span>
                              <span className="flex items-center gap-1">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Active
                              </span>
                            </div>
                            <Progress value={null} className="h-1.5" />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="space-y-1 text-xs text-muted-foreground">
                        {agent.last_run_at && (
                          <div className="flex justify-between">
                            <span>Last run</span>
                            <span>{new Date(agent.last_run_at).toLocaleString()}</span>
                          </div>
                        )}
                        {agent.next_run_at && (
                          <div className="flex justify-between">
                            <span>Next run</span>
                            <span>{new Date(agent.next_run_at).toLocaleString()}</span>
                          </div>
                        )}
                        {agent.schedule && (
                          <div className="flex justify-between">
                            <span>Schedule</span>
                            <span className="font-mono">{agent.schedule}</span>
                          </div>
                        )}
                      </div>

                      {/* Controls */}
                      <div className="flex gap-2">
                        <AnimatePresence mode="wait">
                          {isRunning ? (
                            <motion.div 
                              key="running-controls"
                              className="flex gap-2 flex-1"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 10 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={() => actionMutation.mutate({ agentId: agent.agent_id, action: "pause" })}
                                disabled={actionMutation.isPending}
                              >
                                <Pause className="w-3.5 h-3.5 me-1" />
                                Pause
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={() => actionMutation.mutate({ agentId: agent.agent_id, action: "stop" })}
                                disabled={actionMutation.isPending}
                              >
                                <Square className="w-3.5 h-3.5 me-1" />
                                Stop
                              </Button>
                            </motion.div>
                          ) : isPaused ? (
                            <motion.div
                              key="paused-controls"
                              className="flex-1"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 10 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 w-full"
                                onClick={() => actionMutation.mutate({ agentId: agent.agent_id, action: "resume" })}
                                disabled={actionMutation.isPending}
                              >
                                <Play className="w-3.5 h-3.5 me-1" />
                                Resume
                              </Button>
                            </motion.div>
                          ) : (
                            <motion.div
                              key="idle-controls"
                              className="flex-1"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 10 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Button
                                size="sm"
                                className="flex-1 w-full"
                                onClick={() => actionMutation.mutate({ agentId: agent.agent_id, action: "start" })}
                                disabled={actionMutation.isPending}
                              >
                                <Play className="w-3.5 h-3.5 me-1" />
                                Start
                              </Button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                        <AnimatePresence>
                          {isError && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => actionMutation.mutate({ agentId: agent.agent_id, action: "restart" })}
                                disabled={actionMutation.isPending}
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </Button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                        <Button variant="ghost" size="sm" onClick={() => openConfig(agent)}>
                          <Settings2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Config Dialog */}
      <Dialog open={!!configAgent} onOpenChange={(open) => !open && setConfigAgent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configure {configAgent?.display_name}</DialogTitle>
            <DialogDescription>
              Update agent configuration parameters
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {Object.entries(configValues).map(([key, value]) => (
              <div key={key} className="space-y-1.5">
                <Label className="capitalize">{key.replace(/_/g, " ")}</Label>
                <Input
                  value={value}
                  onChange={(e) =>
                    setConfigValues((prev) => ({ ...prev, [key]: e.target.value }))
                  }
                />
              </div>
            ))}
            {Object.keys(configValues).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No configurable parameters for this agent
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfigAgent(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (configAgent) {
                  const parsed: Record<string, unknown> = {};
                  Object.entries(configValues).forEach(([k, v]) => {
                    const num = Number(v);
                    parsed[k] = !isNaN(num) && v !== "" ? num : v;
                  });
                  configMutation.mutate({ agentId: configAgent.agent_id, config: parsed });
                }
              }}
              disabled={configMutation.isPending}
            >
              {configMutation.isPending ? (
                <Loader2 className="w-4 h-4 me-2 animate-spin" />
              ) : null}
              Save Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
