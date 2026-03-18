"use client";

import { useState } from "react";
import {
  usePlans,
  useSubscription,
  useInvoices,
  useCreateCheckout,
  usePortal,
  useCancelSubscription,
} from "@/hooks/use-billing";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
  CreditCard,
  Check,
  ChevronRight,
  Download,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

/**
 * Tier badge component
 */
function TierBadge({ tier }: { tier: string }) {
  const tierConfig: Record<string, { label: string; variant: any; bg: string }> = {
    free: {
      label: "Free",
      variant: "secondary",
      bg: "bg-slate-100 dark:bg-slate-800",
    },
    starter: {
      label: "Starter",
      variant: "default",
      bg: "bg-blue-100 dark:bg-blue-900",
    },
    professional: {
      label: "Professional",
      variant: "default",
      bg: "bg-purple-100 dark:bg-purple-900",
    },
    enterprise: {
      label: "Enterprise",
      variant: "default",
      bg: "bg-amber-100 dark:bg-amber-900",
    },
  };

  const config = tierConfig[tier] || tierConfig.free;

  return <Badge variant={config.variant}>{config.label}</Badge>;
}

/**
 * Status badge component
 */
function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; variant: any }> = {
    active: { label: "Active", variant: "default" },
    cancelled: { label: "Cancelled", variant: "secondary" },
    past_due: { label: "Past Due", variant: "destructive" },
    trialing: { label: "Trialing", variant: "outline" },
  };

  const config = statusConfig[status] || statusConfig.active;

  return <Badge variant={config.variant}>{config.label}</Badge>;
}

/**
 * Invoice status badge
 */
function InvoiceStatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; variant: any }> = {
    draft: { label: "Draft", variant: "outline" },
    open: { label: "Open", variant: "outline" },
    paid: { label: "Paid", variant: "default" },
    void: { label: "Void", variant: "secondary" },
    uncollectible: { label: "Uncollectible", variant: "destructive" },
  };

  const config = statusConfig[status] || statusConfig.draft;

  return <Badge variant={config.variant}>{config.label}</Badge>;
}

/**
 * Section 1: Current Plan Card
 */
