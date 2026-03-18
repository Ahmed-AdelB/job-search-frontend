"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiGet, apiPost } from "@/lib/api-client"
import type {
  BillingPlan,
  Subscription,
  Invoice,
  CheckoutSession,
  PortalSession,
} from "@/types/api"
import { toast } from "sonner"

/**
 * Fetch all available billing plans
 */
export function usePlans() {
  return useQuery({
    queryKey: ["billing-plans"],
    queryFn: () => apiGet<BillingPlan[]>("/api/billing/plans"),
    staleTime: 300000, // 5 minutes
  })
}

/**
 * Fetch current user's subscription
 */
export function useSubscription() {
  return useQuery({
    queryKey: ["subscription"],
    queryFn: () => apiGet<Subscription>("/api/billing/subscription"),
    staleTime: 60000,
  })
}

/**
 * Create a checkout session for plan upgrade
 */
export function useCreateCheckout() {
  return useMutation({
    mutationFn: (planId: string) =>
      apiPost<CheckoutSession>("/api/checkout/session", { plan_id: planId }),
    onSuccess: (data) => {
      // Redirect to Stripe checkout
      if (typeof window !== "undefined" && data.url) {
        window.location.href = data.url
      }
    },
    onError: () => {
      toast.error("Failed to create checkout session")
    },
  })
}

/**
 * Cancel current subscription
 */
export function useCancelSubscription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => apiPost<Subscription>("/api/billing/cancel", {}),
    onSuccess: (data) => {
      queryClient.setQueryData(["subscription"], data)
      toast.success("Subscription cancelled successfully")
    },
    onError: () => {
      toast.error("Failed to cancel subscription")
    },
  })
}

/**
 * Fetch invoice history
 */
export function useInvoices() {
  return useQuery({
    queryKey: ["invoices"],
    queryFn: () => apiGet<Invoice[]>("/api/billing/invoices"),
    staleTime: 60000,
  })
}

/**
 * Create a Stripe customer portal session and redirect
 */
export function usePortal() {
  return useMutation({
    mutationFn: () => apiPost<PortalSession>("/api/billing/portal", {}),
    onSuccess: (data) => {
      // Redirect to Stripe portal
      if (typeof window !== "undefined" && data.url) {
        window.location.href = data.url
      }
    },
    onError: () => {
      toast.error("Failed to open billing portal")
    },
  })
}
