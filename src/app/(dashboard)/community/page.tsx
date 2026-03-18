"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UsersRound } from "lucide-react";

export default function CommunityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Community</h1>
        <p className="text-muted-foreground">
          Connect with other job seekers
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Job Seeker Community</CardTitle>
          <CardDescription>Connect, share, and learn</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <UsersRound className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Community features coming soon</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
