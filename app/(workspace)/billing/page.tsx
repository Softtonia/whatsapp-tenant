"use client";

import * as React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { RefreshCw, Zap } from "lucide-react";
import {
  useSubscriptionQuery,
  useQuotaUsageQuery,
  useInvoicesQuery,
} from "@/features/billing/hooks";
import { SubscriptionPlanCard } from "@/features/billing/components/subscription-plan-card";
import { QuotaUsageGrid } from "@/features/billing/components/quota-usage-grid";
import { InvoiceHistoryTable } from "@/features/billing/components/invoice-history-table";
import { PlanComparisonModal } from "@/features/billing/components/plan-comparison-modal";
import { CancelSubscriptionDialog } from "@/features/billing/components/cancel-subscription-dialog";

export default function BillingPage() {
  const [isComparisonOpen, setIsComparisonOpen] = React.useState(false);
  const [isCancelOpen, setIsCancelOpen] = React.useState(false);

  const {
    data: subscription,
    isLoading: loadingSubscription,
    refetch: refetchSubscription,
  } = useSubscriptionQuery();

  const {
    data: usage,
    isLoading: loadingUsage,
    refetch: refetchUsage,
  } = useQuotaUsageQuery();

  const {
    data: invoices,
    isLoading: loadingInvoices,
    refetch: refetchInvoices,
  } = useInvoicesQuery();

  const handleRefreshAll = () => {
    refetchSubscription();
    refetchUsage();
    refetchInvoices();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Subscription, Quotas & Invoices"
        description="Manage your workspace subscription plan, messaging quotas, payment methods, and invoice receipts."
        breadcrumbs={[
          { label: "Workspace", href: "/dashboard" },
          { label: "Billing & Plans" },
        ]}
      >
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefreshAll}
          className="h-8 gap-1.5 text-xs font-semibold"
        >
          <RefreshCw className="size-3.5" />
          Refresh
        </Button>
        <Button
          size="sm"
          onClick={() => setIsComparisonOpen(true)}
          className="h-8 gap-1.5 text-xs font-semibold shadow-xs"
        >
          <Zap className="size-3.5" />
          Change Plan
        </Button>
      </PageHeader>

      {/* Subscription Plan Card */}
      <SubscriptionPlanCard
        subscription={subscription}
        isLoading={loadingSubscription}
        onChangePlan={() => setIsComparisonOpen(true)}
        onCancelPlan={() => setIsCancelOpen(true)}
      />

      {/* Real-Time Quotas Utilization */}
      <QuotaUsageGrid
        usage={usage}
        isLoading={loadingUsage}
      />

      {/* Invoice History */}
      <InvoiceHistoryTable
        invoices={invoices || []}
        isLoading={loadingInvoices}
      />

      {/* Plan Upgrade/Downgrade Comparison Modal */}
      <PlanComparisonModal
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
        subscription={subscription}
        onSuccess={handleRefreshAll}
      />

      {/* Cancellation Confirmation Dialog */}
      <CancelSubscriptionDialog
        isOpen={isCancelOpen}
        onClose={() => setIsCancelOpen(false)}
        onSuccess={handleRefreshAll}
      />
    </div>
  );
}
