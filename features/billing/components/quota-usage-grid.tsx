"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  MessageSquare,
  Megaphone,
  Users,
  UserCheck,
  Phone,
} from "lucide-react";
import type { QuotaUsageSummary, QuotaMetric } from "@/types/billing";

interface QuotaUsageGridProps {
  usage?: QuotaUsageSummary;
  isLoading: boolean;
}

export function QuotaUsageGrid({ usage, isLoading }: QuotaUsageGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 animate-pulse">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-28 bg-muted/30 rounded-xl" />
        ))}
      </div>
    );
  }

  const renderMeter = (
    title: string,
    metric: QuotaMetric | undefined,
    icon: React.ReactNode,
    unitName = "units"
  ) => {
    const used = metric?.used || 0;
    const limit = metric?.limit || 1;
    const pct = metric?.percentage ?? Math.min(100, Math.round((used / limit) * 100));

    let progressColor = "bg-primary";
    let textColor = "text-primary";
    if (pct >= 90) {
      progressColor = "bg-rose-500";
      textColor = "text-rose-500";
    } else if (pct >= 70) {
      progressColor = "bg-amber-500";
      textColor = "text-amber-500";
    }

    return (
      <Card className="border-border/80 shadow-xs">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              {icon}
              {title}
            </span>
            <span className={`text-xs font-mono font-bold ${textColor}`}>
              {pct}%
            </span>
          </div>

          <div className="w-full bg-muted/60 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${progressColor}`}
              style={{ width: `${Math.min(100, pct)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
            <span>
              {used.toLocaleString()} {unitName}
            </span>
            <span>Limit: {limit.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-bold text-foreground">
          Workspace Quotas &amp; Capacity Usage
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Real-time utilization tracking against your plan allocation
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {renderMeter(
          "24h Service Chats",
          usage?.service_conversations,
          <MessageSquare className="size-3.5 text-primary" />,
          "chats"
        )}

        {renderMeter(
          "Marketing Broadcasts",
          usage?.marketing_broadcasts,
          <Megaphone className="size-3.5 text-primary" />,
          "messages"
        )}

        {renderMeter(
          "Audience Contacts",
          usage?.contacts,
          <Users className="size-3.5 text-primary" />,
          "contacts"
        )}

        {renderMeter(
          "Team Member Seats",
          usage?.team_members,
          <UserCheck className="size-3.5 text-primary" />,
          "seats"
        )}

        {renderMeter(
          "WhatsApp Phone Numbers",
          usage?.whatsapp_numbers,
          <Phone className="size-3.5 text-primary" />,
          "numbers"
        )}
      </div>
    </div>
  );
}
