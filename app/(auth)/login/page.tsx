import { LoginForm } from "@/features/auth/components/login-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | WhatsApp CRM",
  description: "Sign in to your WhatsApp CRM tenant workspace",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <LoginForm />
    </div>
  );
}

