/**
 * Admin Control Panel - Tenant, maintenance, MCP debug, and trash management
 * Author: Ahmed Adel Bakr Alderai
 */

"use client"

import { useState } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import {
  Shield,
  Plus,
  Trash2,
  RotateCcw,
  Database,
  Activity,
  Settings,
  AlertTriangle,
  Check,
  Loader2,
  Edit,
  Lock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PageSkeleton } from "@/components/shared/loading-skeleton"
import { EmptyState } from "@/components/shared/empty-state"
import { apiGet, apiPost } from "@/lib/api-client"
import { toast } from "sonner"

// Types
interface Tenant {
  id: string
  name: string
  slug: string
  plan: "free" | "starter" | "professional" | "enterprise"
  user_count: number
  status: "active" | "suspended" | "cancelled"
  created_at: string
}

interface SystemHealth {
  cpu_usage: number
  memory_usage: number
  disk_usage: number
  uptime_seconds: number
  request_count_hour: number
  error_count_hour: number
}

interface MCPSession {
  id: string
  name: string
  status: "connected" | "disconnected" | "error"
  last_activity: string
}

interface MCPTool {
  name: string
  description: string
  input_schema: Record<string, unknown>
}

interface SoftDeletedItem {
  id: string
  entity_type: string
  entity_id: string
  deleted_at: string
  deleted_by: string
}

