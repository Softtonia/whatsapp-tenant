import { AcceptInvitationForm } from "@/features/auth/components/accept-invitation-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accept Invitation | WhatsApp CRM",
  description: "Accept your WhatsApp CRM team invitation and join your workspace",
};

export default function AcceptInvitationPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <AcceptInvitationForm />
    </div>
  );
}

