"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginSchema, type LoginFormData } from "../schemas";
import { useLoginMutation } from "../hooks";
import { useAuthStore } from "@/lib/auth/store";
import { MfaVerifyForm } from "./mfa-verify-form";
import { getErrorMessage } from "@/src/lib/api/errors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Mail, Building2, AlertCircle, ArrowRight, Eye, EyeOff } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const mfaChallenge = useAuthStore((s) => s.mfaChallenge);
  const loginMutation = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      tenantId: "1",
    },
  });

  if (mfaChallenge) {
    return <MfaVerifyForm />;
  }

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    try {
      const res = await loginMutation.mutateAsync(data);
      if (res?.mfa_required) {
        return;
      }

      // Check if user has no workspaces or workspace is required
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
    } catch (error) {
      setServerError(getErrorMessage(error));
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg border-border/80">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-xl font-bold tracking-tight">Sign in to your Workspace</CardTitle>
        <CardDescription className="text-xs">
          Enter your team credentials to access your WhatsApp CRM inbox
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
              Work Email
            </label>
            <Input
              type="email"
              placeholder="name@company.com"
              {...register("email")}
              disabled={isSubmitting || loginMutation.isPending}
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Lock className="size-3.5 text-muted-foreground" />
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-primary hover:underline font-medium"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register("password")}
                disabled={isSubmitting || loginMutation.isPending}
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
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Building2 className="size-3.5 text-muted-foreground" />
              Tenant / Workspace ID
            </label>
            <Input
              type="text"
              placeholder="1"
              {...register("tenantId")}
              disabled={isSubmitting || loginMutation.isPending}
            />
            <p className="text-[11px] text-muted-foreground">
              Optional: Identifies your company or branch ID (defaults to 1).
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pt-2">
          <Button
            type="submit"
            className="w-full font-semibold"
            disabled={isSubmitting || loginMutation.isPending}
          >
            {loginMutation.isPending ? (
              "Authenticating..."
            ) : (
              <span className="flex items-center gap-2">
                Continue to Workspace
                <ArrowRight className="size-4" />
              </span>
            )}
          </Button>

          <div className="flex items-center justify-between w-full pt-2 border-t border-border/50 text-xs">
            <span className="text-muted-foreground">Need a new workspace?</span>
            <Link
              href="/organization-setup"
              className="text-primary hover:underline font-medium"
            >
              Set up organization
            </Link>
          </div>

          <p className="text-center text-[11px] text-muted-foreground">
            Protected with multi-tenant isolation and TLS encryption.
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
