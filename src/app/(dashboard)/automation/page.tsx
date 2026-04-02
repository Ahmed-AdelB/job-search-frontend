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
} from "lucide-react";
import {
  useAutomationHealth,
  useAutomationRuns,
  useLaunchBatchApply,
  useCancelBatch,
  useLaunchDiscovery,
  useLaunchCleanup,
  useBatchStream,
} from "@/hooks/use-automation";
import type {
  AutomationPlatform,
  BatchRun,
  BatchProgressEvent,
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
// Active Batches
// ---------------------------------------------------------------------------
function ActiveBatches() {
  const { data, isLoading } = useAutomationRuns();
  const cancelMutation = useCancelBatch();

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
      {runs.map((run) => {
        const progress =
          run.total > 0
            ? Math.round(
                ((run.submitted + run.failed) / run.total) * 100
              )
            : 0;
        return (
          <motion.div
            key={run.run_id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
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
                    {run.status === "running" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                        onClick={() =>
                          cancelMutation.mutate(run.run_id)
                        }
                        disabled={cancelMutation.isPending}
                      >
                        <Square className="w-3 h-3 mr-1" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
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
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
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
    </div>
  );
}
