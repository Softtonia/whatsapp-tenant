"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { mfaVerifySchema, type MfaVerifyFormData } from "../schemas";
import { useMfaVerifyMutation } from "../hooks";
import { useAuthStore } from "@/lib/auth/store";
import { getErrorMessage } from "@/src/lib/api/errors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, AlertCircle, ArrowRight, ArrowLeft } from "lucide-react";

export function MfaVerifyForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const mfaChallenge = useAuthStore((s) => s.mfaChallenge);
  const setMfaChallenge = useAuthStore((s) => s.setMfaChallenge);
  const mfaMutation = useMfaVerifyMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MfaVerifyFormData>({
    resolver: zodResolver(mfaVerifySchema),
    defaultValues: {
      challenge_token: mfaChallenge?.challengeToken || "",
      code: "",
    },
  });

  const onSubmit = async (data: MfaVerifyFormData) => {
    setServerError(null);
    try {
      await mfaMutation.mutateAsync({
        challenge_token: data.challenge_token,
        code: data.code,
      });
      router.push("/dashboard");
    } catch (error) {
      setServerError(getErrorMessage(error));
    }
  };

  const handleCancel = () => {
    setMfaChallenge(null);
  };

  return (
    <Card className="w-full max-w-md shadow-lg border-border/80">
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <ShieldCheck className="size-6" />
        </div>
        <CardTitle className="text-xl font-bold tracking-tight">Two-Factor Authentication</CardTitle>
        <CardDescription className="text-xs">
          Enter the 6-digit authentication code sent to{" "}
          <span className="font-semibold text-foreground">
            {mfaChallenge?.email || "your registered account"}
          </span>
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {serverError && (
            <div className="flex items-center gap-2 p-3 text-xs rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
              <AlertCircle className="size-4 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <input type="hidden" {...register("challenge_token")} />

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>Security Code</span>
              <span className="text-[11px] text-muted-foreground">6-digit OTP</span>
            </label>
            <Input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              autoFocus
              className={`text-center font-mono text-lg tracking-widest ${
                errors.code ? "border-destructive" : ""
              }`}
              {...register("code")}
              disabled={isSubmitting || mfaMutation.isPending}
            />
            {errors.code && (
              <p className="text-xs text-destructive">{errors.code.message}</p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-2.5 pt-2">
          <Button
            type="submit"
            className="w-full font-semibold"
            disabled={isSubmitting || mfaMutation.isPending}
          >
            {mfaMutation.isPending ? (
              "Verifying..."
            ) : (
              <span className="flex items-center gap-2">
                Verify and Continue
                <ArrowRight className="size-4" />
              </span>
            )}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="w-full text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-1.5 size-3.5" />
            Back to sign in
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

