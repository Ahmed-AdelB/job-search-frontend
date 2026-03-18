/**
 * Settings Page - User preferences and application configuration
 * Author: Ahmed Adel Bakr Alderai
 */

"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useSettings,
  useUpdateSettings,
  useUpdateGeneralSettings,
  useUpdatePipelineSettings,
  useUpdateLLMConfig,
  useUpdateNotificationSettings,
  useUpdateAdvancedSettings,
  AllSettings,
  GeneralSettings,
  PipelineSettings,
  LLMConfig,
  NotificationSettings,
  AdvancedSettings,
} from "@/hooks/use-settings";
import { usePreferencesStore } from "@/stores/preferences-store";
import { Loader2, Eye, EyeOff, Download, Upload } from "lucide-react";
import { toast } from "sonner";

// Zod Schemas
const generalSettingsSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  language: z.enum(["en", "ar"]),
  timezone: z.string(),
  notifications_enabled: z.boolean(),
});

const pipelineSettingsSchema = z.object({
  max_applications_per_day: z.number().min(1).max(100),
  auto_apply_min_score: z.number().min(0).max(100),
  preferred_locations: z.array(z.string()),
  excluded_companies: z.array(z.string()),
  preferred_remote_types: z.array(z.string()),
});

const llmConfigSchema = z.object({
  provider: z.enum(["anthropic", "openai", "nvidia"]),
  model: z.string(),
  temperature: z.number().min(0).max(2),
  api_key: z.string().optional(),
});

const notificationSettingsSchema = z.object({
  email_notifications: z.boolean(),
  application_status_updates: z.boolean(),
  interview_reminders: z.boolean(),
  daily_digest: z.boolean(),
  notification_email: z.string().email(),
});

const advancedSettingsSchema = z.object({
  proxy_url: z.string().optional(),
  proxy_username: z.string().optional(),
  proxy_password: z.string().optional(),
  rate_limit_per_minute: z.number().min(1).max(100),
  debug_mode: z.boolean(),
});

