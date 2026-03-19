"use client";

/**
 * Recruiters Page - Manage recruiter relationships
 * Author: Ahmed Adel Bakr Alderai
 */

import { motion } from "motion/react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Users,
  Search,
  MoreHorizontal,
  Mail,
  ExternalLink,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Star,
  MessageSquare,
  TrendingUp,
  Clock,
  Phone,
  FileText,
} from "lucide-react";
import { apiGet, apiDelete } from "@/lib/api-client";
import type { RecruitersResponse, Recruiter, InteractionLog } from "@/types/api";

const RESPONSE_RATE_COLOR = (rate?: number) => {
  if (!rate) return "";
  if (rate >= 70) return "border-green-300 text-green-700";
  if (rate >= 40) return "border-amber-300 text-amber-700";
  return "border-red-300 text-red-700";
};

const INTERACTION_ICON: Record<string, React.ElementType> = {
  email: Mail,
  message: MessageSquare,
  call: Phone,
  note: FileText,
};

export default function RecruitersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedRecruiter, setSelectedRecruiter] = useState<Recruiter | null>(null);
  const perPage = 25;

  const { data, isLoading } = useQuery({
    queryKey: ["recruiters", search, page],
    queryFn: () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      params.set("page", String(page));
      params.set("per_page", String(perPage));
      return apiGet<RecruitersResponse>(`/api/v1/recruiters?${params.toString()}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDelete<{ status: string }>(`/api/v1/recruiters/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["recruiters"] }),
  });

  const recruiters = data?.recruiters ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  return (
    <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.4}} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Recruiters</h1>
        <p className="text-muted-foreground">
          Manage recruiter relationships and track interactions
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <Input
              placeholder="Search by name, company, or specialization..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="max-w-md"
            />
          </div>
        </CardContent>
      </Card>

      {/* Recruiters Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Recruiters
          </CardTitle>
          <CardDescription>{total} recruiters in your network</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : recruiters.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{search ? "No recruiters match your search" : "No recruiters added yet"}</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Specialization</TableHead>
                      <TableHead>Response Rate</TableHead>
                      <TableHead>Interactions</TableHead>
                      <TableHead>Last Contact</TableHead>
                      <TableHead>Recommendation</TableHead>
                      <TableHead className="w-[60px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recruiters.map((recruiter, index) => (
                      <motion.tr
                        key={recruiter.contact_id}
                        initial={{opacity:0,x:-10}}
                        animate={{opacity:1,x:0}}
                        transition={{delay: index * 0.03}}
                        className="hover:bg-muted/50 transition-colors"
                      >
                        <TableCell>
                          <div>
                            <p className="font-medium">{recruiter.name}</p>
                            {recruiter.email && (
                              <p className="text-xs text-muted-foreground">{recruiter.email}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{recruiter.company ?? "\u2014"}</TableCell>
                        <TableCell>
                          {recruiter.specialization ? (
                            <Badge variant="outline" className="text-xs">
                              {recruiter.specialization}
                            </Badge>
                          ) : "\u2014"}
                        </TableCell>
                        <TableCell>
                          {recruiter.response_rate != null ? (
                            <Badge variant="outline" className={RESPONSE_RATE_COLOR(recruiter.response_rate)}>
                              <TrendingUp className="w-3 h-3 me-1" />
                              {recruiter.response_rate}%
                            </Badge>
                          ) : "\u2014"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
                            {recruiter.interaction_count ?? 0}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {recruiter.last_contact
                            ? new Date(recruiter.last_contact).toLocaleDateString()
                            : "\u2014"}
                        </TableCell>
                        <TableCell className="text-sm max-w-[150px] truncate">
                          {recruiter.recommended_outreach ?? "\u2014"}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSelectedRecruiter(recruiter)}>
                                <Clock className="w-4 h-4 me-2" />
                                View Interactions
                              </DropdownMenuItem>
                              {recruiter.email && (
                                <DropdownMenuItem>
                                  <Mail className="w-4 h-4 me-2" />
                                  Send Email
                                </DropdownMenuItem>
                              )}
                              {recruiter.linkedin_url && (
                                <DropdownMenuItem asChild>
                                  <a href={recruiter.linkedin_url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="w-4 h-4 me-2" />
                                    LinkedIn Profile
                                  </a>
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => deleteMutation.mutate(recruiter.contact_id)}
                              >
                                <Trash2 className="w-4 h-4 me-2" />
                                Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">Page {page} of {totalPages} ({total} total)</p>
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

      {/* Interaction Log Dialog */}
      <Dialog open={!!selectedRecruiter} onOpenChange={(open) => !open && setSelectedRecruiter(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedRecruiter?.name} - Interactions</DialogTitle>
            <DialogDescription>
              {selectedRecruiter?.company && `${selectedRecruiter.company} \u2022 `}
              {selectedRecruiter?.interaction_count ?? 0} interactions
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {selectedRecruiter?.interaction_log?.length ? (
              selectedRecruiter.interaction_log.map((log, idx) => {
                const LogIcon = INTERACTION_ICON[log.type] ?? MessageSquare;
                return (
                  <div key={idx} className="flex gap-3 p-3 rounded-lg border">
                    <div className="p-1.5 rounded-md bg-muted shrink-0">
                      <LogIcon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium capitalize">{log.type}</p>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(log.date).toLocaleDateString()}
                        </span>
                      </div>
                      {log.subject && <p className="text-sm">{log.subject}</p>}
                      {log.body && <p className="text-xs text-muted-foreground line-clamp-2">{log.body}</p>}
                      {log.status && (
                        <Badge variant="outline" className="text-xs mt-1">{log.status}</Badge>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No interactions recorded</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