// Add Tenant Dialog
function AddTenantDialog() {
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [plan, setPlan] = useState<"free" | "starter" | "professional" | "enterprise">("free")
  const [open, setOpen] = useState(false)

  const addTenantMutation = useMutation({
    mutationFn: async () => {
      return await apiPost("/api/admin/tenants", {
        name,
        slug,
        plan,
      })
    },
    onSuccess: () => {
      toast.success("Tenant created successfully")
      setName("")
      setSlug("")
      setPlan("free")
      setOpen(false)
    },
    onError: (error: Error) => {
      toast.error("Failed to create tenant", {
        description: error.message,
      })
    },
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Tenant
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Tenant</DialogTitle>
          <DialogDescription>
            Add a new tenant to the system
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Tenant Name</Label>
            <Input
              id="name"
              placeholder="Acme Corp"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              placeholder="acme-corp"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="plan">Plan</Label>
            <Select value={plan} onValueChange={(v) => setPlan(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="starter">Starter</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={() => addTenantMutation.mutate()}
            disabled={addTenantMutation.isPending || !name || !slug}
            className="w-full"
          >
            {addTenantMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Create Tenant"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Maintenance Tab
function MaintenanceTab() {
  const { data: health, isLoading: healthLoading } = useQuery({
    queryKey: ["system-health"],
    queryFn: async () => {
      return await apiGet<SystemHealth>("/api/admin/health")
    },
  })

  const cleanTasksMutation = useMutation({
    mutationFn: async () => {
      return await apiPost("/api/admin/maintenance/clean-tasks", {})
    },
    onSuccess: () => {
      toast.success("Cleanup completed successfully")
    },
    onError: (error: Error) => {
      toast.error("Cleanup failed", {
        description: error.message,
      })
    },
  })

  if (healthLoading) {
    return <PageSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* System Health */}
      {health && (
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold text-sm">System Health</h3>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                CPU Usage
              </p>
              <div className="space-y-1">
                <p className="text-2xl font-bold">{health.cpu_usage.toFixed(1)}%</p>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      health.cpu_usage > 80
                        ? "bg-red-500"
                        : health.cpu_usage > 50
                          ? "bg-amber-500"
                          : "bg-green-500"
                    }`}
                    style={{ width: `${health.cpu_usage}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Memory Usage
              </p>
              <div className="space-y-1">
                <p className="text-2xl font-bold">{health.memory_usage.toFixed(1)}%</p>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      health.memory_usage > 80
                        ? "bg-red-500"
                        : health.memory_usage > 50
                          ? "bg-amber-500"
                          : "bg-green-500"
                    }`}
                    style={{ width: `${health.memory_usage}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Disk Usage
              </p>
              <div className="space-y-1">
                <p className="text-2xl font-bold">{health.disk_usage.toFixed(1)}%</p>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      health.disk_usage > 90
                        ? "bg-red-500"
                        : health.disk_usage > 70
                          ? "bg-amber-500"
                          : "bg-green-500"
                    }`}
                    style={{ width: `${health.disk_usage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-3 pt-4 border-t">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                Uptime
              </p>
              <p className="text-sm font-mono">
                {Math.floor(health.uptime_seconds / 86400)}d{" "}
                {Math.floor((health.uptime_seconds % 86400) / 3600)}h
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                Requests (1h)
              </p>
              <p className="text-sm font-mono">{health.request_count_hour}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                Errors (1h)
              </p>
              <p className="text-sm font-mono text-red-600">
                {health.error_count_hour}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Cleanup Actions */}
      <Card className="p-6 space-y-4">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          Maintenance Tasks
        </h3>

        <Button
          onClick={() => cleanTasksMutation.mutate()}
          disabled={cleanTasksMutation.isPending}
          variant="outline"
          className="gap-2"
        >
          {cleanTasksMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Database className="h-4 w-4" />
          )}
          Clean Abandoned Tasks
        </Button>
      </Card>
    </div>
  )
}

// MCP Debug Tab
function MCPDebugTab() {
  const { data: mcp, isLoading } = useQuery({
    queryKey: ["mcp-debug"],
    queryFn: async () => {
      return await apiGet<{
        sessions: MCPSession[]
        tools: MCPTool[]
      }>("/api/admin/mcp")
    },
  })

  if (isLoading) {
    return <PageSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Sessions */}
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-sm">Active Sessions</h3>
          <p className="text-xs text-muted-foreground mt-1">
            {mcp?.sessions.length || 0} sessions
          </p>
        </div>

        {mcp?.sessions && mcp.sessions.length > 0 ? (
          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Activity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mcp.sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="font-mono text-sm">
                      {session.name}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          session.status === "connected"
                            ? "default"
                            : session.status === "error"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {session.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(session.last_activity).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        ) : (
          <EmptyState
            icon={Activity}
            title="No active sessions"
            description="MCP sessions will appear here"
          />
        )}
      </div>

      {/* Available Tools */}
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-sm">Available Tools</h3>
          <p className="text-xs text-muted-foreground mt-1">
            {mcp?.tools.length || 0} tools
          </p>
        </div>

        <div className="grid gap-4">
          {mcp?.tools && mcp.tools.length > 0 ? (
            mcp.tools.map((tool) => (
              <Card key={tool.name} className="p-4">
                <div className="space-y-2">
                  <h4 className="font-mono text-sm font-semibold">
                    {tool.name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {tool.description}
                  </p>
                  {Object.keys(tool.input_schema).length > 0 && (
                    <details className="text-xs">
                      <summary className="cursor-pointer font-medium">
                        Input Schema ({Object.keys(tool.input_schema).length}{" "}
                        fields)
                      </summary>
                      <pre className="mt-2 bg-muted p-2 rounded overflow-x-auto">
                        {JSON.stringify(tool.input_schema, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </Card>
            ))
          ) : (
            <EmptyState
              icon={Settings}
              title="No tools available"
              description="MCP tools will appear here"
            />
          )}
        </div>
      </div>
    </div>
  )
}

// Trash Tab
function TrashTab() {
  const { data: trash, isLoading, refetch } = useQuery({
    queryKey: ["soft-deleted"],
    queryFn: async () => {
      return await apiGet<{
        items: SoftDeletedItem[]
      }>("/api/admin/trash")
    },
  })

  const restoreMutation = useMutation({
    mutationFn: async (itemId: string) => {
      return await apiPost(`/api/admin/trash/${itemId}/restore`, {})
    },
    onSuccess: () => {
      toast.success("Item restored successfully")
      refetch()
    },
    onError: (error: Error) => {
      toast.error("Failed to restore item", {
        description: error.message,
      })
    },
  })

  const permanentDeleteMutation = useMutation({
    mutationFn: async (itemId: string) => {
      return await apiPost(`/api/admin/trash/${itemId}/delete`, {})
    },
    onSuccess: () => {
      toast.success("Item permanently deleted")
      refetch()
    },
    onError: (error: Error) => {
      toast.error("Failed to delete item", {
        description: error.message,
      })
    },
  })

  if (isLoading) {
    return <PageSkeleton />
  }

  return (
    <div className="space-y-4">
      {trash?.items && trash.items.length > 0 ? (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Entity Type</TableHead>
                <TableHead>Entity ID</TableHead>
                <TableHead>Deleted By</TableHead>
                <TableHead>Deleted At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trash.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-sm">
                    {item.entity_type}
                  </TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {item.entity_id}
                  </TableCell>
                  <TableCell className="text-sm">{item.deleted_by}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(item.deleted_at).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => restoreMutation.mutate(item.id)}
                      disabled={restoreMutation.isPending}
                      className="gap-1"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Restore
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => permanentDeleteMutation.mutate(item.id)}
                      disabled={permanentDeleteMutation.isPending}
                      className="gap-1"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <EmptyState
          icon={Trash2}
          title="Trash is empty"
          description="Deleted items will appear here"
        />
      )}
    </div>
  )
}

// Tenants Tab
function TenantsTab() {
  const { data: response, isLoading, refetch } = useQuery({
    queryKey: ["tenants"],
    queryFn: async () => {
      return await apiGet<{
        tenants: Tenant[]
      }>("/api/admin/tenants")
    },
  })

  const tenants = response?.tenants || []

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <AddTenantDialog />
      </div>

      {isLoading ? (
        <PageSkeleton />
      ) : tenants.length > 0 ? (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenants.map((tenant) => (
                <TableRow key={tenant.id}>
                  <TableCell className="font-semibold">{tenant.name}</TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {tenant.slug}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {tenant.plan}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{tenant.user_count}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        tenant.status === "active"
                          ? "default"
                          : tenant.status === "suspended"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {tenant.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(tenant.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button size="sm" variant="ghost" className="gap-1">
                      <Edit className="h-3 w-3" />
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <EmptyState
          icon={Lock}
          title="No tenants"
          description="Create your first tenant to get started"
          action={{
            label: "Create Tenant",
            onClick: () => refetch(),
          }}
        />
      )}
    </div>
  )
}

// Main Admin Page
export default function AdminPage() {
  return (
    <div className="space-y-6">
      {/* Header with Warning */}
      <div className="space-y-4">
        <div className="flex items-start gap-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg p-4">
          <Shield className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-sm text-red-900 dark:text-red-200">
              Admin Only Access
            </p>
            <p className="text-xs text-red-800 dark:text-red-300">
              This section contains sensitive operations. All actions are logged
              and subject to audit review.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
          <p className="text-muted-foreground">
            Manage system configuration, tenants, and maintenance
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="tenants" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tenants">Tenants</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="mcp">MCP Debug</TabsTrigger>
          <TabsTrigger value="trash">Trash</TabsTrigger>
        </TabsList>

        <TabsContent value="tenants" className="space-y-4">
          <TenantsTab />
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <MaintenanceTab />
        </TabsContent>

        <TabsContent value="mcp" className="space-y-4">
          <MCPDebugTab />
        </TabsContent>

        <TabsContent value="trash" className="space-y-4">
          <TrashTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
