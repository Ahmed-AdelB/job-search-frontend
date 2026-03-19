"use client";

/**
 * Logs Page - System and agent activity logs viewer
 * Author: Ahmed Adel Bakr Alderai
 */

import { useState } from "react";
import { motion } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileClock,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Info,
  AlertTriangle,
  XCircle,
  Bug,
  AlertOctagon,
} from "lucide-react";
import { apiGet } from "@/lib/api-client";
import type { LogEntry } from "@/types/api";

const LEVEL_CONFIG: Record<string, { color: string; icon: React.ElementType; bg: string }> = {
  DEBUG: { color: "text-gray-500", icon: Bug, bg: "bg-gray-100 dark:bg-gray-800" },
  INFO: { color: "text-blue-600", icon: Info, bg: "bg-blue-100 dark:bg-blue-900/30" },
  WARNING: { color: "text-amber-600", icon: AlertTriangle, bg: "bg-amber-100 dark:bg-amber-900/30" },
  ERROR: { color: "text-red-600", icon: XCircle, bg: "bg-red-100 dark:bg-red-900/30" },
  CRITICAL: { color: "text-red-800 dark:text-red-400", icon: AlertOctagon, bg: "bg-red-200 dark:bg-red-900/50" },
};

const LEVEL_BADGE: Record<string, string> = {
  DEBUG: "bg-gray-500",
  INFO: "bg-blue-600",
  WARNING: "bg-amber-500",
  ERROR: "bg-red-600",
  CRITICAL: "bg-red-800",
};

export default function LogsPage() {
  const [level, setLevel] = useState<string>("all");
  const [agent, setAgent] = useState<string>("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 50;

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["logs", level, agent, search, page],
    queryFn: () => {
      const params = new URLSearchParams();
      if (level !== "all") params.set("level", level);
      if (agent) params.set("agent", agent);
      if (search) params.set("search", search);
      params.set("page", String(page));
      params.set("per_page", String(perPage));
      return apiGet<{ logs: LogEntry[]; total: number }>(`/api/v1/logs?${params.toString()}`);
    },
    refetchInterval: 15000,
  });

  const logs = data?.logs ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  return (
    <motion.div className="space-y-6" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.4}}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Logs</h1>
          <p className="text-muted-foreground">
            View agent activity and system logs
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`w-4 h-4 me-2 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2 flex-1">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <Input
                placeholder="Search logs..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="max-w-sm"
              />
            </div>
            <Select value={level} onValueChange={(v) => { setLevel(v ?? "all"); setPage(1); }}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Log level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="DEBUG">DEBUG</SelectItem>
                <SelectItem value="INFO">INFO</SelectItem>
                <SelectItem value="WARNING">WARNING</SelectItem>
                <SelectItem value="ERROR">ERROR</SelectItem>
                <SelectItem value="CRITICAL">CRITICAL</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Filter by agent..."
              value={agent}
              onChange={(e) => {
                setAgent(e.target.value);
                setPage(1);
              }}
              className="w-[180px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileClock className="w-5 h-5" />
            Activity Logs
          </CardTitle>
          <CardDescription>
            {total} total entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileClock className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No logs match your filters</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[180px]">Timestamp</TableHead>
                      <TableHead className="w-[100px]">Level</TableHead>
                      <TableHead className="w-[120px]">Agent</TableHead>
                      <TableHead>Message</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => {
                      const config = LEVEL_CONFIG[log.level] ?? LEVEL_CONFIG.INFO;
                      const LevelIcon = config.icon;
                      return (
                        <TableRow key={log.id} className={log.level === "ERROR" || log.level === "CRITICAL" ? config.bg : ""}>
                          <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge className={`${LEVEL_BADGE[log.level] ?? "bg-gray-500"} text-xs`}>
                              <LevelIcon className="w-3 h-3 me-1" />
                              {log.level}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {log.agent ? (
                              <Badge variant="outline" className="text-xs">
                                {log.agent}
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">system</span>
                            )}
                          </TableCell>
                          <TableCell className="max-w-md truncate text-sm">
                            {log.message}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
