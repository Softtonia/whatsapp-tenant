"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowRight, ArrowLeft, Loader2, Zap, Shield, Sparkles } from "lucide-react";
import { useCompleteSubscriptionPlanMutation } from "../hooks";
import {
  useTenantSubscriptionPlansQuery,
  useTenantSubscriptionPlanDetailQuery,
  useTenantSubscriptionQuery,
  useSelectTenantSubscriptionPlanMutation,
} from "@/features/billing/hooks";
import { getErrorMessage } from "@/src/lib/api/errors";
import type { SubscriptionPlanData } from "@/types/onboarding";

interface StepSubscriptionPlanProps {
  initialData: Partial<SubscriptionPlanData>;
  onNext: (data: SubscriptionPlanData) => void;
  onBack: () => void;
}

const FALLBACK_PLANS = [
  {
    id: 1,
    name: "Growth Starter",
    description: "Ideal for growing branches launching targeted WhatsApp campaigns",
    priceMonthly: 49,
    priceYearly: 39,
    features: [
      "10,000 monthly WhatsApp conversations",
      "Up to 3 team agent seats",
      "Standard Broadcast engine & Templates",
      "Shared Team Inbox & Lead Labels",
      "99.5% WhatsApp API uptime SLA",
    ],
  },
  {
    id: 2,
    name: "Professional Scale",
    description: "Designed for high-throughput sales, support, and marketing teams",
    priceMonthly: 129,
    priceYearly: 99,
    popular: true,
    features: [
      "50,000 monthly WhatsApp conversations",
      "Up to 15 team agent seats",
      "Advanced Auto-assignment & Queues",
      "Campaign analytics & Export API",
      "Multi-number routing & failover",
      "Priority Meta compliance approval",
    ],
  },
  {
    id: 3,
    name: "Enterprise Global",
    description: "Dedicated infrastructure, unlimited throughput, and custom SLA",
    priceMonthly: 299,
    priceYearly: 249,
    features: [
      "Unlimited conversations & messages",
      "Unlimited agent seats & custom roles",
      "Dedicated Meta WABA account manager",
      "Custom Webhooks & REST Integrations",
      "Enterprise SSO / SAML & MFA enforcement",
    ],
  },
];

