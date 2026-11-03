"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { StepTenantRegistration } from "./step-tenant-registration";
import { StepBusinessInformation } from "./step-business-information";
import { StepSubscriptionPlan } from "./step-subscription-plan";
import { StepMarketingCompliance } from "./step-marketing-compliance";
import { StepFinalActivation } from "./step-final-activation";
import { useOnboardingProgressQuery } from "../hooks";
import { Check, Building2, FileText, CreditCard, ShieldCheck, Rocket } from "lucide-react";
import type {
  TenantRegistrationData,
  BusinessInformationData,
  SubscriptionPlanData,
  MarketingComplianceData,
} from "@/types/onboarding";

const ONBOARDING_STEPS = [
  { id: 1, key: "tenant_registration", title: "Tenant", icon: Building2 },
  { id: 2, key: "business_information", title: "Business Info", icon: FileText },
  { id: 3, key: "subscription_plan", title: "Plan", icon: CreditCard },
  { id: 4, key: "marketing_compliance", title: "Compliance", icon: ShieldCheck },
  { id: 5, key: "final_activation", title: "Activation", icon: Rocket },
];

export function OnboardingWizard() {
  const { data: progressData } = useOnboardingProgressQuery();

  const [currentStep, setCurrentStep] = useState<number>(1);

  // Stored wizard data across steps
  const [tenantData, setTenantData] = useState<TenantRegistrationData>({
    name: "Acme Global Corp",
    company_name: "Acme Global Corp",
    country: "US",
    timezone: "UTC",
    preferred_language: "en",
    terms_accepted: true,
    workspace_name: "Acme Global Corp",
    subdomain: "acme-global",
  });

  const [businessData, setBusinessData] = useState<Partial<BusinessInformationData>>({
    legal_business_name: "Acme Logistics Inc",
    business_display_name: "Acme Logistics",
    business_type: "corporation",
    industry_id: 1,
    business_email: "contact@acmelogistics.com",
    business_phone: "+15559876543",
    website_url: "https://acmelogistics.com",
    business_description: "Enterprise logistics, fulfillment, and worldwide shipping solutions.",
    tax_registration_number: "US-EIN-123456789",
    registration_number: "CORP-987654321",
    country: "US",
    state: "California",
    city: "San Francisco",
    postal_code: "94105",
    address_line_1: "500 Howard St",
    address_line_2: "Suite 400",
  });

  const [planData, setPlanData] = useState<Partial<SubscriptionPlanData>>({
    subscription_plan_id: 1,
    billing_cycle: "monthly",
  });

  const [complianceData, setComplianceData] = useState<Partial<MarketingComplianceData>>({
    marketing_enabled: true,
    customer_opt_in_required: true,
    opt_in_method: ["website_form", "checkout_form"],
    privacy_policy_url: "https://acmelogistics.com/privacy",
    unsubscribe_enabled: true,
    unsubscribe_keyword: "STOP",
    default_language: "en",
    default_country_code: "+1",
  });

  // Sync server progress if available
  useEffect(() => {
    if (progressData?.current_step) {
      const stepIdx = ONBOARDING_STEPS.findIndex((s) => s.key === progressData.current_step);
      if (stepIdx !== -1) {
        setCurrentStep(stepIdx + 1);
      }
    }
  }, [progressData]);

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
      </CardHeader>

      <CardContent className="pt-2">
        {currentStep === 1 && (
          <StepTenantRegistration
            initialData={tenantData}
            onNext={(data) => {
              setTenantData(data);
              setCurrentStep(2);
            }}
          />
        )}

        {currentStep === 2 && (
          <StepBusinessInformation
            initialData={businessData}
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
