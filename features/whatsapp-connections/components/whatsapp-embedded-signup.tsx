"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import {
  fetchEmbeddedSignupConfig,
  initiateEmbeddedSignup,
  callbackEmbeddedSignup,
  initiateMetaConnect,
} from "../api";
import { launchMetaEmbeddedSignup } from "@/src/lib/meta-sdk";
import type { WhatsAppAccount, EmbeddedSignupConfig } from "@/types/whatsapp";

export type SignupStatus =
  | "idle"
  | "loading" // Calling API 1 (config) & API 2 (initiate) + loading SDK
  | "connecting" // Meta Embedded Signup popup is open
  | "processing" // Calling API 3 (callback) with code & session info
  | "success" // Completed successfully
  | "cancelled" // User closed or cancelled popup
  | "error"; // Error encountered

export interface WhatsAppEmbeddedSignupProps {
  onSuccess?: (account: WhatsAppAccount) => void;
  className?: string;
  initialConfig?: EmbeddedSignupConfig | null;
  buttonLabel?: string;
}

export function WhatsAppEmbeddedSignup({
  onSuccess,
  className,
  initialConfig,
  buttonLabel = "Connect WhatsApp",
}: WhatsAppEmbeddedSignupProps) {
  const [status, setStatus] = React.useState<SignupStatus>("idle");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [connectedAccount, setConnectedAccount] =
    React.useState<WhatsAppAccount | null>(null);

  // Guard against duplicate callback executions per session
  const isSubmittingCallbackRef = React.useRef(false);

  const handleStartSignup = async () => {
    if (status === "loading" || status === "connecting" || status === "processing") {
      return;
    }

    setStatus("loading");
    setErrorMessage(null);
    isSubmittingCallbackRef.current = false;

    try {
      // Step 1: Call backend APIs dynamically in parallel (zero hardcoding)
      const [configRes, initData, metaRes] = await Promise.all([
        initialConfig ? Promise.resolve(initialConfig) : fetchEmbeddedSignupConfig().catch(() => null),
        initiateEmbeddedSignup().catch(() => null),
        initiateMetaConnect().catch(() => null),
      ]);

      const appId = configRes?.app_id || metaRes?.app_id || (metaRes as any)?.client_id;
      const configId = configRes?.config_id || metaRes?.config_id;
      const graphVersion = configRes?.graph_version || metaRes?.graph_version || "v23.0";
      const sessionInfoVersion = configRes?.session_info_version || "2";
      const stateToken = initData?.state || metaRes?.state;
      const fallbackAuthUrl = metaRes?.auth_url || (metaRes as any)?.data?.auth_url;

      if (!appId || !configId || !stateToken) {
        if (fallbackAuthUrl && typeof window !== "undefined") {
          window.open(fallbackAuthUrl, "_blank", "noopener,noreferrer");
          setStatus("idle");
          return;
        }
        throw new Error(
          "Meta Embedded Signup is not fully configured on the server (missing app_id, config_id, or state token)."
        );
      }

      // Step 2: Launch Meta Embedded Signup via Meta JS SDK
      setStatus("connecting");

      let signupResult: any;
      try {
        signupResult = await launchMetaEmbeddedSignup({
          appId,
          configId,
          graphVersion,
          sessionInfoVersion,
          state: stateToken,
        });
      } catch (sdkErr: any) {
        if (sdkErr?.isCancelled) {
          setStatus("cancelled");
          return;
        }
        if (fallbackAuthUrl && typeof window !== "undefined") {
          window.open(fallbackAuthUrl, "_blank", "noopener,noreferrer");
          setStatus("idle");
          return;
        }
        throw sdkErr;
      }

      // Step 3: Call API 3 - POST /api/whatsapp/embedded-signup/callback
      if (isSubmittingCallbackRef.current) {
        return;
      }
      isSubmittingCallbackRef.current = true;
      setStatus("processing");

      const savedAccount = await callbackEmbeddedSignup({
        code: signupResult.code,
        state: signupResult.state,
        waba_id: signupResult.waba_id,
        phone_number_id: signupResult.phone_number_id,
        set_as_default: true,
      });

      setConnectedAccount(savedAccount);
      setStatus("success");
      onSuccess?.(savedAccount);
    } catch (err: any) {
      if (err?.isCancelled || err?.message?.toLowerCase().includes("cancelled") || err?.message?.toLowerCase().includes("closed")) {
        setStatus("cancelled");
      } else {
        setStatus("error");
        setErrorMessage(
          err instanceof Error
            ? err.message
            : "Failed to complete Meta WhatsApp Embedded Signup. Please try again."
        );
      }
    } finally {
      isSubmittingCallbackRef.current = false;
    }
  };

  const handleRetry = () => {
    setStatus("idle");
    setErrorMessage(null);
  };

  return (
    <div className={`space-y-3 ${className || ""}`}>
      {/* 1. Idle State: Standard Connect Button */}
      {status === "idle" && (
        <Button
          type="button"
          onClick={handleStartSignup}
          className="w-full h-10 gap-2 font-semibold text-xs shadow-xs bg-[#006E38] hover:bg-[#005a2e] text-white"
        >
          <Sparkles className="size-4" />
          <span>{buttonLabel}</span>
          <ExternalLink className="size-3.5 opacity-80" />
        </Button>
      )}

      {/* 2. Loading State: Preparing Meta Config & Session */}
      {status === "loading" && (
        <div className="p-3.5 rounded-xl border border-primary/20 bg-primary/5 space-y-2 text-center">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-primary">
            <Loader2 className="size-4 animate-spin" />
            <span>Initializing Meta Embedded Signup...</span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Contacting backend for configuration and security state...
          </p>
        </div>
      )}

      {/* 3. Connecting State: Meta Popup is Open */}
      {status === "connecting" && (
        <div className="p-4 rounded-xl border border-[#006E38]/30 bg-[#006E38]/5 space-y-2 text-center animate-pulse">
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#006E38]">
            <Loader2 className="size-4 animate-spin" />
            <span>Meta Embedded Signup is Active</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Please log into Facebook and select your WhatsApp Business Account in the popup window.
          </p>
        </div>
      )}

      {/* 4. Processing State: Exchanging code with Laravel API 3 */}
      {status === "processing" && (
        <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-2 text-center">
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-primary">
            <Loader2 className="size-4 animate-spin" />
            <span>Verifying & Saving WhatsApp Account...</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Sending authorization to backend. Exchanging code for access token and linking WABA...
          </p>
        </div>
      )}

      {/* 5. Success State */}
      {status === "success" && (
        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 space-y-2 text-center">
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" />
            <span>WhatsApp Connected!</span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            {connectedAccount?.display_phone_number
              ? `Account (${connectedAccount.display_phone_number}) successfully verified and linked.`
              : "Your WhatsApp Business Account is verified and ready for inbound messaging and broadcasts."}
          </p>
        </div>
      )}

      {/* 6. Cancelled State */}
      {status === "cancelled" && (
        <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 space-y-2 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300">
            <ShieldAlert className="size-4" />
            <span>Signup Cancelled</span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            The Meta signup window was closed before completion. You can retry whenever you are ready.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRetry}
            className="h-8 gap-1.5 text-xs font-medium mt-1"
          >
            <RefreshCw className="size-3.5" />
            <span>Try Again</span>
          </Button>
        </div>
      )}

      {/* 7. Error State */}
      {status === "error" && (
        <div className="p-3.5 rounded-xl border border-destructive/30 bg-destructive/10 space-y-2 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            <span>Connection Error</span>
          </div>
          <p className="text-[11px] text-destructive/90 font-medium leading-relaxed">
            {errorMessage || "An unexpected error occurred during Embedded Signup."}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRetry}
            className="h-8 gap-1.5 text-xs font-medium mt-1"
          >
            <RefreshCw className="size-3.5" />
            <span>Try Again</span>
          </Button>
        </div>
      )}
    </div>
  );
}

