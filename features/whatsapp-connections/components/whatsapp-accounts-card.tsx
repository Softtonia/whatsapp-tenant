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
  CheckCircle2,
  Trash2,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import type { WhatsAppAccount } from "@/types/whatsapp";
import {
  useSyncWhatsAppAccountMutation,
  useSetDefaultNumberMutation,
  useSyncMetaAccountsMutation,
  useReconnectWhatsAppAccountMutation,
  useVerifyWhatsAppAccountMutation,
  useDeleteWhatsAppAccountMutation,
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
  const [activeActionId, setActiveActionId] = React.useState<string | number | null>(null);
  const [feedback, setFeedback] = React.useState<string | null>(null);

  const syncMutation = useSyncWhatsAppAccountMutation();
  const setDefaultMutation = useSetDefaultNumberMutation();
  const syncMetaMutation = useSyncMetaAccountsMutation();
  const reconnectMutation = useReconnectWhatsAppAccountMutation();
  const verifyMutation = useVerifyWhatsAppAccountMutation();
  const deleteMutation = useDeleteWhatsAppAccountMutation();

  const handleSync = async (id: string | number) => {
    try {
      setActiveActionId(id);
      await syncMutation.mutateAsync(id);
      setFeedback("WABA account metadata and templates synchronized successfully.");
      setTimeout(() => setFeedback(null), 4000);
      onRefresh?.();
    } catch {
      setFeedback("Sync failed. Check API credentials.");
      setTimeout(() => setFeedback(null), 4000);
    } finally {
      setActiveActionId(null);
    }
  };

  const handleReconnect = async (id: string | number) => {
    try {
      setActiveActionId(id);
      await reconnectMutation.mutateAsync({ id });
      setFeedback("WABA account reconnected successfully.");
      setTimeout(() => setFeedback(null), 4000);
      onRefresh?.();
    } catch {
      setFeedback("Reconnect failed. Check permissions.");
      setTimeout(() => setFeedback(null), 4000);
    } finally {
      setActiveActionId(null);
    }
  };

  const handleVerify = async (id: string | number) => {
    try {
      setActiveActionId(id);
      await verifyMutation.mutateAsync({ id });
      setFeedback("WABA account credentials verified successfully.");
      setTimeout(() => setFeedback(null), 4000);
      onRefresh?.();
    } catch {
      setFeedback("Verification failed.");
      setTimeout(() => setFeedback(null), 4000);
    } finally {
      setActiveActionId(null);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!confirm("Are you sure you want to unlink this WhatsApp account?")) return;
    try {
      setActiveActionId(id);
      await deleteMutation.mutateAsync(id);
      setFeedback("WhatsApp account unlinked.");
      setTimeout(() => setFeedback(null), 4000);
      onRefresh?.();
    } catch {
      setFeedback("Failed to delete account.");
      setTimeout(() => setFeedback(null), 4000);
    } finally {
      setActiveActionId(null);
    }
  };

  const handleSyncAllMeta = async () => {
    try {
      await syncMetaMutation.mutateAsync();
      setFeedback("All Meta Business accounts and phone numbers synchronized successfully.");
      setTimeout(() => setFeedback(null), 4000);
      onRefresh?.();
    } catch {
      setFeedback("Meta sync failed. Verify permissions.");
      setTimeout(() => setFeedback(null), 4000);
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
              Registered WhatsApp Business (WABA) Accounts ({accounts.length})
            </CardTitle>
            <CardDescription className="text-xs">
              Configured phone numbers verified through Meta Business Manager for broadcast delivery and shared inbox conversations
            </CardDescription>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <Button
              size="sm"
              variant="outline"
              onClick={handleSyncAllMeta}
              disabled={syncMetaMutation.isPending}
              className="gap-1.5 text-xs font-semibold h-8"
              title="Sync all accounts via /api/tenant/meta/accounts/sync"
            >
              <RefreshCw className={`size-3.5 ${syncMetaMutation.isPending ? "animate-spin" : ""}`} />
              <span>{syncMetaMutation.isPending ? "Syncing Meta..." : "Sync Meta Accounts"}</span>
            </Button>

            <Button
              size="sm"
              onClick={onConnectNew}
              className="gap-1.5 text-xs font-semibold shadow-xs h-8"
            >
              <Plus className="size-4" />
              Connect New WABA Account
            </Button>
          </div>
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
            <p className="font-semibold text-xs text-foreground">No WhatsApp WABA accounts connected</p>
            <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
              Link your Meta WhatsApp Business Account to start sending broadcasts and answering inbound customer chats.
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={onConnectNew}
              className="mt-2 text-xs"
            >
              Connect WABA Account
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {accounts.map((acc) => {
              const isActionRunning = activeActionId === acc.id;

              return (
                <div
                  key={acc.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-border/80 bg-card hover:bg-muted/30 transition-all gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <Phone className="size-5" />
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-foreground">
                          {acc.display_phone_number}
                        </span>
                        {acc.verified_name && (
                          <span className="text-xs text-muted-foreground">
                            ({acc.verified_name})
                          </span>
                        )}
                        {acc.is_default && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] bg-primary/10 text-primary font-bold px-1.5 py-0"
                          >
                            Default Sending Number
                          </Badge>
                        )}
                        <Badge
                          variant={acc.status === "connected" ? "outline" : "secondary"}
                          className={`text-[10px] capitalize px-1.5 py-0 ${
                            acc.status === "connected"
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold"
                              : "text-muted-foreground"
                          }`}
                        >
                          {acc.status}
                        </Badge>
                      </div>

                      <div className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap font-mono">
                        <span>WABA ID: <code className="text-[11px]">{acc.waba_id}</code></span>
                        <span>•</span>
                        <span>Phone Number ID: <code className="text-[11px]">{acc.phone_number_id}</code></span>
                        {acc.messaging_limit && (
                          <>
                            <span>•</span>
                            <span>Tier: <strong className="text-foreground">{acc.messaging_limit}</strong></span>
                          </>
                        )}
                      </div>

                      {acc.templates_synced_at && (
                        <p className="text-[10px] text-muted-foreground">
                          Last templates sync: {formatDateTime(acc.templates_synced_at)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center flex-wrap">
                    {!acc.is_default && (
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => handleSetDefault(acc.id)}
                        disabled={setDefaultMutation.isPending || isActionRunning}
                        className="gap-1 text-[11px] h-7"
                      >
                        <Star className="size-3" />
                        Set Default
                      </Button>
                    )}

                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => handleVerify(acc.id)}
                      disabled={isActionRunning}
                      className="gap-1 text-[11px] h-7"
                      title="Verify via /api/tenant/whatsapp/accounts/{id}/verify"
                    >
                      <ShieldCheck className="size-3 text-emerald-600" />
                      Verify
                    </Button>

                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => handleReconnect(acc.id)}
                      disabled={isActionRunning}
                      className="gap-1 text-[11px] h-7"
                      title="Reconnect via /api/tenant/whatsapp/accounts/{id}/reconnect"
                    >
                      <RotateCcw className="size-3 text-blue-600" />
                      Reconnect
                    </Button>

                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => handleSync(acc.id)}
                      disabled={isActionRunning}
                      className="gap-1 text-[11px] h-7"
                      title="Sync via /api/tenant/whatsapp/accounts/{id}/sync"
                    >
                      <RefreshCw className={`size-3 ${isActionRunning ? "animate-spin" : ""}`} />
                      Sync
                    </Button>

                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => handleDelete(acc.id)}
                      disabled={isActionRunning}
                      className="text-[11px] h-7 text-destructive hover:bg-destructive/10 px-2"
                      title="Delete via /api/tenant/whatsapp/accounts/{id}"
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
