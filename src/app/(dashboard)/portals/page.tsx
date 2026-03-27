"use client";

/**
 * Portals Page - Manage job portal integrations
 * Author: Ahmed Adel Bakr Alderai
 */

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Globe,
  Plus,
  RefreshCw,
  Trash2,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { usePortals, useCreatePortal, useDeletePortal, useSyncPortal } from "@/hooks/use-portals";
import { toast } from "sonner";
import type { Portal } from "@/types/api";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 100, damping: 15 },
  },
};

export default function PortalsPage() {
  const { data, isLoading } = usePortals();
  const createPortal = useCreatePortal();
  const deletePortal = useDeletePortal();
  const syncPortal = useSyncPortal();
  const [showAdd, setShowAdd] = useState(false);
  const [newPortal, setNewPortal] = useState({ name: "", type: "linkedin", url: "" });

  const portals = data?.portals ?? [];

  const handleCreate = () => {
    if (!newPortal.name || !newPortal.url) return;
    createPortal.mutate(newPortal, {
      onSuccess: () => {
        setShowAdd(false);
        setNewPortal({ name: "", type: "linkedin", url: "" });
      },
      onError: (error: Error) => {
        toast.error("Failed to register portal", { description: error.message });
      },
    });
  };

  if (isLoading) {
    return (
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Portals</h1>
          <p className="text-muted-foreground">Manage job portal integrations</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.3 }}
            >
              <Skeleton className="h-48 w-full" />
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Portals</h1>
          <p className="text-muted-foreground">
            Manage job portal integrations and sync settings
          </p>
        </div>
        <Button onClick={() => setShowAdd(!showAdd)}>
          <Plus className="w-4 h-4 me-2" />
          Add Portal
        </Button>
      </div>

      {/* Add Portal Form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Register New Portal</CardTitle>
                <CardDescription>Connect a new job board or portal</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Portal Name</label>
                    <Input
                      placeholder="e.g. LinkedIn"
                      value={newPortal.name}
                      onChange={(e) => setNewPortal({ ...newPortal, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Type</label>
                    <Select
                      value={newPortal.type}
                      onValueChange={(v) => { if (v) setNewPortal({ ...newPortal, type: v }); }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                        <SelectItem value="indeed">Indeed</SelectItem>
                        <SelectItem value="glassdoor">Glassdoor</SelectItem>
                        <SelectItem value="greenhouse">Greenhouse</SelectItem>
                        <SelectItem value="workday">Workday</SelectItem>
                        <SelectItem value="lever">Lever</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">URL</label>
                    <Input
                      placeholder="https://..."
                      value={newPortal.url}
                      onChange={(e) => setNewPortal({ ...newPortal, url: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreate} disabled={createPortal.isPending}>
                    {createPortal.isPending && <Loader2 className="w-4 h-4 me-2 animate-spin" />}
                    Register Portal
                  </Button>
                  <Button variant="outline" onClick={() => setShowAdd(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Portal Cards */}
      {portals.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No portals registered</p>
              <p className="text-sm mt-1">Click "Add Portal" to connect your first job board</p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {portals.map((portal: Portal) => (
            <motion.div key={portal.id} variants={itemVariants}>
              <Card className="relative overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        {portal.name}
                      </CardTitle>
                      <CardDescription>{portal.type}</CardDescription>
                    </div>
                    <Badge
                      variant={portal.status === "active" ? "default" : "secondary"}
                      className={portal.status === "active" ? "bg-green-600" : ""}
                    >
                      {portal.status === "active" ? (
                        <CheckCircle2 className="w-3 h-3 me-1" />
                      ) : (
                        <XCircle className="w-3 h-3 me-1" />
                      )}
                      {portal.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {portal.url && (
                    <a
                      href={portal.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {portal.url}
                    </a>
                  )}
                  {portal.last_sync && (
                    <p className="text-xs text-muted-foreground">
                      Last synced: {new Date(portal.last_sync).toLocaleString()}
                    </p>
                  )}
                  {portal.jobs_count !== undefined && (
                    <p className="text-sm">
                      <span className="font-semibold">{portal.jobs_count}</span> jobs imported
                    </p>
                  )}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => syncPortal.mutate(portal.name)}
                      disabled={syncPortal.isPending}
                      aria-label={`Sync jobs from ${portal.name}`}
                    >
                      <RefreshCw className={`w-3 h-3 me-1 ${syncPortal.isPending ? "animate-spin" : ""}`} />
                      Sync
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive"
                          aria-label={`Remove ${portal.name} portal`}
                        >
                          <Trash2 className="w-3 h-3 me-1" />
                          Remove
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove Portal</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will unregister &ldquo;{portal.name}&rdquo;. Imported jobs will remain.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deletePortal.mutate(portal.id)}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
