"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain } from "lucide-react";

export default function IntelligencePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Intelligence</h1>
        <p className="text-muted-foreground">
          AI-powered insights and analytics
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Market Intelligence</CardTitle>
          <CardDescription>AI-generated insights about the job market</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Intelligence data will appear here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
