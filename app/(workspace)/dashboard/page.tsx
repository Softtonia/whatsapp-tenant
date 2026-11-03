import { DashboardOverview } from "@/features/dashboard/components/dashboard-overview";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | WhatsApp CRM",
  description:
    "Overview metrics, conversations, campaigns, and WhatsApp connection health",
};

export default function DashboardPage() {
  return <DashboardOverview />;
}