// ---- General Settings Tab ----
function GeneralSettingsTab() {
  const { data: settings, isLoading } = useSettings();
  const updateMutation = useUpdateGeneralSettings();
  const { setTheme, setLanguage } = usePreferencesStore();

  const form = useForm<GeneralSettings>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: settings?.general || {
      theme: "system",
      language: "en",
      timezone: "UTC",
      notifications_enabled: true,
    },
  });

  useEffect(() => {
    if (settings?.general) {
      form.reset(settings.general);
    }
  }, [settings?.general, form]);

  const onSubmit = async (data: GeneralSettings) => {
    updateMutation.mutate(data, {
      onSuccess: () => {
        // Update global preferences
        setTheme(data.theme);
        setLanguage(data.language);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-4 h-4 animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="theme">Theme</Label>
          <Select
            value={form.watch("theme")}
            onValueChange={(value: "light" | "dark" | "system") => {
              form.setValue("theme", value);
            }}
          >
            <SelectTrigger id="theme" className="mt-1.5">
              <SelectValue placeholder="Select theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="language">Language</Label>
          <Select
            value={form.watch("language")}
            onValueChange={(value: "en" | "ar") => {
              form.setValue("language", value);
            }}
          >
            <SelectTrigger id="language" className="mt-1.5">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="ar">العربية (Arabic)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="timezone">Timezone</Label>
          <Input
            id="timezone"
            placeholder="e.g., UTC, America/New_York"
            {...form.register("timezone")}
            className="mt-1.5"
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="notifications_enabled"
            {...form.register("notifications_enabled")}
            className="rounded border-gray-300"
          />
          <Label htmlFor="notifications_enabled" className="cursor-pointer">
            Enable notifications
          </Label>
        </div>
      </div>

      <Button
        type="submit"
        disabled={updateMutation.isPending}
        className="w-full"
      >
        {updateMutation.isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          "Save Changes"
        )}
      </Button>
    </form>
  );
}

// ---- Pipeline Settings Tab ----
function PipelineSettingsTab() {
  const { data: settings, isLoading } = useSettings();
  const updateMutation = useUpdatePipelineSettings();
  const [newLocation, setNewLocation] = useState("");
  const [newCompany, setNewCompany] = useState("");

  const form = useForm<PipelineSettings>({
    resolver: zodResolver(pipelineSettingsSchema),
    defaultValues: settings?.pipeline || {
      max_applications_per_day: 10,
      auto_apply_min_score: 70,
      preferred_locations: [],
      excluded_companies: [],
      preferred_remote_types: [],
    },
  });

  useEffect(() => {
    if (settings?.pipeline) {
      form.reset(settings.pipeline);
    }
  }, [settings?.pipeline, form]);

  const onSubmit = async (data: PipelineSettings) => {
    updateMutation.mutate(data);
  };

  const addLocation = () => {
    if (newLocation.trim()) {
      const current = form.getValues("preferred_locations");
      form.setValue("preferred_locations", [...current, newLocation.trim()]);
      setNewLocation("");
    }
  };

  const removeLocation = (index: number) => {
    const current = form.getValues("preferred_locations");
    form.setValue(
      "preferred_locations",
      current.filter((_, i) => i !== index)
    );
  };

  const addCompany = () => {
    if (newCompany.trim()) {
      const current = form.getValues("excluded_companies");
      form.setValue("excluded_companies", [...current, newCompany.trim()]);
      setNewCompany("");
    }
  };

  const removeCompany = (index: number) => {
    const current = form.getValues("excluded_companies");
    form.setValue(
      "excluded_companies",
      current.filter((_, i) => i !== index)
    );
  };

  const toggleRemoteType = (type: string) => {
    const current = form.getValues("preferred_remote_types");
    const updated = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    form.setValue("preferred_remote_types", updated);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-4 h-4 animate-spin" />
      </div>
    );
  }

  const remoteTypes = [
    { value: "remote", label: "Remote" },
    { value: "hybrid", label: "Hybrid" },
    { value: "onsite", label: "On-site" },
  ];

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        {/* Max applications per day */}
        <div>
          <Label htmlFor="max_applications_per_day">
            Max applications per day
          </Label>
          <Input
            id="max_applications_per_day"
            type="number"
            min="1"
            max="100"
            {...form.register("max_applications_per_day", {
              valueAsNumber: true,
            })}
            className="mt-1.5"
          />
        </div>

        {/* Auto-apply minimum score */}
        <div>
          <div className="flex justify-between items-center">
            <Label htmlFor="auto_apply_min_score">
              Auto-apply minimum score
            </Label>
            <span className="text-sm font-medium">
              {form.watch("auto_apply_min_score")}%
            </span>
          </div>
          <input
            id="auto_apply_min_score"
            type="range"
            min="0"
            max="100"
            {...form.register("auto_apply_min_score", {
              valueAsNumber: true,
            })}
            className="mt-1.5 w-full"
          />
        </div>

        {/* Preferred locations */}
        <div>
          <Label>Preferred locations</Label>
          <div className="mt-1.5 flex gap-2">
            <Input
              placeholder="e.g., San Francisco, London"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addLocation();
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={addLocation}
              disabled={!newLocation.trim()}
            >
              Add
            </Button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {form.watch("preferred_locations").map((location, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm"
              >
                {location}
                <button
                  type="button"
                  onClick={() => removeLocation(index)}
                  className="hover:opacity-70"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Excluded companies */}
        <div>
          <Label>Excluded companies</Label>
          <div className="mt-1.5 flex gap-2">
            <Input
              placeholder="e.g., Company Name"
              value={newCompany}
              onChange={(e) => setNewCompany(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCompany();
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={addCompany}
              disabled={!newCompany.trim()}
            >
              Add
            </Button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {form.watch("excluded_companies").map((company, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-1 bg-destructive text-destructive-foreground rounded-full text-sm"
              >
                {company}
                <button
                  type="button"
                  onClick={() => removeCompany(index)}
                  className="hover:opacity-70"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Preferred remote types */}
        <div>
          <Label>Preferred remote types</Label>
          <div className="mt-2 space-y-2">
            {remoteTypes.map((type) => (
              <div key={type.value} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={type.value}
                  checked={form
                    .watch("preferred_remote_types")
                    .includes(type.value)}
                  onChange={() => toggleRemoteType(type.value)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor={type.value} className="cursor-pointer">
                  {type.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Button
        type="submit"
        disabled={updateMutation.isPending}
        className="w-full"
      >
        {updateMutation.isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          "Save Changes"
        )}
      </Button>
    </form>
  );
}

// ---- LLM Settings Tab ----
function LLMSettingsTab() {
  const { data: settings, isLoading } = useSettings();
  const updateMutation = useUpdateLLMConfig();
  const [showApiKey, setShowApiKey] = useState(false);

  const form = useForm<LLMConfig>({
    resolver: zodResolver(llmConfigSchema),
    defaultValues: settings?.llm || {
      provider: "anthropic",
      model: "claude-opus-4",
      temperature: 0.7,
      api_key: "",
    },
  });

  useEffect(() => {
    if (settings?.llm) {
      form.reset(settings.llm);
    }
  }, [settings?.llm, form]);

  const onSubmit = async (data: LLMConfig) => {
    // Don't send API key if it wasn't changed
    if (!data.api_key) {
      delete data.api_key;
    }
    updateMutation.mutate(data);
  };

  const modelsByProvider = {
    anthropic: [
      { value: "claude-opus-4", label: "Claude Opus 4" },
      { value: "claude-sonnet-3", label: "Claude Sonnet 3" },
      { value: "claude-haiku-3", label: "Claude Haiku 3" },
    ],
    openai: [
      { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
      { value: "gpt-4", label: "GPT-4" },
      { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
    ],
    nvidia: [
      { value: "nemotron-4-340b", label: "Nemotron 4 340B" },
      { value: "llama-2-70b", label: "Llama 2 70B" },
    ],
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-4 h-4 animate-spin" />
      </div>
    );
  }

  const provider = form.watch("provider");
  const models =
    modelsByProvider[provider as keyof typeof modelsByProvider] || [];

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="provider">LLM Provider</Label>
          <Select
            value={form.watch("provider")}
            onValueChange={(value: "anthropic" | "openai" | "nvidia") => {
              form.setValue("provider", value);
              form.setValue("model", "");
            }}
          >
            <SelectTrigger id="provider" className="mt-1.5">
              <SelectValue placeholder="Select provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="anthropic">Anthropic</SelectItem>
              <SelectItem value="openai">OpenAI</SelectItem>
              <SelectItem value="nvidia">NVIDIA</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="model">Model</Label>
          <Select
            value={form.watch("model")}
            onValueChange={(value) => form.setValue("model", value)}
          >
            <SelectTrigger id="model" className="mt-1.5">
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              {models.map((model) => (
                <SelectItem key={model.value} value={model.value}>
                  {model.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <div className="flex justify-between items-center">
            <Label htmlFor="temperature">Temperature</Label>
            <span className="text-sm font-medium">
              {form.watch("temperature").toFixed(1)}
            </span>
          </div>
          <input
            id="temperature"
            type="range"
            min="0"
            max="2"
            step="0.1"
            {...form.register("temperature", {
              valueAsNumber: true,
            })}
            className="mt-1.5 w-full"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Higher values make output more creative, lower values more focused
          </p>
        </div>

        <div>
          <Label htmlFor="api_key">API Key</Label>
          <div className="mt-1.5 flex gap-2 items-center">
            <div className="relative flex-1">
              <Input
                id="api_key"
                type={showApiKey ? "text" : "password"}
                placeholder="Enter your API key"
                {...form.register("api_key")}
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showApiKey ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Your API key is encrypted and never shared
          </p>
        </div>
      </div>

      <Button
        type="submit"
        disabled={updateMutation.isPending}
        className="w-full"
      >
        {updateMutation.isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          "Save Changes"
        )}
      </Button>
    </form>
  );
}

// ---- Notification Settings Tab ----
function NotificationSettingsTab() {
  const { data: settings, isLoading } = useSettings();
  const updateMutation = useUpdateNotificationSettings();

  const form = useForm<NotificationSettings>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: settings?.notifications || {
      email_notifications: true,
      application_status_updates: true,
      interview_reminders: true,
      daily_digest: false,
      notification_email: "",
    },
  });

  useEffect(() => {
    if (settings?.notifications) {
      form.reset(settings.notifications);
    }
  }, [settings?.notifications, form]);

  const onSubmit = async (data: NotificationSettings) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-4 h-4 animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="email_notifications"
            {...form.register("email_notifications")}
            className="rounded border-gray-300"
          />
          <Label htmlFor="email_notifications" className="cursor-pointer">
            Email notifications
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="application_status_updates"
            {...form.register("application_status_updates")}
            className="rounded border-gray-300"
          />
          <Label
            htmlFor="application_status_updates"
            className="cursor-pointer"
          >
            Application status updates
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="interview_reminders"
            {...form.register("interview_reminders")}
            className="rounded border-gray-300"
          />
          <Label htmlFor="interview_reminders" className="cursor-pointer">
            Interview reminders
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="daily_digest"
            {...form.register("daily_digest")}
            className="rounded border-gray-300"
          />
          <Label htmlFor="daily_digest" className="cursor-pointer">
            Daily digest (summary of daily activity)
          </Label>
        </div>

        <div>
          <Label htmlFor="notification_email">Notification email</Label>
          <Input
            id="notification_email"
            type="email"
            placeholder="your@email.com"
            {...form.register("notification_email")}
            className="mt-1.5"
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={updateMutation.isPending}
        className="w-full"
      >
        {updateMutation.isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          "Save Changes"
        )}
      </Button>
    </form>
  );
}

// ---- Advanced Settings Tab ----
function AdvancedSettingsTab() {
  const { data: settings, isLoading } = useSettings();
  const updateMutation = useUpdateAdvancedSettings();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<AdvancedSettings>({
    resolver: zodResolver(advancedSettingsSchema),
    defaultValues: settings?.advanced || {
      proxy_url: "",
      proxy_username: "",
      proxy_password: "",
      rate_limit_per_minute: 30,
      debug_mode: false,
    },
  });

  useEffect(() => {
    if (settings?.advanced) {
      form.reset(settings.advanced);
    }
  }, [settings?.advanced, form]);

  const onSubmit = async (data: AdvancedSettings) => {
    updateMutation.mutate(data);
  };

  const handleExportSettings = async () => {
    const allSettings = form.getValues();
    const dataStr = JSON.stringify(allSettings, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `job-search-settings-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Settings exported");
  };

  const handleImportSettings = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const imported = JSON.parse(event.target?.result as string);
            form.reset(imported.advanced || {});
            toast.success("Settings imported");
          } catch {
            toast.error("Invalid settings file");
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-4 h-4 animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="proxy_url">Proxy URL (optional)</Label>
          <Input
            id="proxy_url"
            placeholder="http://proxy.example.com:8080"
            {...form.register("proxy_url")}
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="proxy_username">Proxy username (optional)</Label>
          <Input
            id="proxy_username"
            placeholder="username"
            {...form.register("proxy_username")}
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="proxy_password">Proxy password (optional)</Label>
          <div className="mt-1.5 flex gap-2 items-center">
            <div className="relative flex-1">
              <Input
                id="proxy_password"
                type={showPassword ? "text" : "password"}
                placeholder="password"
                {...form.register("proxy_password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="rate_limit_per_minute">
            Rate limit (requests per minute)
          </Label>
          <Input
            id="rate_limit_per_minute"
            type="number"
            min="1"
            max="100"
            {...form.register("rate_limit_per_minute", {
              valueAsNumber: true,
            })}
            className="mt-1.5"
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="debug_mode"
            {...form.register("debug_mode")}
            className="rounded border-gray-300"
          />
          <Label htmlFor="debug_mode" className="cursor-pointer">
            Enable debug mode (verbose logging)
          </Label>
        </div>
      </div>

      <div className="space-y-2">
        <Button
          type="submit"
          disabled={updateMutation.isPending}
          className="w-full"
        >
          {updateMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleExportSettings}
            className="w-full"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleImportSettings}
            className="w-full"
          >
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
        </div>
      </div>
    </form>
  );
}

// ---- Main Settings Page ----
export default function SettingsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your preferences and application configuration
        </p>
      </div>

      {/* Settings Tabs */}
      <Card className="p-6">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
            <TabsTrigger value="llm">LLM</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="general" className="space-y-6">
              <GeneralSettingsTab />
            </TabsContent>

            <TabsContent value="pipeline" className="space-y-6">
              <PipelineSettingsTab />
            </TabsContent>

            <TabsContent value="llm" className="space-y-6">
              <LLMSettingsTab />
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <NotificationSettingsTab />
            </TabsContent>

            <TabsContent value="advanced" className="space-y-6">
              <AdvancedSettingsTab />
            </TabsContent>
          </div>
        </Tabs>
      </Card>
    </div>
  );
}
