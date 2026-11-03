"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Shield,
} from "lucide-react";
import type { SubscriptionOverview } from "@/types/billing";
import { formatDateShort } from "@/lib/formatters";

interface SubscriptionPlanCardProps {
  subscription?: SubscriptionOverview;
  isLoading: boolean;
  onChangePlan: () => void;
  onCancelPlan: () => void;
}

export function SubscriptionPlanCard({
  subscription,
  isLoading,
  onChangePlan,
  onCancelPlan,
}: SubscriptionPlanCardProps) {
  if (isLoading) {
    return (
      <Card className="border-border/80 shadow-xs animate-pulse">
        <CardContent className="p-6 space-y-4">
          <div className="h-6 bg-muted/40 w-48 rounded" />
          <div className="h-10 bg-muted/30 rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  const plan = subscription?.plan;
  const isCanceled = subscription?.cancel_at_period_end;

  return (
    <Card className="border-border/80 shadow-xs">
      <CardHeader className="border-b border-border/60 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <CreditCard className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-bold text-foreground">
                  {plan?.name || "Growth"} Subscription Plan
                </CardTitle>
                <Badge
                  variant="outline"
                  className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-semibold"
                >
                  {subscription?.status || "Active"}
                </Badge>
                {isCanceled && (
                  <Badge
                    variant="outline"
                    className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px] font-semibold"
                  >
                    Cancels at end of cycle
                  </Badge>
                )}
              </div>
              <CardDescription className="text-xs">
                {plan?.description || "High-volume broadcast delivery, shared inbox, and AI agents"}
              </CardDescription>
            </div>
          </div>

          <div className="text-right self-start sm:self-auto">
            <span className="text-2xl font-extrabold text-foreground">
              ${plan?.price_monthly || 79}
            </span>
            <span className="text-xs text-muted-foreground"> / month</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-muted/20 border border-border/80 space-y-1">
            <span className="text-[11px] text-muted-foreground">Billing Cycle</span>
            <span className="font-bold text-foreground block capitalize">
              {subscription?.billing_cycle || "Monthly"}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-muted/20 border border-border/80 space-y-1">
            <span className="text-[11px] text-muted-foreground">Next Renewal Date</span>
            <span className="font-bold text-foreground block">
              {subscription?.current_period_end
                ? formatDateShort(subscription.current_period_end)
                : "Nov 30, 2026"}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-muted/20 border border-border/80 space-y-1">
            <span className="text-[11px] text-muted-foreground">Payment Method</span>
            <span className="font-bold text-foreground block">
              {subscription?.payment_method
                ? `${subscription.payment_method.brand} ending in ${subscription.payment_method.last4}`
                : "Visa ending in 4242"}
            </span>
          </div>
        </div>

        {/* Plan Key Included Features */}
        <div className="space-y-2">
          <span className="font-semibold text-foreground text-[11px] block">
            Plan Entitlements:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-muted-foreground">
            {(plan?.features || [
              "10,000 Service Conversations / month",
              "Up to 15,000 Contacts",
              "3 Registered WhatsApp Numbers",
              "10 Agent Seats",
              "AI Assistant with Gemini 2.5",
              "Broadcast Campaigns & Analytics",
            ]).map((feat, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {isCanceled && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 flex items-start gap-2.5">
            <AlertTriangle className="size-4 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              Your subscription is set to expire on {formatDateShort(subscription?.current_period_end)}.
              After this date, your workspace will be placed on read-only mode and WhatsApp broadcast delivery will pause.
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="border-t border-border/60 py-3 px-4 sm:px-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Shield className="size-3.5 text-emerald-500" />
          <span>PCI-DSS Compliant 256-bit encrypted checkout</span>
        </div>

        <div className="flex items-center gap-2">
          {!isCanceled && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancelPlan}
              className="h-8 text-xs text-muted-foreground hover:text-rose-600"
            >
              Cancel Subscription
            </Button>
          )}

          <Button
            size="sm"
            onClick={onChangePlan}
            className="h-8 gap-1.5 text-xs font-semibold shadow-xs"
          >
            <span>Change Plan</span>
            <ArrowRight className="size-3.5" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

