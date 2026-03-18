"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ListFilter } from "lucide-react";

export default function TriagePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Triage</h1>
        <p className="text-muted-foreground">
          Review and categorize new job matches
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Job Triage</CardTitle>
          <CardDescription>Approve or reject job recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <ListFilter className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No jobs to triage</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
