"use client";

/**
 * Settings Page - Account, pipeline, and preferences configuration
 * Author: Ahmed Adel Bakr Alderai
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Settings,
  Sliders,
  Bell,
  User,
  Download,
  Trash2,
  AlertTriangle,
  Eye,
  EyeOff,
  CheckCircle2,
  Loader2,
  Save,
  Palette,
} from "lucide-react";
import { apiGet, apiPut, apiPost } from "@/lib/api-client";
import { usePreferencesStore } from "@/stores/preferences-store";
import type { PipelineSettings } from "@/types/api";

interface NotificationSettings {
  email_notifications: boolean;
  application_status_updates: boolean;
  interview_reminders: boolean;
  daily_digest: boolean;
  notification_email: string;
}

interface SettingsResponse {
  pipeline: PipelineSettings;
  notifications: NotificationSettings;
}

export default function SettingsPage() {
  const router = useRouter();
  const { theme, language, setTheme, setLanguage } = usePreferencesStore();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: () => apiGet<SettingsResponse>("/api/v1/settings"),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Configure your account and preferences</p>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Configure your account, pipeline, and preferences
        </p>
      </div>

      <Tabs defaultValue="pipeline" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pipeline">
            <Sliders className="w-4 h-4 me-2" />
            Pipeline
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Palette className="w-4 h-4 me-2" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 me-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="account">
            <User className="w-4 h-4 me-2" />
            Account
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="space-y-4">
          <PipelineTab initialSettings={settings?.pipeline} />
        </TabsContent>
        <TabsContent value="appearance" className="space-y-4">
          <AppearanceTab
            theme={theme}
            language={language}
            setTheme={setTheme}
            setLanguage={setLanguage}
          />
        </TabsContent>
        <TabsContent value="notifications" className="space-y-4">
          <NotificationsTab initialSettings={settings?.notifications} />
        </TabsContent>
        <TabsContent value="account" className="space-y-4">
          <AccountTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PipelineTab({ initialSettings }: { initialSettings?: PipelineSettings }) {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<PipelineSettings>({
    auto_apply_enabled: false,
    min_match_score: 70,
    max_applications_per_day: 5,
    preferred_locations: [],
    excluded_companies: [],
    remote_types: [],
  });

  useEffect(() => {
    if (initialSettings) setSettings(initialSettings);
  }, [initialSettings]);

  const saveMutation = useMutation({
    mutationFn: (data: PipelineSettings) =>
      apiPut<{ status: string }>("/api/v1/settings/pipeline", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["settings"] }),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pipeline Settings</CardTitle>
        <CardDescription>Configure job application automation and preferences</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Auto Apply</p>
            <p className="text-sm text-muted-foreground">Automatically apply to matching jobs</p>
          </div>
          <Switch
            checked={settings.auto_apply_enabled}
            onCheckedChange={(v) => setSettings({ ...settings, auto_apply_enabled: v })}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="font-medium">Minimum Match Score</p>
            <span className="text-lg font-semibold text-primary">{settings.min_match_score}%</span>
          </div>
          <p className="text-sm text-muted-foreground">Only apply to jobs matching this score or higher</p>
          <Input
            type="range"
            min={0}
            max={100}
            step={5}
            value={settings.min_match_score}
            onChange={(e) => setSettings({ ...settings, min_match_score: parseInt(e.target.value) })}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <p className="font-medium">Max Applications Per Day</p>
          <p className="text-sm text-muted-foreground">Limit daily application submissions</p>
          <Input
            type="number"
            min={1}
            max={100}
            value={settings.max_applications_per_day}
            onChange={(e) => setSettings({ ...settings, max_applications_per_day: parseInt(e.target.value) || 1 })}
            className="w-[120px]"
          />
        </div>

        <div className="space-y-2">
          <p className="font-medium">Remote Type Preferences</p>
          <p className="text-sm text-muted-foreground">Which work arrangements are you interested in?</p>
          <div className="flex flex-wrap gap-3 mt-2">
            {["remote", "hybrid", "on-site"].map((type) => (
              <label key={type} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.remote_types.includes(type)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSettings({ ...settings, remote_types: [...settings.remote_types, type] });
                    } else {
                      setSettings({ ...settings, remote_types: settings.remote_types.filter((t) => t !== type) });
                    }
                  }}
                  className="rounded"
                />
                <span className="text-sm capitalize">{type}</span>
              </label>
            ))}
          </div>
        </div>

        <Button
          onClick={() => saveMutation.mutate(settings)}
          disabled={saveMutation.isPending}
        >
          {saveMutation.isPending ? (
            <Loader2 className="w-4 h-4 me-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 me-2" />
          )}
          Save Pipeline Settings
        </Button>

        {saveMutation.isSuccess && (
          <p className="text-sm text-green-600 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" /> Settings saved
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function AppearanceTab({
  theme,
  language,
  setTheme,
  setLanguage,
}: {
  theme: string;
  language: string;
  setTheme: (t: string) => void;
  setLanguage: (l: string) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>Customize how the application looks</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <p className="font-medium">Theme</p>
          <div className="flex gap-3">
            {[
              { value: "system", label: "System" },
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
            ].map((option) => (
              <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="theme"
                  value={option.value}
                  checked={theme === option.value}
                  onChange={() => setTheme(option.value)}
                />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <p className="font-medium">Language</p>
          <p className="text-sm text-muted-foreground">
            {language === "ar"
              ? "Changing to English will switch the layout from RTL to LTR"
              : "Changing to Arabic will switch the layout to RTL"}
          </p>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="ar">{"\u0627\u0644\u0639\u0631\u0628\u064A\u0629"}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}

function NotificationsTab({ initialSettings }: { initialSettings?: NotificationSettings }) {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<NotificationSettings>({
    email_notifications: true,
    application_status_updates: true,
    interview_reminders: true,
    daily_digest: true,
    notification_email: "",
  });

  useEffect(() => {
    if (initialSettings) setSettings(initialSettings);
  }, [initialSettings]);

  const saveMutation = useMutation({
    mutationFn: (data: NotificationSettings) =>
      apiPut<{ status: string }>("/api/v1/settings/notifications", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["settings"] }),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>Manage how you receive notifications</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {[
          { key: "email_notifications" as const, label: "Email Notifications", desc: "Receive email notifications for important events" },
          { key: "application_status_updates" as const, label: "Application Updates", desc: "Get notified when application status changes" },
          { key: "interview_reminders" as const, label: "Interview Reminders", desc: "Receive reminders before scheduled interviews" },
          { key: "daily_digest" as const, label: "Daily Digest", desc: "Receive a daily summary of your job search activity" },
        ].map((item) => (
          <div key={item.key} className="flex items-center justify-between">
            <div>
              <p className="font-medium">{item.label}</p>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
            <Switch
              checked={settings[item.key]}
              onCheckedChange={(v) => setSettings({ ...settings, [item.key]: v })}
            />
          </div>
        ))}

        <div className="space-y-2">
          <p className="font-medium">Notification Email</p>
          <p className="text-sm text-muted-foreground">Where notifications are sent</p>
          <Input
            type="email"
            value={settings.notification_email}
            onChange={(e) => setSettings({ ...settings, notification_email: e.target.value })}
            placeholder="your.email@example.com"
            className="max-w-sm"
          />
        </div>

        <Button
          onClick={() => saveMutation.mutate(settings)}
          disabled={saveMutation.isPending}
        >
          {saveMutation.isPending ? (
            <Loader2 className="w-4 h-4 me-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 me-2" />
          )}
          Save Notification Settings
        </Button>

        {saveMutation.isSuccess && (
          <p className="text-sm text-green-600 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" /> Notification settings saved
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function AccountTab() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    newPassword: "",
    confirm: "",
  });
  const [deleteConfirm, setDeleteConfirm] = useState("");

  const handleExportData = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      format: "json",
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `job-search-data-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your account password</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {["current", "newPassword", "confirm"].map((field) => (
            <div key={field} className="space-y-1">
              <label className="text-sm font-medium capitalize">
                {field === "newPassword" ? "New Password" : field === "confirm" ? "Confirm Password" : "Current Password"}
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={passwordForm[field as keyof typeof passwordForm]}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, [field]: e.target.value })
                  }
                  placeholder={`Enter ${field === "newPassword" ? "new" : field} password`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          ))}
          <Button>Change Password</Button>
        </CardContent>
      </Card>

      {/* Export Data */}
      <Card>
        <CardHeader>
          <CardTitle>Export Data</CardTitle>
          <CardDescription>Download all your data in JSON format</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={handleExportData}>
            <Download className="w-4 h-4 me-2" />
            Export Data
          </Button>
        </CardContent>
      </Card>

      {/* Delete Account */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-destructive">Delete Account</CardTitle>
          <CardDescription>
            Permanently delete your account and all associated data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="w-4 h-4 me-2" />
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  Delete Account
                </AlertDialogTitle>
                <AlertDialogDescription className="space-y-3">
                  <span>
                    This action cannot be undone. This will permanently delete your
                    account and remove all of your data from our servers.
                  </span>
                  <div className="space-y-2 mt-3">
                    <label className="text-sm font-medium">Type DELETE to confirm:</label>
                    <Input
                      value={deleteConfirm}
                      onChange={(e) => setDeleteConfirm(e.target.value)}
                      placeholder='Type "DELETE"'
                      className="uppercase"
                    />
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  disabled={deleteConfirm !== "DELETE"}
                  className="bg-destructive hover:bg-destructive/90"
                  onClick={() => router.push("/login")}
                >
                  Delete Account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
