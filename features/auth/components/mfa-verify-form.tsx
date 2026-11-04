"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { mfaVerifySchema, type MfaVerifyFormData } from "../schemas";
import { useMfaVerifyMutation, useAdminMfaVerifyMutation } from "../hooks";
import { useAuthStore } from "@/lib/auth/store";
import { getErrorMessage } from "@/src/lib/api/errors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  KeyRound,
  Key,
} from "lucide-react";

export function MfaVerifyForm() {
  const router = useRouter();
  const mfaChallenge = useAuthStore((s) => s.mfaChallenge);
  const setMfaChallenge = useAuthStore((s) => s.setMfaChallenge);

  const [serverError, setServerError] = useState<string | null>(null);
  const [isRecoveryMode, setIsRecoveryMode] = useState<boolean>(false);
  const [recoveryCode, setRecoveryCode] = useState<string>("");

  // Verification 6-digit segmented inputs
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const verifyMutation = useMfaVerifyMutation();
  const adminVerifyMutation = useAdminMfaVerifyMutation();

  const {
    handleSubmit,
    setValue,
    watch,
  } = useForm<MfaVerifyFormData>({
    resolver: zodResolver(mfaVerifySchema),
    defaultValues: {
      challenge_token: mfaChallenge?.challengeToken || "",
      code: "",
    },
  });

  const challengeToken = watch("challenge_token") || mfaChallenge?.challengeToken || "";

  // Keep challenge token in sync if mfaChallenge changes
  useEffect(() => {
    if (mfaChallenge?.challengeToken) {
      setValue("challenge_token", mfaChallenge.challengeToken);
    }
  }, [mfaChallenge, setValue]);

  // Handle segmented OTP digits
  const handleOtpChange = (index: number, value: string) => {
    const cleanVal = value.replace(/\D/g, "");
    if (!cleanVal) {
      const nextDigits = [...otpDigits];
      nextDigits[index] = "";
      setOtpDigits(nextDigits);
      setValue("code", nextDigits.join(""));
      return;
    }

    const char = cleanVal.slice(-1);
    const nextDigits = [...otpDigits];
    nextDigits[index] = char;
    setOtpDigits(nextDigits);
    const fullCode = nextDigits.join("");
    setValue("code", fullCode);

    // Auto-advance to next box
    if (index < 5 && char) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const nextDigits = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      nextDigits[i] = pasted[i] || "";
    }
    setOtpDigits(nextDigits);
    setValue("code", nextDigits.join(""));

    const targetIdx = Math.min(pasted.length, 5);
    inputRefs.current[targetIdx]?.focus();
  };

  const handleSuccessRedirect = (res: any) => {
    const needsOnboarding =
      res?.workspace_required ||
      !res?.workspaces ||
      res.workspaces.length === 0;
    const targetUrl = needsOnboarding ? "/organization-setup" : "/dashboard";
    if (typeof window !== "undefined") {
      window.location.href = targetUrl;
    } else {
      router.push(targetUrl);
    }
  };

  const onVerifySubmit = async (data: MfaVerifyFormData) => {
    setServerError(null);
    try {
      const res = await verifyMutation.mutateAsync({
        challenge_token: data.challenge_token,
        code: data.code,
      });
      handleSuccessRedirect(res);
    } catch (err) {
      setServerError(getErrorMessage(err));
    }
  };

  const onRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = recoveryCode.trim();
    if (!cleanCode) {
      setServerError("Please enter your emergency backup recovery code.");
      return;
    }

    setServerError(null);
    try {
      // Calls {{base_url}}/api/auth/admin/mfa/verify
      const res = await adminVerifyMutation.mutateAsync({
        challenge_token: challengeToken,
        code: cleanCode,
        recovery_code: cleanCode,
      });
      handleSuccessRedirect(res);
    } catch (err) {
      setServerError(getErrorMessage(err));
    }
  };

  const handleBackToLogin = () => {
    setMfaChallenge(null);
  };

  const isPending = verifyMutation.isPending || adminVerifyMutation.isPending;

  return (
    <Card className="w-full max-w-md shadow-xl border-border/80">
      <CardHeader className="space-y-2 text-center pb-3">
        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-4 ring-primary/5">
          {isRecoveryMode ? <KeyRound className="size-6 text-emerald-600" /> : <ShieldCheck className="size-6" />}
        </div>
        <div>
          <CardTitle className="text-xl font-bold tracking-tight text-foreground">
            {isRecoveryMode ? "Use Backup Recovery Code" : "Two-Factor Authentication"}
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-0.5">
            {isRecoveryMode
              ? "Enter one of your emergency recovery codes that was generated when you confirmed 2FA"
              : "Enter the 6-digit verification code from your authenticator application"}
          </CardDescription>
        </div>
      </CardHeader>

      {/* RECOVERY CODE MODE */}
      {isRecoveryMode ? (
        <form onSubmit={onRecoverySubmit}>
          <CardContent className="space-y-4">
            {serverError && (
              <div className="flex items-start gap-2.5 p-3 text-xs rounded-xl bg-destructive/10 text-destructive border border-destructive/20 animate-in fade-in-0">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{serverError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Emergency Recovery Code</span>
                <span className="text-[10px] text-muted-foreground font-mono">One-time Use</span>
              </label>
              <Input
                type="text"
                placeholder="e.g. A1B2-C3D4"
                value={recoveryCode}
                onChange={(e) => setRecoveryCode(e.target.value.toUpperCase())}
                autoFocus
                disabled={isPending}
                className="text-center font-mono text-base font-bold tracking-widest h-11 uppercase"
              />
              <p className="text-[11px] text-muted-foreground">
                Each recovery code can only be used once. After use, it is permanently invalidated by the security server.
              </p>
            </div>

            {/* Fallback Challenge Token (if not present from session) */}
            {!mfaChallenge?.challengeToken && (
              <div className="space-y-1.5 pt-1">
                <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                  <KeyRound className="size-3" />
                  MFA Challenge Token
                </label>
                <input
                  type="text"
                  placeholder="Paste challenge token here..."
                  value={challengeToken}
                  onChange={(e) => setValue("challenge_token", e.target.value)}
                  className="w-full font-mono text-xs h-9 rounded-lg border border-border/80 bg-muted/40 px-3 text-foreground focus:outline-none focus:border-ring"
                />
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-2.5 pt-2 pb-5">
            <Button
              type="submit"
              className="w-full font-semibold h-10"
              disabled={isPending || !recoveryCode.trim()}
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Verifying Recovery Code...
                </>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Verify &amp; Sign In
                  <ArrowRight className="size-4" />
                </span>
              )}
            </Button>

            <button
              type="button"
              onClick={() => {
                setIsRecoveryMode(false);
                setServerError(null);
              }}
              className="text-xs text-primary hover:underline font-medium flex items-center justify-center gap-1.5 py-1"
            >
              <ShieldCheck className="size-3.5" />
              Use 6-digit authenticator app code instead
            </button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleBackToLogin}
              className="w-full text-xs text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-1.5 size-3.5" />
              Back to Account Sign In
            </Button>

            <p className="text-center text-[10px] text-muted-foreground mt-1">
              Protected by <code className="text-[10px] font-mono">/api/auth/admin/mfa/verify</code> emergency verification.
            </p>
          </CardFooter>
        </form>
      ) : (
        /* STANDARD 6-DIGIT TOTP MODE */
        <form onSubmit={handleSubmit(onVerifySubmit)}>
          <CardContent className="space-y-4">
            {serverError && (
              <div className="flex items-start gap-2.5 p-3 text-xs rounded-xl bg-destructive/10 text-destructive border border-destructive/20 animate-in fade-in-0">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{serverError}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Security Code</span>
                <span className="text-[11px] text-muted-foreground font-mono">6-Digit OTP</span>
              </label>

              {/* 6 Individual OTP Boxes */}
              <div className="flex items-center justify-between gap-2">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      inputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    onPaste={idx === 0 ? handleOtpPaste : undefined}
                    autoFocus={idx === 0}
                    className="size-11 sm:size-12 text-center font-mono text-xl font-bold rounded-xl border border-border/80 bg-background text-foreground shadow-xs focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/40 transition-all"
                  />
                ))}
              </div>
            </div>

            {/* Fallback Challenge Token (if not present from session) */}
            {!mfaChallenge?.challengeToken && (
              <div className="space-y-1.5 pt-1">
                <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                  <KeyRound className="size-3" />
                  MFA Challenge Token
                </label>
                <input
                  type="text"
                  placeholder="Paste challenge token here..."
                  value={challengeToken}
                  onChange={(e) => setValue("challenge_token", e.target.value)}
                  className="w-full font-mono text-xs h-9 rounded-lg border border-border/80 bg-muted/40 px-3 text-foreground focus:outline-none focus:border-ring"
                />
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-2.5 pt-2 pb-5">
            <Button
              type="submit"
              className="w-full font-semibold h-10"
              disabled={isPending || otpDigits.join("").length !== 6}
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Verifying Security Code...
                </>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Verify and Continue
                  <ArrowRight className="size-4" />
                </span>
              )}
            </Button>

            <button
              type="button"
              onClick={() => {
                setIsRecoveryMode(true);
                setServerError(null);
              }}
              className="text-xs text-primary hover:underline font-medium flex items-center justify-center gap-1.5 py-1"
            >
              <KeyRound className="size-3.5" />
              Lost access to your authenticator? Use a recovery code
            </button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleBackToLogin}
              className="w-full text-xs text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-1.5 size-3.5" />
              Back to Account Sign In
            </Button>

            <p className="text-center text-[10px] text-muted-foreground mt-1">
              Protected with RFC 6238 TOTP standard &amp; multi-tenant isolation.
            </p>
          </CardFooter>
        </form>
      )}
    </Card>
  );
}
