"use client";

/**
 * Interviews Page - Schedule and prepare for interviews
 * Author: Ahmed Adel Bakr Alderai
 */

import { useState } from "react";
import { motion } from "motion/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Calendar,
  Plus,
  MoreHorizontal,
  Video,
  Phone,
  MapPin,
  Code2,
  Users,
  Star,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  ExternalLink,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { apiGet, apiPost, apiPut } from "@/lib/api-client";
import type { Interview } from "@/types/api";

const TYPE_ICON: Record<string, React.ElementType> = {
  phone: Phone,
  video: Video,
  onsite: MapPin,
  technical: Code2,
  behavioral: Users,
  final: Star,
};

const TYPE_COLOR: Record<string, string> = {
  phone: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  video: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  onsite: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  technical: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  behavioral: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  final: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const STATUS_BADGE: Record<string, string> = {
  scheduled: "bg-blue-600",
  completed: "bg-green-600",
  cancelled: "bg-gray-500",
  "no-show": "bg-red-600",
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

const tableRowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3 },
  },
};

export default function InterviewsPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const perPage = 20;

  // Form state
  const [form, setForm] = useState({
    application_id: "",
    type: "video" as Interview["type"],
    scheduled_at: "",
    duration_minutes: "60",
    location: "",
    meeting_url: "",
    notes: "",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["interviews", statusFilter, page],
    queryFn: () => {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      params.set("page", String(page));
      params.set("per_page", String(perPage));
      return apiGet<{ interviews: Interview[]; total: number }>(`/api/v1/interviews?${params.toString()}`);
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      apiPost<Interview>("/api/v1/interviews", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interviews"] });
      setDialogOpen(false);
      setForm({ application_id: "", type: "video", scheduled_at: "", duration_minutes: "60", location: "", meeting_url: "", notes: "" });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiPut<Interview>(`/api/v1/interviews/${id}`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["interviews"] }),
  });

  const interviews = data?.interviews ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  const upcoming = interviews.filter((i) => i.status === "scheduled" && new Date(i.scheduled_at) > new Date());
  const today = interviews.filter((i) => {
    const d = new Date(i.scheduled_at);
    const now = new Date();
    return i.status === "scheduled" && d.toDateString() === now.toDateString();
  });

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Interviews</h1>
          <p className="text-muted-foreground">
            Schedule and prepare for your interviews
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 me-2" />
              Schedule Interview
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule Interview</DialogTitle>
              <DialogDescription>Add a new interview to your calendar</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Application ID</Label>
                <Input
                  value={form.application_id}
                  onChange={(e) => setForm((f) => ({ ...f, application_id: e.target.value }))}
                  placeholder="Link to an application"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Type</Label>
                  <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: (v ?? "phone") as Interview["type"] }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="onsite">On-site</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="behavioral">Behavioral</SelectItem>
                      <SelectItem value="final">Final</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Duration (min)</Label>
                  <Input
                    type="number"
                    value={form.duration_minutes}
                    onChange={(e) => setForm((f) => ({ ...f, duration_minutes: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Date & Time</Label>
                <Input
                  type="datetime-local"
                  value={form.scheduled_at}
                  onChange={(e) => setForm((f) => ({ ...f, scheduled_at: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Meeting URL</Label>
                <Input
                  value={form.meeting_url}
                  onChange={(e) => setForm((f) => ({ ...f, meeting_url: e.target.value }))}
                  placeholder="https://zoom.us/j/..."
                />
              </div>
              <div className="space-y-1.5">
                <Label>Location</Label>
                <Input
                  value={form.location}
                  onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                  placeholder="Office address or virtual"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Notes</Label>
                <Textarea
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="Prep notes, topics to review..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button
                onClick={() => createMutation.mutate({
                  application_id: form.application_id,
                  type: form.type,
                  scheduled_at: new Date(form.scheduled_at).toISOString(),
                  duration_minutes: parseInt(form.duration_minutes) || 60,
                  location: form.location || undefined,
                  meeting_url: form.meeting_url || undefined,
                  notes: form.notes || undefined,
                })}
                disabled={createMutation.isPending || !form.scheduled_at}
              >
                {createMutation.isPending && <Loader2 className="w-4 h-4 me-2 animate-spin" />}
                Schedule
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <motion.div
        className="grid gap-4 sm:grid-cols-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={cardVariants}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Today</p>
                  <motion.p
                    className="text-2xl font-bold"
                    key={today.length}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {today.length}
                  </motion.p>
                </div>
                <Calendar className="w-8 h-8 text-muted-foreground opacity-50" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={cardVariants}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Upcoming</p>
                  <motion.p
                    className="text-2xl font-bold"
                    key={upcoming.length}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {upcoming.length}
                  </motion.p>
                </div>
                <Clock className="w-8 h-8 text-muted-foreground opacity-50" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={cardVariants}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <motion.p
                    className="text-2xl font-bold"
                    key={total}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {total}
                  </motion.p>
                </div>
                <FileText className="w-8 h-8 text-muted-foreground opacity-50" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Filter + Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Interview Schedule
                </CardTitle>
                <CardDescription>{total} total interviews</CardDescription>
              </div>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v ?? "all"); setPage(1); }}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : interviews.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No interviews scheduled</p>
              </div>
            ) : (
              <>
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead className="w-[60px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {interviews.map((interview, index) => {
                        const TypeIcon = TYPE_ICON[interview.type] ?? Calendar;
                        const isUpcoming = interview.status === "scheduled" && new Date(interview.scheduled_at) > new Date();
                        return (
                          <motion.tr
                            key={interview.interview_id}
                            className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                            variants={tableRowVariants}
                            initial="hidden"
                            animate="visible"
                            transition={{ delay: index * 0.05 }}
                          >
                            <TableCell>
                              <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium ${TYPE_COLOR[interview.type] ?? ""}`}>
                                <TypeIcon className="w-3.5 h-3.5" />
                                {interview.type}
                              </div>
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-sm">
                              {new Date(interview.scheduled_at).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-sm">
                              {interview.duration_minutes ? `${interview.duration_minutes} min` : "\u2014"}
                            </TableCell>
                            <TableCell className="text-sm max-w-[200px] truncate">
                              {interview.meeting_url ? (
                                <a href={interview.meeting_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                                  Join Meeting <ExternalLink className="w-3 h-3" />
                                </a>
                              ) : interview.location || "\u2014"}
                            </TableCell>
                            <TableCell>
                              <motion.div
                                animate={isUpcoming ? {
                                  scale: [1, 1.05, 1],
                                  opacity: [1, 0.8, 1],
                                } : {}}
                                transition={isUpcoming ? {
                                  duration: 2,
                                  repeat: Infinity,
                                  ease: "easeInOut",
                                } : {}}
                              >
                                <Badge className={STATUS_BADGE[interview.status] ?? "bg-gray-500"}>
                                  {interview.status}
                                </Badge>
                              </motion.div>
                            </TableCell>
                            <TableCell>
                              {interview.rating ? (
                                <div className="flex items-center gap-1">
                                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                  <span className="text-sm">{interview.rating}/5</span>
                                </div>
                              ) : "\u2014"}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => updateStatusMutation.mutate({ id: interview.interview_id, status: "completed" })}
                                  >
                                    <CheckCircle2 className="w-4 h-4 me-2" />
                                    Mark Completed
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => updateStatusMutation.mutate({ id: interview.interview_id, status: "cancelled" })}
                                  >
                                    <XCircle className="w-4 h-4 me-2" />
                                    Cancel
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </motion.tr>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
                      <ChevronLeft className="w-4 h-4" /> Previous
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
                      Next <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
