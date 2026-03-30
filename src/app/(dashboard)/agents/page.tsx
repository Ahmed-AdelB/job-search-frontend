"use client";

/**
 * Agents Page - AI agent control panel with pipeline activity evidence
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
  Search,
  Star,
  Send,
  Users,
  FileText,
  Globe,
  Mail,
  Phone,
  Linkedin,
} from "lucide-react";
import { apiGet, apiPost } from "@/lib/api-client";
import type { AgentAction } from "@/types/api";

/** API response shape for a single agent */
interface AgentApiItem {
  name: string;
  poll_interval?: number;
  batch_size?: number;
  enabled?: boolean;
  is_running?: boolean;
  status: string;
  [key: string]: unknown;
}

/** Pipeline activity response from /api/pipeline/activity */
interface PipelineActivity {
  discovery: {
    total: number;
    recent: Array<{ url: string; source: string; created_at: string }>;
    sources: Record<string, number>;
  };
  scoring: {
    total: number;
    scored: number;
    avg_score: number;
  };
  applications: {
    total: number;
    recent: Array<{ id: number; job_id: number; status: string; created_at: string }>;
    statuses: Record<string, number>;
  };
  outreach: {
    total: number;
    recent: Array<Record<string, unknown>>;
    statuses: Record<string, number>;
  };
  contacts: {
    total: number;
    recruiters: number;
    with_email: number;
  };
}