function CurrentPlanSection() {
  const { data: subscription, isLoading } = useSubscription();
  const { mutate: openPortal, isPending: isPortalLoading } = usePortal();
  const { mutate: cancelSub, isPending: isCancelLoading } = useCancelSubscription();
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>Your active subscription</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>Your active subscription</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">No subscription found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const renewalDate = new Date(subscription.current_period_end);
  const isTrialing = subscription.status === "trialing";
  const isCancelled = subscription.status === "cancelled" || subscription.cancel_at_period_end;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>Your active subscription</CardDescription>
          </div>
          <TierBadge tier={subscription.tier} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Plan Details */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Plan</p>
              <p className="text-lg font-semibold capitalize">{subscription.tier}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Status</p>
              <StatusBadge status={subscription.status} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                {isTrialing ? "Trial Ends" : isCancelled ? "Cancels" : "Renews"}
              </p>
              <p className="text-sm">
                <Calendar className="w-4 h-4 inline mr-2" />
                {formatDate(renewalDate)}
              </p>
            </div>
            {subscription.payment_method && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Payment Method</p>
                <p className="text-sm">
                  {subscription.payment_method.brand.charAt(0).toUpperCase() +
                    subscription.payment_method.brand.slice(1)}{" "}
                  ****{subscription.payment_method.last4}
                </p>
              </div>
            )}
          </div>

          {/* Warning for cancellations */}
          {isCancelled && (
            <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <p className="text-sm text-amber-900 dark:text-amber-100">
                Your subscription is scheduled to be cancelled on{" "}
                {formatDate(renewalDate)}.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => openPortal()}
              disabled={isPortalLoading}
              className="flex-1"
            >
              {isPortalLoading ? "Opening..." : "Manage Subscription"}
            </Button>
            {subscription.status === "active" && !subscription.cancel_at_period_end && (
              <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" className="flex-1">
                    Cancel Plan
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Your subscription will be cancelled at the end of your current billing period
                      ({formatDate(renewalDate)}). You'll lose access to paid features.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        cancelSub();
                        setShowCancelDialog(false);
                      }}
                      disabled={isCancelLoading}
                    >
                      {isCancelLoading ? "Cancelling..." : "Cancel Subscription"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Section 2: Plan Comparison Grid
 */
function PlansComparisonSection() {
  const { data: plans, isLoading: plansLoading } = usePlans();
  const { data: subscription } = useSubscription();
  const [isAnnual, setIsAnnual] = useState(false);
  const { mutate: checkout, isPending: checkoutLoading } = useCreateCheckout();

  if (plansLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Choose Your Plan</CardTitle>
          <CardDescription>Upgrade to unlock more features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-80" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!plans || plans.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Choose Your Plan</CardTitle>
          <CardDescription>Upgrade to unlock more features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No plans available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort plans by price
  const sortedPlans = [...plans].sort((a, b) => a.price_monthly - b.price_monthly);

  // Calculate annual savings
  const getAnnualSavings = (plan: any) => {
    const monthlyTotal = plan.price_monthly * 12;
    if (monthlyTotal === 0) return 0;
    return Math.round(((monthlyTotal - plan.price_annual) / monthlyTotal) * 100);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Choose Your Plan</CardTitle>
            <CardDescription>Upgrade to unlock more features</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Monthly</span>
            <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
            <span className="text-sm text-muted-foreground">Annual</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {sortedPlans.map((plan) => {
            const isCurrentPlan = subscription?.tier === plan.tier;
            const canUpgrade =
              subscription &&
              ["free", "starter", "professional"].includes(subscription.tier) &&
              ["starter", "professional", "enterprise"].includes(plan.tier) &&
              plan.tier > subscription.tier;

            const price = isAnnual ? plan.price_annual : plan.price_monthly;
            const savings = isAnnual ? getAnnualSavings(plan) : 0;

            return (
              <div
                key={plan.id}
                className={`relative rounded-lg border transition-all ${
                  isCurrentPlan
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                    : "border-border"
                }`}
              >
                {isCurrentPlan && (
                  <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-3 py-1 rounded-bl-lg rounded-tr-lg">
                    Current Plan
                  </div>
                )}

                <div className="p-6">
                  {/* Plan Header */}
                  <div className="mb-4">
                    <h3 className="font-semibold text-lg mb-1 capitalize">{plan.name}</h3>
                    <TierBadge tier={plan.tier} />
                  </div>

                  {/* Price */}
                  <div className="mb-4">
                    <div className="text-3xl font-bold">
                      ${(price / 100).toFixed(0)}
                      <span className="text-lg text-muted-foreground font-normal">
                        /{isAnnual ? "year" : "month"}
                      </span>
                    </div>
                    {savings > 0 && (
                      <Badge variant="outline" className="mt-2">
                        Save {savings}%
                      </Badge>
                    )}
                  </div>

                  {/* Features */}
                  <div className="mb-6 space-y-2">
                    {plan.features.map((feature: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  {isCurrentPlan ? (
                    <Button disabled className="w-full">
                      Current Plan
                    </Button>
                  ) : plan.tier === "free" ? (
                    <Button disabled className="w-full" variant="outline">
                      Downgrade
                    </Button>
                  ) : (
                    <Button
                      onClick={() => checkout(plan.id)}
                      disabled={
                        checkoutLoading ||
                        !subscription ||
                        !["free", "starter", "professional"].includes(subscription.tier)
                      }
                      className="w-full"
                    >
                      {checkoutLoading ? "Loading..." : "Upgrade"}
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Section 3: Invoice History
 */
function InvoiceHistorySection() {
  const { data: invoices, isLoading } = useInvoices();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Invoice History</CardTitle>
          <CardDescription>All your past and current invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!invoices || invoices.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Invoice History</CardTitle>
          <CardDescription>All your past and current invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CreditCard className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">No invoices yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoice History</CardTitle>
        <CardDescription>All your past and current invoices</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="text-sm">
                    {formatDate(new Date(invoice.invoice_date))}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ${(invoice.amount / 100).toFixed(2)} {invoice.currency.toUpperCase()}
                  </TableCell>
                  <TableCell>
                    <InvoiceStatusBadge status={invoice.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    {invoice.download_url && (
                      <a href={invoice.download_url} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="sm" className="gap-1">
                          <Download className="w-4 h-4" />
                          <span className="hidden sm:inline">Download</span>
                        </Button>
                      </a>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Main Billing Page Component
 */
export default function BillingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
        <p className="text-muted-foreground">
          Manage your subscription, plans, and payments
        </p>
      </div>

      {/* Current Plan Card */}
      <CurrentPlanSection />

      {/* Plan Comparison Grid */}
      <PlansComparisonSection />

      {/* Invoice History Table */}
      <InvoiceHistorySection />
    </div>
  );
}
