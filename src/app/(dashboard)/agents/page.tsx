"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiPost } from "@/lib/api-client";
import { useSSE } from "@/hooks/use-sse";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  MoreHorizontal,
  Plus,
  Loader2,
} from "lucide-react";
import type { Agent } from "@/types/api";

// Local agent state with SSE updates
interface AgentWithStatus extends Agent {
  isUpdating?: boolean;
}

export default function AgentsPage() {
  const queryClient = useQueryClient();
  const [agents, setAgents] = useState<AgentWithStatus[]>([]);
  const [stopDialogAgent, setStopDialogAgent] = useState<string | null>(null);
  const [localStatus, setLocalStatus] = useState<Record<string, Agent["status"]>>(
    {}
  );

  // Fetch agents
  const {
    data: fetchedAgents = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["agents"],
    queryFn: async () => {
      const response = await fetch("/api/v1/agents", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch agents");
      const data = await response.json();
      return Array.isArray(data) ? data : data.data || [];
    },
    refetchInterval: 30000,
    staleTime: 10000,
  });

  // SSE connection for real-time updates
  useSSE("/api/v1/agents/status/stream", (data: unknown) => {
    const event = data as { agent_id?: string; status?: string };
    if (event.agent_id && event.status) {
      setLocalStatus((prev) => ({
        ...prev,
        [event.agent_id]: event.status as Agent["status"],
      }));
    }
  });

  // Combine fetched and local status
  useEffect(() => {
    const updated = fetchedAgents.map((agent) => ({
      ...agent,
      status: localStatus[agent.agent_id] || agent.status,
      isUpdating: false,
    }));
    setAgents(updated);
  }, [fetchedAgents, localStatus]);

  // Agent action mutation
  const actionMutation = useMutation({
    mutationFn: async (variables: {
      agent_id: string;
      action: "start" | "stop" | "pause" | "resume" | "restart";
    }) => {
      return apiPost(`/api/v1/agents/${variables.agent_id}/action`, {
        action: variables.action,
      });
    },
    onMutate: async (variables) => {
      // Optimistic update
      setAgents((prev) =>
        prev.map((agent) =>
          agent.agent_id === variables.agent_id
            ? { ...agent, isUpdating: true }
            : agent
        )
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      toast.success(`Agent ${variables.action} initiated`);
    },
    onError: (error) => {
      toast.error("Failed to perform action", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
      // Refetch to sync state
      queryClient.invalidateQueries({ queryKey: ["agents"] });
    },
  });

  // Start/Stop All mutations
  const startAllMutation = useMutation({
    mutationFn: async () => {
      return apiPost("/api/v1/agents/start-all", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      toast.success("All agents started");
    },
    onError: (error) => {
      toast.error("Failed to start all agents", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    },
  });

  const stopAllMutation = useMutation({
    mutationFn: async () => {
      return apiPost("/api/v1/agents/stop-all", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      toast.success("All agents stopped");
    },
    onError: (error) => {
      toast.error("Failed to stop all agents", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    },
  });

  const handleAction = (agentId: string, action: string) => {
    actionMutation.mutate({
      agent_id: agentId,
      action: action as "start" | "stop" | "pause" | "resume" | "restart",
    });
  };

  const getStatusColor = (status: Agent["status"]) => {
    switch (status) {
      case "running":
        return "bg-green-500";
      case "paused":
        return "bg-yellow-500";
      case "error":
        return "bg-red-500";
      case "idle":
      case "stopped":
        return "bg-gray-400";
      default:
        return "bg-gray-300";
    }
  };

  const getStatusLabel = (status: Agent["status"]) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getTypeBadgeVariant = (
    type: Agent["type"]
  ): "default" | "secondary" | "outline" | "destructive" => {
    switch (type) {
      case "search":
        return "default";
      case "apply":
        return "secondary";
      case "email":
        return "outline";
      default:
        return "default";
    }
  };

  const isLoaded = !isLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Agents</h1>
          <p className="text-muted-foreground">
            Manage your AI automation agents in real-time
          </p>
        </div>
        <div className="flex gap-2">
          {agents.length > 0 && (
            <>
              <Button
                variant="outline"
                onClick={() => startAllMutation.mutate()}
                disabled={startAllMutation.isPending}
              >
                {startAllMutation.isPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Start All
              </Button>
              <Button
                variant="outline"
                onClick={() => stopAllMutation.mutate()}
                disabled={stopAllMutation.isPending}
              >
                {stopAllMutation.isPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Stop All
              </Button>
            </>
          )}
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Agent
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-800">
              Failed to load agents: {error instanceof Error ? error.message : "Unknown error"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {isLoaded && agents.length === 0 && !error && (
        <Card>
          <CardHeader>
            <CardTitle>Your Agents</CardTitle>
            <CardDescription>
              Active and paused automation agents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <svg
                className="w-12 h-12 mx-auto mb-4 opacity-50"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5a4 4 0 100-8 4 4 0 000 8z"
                />
              </svg>
              <p>No agents configured yet</p>
              <Button variant="outline" className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Agent
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading Skeleton */}
      {!isLoaded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Agent Cards Grid */}
      {isLoaded && agents.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <Card key={agent.agent_id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg truncate">
                        {agent.display_name || agent.name}
                      </h3>
                      <div
                        className={`w-3 h-3 rounded-full ${getStatusColor(agent.status)}`}
                        title={getStatusLabel(agent.status)}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {agent.type}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={agent.isUpdating}
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {(agent.status === "idle" ||
                        agent.status === "paused" ||
                        agent.status === "stopped") && (
                        <DropdownMenuItem
                          onClick={() =>
                            handleAction(agent.agent_id, "start")
                          }
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Start
                        </DropdownMenuItem>
                      )}
                      {agent.status === "running" && (
                        <>
                          <DropdownMenuItem
                            onClick={() =>
                              handleAction(agent.agent_id, "pause")
                            }
                          >
                            <Pause className="w-4 h-4 mr-2" />
                            Pause
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setStopDialogAgent(agent.agent_id)}
                            className="text-red-600"
                          >
                            <Square className="w-4 h-4 mr-2" />
                            Stop
                          </DropdownMenuItem>
                        </>
                      )}
                      {agent.status === "paused" && (
                        <DropdownMenuItem
                          onClick={() =>
                            handleAction(agent.agent_id, "resume")
                          }
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Resume
                        </DropdownMenuItem>
                      )}
                      {agent.status === "error" && (
                        <DropdownMenuItem
                          onClick={() =>
                            handleAction(agent.agent_id, "restart")
                          }
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Restart
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent className="flex-1 space-y-3">
                {/* Type Badge */}
                <div>
                  <Badge variant={getTypeBadgeVariant(agent.type)}>
                    {agent.type}
                  </Badge>
                </div>

                {/* Status Info */}
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="font-medium">
                      {getStatusLabel(agent.status)}
                    </span>
                  </div>

                  {agent.last_run_at && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last run:</span>
                      <span className="font-medium">
                        {formatDistanceToNow(new Date(agent.last_run_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  )}

                  {agent.next_run_at && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Next run:</span>
                      <span className="font-medium">
                        {formatDistanceToNow(new Date(agent.next_run_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  )}

                  {agent.schedule && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Schedule:</span>
                      <span className="font-medium text-xs">{agent.schedule}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  {(agent.status === "idle" ||
                    agent.status === "paused" ||
                    agent.status === "stopped") && (
                    <Button
                      size="sm"
                      onClick={() => handleAction(agent.agent_id, "start")}
                      disabled={agent.isUpdating || actionMutation.isPending}
                      className="flex-1"
                    >
                      {agent.isUpdating && (
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      )}
                      Start
                    </Button>
                  )}
                  {agent.status === "running" && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAction(agent.agent_id, "pause")}
                        disabled={
                          agent.isUpdating || actionMutation.isPending
                        }
                      >
                        {agent.isUpdating && (
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        )}
                        <Pause className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setStopDialogAgent(agent.agent_id)}
                        disabled={
                          agent.isUpdating || actionMutation.isPending
                        }
                        className="flex-1"
                      >
                        {agent.isUpdating && (
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        )}
                        Stop
                      </Button>
                    </>
                  )}
                  {agent.status === "paused" && (
                    <Button
                      size="sm"
                      onClick={() => handleAction(agent.agent_id, "resume")}
                      disabled={agent.isUpdating || actionMutation.isPending}
                      className="flex-1"
                    >
                      {agent.isUpdating && (
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      )}
                      Resume
                    </Button>
                  )}
                  {agent.status === "error" && (
                    <Button
                      size="sm"
                      onClick={() => handleAction(agent.agent_id, "restart")}
                      disabled={agent.isUpdating || actionMutation.isPending}
                      className="flex-1"
                    >
                      {agent.isUpdating && (
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      )}
                      <RotateCcw className="w-3 h-3 mr-1" />
                      Restart
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Stop Agent Dialog */}
      <AlertDialog open={!!stopDialogAgent}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Stop Agent</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to stop this agent? It will stop processing
              and can be restarted later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel onClick={() => setStopDialogAgent(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (stopDialogAgent) {
                  handleAction(stopDialogAgent, "stop");
                  setStopDialogAgent(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Stop
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
