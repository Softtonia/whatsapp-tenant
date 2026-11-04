"use client";

import { useUsageSummaryQuery } from "../hooks";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber, formatDateShort } from "@/lib/formatters";
import { CreditCard, ArrowRight, Zap, RefreshCw } from "lucide-react";
import Link from "next/link";

interface ProgressBarProps {
  label: string;
  used: number;
  limit: number;
  percentage: number;
  unit: string;
}

function QuotaBar({ label, used, limit, percentage, unit }: ProgressBarProps) {
  const isHigh = percentage >= 85;
  const isCritical = percentage >= 95;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-foreground">{label}</span>
        <span className="text-[11px] text-muted-foreground font-mono">
          <strong className="text-foreground">{formatNumber(used)}</strong> / {formatNumber(limit)} {unit} ({percentage.toFixed(0)}%)
        </span>
      </div>
      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
        <div
          style={{ width: `${Math.min(percentage, 100)}%` }}
          className={`h-full rounded-full transition-all duration-500 ${
            isCritical
              ? "bg-destructive"
              : isHigh
              ? "bg-amber-500"
              : "bg-primary"
          }`}
        />
      </div>
    </div>
  );
}

export function UsageSubscriptionCard() {
  const { data: usage, isLoading, isError, refetch } = useUsageSummaryQuery();

  if (isLoading) {
    return (
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-20" />
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (isError || !usage) {
    return (
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold">Usage & Limits</CardTitle>
        </CardHeader>
        <CardContent className="py-6 text-center text-xs text-muted-foreground space-y-2">
          <p>Failed to load usage quotas.</p>
          <Button variant="outline" size="xs" onClick={() => refetch()} className="gap-1">
            <RefreshCw className="size-3" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/80 shadow-xs">
      <CardHeader className="pb-3 flex flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <CreditCard className="size-4 text-primary" />
          <CardTitle className="text-base font-bold">Subscription & Quotas</CardTitle>
        </div>

        <Link
          href="/billing"
          className="text-xs text-primary hover:underline font-semibold flex items-center gap-1"
        >
          Manage Plan
          <ArrowRight className="size-3.5" />
        </Link>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        {/* Plan Header */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/70">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-foreground">
                {usage.plan_name || "Starter"} Tier
              </span>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px] py-0 px-1.5 font-semibold">
                Active
              </Badge>
            </div>
            {usage.billing_cycle_end && (
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Renews on {formatDateShort(usage.billing_cycle_end)}
              </p>
            )}
          </div>

          <Link href="/billing">
            <Button size="xs" variant="outline" className="gap-1 font-medium">
              <Zap className="size-3 text-primary" />
              Upgrade
            </Button>
          </Link>
        </div>

        {/* Quota Progress Bars */}
        <div className="space-y-3 pt-1">
          {usage.conversations && (
            <QuotaBar
              label="Monthly Conversations"
              used={usage.conversations.used ?? 0}
              limit={usage.conversations.limit ?? 1000}
              percentage={usage.conversations.percentage ?? 0}
              unit="conversations"
            />
          )}

          {usage.contacts && (
            <QuotaBar
              label="Total Contacts Directory"
              used={usage.contacts.used ?? 0}
              limit={usage.contacts.limit ?? 2500}
              percentage={usage.contacts.percentage ?? 0}
              unit="contacts"
            />
          )}

          {usage.team_seats && (
            <QuotaBar
              label="Team Member Seats"
              used={usage.team_seats.used ?? 0}
              limit={usage.team_seats.limit ?? 5}
              percentage={usage.team_seats.percentage ?? 0}
              unit="seats"
            />
          )}

          {usage.phone_numbers && (
            <QuotaBar
              label="Connected WhatsApp Numbers"
              used={usage.phone_numbers.used ?? 0}
              limit={usage.phone_numbers.limit ?? 1}
              percentage={usage.phone_numbers.percentage ?? 0}
              unit="numbers"
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
