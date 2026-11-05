"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Radio,
  ExternalLink,
  ShieldCheck,
  Lock,
  Sparkles,
  KeyRound,
  CheckCircle2,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { directConnectSchema, type DirectConnectFormData } from "../schemas";
import {
  useConnectWhatsAppMutation,
  useEmbeddedSignupConfigQuery,
  useExchangeMetaTokenMutation,
  useReconnectMetaMutation,
  useInitiateMetaConnectMutation,
} from "../hooks";

interface ConnectAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ConnectAccountModal({
  isOpen,
  onClose,
  onSuccess,
}: ConnectAccountModalProps) {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <ConnectAccountInnerForm
          key={isOpen ? "open" : "closed"}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}

function ConnectAccountInnerForm({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [embeddedNotice, setEmbeddedNotice] = React.useState<string | null>(null);
  const [authUrl, setAuthUrl] = React.useState<string | null>(null);
  const [authCode, setAuthCode] = React.useState("");
  const [stateParam, setStateParam] = React.useState("");

  const connectMutation = useConnectWhatsAppMutation();
  const metaConnectMutation = useInitiateMetaConnectMutation();
  const exchangeTokenMutation = useExchangeMetaTokenMutation();
  const reconnectMutation = useReconnectMetaMutation();
  const { data: embeddedConfig } = useEmbeddedSignupConfigQuery();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DirectConnectFormData>({
    resolver: zodResolver(directConnectSchema),
    defaultValues: {
      waba_id: "",
      phone_number_id: "",
      display_phone_number: "",
      access_token: "",
      set_as_default: true,
    },
  });

  const onSubmitDirect = async (data: DirectConnectFormData) => {
    try {
      setErrorMessage(null);
      await connectMutation.mutateAsync(data);
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to verify Meta WhatsApp credentials"
      );
    }
  };

  const handleLaunchEmbeddedSignup = async () => {
    try {
      setErrorMessage(null);
      setEmbeddedNotice("Requesting Meta authorization URL from /api/tenant/meta/connect...");
      const res = await metaConnectMutation.mutateAsync();
      const url = res?.auth_url;
      if (url) {
        setAuthUrl(url);
        if (res.state) {
          setStateParam(res.state);
        }
        window.open(url, "_blank", "noopener,noreferrer");
        setEmbeddedNotice("Meta OAuth login opened in the next tab. Log into Facebook and approve permissions, then return here.");
      } else {
        setErrorMessage("Meta authorization URL was not returned by server.");
      }
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Could not connect to Meta. Check configuration."
      );
    }
  };

  const handleExchangeToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authCode.trim()) {
      setErrorMessage("Please enter the Meta authorization code.");
      return;
    }
    try {
      setErrorMessage(null);
      await exchangeTokenMutation.mutateAsync({
        code: authCode.trim(),
        state: stateParam.trim() || undefined,
      });
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to exchange Meta authorization token."
      );
    }
  };

  return (
    <div className="space-y-5">
      <DialogHeader>
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Radio className="size-5" />
          </div>
          <div>
            <DialogTitle className="text-base font-bold text-foreground">
              Connect WhatsApp Business Number
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Link your Meta WhatsApp Business Account (WABA) or register a new phone number.
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      {errorMessage && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-xs font-medium text-destructive">
          {errorMessage}
        </div>
      )}

      {embeddedNotice && (
        <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg text-xs font-medium text-primary leading-relaxed">
          {embeddedNotice}
        </div>
      )}

      <Tabs defaultValue="embedded" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-9">
          <TabsTrigger value="embedded" className="text-[11px] font-semibold gap-1">
            <Sparkles className="size-3 text-primary" />
            Meta Signup
          </TabsTrigger>
          <TabsTrigger value="exchange" className="text-[11px] font-semibold gap-1">
            <KeyRound className="size-3" />
            OAuth Token
          </TabsTrigger>
          <TabsTrigger value="manual" className="text-[11px] font-semibold gap-1">
            <Lock className="size-3" />
            Manual Credentials
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Embedded Signup via /api/tenant/meta/connect */}
        <TabsContent value="embedded" className="mt-4 space-y-4">
          <div className="p-4 rounded-xl border border-border bg-card space-y-2.5">
            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-success" />
              Recommended: Official Meta Cloud Onboarding
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Log into your Meta Business Manager to automatically import your verified display name, WhatsApp Business Account, and register phone numbers with zero manual token generation.
            </p>
            <div className="text-[11px] text-muted-foreground font-mono bg-muted/40 p-2 rounded-lg border border-border/60">
              Meta App ID: {embeddedConfig?.app_id || "1627020728900812"} • Config: {embeddedConfig?.config_id || "1683696456704799"}
            </div>
          </div>

          <Button
            type="button"
            onClick={handleLaunchEmbeddedSignup}
            disabled={metaConnectMutation.isPending}
            className="w-full h-10 gap-2 font-semibold text-xs shadow-xs bg-blue-600 hover:bg-blue-700 text-white"
          >
            {metaConnectMutation.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Connecting to Meta...</span>
              </>
            ) : (
              <>
                <ExternalLink className="size-4" />
                <span>Continue with Facebook / Meta Login</span>
              </>
            )}
          </Button>

          {authUrl && (
            <a
              href={authUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 w-full h-9 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs"
            >
              <ExternalLink className="size-3.5" />
              <span>Click here if browser blocked the new tab</span>
            </a>
          )}

          <p className="text-[11px] text-center text-muted-foreground">
            You must have Admin access to your Meta Business Portfolio.
          </p>
        </TabsContent>

        {/* Tab 2: Meta OAuth Token Exchange */}
        <TabsContent value="exchange" className="mt-4">
          <form onSubmit={handleExchangeToken} className="space-y-3.5">
            <div className="p-3 bg-muted/20 border border-border/80 rounded-xl space-y-1 text-xs">
              <span className="font-semibold text-foreground">Exchange OAuth Authorization Code</span>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                If completing Embedded Signup through a popup callback, paste the received code to exchange for long-lived tenant Meta access tokens.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Meta Authorization Code (code) *
              </Label>
              <Input
                value={authCode}
                onChange={(e) => setAuthCode(e.target.value)}
                placeholder="AQB... or OAuth Code"
                className="text-xs font-mono"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                State Token (optional)
              </Label>
              <Input
                value={stateParam}
                onChange={(e) => setStateParam(e.target.value)}
                placeholder="State verification token"
                className="text-xs font-mono"
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-3">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={exchangeTokenMutation.isPending || !authCode.trim()}
                className="font-semibold text-xs"
              >
                {exchangeTokenMutation.isPending ? "Exchanging Token..." : "Exchange & Connect"}
              </Button>
            </DialogFooter>
          </form>
        </TabsContent>

        {/* Tab 3: Manual Credentials Form */}
        <TabsContent value="manual" className="mt-4">
          <form onSubmit={handleSubmit(onSubmitDirect)} className="space-y-3.5">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                WhatsApp Business Account ID (WABA ID) *
              </Label>
              <Input
                {...register("waba_id")}
                placeholder="e.g. 100000000000001"
                className="text-xs font-mono"
              />
              {errors.waba_id && (
                <p className="text-xs text-destructive font-medium">{errors.waba_id.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Phone Number ID *
              </Label>
              <Input
                {...register("phone_number_id")}
                placeholder="e.g. 200000000000002"
                className="text-xs font-mono"
              />
              {errors.phone_number_id && (
                <p className="text-xs text-destructive font-medium">
                  {errors.phone_number_id.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Display Phone Number (E.164 format) *
              </Label>
              <Input
                {...register("display_phone_number")}
                placeholder="e.g. +919876543210"
                className="text-xs font-mono"
              />
              {errors.display_phone_number && (
                <p className="text-xs text-destructive font-medium">
                  {errors.display_phone_number.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Permanent System User Access Token *</span>
                <span className="text-[11px] text-muted-foreground font-normal">
                  Encrypted at rest
                </span>
              </Label>
              <Input
                type="password"
                {...register("access_token")}
                placeholder="EAAB..."
                className="text-xs font-mono"
              />
              {errors.access_token && (
                <p className="text-xs text-destructive font-medium">
                  {errors.access_token.message}
                </p>
              )}
            </div>

            <div className="p-3 bg-muted/20 border border-border/80 rounded-xl flex items-start gap-2.5 text-xs text-muted-foreground">
              <Lock className="size-4 text-success mt-0.5 shrink-0" />
              <p className="text-[11px] leading-relaxed">
                Security guarantee: Your token is transmitted directly via TLS to the backend encrypted key vault and is never logged or exposed in client bundles.
              </p>
            </div>

            <div className="pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  {...register("set_as_default")}
                  className="size-4 rounded border-input text-primary"
                />
                <span className="font-semibold text-foreground">
                  Set as default WhatsApp sending channel for campaigns &amp; chats
                </span>
              </label>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-3">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={connectMutation.isPending}
                className="font-semibold text-xs"
              >
                {connectMutation.isPending ? "Connecting..." : "Verify & Connect"}
              </Button>
            </DialogFooter>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
