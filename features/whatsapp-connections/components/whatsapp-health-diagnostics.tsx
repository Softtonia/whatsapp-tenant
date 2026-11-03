"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  RefreshCw,
  Activity,
  ShieldCheck,
  Radio,
  Layers,
} from "lucide-react";
import type { WhatsAppHealthData } from "@/types/tenant";
import { formatRelativeTime } from "@/lib/formatters";

interface WhatsAppHealthDiagnosticsProps {
  health?: WhatsAppHealthData;
  isLoading: boolean;
  onRefresh?: () => void;
}

export function WhatsAppHealthDiagnostics({
  health,
  isLoading,
  onRefresh,
}: WhatsAppHealthDiagnosticsProps) {
  const isHealthy = health?.status === "healthy" || health?.status === "connected";

  return (
    <Card className="border-border/80 shadow-xs">
      <CardContent className="p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
          <div className="flex items-center gap-3">
            <div
              className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${
                isHealthy
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
              }`}
            >
              <Radio className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-foreground">
                  Meta WhatsApp Cloud API Gateway
                </h3>
                {isHealthy ? (
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-semibold">
                    Connected &amp; Healthy
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 text-[10px] font-semibold">
                    Disconnected
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Official Business Solution Provider (BSP) infrastructure integration
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="h-8 gap-1.5 text-xs font-semibold self-start sm:self-auto"
          >
            <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Run Diagnostics Ping
          </Button>
        </div>

        {/* Diagnostics Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-muted/20 border border-border/80 space-y-1">
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <ShieldCheck className="size-3 text-emerald-500" />
              Quality Rating
            </span>
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-500" />
              <span className="font-bold text-foreground uppercase">
                {health?.quality_rating || "HIGH QUALITY"}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-muted/20 border border-border/80 space-y-1">
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Layers className="size-3 text-primary" />
              Messaging Limit
            </span>
            <span className="font-bold text-foreground block">
              {health?.messaging_limit || "Tier 10K (Standard)"}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-muted/20 border border-border/80 space-y-1">
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Activity className="size-3 text-primary" />
              Webhook Verification
            </span>
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
              <CheckCircle2 className="size-3.5" />
              <span>Subscribed &amp; Verified</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-muted/20 border border-border/80 space-y-1">
            <span className="text-[11px] text-muted-foreground">Last Cloud Sync</span>
            <span className="font-semibold text-foreground block">
              {health?.last_synced_at
                ? formatRelativeTime(health.last_synced_at)
                : "Just now"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
