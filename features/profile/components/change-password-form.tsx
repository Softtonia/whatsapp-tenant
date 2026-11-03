"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  KeyRound,
  CheckCircle2,
  Lock,
  Mail,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Loader2,
  RefreshCw,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth/store";
import {
  useSendChangePasswordOtpMutation,
  useVerifyChangePasswordOtpMutation,
  useChangePasswordWithOtpMutation,
} from "@/features/auth/hooks";
import { getErrorMessage } from "@/src/lib/api/errors";

export function ChangePasswordForm() {
  const user = useAuthStore((s) => s.user);

  // Stepper state: 1 = Send OTP, 2 = Verify OTP, 3 = Set New Password
  const [step, setStep] = React.useState<1 | 2 | 3>(1);

  // Verification token received from step 2
  const [authToken, setAuthToken] = React.useState<string>("");

  // Form fields
  const [otpCode, setOtpCode] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  // UI status states
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = React.useState(0);

  // Mutations
  const sendOtpMutation = useSendChangePasswordOtpMutation();
  const verifyOtpMutation = useVerifyChangePasswordOtpMutation();
  const changePasswordMutation = useChangePasswordWithOtpMutation();

  // Cooldown timer effect
  React.useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // STEP 1: Send OTP
  const handleSendOtp = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const res = await sendOtpMutation.mutateAsync();
      setSuccessMessage(res.message || "Password change OTP sent to your registered email address.");
      setStep(2);
      setResendCooldown(60);
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
    }
  };

  // STEP 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOtp = otpCode.trim();
    if (cleanOtp.length !== 6) {
      setErrorMessage("Please enter the 6-digit OTP sent to your email.");
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const res = await verifyOtpMutation.mutateAsync(cleanOtp);
      const token = res.auth_token || res.data?.auth_token;
      if (!token) {
        throw new Error("Unable to obtain authorization token. Please request a new OTP.");
      }
      setAuthToken(token);
      setSuccessMessage("OTP verified successfully. Please enter your new password.");
      setStep(3);
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
    }
  };

  // STEP 3: Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setErrorMessage("New password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage("New password and confirmation do not match.");
      return;
    }
    if (!authToken) {
      setErrorMessage("Authorization token is missing. Please restart OTP verification.");
      setStep(1);
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const res = await changePasswordMutation.mutateAsync({
        auth_token: authToken,
        new_password: newPassword,
        new_password_confirmation: confirmPassword,
      });
      setSuccessMessage(res.message || "Password updated successfully! Your account is secured with your new password.");
      // Reset form
      setStep(1);
      setAuthToken("");
      setOtpCode("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
    }
  };

  const userEmail = user?.email || "your registered email";

  return (
    <Card className="border-border/80 shadow-xs">
      <CardHeader className="border-b border-border/60 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <KeyRound className="size-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-foreground">
                Account Security &amp; Password
              </CardTitle>
              <CardDescription className="text-xs">
                Update your account password with email OTP verification
              </CardDescription>
            </div>
          </div>

          {/* Stepper Badge */}
          <Badge variant="outline" className="text-[10px] font-semibold gap-1">
            Step {step} of 3: {step === 1 ? "Request OTP" : step === 2 ? "Verify OTP" : "Set Password"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 space-y-4 text-xs">
        {/* Alerts */}
        {errorMessage && (
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 animate-in fade-in-0">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 animate-in fade-in-0">
            <CheckCircle2 className="size-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
            <span className="leading-relaxed">{successMessage}</span>
          </div>
        )}

        {/* STEP 1: REQUEST OTP */}
        {step === 1 && (
          <div className="space-y-4 py-1">
            <div className="p-4 rounded-xl bg-muted/40 border border-border/60 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <Mail className="size-4 text-primary" />
                <span>Verification Code Required</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                For security reasons, changing your password requires a 6-digit one-time password (OTP) sent to your registered email:{" "}
                <strong className="text-foreground font-semibold">{userEmail}</strong>.
              </p>
            </div>

            <Button
              type="button"
              onClick={handleSendOtp}
              disabled={sendOtpMutation.isPending}
              className="gap-2 font-semibold text-xs h-10 w-full sm:w-auto"
            >
              {sendOtpMutation.isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Sending Verification OTP...
                </>
              ) : (
                <>
                  <Mail className="size-3.5" />
                  Send Verification OTP to Email
                </>
              )}
            </Button>
          </div>
        )}

        {/* STEP 2: VERIFY OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4 py-1">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Enter 6-Digit Email OTP</span>
                <span className="text-[11px] text-muted-foreground font-mono">Sent to {userEmail}</span>
              </Label>
              <Input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="123456"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                autoFocus
                disabled={verifyOtpMutation.isPending}
                className="text-center font-mono text-xl tracking-widest h-11 max-w-xs"
              />
              <p className="text-[11px] text-muted-foreground">
                Verified via <code className="font-mono">/api/auth/change-password/verify-otp</code>. Code expires in 10 minutes.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button
                type="submit"
                disabled={verifyOtpMutation.isPending || otpCode.trim().length !== 6}
                className="gap-1.5 font-semibold text-xs h-9"
              >
                {verifyOtpMutation.isPending ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    Verifying OTP...
                  </>
                ) : (
                  <>
                    Verify OTP &amp; Proceed
                    <ArrowRight className="size-3.5" />
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSendOtp}
                disabled={sendOtpMutation.isPending || resendCooldown > 0}
                className="text-xs h-9 gap-1.5"
              >
                <RefreshCw className={`size-3.5 ${sendOtpMutation.isPending ? "animate-spin" : ""}`} />
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStep(1);
                  setErrorMessage(null);
                }}
                className="text-xs h-9 text-muted-foreground hover:text-foreground"
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        {/* STEP 3: SET NEW PASSWORD */}
        {step === 3 && (
          <form onSubmit={handleChangePassword} className="space-y-4 py-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  New Password (Min 8 chars) *
                </Label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter new strong password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={changePasswordMutation.isPending}
                    autoFocus
                    className="pr-10 text-xs h-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  Confirm New Password *
                </Label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={changePasswordMutation.isPending}
                    className="pr-10 text-xs h-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                type="submit"
                disabled={
                  changePasswordMutation.isPending ||
                  newPassword.length < 8 ||
                  newPassword !== confirmPassword
                }
                className="gap-1.5 font-semibold text-xs h-10 shadow-xs"
              >
                {changePasswordMutation.isPending ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    Saving New Password...
                  </>
                ) : (
                  <>
                    <Lock className="size-3.5" />
                    Save &amp; Update Password
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStep(1);
                  setAuthToken("");
                  setErrorMessage(null);
                }}
                className="text-xs h-10 text-muted-foreground hover:text-foreground"
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </CardContent>

      <CardFooter className="border-t border-border/60 py-3 px-4 sm:px-5 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>Protected with TLS encryption and single-use 64-character verification tokens.</span>
        <ShieldCheck className="size-4 text-primary" />
      </CardFooter>
    </Card>
  );
}
