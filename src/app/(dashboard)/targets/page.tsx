"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Plus } from "lucide-react";

export default function TargetsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Target List</h1>
          <p className="text-muted-foreground">
            Manage your target companies and roles
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 me-2" />
          Add Target
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Target Companies</CardTitle>
          <CardDescription>Your priority job search targets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No targets added yet</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
