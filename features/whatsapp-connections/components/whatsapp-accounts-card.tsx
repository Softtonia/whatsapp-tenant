"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Phone,
  RefreshCw,
  Plus,
  Radio,
  Star,
} from "lucide-react";
import type { WhatsAppAccount } from "@/types/whatsapp";
import {
  useSyncWhatsAppAccountMutation,
  useSetDefaultNumberMutation,
} from "../hooks";
import { formatDateTime } from "@/lib/formatters";

interface WhatsAppAccountsCardProps {
  accounts: WhatsAppAccount[];
  isLoading: boolean;
  onRefresh?: () => void;
  onConnectNew?: () => void;
}

export function WhatsAppAccountsCard({
  accounts,
  isLoading,
  onRefresh,
  onConnectNew,
}: WhatsAppAccountsCardProps) {
  const [syncingId, setSyncingId] = React.useState<string | number | null>(null);
  const [feedback, setFeedback] = React.useState<string | null>(null);

  const syncMutation = useSyncWhatsAppAccountMutation();
  const setDefaultMutation = useSetDefaultNumberMutation();

  const handleSync = async (id: string | number) => {
    try {
      setSyncingId(id);
      await syncMutation.mutateAsync(id);
      setFeedback("Meta account metadata and templates synchronized successfully.");
      setTimeout(() => setFeedback(null), 4000);
      onRefresh?.();
    } catch {
      setFeedback("Sync failed. Check API credentials.");
      setTimeout(() => setFeedback(null), 4000);
    } finally {
      setSyncingId(null);
    }
  };

  const handleSetDefault = async (id: string | number) => {
    try {
      await setDefaultMutation.mutateAsync(id);
      setFeedback("Default sending number updated.");
      setTimeout(() => setFeedback(null), 4000);
      onRefresh?.();
    } catch {
      // Handled by query mutation
    }
  };

  return (
    <Card className="border-border/80 shadow-xs">
      <CardHeader className="border-b border-border/60 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              Registered WhatsApp Phone Numbers ({accounts.length})
            </CardTitle>
            <CardDescription className="text-xs">
              Configured phone numbers verified through Meta Business Manager for broadcast delivery and shared inbox conversations
            </CardDescription>
          </div>

          <Button
            size="sm"
            onClick={onConnectNew}
            className="gap-1.5 text-xs font-semibold shadow-xs self-start sm:self-auto"
          >
            <Plus className="size-4" />
            Connect New Number
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 space-y-4">
        {feedback && (
          <div className="p-2.5 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 animate-in fade-in">
            {feedback}
          </div>
        )}

        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-20 bg-muted/30 rounded-xl" />
            <div className="h-20 bg-muted/30 rounded-xl" />
          </div>
        ) : accounts.length === 0 ? (
          <div className="p-8 text-center rounded-xl border border-dashed border-border space-y-2">
            <Radio className="size-8 mx-auto text-muted-foreground/40" />
            <p className="font-semibold text-xs text-foreground">No WhatsApp numbers connected</p>
            <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
              Link your Meta WhatsApp Business Account to start sending broadcasts and answering inbound customer chats.
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={onConnectNew}
              className="mt-2 text-xs"
            >
              Connect Number
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {accounts.map((acc) => (
              <div
                key={acc.id}
                className="p-4 rounded-xl border border-border/80 bg-card hover:bg-muted/10 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Phone className="size-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm text-foreground">
                        {acc.display_phone_number}
                      </span>
                      {acc.is_default && (
                        <Badge
                          variant="outline"
                          className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-semibold gap-1"
                        >
                          <Star className="size-3 fill-emerald-500 text-emerald-500" />
                          Default Sending Number
                        </Badge>
                      )}
                      <Badge
                        variant="secondary"
                        className="text-[10px] font-semibold"
                      >
                        {acc.messaging_limit || "Tier 10K"}
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Verified Name: <strong>{acc.verified_name || acc.business_name}</strong> • WABA ID: <code className="text-[11px]">{acc.waba_id}</code>
                    </p>

                    <p className="text-[11px] text-muted-foreground">
                      Phone Number ID: <code className="text-[11px]">{acc.phone_number_id}</code>
                      {acc.templates_synced_at && (
                        <span> • Synced {formatDateTime(acc.templates_synced_at)}</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
                  {!acc.is_default && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetDefault(acc.id)}
                      disabled={setDefaultMutation.isPending}
                      className="h-8 text-xs font-semibold"
                    >
                      Set as Default
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSync(acc.id)}
                    disabled={syncingId === acc.id}
                    className="h-8 gap-1.5 text-xs font-semibold"
                  >
                    <RefreshCw className={`size-3.5 ${syncingId === acc.id ? "animate-spin" : ""}`} />
                    Sync Meta
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

