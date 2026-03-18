"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Rocket } from "lucide-react";

export default function DeployPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Deploy</h1>
        <p className="text-muted-foreground">
          Deploy and manage your job search agents
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Deployment Center</CardTitle>
          <CardDescription>Manage agent deployments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Rocket className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No deployments yet</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
