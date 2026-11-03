"use client";

import { useState } from "react";
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
} from "lucide-react";
import {
  useCompleteFinalActivationMutation,
  useSubmitOnboardingMutation,
} from "../hooks";
import { useTenantStore } from "@/lib/tenant/store";
import { getErrorMessage } from "@/src/lib/api/errors";
import type {
  TenantRegistrationData,
  BusinessInformationData,
  SubscriptionPlanData,
  MarketingComplianceData,
} from "@/types/onboarding";

interface StepFinalActivationProps {
  tenantData: TenantRegistrationData;
  businessData: Partial<BusinessInformationData>;
  planData: Partial<SubscriptionPlanData>;
  complianceData: Partial<MarketingComplianceData>;
  onBack: () => void;
}

export function StepFinalActivation({
  tenantData,
  businessData,
  planData,
  complianceData,
  onBack,
}: StepFinalActivationProps) {
  const [acceptedTerms, setAcceptedTerms] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const finalActivationMutation = useCompleteFinalActivationMutation();
  const submitMutation = useSubmitOnboardingMutation();
  const setActiveTenant = useTenantStore((s) => s.setActiveTenant);

  const handleLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
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
          id: submitRes?.tenant_id || 1,
          name: businessData.business_display_name || tenantData.workspace_name || "Workspace",
          status: "active",
        };

      setActiveTenant(activeTenantData);

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

      {/* Ready Banner */}
      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 dark:text-emerald-200 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold">
          <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
          <span>All Requirements Satisfied</span>
        </div>
        <p className="text-[11px] leading-relaxed text-emerald-800/80 dark:text-emerald-300/80">
          Your multi-tenant workspace credentials, database partitions, and WhatsApp messaging routing will be provisioned immediately upon submission.
        </p>
      </div>

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
          <strong className="text-foreground">Meta WhatsApp Business Terms of Service</strong> and Multi-Tenant Acceptable Use Policy.
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
          disabled={isPending || !acceptedTerms}
          className="gap-2 font-bold text-xs shadow-md bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Activating Workspace...
            </>
          ) : (
            <>
              <Rocket className="size-4" />
              Activate &amp; Launch Workspace
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

