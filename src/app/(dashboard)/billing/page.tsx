"use client"

import React, { useState } from "react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { CardSkeleton } from "@/components/shared/loading-skeleton"
import { EmptyState } from "@/components/shared/empty-state"
import {
  usePlans,
  useSubscription,
  useCreateCheckout,
  useCancelSubscription,
  useInvoices,
  usePortal,
} from "@/hooks/use-billing"
import { Check, CreditCard, Download, Loader2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

/**
 * Billing Page - Plan management and payment methods
 */
export default function BillingPage() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("monthly")
  const [showCancelDialog, setShowCancelDialog] = useState(false)

  // Queries and mutations
  const plansQuery = usePlans()
  const subscriptionQuery = useSubscription()
  const invoicesQuery = useInvoices()
  const createCheckoutMutation = useCreateCheckout()
  const cancelSubscriptionMutation = useCancelSubscription()
  const portalMutation = usePortal()

  const isLoadingPlans = plansQuery.isPending
  const isLoadingSubscription = subscriptionQuery.isPending
  const isLoadingInvoices = invoicesQuery.isPending

  const handleUpgradePlan = (planId: string) => {
    createCheckoutMutation.mutate(planId)
  }

  const handleOpenPortal = () => {
    portalMutation.mutate()
  }

  const handleCancelSubscription = () => {
    cancelSubscriptionMutation.mutate()
  }

  // Loading state
  if (isLoadingPlans || isLoadingSubscription) {
    return (
      <div className="space-y-6">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
        <p className="text-muted-foreground">
          Manage your subscription and billing information
        </p>
      </div>

      {/* Current Plan Card */}
      {subscriptionQuery.data && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>Current Plan</CardTitle>
                <CardDescription>
                  You are on the{" "}
                  <span className="font-semibold capitalize">
                    {subscriptionQuery.data.tier}
                  </span>{" "}
                  plan
                </CardDescription>
              </div>
              <Badge
                variant="default"
                className={cn(
                  subscriptionQuery.data.status === "active"
                    ? "bg-green-600"
                    : "bg-yellow-600"
                )}
              >
                {subscriptionQuery.data.status}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Plan Features */}
            <div>
              <h4 className="font-medium mb-3">Included Features</h4>
              <ul className="space-y-2">
                {[
                  "Unlimited job searches",
                  "Up to 50 applications per month",
                  "Email notifications",
                  "Basic analytics",
                ].map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Usage Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg bg-muted p-3">
                <p className="text-xs text-muted-foreground">Applications Left</p>
                <p className="text-2xl font-bold">38/50</p>
              </div>
              <div className="rounded-lg bg-muted p-3">
                <p className="text-xs text-muted-foreground">Days Until Renewal</p>
                <p className="text-2xl font-bold">
                  {Math.ceil(
                    (new Date(subscriptionQuery.data.current_period_end).getTime() -
                      Date.now()) /
                      (1000 * 60 * 60 * 24)
                  )}
                </p>
              </div>
              <div className="rounded-lg bg-muted p-3">
                <p className="text-xs text-muted-foreground">Renewal Date</p>
                <p className="text-sm font-semibold">
                  {new Date(subscriptionQuery.data.current_period_end).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>

          <CardFooter className="border-t flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(true)}
              disabled={subscriptionQuery.data.status !== "active"}
            >
              Cancel Subscription
            </Button>
            {subscriptionQuery.data.payment_method && (
              <Button
                variant="outline"
                onClick={handleOpenPortal}
                disabled={portalMutation.isPending}
              >
                {portalMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                <CreditCard className="mr-2 h-4 w-4" />
                Update Payment Method
              </Button>
            )}
          </CardFooter>
        </Card>
      )}

      {/* Plan Comparison */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Plans & Pricing</CardTitle>
              <CardDescription>
                Choose the plan that fits your needs
              </CardDescription>
            </div>

            {/* Billing Period Toggle */}
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted p-1">
              <button
                onClick={() => setBillingPeriod("monthly")}
                className={cn(
                  "rounded px-3 py-1.5 text-sm font-medium transition-colors",
                  billingPeriod === "monthly"
                    ? "bg-background text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod("annual")}
                className={cn(
                  "rounded px-3 py-1.5 text-sm font-medium transition-colors",
                  billingPeriod === "annual"
                    ? "bg-background text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Annual
                <span className="ml-1 text-xs text-green-600">(Save 20%)</span>
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoadingPlans ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : plansQuery.data ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {plansQuery.data.map((plan) => {
                const isCurrent =
                  subscriptionQuery.data?.plan_id === plan.id
                const price =
                  billingPeriod === "annual"
                    ? Math.round(plan.price_annual / 12)
                    : plan.price_monthly

                return (
                  <div
                    key={plan.id}
                    className={cn(
                      "relative rounded-lg border-2 p-6 transition-all hover:shadow-lg",
                      isCurrent
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    {isCurrent && (
                      <Badge className="absolute -top-2 left-4" variant="default">
                        Current
                      </Badge>
                    )}

                    <div className="space-y-4">
                      {/* Plan Name */}
                      <div>
                        <h3 className="text-lg font-bold capitalize">
                          {plan.name}
                        </h3>
                        <div className="mt-2 flex items-baseline gap-1">
                          <span className="text-3xl font-bold">${price}</span>
                          <span className="text-sm text-muted-foreground">
                            /month
                          </span>
                        </div>
                      </div>

                      {/* Features */}
                      <div className="space-y-2">
                        {plan.features.slice(0, 4).map((feature, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-2 text-sm"
                          >
                            <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </div>
                        ))}
                        {plan.features.length > 4 && (
                          <p className="text-xs text-muted-foreground pl-6">
                            +{plan.features.length - 4} more features
                          </p>
                        )}
                      </div>

                      {/* Button */}
                      {isCurrent ? (
                        <Button disabled variant="outline" className="w-full">
                          Current Plan
                        </Button>
                      ) : (
                        <Button
                          variant={plan.tier === "enterprise" ? "outline" : "default"}
                          className="w-full"
                          onClick={() => handleUpgradePlan(plan.id)}
                          disabled={createCheckoutMutation.isPending}
                        >
                          {createCheckoutMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing
                            </>
                          ) : (
                            `Upgrade to ${plan.name}`
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Payment Method */}
      {subscriptionQuery.data?.payment_method && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
            <CardDescription>
              Your current payment method on file
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-muted p-3">
                  <CreditCard className="h-6 w-6 text-muted-foreground" />
                </div>

                <div>
                  <p className="font-medium capitalize">
                    {subscriptionQuery.data.payment_method.brand} •••• •••• •••• {subscriptionQuery.data.payment_method.last4}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Expires {subscriptionQuery.data.payment_method.exp_month}/
                    {subscriptionQuery.data.payment_method.exp_year}
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={handleOpenPortal}
                disabled={portalMutation.isPending}
              >
                {portalMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <span>Update</span>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invoice History */}
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>Download your past invoices</CardDescription>
        </CardHeader>

        <CardContent>
          {isLoadingInvoices ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-12 rounded-lg border border-border bg-muted animate-pulse"
                />
              ))}
            </div>
          ) : invoicesQuery.data && invoicesQuery.data.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                      Amount
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoicesQuery.data.map((invoice) => (
                    <tr
                      key={invoice.id}
                      className="border-b border-border hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-3 px-4">
                        {new Date(invoice.invoice_date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 font-medium">
                        ${(invoice.amount / 100).toFixed(2)} {invoice.currency.toUpperCase()}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            invoice.status === "paid" ? "default" : "secondary"
                          }
                          className={cn(
                            invoice.status === "paid" && "bg-green-600"
                          )}
                        >
                          {invoice.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {invoice.download_url ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (invoice.download_url) {
                                window.open(invoice.download_url, "_blank")
                              }
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="No invoices yet"
              description="Your invoices will appear here"
            />
          )}
        </CardContent>
      </Card>

      {/* Cancel Subscription Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Cancel Subscription
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel your subscription? You will lose
              access to premium features at the end of your billing period.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-950">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Your subscription will remain active until{" "}
              {subscriptionQuery.data?.current_period_end &&
                new Date(
                  subscriptionQuery.data.current_period_end
                ).toLocaleDateString()}
              .
            </p>
          </div>

          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelSubscription}
              disabled={cancelSubscriptionMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {cancelSubscriptionMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling
                </>
              ) : (
                "Cancel Subscription"
              )}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
