import { InboxShell } from "@/features/conversations/components/inbox-shell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shared Inbox | WhatsApp CRM",
  description: "Real-time two-way WhatsApp customer inbox for support and sales teams",
};

export default function ChatsPage() {
  return <InboxShell />;
}
