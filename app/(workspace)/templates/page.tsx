"use client";

import * as React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTemplatesQuery } from "@/features/templates/hooks";
import { TemplateSyncBanner } from "@/features/templates/components/template-sync-banner";
import { TemplatesTable } from "@/features/templates/components/templates-table";
import { TemplateCreateModal } from "@/features/templates/components/template-create-modal";

export default function TemplatesPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const { data, isLoading, refetch } = useTemplatesQuery();

  const templates = data?.data || [];
  const lastSynced = templates.find((t) => t.last_synced_at)?.last_synced_at;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="WhatsApp Message Templates"
        description="Manage Meta-approved message templates for high-volume customer broadcasts and automated alerts."
        breadcrumbs={[
          { label: "Workspace", href: "/dashboard" },
          { label: "Message Templates" },
        ]}
      >
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          size="sm"
          className="gap-2 text-xs font-semibold shadow-xs"
        >
          <Plus className="size-4" />
          Create Template
        </Button>
      </PageHeader>

      {/* Meta Cloud Sync Status Banner */}
      <TemplateSyncBanner
        templates={templates}
        lastSyncedAt={lastSynced}
      />

      {/* Templates Table and Preview Sheet */}
      <TemplatesTable
        templates={templates}
        isLoading={isLoading}
        onRefresh={() => refetch()}
        onCreateNew={() => setIsCreateModalOpen(true)}
      />

      {/* Create Template Modal */}
      <TemplateCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
