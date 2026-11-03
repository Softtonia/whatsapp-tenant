"use client";

import { useWhatsAppHealthQuery } from "../hooks";
import { useActiveTenant } from "@/lib/tenant/hooks";
import {
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  RefreshCw,
  Phone,
  Radio,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export function WhatsAppStatusBanner() {
  const { data: health, isLoading, refetch, isFetching } = useWhatsAppHealthQuery();
  const { activeTenant } = useActiveTenant();

  const isConnected = health?.status === "connected" || health?.status === "healthy";
  const quality = health?.quality_rating?.toUpperCase() || "GREEN";

  const getQualityBadge = () => {
    if (quality === "GREEN") {
      return (
        <Badge variant="success" className="text-[10px] font-semibold py-0 px-1.5">
          Quality: High (Green)
        </Badge>
      );
    }
    if (quality === "YELLOW") {
      return (
        <Badge variant="warning" className="text-[10px] font-semibold py-0 px-1.5">
          Quality: Medium (Yellow)
        </Badge>
      );
    }
    return (
      <Badge variant="destructive" className="text-[10px] font-semibold py-0 px-1.5">
        Quality: Low (Red)
      </Badge>
    );
  };

  const displayPhone =
    health?.display_phone_number ||
    activeTenant?.default_phone_number ||
    "+91 98765 43210";

  const wabaId =
    health?.phone_number_id ||
    activeTenant?.waba_id ||
    "waba_109823485723948";

  const tier = health?.messaging_limit?.replace("TIER_", "") || "10K";
  const webhookStatus = health?.webhook_status || "active";

  return (
    <div className="rounded-xl border border-primary/25 bg-primary/5 p-4 sm:p-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs mt-0.5">
            {isConnected ? (
              <CheckCircle2 className="size-5" />
            ) : (
              <AlertTriangle className="size-5 text-warning" />
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-bold text-foreground">
                WhatsApp Cloud API — {isConnected ? "Live & Verified" : "Connecting Channel..."}
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                <ShieldCheck className="size-3" />
                Meta Tier {tier}
              </span>
              {getQualityBadge()}
            </div>

            <div className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 font-mono text-foreground font-medium">
                <Phone className="size-3 text-muted-foreground" />
                {displayPhone}
              </span>
              <span>•</span>
              <span className="font-mono text-[11px]">
                WABA ID: <strong className="text-foreground">{wabaId}</strong>
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 text-[11px]">
                <Radio className="size-3 text-success" />
                Webhook: <strong className="text-foreground capitalize">{webhookStatus}</strong>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-center shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading || isFetching}
            className="h-8 gap-1.5 text-xs font-medium bg-card/80 border-border/80"
          >
            <RefreshCw className={`size-3.5 ${isFetching ? "animate-spin text-primary" : ""}`} />
            <span>Sync Status</span>
          </Button>

          <Link href="/whatsapp-connections">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1 text-xs font-semibold bg-card/80 border-border/80"
            >
              <span>Connections</span>
              <ExternalLink className="size-3" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
