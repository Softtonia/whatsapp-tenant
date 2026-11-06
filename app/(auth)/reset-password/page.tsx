import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password | WhatsApp CRM",
  description: "Set a new password for your WhatsApp CRM workspace account",
};

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <ResetPasswordForm />
    </div>
  );
}

