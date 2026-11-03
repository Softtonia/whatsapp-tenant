"use client";

import { useRecentCampaignsQuery } from "../hooks";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber, formatPercent, formatRelativeTime } from "@/lib/formatters";
import { Send, ArrowRight, CheckCircle2, Clock, AlertCircle, RefreshCw, BarChart2 } from "lucide-react";
import Link from "next/link";
import type { CampaignSummaryItem } from "@/types/dashboard";

function getCampaignBadge(status: CampaignSummaryItem["status"]) {
  switch (status) {
    case "completed":
      return (
        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px] py-0 px-1.5 font-medium gap-1">
          <CheckCircle2 className="size-2.5" />
          Completed
        </Badge>
      );
    case "processing":
      return (
        <Badge variant="outline" className="bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30 text-[10px] py-0 px-1.5 font-medium animate-pulse gap-1">
          <Clock className="size-2.5" />
          Sending...
        </Badge>
      );
    case "scheduled":
      return (
        <Badge variant="outline" className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px] py-0 px-1.5 font-medium gap-1">
          <Clock className="size-2.5" />
          Scheduled
        </Badge>
      );
    case "failed":
      return (
        <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 text-[10px] py-0 px-1.5 font-medium gap-1">
          <AlertCircle className="size-2.5" />
          Failed
        </Badge>
      );
    default:
      return <Badge variant="secondary" className="text-[10px] py-0 px-1.5">{status}</Badge>;
  }
}

export function CampaignPerformanceCard() {
  const { data: campaigns, isLoading, isError, refetch } = useRecentCampaignsQuery(4);

  if (isLoading) {
    return (
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-20" />
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-3 rounded-xl border border-border/60 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold">Campaign Performance</CardTitle>
        </CardHeader>
        <CardContent className="py-6 text-center text-xs text-muted-foreground space-y-2">
          <p>Failed to load campaign performance.</p>
          <Button variant="outline" size="xs" onClick={() => refetch()} className="gap-1">
            <RefreshCw className="size-3" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const list = campaigns || [];

  return (
    <Card className="border-border/80 shadow-xs">
      <CardHeader className="pb-3 flex flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Send className="size-4 text-primary" />
          <CardTitle className="text-base font-bold">Campaign Performance</CardTitle>
        </div>

        <Link
          href="/campaigns"
          className="text-xs text-primary hover:underline font-semibold flex items-center gap-1"
        >
          All Campaigns
          <ArrowRight className="size-3.5" />
        </Link>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        {list.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-border rounded-xl space-y-1.5">
            <BarChart2 className="size-5 text-muted-foreground mx-auto" />
            <p className="text-xs text-muted-foreground font-medium">No campaigns dispatched yet</p>
            <p className="text-[11px] text-muted-foreground">
              Launch targeted WhatsApp broadcasts to segmented customer lists with pre-approved templates.
            </p>
            <div className="pt-1">
              <Link href="/campaigns">
                <Button size="xs" variant="outline">
                  Create First Campaign
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          list.map((c) => (
            <div
              key={c.id}
              className="p-3 rounded-xl border border-border/70 hover:border-border transition-colors space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-xs font-bold text-foreground truncate">{c.name}</h4>
                    {getCampaignBadge(c.status)}
                  </div>
                  <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                    Template: <span className="text-foreground">{c.template_name}</span> •{" "}
                    {formatRelativeTime(c.sent_at || c.created_at)}
                  </p>
                </div>

                <span className="text-xs font-semibold text-foreground font-mono shrink-0">
                  {formatNumber(c.total_recipients)} leads
                </span>
              </div>

              {/* Progress and delivery rates */}
              {c.status === "completed" ? (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">
                      Delivered: <strong className="text-foreground font-mono">{formatPercent(c.delivery_rate)}</strong>
                    </span>
                    <span className="text-muted-foreground">
                      Read: <strong className="text-foreground font-mono">{formatPercent(c.read_rate)}</strong>
                    </span>
                  </div>
                  {/* Visual Delivery Bar */}
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${Math.min(c.delivery_rate, 100)}%` }}
                      className="bg-emerald-500 h-full rounded-full"
                    />
                  </div>
                </div>
              ) : (
                <div className="text-[11px] text-muted-foreground">
                  Recipients queued for scheduled dispatch.
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

