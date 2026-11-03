import { MfaVerifyForm } from "@/features/auth/components/mfa-verify-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Two-Factor Authentication | WhatsApp CRM",
  description: "Verify, enroll, or manage your two-factor authentication",
};

export default function MfaPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <MfaVerifyForm />
    </div>
  );
}

