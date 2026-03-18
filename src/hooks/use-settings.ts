/**
 * Settings Hooks - React Query hooks for settings API endpoints
 * Author: Ahmed Adel Bakr Alderai
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPut } from "@/lib/api-client";
import { PipelineSettings } from "@/types/api";
import { toast } from "sonner";

export interface GeneralSettings {
  theme: "light" | "dark" | "system";
  language: "en" | "ar";
  timezone: string;
  notifications_enabled: boolean;
}

export interface NotificationSettings {
  email_notifications: boolean;
  application_status_updates: boolean;
  interview_reminders: boolean;
  daily_digest: boolean;
  notification_email: string;
}

export interface LLMConfig {
  provider: "anthropic" | "openai" | "nvidia";
  model: string;
  temperature: number;
  api_key?: string;
}

export interface AdvancedSettings {
  proxy_url?: string;
  proxy_username?: string;
  proxy_password?: string;
  rate_limit_per_minute: number;
  debug_mode: boolean;
}

export interface AllSettings {
  general: GeneralSettings;
  pipeline: PipelineSettings;
  llm: LLMConfig;
  notifications: NotificationSettings;
  advanced: AdvancedSettings;
}

/**
 * Fetch all settings
 */
export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: () => apiGet<AllSettings>("/api/v1/settings"),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Update all settings
 */
export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: AllSettings) =>
      apiPut<AllSettings>("/api/v1/settings", settings),
    onSuccess: (data) => {
      queryClient.setQueryData(["settings"], data);
      toast.success("Settings updated successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to update settings", {
        description: error.message,
      });
    },
  });
}

/**
 * Update general settings only
 */
export function useUpdateGeneralSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: GeneralSettings) =>
      apiPut<GeneralSettings>("/api/v1/settings/general", settings),
    onSuccess: (data) => {
      // Update the general part of the settings cache
      queryClient.setQueryData(["settings"], (prev: AllSettings) => ({
        ...prev,
        general: data,
      }));
      toast.success("General settings updated");
    },
    onError: (error: Error) => {
      toast.error("Failed to update settings", {
        description: error.message,
      });
    },
  });
}

/**
 * Update pipeline settings only
 */
export function useUpdatePipelineSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: PipelineSettings) =>
      apiPut<PipelineSettings>("/api/v1/settings/pipeline", settings),
    onSuccess: (data) => {
      queryClient.setQueryData(["settings"], (prev: AllSettings) => ({
        ...prev,
        pipeline: data,
      }));
      toast.success("Pipeline settings updated");
    },
    onError: (error: Error) => {
      toast.error("Failed to update settings", {
        description: error.message,
      });
    },
  });
}

/**
 * Fetch LLM configuration
 */
export function useLLMConfig() {
  return useQuery({
    queryKey: ["settings", "llm"],
    queryFn: () => apiGet<LLMConfig>("/api/v1/settings/llm"),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

/**
 * Update LLM configuration
 */
export function useUpdateLLMConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (config: LLMConfig) =>
      apiPut<LLMConfig>("/api/v1/settings/llm", config),
    onSuccess: (data) => {
      queryClient.setQueryData(["settings", "llm"], data);
      queryClient.setQueryData(["settings"], (prev: AllSettings) => ({
        ...prev,
        llm: data,
      }));
      toast.success("LLM settings updated");
    },
    onError: (error: Error) => {
      toast.error("Failed to update LLM settings", {
        description: error.message,
      });
    },
  });
}

/**
 * Update notification settings
 */
export function useUpdateNotificationSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: NotificationSettings) =>
      apiPut<NotificationSettings>("/api/v1/settings/notifications", settings),
    onSuccess: (data) => {
      queryClient.setQueryData(["settings"], (prev: AllSettings) => ({
        ...prev,
        notifications: data,
      }));
      toast.success("Notification settings updated");
    },
    onError: (error: Error) => {
      toast.error("Failed to update notifications", {
        description: error.message,
      });
    },
  });
}

/**
 * Update advanced settings
 */
export function useUpdateAdvancedSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: AdvancedSettings) =>
      apiPut<AdvancedSettings>("/api/v1/settings/advanced", settings),
    onSuccess: (data) => {
      queryClient.setQueryData(["settings"], (prev: AllSettings) => ({
        ...prev,
        advanced: data,
      }));
      toast.success("Advanced settings updated");
    },
    onError: (error: Error) => {
      toast.error("Failed to update advanced settings", {
        description: error.message,
      });
    },
  });
}
