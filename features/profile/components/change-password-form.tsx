"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound, CheckCircle2, Lock } from "lucide-react";
import { changePasswordSchema, type ChangePasswordFormData } from "@/features/settings/schemas";
import { useChangePasswordMutation } from "@/features/settings/hooks";

export function ChangePasswordForm() {
  const [successFeedback, setSuccessFeedback] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const changeMutation = useChangePasswordMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      setErrorMessage(null);
      await changeMutation.mutateAsync({
        current_password: data.current_password,
        new_password: data.new_password,
      });
      setSuccessFeedback(true);
      reset();
      setTimeout(() => setSuccessFeedback(false), 5000);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to change password. Check current password."
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="border-b border-border/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <KeyRound className="size-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-foreground">
                Account Security &amp; Password
              </CardTitle>
              <CardDescription className="text-xs">
                Update your account password to secure shared workspace access
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-5 space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs font-medium text-rose-600">
              {errorMessage}
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              Current Password *
            </Label>
            <Input
              type="password"
              {...register("current_password")}
              placeholder="••••••••"
              className="text-xs"
            />
            {errors.current_password && (
              <p className="text-xs text-rose-500 font-medium">
                {errors.current_password.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                New Password (Min 8 chars) *
              </Label>
              <Input
                type="password"
                {...register("new_password")}
                placeholder="••••••••"
                className="text-xs"
              />
              {errors.new_password && (
                <p className="text-xs text-rose-500 font-medium">
                  {errors.new_password.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Confirm New Password *
              </Label>
              <Input
                type="password"
                {...register("confirm_password")}
                placeholder="••••••••"
                className="text-xs"
              />
              {errors.confirm_password && (
                <p className="text-xs text-rose-500 font-medium">
                  {errors.confirm_password.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="border-t border-border/60 py-3 px-4 sm:px-5 flex items-center justify-between">
          <div>
            {successFeedback && (
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="size-4" />
                Password updated successfully
              </span>
            )}
          </div>
          <Button
            type="submit"
            size="sm"
            disabled={changeMutation.isPending}
            className="gap-1.5 text-xs font-semibold shadow-xs"
          >
            <Lock className="size-3.5" />
            {changeMutation.isPending ? "Updating Password..." : "Update Password"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