/** Pipeline run from /api/pipeline/runs */
interface PipelineRun {
  run_id: string;
  stage: string;
  status: string;
  started_at: number;
  duration_seconds: number;
  result: boolean;
  error?: string;
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

/** Source display names for the discovery evidence section */
const SOURCE_LABELS: Record<string, { label: string; icon: React.ElementType }> = {
  linkedin_jobs: { label: "LinkedIn Jobs", icon: Linkedin },
  linkedin_posts: { label: "LinkedIn Posts", icon: FileText },
  linkedin_groups: { label: "LinkedIn Groups", icon: Users },
  indeed: { label: "Indeed", icon: Globe },
  glassdoor: { label: "Glassdoor", icon: Globe },
  company_careers: { label: "Company Careers", icon: Globe },
  irishjobs: { label: "IrishJobs.ie", icon: Globe },
  indeed_ie: { label: "Indeed IE", icon: Globe },
  indeed_uk: { label: "Indeed UK", icon: Globe },
  reed: { label: "Reed", icon: Globe },
};

export default function AgentsPage() {
  const queryClient = useQueryClient();
  const [configAgent, setConfigAgent] = useState<NormalizedAgent | null>(null);
  const [configValues, setConfigValues] = useState<Record<string, string>>({});

  // Fetch agents
  const { data, isLoading } = useQuery({
    queryKey: ["agents"],
    queryFn: async () => {
      const result = await apiGet<
        | AgentApiItem[]
        | { agents: AgentApiItem[] | Record<string, AgentApiItem> }
      >("/api/agents/status");
      let raw: AgentApiItem[];
      if (Array.isArray(result)) {
        raw = result;
      } else if (result.agents) {
        if (Array.isArray(result.agents)) {
          raw = result.agents;
        } else {
          raw = Object.entries(result.agents).map(([key, val]) => ({
            ...val,
            name: val.name ?? key,
            status: val.is_running ? "running" : val.status ?? "stopped",
          }));
        }
      } else {
        raw = [];
      }
      return raw.map(normalizeAgent);
    },
    refetchInterval: 5000,
  });

  // Fetch pipeline activity for evidence
  const { data: activity } = useQuery({
    queryKey: ["pipeline-activity"],
    queryFn: () => apiGet<PipelineActivity>("/api/pipeline/activity"),
    refetchInterval: 10000,
  });

  // Fetch recent pipeline runs
  const { data: runs } = useQuery({
    queryKey: ["pipeline-runs"],
    queryFn: () => apiGet<PipelineRun[]>("/api/pipeline/runs"),
    refetchInterval: 10000,
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
      queryClient.invalidateQueries({ queryKey: ["pipeline-activity"] });
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
          <h1 className="text-2xl font-display font-bold tracking-tight">Agents</h1>
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
        <Card className="card-glow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Agents</p>
                <p className="text-2xl font-display font-bold">{agents.length}</p>
              </div>
              <Bot className="w-8 h-8 text-muted-foreground opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="card-glow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Running</p>
                <p className="text-2xl font-display font-bold text-green-600">{runningCount}</p>
              </div>
              <Activity className="w-8 h-8 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="card-glow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Errors</p>
                <p className="text-2xl font-display font-bold text-red-600">{errorCount}</p>
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
        <Card className="card-glow">
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
                <Card className={`card-glow h-full ${isError ? "border-red-300 dark:border-red-800" : ""}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-md ${isRunning ? "bg-green-100 dark:bg-green-900/30" : "bg-muted"}`}>
                          <Zap className={`w-4 h-4 ${config.color}`} />
                        </div>
                        <div>
                          <CardTitle className="font-display text-base">{agent.display_name}</CardTitle>
                          <CardDescription className="text-xs">{agent.type}</CardDescription>
                        </div>
                      </div>
                      <Badge className={`${config.badge} bg-gradient-to-r from-emerald-500/20 to-emerald-400/20 text-emerald-400`}>
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

      {/* Pipeline Activity Evidence */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <h2 className="text-lg font-display font-semibold mb-4">Pipeline Activity</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Discovery Evidence */}
          <Card className="card-glow">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-blue-500" />
                <CardTitle className="font-display text-sm">Discovery</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-display font-bold">{activity?.discovery?.total ?? 0}</p>
              <p className="text-xs text-muted-foreground mb-3">pages scraped</p>
              {activity?.discovery?.sources && Object.keys(activity.discovery.sources).length > 0 && (
                <div className="space-y-1.5">
                  {Object.entries(activity.discovery.sources).map(([source, count]) => {
                    const info = SOURCE_LABELS[source] ?? { label: source, icon: Globe };
                    const SourceIcon = info.icon;
                    return (
                      <div key={source} className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <SourceIcon className="w-3 h-3" />
                          {info.label}
                        </span>
                        <Badge variant="secondary" className="text-xs px-1.5 py-0 bg-gradient-to-r from-blue-500/20 to-blue-400/20 text-blue-400">
                          {count as number}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Scoring Evidence */}
          <Card className="card-glow">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <CardTitle className="font-display text-sm">Scoring</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-display font-bold">{activity?.scoring?.total ?? 0}</p>
              <p className="text-xs text-muted-foreground mb-3">total jobs</p>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Scored</span>
                  <span className="font-medium">{activity?.scoring?.scored ?? 0}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Avg Score</span>
                  <span className="font-medium">{activity?.scoring?.avg_score ?? 0}</span>
                </div>
                {(activity?.scoring?.total ?? 0) > 0 && (
                  <Progress
                    value={((activity?.scoring?.scored ?? 0) / (activity?.scoring?.total ?? 1)) * 100}
                    className="h-1.5 mt-2"
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Applications Evidence */}
          <Card className="card-glow">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-green-500" />
                <CardTitle className="font-display text-sm">Applications</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-display font-bold">{activity?.applications?.total ?? 0}</p>
              <p className="text-xs text-muted-foreground mb-3">submitted</p>
              {activity?.applications?.statuses && Object.keys(activity.applications.statuses).length > 0 && (
                <div className="space-y-1.5">
                  {Object.entries(activity.applications.statuses).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground capitalize">{status}</span>
                      <Badge variant="secondary" className="text-xs px-1.5 py-0 bg-gradient-to-r from-emerald-500/20 to-emerald-400/20 text-emerald-400">
                        {count as number}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Outreach & Contacts Evidence */}
          <Card className="card-glow">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-500" />
                <CardTitle className="font-display text-sm">Contacts & Outreach</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-display font-bold">{activity?.contacts?.total ?? 0}</p>
              <p className="text-xs text-muted-foreground mb-3">contacts</p>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Users className="w-3 h-3" />
                    Recruiters
                  </span>
                  <span className="font-medium">{activity?.contacts?.recruiters ?? 0}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Mail className="w-3 h-3" />
                    With Email
                  </span>
                  <span className="font-medium">{activity?.contacts?.with_email ?? 0}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Send className="w-3 h-3" />
                    Messages Sent
                  </span>
                  <span className="font-medium">{activity?.outreach?.total ?? 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Recent Pipeline Runs */}
      {runs && runs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <h2 className="text-lg font-display font-semibold mb-4">Recent Runs</h2>
          <Card className="card-glow">
            <CardContent className="p-0">
              <div className="divide-y">
                {runs.slice(0, 10).map((run) => (
                  <div key={run.run_id} className="flex items-center justify-between p-3 text-sm">
                    <div className="flex items-center gap-3">
                      <Badge
                        className={`bg-gradient-to-r ${
                          run.status === "completed"
                            ? "from-emerald-500/20 to-emerald-400/20 text-emerald-400"
                            : run.status === "running"
                            ? "from-blue-500/20 to-blue-400/20 text-blue-400"
                            : run.status === "error"
                            ? "from-red-500/20 to-red-400/20 text-red-400"
                            : "from-slate-500/20 to-slate-400/20 text-slate-400"
                        }`}
                      >
                        {run.status === "running" && (
                          <Loader2 className="w-3 h-3 me-1 animate-spin" />
                        )}
                        {run.status}
                      </Badge>
                      <span className="font-mono text-xs text-muted-foreground">{run.run_id}</span>
                      <span className="text-muted-foreground capitalize">{run.stage}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {run.duration_seconds > 0 && (
                        <span>{Math.round(run.duration_seconds)}s</span>
                      )}
                      {run.started_at && (
                        <span>{new Date(run.started_at * 1000).toLocaleTimeString()}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Recent Discovery Activity */}
      {activity?.discovery?.recent && activity.discovery.recent.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <h2 className="text-lg font-display font-semibold mb-4">Recent Discoveries</h2>
          <Card className="card-glow">
            <CardContent className="p-0">
              <div className="divide-y">
                {activity.discovery.recent.map((item, idx) => {
                  const info = SOURCE_LABELS[item.source] ?? { label: item.source, icon: Globe };
                  const SourceIcon = info.icon;
                  return (
                    <div key={idx} className="flex items-center justify-between p-3 text-sm">
                      <div className="flex items-center gap-3 min-w-0">
                        <SourceIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="truncate text-muted-foreground" title={item.url}>
                          {item.url.replace(/^https?:\/\//, "").substring(0, 60)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="outline" className="text-xs bg-gradient-to-r from-slate-500/20 to-slate-400/20">{info.label}</Badge>
                        {item.created_at && (
                          <span className="text-xs text-muted-foreground">
                            {new Date(item.created_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
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
