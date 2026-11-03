"use client";

import * as React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CampaignsTable } from "@/features/campaigns/components/campaigns-table";
import { CampaignWizardModal } from "@/features/campaigns/components/campaign-wizard-modal";
import { CampaignAnalyticsDrawer } from "@/features/campaigns/components/campaign-analytics-drawer";
import type { Campaign } from "@/types/campaign";

export default function CampaignsPage() {
  const [isWizardOpen, setIsWizardOpen] = React.useState(false);
  const [selectedCampaign, setSelectedCampaign] = React.useState<Campaign | null>(null);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = React.useState(false);

  const handleViewAnalytics = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setIsAnalyticsOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="WhatsApp Broadcast Campaigns"
        description="Deliver mass outreach and promotional updates via approved WhatsApp templates to targeted audience segments."
        breadcrumbs={[
          { label: "Workspace", href: "/dashboard" },
          { label: "Broadcast Campaigns" },
        ]}
      >
        <Button
          onClick={() => setIsWizardOpen(true)}
          size="sm"
          className="gap-2 text-xs font-semibold shadow-xs"
        >
          <Plus className="size-4" />
          Create Campaign
        </Button>
      </PageHeader>

      {/* Campaigns Data Table with search, filters, actions */}
      <CampaignsTable onViewAnalytics={handleViewAnalytics} />

      {/* Campaign Creation Multi-Step Wizard Modal */}
      <CampaignWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
      />

      {/* Slide-over Analytics & Delivery Breakdown Drawer */}
      <CampaignAnalyticsDrawer
        campaign={selectedCampaign}
        isOpen={isAnalyticsOpen}
        onClose={() => {
          setIsAnalyticsOpen(false);
          setSelectedCampaign(null);
        }}
      />
    </div>
  );
}
