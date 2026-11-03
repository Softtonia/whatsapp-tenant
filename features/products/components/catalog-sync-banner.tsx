"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSyncMetaCatalogMutation } from "../hooks";
import { ShoppingBag, RefreshCw, CheckCircle2, Clock } from "lucide-react";

interface CatalogSyncBannerProps {
  totalProducts: number;
  activeCount: number;
  lastSyncedAt?: string | null;
}

export function CatalogSyncBanner({
  totalProducts,
  activeCount,
  lastSyncedAt,
}: CatalogSyncBannerProps) {
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const syncMutation = useSyncMetaCatalogMutation();

  const handleSync = async () => {
    try {
      setSyncFeedback(null);
      const res = await syncMutation.mutateAsync();
      setSyncFeedback(`Successfully synchronized ${res.synced_count} items with Meta Commerce`);
      setTimeout(() => setSyncFeedback(null), 4000);
    } catch {
      setSyncFeedback("Sync failed. Check WhatsApp Business Account permissions.");
    }
  };

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-start gap-3.5">
        <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <ShoppingBag className="size-5" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-foreground">
              WhatsApp Meta Commerce Catalog
            </h3>
            <Badge variant="default" className="text-[10px] uppercase font-semibold">
              Live Sync
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
            {activeCount} of {totalProducts} products are active and eligible for WhatsApp in-chat
            product messages, multi-item pickers, and direct customer checkout.
          </p>

          <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-1">
            <span className="flex items-center gap-1 font-mono">
              <Clock className="size-3 text-primary" />
              Last sync: {lastSyncedAt ? new Date(lastSyncedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Today 18:00"}
            </span>

            {syncFeedback && (
              <span className="flex items-center gap-1 font-semibold text-primary animate-in fade-in">
                <CheckCircle2 className="size-3" />
                {syncFeedback}
              </span>
            )}
          </div>
        </div>
      </div>

      <Button
        size="sm"
        disabled={syncMutation.isPending}
        onClick={handleSync}
        className="gap-1.5 text-xs font-semibold shrink-0"
      >
        <RefreshCw className={`size-3.5 ${syncMutation.isPending ? "animate-spin" : ""}`} />
        <span>{syncMutation.isPending ? "Syncing with Meta..." : "Sync Catalog Now"}</span>
      </Button>
    </div>
  );
}
