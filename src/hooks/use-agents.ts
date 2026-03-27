"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiGet, apiPost } from "@/lib/api-client"
import type { Agent, AgentAction } from "@/types/api"

/**
 * Fetch all agent statuses
 */
export function useAgents() {
  return useQuery({
    queryKey: ["agents", "status"],
    queryFn: () => apiGet<Agent[]>("/api/agents/status"),
    refetchInterval: 15000, // Refetch every 15 seconds for real-time updates
    staleTime: 5000,
  })
}

/**
 * Perform an action on a specific agent
 */
export function useAgentAction(agentName: string, action: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () =>
      apiPost<{ status: string }>(
        `/api/agents/${agentName}/${action}`,
        {}
      ),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["agents"] })
      const previousAgents = queryClient.getQueryData<Agent[]>(["agents", "status"])
      if (previousAgents) {
        const statusMap: Record<string, string> = {
          start: "running",
          stop: "stopped",
          pause: "paused",
          resume: "running",
        }
        const newStatus = statusMap[action] || action
        queryClient.setQueryData(
          ["agents", "status"],
          previousAgents.map((a) =>
            a.name === agentName ? { ...a, status: newStatus } : a
          )
        )
      }
      return { previousAgents }
    },
    onError: (_err, _vars, context) => {
      if (context?.previousAgents) {
        queryClient.setQueryData(["agents", "status"], context.previousAgents)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] })
      queryClient.invalidateQueries({ queryKey: ["agents", agentName] })
    },
  })
}

/**
 * Fetch agent configuration
 */
export function useAgentConfig(agentName: string) {
  return useQuery({
    queryKey: ["agents", agentName, "config"],
    queryFn: () => apiGet<Record<string, unknown>>(`/api/agents/${agentName}/config`),
    enabled: !!agentName,
    staleTime: 60000,
  })
}

/**
 * Update agent configuration
 */
export function useUpdateAgentConfig(agentName: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (config: Record<string, unknown>) =>
      apiPost<{ status: string }>(
        `/api/agents/${agentName}/config`,
        config
      ),
    onSuccess: () => {
      // Invalidate agent config queries
      queryClient.invalidateQueries({
        queryKey: ["agents", agentName, "config"],
      })
      queryClient.invalidateQueries({ queryKey: ["agents"] })
    },
  })
}
