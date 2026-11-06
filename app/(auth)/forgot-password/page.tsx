import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password | WhatsApp CRM",
  description: "Reset your WhatsApp CRM tenant account password",
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <ForgotPasswordForm />
    </div>
  );
}

