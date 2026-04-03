"use client";

/**
 * Automation Page — Control center for browser-based ATS batch automation
 * Launch batches, monitor progress, view health, discover jobs — all from UI
 * Author: Ahmed Adel Bakr Alderai
 */

import { useState } from "react";
import { motion } from "motion/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Zap,
  Play,
  Square,
  Activity,
  Clock,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Mail,
  Shield,
  Monitor,
  Database,
  Search,
  Trash2,
  RefreshCw,
  Calendar,
  Image,
  FileText,
  ChevronDown,
  ChevronUp,
  Trash,
} from "lucide-react";
import {
  useAutomationHealth,
  useAutomationRuns,
  useLaunchBatchApply,
  useCancelBatch,
  useLaunchDiscovery,
  useLaunchCleanup,
  useBatchStream,
  useAutomationSchedules,
  useCreateSchedule,
  useDeleteSchedule,
  useToggleSchedule,
  useBatchLogs,
  useBatchScreenshots,
} from "@/hooks/use-automation";
import type {
  AutomationPlatform,
  BatchRun,
  BatchProgressEvent,
  ScheduleRequest,
} from "@/types/api";

// ---------------------------------------------------------------------------
// Status badge config
// ---------------------------------------------------------------------------
const STATUS_CONFIG: Record<
  string,
  { color: string; badge: string; icon: React.ElementType }
> = {
  running: {
    color: "text-green-500",
    badge: "bg-green-500/10 text-green-500 border-green-500/20",
    icon: Loader2,
  },
  completed: {
    color: "text-blue-500",
    badge: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    icon: CheckCircle2,
  },
  failed: {
    color: "text-red-500",
    badge: "bg-red-500/10 text-red-500 border-red-500/20",
    icon: XCircle,
  },
  cancelled: {
    color: "text-amber-500",
    badge: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    icon: Square,
  },
};

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.running;
  const Icon = config.icon;
  return (
    <Badge variant="outline" className={config.badge}>
      <Icon
        className={`w-3 h-3 mr-1 ${status === "running" ? "animate-spin" : ""}`}
      />
      {status}
    </Badge>
  );
}