export function StepSubscriptionPlan({
  initialData,
  onNext,
  onBack,
}: StepSubscriptionPlanProps) {
  // 1. Fetch available plans from GET /api/tenant/subscription/plans
  const { data: plansData, isLoading: loadingPlans } = useTenantSubscriptionPlansQuery();

  // 2. Fetch current tenant subscription from GET /api/tenant/subscription
  const { data: currentSubscription } = useTenantSubscriptionQuery();

  const [selectedPlanId, setSelectedPlanId] = useState<number | string>(
    initialData.subscription_plan_id || currentSubscription?.plan?.id || 1
  );

  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    (initialData.billing_cycle as "monthly" | "yearly") || "monthly"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync if current subscription becomes available
  useEffect(() => {
    if (currentSubscription?.plan?.id && !initialData.subscription_plan_id) {
      setSelectedPlanId(currentSubscription.plan.id);
    }
  }, [currentSubscription, initialData.subscription_plan_id]);

  // 3. Fetch single plan details from GET /api/tenant/subscription/plans/{{plan_id}}
  const { data: planDetail } = useTenantSubscriptionPlanDetailQuery(selectedPlanId);

  // 4. Mutations: select-plan and complete onboarding step
  const selectPlanMutation = useSelectTenantSubscriptionPlanMutation();
  const completeMutation = useCompleteSubscriptionPlanMutation();

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    const planIdNum = Number(selectedPlanId) || 1;
    const payload: SubscriptionPlanData = {
      subscription_plan_id: planIdNum,
      billing_cycle: billingCycle,
    };

    try {
      setErrorMessage(null);

      // Call {{base_url}}/api/tenant/subscription/select-plan
      await selectPlanMutation.mutateAsync({
        plan_id: selectedPlanId,
        subscription_plan_id: planIdNum,
        billing_cycle: billingCycle,
      });

      // Call {{base_url}}/api/onboarding/steps/subscription_plan/complete
      await completeMutation.mutateAsync(payload);
      onNext(payload);
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
    }
  };

  const isPending = selectPlanMutation.isPending || completeMutation.isPending;

  // Normalize plans with API response or fallback
  const plans =
    Array.isArray(plansData) && plansData.length > 0
      ? plansData.map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          priceMonthly: p.price_monthly ?? (p as any).priceMonthly ?? 49,
          priceYearly: p.price_annual ?? (p as any).priceYearly ?? Math.round((p.price_monthly ?? 49) * 0.8),
          popular: p.is_popular ?? (p as any).popular ?? (p.tier === "growth" || p.name.toLowerCase().includes("scale")),
          features: Array.isArray(p.features) ? p.features : [],
        }))
      : FALLBACK_PLANS;

  return (
    <form onSubmit={handleComplete} className="space-y-6">
      {errorMessage && (
        <div className="p-3 text-xs bg-destructive/10 text-destructive border border-destructive/20 rounded-xl">
          {errorMessage}
        </div>
      )}

      {/* Billing Cycle Toggle */}
      <div className="flex items-center justify-center gap-3">
        <span
          className={`text-xs font-semibold cursor-pointer ${
            billingCycle === "monthly" ? "text-foreground" : "text-muted-foreground"
          }`}
          onClick={() => setBillingCycle("monthly")}
        >
          Monthly Billing
        </span>
        <button
          type="button"
          onClick={() =>
            setBillingCycle((prev) => (prev === "monthly" ? "yearly" : "monthly"))
          }
          className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary/20 p-0.5 transition-colors focus:outline-none"
        >
          <span
            className={`inline-block size-5 transform rounded-full bg-primary transition-transform ${
              billingCycle === "yearly" ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
        <div
          className="flex items-center gap-1.5 cursor-pointer"
          onClick={() => setBillingCycle("yearly")}
        >
          <span
            className={`text-xs font-semibold ${
              billingCycle === "yearly" ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            Annual Billing
          </span>
          <Badge
            variant="outline"
            className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20 font-bold"
          >
            Save 20%
          </Badge>
        </div>
      </div>

      {loadingPlans && (
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground py-2">
          <Loader2 className="size-3.5 animate-spin" />
          <span>Loading subscription plans from server...</span>
        </div>
      )}

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => {
          const isSelected = String(selectedPlanId) === String(plan.id);
          const price = billingCycle === "monthly" ? plan.priceMonthly : plan.priceYearly;

          return (
            <div
              key={plan.id}
              onClick={() => setSelectedPlanId(plan.id)}
              className={`relative flex flex-col justify-between rounded-2xl border p-4 cursor-pointer transition-all ${
                isSelected
                  ? "border-primary bg-primary/5 shadow-md ring-2 ring-primary/20"
                  : "border-border/80 bg-card hover:border-border hover:shadow-xs"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-2.5 right-4">
                  <Badge className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5">
                    Recommended
                  </Badge>
                </div>
              )}

              <div className="space-y-3">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-foreground flex items-center justify-between">
                    <span>{plan.name}</span>
                    {isSelected && <Check className="size-4 text-primary" />}
                  </h4>
                  <p className="text-[11px] text-muted-foreground leading-snug">
                    {plan.description}
                  </p>
                </div>

                <div className="flex items-baseline gap-1 pt-1 border-t border-border/50">
                  <span className="text-2xl font-extrabold text-foreground font-mono">
                    ${price}
                  </span>
                  <span className="text-[11px] text-muted-foreground">/ month</span>
                </div>

                <ul className="space-y-2 pt-2 border-t border-border/50">
                  {plan.features.map((f, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-[11px] text-foreground">
                      <Check className="size-3.5 text-primary shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 mt-3 border-t border-border/40">
                <Button
                  type="button"
                  variant={isSelected ? "default" : "outline"}
                  size="xs"
                  className="w-full text-xs font-semibold"
                  onClick={() => setSelectedPlanId(plan.id)}
                >
                  {isSelected ? "Selected Tier" : "Choose Tier"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Nav */}
      <div className="flex items-center justify-between pt-3 border-t border-border/60">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onBack}
          disabled={isPending}
          className="text-xs gap-1.5"
        >
          <ArrowLeft className="size-3.5" />
          Back
        </Button>

        <Button
          type="submit"
          size="sm"
          disabled={isPending}
          className="gap-2 font-semibold text-xs shadow-xs"
        >
          {isPending ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              Saving Plan...
            </>
          ) : (
            <>
              Continue to Marketing &amp; Compliance
              <ArrowRight className="size-3.5" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
