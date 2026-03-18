"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileClock } from "lucide-react";

export default function LogsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Logs</h1>
        <p className="text-muted-foreground">
          View agent activity and system logs
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity Logs</CardTitle>
          <CardDescription>Recent agent and system activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <FileClock className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No logs to display</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
