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
import { ShieldCheck, ShieldAlert, QrCode } from "lucide-react";
import {
  useEnrollMfaMutation,
  useConfirmMfaMutation,
  useDisableMfaMutation,
} from "@/features/settings/hooks";

interface MfaSettingsCardProps {
  isMfaEnabled?: boolean;
}

export function MfaSettingsCard({ isMfaEnabled = false }: MfaSettingsCardProps) {
  const [mfaActive, setMfaActive] = React.useState(isMfaEnabled);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = React.useState(false);
  const [enrollData, setEnrollData] = React.useState<{
    secret: string;
    qr_code_url: string;
    recovery_codes: string[];
  } | null>(null);
  const [verifyCode, setVerifyCode] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const enrollMutation = useEnrollMfaMutation();
  const confirmMutation = useConfirmMfaMutation();
  const disableMutation = useDisableMfaMutation();

  const handleStartEnroll = async () => {
    try {
      setErrorMessage(null);
      const res = await enrollMutation.mutateAsync();
      setEnrollData(res);
      setIsEnrollModalOpen(true);
    } catch {
      setErrorMessage("Could not start MFA enrollment.");
    }
  };

  const handleConfirmCode = async () => {
    if (!verifyCode.trim()) return;
    try {
      setErrorMessage(null);
      await confirmMutation.mutateAsync(verifyCode.trim());
      setMfaActive(true);
      setIsEnrollModalOpen(false);
    } catch {
      setErrorMessage("Invalid 6-digit verification code. Please check your authenticator app.");
    }
  };

  const handleDisableMfa = async () => {
    if (confirm("Are you sure you want to disable two-factor authentication?")) {
      await disableMutation.mutateAsync("confirm_disable");
      setMfaActive(false);
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
              onClick={handleDisableMfa}
              disabled={disableMutation.isPending}
              className="text-xs text-rose-600 hover:text-rose-700"
            >
              Disable Two-Factor Auth
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleStartEnroll}
              disabled={enrollMutation.isPending}
              className="gap-1.5 text-xs font-semibold shadow-xs"
            >
              <QrCode className="size-3.5" />
              Configure Authenticator App
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Enrollment Modal */}
      <Dialog open={isEnrollModalOpen} onOpenChange={setIsEnrollModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <QrCode className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  Enroll Authenticator App
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Scan the QR code or manually enter the secret key into your TOTP app
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {errorMessage && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs font-medium text-rose-600">
              {errorMessage}
            </div>
          )}

          <div className="space-y-4 py-2 text-xs">
            <div className="p-4 bg-muted/20 border border-border/80 rounded-xl space-y-2 text-center">
              <span className="font-semibold text-foreground text-[11px] block">
                Manual Secret Key:
              </span>
              <code className="text-xs font-mono font-bold bg-background px-3 py-1.5 rounded-lg border border-border inline-block tracking-wider">
                {enrollData?.secret || "JBSWY3DPEHPK3PXP"}
              </code>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Enter 6-digit Code from Authenticator *
              </Label>
              <Input
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
                maxLength={6}
                placeholder="123456"
                className="text-center font-mono text-base tracking-widest h-10"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEnrollModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleConfirmCode}
              disabled={confirmMutation.isPending || verifyCode.length < 6}
              className="font-semibold text-xs"
            >
              {confirmMutation.isPending ? "Verifying..." : "Verify & Activate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
