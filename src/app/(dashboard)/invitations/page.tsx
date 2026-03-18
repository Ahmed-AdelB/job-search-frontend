"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MailOpen } from "lucide-react";

export default function InvitationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Invitations</h1>
        <p className="text-muted-foreground">
          Manage job referrals and invitations
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Invitations</CardTitle>
          <CardDescription>Job referrals and network invitations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <MailOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No invitations yet</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
