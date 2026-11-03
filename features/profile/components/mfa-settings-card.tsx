"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ShieldCheck, ShieldAlert, QrCode, Lock, Eye, EyeOff, Copy, Check, Loader2, ArrowRight } from "lucide-react";
import {
  useEnrollMfaMutation,
  useConfirmMfaMutation,
  useDisableMfaMutation,
} from "@/features/settings/hooks";
import { getErrorMessage } from "@/src/lib/api/errors";

interface MfaSettingsCardProps {
  isMfaEnabled?: boolean;
}

export function MfaSettingsCard({ isMfaEnabled = false }: MfaSettingsCardProps) {
  const [mfaActive, setMfaActive] = React.useState(isMfaEnabled);

  // Enrollment modal state
  const [isEnrollModalOpen, setIsEnrollModalOpen] = React.useState(false);
  const [enrollStep, setEnrollStep] = React.useState<"password" | "qr">("password");
  const [enrollPassword, setEnrollPassword] = React.useState("");
  const [showEnrollPassword, setShowEnrollPassword] = React.useState(false);
  const [enrollData, setEnrollData] = React.useState<{
    secret: string;
    qr_code_svg?: string;
    qr_code_url?: string;
    provisioning_uri?: string;
    recovery_codes?: string[];
  } | null>(null);
  const [verifyCode, setVerifyCode] = React.useState("");
  const [copiedKey, setCopiedKey] = React.useState(false);

  // Disable modal state
  const [isDisableModalOpen, setIsDisableModalOpen] = React.useState(false);
  const [disablePassword, setDisablePassword] = React.useState("");
  const [disableCode, setDisableCode] = React.useState("");
  const [showDisablePassword, setShowDisablePassword] = React.useState(false);

  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const enrollMutation = useEnrollMfaMutation();
  const confirmMutation = useConfirmMfaMutation();
  const disableMutation = useDisableMfaMutation();

  const handleOpenEnrollModal = () => {
    setEnrollStep("password");
    setEnrollPassword("");
    setVerifyCode("");
    setEnrollData(null);
    setErrorMessage(null);
    setIsEnrollModalOpen(true);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollPassword.trim()) {
      setErrorMessage("Please enter your password to continue.");
      return;
    }

    try {
      setErrorMessage(null);
      const res = await enrollMutation.mutateAsync(enrollPassword.trim());
      setEnrollData(res);
      setEnrollStep("qr");
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
    }
  };

  const handleConfirmCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = verifyCode.trim();
    if (cleanCode.length !== 6) {
      setErrorMessage("Please enter the 6-digit code shown in your authenticator app.");
      return;
    }

    try {
      setErrorMessage(null);
      await confirmMutation.mutateAsync(cleanCode);
      setMfaActive(true);
      setIsEnrollModalOpen(false);
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
    }
  };

  const handleOpenDisableModal = () => {
    setDisablePassword("");
    setDisableCode("");
    setErrorMessage(null);
    setIsDisableModalOpen(true);
  };

  const handleDisableSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disablePassword.trim() || disableCode.trim().length !== 6) {
      setErrorMessage("Both your password and a 6-digit code are required to disable 2FA.");
      return;
    }

    try {
      setErrorMessage(null);
      await disableMutation.mutateAsync({
        password: disablePassword.trim(),
        code: disableCode.trim(),
      });
      setMfaActive(false);
      setIsDisableModalOpen(false);
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
    }
  };

  const handleCopySecret = (text: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  return (
    <>
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="border-b border-border/60 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${
                  mfaActive
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                }`}
              >
                {mfaActive ? (
                  <ShieldCheck className="size-5" />
                ) : (
                  <ShieldAlert className="size-5" />
                )}
              </div>
              <div>
                <CardTitle className="text-base font-bold text-foreground">
                  Two-Factor Authentication (MFA / 2FA)
                </CardTitle>
                <CardDescription className="text-xs">
                  Protect your CRM account with an authenticator app (Google Authenticator, Authy, or 1Password)
                </CardDescription>
              </div>
            </div>

            <Badge
              variant="outline"
              className={`text-[10px] font-semibold gap-1 ${
                mfaActive
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {mfaActive ? "Enforced & Active" : "Not Configured"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-5 text-xs text-muted-foreground leading-relaxed">
          {mfaActive ? (
            <p>
              Two-factor authentication is currently enabled for this account. You will be prompted to enter a 6-digit TOTP security code each time you sign in on an unrecognized device.
            </p>
          ) : (
            <p>
              Add an extra layer of defense to keep WhatsApp customer conversation data secure. We strongly recommend all administrators and support agents enforce 2FA.
            </p>
          )}
        </CardContent>

        <CardFooter className="border-t border-border/60 py-3 px-4 sm:px-5 flex items-center justify-end gap-3">
          {mfaActive ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenDisableModal}
              className="text-xs text-destructive hover:bg-destructive/10"
            >
              Disable Two-Factor Auth
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleOpenEnrollModal}
              className="gap-1.5 text-xs font-semibold shadow-xs"
            >
              <QrCode className="size-3.5" />
              Configure Authenticator App
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Enrollment Multi-step Modal */}
      <Dialog open={isEnrollModalOpen} onOpenChange={setIsEnrollModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <QrCode className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  {enrollStep === "password" ? "Confirm Account Password" : "Scan QR Code with Authenticator"}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  {enrollStep === "password"
                    ? "Enter your password to verify your identity and generate 2FA credentials"
                    : "Scan the QR code or enter the secret key into Google Authenticator or Authy"}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {errorMessage && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-xs font-medium text-destructive">
              {errorMessage}
            </div>
          )}

          {/* STEP 1: ASK FOR PASSWORD */}
          {enrollStep === "password" && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Lock className="size-3.5 text-muted-foreground" />
                  Your Account Password
                </Label>
                <div className="relative">
                  <Input
                    type={showEnrollPassword ? "text" : "password"}
                    placeholder="Enter your current password"
                    value={enrollPassword}
                    onChange={(e) => setEnrollPassword(e.target.value)}
                    disabled={enrollMutation.isPending}
                    autoFocus
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEnrollPassword(!showEnrollPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showEnrollPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Required by the security backend to initiate 2FA enrollment.
                </p>
              </div>

              <DialogFooter className="gap-2 sm:gap-0 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEnrollModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={enrollMutation.isPending || !enrollPassword.trim()}
                  className="font-semibold text-xs gap-1.5"
                >
                  {enrollMutation.isPending ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin mr-1" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="size-3.5" />
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}

          {/* STEP 2: QR CODE & CONFIRM CODE */}
          {enrollStep === "qr" && (
            <form onSubmit={handleConfirmCode} className="space-y-4 py-2 text-xs">
              {enrollData?.qr_code_svg && (
                <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-white border border-border">
                  <img
                    src={enrollData.qr_code_svg}
                    alt="Authenticator QR Code"
                    className="size-44 object-contain"
                  />
                  <p className="text-[10px] font-semibold text-neutral-600 mt-1">
                    Scan with Google Authenticator, Authy, or 1Password
                  </p>
                </div>
              )}

              <div className="p-3 bg-muted/40 border border-border/80 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground text-[11px]">
                    Secret Key (Manual Entry):
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopySecret(enrollData?.secret || "")}
                    className="text-[11px] text-primary hover:underline flex items-center gap-1"
                  >
                    {copiedKey ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
                    <span>{copiedKey ? "Copied" : "Copy"}</span>
                  </button>
                </div>
                <code className="text-xs font-mono font-bold bg-background px-3 py-1.5 rounded-lg border border-border block text-center tracking-wider select-all">
                  {enrollData?.secret || "JBSWY3DPEHPK3PXP"}
                </code>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Enter 6-digit Code from Authenticator *</span>
                  <span className="text-[10px] text-muted-foreground font-mono">TOTP</span>
                </Label>
                <Input
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ""))}
                  maxLength={6}
                  placeholder="123456"
                  autoFocus
                  className="text-center font-mono text-lg tracking-widest h-11"
                />
              </div>

              <DialogFooter className="gap-2 sm:gap-0 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEnrollModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={confirmMutation.isPending || verifyCode.trim().length !== 6}
                  className="font-semibold text-xs gap-1.5"
                >
                  {confirmMutation.isPending ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin mr-1" />
                      Activating...
                    </>
                  ) : (
                    <>
                      <Check className="size-3.5" />
                      Verify & Activate 2FA
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Disable 2FA Modal */}
      <Dialog open={isDisableModalOpen} onOpenChange={setIsDisableModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
                <ShieldAlert className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  Disable Two-Factor Authentication
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Confirm your password and 6-digit code to turn off 2FA protection
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {errorMessage && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-xs font-medium text-destructive">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleDisableSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Lock className="size-3.5 text-muted-foreground" />
                Account Password
              </Label>
              <div className="relative">
                <Input
                  type={showDisablePassword ? "text" : "password"}
                  placeholder="Enter your account password"
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                  disabled={disableMutation.isPending}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowDisablePassword(!showDisablePassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showDisablePassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Authenticator OTP Code</span>
                <span className="text-[10px] text-muted-foreground font-mono">6 Digits</span>
              </Label>
              <Input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="123456"
                value={disableCode}
                onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, ""))}
                disabled={disableMutation.isPending}
                className="text-center font-mono text-lg tracking-widest"
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsDisableModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                size="sm"
                disabled={
                  disableMutation.isPending ||
                  !disablePassword.trim() ||
                  disableCode.trim().length !== 6
                }
                className="font-semibold text-xs"
              >
                {disableMutation.isPending ? "Disabling..." : "Disable 2FA"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
