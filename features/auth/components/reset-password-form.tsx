"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { resetPasswordSchema, type ResetPasswordFormData } from "../schemas";
import { useResetPasswordMutation } from "../hooks";
import { getErrorMessage } from "@/src/lib/api/errors";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Mail, KeyRound, AlertCircle, CheckCircle2, ArrowRight, Eye, EyeOff } from "lucide-react";

function ResetPasswordFormContent() {
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") || "";
  const initialToken = searchParams.get("token") || "";

  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const resetMutation = useResetPasswordMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: initialEmail,
      token: initialToken,
      password: "",
      password_confirmation: "",
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setServerError(null);
    try {
      await resetMutation.mutateAsync(data);
      setIsSuccess(true);
    } catch (error) {
      setServerError(getErrorMessage(error));
    }
  };

  if (isSuccess) {
    return (
      <Card className="w-full max-w-md shadow-lg border-border/80">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-success/15 text-success">
            <CheckCircle2 className="size-6" />
          </div>
          <CardTitle className="text-xl font-bold tracking-tight">Password Reset Complete</CardTitle>
          <CardDescription className="text-xs">
            Your password has been successfully updated. You can now use your new password to access your workspace.
          </CardDescription>
        </CardHeader>
        <CardFooter className="pt-2">
          <Link
            href="/login"
            className={buttonVariants({ variant: "default", className: "w-full font-semibold" })}
          >
            Continue to Sign In
            <ArrowRight className="ml-1.5 size-4" />
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md shadow-lg border-border/80">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-xl font-bold tracking-tight">Create New Password</CardTitle>
        <CardDescription className="text-xs">
          Set a secure, strong password for your workspace account
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

          {!initialToken && (
            <div className="flex items-start gap-2 p-3 text-xs rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>
                No reset token detected in URL. Please provide your token below or click the reset link in your email.
              </span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Mail className="size-3.5 text-muted-foreground" />
              Account Email
            </label>
            <Input
              type="email"
              placeholder="name@company.com"
              {...register("email")}
              disabled={isSubmitting || resetMutation.isPending}
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <KeyRound className="size-3.5 text-muted-foreground" />
              Reset Token
            </label>
            <Input
              type="text"
              placeholder="Paste token if not pre-filled"
              {...register("token")}
              disabled={isSubmitting || resetMutation.isPending}
              className={errors.token ? "border-destructive" : ""}
            />
            {errors.token && (
              <p className="text-xs text-destructive">{errors.token.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Lock className="size-3.5 text-muted-foreground" />
              New Password
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="At least 8 characters"
                {...register("password")}
                disabled={isSubmitting || resetMutation.isPending}
                className={`pr-10 ${errors.password ? "border-destructive" : ""}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
            <p className="text-[11px] text-muted-foreground">
              Must contain 8+ characters, at least 1 uppercase letter and 1 number or symbol.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Lock className="size-3.5 text-muted-foreground" />
              Confirm New Password
            </label>
            <div className="relative">
              <Input
                type={showConfirm ? "text" : "password"}
                placeholder="Re-enter new password"
                {...register("password_confirmation")}
                disabled={isSubmitting || resetMutation.isPending}
                className={`pr-10 ${errors.password_confirmation ? "border-destructive" : ""}`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {errors.password_confirmation && (
              <p className="text-xs text-destructive">{errors.password_confirmation.message}</p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pt-2">
          <Button
            type="submit"
            className="w-full font-semibold"
            disabled={isSubmitting || resetMutation.isPending}
          >
            {resetMutation.isPending ? (
              "Updating password..."
            ) : (
              <span className="flex items-center gap-2">
                Set New Password
                <ArrowRight className="size-4" />
              </span>
            )}
          </Button>

          <Link
            href="/login"
            className={buttonVariants({
              variant: "ghost",
              size: "sm",
              className: "w-full text-xs text-muted-foreground hover:text-foreground",
            })}
          >
            Back to sign in
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}

export function ResetPasswordForm() {
  return (
    <Suspense
      fallback={
        <Card className="w-full max-w-md p-6 text-center text-sm text-muted-foreground">
          Loading password reset form...
        </Card>
      }
    >
      <ResetPasswordFormContent />
    </Suspense>
  );
}
