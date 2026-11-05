"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Rocket,
  CheckCircle2,
  Building2,
  CreditCard,
  ShieldCheck,
  ArrowLeft,
  Loader2,
  FileText,
  ExternalLink,
  AlertTriangle,
  ArrowUpRight,
} from "lucide-react";
import {
  useCompleteFinalActivationMutation,
  useSubmitOnboardingMutation,
} from "../hooks";
import { useTenantStore } from "@/lib/tenant/store";
import { useAuthStore } from "@/lib/auth/store";
import { getErrorMessage } from "@/src/lib/api/errors";
import type {
  TenantRegistrationData,
  BusinessInformationData,
  SubscriptionPlanData,
  MarketingComplianceData,
} from "@/types/onboarding";

export interface IncompleteRequirement {
  stepId: number;
  title: string;
  description: string;
}

interface StepFinalActivationProps {
  tenantData: TenantRegistrationData;
  businessData: Partial<BusinessInformationData>;
  planData: Partial<SubscriptionPlanData>;
  complianceData: Partial<MarketingComplianceData>;
  incompleteRequirements?: IncompleteRequirement[];
  onNavigateStep?: (stepId: number) => void;
  onBack: () => void;
}

export function StepFinalActivation({
  tenantData,
  businessData,
  planData,
  complianceData,
  incompleteRequirements = [],
  onNavigateStep,
  onBack,
}: StepFinalActivationProps) {
  const [acceptedTerms, setAcceptedTerms] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const finalActivationMutation = useCompleteFinalActivationMutation();
  const submitMutation = useSubmitOnboardingMutation();
  const setActiveTenant = useTenantStore((s) => s.setActiveTenant);

  const hasIncompleteSteps = incompleteRequirements.length > 0;

  const handleLaunch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (hasIncompleteSteps) {
      setErrorMessage(
        "Cannot activate workspace: All required onboarding steps and documents must be completed first."
      );
      return;
    }

    if (!acceptedTerms) {
      setErrorMessage("Please accept the Terms of Service to activate your workspace.");
      return;
    }

    try {
      setErrorMessage(null);
      // 1. Complete Final Activation Step
      await finalActivationMutation.mutateAsync({ accepted_terms: true });

      // 2. Submit Final Onboarding
      const submitRes = await submitMutation.mutateAsync();

      // Update tenant store with activated workspace
      const activeTenantData =
        submitRes?.workspace ||
        submitRes?.tenant || {
          id: submitRes?.tenant_id || (submitRes as any)?.data?.tenant_id,
          name: businessData.business_display_name || tenantData.workspace_name || "Workspace",
          status: "active",
        };

      if (activeTenantData?.id) {
        setActiveTenant(activeTenantData);
        useAuthStore.getState().updateUser({ tenant_id: activeTenantData.id });
      }

      // Navigate straight to dashboard
      if (typeof window !== "undefined") {
        window.location.href = "/dashboard";
      }
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
    }
  };

  const isPending =
    finalActivationMutation.isPending || submitMutation.isPending;

  return (
    <form onSubmit={handleLaunch} className="space-y-6">
      {errorMessage && (
        <div className="p-3 text-xs bg-destructive/10 text-destructive border border-destructive/20 rounded-xl">
          {errorMessage}
        </div>
      )}

      {/* Review Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
        {/* Card 1: Workspace & Business */}
        <div className="p-3.5 rounded-xl border border-border/80 bg-card space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-foreground">
            <Building2 className="size-4 text-primary" />
            <span>Workspace &amp; Entity</span>
          </div>
          <div className="space-y-1 text-muted-foreground text-[11px]">
            <p>
              <strong className="text-foreground">Name:</strong>{" "}
              {businessData.business_display_name || tenantData.workspace_name}
            </p>
            <p>
              <strong className="text-foreground">Legal:</strong>{" "}
              {businessData.legal_business_name || "N/A"}
            </p>
            <p>
              <strong className="text-foreground">Entity:</strong>{" "}
              <span className="capitalize">{businessData.business_type}</span>
            </p>
            <p>
              <strong className="text-foreground">Location:</strong>{" "}
              {businessData.city}, {businessData.country}
            </p>
          </div>
        </div>

        {/* Card 2: Subscription & Compliance */}
        <div className="p-3.5 rounded-xl border border-border/80 bg-card space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-foreground">
            <CreditCard className="size-4 text-primary" />
            <span>Plan &amp; Compliance</span>
          </div>
          <div className="space-y-1 text-muted-foreground text-[11px]">
            <p>
              <strong className="text-foreground">Selected Plan:</strong> Tier{" "}
              {planData.subscription_plan_id || 1} ({planData.billing_cycle})
            </p>
            <p>
              <strong className="text-foreground">Opt-in Required:</strong>{" "}
              {complianceData.customer_opt_in_required ? "Strict Yes" : "No"}
            </p>
            <p>
              <strong className="text-foreground">Unsubscribe:</strong>{" "}
              Keyword {complianceData.unsubscribe_keyword || "STOP"}
            </p>
            <p>
              <strong className="text-foreground">Language:</strong>{" "}
              {complianceData.default_language?.toUpperCase() || "EN"}
            </p>
          </div>
        </div>
      </div>

      {/* Status Banner */}
      {hasIncompleteSteps ? (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300">
            <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>Onboarding Incomplete: Missing Required Information</span>
          </div>
          <p className="text-[11px] leading-relaxed text-amber-800/90 dark:text-amber-300/90">
            Your workspace cannot be activated yet because required onboarding information or verification documents are pending. Please complete the following items:
          </p>
          <div className="space-y-2 pt-1">
            {incompleteRequirements.map((req, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-background/80 border border-amber-500/20 text-xs"
              >
                <div className="min-w-0 pr-2">
                  <p className="font-semibold text-foreground text-[11px]">{req.title}</p>
                  <p className="text-[10px] text-muted-foreground">{req.description}</p>
                </div>
                {onNavigateStep && (
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={() => onNavigateStep(req.stepId)}
                    className="shrink-0 text-[10px] h-7 gap-1 border-amber-500/30 hover:bg-amber-500/10"
                  >
                    <span>Complete</span>
                    <ArrowUpRight className="size-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 dark:text-emerald-200 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold">
            <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
            <span>All Requirements Satisfied</span>
          </div>
          <p className="text-[11px] leading-relaxed text-emerald-800/80 dark:text-emerald-300/80">
            Your multi-tenant workspace credentials, database partitions, and WhatsApp messaging routing will be provisioned immediately upon submission.
          </p>
        </div>
      )}

      {/* Accept Terms Checkbox */}
      <div className="flex items-start gap-3 p-3.5 rounded-xl border border-border/80 bg-card">
        <input
          type="checkbox"
          id="terms"
          checked={acceptedTerms}
          onChange={(e) => setAcceptedTerms(e.target.checked)}
          className="size-4 rounded border-border text-primary focus:ring-primary shrink-0 mt-0.5 cursor-pointer"
        />
        <label htmlFor="terms" className="text-xs text-muted-foreground leading-normal cursor-pointer select-none">
          I confirm that all company details provided are accurate and agree to adhere to the{" "}
          <Link
            href="/terms-of-service"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="font-bold text-primary underline underline-offset-4 hover:text-primary/80 transition-colors inline-flex items-center gap-0.5"
          >
            <span>Terms of Service</span>
            <ExternalLink className="size-3 inline shrink-0" />
          </Link>
          .
        </label>
      </div>

      {/* Action Buttons */}
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
          disabled={isPending || !acceptedTerms || hasIncompleteSteps}
          className={`gap-2 font-bold text-xs shadow-md text-white ${
            hasIncompleteSteps
              ? "bg-muted-foreground/50 cursor-not-allowed"
              : "bg-emerald-600 hover:bg-emerald-700"
          }`}
        >
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Activating Workspace...
            </>
          ) : (
            <>
              <Rocket className="size-4" />
              {hasIncompleteSteps ? "Complete Required Steps First" : "Activate & Launch Workspace"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

