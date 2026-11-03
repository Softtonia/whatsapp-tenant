"use client";

import { DashboardHeader } from "./dashboard-header";
import { WhatsAppStatusBanner } from "./whatsapp-status-banner";
import { KpiGrid } from "./kpi-grid";
import { ConversationActivityChart } from "./conversation-activity-chart";
import { RecentConversationsList } from "./recent-conversations-list";
import { CampaignPerformanceCard } from "./campaign-performance-card";
import { UsageSubscriptionCard } from "./usage-subscription-card";
import { DashboardQuickActions } from "./dashboard-quick-actions";

import { useAuthStore } from "@/lib/auth/store";
import { useTenantStore } from "@/lib/tenant/store";
import { AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function DashboardOverview() {
  const user = useAuthStore((s) => s.user);
  const availableTenants = useTenantStore((s) => s.availableTenants);
  const hasNoWorkspaces = !availableTenants || availableTenants.length === 0;

  return (
    <div className="space-y-6">
      {/* 1. Greeting & Active Workspace Context */}
      <DashboardHeader />

      {hasNoWorkspaces && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-3">
            <AlertCircle className="size-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <div className="text-xs">
              <p className="font-semibold">No active workspace assigned</p>
              <p className="text-amber-800/80 dark:text-amber-300/80 mt-0.5">You are authenticated as <strong>{user?.name || user?.email}</strong>. Create or join a workspace to begin syncing WhatsApp messages.</p>
            </div>
          </div>
          <Link href="/organization-setup" className="shrink-0">
            <Button size="xs" className="gap-1 font-semibold">
              Set Up Workspace
              <ArrowRight className="size-3" />
            </Button>
          </Link>
        </div>
      )}

      {/* 2. WhatsApp Connection Health Banner */}
      <WhatsAppStatusBanner />

      {/* 3. High-level KPI Cards Grid */}
      <KpiGrid />

      {/* 4. Responsive Grid: Activity, Chats, Campaigns & Subscription */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols on Desktop) */}
        <div className="lg:col-span-2 space-y-6 min-w-0">
          {/* Conversation Activity 7-Day Chart */}
          <ConversationActivityChart />

          {/* Recent Conversations */}
          <RecentConversationsList />

          {/* Campaign Performance Summary */}
          <CampaignPerformanceCard />
        </div>

        {/* Right Column (1 Col on Desktop) */}
        <div className="space-y-6 min-w-0">
          {/* Usage & Subscription Summary */}
          <UsageSubscriptionCard />

          {/* Onboarding Checklist & Contextual Quick Actions */}
          <DashboardQuickActions />
        </div>
      </div>
    </div>
  );
}
