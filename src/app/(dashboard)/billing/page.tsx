"use client";

/**
 * Billing Page - Subscription and payment management
 * Author: Ahmed Adel Bakr Alderai
 */

import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  CreditCard,
  CheckCircle2,
  Crown,
  Zap,
  Building2,
  Download,
  ExternalLink,
  Loader2,
  AlertTriangle,
  Star,
} from "lucide-react";
import { apiGet, apiPost } from "@/lib/api-client";
import type { BillingPlan, Subscription, Invoice, CheckoutSession, PortalSession } from "@/types/api";

const TIER_CONFIG: Record<string, { icon: React.ElementType; color: string; accent: string }> = {
  free: { icon: Star, color: "bg-gray-100 dark:bg-gray-800", accent: "border-gray-300" },
  starter: { icon: Zap, color: "bg-blue-50 dark:bg-blue-900/20", accent: "border-blue-400" },
  professional: { icon: Crown, color: "bg-amber-50 dark:bg-amber-900/20", accent: "border-amber-400" },
  enterprise: { icon: Building2, color: "bg-purple-50 dark:bg-purple-900/20", accent: "border-purple-400" },
};

const STATUS_COLOR: Record<string, string> = {
  active: "bg-green-600",
  trialing: "bg-blue-600",
  cancelled: "bg-gray-500",
  past_due: "bg-red-600",
};

const INVOICE_STATUS_COLOR: Record<string, string> = {
  paid: "bg-green-600",
  open: "bg-blue-600",
  draft: "bg-gray-500",
  void: "bg-gray-400",
  uncollectible: "bg-red-600",
};

export default function BillingPage() {
  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ["billing", "plans"],
    queryFn: () => apiGet<{ plans: BillingPlan[] }>("/api/v1/billing/plans"),
  });

  const { data: subscription, isLoading: subLoading } = useQuery({
    queryKey: ["billing", "subscription"],
    queryFn: () => apiGet<{ subscription: Subscription }>("/api/v1/billing/subscription"),
  });

  const { data: invoices, isLoading: invLoading } = useQuery({
    queryKey: ["billing", "invoices"],
    queryFn: () => apiGet<{ invoices: Invoice[] }>("/api/v1/billing/invoices"),
  });

  const checkoutMutation = useMutation({
    mutationFn: (planId: string) =>
      apiPost<CheckoutSession>("/api/v1/checkout/session", { plan_id: planId }),
    onSuccess: (data) => {
      if (data.url) window.location.href = data.url;
    },
  });

  const portalMutation = useMutation({
    mutationFn: () => apiPost<PortalSession>("/api/v1/billing/portal", {}),
    onSuccess: (data) => {
      if (data.url) window.location.href = data.url;
    },
  });

  const sub = subscription?.subscription;
  const plansList = plans?.plans ?? [];
  const invoicesList = invoices?.invoices ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
        <p className="text-muted-foreground">
          Manage your subscription and payments
        </p>
      </div>

      {/* Current Subscription */}
      <Card>
        <CardHeader>
          <CardTitle>Current Subscription</CardTitle>
          <CardDescription>Your active plan and billing details</CardDescription>
        </CardHeader>
        <CardContent>
          {subLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-5 w-64" />
            </div>
          ) : sub ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge className={`${STATUS_COLOR[sub.status] ?? "bg-gray-500"} text-sm px-3 py-1`}>
                  {sub.status}
                </Badge>
                <span className="text-lg font-bold capitalize">{sub.tier} Plan</span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="p-4 rounded-lg border">
                  <p className="text-sm text-muted-foreground">Current Period Ends</p>
                  <p className="font-medium">
                    {new Date(sub.current_period_end).toLocaleDateString()}
                  </p>
                </div>
                {sub.payment_method && (
                  <div className="p-4 rounded-lg border">
                    <p className="text-sm text-muted-foreground">Payment Method</p>
                    <p className="font-medium flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      {sub.payment_method.brand} **** {sub.payment_method.last4}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Expires {sub.payment_method.exp_month}/{sub.payment_method.exp_year}
                    </p>
                  </div>
                )}
                {sub.cancel_at_period_end && (
                  <div className="p-4 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-900/20">
                    <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                      <AlertTriangle className="w-4 h-4" />
                      <p className="text-sm font-medium">Cancels at period end</p>
                    </div>
                  </div>
                )}
              </div>

              <Button variant="outline" onClick={() => portalMutation.mutate()} disabled={portalMutation.isPending}>
                {portalMutation.isPending ? (
                  <Loader2 className="w-4 h-4 me-2 animate-spin" />
                ) : (
                  <ExternalLink className="w-4 h-4 me-2" />
                )}
                Manage Subscription
              </Button>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No active subscription. Choose a plan below to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plans */}
      <Card>
        <CardHeader>
          <CardTitle>Available Plans</CardTitle>
          <CardDescription>Choose the plan that fits your needs</CardDescription>
        </CardHeader>
        <CardContent>
          {plansLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-64 w-full" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {plansList.map((plan) => {
                const config = TIER_CONFIG[plan.tier] ?? TIER_CONFIG.free;
                const TierIcon = config.icon;
                const isCurrent = sub?.plan_id === plan.id;

                return (
                  <div
                    key={plan.id}
                    className={`rounded-lg border-2 p-5 space-y-4 ${isCurrent ? config.accent : "border-border"} ${config.color}`}
                  >
                    <div className="flex items-center gap-2">
                      <TierIcon className="w-5 h-5" />
                      <h3 className="font-bold">{plan.name}</h3>
                    </div>

                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold">${plan.price_monthly}</span>
                        <span className="text-sm text-muted-foreground">/mo</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        or ${plan.price_annual}/yr (save {Math.round((1 - plan.price_annual / (plan.price_monthly * 12)) * 100)}%)
                      </p>
                    </div>

                    <ul className="space-y-1.5">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    {isCurrent ? (
                      <Button variant="outline" disabled className="w-full">
                        Current Plan
                      </Button>
                    ) : (
                      <Button
                        className="w-full"
                        variant={plan.tier === "professional" ? "default" : "outline"}
                        onClick={() => checkoutMutation.mutate(plan.id)}
                        disabled={checkoutMutation.isPending}
                      >
                        {checkoutMutation.isPending ? (
                          <Loader2 className="w-4 h-4 me-2 animate-spin" />
                        ) : null}
                        {plan.price_monthly === 0 ? "Get Started" : "Upgrade"}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoices */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice History</CardTitle>
          <CardDescription>Your past invoices and receipts</CardDescription>
        </CardHeader>
        <CardContent>
          {invLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : invoicesList.length === 0 ? (
            <p className="text-center py-8 text-sm text-muted-foreground">No invoices yet</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Receipt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoicesList.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="text-sm">
                        {new Date(inv.invoice_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-medium">
                        {(inv.amount / 100).toFixed(2)} {inv.currency.toUpperCase()}
                      </TableCell>
                      <TableCell>
                        <Badge className={INVOICE_STATUS_COLOR[inv.status] ?? "bg-gray-500"}>
                          {inv.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {inv.download_url ? (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={inv.download_url} target="_blank" rel="noopener noreferrer">
                              <Download className="w-4 h-4" />
                            </a>
                          </Button>
                        ) : "\u2014"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
