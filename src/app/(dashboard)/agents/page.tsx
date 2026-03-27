"use client";

/**
 * Agents Page - AI agent control panel
 * Author: Ahmed Adel Bakr Alderai
 */

import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import type { AgentAction } from "@/types/api";

/** API response shape for a single agent */
interface AgentApiItem {
  name: string;
  poll_interval?: number;
  batch_size?: number;
  enabled?: boolean;
  status: string;
  [key: string]: unknown;
}

/** Friendly display names for agent names */
const AGENT_DISPLAY: Record<string, { display_name: string; type: string }> = {
  discovery: { display_name: "Job Discovery", type: "search" },
  tailoring: { display_name: "CV Tailoring", type: "apply" },
  application: { display_name: "Auto Apply", type: "apply" },
  outreach: { display_name: "Recruiter Outreach", type: "email" },
};

/** Normalize API agent to the shape the page uses */
function normalizeAgent(raw: AgentApiItem) {
  const info = AGENT_DISPLAY[raw.name] ?? { display_name: raw.name, type: "custom" };
  return {
    agent_id: raw.name,
    name: raw.name,
    display_name: info.display_name,
    type: info.type,
    status: raw.status ?? "stopped",
    poll_interval: raw.poll_interval,
    config: { poll_interval: raw.poll_interval, batch_size: raw.batch_size },
    last_run_at: undefined as string | undefined,
    next_run_at: undefined as string | undefined,
    schedule: undefined as string | undefined,
  };
}

type NormalizedAgent = ReturnType<typeof normalizeAgent>;

const STATUS_CONFIG: Record<string, { color: string; badge: string; icon: React.ElementType }> = {
  running: { color: "text-green-600", badge: "bg-green-600", icon: CheckCircle2 },
  idle: { color: "text-gray-500", badge: "bg-gray-500", icon: Clock },
  paused: { color: "text-amber-500", badge: "bg-amber-500", icon: Pause },
  error: { color: "text-red-600", badge: "bg-red-600", icon: XCircle },
  completed: { color: "text-blue-600", badge: "bg-blue-600", icon: CheckCircle2 },
  stopped: { color: "text-gray-500", badge: "bg-gray-500", icon: Square },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
};

const pulseVariants = {
  pulse: {
    scale: [1, 1.2, 1],
    opacity: [1, 0.7, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export default function AgentsPage() {
  const queryClient = useQueryClient();
  const [configAgent, setConfigAgent] = useState<NormalizedAgent | null>(null);
  const [configValues, setConfigValues] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery({
    queryKey: ["agents"],
    queryFn: async () => {
      const result = await apiGet<AgentApiItem[] | { agents: AgentApiItem[] }>("/api/agents");
      const raw = Array.isArray(result) ? result : result.agents ?? [];
      return raw.map(normalizeAgent);
    },
    refetchInterval: 5000,
  });

  const actionMutation = useMutation({
    mutationFn: ({ agentId, action }: { agentId: string; action: string }) =>
      apiPost<AgentAction>(`/api/agents/${agentId}/${action}`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["agents"] }),
  });

  const configMutation = useMutation({
    mutationFn: ({ agentId, config }: { agentId: string; config: Record<string, unknown> }) =>
      apiPost<{ status: string }>(`/api/agents/${agentId}/config`, config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      setConfigAgent(null);
    },
  });

  const startAllMutation = useMutation({
    mutationFn: () => apiPost<{ status: string }>("/api/agents/start-all", {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["agents"] }),
  });

  const stopAllMutation = useMutation({
    mutationFn: () => apiPost<{ status: string }>("/api/agents/stop-all", {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["agents"] }),
  });

  // SSE for real-time agent events
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
    const eventSource = new EventSource(`${apiUrl}/api/agents/events`);

    eventSource.onmessage = () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => eventSource.close();
  }, [queryClient]);

  const openConfig = useCallback((agent: NormalizedAgent) => {
    setConfigAgent(agent);
    const vals: Record<string, string> = {};
    if (agent.config) {
      Object.entries(agent.config).forEach(([k, v]) => {
        vals[k] = String(v ?? "");
      });
    }
    setConfigValues(vals);
  }, []);

  const agents = data ?? [];
  const runningCount = agents.filter((a) => a.status === "running").length;
  const errorCount = agents.filter((a) => a.status === "error").length;

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
      </div>

      {/* Summary Cards */}
      <motion.div 
        className="grid gap-4 sm:grid-cols-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Agents</p>
                <p className="text-2xl font-bold">{agents.length}</p>
              </div>
              <Bot className="w-8 h-8 text-muted-foreground opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Running</p>
                <p className="text-2xl font-bold text-green-600">{runningCount}</p>
              </div>
              <Activity className="w-8 h-8 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Errors</p>
                <p className="text-2xl font-bold text-red-600">{errorCount}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Agent Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : agents.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No agents configured. Start the agent orchestrator to register agents.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent, index) => {
            const config = STATUS_CONFIG[agent.status] ?? STATUS_CONFIG.idle;
            const StatusIcon = config.icon;
            const isRunning = agent.status === "running";
            const isPaused = agent.status === "paused";
            const isError = agent.status === "error";

            return (
              <motion.div
                key={agent.agent_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.4, 
                  delay: index * 0.08,
                  ease: "easeOut"
                }}
                whileHover={{ 
                  scale: 1.02, 
                  y: -2,
                  transition: { type: "spring", stiffness: 400, damping: 17 }
                }}
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
                        {isRunning && (
                          <motion.span
                            className="inline-block w-1.5 h-1.5 rounded-full bg-white me-1"
                            animate={{ 
                              scale: [1, 1.2, 1],
                              opacity: [1, 0.7, 1]
                            }}
                            transition={{ 
                              duration: 1.5, 
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          />
                        )}
                        <StatusIcon className="w-3 h-3 me-1" />
                        {agent.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isRunning && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Processing</span>
                          <span className="flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Active
                          </span>
                        </div>
                        <Progress value={null} className="h-1.5" />
                      </div>
                    )}

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
                      {isRunning ? (
                        <>
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
                        </>
                      ) : isPaused ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => actionMutation.mutate({ agentId: agent.agent_id, action: "resume" })}
                          disabled={actionMutation.isPending}
                        >
                          <Play className="w-3.5 h-3.5 me-1" />
                          Resume
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => actionMutation.mutate({ agentId: agent.agent_id, action: "start" })}
                          disabled={actionMutation.isPending}
                        >
                          <Play className="w-3.5 h-3.5 me-1" />
                          Start
                        </Button>
                      )}
                      {isError && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => actionMutation.mutate({ agentId: agent.agent_id, action: "restart" })}
                          disabled={actionMutation.isPending}
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => openConfig(agent)}>
                        <Settings2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
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
