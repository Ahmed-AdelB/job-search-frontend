"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Save } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Configure your account and preferences
          </p>
        </div>
        <Button>
          <Save className="w-4 h-4 me-2" />
          Save Changes
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>Manage your account settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Settings form will appear here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
