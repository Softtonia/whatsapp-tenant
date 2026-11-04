"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { StepTenantRegistration } from "./step-tenant-registration";
import { StepBusinessInformation } from "./step-business-information";
import { StepSubscriptionPlan } from "./step-subscription-plan";
import { StepMarketingCompliance } from "./step-marketing-compliance";
import { StepFinalActivation } from "./step-final-activation";
import { useOnboardingProgressQuery, isOnboardingComplete } from "../hooks";
import { Check, Building2, FileText, CreditCard, ShieldCheck, Rocket, RefreshCw } from "lucide-react";
import type {
  TenantRegistrationData,
  BusinessInformationData,
  SubscriptionPlanData,
  MarketingComplianceData,
} from "@/types/onboarding";

export const ONBOARDING_STORAGE_KEY = "whatsapp_crm_onboarding_wizard_v1";

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
  const { data: progressData } = useOnboardingProgressQuery();

  const [isHydrated, setIsHydrated] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  // Stored wizard data across steps
  const [tenantData, setTenantData] = useState<TenantRegistrationData>(DEFAULT_TENANT_DATA);
  const [businessData, setBusinessData] = useState<Partial<BusinessInformationData>>(DEFAULT_BUSINESS_DATA);
  const [planData, setPlanData] = useState<Partial<SubscriptionPlanData>>(DEFAULT_PLAN_DATA);
  const [complianceData, setComplianceData] = useState<Partial<MarketingComplianceData>>(DEFAULT_COMPLIANCE_DATA);

  // 1. Initial Draft & Step Hydration (from localStorage & URL search params)
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const savedRaw = localStorage.getItem(ONBOARDING_STORAGE_KEY);
      let restoredStep = 1;

      if (savedRaw) {
        const parsed = JSON.parse(savedRaw);
        if (parsed.tenantData) setTenantData(parsed.tenantData);
        if (parsed.businessData) setBusinessData(parsed.businessData);
        if (parsed.planData) setPlanData(parsed.planData);
        if (parsed.complianceData) setComplianceData(parsed.complianceData);
        if (typeof parsed.currentStep === "number" && parsed.currentStep >= 1 && parsed.currentStep <= 5) {
          restoredStep = parsed.currentStep;
        }
        if (parsed.updatedAt) {
          setLastSavedTime(new Date(parsed.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
        }
      }

      // Check URL query param ?step=X (e.g. if user opened /onboarding?step=3)
      const urlParams = new URLSearchParams(window.location.search);
      const urlStep = parseInt(urlParams.get("step") || "", 10);
      if (urlStep >= 1 && urlStep <= 5) {
        restoredStep = urlStep;
      }

      setCurrentStep(restoredStep);
    } catch (err) {
      console.warn("Failed to load onboarding draft from localStorage:", err);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // 2. Persist State to localStorage and keep URL ?step= in sync
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const persistDraft = useCallback(
    (step: number, tData: any, bData: any, pData: any, cData: any) => {
      if (typeof window === "undefined") return;

      try {
        const payload = {
          currentStep: step,
          tenantData: tData,
          businessData: bData,
          planData: pData,
          complianceData: cData,
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(payload));
        setLastSavedTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));

        // Keep URL ?step= in sync without triggering full page reloads
        const url = new URL(window.location.href);
        if (url.searchParams.get("step") !== String(step)) {
          url.searchParams.set("step", String(step));
          window.history.replaceState({}, "", url.toString());
        }
      } catch (err) {
        console.warn("Failed to save onboarding draft to localStorage:", err);
      }
    },
    []
  );

  useEffect(() => {
    if (!isHydrated) return;

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      persistDraft(currentStep, tenantData, businessData, planData, complianceData);
    }, 150);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [isHydrated, currentStep, tenantData, businessData, planData, complianceData, persistDraft]);

  // 3. Sync with Server Progress
  useEffect(() => {
    if (isOnboardingComplete(progressData)) {
      try {
        localStorage.removeItem(ONBOARDING_STORAGE_KEY);
      } catch {}
      router.replace("/dashboard");
      return;
    }

    if (progressData?.current_step) {
      const stepIdx = ONBOARDING_STEPS.findIndex((s) => s.key === progressData.current_step);
      if (stepIdx !== -1) {
        const serverStep = stepIdx + 1;
        setCurrentStep((prev) => Math.max(prev, serverStep));
      }
    } else if (Array.isArray(progressData?.completed_steps)) {
      const completed = progressData.completed_steps;
      let nextStep = 1;
      for (let i = 0; i < ONBOARDING_STEPS.length; i++) {
        if (completed.includes(ONBOARDING_STEPS[i].key)) {
          nextStep = i + 2;
        } else {
          break;
        }
      }
      if (nextStep <= 5) {
        setCurrentStep((prev) => Math.max(prev, nextStep));
      }
    }
  }, [progressData, router]);

  // Reset Draft function in case user wants to start completely clean
  const handleResetDraft = () => {
    if (typeof window !== "undefined") {
      const confirmed = window.confirm("Are you sure you want to clear your saved progress and start from Step 1?");
      if (!confirmed) return;

      try {
        localStorage.removeItem(ONBOARDING_STORAGE_KEY);
      } catch {}

      setTenantData(DEFAULT_TENANT_DATA);
      setBusinessData(DEFAULT_BUSINESS_DATA);
      setPlanData(DEFAULT_PLAN_DATA);
      setComplianceData(DEFAULT_COMPLIANCE_DATA);
      setCurrentStep(1);

      const url = new URL(window.location.href);
      url.searchParams.delete("step");
      window.history.replaceState({}, "", url.toString());
    }
  };

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

  if (!isHydrated) {
    return (
      <Card className="w-full max-w-3xl shadow-xl border-border/80">
        <div className="flex flex-col items-center justify-center p-16 text-center space-y-3">
          <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-xs text-muted-foreground font-medium">Restoring your onboarding workspace...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-3xl shadow-xl border-border/80">
      <CardHeader className="text-center pb-4">
        {/* Step Progress Stepper */}
        <div className="flex items-center justify-between max-w-xl mx-auto mb-3 px-2">
          {ONBOARDING_STEPS.map((s, idx) => {
            const isCompleted = currentStep > s.id;
            const isCurrent = currentStep === s.id;
            const Icon = s.icon;

            return (
              <div key={s.id} className="flex items-center">
                <button
                  type="button"
                  onClick={() => {
                    // Allow navigating back to previous completed steps
                    if (s.id < currentStep) setCurrentStep(s.id);
                  }}
                  className="flex flex-col items-center group cursor-pointer focus:outline-none"
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
                    {isCompleted ? <Check className="size-4" /> : <Icon className="size-4" />}
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
                      currentStep > s.id ? "bg-primary" : "bg-border"
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
            {currentStep === 2 && "Provide legal registration and contact details for Meta WABA approval"}
            {currentStep === 3 && "Choose conversation quota and agent seats for your team"}
            {currentStep === 4 && "Configure customer opt-in consent and automated unsubscribe handling"}
            {currentStep === 5 && "Review your configuration and launch your multi-tenant environment"}
          </CardDescription>
        </div>

        {/* Autosave Status Bar */}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 px-2 border-t border-border/40 max-w-xl mx-auto">
          <span className="flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Progress auto-saved {lastSavedTime ? `at ${lastSavedTime}` : "locally"}
          </span>
          <button
            type="button"
            onClick={handleResetDraft}
            className="hover:text-destructive transition-colors text-[10px] flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="size-2.5" />
            Reset Draft
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
            onBack={() => setCurrentStep(4)}
          />
        )}
      </CardContent>
    </Card>
  );
}
