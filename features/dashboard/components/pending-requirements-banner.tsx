"use client";

import { useState } from "react";
import { useOnboardingRequirementsQuery } from "@/features/onboarding/hooks";
import {
  useMetaConnectionStatusQuery,
  useSyncMetaAccountsMutation,
  useReconnectMetaMutation,
  useDisconnectMetaMutation,
  useInitiateMetaConnectMutation,
} from "@/features/whatsapp-connections/hooks";
import {
  Sparkles,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  Unlink,
  CheckCircle2,
  Clock,
  Layers,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConnectAccountModal } from "@/features/whatsapp-connections/components/connect-account-modal";
import Link from "next/link";

export function PendingRequirementsBanner() {
  const { data: requirementsRes, isLoading: isLoadingReq } = useOnboardingRequirementsQuery();
  const { data: metaStatus, isLoading: isLoadingMeta, refetch: refetchMeta } = useMetaConnectionStatusQuery();
  const syncMetaMutation = useSyncMetaAccountsMutation();
  const reconnectMetaMutation = useReconnectMetaMutation();
  const disconnectMetaMutation = useDisconnectMetaMutation();
  const metaConnectMutation = useInitiateMetaConnectMutation();

  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  // Parse requirements response structure
  const requirementsData = requirementsRes?.data || requirementsRes;
  const summary = requirementsData?.summary || {
    total_steps: 8,
    completed_steps: 6,
    pending_steps: 2,
    completion_percentage: 75,
  };

  const pendingSteps: any[] = Array.isArray(requirementsData?.pending_steps)
    ? requirementsData.pending_steps
    : [];

  const completedSteps: any[] = Array.isArray(requirementsData?.completed_steps)
    ? requirementsData.completed_steps
    : [];

  // If loading or all steps completed and Meta is connected, banner can hide or show minimal
  if (isLoadingReq && !requirementsData) {
    return null;
  }

  const isMetaConnected = Boolean(metaStatus?.is_connected || metaStatus?.status === "connected");
  const hasPending = pendingSteps.length > 0 || !isMetaConnected;

  if (!hasPending) {
    return null;
  }

  const handleConnectMeta = async () => {
    try {
      const res = await metaConnectMutation.mutateAsync();
      const authUrl = res?.auth_url;
      if (authUrl) {
        window.open(authUrl, "_blank", "noopener,noreferrer");
      } else {
        setIsConnectModalOpen(true);
      }
    } catch (err: any) {
      console.warn("Direct Meta connect failed, opening fallback modal:", err);
      setIsConnectModalOpen(true);
    }
  };

  const handleSyncMeta = async () => {
    try {
      await syncMetaMutation.mutateAsync();
      refetchMeta();
    } catch {
      // Handled
    }
  };

  const handleDisconnectMeta = async () => {
    if (!confirm("Are you sure you want to disconnect Meta Business Account?")) return;
    try {
      await disconnectMetaMutation.mutateAsync();
      refetchMeta();
    } catch {
      // Handled
    }
  };

  return (
    <>
      <div className="rounded-xl border border-[#006E38]/30 bg-gradient-to-r from-[#006E38]/10 via-emerald-500/10 to-card p-4 sm:p-5 shadow-xs transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#006E38] text-white shadow-xs mt-0.5">
              <Sparkles className="size-5" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-foreground">
                  Final Step: Connect Meta Business & WhatsApp Channel
                </h3>
                <Badge
                  variant="outline"
                  className="bg-[#006E38]/15 text-[#006E38] dark:text-emerald-300 border-[#006E38]/30 text-[10px] font-bold py-0.5"
                >
                  {summary.completion_percentage || 75}% Complete
                </Badge>
                {isMetaConnected ? (
                  <Badge variant="outline" className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px] font-bold">
                    Meta Linked
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30 text-[10px] font-bold">
                    Action Required
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Your tenant onboarding is complete ({summary.completed_steps || 6}/{summary.total_steps || 8} steps). Connect your Meta Business Portfolio via Embedded Signup to start sending WhatsApp broadcasts and managing inbound chats.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap">
            <Button
              size="sm"
              onClick={handleConnectMeta}
              disabled={metaConnectMutation.isPending}
              className="gap-1.5 text-xs font-bold shadow-xs bg-[#006E38] hover:bg-[#005a2e] text-white"
            >
              {metaConnectMutation.isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Connecting Meta...</span>
                </>
              ) : (
                <>
                  <ExternalLink className="size-3.5" />
                  <span>Connect Meta Portfolio</span>
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="size-8 p-0 text-muted-foreground hover:text-foreground"
              title={isExpanded ? "Collapse pending steps" : "View pending steps"}
            >
              {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            </Button>
          </div>
        </div>

        {/* Collapsible Pending Requirements List */}
        {isExpanded && (
          <div className="mt-4 pt-3.5 border-t border-border/60 grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Step 1: Meta Business Connection */}
            <div className="p-3 rounded-lg border border-border/80 bg-background/60 flex items-start justify-between gap-3">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Clock className="size-3.5 text-amber-500 shrink-0" />
                  <h4 className="text-xs font-bold text-foreground truncate">
                    1. Meta Business Account Connection
                  </h4>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Connect Meta Business Portfolio via Meta Embedded Signup to grant WhatsApp API permissions.
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-1.5">
                {isMetaConnected ? (
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={handleSyncMeta}
                    disabled={syncMetaMutation.isPending}
                    className="gap-1 text-[11px] h-7"
                  >
                    <RefreshCw className={`size-3 ${syncMetaMutation.isPending ? "animate-spin" : ""}`} />
                    <span>Sync</span>
                  </Button>
                ) : (
                  <Button
                    size="xs"
                    onClick={handleConnectMeta}
                    disabled={metaConnectMutation.isPending}
                    className="gap-1 text-[11px] h-7 font-semibold bg-[#006E38] hover:bg-[#005a2e] text-white"
                  >
                    {metaConnectMutation.isPending ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : (
                      <>
                        <span>Connect</span>
                        <ArrowRight className="size-3" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Step 2: WABA Setup */}
            <div className="p-3 rounded-lg border border-border/80 bg-background/60 flex items-start justify-between gap-3">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Clock className="size-3.5 text-amber-500 shrink-0" />
                  <h4 className="text-xs font-bold text-foreground truncate">
                    2. WhatsApp Business Account (WABA) Setup
                  </h4>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Configure WhatsApp Business Account, registered sending phone number, and webhook sync.
                </p>
              </div>

              <div className="shrink-0">
                <Link href="/whatsapp-connections">
                  <Button
                    size="xs"
                    variant="outline"
                    className="gap-1 text-[11px] h-7 font-semibold hover:bg-muted"
                  >
                    <span>Manage WABA</span>
                    <ArrowRight className="size-3" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      <ConnectAccountModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        onSuccess={() => {
          refetchMeta();
          setIsConnectModalOpen(false);
        }}
      />
    </>
  );
}
