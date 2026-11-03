"use client";

import { useQuotaUsageQuery } from "@/features/billing/hooks";
import { QuotaUsageGrid } from "@/features/billing/components/quota-usage-grid";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gauge, RefreshCw, Zap } from "lucide-react";
import Link from "next/link";

export default function UsagePage() {
  const { data: usage, isLoading, refetch } = useQuotaUsageQuery();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Usage Monitoring & Capacity Quotas"
        description="Real-time tracking of Meta 24-hour customer service windows, marketing broadcasts, contacts, and seats."
        breadcrumbs={[
          { label: "Workspace", href: "/dashboard" },
          { label: "Usage & Quotas" },
        ]}
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isLoading}
          className="h-8 gap-1.5 text-xs font-semibold"
        >
          <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Refresh Usage
        </Button>
        <Link
          href="/billing"
          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground shadow-xs transition hover:bg-primary/90"
        >
          <Zap className="size-3.5" />
          Upgrade Quota
        </Link>
      </PageHeader>

      {/* Quota Usage Grid */}
      <QuotaUsageGrid usage={usage} isLoading={isLoading} />

      {/* WhatsApp Messaging Rules & Quota Explanation */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader>
          <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <Gauge className="size-4 text-primary" />
            Meta WhatsApp Pricing &amp; Tier Policy Guidelines
          </CardTitle>
          <CardDescription className="text-xs">
            Understanding conversation categories and 24-hour messaging limits
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-xs text-muted-foreground leading-relaxed">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl bg-muted/20 border border-border/70 space-y-1.5">
              <span className="font-bold text-foreground">Service Conversations:</span>
              <p className="text-[11px]">
                Initiated by the customer. A rolling 24-hour service session opens upon inbound receipt. All outbound text and media replies within this window do not require pre-approved Meta templates.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-muted/20 border border-border/70 space-y-1.5">
              <span className="font-bold text-foreground">Marketing &amp; Utility Broadcasts:</span>
              <p className="text-[11px]">
                Initiated by the business outside the 24-hour customer window. Must use pre-approved Meta message templates with category-specific rate limits and strict spam protections.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
