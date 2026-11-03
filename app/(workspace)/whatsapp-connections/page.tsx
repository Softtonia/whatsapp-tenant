"use client";

import * as React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  useWhatsAppAccountsQuery,
  useWhatsAppHealthQuery,
} from "@/features/whatsapp-connections/hooks";
import { WhatsAppHealthDiagnostics } from "@/features/whatsapp-connections/components/whatsapp-health-diagnostics";
import { WhatsAppAccountsCard } from "@/features/whatsapp-connections/components/whatsapp-accounts-card";
import { ConnectAccountModal } from "@/features/whatsapp-connections/components/connect-account-modal";

export default function WhatsAppConnectionsPage() {
  const [isConnectOpen, setIsConnectOpen] = React.useState(false);

  const {
    data: accounts,
    isLoading: loadingAccounts,
    refetch: refetchAccounts,
  } = useWhatsAppAccountsQuery();

  const {
    data: health,
    isLoading: loadingHealth,
    refetch: refetchHealth,
  } = useWhatsAppHealthQuery();

  const handleRefreshAll = () => {
    refetchAccounts();
    refetchHealth();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="WhatsApp Channel Connections"
        description="Connect and monitor Meta WhatsApp Cloud API phone numbers, WABA credentials, and webhook endpoints."
        breadcrumbs={[
          { label: "Workspace", href: "/dashboard" },
          { label: "WhatsApp Connections" },
        ]}
      >
        <Button
          onClick={() => setIsConnectOpen(true)}
          size="sm"
          className="gap-2 text-xs font-semibold shadow-xs"
        >
          <Plus className="size-4" />
          Connect WhatsApp Number
        </Button>
      </PageHeader>

      {/* Connection Health & Diagnostics Banner */}
      <WhatsAppHealthDiagnostics
        health={health}
        isLoading={loadingHealth}
        onRefresh={() => refetchHealth()}
      />

      {/* Connected Phone Numbers Card */}
      <WhatsAppAccountsCard
        accounts={accounts || []}
        isLoading={loadingAccounts}
        onRefresh={handleRefreshAll}
        onConnectNew={() => setIsConnectOpen(true)}
      />

      {/* Connect Number Modal */}
      <ConnectAccountModal
        isOpen={isConnectOpen}
        onClose={() => setIsConnectOpen(false)}
        onSuccess={handleRefreshAll}
      />
    </div>
  );
}