// ---------------------------------------------------------------------------
// Health Cards
// ---------------------------------------------------------------------------
function HealthCards() {
  const { data: health, isLoading } = useAutomationHealth();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "IMAP",
      icon: Mail,
      status: health?.imap.connected ? "Connected" : "Disconnected",
      ok: health?.imap.connected ?? false,
      detail: health?.imap.connected
        ? `${health.imap.unread_gh_emails ?? 0} unread GH emails`
        : health?.imap.configured
          ? "Configured but not connected"
          : "Not configured",
    },
    {
      title: "Capsolver",
      icon: Shield,
      status: health?.capsolver.configured ? "Active" : "Not Set",
      ok: health?.capsolver.configured ?? false,
      detail: health?.capsolver.balance != null
        ? `$${Number(health.capsolver.balance).toFixed(2)} balance`
        : "No balance info",
    },
    {
      title: "Browser",
      icon: Monitor,
      status: health?.browser.playwright_installed
        ? "Installed"
        : "Missing",
      ok: health?.browser.playwright_installed ?? false,
      detail: health?.browser.playwright_installed
        ? "Playwright ready"
        : "Run: playwright install chromium",
    },
    {
      title: "Database",
      icon: Database,
      status: `${health?.db_stats.total ?? 0} jobs`,
      ok: (health?.db_stats.total ?? 0) > 0,
      detail: `${health?.db_stats.new ?? 0} new · ${health?.db_stats.submitted ?? 0} submitted · ${health?.db_stats.expired ?? 0} expired`,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={`p-2 rounded-lg ${card.ok ? "bg-green-500/10" : "bg-red-500/10"}`}
                >
                  <card.icon
                    className={`w-4 h-4 ${card.ok ? "text-green-500" : "text-red-500"}`}
                  />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    {card.title}
                  </p>
                  <p className="text-sm font-semibold">{card.status}</p>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground truncate">
                {card.detail}
              </p>
              {/* Status indicator dot */}
              <div
                className={`absolute top-3 right-3 w-2 h-2 rounded-full ${card.ok ? "bg-green-500" : "bg-red-500"}`}
              />
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Batch Detail (expandable logs + screenshots)
// ---------------------------------------------------------------------------
function BatchDetailView({ run }: { run: BatchRun }) {
  const [expanded, setExpanded] = useState(false);
  const { data: logsData } = useBatchLogs(expanded ? run.run_id : null);
  const { data: screenshotsData } = useBatchScreenshots(expanded ? run.run_id : null);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <Card>
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3 flex-1">
              <StatusBadge status={run.status} />
              <span className="text-sm font-mono text-muted-foreground">
                {run.run_id}
              </span>
              <Badge variant="outline" className="text-xs">
                {run.platform}
              </Badge>
              {run.dry_run && (
                <Badge
                  variant="outline"
                  className="text-xs bg-amber-500/10 text-amber-500 border-amber-500/20"
                >
                  DRY RUN
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {Math.round(run.elapsed_seconds)}s
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setExpanded(!expanded)}
                className="h-7"
              >
                {expanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-2 mb-4">
            {(() => {
              const progress =
                run.total > 0
                  ? Math.round(
                      ((run.submitted + run.failed) / run.total) * 100
                    )
                  : 0;
              return (
                <>
                  <Progress value={progress} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      <CheckCircle2 className="w-3 h-3 inline mr-1 text-green-500" />
                      {run.submitted} submitted
                    </span>
                    <span>
                      <XCircle className="w-3 h-3 inline mr-1 text-red-500" />
                      {run.failed} failed
                    </span>
                    <span>
                      <Clock className="w-3 h-3 inline mr-1" />
                      {run.total - run.submitted - run.failed} pending
                    </span>
                    <span className="font-medium">
                      {progress}% ({run.submitted + run.failed}/
                      {run.total})
                    </span>
                  </div>
                </>
              );
            })()}
          </div>

          {/* Expanded details */}
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 border-t border-white/10 pt-4 mt-4"
            >
              {/* Logs */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <p className="text-xs font-semibold text-muted-foreground uppercase">
                    Logs
                  </p>
                </div>
                <div className="bg-black/20 rounded border border-white/5 p-3 max-h-48 overflow-y-auto">
                  <pre className="text-[10px] font-mono text-muted-foreground whitespace-pre-wrap break-words">
                    {logsData?.log_text
                      ? logsData.log_text.split("\n").slice(-200).join("\n")
                      : "No logs available"}
                  </pre>
                </div>
              </div>

              {/* Screenshots */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Image className="w-4 h-4 text-muted-foreground" />
                  <p className="text-xs font-semibold text-muted-foreground uppercase">
                    Screenshots ({screenshotsData?.screenshots.length ?? 0})
                  </p>
                </div>
                {screenshotsData?.screenshots && screenshotsData.screenshots.length > 0 ? (
                  <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto">
                    {screenshotsData.screenshots.map((screenshot) => (
                      <a
                        key={screenshot.filename}
                        href={screenshot.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative group"
                      >
                        <div className="bg-black/20 rounded border border-white/5 aspect-video overflow-hidden">
                          <img
                            src={screenshot.url}
                            alt={screenshot.filename}
                            className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
                          />
                        </div>
                        <div className="text-[9px] text-muted-foreground mt-1 truncate">
                          {screenshot.filename}
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    No screenshots captured
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Active Batches (with expandable detail)
// ---------------------------------------------------------------------------
function ActiveBatches() {
  const { data, isLoading } = useAutomationRuns();

  const runs = data?.runs ?? [];

  if (isLoading) {
    return <Skeleton className="h-48" />;
  }

  if (runs.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <Activity className="w-8 h-8 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No batch runs yet</p>
          <p className="text-xs mt-1">
            Launch a batch below to start automation
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {runs.map((run) => (
        <BatchDetailView key={run.run_id} run={run} />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Schedule Manager
// ---------------------------------------------------------------------------
function ScheduleManager() {
  const { data: schedulesData, isLoading } = useAutomationSchedules();
  const createMutation = useCreateSchedule();
  const deleteMutation = useDeleteSchedule();
  const toggleMutation = useToggleSchedule();

  const [newSchedule, setNewSchedule] = useState<Partial<ScheduleRequest>>({
    platform: "greenhouse",
    count: 100,
    min_score: 15,
    interval_hours: 6,
    real: false,
  });

  const schedules = schedulesData?.schedules ?? [];

  const handleCreate = () => {
    if (!newSchedule.name || !newSchedule.platform) {
      return;
    }

    createMutation.mutate(newSchedule as ScheduleRequest, {
      onSuccess: () => {
        setNewSchedule({
          platform: "greenhouse",
          count: 100,
          min_score: 15,
          interval_hours: 6,
          real: false,
        });
      },
    });
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base flex items-center gap-2">
          <Calendar className="w-4 h-4 text-brand-400" />
          Schedule Management
        </CardTitle>
        <CardDescription>
          Create recurring automation schedules to batch apply on a fixed interval
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Create form */}
        <div className="space-y-4 p-4 rounded-lg bg-white/5 border border-white/10">
          <p className="text-sm font-medium">Create New Schedule</p>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label className="text-xs">Schedule Name</Label>
              <Input
                placeholder="e.g., Daily Greenhouse Batch"
                value={newSchedule.name ?? ""}
                onChange={(e) =>
                  setNewSchedule({ ...newSchedule, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Platform</Label>
              <Select
                value={newSchedule.platform}
                onValueChange={(v) =>
                  setNewSchedule({
                    ...newSchedule,
                    platform: v as AutomationPlatform,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="greenhouse">Greenhouse</SelectItem>
                  <SelectItem value="workday">Workday</SelectItem>
                  <SelectItem value="ashby">Ashby</SelectItem>
                  <SelectItem value="all">All Platforms</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Job Count</Label>
              <Input
                type="number"
                min={1}
                max={5000}
                value={newSchedule.count ?? 100}
                onChange={(e) =>
                  setNewSchedule({ ...newSchedule, count: Number(e.target.value) })
                }
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label className="text-xs">Min Score: {newSchedule.min_score}</Label>
              <Slider
                value={[newSchedule.min_score ?? 15]}
                onValueChange={(v) =>
                  setNewSchedule({
                    ...newSchedule,
                    min_score: Array.isArray(v) ? v[0] : v,
                  })
                }
                min={0}
                max={100}
                step={5}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Interval</Label>
              <Select
                value={String(newSchedule.interval_hours ?? 6)}
                onValueChange={(v) =>
                  setNewSchedule({ ...newSchedule, interval_hours: Number(v) })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Every 1 hour</SelectItem>
                  <SelectItem value="6">Every 6 hours</SelectItem>
                  <SelectItem value="12">Every 12 hours</SelectItem>
                  <SelectItem value="24">Every 24 hours</SelectItem>
                  <SelectItem value="48">Every 48 hours</SelectItem>
                  <SelectItem value="168">Every 7 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end justify-between col-span-2">
              <div className="flex items-center gap-2">
                <Switch
                  checked={newSchedule.real ?? false}
                  onCheckedChange={(checked) =>
                    setNewSchedule({ ...newSchedule, real: checked })
                  }
                />
                <span className="text-xs">
                  {newSchedule.real ? "Real mode" : "Dry run"}
                </span>
              </div>

              <Button
                onClick={handleCreate}
                disabled={createMutation.isPending || !newSchedule.name}
                size="sm"
              >
                {createMutation.isPending ? (
                  <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-3 h-3 mr-2" />
                )}
                Create Schedule
              </Button>
            </div>
          </div>
        </div>

        {/* Schedules list */}
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : schedules.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No schedules created yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {schedules.map((schedule) => (
              <motion.div
                key={schedule.id}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="p-3 bg-white/5 border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{schedule.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {schedule.platform} · {schedule.count} jobs · min score {schedule.min_score} ·{" "}
                        every {schedule.interval_hours}h · {schedule.real ? "REAL" : "DRY RUN"}
                      </p>
                      {schedule.last_run_at && (
                        <p className="text-[10px] text-muted-foreground mt-1">
                          Last run: {new Date(schedule.last_run_at).toLocaleString()} ·{" "}
                          {schedule.run_count} total runs
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={schedule.enabled}
                        onCheckedChange={() =>
                          toggleMutation.mutate({
                            scheduleId: schedule.id,
                            enabled: !schedule.enabled,
                          })
                        }
                        disabled={toggleMutation.isPending}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                        onClick={() => deleteMutation.mutate(schedule.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Launch Controls
// ---------------------------------------------------------------------------
function LaunchControls() {
  const [platform, setPlatform] = useState<AutomationPlatform>("greenhouse");
  const [count, setCount] = useState(100);
  const [minScore, setMinScore] = useState(15);
  const [isReal, setIsReal] = useState(false);

  const batchMutation = useLaunchBatchApply();
  const discoveryMutation = useLaunchDiscovery();
  const cleanupMutation = useLaunchCleanup();

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base flex items-center gap-2">
          <Zap className="w-4 h-4 text-brand-400" />
          Launch Controls
        </CardTitle>
        <CardDescription>
          Configure and launch browser automation batches
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Platform */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs">Platform</Label>
            <Select
              value={platform}
              onValueChange={(v) =>
                setPlatform(v as AutomationPlatform)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="greenhouse">Greenhouse</SelectItem>
                <SelectItem value="workday">Workday</SelectItem>
                <SelectItem value="ashby">Ashby</SelectItem>
                <SelectItem value="all">All Platforms</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Job Count</Label>
            <Input
              type="number"
              min={1}
              max={5000}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
            />
          </div>
        </div>

        {/* Score slider */}
        <div className="space-y-2">
          <Label className="text-xs">
            Min Relevance Score: {minScore}
          </Label>
          <Slider
            value={[minScore]}
            onValueChange={(v) => setMinScore(Array.isArray(v) ? v[0] : v)}
            min={0}
            max={100}
            step={5}
          />
        </div>

        {/* Real mode toggle */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
          <div>
            <p className="text-sm font-medium">Real Mode</p>
            <p className="text-xs text-muted-foreground">
              {isReal
                ? "Will actually submit applications"
                : "Dry run — no real submissions"}
            </p>
          </div>
          <Switch checked={isReal} onCheckedChange={setIsReal} />
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-3 gap-3">
          <Button
            onClick={() =>
              batchMutation.mutate({
                platform,
                count,
                min_score: minScore,
                real: isReal,
              })
            }
            disabled={batchMutation.isPending}
            className="relative"
          >
            {batchMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            Launch Batch
          </Button>

          <Button
            variant="outline"
            onClick={() => discoveryMutation.mutate({})}
            disabled={discoveryMutation.isPending}
          >
            {discoveryMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Search className="w-4 h-4 mr-2" />
            )}
            Discover Jobs
          </Button>

          <Button
            variant="outline"
            onClick={() => cleanupMutation.mutate({})}
            disabled={cleanupMutation.isPending}
          >
            {cleanupMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4 mr-2" />
            )}
            Cleanup Expired
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Missing import for Plus icon
import { Plus } from "lucide-react";

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function AutomationPage() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="text-2xl font-bold text-gradient-brand"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Automation
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Browser-based ATS batch apply, job discovery, and system health
            </p>
          </div>
          <Badge
            variant="outline"
            className="bg-brand-500/10 text-brand-400 border-brand-500/20"
          >
            <Zap className="w-3 h-3 mr-1" />
            Control Center
          </Badge>
        </div>
      </motion.div>

      {/* Section 1: System Health */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          System Health
        </h2>
        <HealthCards />
      </section>

      {/* Main grid: Launch Controls + Active Batches */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Section 2: Launch Controls */}
        <div className="lg:col-span-1">
          <LaunchControls />
        </div>

        {/* Section 3: Active Batches */}
        <div className="lg:col-span-2">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Batch Runs
          </h2>
          <ActiveBatches />
        </div>
      </div>

      {/* Section 4: Schedule Management */}
      <section>
        <ScheduleManager />
      </section>
    </div>
  );
}
