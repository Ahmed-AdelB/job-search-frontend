"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle, Download, Trash2, Eye, EyeOff } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { TagInput } from "@/components/ui/tag-input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { usePreferencesStore } from "@/stores/preferences-store"
import {
  useSettings,
  useUpdatePipelineSettings,
  useUpdateGeneralSettings,
  useUpdateNotificationSettings,
} from "@/hooks/use-settings"
import type {
  PipelineSettings,
  GeneralSettings,
  NotificationSettings,
} from "@/hooks/use-settings"
import { toast } from "sonner"

export default function SettingsPage() {
  const router = useRouter()
  const { theme, language, setTheme, setLanguage } = usePreferencesStore()
  const { data: settings, isLoading } = useSettings()

  // Pipeline Settings State
  const [pipelineSettings, setPipelineSettings] = useState<PipelineSettings>({
    auto_apply_enabled: false,
    min_match_score: 70,
    max_applications_per_day: 5,
    preferred_locations: [],
    excluded_companies: [],
    remote_types: [],
  })

  // Notification Settings State
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    email_notifications: true,
    application_status_updates: true,
    interview_reminders: true,
    daily_digest: true,
    notification_email: "",
  })

  // Account Settings State
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    new: "",
    confirm: "",
  })

  const [showDeleteConfirm, setShowDeleteConfirm] = useState("")
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  // Mutations
  const updatePipeline = useUpdatePipelineSettings()
  const updateGeneral = useUpdateGeneralSettings()
  const updateNotifications = useUpdateNotificationSettings()

  // Initialize state from API response
  useEffect(() => {
    if (settings) {
      if (settings.pipeline) {
        setPipelineSettings(settings.pipeline)
      }
      if (settings.notifications) {
        setNotificationSettings(settings.notifications)
      }
    }
  }, [settings])

  const handleSavePipelineSettings = async () => {
    await updatePipeline.mutateAsync(pipelineSettings)
  }

  const handleSaveGeneralSettings = async () => {
    const generalSettings: GeneralSettings = {
      theme: theme as "light" | "dark" | "system",
      language: language as "en" | "ar",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      notifications_enabled: notificationSettings.email_notifications,
    }
    await updateGeneral.mutateAsync(generalSettings)
  }

  const handleSaveNotificationSettings = async () => {
    await updateNotifications.mutateAsync(notificationSettings)
  }

  const handleChangePassword = async () => {
    if (!passwordForm.current || !passwordForm.new || !passwordForm.confirm) {
      toast.error("Please fill in all password fields")
      return
    }

    if (passwordForm.new !== passwordForm.confirm) {
      toast.error("New passwords do not match")
      return
    }

    if (passwordForm.new.length < 8) {
      toast.error("Password must be at least 8 characters")
      return
    }

    try {
      // TODO: Implement password change API call
      toast.success("Password changed successfully")
      setPasswordForm({ current: "", new: "", confirm: "" })
    } catch (error) {
      toast.error("Failed to change password")
    }
  }

  const handleDeleteAccount = async () => {
    if (showDeleteConfirm !== "DELETE") {
      toast.error("Please type DELETE to confirm")
      return
    }

    try {
      // TODO: Implement account deletion API call
      toast.success("Account deleted successfully")
      router.push("/auth/login")
    } catch (error) {
      toast.error("Failed to delete account")
    }
  }

  const handleExportData = () => {
    // TODO: Implement data export API call
    toast.info("Exporting data...")
    setTimeout(() => {
      const mockData = {
        settings: pipelineSettings,
        notifications: notificationSettings,
        exportedAt: new Date().toISOString(),
      }
      const blob = new Blob([JSON.stringify(mockData, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `job-search-data-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success("Data exported successfully")
    }, 1000)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 w-32 rounded bg-muted mb-2" />
          <div className="h-4 w-64 rounded bg-muted" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Configure your account, pipeline, and preferences
          </p>
        </div>
      </div>

      <Tabs defaultValue="pipeline" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        {/* Pipeline Settings Tab */}
        <TabsContent value="pipeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pipeline Settings</CardTitle>
              <CardDescription>
                Configure job application automation and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Auto Apply Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Auto Apply</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Automatically apply to matching jobs
                  </p>
                </div>
                <Switch
                  checked={pipelineSettings.auto_apply_enabled}
                  onCheckedChange={(checked) =>
                    setPipelineSettings({
                      ...pipelineSettings,
                      auto_apply_enabled: checked,
                    })
                  }
                />
              </div>

              {/* Min Match Score Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-base">Minimum Match Score</Label>
                  <span className="text-lg font-semibold text-primary">
                    {pipelineSettings.min_match_score}%
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Only apply to jobs matching this score or higher
                </p>
                <Slider
                  value={[pipelineSettings.min_match_score]}
                  onValueChange={(value) =>
                    setPipelineSettings({
                      ...pipelineSettings,
                      min_match_score: value[0],
                    })
                  }
                  min={0}
                  max={100}
                  step={5}
                  className="mt-4"
                />
              </div>

              {/* Max Applications Per Day */}
              <div className="space-y-2">
                <Label htmlFor="max-apps" className="text-base">
                  Max Applications Per Day
                </Label>
                <p className="text-sm text-muted-foreground">
                  Limit the number of applications submitted daily
                </p>
                <Input
                  id="max-apps"
                  type="number"
                  min={1}
                  max={100}
                  value={pipelineSettings.max_applications_per_day}
                  onChange={(e) =>
                    setPipelineSettings({
                      ...pipelineSettings,
                      max_applications_per_day: parseInt(e.target.value) || 0,
                    })
                  }
                  className="mt-2"
                />
              </div>

              {/* Preferred Locations */}
              <div className="space-y-2">
                <Label className="text-base">Preferred Locations</Label>
                <p className="text-sm text-muted-foreground">
                  Add locations you're interested in (e.g., San Francisco, NYC, Toronto)
                </p>
                <TagInput
                  value={pipelineSettings.preferred_locations}
                  onChange={(locations) =>
                    setPipelineSettings({
                      ...pipelineSettings,
                      preferred_locations: locations,
                    })
                  }
                  placeholder="Add location and press Enter"
                  className="mt-2"
                />
              </div>

              {/* Excluded Companies */}
              <div className="space-y-2">
                <Label className="text-base">Excluded Companies</Label>
                <p className="text-sm text-muted-foreground">
                  Companies you don't want to apply to
                </p>
                <TagInput
                  value={pipelineSettings.excluded_companies}
                  onChange={(companies) =>
                    setPipelineSettings({
                      ...pipelineSettings,
                      excluded_companies: companies,
                    })
                  }
                  placeholder="Add company and press Enter"
                  className="mt-2"
                />
              </div>

              {/* Remote Type Preferences */}
              <div className="space-y-3">
                <Label className="text-base">Remote Type Preferences</Label>
                <p className="text-sm text-muted-foreground">
                  Which work arrangements are you interested in?
                </p>
                <div className="space-y-2 mt-3">
                  {["remote", "hybrid", "on-site"].map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={type}
                        checked={pipelineSettings.remote_types.includes(type)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setPipelineSettings({
                              ...pipelineSettings,
                              remote_types: [
                                ...pipelineSettings.remote_types,
                                type,
                              ],
                            })
                          } else {
                            setPipelineSettings({
                              ...pipelineSettings,
                              remote_types: pipelineSettings.remote_types.filter(
                                (t) => t !== type
                              ),
                            })
                          }
                        }}
                      />
                      <Label
                        htmlFor={type}
                        className="text-sm font-normal cursor-pointer capitalize"
                      >
                        {type}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleSavePipelineSettings}
                  disabled={updatePipeline.isPending}
                  className="w-full sm:w-auto"
                >
                  {updatePipeline.isPending ? "Saving..." : "Save Pipeline Settings"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize how the application looks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Theme */}
              <div className="space-y-3">
                <Label className="text-base">Theme</Label>
                <RadioGroup value={theme} onValueChange={(value) => setTheme(value as "light" | "dark" | "system")}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="system" id="theme-system" />
                    <Label
                      htmlFor="theme-system"
                      className="text-sm font-normal cursor-pointer"
                    >
                      System
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="light" id="theme-light" />
                    <Label
                      htmlFor="theme-light"
                      className="text-sm font-normal cursor-pointer"
                    >
                      Light
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dark" id="theme-dark" />
                    <Label
                      htmlFor="theme-dark"
                      className="text-sm font-normal cursor-pointer"
                    >
                      Dark
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Language */}
              <div className="space-y-3">
                <Label htmlFor="language" className="text-base">
                  Language
                </Label>
                <p className="text-sm text-muted-foreground">
                  {language === "ar" && "Changing to English will switch the layout from RTL to LTR"}
                  {language === "en" && "Changing to Arabic will switch the layout to RTL"}
                </p>
                <Select value={language} onValueChange={(value) => setLanguage(value as "en" | "ar")}>
                  <SelectTrigger id="language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ar">العربية</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Save Button */}
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleSaveGeneralSettings}
                  disabled={updateGeneral.isPending}
                  className="w-full sm:w-auto"
                >
                  {updateGeneral.isPending ? "Saving..." : "Save Appearance Settings"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Manage how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email Notifications Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Receive email notifications for important events
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.email_notifications}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      email_notifications: checked,
                    })
                  }
                />
              </div>

              {/* Job Match Alerts Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Job Match Alerts</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Get notified when jobs matching your criteria are found
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.application_status_updates}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      application_status_updates: checked,
                    })
                  }
                />
              </div>

              {/* Interview Reminders Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Interview Reminders</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Receive reminders before scheduled interviews
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.interview_reminders}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      interview_reminders: checked,
                    })
                  }
                />
              </div>

              {/* Weekly Digest Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Weekly Digest</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Receive a weekly summary of your job search activity
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.daily_digest}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      daily_digest: checked,
                    })
                  }
                />
              </div>

              {/* Notification Email */}
              <div className="space-y-2">
                <Label htmlFor="notification-email" className="text-base">
                  Notification Email
                </Label>
                <p className="text-sm text-muted-foreground">
                  The email address where notifications will be sent
                </p>
                <Input
                  id="notification-email"
                  type="email"
                  value={notificationSettings.notification_email}
                  onChange={(e) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      notification_email: e.target.value,
                    })
                  }
                  placeholder="your.email@example.com"
                  className="mt-2"
                />
              </div>

              {/* Save Button */}
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleSaveNotificationSettings}
                  disabled={updateNotifications.isPending}
                  className="w-full sm:w-auto"
                >
                  {updateNotifications.isPending ? "Saving..." : "Save Notification Settings"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="account" className="space-y-4">
          {/* Change Password Card */}
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your account password
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Current Password */}
              <div className="space-y-2">
                <Label htmlFor="current-password" className="text-sm">
                  Current Password
                </Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showPasswords.current ? "text" : "password"}
                    value={passwordForm.current}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        current: e.target.value,
                      })
                    }
                    placeholder="Enter current password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() =>
                      setShowPasswords({
                        ...showPasswords,
                        current: !showPasswords.current,
                      })
                    }
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                  >
                    {showPasswords.current ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-sm">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordForm.new}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, new: e.target.value })
                    }
                    placeholder="Enter new password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() =>
                      setShowPasswords({
                        ...showPasswords,
                        new: !showPasswords.new,
                      })
                    }
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                  >
                    {showPasswords.new ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-sm">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordForm.confirm}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        confirm: e.target.value,
                      })
                    }
                    placeholder="Confirm new password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() =>
                      setShowPasswords({
                        ...showPasswords,
                        confirm: !showPasswords.confirm,
                      })
                    }
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button onClick={handleChangePassword} className="w-full sm:w-auto">
                Change Password
              </Button>
            </CardContent>
          </Card>

          {/* Export Data Card */}
          <Card>
            <CardHeader>
              <CardTitle>Export Data</CardTitle>
              <CardDescription>
                Download all your data in JSON format
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleExportData}
                variant="outline"
                className="w-full sm:w-auto"
              >
                <Download className="w-4 h-4 me-2" />
                Export Data
              </Button>
            </CardContent>
          </Card>

          {/* Delete Account Card */}
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
                  <Button variant="destructive" className="w-full sm:w-auto">
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
                      <p>
                        This action cannot be undone. This will permanently delete your
                        account and remove all of your data from our servers.
                      </p>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Type DELETE to confirm:
                        </Label>
                        <Input
                          value={showDeleteConfirm}
                          onChange={(e) => setShowDeleteConfirm(e.target.value)}
                          placeholder='Type "DELETE"'
                          className="uppercase"
                        />
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      disabled={showDeleteConfirm !== "DELETE"}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      Delete Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
