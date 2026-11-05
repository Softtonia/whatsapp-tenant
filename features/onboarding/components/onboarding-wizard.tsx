"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { StepTenantRegistration } from "./step-tenant-registration";
import { StepBusinessInformation } from "./step-business-information";
import { StepSubscriptionPlan } from "./step-subscription-plan";
import { StepMarketingCompliance } from "./step-marketing-compliance";
import { StepFinalActivation } from "./step-final-activation";
import {
  useOnboardingStepsQuery,
  useOnboardingProgressQuery,
  isOnboardingComplete,
} from "../hooks";
import { useTenantStore } from "@/lib/tenant/store";
import { useAuthStore } from "@/lib/auth/store";
import {
  Check,
  Building2,
  FileText,
  CreditCard,
  ShieldCheck,
  Rocket,
  RefreshCw,
  Lock,
} from "lucide-react";
import type {
  TenantRegistrationData,
  BusinessInformationData,
  SubscriptionPlanData,
  MarketingComplianceData,
  ServerOnboardingStep,
} from "@/types/onboarding";
import type { IncompleteRequirement } from "./step-final-activation";

const ONBOARDING_STEPS = [
  { id: 1, key: "tenant_registration", title: "Tenant", icon: Building2 },
  { id: 2, key: "business_information", title: "Business Info", icon: FileText },
  { id: 3, key: "subscription_plan", title: "Plan", icon: CreditCard },
  { id: 4, key: "marketing_compliance", title: "Compliance", icon: ShieldCheck },
  { id: 5, key: "final_activation", title: "Activation", icon: Rocket },
];

const DEFAULT_TENANT_DATA: TenantRegistrationData = {
  name: "",
  company_name: "",
  country: "",
  timezone: "UTC",
  preferred_language: "en",
  terms_accepted: false,
  workspace_name: "",
  subdomain: "",
};

const DEFAULT_BUSINESS_DATA: Partial<BusinessInformationData> = {
  legal_business_name: "",
  business_display_name: "",
  business_type: "corporation",
  industry_id: 1,
  business_email: "",
  business_phone: "",
  website_url: "",
  business_description: "",
  tax_registration_number: "",
  registration_number: "",
  country: "US",
  state: "",
  city: "",
  postal_code: "",
  address_line_1: "",
  address_line_2: "",
};

const DEFAULT_PLAN_DATA: Partial<SubscriptionPlanData> = {
  subscription_plan_id: 1,
  billing_cycle: "monthly",
};

const DEFAULT_COMPLIANCE_DATA: Partial<MarketingComplianceData> = {
  marketing_enabled: true,
  customer_opt_in_required: true,
  opt_in_method: ["website_form", "checkout_form"],
  privacy_policy_url: "",
  unsubscribe_enabled: true,
  unsubscribe_keyword: "STOP",
  default_language: "en",
  default_country_code: "+1",
};

