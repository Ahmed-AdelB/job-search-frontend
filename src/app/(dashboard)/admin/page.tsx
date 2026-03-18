"use client";

/**
 * Admin Page - System administration and tenant management
 * Author: Ahmed Adel Bakr Alderai
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Shield,
  Users,
  Wrench,
  Trash2,
  RotateCcw,
  Database,
  RefreshCw,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { apiGet, apiPost } from "@/lib/api-client";
import type { Tenant } from "@/types/api";

const TENANT_STATUS_COLOR: Record<string, string> = {
  active: "bg-green-600",
  suspended: "bg-amber-500",
  cancelled: "bg-red-600",
};

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Administration</h1>
        <p className="text-muted-foreground">
          System management, tenants, and maintenance tools
        </p>
      </div>

      <Tabs defaultValue="tenants">
        <TabsList>
          <TabsTrigger value="tenants">
            <Users className="w-4 h-4 me-2" />
            Tenants
          </TabsTrigger>
          <TabsTrigger value="maintenance">
            <Wrench className="w-4 h-4 me-2" />
            Maintenance
          </TabsTrigger>
          <TabsTrigger value="trash">
            <Trash2 className="w-4 h-4 me-2" />
            Trash
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tenants" className="mt-6">
          <TenantsTab />
        </TabsContent>
        <TabsContent value="maintenance" className="mt-6">
          <MaintenanceTab />
        </TabsContent>
        <TabsContent value="trash" className="mt-6">
          <TrashTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TenantsTab() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "tenants"],
    queryFn: () => apiGet<{ tenants: Tenant[] }>("/api/v1/tenants"),
  });

  const tenants = data?.tenants ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tenant Management</CardTitle>
        <CardDescription>View and manage system tenants</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : tenants.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No tenants configured</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenants.map((tenant) => (
                  <TableRow key={tenant.id}>
                    <TableCell className="font-medium">{tenant.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{tenant.plan}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={TENANT_STATUS_COLOR[tenant.status] ?? "bg-gray-500"}>
                        {tenant.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(tenant.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MaintenanceTab() {
  const queryClient = useQueryClient();

  const vacuumMutation = useMutation({
    mutationFn: () => apiPost<{ status: string }>("/api/v1/maintenance/vacuum", {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin"] }),
  });

  const cacheClearMutation = useMutation({
    mutationFn: () => apiPost<{ status: string }>("/api/v1/maintenance/clear-cache", {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin"] }),
  });

  const healthCheckMutation = useMutation({
    mutationFn: () => apiGet<{ status: string; checks: Record<string, boolean> }>("/api/v1/health"),
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Maintenance Tasks</CardTitle>
          <CardDescription>System maintenance and optimization tools</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div>
              <h4 className="font-medium">Database Vacuum</h4>
              <p className="text-sm text-muted-foreground">Optimize database storage and performance</p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" disabled={vacuumMutation.isPending}>
                  {vacuumMutation.isPending ? (
                    <Loader2 className="w-4 h-4 me-2 animate-spin" />
                  ) : (
                    <Database className="w-4 h-4 me-2" />
                  )}
                  Run Vacuum
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Run Database Vacuum?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will optimize the database. It may take a few minutes during which
                    write operations will be slower.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => vacuumMutation.mutate()}>
                    Run Vacuum
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div>
              <h4 className="font-medium">Clear Cache</h4>
              <p className="text-sm text-muted-foreground">Clear all application caches</p>
            </div>
            <Button
              variant="outline"
              onClick={() => cacheClearMutation.mutate()}
              disabled={cacheClearMutation.isPending}
            >
              {cacheClearMutation.isPending ? (
                <Loader2 className="w-4 h-4 me-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 me-2" />
              )}
              Clear Cache
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div>
              <h4 className="font-medium">Health Check</h4>
              <p className="text-sm text-muted-foreground">Run system health diagnostics</p>
            </div>
            <Button
              variant="outline"
              onClick={() => healthCheckMutation.mutate()}
              disabled={healthCheckMutation.isPending}
            >
              {healthCheckMutation.isPending ? (
                <Loader2 className="w-4 h-4 me-2 animate-spin" />
              ) : (
                <Shield className="w-4 h-4 me-2" />
              )}
              Run Check
            </Button>
          </div>

          {/* Health Check Results */}
          {healthCheckMutation.isSuccess && healthCheckMutation.data && (
            <Card className="border-green-200 dark:border-green-800">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2 text-green-600 font-medium">
                  <CheckCircle2 className="w-5 h-5" />
                  Health Check Results
                </div>
                {healthCheckMutation.data.checks && Object.entries(healthCheckMutation.data.checks).map(([key, ok]) => (
                  <div key={key} className="flex items-center gap-2 text-sm">
                    {ok ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                    <span className="capitalize">{key.replace(/_/g, " ")}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Mutation Status */}
          {vacuumMutation.isSuccess && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle2 className="w-4 h-4" /> Database vacuum completed
            </div>
          )}
          {cacheClearMutation.isSuccess && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle2 className="w-4 h-4" /> Cache cleared successfully
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function TrashTab() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "trash"],
    queryFn: () =>
      apiGet<{ items: { id: string; type: string; name: string; deleted_at: string }[] }>(
        "/api/v1/soft-delete/trash"
      ),
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => apiPost<{ status: string }>(`/api/v1/soft-delete/restore/${id}`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "trash"] }),
  });

  const items = data?.items ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trash / Soft-Deleted Items</CardTitle>
        <CardDescription>Restore or permanently delete soft-deleted items</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Trash2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Trash is empty</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Deleted</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.type}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(item.deleted_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => restoreMutation.mutate(item.id)}
                        disabled={restoreMutation.isPending}
                      >
                        <RotateCcw className="w-4 h-4 me-1" />
                        Restore
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
