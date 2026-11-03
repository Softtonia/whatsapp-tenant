import { OnboardingWizard } from "@/features/onboarding/components/onboarding-wizard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Workspace Onboarding | WhatsApp CRM",
  description: "Set up and configure your multi-tenant WhatsApp CRM workspace",
};

export default function OrganizationSetupPage() {
  return <OnboardingWizard />;
}
