"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { forgotPasswordSchema, type ForgotPasswordFormData } from "../schemas";
import { useForgotPasswordMutation } from "../hooks";
import { getErrorMessage } from "@/src/lib/api/errors";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, AlertCircle, ArrowLeft, CheckCircle2, Send } from "lucide-react";

export function ForgotPasswordForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const forgotMutation = useForgotPasswordMutation();

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setServerError(null);
    try {
      await forgotMutation.mutateAsync(data.email);
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
          <CardTitle className="text-xl font-bold tracking-tight">Check your email</CardTitle>
          <CardDescription className="text-xs">
            We sent instructions to{" "}
            <span className="font-semibold text-foreground">{getValues("email")}</span>.
            Click the link in the email to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground text-center">
            Did not receive the email? Check your spam folder or try again in a few minutes.
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 pt-2">
          <Link
            href="/login"
            className={buttonVariants({ variant: "outline", className: "w-full" })}
          >
            <ArrowLeft className="mr-1.5 size-4" />
            Return to sign in
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md shadow-lg border-border/80">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-xl font-bold tracking-tight">Forgot password?</CardTitle>
        <CardDescription className="text-xs">
          Enter your registered work email and we&apos;ll send you a password reset link.
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

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Mail className="size-3.5 text-muted-foreground" />
              Registered Email
            </label>
            <Input
              type="email"
              placeholder="name@company.com"
              autoFocus
              {...register("email")}
              disabled={isSubmitting || forgotMutation.isPending}
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pt-2">
          <Button
            type="submit"
            className="w-full font-semibold"
            disabled={isSubmitting || forgotMutation.isPending}
          >
            {forgotMutation.isPending ? (
              "Sending link..."
            ) : (
              <span className="flex items-center gap-2">
                Send Reset Link
                <Send className="size-3.5" />
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
            <ArrowLeft className="mr-1.5 size-3.5" />
            Back to sign in
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}
