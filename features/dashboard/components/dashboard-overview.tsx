"use client";

import { DashboardHeader } from "./dashboard-header";
import { WhatsAppStatusBanner } from "./whatsapp-status-banner";
import { KpiGrid } from "./kpi-grid";
import { ConversationActivityChart } from "./conversation-activity-chart";
import { RecentConversationsList } from "./recent-conversations-list";
import { CampaignPerformanceCard } from "./campaign-performance-card";
import { UsageSubscriptionCard } from "./usage-subscription-card";
import { DashboardQuickActions } from "./dashboard-quick-actions";

export function DashboardOverview() {
  return (
    <div className="space-y-6">
      {/* 1. Greeting & Active Workspace Context */}
      <DashboardHeader />

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
