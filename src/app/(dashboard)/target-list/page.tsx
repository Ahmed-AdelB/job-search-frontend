"use client";

/**
 * Target List Page - Target company management
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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Target,
  Plus,
  Search,
  MoreHorizontal,
  ExternalLink,
  Trash2,
  Edit2,
  Building2,
  Briefcase,
  Loader2,
} from "lucide-react";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api-client";
import type { TargetCompany, TargetListResponse, CreateTargetCompanyRequest, TierType } from "@/types/api";

const TIER_COLOR: Record<string, string> = {
  A: "bg-green-600",
  B: "bg-blue-600",
  C: "bg-amber-500",
};

const SIZE_LABEL: Record<string, string> = {
  startup: "Startup (1-50)",
  small: "Small (51-200)",
  medium: "Medium (201-1000)",
  large: "Large (1001-5000)",
  enterprise: "Enterprise (5000+)",
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    },
  },
} as any;

export default function TargetListPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<TargetCompany | null>(null);

  const [form, setForm] = useState<CreateTargetCompanyRequest>({
    name: "",
    tier: "B",
    industry: "",
    company_size: undefined,
    careers_url: "",
    notes: "",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["target-list", search, tierFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (tierFilter !== "all") params.set("tier", tierFilter);
      return apiGet<TargetListResponse>(`/api/target-list?${params.toString()}`);
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateTargetCompanyRequest) =>
      apiPost<TargetCompany>("/api/target-list", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["target-list"] });
      setDialogOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & Partial<CreateTargetCompanyRequest>) =>
      apiPut<TargetCompany>(`/api/target-list/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["target-list"] });
      setEditTarget(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDelete<{ status: string }>(`/api/target-list/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["target-list"] }),
  });

  const companies = data?.companies ?? [];
  const total = data?.total ?? 0;

  const resetForm = () => {
    setForm({ name: "", tier: "B", industry: "", company_size: undefined, careers_url: "", notes: "" });
  };

  const openEdit = (target: TargetCompany) => {
    setEditTarget(target);
    setForm({
      name: target.name,
      tier: target.tier,
      industry: target.industry ?? "",
      company_size: target.company_size,
      careers_url: target.careers_url ?? "",
      notes: target.notes ?? "",
    });
  };

  const tierCounts = companies.reduce(
    (acc, c) => { acc[c.tier] = (acc[c.tier] ?? 0) + 1; return acc; },
    {} as Record<string, number>
  );

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold tracking-tight">Target List</h1>
          <p className="text-muted-foreground">
            Manage your priority companies ({total} targets)
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 me-2" />
              Add Target
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Target Company</DialogTitle>
              <DialogDescription>Add a company to your priority target list</DialogDescription>
            </DialogHeader>
            <CompanyForm
              form={form}
              setForm={setForm}
              onSubmit={() => createMutation.mutate(form)}
              isPending={createMutation.isPending}
              submitLabel="Add Company"
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Tier Summary */}
      <motion.div
        className="grid gap-4 sm:grid-cols-3"
        initial="hidden"
        animate="visible"
        variants={containerVariants as any}
      >
        {(["A", "B", "C"] as const).map((tier) => (
          <motion.div key={tier} variants={itemVariants}>
            <Card
              className="bg-white/5 backdrop-blur-xl border-white/10 cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => setTierFilter(tierFilter === tier ? "all" : tier)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Tier {tier}</p>
                    <p className="text-2xl font-display font-bold">{tierCounts[tier] ?? 0}</p>
                  </div>
                  <Badge className={TIER_COLOR[tier]}>{tier}</Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Search + Filter */}
      <Card className="bg-white/5 backdrop-blur-xl border-white/10">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2 flex-1">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <Input
                placeholder="Search companies..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-md"
              />
            </div>
            <Select value={tierFilter} onValueChange={(v) => setTierFilter(v ?? "all")}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="A">Tier A</SelectItem>
                <SelectItem value="B">Tier B</SelectItem>
                <SelectItem value="C">Tier C</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Companies Table */}
      <Card className="bg-white/5 backdrop-blur-xl border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Target Companies
          </CardTitle>
          <CardDescription>{total} companies in your target list</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : companies.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{search || tierFilter !== "all" ? "No companies match your filters" : "No target companies yet. Add your first target."}</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-white/5">
                    <TableHead>Company</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Open Roles</TableHead>
                    <TableHead>Applied</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="w-[60px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companies.map((company, index) => (
                    <motion.tr
                      key={company.id}
                      className="hover:bg-white/5"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: index * 0.05,
                        type: "spring",
                        stiffness: 120,
                        damping: 20,
                      } as any}
                      whileHover={{
                        backgroundColor: "rgba(0, 0, 0, 0.02)",
                        transition: { duration: 0.2 },
                      } as any}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
                          <span className="font-medium">{company.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={TIER_COLOR[company.tier]}>{company.tier}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{company.industry ?? "\u2014"}</TableCell>
                      <TableCell className="text-sm">
                        {company.company_size ? SIZE_LABEL[company.company_size] ?? company.company_size : "\u2014"}
                      </TableCell>
                      <TableCell>
                        {company.open_roles != null ? (
                          <Badge variant="outline" className="text-xs">
                            <Briefcase className="w-3 h-3 me-1" />
                            {company.open_roles}
                          </Badge>
                        ) : "\u2014"}
                      </TableCell>
                      <TableCell className="text-sm">{company.applied_count ?? 0}</TableCell>
                      <TableCell className="text-sm max-w-[150px] truncate">
                        {company.notes ?? "\u2014"}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEdit(company)}>
                              <Edit2 className="w-4 h-4 me-2" />
                              Edit
                            </DropdownMenuItem>
                            {company.careers_url && (
                              <DropdownMenuItem asChild>
                                <a href={company.careers_url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="w-4 h-4 me-2" />
                                  Careers Page
                                </a>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => deleteMutation.mutate(company.id)}
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
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {editTarget?.name}</DialogTitle>
            <DialogDescription>Update target company details</DialogDescription>
          </DialogHeader>
          <CompanyForm
            form={form}
            setForm={setForm}
            onSubmit={() => editTarget && updateMutation.mutate({ id: editTarget.id, ...form })}
            isPending={updateMutation.isPending}
            submitLabel="Save Changes"
          />
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

function CompanyForm({
  form,
  setForm,
  onSubmit,
  isPending,
  submitLabel,
}: {
  form: CreateTargetCompanyRequest;
  setForm: React.Dispatch<React.SetStateAction<CreateTargetCompanyRequest>>;
  onSubmit: () => void;
  isPending: boolean;
  submitLabel: string;
}) {
  return (
    <>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>Company Name</Label>
          <Input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Google"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Tier</Label>
            <Select value={form.tier} onValueChange={(v) => setForm((f) => ({ ...f, tier: (v ?? "B") as TierType }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="A">Tier A (Top priority)</SelectItem>
                <SelectItem value="B">Tier B (Interested)</SelectItem>
                <SelectItem value="C">Tier C (Backup)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Company Size</Label>
            <Select value={form.company_size ?? ""} onValueChange={(v) => setForm((f) => ({ ...f, company_size: (v ?? "medium") as CreateTargetCompanyRequest["company_size"] }))}>
              <SelectTrigger><SelectValue placeholder="Select size" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="startup">Startup</SelectItem>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Industry</Label>
          <Input
            value={form.industry ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value }))}
            placeholder="e.g. Technology, Finance"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Careers URL</Label>
          <Input
            value={form.careers_url ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, careers_url: e.target.value }))}
            placeholder="https://careers.example.com"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Notes</Label>
          <Textarea
            value={form.notes ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            rows={2}
            placeholder="Any notes about this company..."
          />
        </div>
      </div>
      <DialogFooter>
        <Button onClick={onSubmit} disabled={isPending || !form.name}>
          {isPending && <Loader2 className="w-4 h-4 me-2 animate-spin" />}
          {submitLabel}
        </Button>
      </DialogFooter>
    </>
  );
}
