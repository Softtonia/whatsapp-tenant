"use client";

import { useDashboardOverviewQuery } from "../hooks";
import { MetricCard } from "./metric-card";
import { formatNumber, formatPercent, formatDurationMinutes } from "@/lib/formatters";
import { MessageSquare, Users, Send, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function KpiGrid() {
  const { data: overview, isLoading, isError, refetch } = useDashboardOverviewQuery();

  if (isError) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-xs text-destructive flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertCircle className="size-4 shrink-0" />
          <span>Failed to load KPI metrics. Check server connection or permissions.</span>
        </div>
        <Button variant="outline" size="xs" onClick={() => refetch()} className="gap-1">
          <RefreshCw className="size-3" />
          Retry
        </Button>
      </div>
    );
  }

  const conv = overview?.conversations;
  const contacts = overview?.contacts;
  const campaigns = overview?.campaigns;
  const responseTime = overview?.response_time;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* KPI 1: Active & Total Conversations */}
      <MetricCard
        title="Conversations"
        value={formatNumber(conv?.total)}
        change={conv?.change_pct ? `+${conv.change_pct}%` : undefined}
        changeType={conv && conv.change_pct >= 0 ? "positive" : "negative"}
        icon={MessageSquare}
        description={conv ? `${formatNumber(conv.open)} open right now` : "Total WhatsApp threads"}
        isLoading={isLoading}
        link="/chats"
      />

      {/* KPI 2: Total & New Contacts */}
      <MetricCard
        title="Opted-in Contacts"
        value={formatNumber(contacts?.total)}
        change={contacts?.change_pct ? `+${contacts.change_pct}%` : undefined}
        changeType="positive"
        icon={Users}
        description={contacts ? `+${formatNumber(contacts.new_today)} verified today` : "Subscriber directory"}
        isLoading={isLoading}
        link="/contacts"
      />

      {/* KPI 3: Campaign Delivery Rate */}
      <MetricCard
        title="Campaign Delivery"
        value={formatPercent(campaigns?.delivery_rate)}
        change={campaigns?.change_pct ? `+${campaigns.change_pct}%` : undefined}
        changeType="positive"
        icon={Send}
        description={campaigns ? `${formatPercent(campaigns.read_rate)} verified read rate` : "Meta Cloud SLA"}
        isLoading={isLoading}
        link="/campaigns"
      />

      {/* KPI 4: Unresolved Conversations & SLA */}
      <MetricCard
        title="Unresolved Queue"
        value={formatNumber(conv?.unresolved)}
        icon={AlertCircle}
        description={responseTime ? `Avg reply: ${formatDurationMinutes(responseTime.average_minutes)}` : "Awaiting agent reply"}
        warningText={responseTime && responseTime.sla_breaches > 0 ? `${responseTime.sla_breaches} SLA risk` : undefined}
        isLoading={isLoading}
        link="/chats?status=open"
      />
    </div>
  );
}

