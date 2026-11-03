"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Shield, ArrowRight } from "lucide-react";
import { useChangePlanMutation } from "../hooks";
import type { SubscriptionOverview, PlanTier } from "@/types/billing";

interface PlanComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription?: SubscriptionOverview;
  onSuccess?: () => void;
}

const PLANS = [
  {
    id: 1,
    tier: "starter" as PlanTier,
    name: "Starter",
    price: 29,
    desc: "For small teams starting customer support on WhatsApp",
    features: [
      "1,000 Service Chats / mo",
      "Up to 2,500 Contacts",
      "1 Phone Number",
      "3 Agent Seats",
      "Basic Message Templates",
    ],
  },
  {
    id: 2,
    tier: "growth" as PlanTier,
    name: "Growth",
    price: 79,
    desc: "Broadcast campaigns, AI chatbots, and multi-agent inbox",
    features: [
      "10,000 Service Chats / mo",
      "Up to 15,000 Contacts",
      "3 Phone Numbers",
      "10 Agent Seats",
      "AI Chatbot (Gemini 2.5)",
      "Broadcast Campaigns & Analytics",
      "Workflow Automations",
    ],
    popular: true,
  },
  {
    id: 3,
    tier: "enterprise" as PlanTier,
    name: "Enterprise",
    price: 199,
    desc: "Mass outreach scale, dedicated throughput, and custom APIs",
    features: [
      "100,000 Service Chats / mo",
      "Up to 100,000 Contacts",
      "10 Phone Numbers",
      "Unlimited Agent Seats",
      "Custom Webhooks & REST API",
      "SSO & Audit Logs",
      "Dedicated Account Manager",
    ],
  },
];

export function PlanComparisonModal({
  isOpen,
  onClose,
  subscription,
  onSuccess,
}: PlanComparisonModalProps) {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <PlanComparisonInner
          key={isOpen ? "open" : "closed"}
          subscription={subscription}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}

function PlanComparisonInner({
  subscription,
  onClose,
  onSuccess,
}: {
  subscription?: SubscriptionOverview;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const currentTier = subscription?.plan?.tier || "growth";
  const [selectedPlanId, setSelectedPlanId] = React.useState<number | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const changeMutation = useChangePlanMutation();

  const handleSelectPlan = async (planId: number, planTier: PlanTier) => {
    if (planTier === currentTier) return;
    try {
      setSelectedPlanId(planId);
      setErrorMessage(null);
      await changeMutation.mutateAsync({
        plan_id: planId,
        effective_timing: "immediate",
        reason: `User requested plan change to ${planTier}`,
      });
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to process plan change"
      );
    } finally {
      setSelectedPlanId(null);
    }
  };

  return (
    <div className="space-y-6">
      <DialogHeader>
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Sparkles className="size-5" />
          </div>
          <div>
            <DialogTitle className="text-base font-bold text-foreground">
              Upgrade or Change Subscription Plan
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Scale messaging limits, registered phone numbers, and agent capacity.
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      {errorMessage && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs font-medium text-rose-600">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLANS.map((plan) => {
          const isCurrent = plan.tier === currentTier;

          return (
            <div
              key={plan.id}
              className={`p-5 rounded-2xl border flex flex-col justify-between transition-all relative ${
                plan.popular
                  ? "border-primary bg-primary/5 shadow-xs"
                  : "border-border bg-card"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 right-4">
                  <Badge variant="outline" className="bg-primary text-primary-foreground text-[10px] font-bold">
                    Most Popular
                  </Badge>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <h4 className="font-bold text-sm text-foreground">{plan.name}</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                    {plan.desc}
                  </p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold text-foreground">
                    ${plan.price}
                  </span>
                  <span className="text-xs text-muted-foreground">/ month</span>
                </div>

                <div className="pt-2 border-t border-border/60 space-y-2">
                  <span className="text-[11px] font-semibold text-foreground block">
                    What&apos;s included:
                  </span>
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="size-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-[11px] leading-snug">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-5 mt-4 border-t border-border/60">
                {isCurrent ? (
                  <Button
                    variant="outline"
                    disabled
                    size="sm"
                    className="w-full text-xs font-semibold cursor-default"
                  >
                    Current Active Plan
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleSelectPlan(plan.id, plan.tier)}
                    disabled={selectedPlanId === plan.id}
                    variant={plan.popular ? "default" : "outline"}
                    className="w-full gap-1.5 text-xs font-semibold"
                  >
                    {selectedPlanId === plan.id ? (
                      "Processing..."
                    ) : (
                      <>
                        <span>Select {plan.name}</span>
                        <ArrowRight className="size-3.5" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-3 bg-muted/20 border border-border/80 rounded-xl flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Shield className="size-3.5 text-emerald-500" />
          Upgrades take effect immediately with prorated billing adjustment.
        </span>
        <Button variant="ghost" size="sm" onClick={onClose} className="text-xs">
          Close
        </Button>
      </div>
    </div>
  );
}

