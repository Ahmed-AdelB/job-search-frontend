"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, Plus } from "lucide-react";

export default function AgentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Agents</h1>
          <p className="text-muted-foreground">
            Manage your AI automation agents
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 me-2" />
          Create Agent
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Agents</CardTitle>
          <CardDescription>Active and paused automation agents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No agents configured yet</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
