"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  RefreshCw,
  CloudCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Info,
} from "lucide-react";
import { useSyncTemplatesMutation } from "../hooks";
import type { MetaTemplate } from "@/types/template";
import { formatDateTime } from "@/lib/formatters";

interface TemplateSyncBannerProps {
  templates?: MetaTemplate[];
  lastSyncedAt?: string;
}

export function TemplateSyncBanner({
  templates = [],
  lastSyncedAt,
}: TemplateSyncBannerProps) {
  const syncMutation = useSyncTemplatesMutation();
  const [syncFeedback, setSyncFeedback] = React.useState<string | null>(null);

  const approvedCount = templates.filter((t) => t.status === "APPROVED").length;
  const pendingCount = templates.filter((t) => t.status === "PENDING").length;
  const rejectedCount = templates.filter((t) => t.status === "REJECTED").length;

  const handleSync = async () => {
    try {
      const res = await syncMutation.mutateAsync();
      setSyncFeedback(
        `Successfully synced ${res.synced_count ?? templates.length} templates from Meta Cloud API.`
      );
      setTimeout(() => setSyncFeedback(null), 5000);
    } catch {
      setSyncFeedback("Sync failed. Check your WhatsApp Cloud API credentials.");
      setTimeout(() => setSyncFeedback(null), 5000);
    }
  };

  return (
    <div className="bg-card border border-border/80 rounded-xl p-4 sm:p-5 shadow-xs space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="size-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
            <CloudCheck className="size-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-foreground">
                Meta Cloud API Template Synchronization
              </h3>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-semibold">
                Live Meta Bridge
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Templates are validated and reviewed by Meta according to WhatsApp Business Messaging Policies.
              Approved templates can be sent outside the 24-hour service window.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            size="sm"
            onClick={handleSync}
            disabled={syncMutation.isPending}
            className="gap-2 text-xs font-semibold shadow-xs"
          >
            <RefreshCw
              className={`size-3.5 ${syncMutation.isPending ? "animate-spin" : ""}`}
            />
            {syncMutation.isPending ? "Syncing..." : "Sync from Meta"}
          </Button>
        </div>
      </div>

      <div className="pt-2 border-t border-border/60 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <CheckCircle2 className="size-3.5 text-emerald-500" />
            <span>
              <strong>{approvedCount}</strong> Approved
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="size-3.5 text-amber-500" />
            <span>
              <strong>{pendingCount}</strong> In Review
            </span>
          </div>
          {rejectedCount > 0 && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <AlertTriangle className="size-3.5 text-rose-500" />
              <span>
                <strong>{rejectedCount}</strong> Rejected
              </span>
            </div>
          )}
        </div>

        <div className="text-[11px] text-muted-foreground flex items-center gap-1">
          <Info className="size-3 text-muted-foreground" />
          <span>
            Last synced:{" "}
            {lastSyncedAt ? formatDateTime(lastSyncedAt) : "Just now"}
          </span>
        </div>
      </div>

      {syncFeedback && (
        <div
          className={`p-2.5 rounded-lg text-xs font-medium animate-in fade-in ${
            syncFeedback.includes("failed")
              ? "bg-rose-500/10 text-rose-600 border border-rose-500/20"
              : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
          }`}
        >
          {syncFeedback}
        </div>
      )}
    </div>
  );
}