export function OnboardingWizard() {
  const router = useRouter();

  // 1. Server Data Queries (Single source of truth)
  const {
    data: rawStepsData,
    isLoading: isStepsLoading,
    isRefetching: isStepsRefetching,
    refetch: refetchSteps,
    dataUpdatedAt,
  } = useOnboardingStepsQuery();

  const { data: progressData } = useOnboardingProgressQuery();

  const stepsList: ServerOnboardingStep[] = useMemo(() => {
    return Array.isArray(rawStepsData) ? (rawStepsData as ServerOnboardingStep[]) : [];
  }, [rawStepsData]);

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [hasInitializedStep, setHasInitializedStep] = useState<boolean>(false);

  // Wizard form data states populated directly from /api/onboarding/steps
  const [tenantData, setTenantData] = useState<TenantRegistrationData>(DEFAULT_TENANT_DATA);
  const [businessData, setBusinessData] = useState<Partial<BusinessInformationData>>(DEFAULT_BUSINESS_DATA);
  const [planData, setPlanData] = useState<Partial<SubscriptionPlanData>>(DEFAULT_PLAN_DATA);
  const [complianceData, setComplianceData] = useState<Partial<MarketingComplianceData>>(DEFAULT_COMPLIANCE_DATA);

  // 2. Hydrate form states directly from Server Response (/api/onboarding/steps)
  useEffect(() => {
    if (!stepsList || stepsList.length === 0) return;

    // Step 1: tenant_registration
    const tenantStep = stepsList.find((s) => s.step_key === "tenant_registration");
    if (tenantStep?.form_data && typeof tenantStep.form_data === "object" && !Array.isArray(tenantStep.form_data)) {
      const fd = tenantStep.form_data;
      setTenantData((prev) => ({
        ...prev,
        name: fd.name ?? prev.name,
        company_name: fd.company_name ?? fd.tenant_name ?? prev.company_name,
        country: fd.country ?? prev.country,
        timezone: fd.timezone ?? prev.timezone,
        preferred_language: fd.preferred_language ?? prev.preferred_language,
        terms_accepted: typeof fd.terms_accepted === "boolean" ? fd.terms_accepted : prev.terms_accepted,
        workspace_name: fd.tenant_name ?? fd.workspace_name ?? fd.company_name ?? prev.workspace_name,
        subdomain: fd.tenant_slug ?? fd.subdomain ?? prev.subdomain,
      }));
    }

    // Step 2: business_information
    const businessStep = stepsList.find((s) => s.step_key === "business_information");
    if (businessStep?.form_data && typeof businessStep.form_data === "object" && !Array.isArray(businessStep.form_data)) {
      const fd = businessStep.form_data;
      setBusinessData((prev) => ({
        ...prev,
        legal_business_name: fd.legal_business_name ?? prev.legal_business_name,
        business_display_name: fd.business_display_name ?? prev.business_display_name,
        business_type: fd.business_type ?? prev.business_type,
        industry_id: fd.industry_id !== undefined && fd.industry_id !== null ? Number(fd.industry_id) : prev.industry_id,
        business_email: fd.business_email ?? prev.business_email,
        business_phone: fd.business_phone ?? prev.business_phone,
        website_url: fd.website_url ?? prev.website_url,
        business_description: fd.business_description ?? prev.business_description,
        tax_registration_number: fd.tax_registration_number ?? prev.tax_registration_number,
        registration_number: fd.registration_number ?? prev.registration_number,
        country: fd.country ?? prev.country,
        state: fd.state ?? prev.state,
        city: fd.city ?? prev.city,
        postal_code: fd.postal_code ?? prev.postal_code,
        address_line_1: fd.address_line_1 ?? prev.address_line_1,
        address_line_2: fd.address_line_2 ?? prev.address_line_2,
      }));
    }

    // Step 4: subscription_plan
    const planStep = stepsList.find((s) => s.step_key === "subscription_plan");
    if (planStep?.form_data && typeof planStep.form_data === "object" && !Array.isArray(planStep.form_data)) {
      const fd = planStep.form_data;
      setPlanData((prev) => ({
        ...prev,
        subscription_plan_id: fd.subscription_plan_id ? Number(fd.subscription_plan_id) : prev.subscription_plan_id,
        billing_cycle: fd.billing_cycle ?? prev.billing_cycle,
      }));
    }

    // Step 7: marketing_compliance
    const complianceStep = stepsList.find((s) => s.step_key === "marketing_compliance");
    if (complianceStep?.form_data && typeof complianceStep.form_data === "object" && !Array.isArray(complianceStep.form_data)) {
      const fd = complianceStep.form_data;
      setComplianceData((prev) => ({
        ...prev,
        marketing_enabled: typeof fd.marketing_enabled === "boolean" ? fd.marketing_enabled : prev.marketing_enabled,
        customer_opt_in_required: typeof fd.customer_opt_in_required === "boolean" ? fd.customer_opt_in_required : prev.customer_opt_in_required,
        opt_in_method: Array.isArray(fd.opt_in_method) && fd.opt_in_method.length > 0 ? fd.opt_in_method : prev.opt_in_method,
        privacy_policy_url: fd.privacy_policy_url ?? prev.privacy_policy_url,
        unsubscribe_enabled: typeof fd.unsubscribe_enabled === "boolean" ? fd.unsubscribe_enabled : prev.unsubscribe_enabled,
        unsubscribe_keyword: fd.unsubscribe_keyword ?? prev.unsubscribe_keyword,
        default_language: fd.default_language ?? prev.default_language,
        default_country_code: fd.default_country_code ?? prev.default_country_code,
      }));
    }

    // Synchronize tenant_id if present in server step data
    const detectedTenantId =
      stepsList.find((s) => s.form_data?.tenant_id)?.form_data?.tenant_id ||
      stepsList.find((s) => s.step_key === "marketing_compliance")?.form_data?.tenant_id;

    if (detectedTenantId) {
      const activeTenant = useTenantStore.getState().activeTenant;
      if (!activeTenant?.id) {
        useTenantStore.getState().setActiveTenant({
          id: detectedTenantId,
          name: tenantStep?.form_data?.tenant_name || "Workspace",
          status: "active",
        });
      }
      const user = useAuthStore.getState().user;
      if (!user?.tenant_id) {
        useAuthStore.getState().updateUser({ tenant_id: detectedTenantId });
      }
    }
  }, [stepsList]);

  // 3. Step Completion Verification
  const stepStatus = useMemo(() => {
    const tenantStep = stepsList.find((s) => s.step_key === "tenant_registration");
    const businessStep = stepsList.find((s) => s.step_key === "business_information");
    const docsStep = stepsList.find((s) => s.step_key === "business_documents");
    const planStep = stepsList.find((s) => s.step_key === "subscription_plan");
    const complianceStep = stepsList.find((s) => s.step_key === "marketing_compliance");
    const activationStep = stepsList.find((s) => s.step_key === "final_activation");

    const isStep1Done = Boolean(tenantStep?.is_completed || tenantStep?.status === "completed");
    const isStep2BusinessDone = Boolean(businessStep?.is_completed || businessStep?.status === "completed");
    const isStep2DocsDone = docsStep ? Boolean(docsStep.is_completed || docsStep.status === "completed") : true;
    const isStep2Done = isStep2BusinessDone && isStep2DocsDone;
    const isStep3Done = Boolean(planStep?.is_completed || planStep?.status === "completed");
    const isStep4Done = Boolean(complianceStep?.is_completed || complianceStep?.status === "completed");
    const isStep5Done = Boolean(activationStep?.is_completed || activationStep?.status === "completed");

    // Compute first incomplete required step
    let firstIncomplete = 1;
    if (!isStep1Done) {
      firstIncomplete = 1;
    } else if (!isStep2Done) {
      firstIncomplete = 2;
    } else if (!isStep3Done) {
      firstIncomplete = 3;
    } else if (!isStep4Done) {
      firstIncomplete = 4;
    } else {
      firstIncomplete = 5;
    }

    // Build detailed missing requirements for Step 5
    const incompleteRequirements: IncompleteRequirement[] = [];
    if (!isStep1Done) {
      incompleteRequirements.push({
        stepId: 1,
        title: "Step 1: Workspace & Tenant Registration",
        description: "Primary workspace name and legal company identification are incomplete.",
      });
    }
    if (!isStep2BusinessDone) {
      incompleteRequirements.push({
        stepId: 2,
        title: "Step 2: Business Profile Information",
        description: "Legal entity name, business phone, and address are incomplete.",
      });
    }
    if (!isStep2DocsDone) {
      const reqList = Array.isArray(docsStep?.requirements) && docsStep.requirements.length > 0
        ? docsStep.requirements.join(", ")
        : "business_registration, tax_id";
      incompleteRequirements.push({
        stepId: 2,
        title: "Step 2: Business Verification Documents",
        description: `Required verification documents (${reqList}) are missing or pending review.`,
      });
    }
    if (!isStep3Done) {
      incompleteRequirements.push({
        stepId: 3,
        title: "Step 3: Subscription Plan Selection",
        description: "Subscription tier and quota selection are incomplete.",
      });
    }
    if (!isStep4Done) {
      incompleteRequirements.push({
        stepId: 4,
        title: "Step 4: Meta Marketing & Messaging Compliance",
        description: "Customer opt-in policy and unsubscribe keyword configuration are incomplete.",
      });
    }

    return {
      isStep1Done,
      isStep2BusinessDone,
      isStep2DocsDone,
      isStep2Done,
      isStep3Done,
      isStep4Done,
      isStep5Done,
      firstIncomplete,
      incompleteRequirements,
    };
  }, [stepsList]);

  // Check if a specific step is unlocked for user navigation
  const isStepUnlocked = useCallback(
    (stepId: number): boolean => {
      if (stepId === 1) return true;
      if (stepId === 2) return stepStatus.isStep1Done;
      if (stepId === 3) return stepStatus.isStep1Done && stepStatus.isStep2Done;
      if (stepId === 4) return stepStatus.isStep1Done && stepStatus.isStep2Done && stepStatus.isStep3Done;
      if (stepId === 5) return stepStatus.isStep1Done && stepStatus.isStep2Done && stepStatus.isStep3Done && stepStatus.isStep4Done;
      return false;
    },
    [stepStatus]
  );

  // 4. Redirect to dashboard immediately if onboarding is complete
  useEffect(() => {
    if (isOnboardingComplete(progressData) || stepStatus.isStep5Done) {
      router.replace("/dashboard");
    }
  }, [progressData, stepStatus.isStep5Done, router]);

  // 5. Initial Step Position Placement from Server Data
  useEffect(() => {
    if (isStepsLoading) return;

    if (isOnboardingComplete(progressData)) {
      router.replace("/dashboard");
      return;
    }

    if (!hasInitializedStep && stepsList.length > 0) {
      // Check if URL specified ?step=X and if it's unlocked
      if (typeof window !== "undefined") {
        const urlParams = new URLSearchParams(window.location.search);
        const urlStep = parseInt(urlParams.get("step") || "", 10);
        if (urlStep >= 1 && urlStep <= 5 && isStepUnlocked(urlStep)) {
          setCurrentStep(urlStep);
          setHasInitializedStep(true);
          return;
        }
      }

      // Default: Position user at the first incomplete required step
      setCurrentStep(stepStatus.firstIncomplete);
      setHasInitializedStep(true);
    }
  }, [
    isStepsLoading,
    hasInitializedStep,
    stepsList,
    progressData,
    router,
    stepStatus.firstIncomplete,
    isStepUnlocked,
  ]);

  // Keep URL search param ?step= in sync
  const handleNavigateStep = useCallback(
    (stepId: number) => {
      if (stepId < currentStep || isStepUnlocked(stepId)) {
        setCurrentStep(stepId);
        if (typeof window !== "undefined") {
          const url = new URL(window.location.href);
          url.searchParams.set("step", String(stepId));
          window.history.replaceState({}, "", url.toString());
        }
      }
    },
    [currentStep, isStepUnlocked]
  );

  const handleTenantChange = useCallback((data: Partial<TenantRegistrationData>) => {
    setTenantData((prev) => ({ ...prev, ...data }));
  }, []);

  const handleBusinessChange = useCallback((data: Partial<BusinessInformationData>) => {
    setBusinessData((prev) => ({ ...prev, ...data }));
  }, []);

  const handlePlanChange = useCallback((data: Partial<SubscriptionPlanData>) => {
    setPlanData((prev) => ({ ...prev, ...data }));
  }, []);

  const handleComplianceChange = useCallback((data: Partial<MarketingComplianceData>) => {
    setComplianceData((prev) => ({ ...prev, ...data }));
  }, []);

  if (isStepsLoading && !hasInitializedStep) {
    return (
      <Card className="w-full max-w-3xl shadow-xl border-border/80">
        <div className="flex flex-col items-center justify-center p-16 text-center space-y-3">
          <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-xs text-muted-foreground font-medium">
            Fetching onboarding status from server...
          </p>
        </div>
      </Card>
    );
  }

  const lastSyncText = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : null;

  return (
    <Card className="w-full max-w-3xl shadow-xl border-border/80">
      <CardHeader className="text-center pb-4">
        {/* Step Progress Stepper */}
        <div className="flex items-center justify-between max-w-xl mx-auto mb-3 px-2">
          {ONBOARDING_STEPS.map((s, idx) => {
            const isCompleted =
              s.id === 1
                ? stepStatus.isStep1Done
                : s.id === 2
                ? stepStatus.isStep2Done
                : s.id === 3
                ? stepStatus.isStep3Done
                : s.id === 4
                ? stepStatus.isStep4Done
                : stepStatus.isStep5Done;

            const isCurrent = currentStep === s.id;
            const isUnlocked = isStepUnlocked(s.id);
            const Icon = s.icon;

            return (
              <div key={s.id} className="flex items-center">
                <button
                  type="button"
                  onClick={() => handleNavigateStep(s.id)}
                  disabled={!isUnlocked && !isCompleted}
                  className={`flex flex-col items-center group focus:outline-none ${
                    isUnlocked || isCompleted ? "cursor-pointer" : "cursor-not-allowed opacity-50"
                  }`}
                  title={!isUnlocked && !isCompleted ? "Complete prior required steps first" : s.title}
                >
                  <div
                    className={`flex size-9 items-center justify-center rounded-xl text-xs font-bold transition-all ${
                      isCompleted
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : isCurrent
                        ? "border-2 border-primary bg-primary/10 text-primary ring-2 ring-primary/20"
                        : "bg-muted text-muted-foreground group-hover:bg-muted/80"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="size-4" />
                    ) : !isUnlocked ? (
                      <Lock className="size-3.5" />
                    ) : (
                      <Icon className="size-4" />
                    )}
                  </div>
                  <span
                    className={`text-[10px] mt-1.5 font-medium hidden sm:block ${
                      isCurrent ? "text-primary font-bold" : "text-muted-foreground"
                    }`}
                  >
                    {s.title}
                  </span>
                </button>

                {idx < ONBOARDING_STEPS.length - 1 && (
                  <div
                    className={`h-0.5 w-6 sm:w-14 mx-1 sm:mx-2 transition-colors ${
                      isCompleted ? "bg-primary" : "bg-border"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        <div>
          <CardTitle className="text-xl font-bold tracking-tight text-foreground">
            {currentStep === 1 && "Step 1: Workspace & Tenant Registration"}
            {currentStep === 2 && "Step 2: Business & Legal Entity Profile"}
            {currentStep === 3 && "Step 3: Select Your Subscription Tier"}
            {currentStep === 4 && "Step 4: Meta Marketing & Messaging Compliance"}
            {currentStep === 5 && "Step 5: Final Review & Workspace Activation"}
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-0.5">
            {currentStep === 1 && "Set your primary workspace name and organizational slug"}
            {currentStep === 2 && "Provide legal registration and upload verification documents"}
            {currentStep === 3 && "Choose conversation quota and agent seats for your team"}
            {currentStep === 4 && "Configure customer opt-in consent and automated unsubscribe handling"}
            {currentStep === 5 && "Review your configuration and launch your multi-tenant environment"}
          </CardDescription>
        </div>

        {/* Server Sync Status Bar */}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 px-2 border-t border-border/40 max-w-xl mx-auto">
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Server synced (/api/onboarding/steps) {lastSyncText ? `at ${lastSyncText}` : ""}
          </span>
          <button
            type="button"
            onClick={() => refetchSteps()}
            disabled={isStepsRefetching}
            className="hover:text-primary transition-colors text-[10px] flex items-center gap-1 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`size-2.5 ${isStepsRefetching ? "animate-spin" : ""}`} />
            {isStepsRefetching ? "Syncing..." : "Refresh"}
          </button>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        {currentStep === 1 && (
          <StepTenantRegistration
            initialData={tenantData}
            onChange={handleTenantChange}
            onNext={(data) => {
              setTenantData(data);
              refetchSteps();
              setCurrentStep(2);
            }}
          />
        )}

        {currentStep === 2 && (
          <StepBusinessInformation
            initialData={businessData}
            onChange={handleBusinessChange}
            onNext={(data) => {
              setBusinessData(data);
              refetchSteps();
              setCurrentStep(3);
            }}
            onBack={() => setCurrentStep(1)}
          />
        )}

        {currentStep === 3 && (
          <StepSubscriptionPlan
            initialData={planData}
            onChange={handlePlanChange}
            onNext={(data) => {
              setPlanData(data);
              refetchSteps();
              setCurrentStep(4);
            }}
            onBack={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 4 && (
          <StepMarketingCompliance
            initialData={complianceData}
            onChange={handleComplianceChange}
            onNext={(data) => {
              setComplianceData(data);
              refetchSteps();
              setCurrentStep(5);
            }}
            onBack={() => setCurrentStep(3)}
          />
        )}

        {currentStep === 5 && (
          <StepFinalActivation
            tenantData={tenantData}
            businessData={businessData}
            planData={planData}
            complianceData={complianceData}
            incompleteRequirements={stepStatus.incompleteRequirements}
            onNavigateStep={handleNavigateStep}
            onBack={() => setCurrentStep(4)}
          />
        )}
      </CardContent>
    </Card>
  );
}
