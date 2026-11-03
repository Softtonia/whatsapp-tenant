"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { StepBusinessProfile } from "./step-business-profile";
import { StepRegionalPreferences } from "./step-regional-preferences";
import { StepWhatsAppConnection } from "./step-whatsapp-connection";
import { StepTeamInvitations } from "./step-team-invitations";
import { StepReviewCompletion } from "./step-review-completion";
import { useOnboardingStatusQuery } from "../hooks";
import { Check, Building2, Globe, Phone, Users, Rocket } from "lucide-react";
import type {
  BusinessProfileFormData,
  RegionalPreferencesFormData,
  WhatsAppConnectionFormData,
  TeamInvitationsFormData,
} from "../schemas";

const STEPS = [
  { id: 1, title: "Profile", icon: Building2 },
  { id: 2, title: "Preferences", icon: Globe },
  { id: 3, title: "WhatsApp", icon: Phone },
  { id: 4, title: "Team", icon: Users },
  { id: 5, title: "Launch", icon: Rocket },
];

export function OnboardingWizard() {
  const { data: serverStatus, isLoading: isStatusLoading } = useOnboardingStatusQuery();

  const [currentStep, setCurrentStep] = useState(1);

  // Stored wizard data across steps
  const [businessProfile, setBusinessProfile] = useState<BusinessProfileFormData>({
    company_name: serverStatus?.business_profile?.company_name || "Softtonia Solutions",
    company_email: serverStatus?.business_profile?.company_email || "contact@softtonia.com",
    contact_number: serverStatus?.business_profile?.contact_number || "+91 98765 43210",
    country: serverStatus?.business_profile?.country || "India",
    address: serverStatus?.business_profile?.address || "Tech Hub, Tower 2, Bengaluru",
  });

  const [regionalPreferences, setRegionalPreferences] = useState<RegionalPreferencesFormData>({
    timezone: serverStatus?.regional_preferences?.timezone || "Asia/Kolkata",
    currency: serverStatus?.regional_preferences?.currency || "INR",
  });

  const [whatsappConnection, setWhatsappConnection] = useState<WhatsAppConnectionFormData>({
    defer_whatsapp: serverStatus?.whatsapp_connection?.defer_whatsapp || false,
    phone_number: serverStatus?.whatsapp_connection?.phone_number || "+91 98765 43210",
    waba_id: serverStatus?.whatsapp_connection?.waba_id || "waba_109823485723948",
  });

  const [teamInvitations, setTeamInvitations] = useState<TeamInvitationsFormData>({
    invitees: serverStatus?.team_invitations?.invitees || [
      { email: "support.agent@company.com", role: "agent" },
    ],
  });

  return (
    <Card className="w-full max-w-2xl shadow-xl border-border/80">
      <CardHeader className="text-center pb-3">
        {/* Step Progress Stepper */}
        <div className="flex items-center justify-between max-w-lg mx-auto mb-4 px-2">
          {STEPS.map((s, idx) => {
            const isCompleted = currentStep > s.id;
            const isCurrent = currentStep === s.id;
            const Icon = s.icon;

            return (
              <div key={s.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex size-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                      isCompleted
                        ? "bg-primary text-primary-foreground"
                        : isCurrent
                        ? "border-2 border-primary bg-primary/10 text-primary ring-2 ring-primary/20"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? <Check className="size-4" /> : <Icon className="size-4" />}
                  </div>
                  <span
                    className={`text-[10px] mt-1 font-medium hidden sm:block ${
                      isCurrent ? "text-primary font-bold" : "text-muted-foreground"
                    }`}
                  >
                    {s.title}
                  </span>
                </div>

                {idx < STEPS.length - 1 && (
                  <div
                    className={`h-0.5 w-6 sm:w-12 mx-1 sm:mx-2 transition-colors ${
                      currentStep > s.id ? "bg-primary" : "bg-border"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        <CardTitle className="text-xl font-bold tracking-tight">
          {currentStep === 1 && "Business Profile & Workspace Details"}
          {currentStep === 2 && "Regional Preferences & Localization"}
          {currentStep === 3 && "Connect WhatsApp Cloud API"}
          {currentStep === 4 && "Invite Team Members"}
          {currentStep === 5 && "Review & Complete Onboarding"}
        </CardTitle>

        <CardDescription className="text-xs">
          {currentStep === 1 && "Provide your organization name, primary contact details, and location."}
          {currentStep === 2 && "Configure default operational timezone and catalog transaction currency."}
          {currentStep === 3 && "Link your verified WhatsApp Business phone number or defer for later."}
          {currentStep === 4 && "Add team members and define granular RBAC roles for your CRM workspace."}
          {currentStep === 5 && "Review your workspace parameters before finalizing setup."}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-2">
        {isStatusLoading ? (
          <div className="py-12 text-center text-xs text-muted-foreground">
            Loading workspace onboarding status...
          </div>
        ) : (
          <>
            {currentStep === 1 && (
              <StepBusinessProfile
                initialData={businessProfile}
                onSuccess={(data) => {
                  setBusinessProfile(data);
                  setCurrentStep(2);
                }}
              />
            )}

            {currentStep === 2 && (
              <StepRegionalPreferences
                initialData={regionalPreferences}
                onSuccess={(data) => {
                  setRegionalPreferences(data);
                  setCurrentStep(3);
                }}
                onBack={() => setCurrentStep(1)}
              />
            )}

            {currentStep === 3 && (
              <StepWhatsAppConnection
                initialData={whatsappConnection}
                onSuccess={(data) => {
                  setWhatsappConnection(data);
                  setCurrentStep(4);
                }}
                onBack={() => setCurrentStep(2)}
              />
            )}

            {currentStep === 4 && (
              <StepTeamInvitations
                initialData={teamInvitations}
                onSuccess={(data) => {
                  setTeamInvitations(data);
                  setCurrentStep(5);
                }}
                onBack={() => setCurrentStep(3)}
              />
            )}

            {currentStep === 5 && (
              <StepReviewCompletion
                businessProfile={businessProfile}
                regionalPreferences={regionalPreferences}
                whatsappConnection={whatsappConnection}
                teamInvitations={teamInvitations}
                onBack={() => setCurrentStep(4)}
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

