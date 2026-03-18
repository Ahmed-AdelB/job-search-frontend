"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Plus } from "lucide-react";

export default function InterviewsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Interviews</h1>
          <p className="text-muted-foreground">
            Schedule and prepare for interviews
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 me-2" />
          Schedule Interview
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Interviews</CardTitle>
          <CardDescription>Your scheduled interviews</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No upcoming interviews</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
