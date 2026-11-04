"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { acceptInvitationSchema, type AcceptInvitationFormData } from "../schemas";
import { useAcceptInvitationMutation } from "../hooks";
import { getErrorMessage } from "@/src/lib/api/errors";
import { Button, buttonVariants } from "@/components/ui/button";
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
  User,
  Phone,
  Lock,
  Mail,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Eye,
  EyeOff,
  UserCheck,
} from "lucide-react";

function AcceptInvitationFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialToken = searchParams.get("token") || "";
  const initialEmail = searchParams.get("email") || searchParams.get("mail") || searchParams.get("to") || "";
  const displayEmail = initialEmail || "invited.member@workspace.com";

  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const acceptMutation = useAcceptInvitationMutation();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AcceptInvitationFormData>({
    resolver: zodResolver(acceptInvitationSchema),
    defaultValues: {
      token: initialToken,
      email: displayEmail,
      first_name: "",
      last_name: "",
      phone_number: "",
      password: "",
      password_confirmation: "",
    },
  });

  useEffect(() => {
    if (initialToken) {
      setValue("token", initialToken);
    }
    if (displayEmail) {
      setValue("email", displayEmail);
    }
  }, [initialToken, displayEmail, setValue]);

  const onSubmit = async (data: AcceptInvitationFormData) => {
    setServerError(null);
    try {
      await acceptMutation.mutateAsync(data);
      setIsSuccess(true);
    } catch (error) {
      setServerError(getErrorMessage(error));
    }
  };

  if (isSuccess) {
    return (
      <Card className="w-full max-w-md shadow-lg border-border/80">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-6" />
          </div>
          <CardTitle className="text-xl font-bold tracking-tight">
            Invitation Accepted!
          </CardTitle>
          <CardDescription className="text-xs">
            Your tenant account has been created and your workspace invitation has been confirmed.
          </CardDescription>
        </CardHeader>
        <CardFooter className="pt-2">
          <Button
            onClick={() => router.push("/dashboard")}
            className="w-full font-semibold gap-2"
          >
            <span>Proceed to Workspace</span>
            <ArrowRight className="size-4" />
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-lg shadow-lg border-border/80">
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-2">
          <UserCheck className="size-6" />
        </div>
        <CardTitle className="text-xl font-bold tracking-tight">
          Accept Team Invitation
        </CardTitle>
        <CardDescription className="text-xs">
          Set up your team member profile and credentials to join your organization&apos;s workspace.
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

          {/* Hidden Invitation Token Input */}
          <input type="hidden" {...register("token")} />
          {errors.token && (
            <div className="flex items-center gap-2 p-2.5 text-xs rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
              <AlertCircle className="size-4 shrink-0" />
              <span>{errors.token.message}</span>
            </div>
          )}

          {/* Uneditable Email Address Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Mail className="size-3.5 text-muted-foreground" />
                <span>Invited Email Address</span>
              </label>
              <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                <Lock className="size-3" />
                Uneditable
              </span>
            </div>
            <div className="relative">
              <Input
                type="email"
                value={displayEmail}
                readOnly
                disabled
                tabIndex={-1}
                aria-readonly="true"
                className="bg-muted/60 text-muted-foreground cursor-not-allowed select-none font-medium text-xs pr-8 border-border/80"
              />
              <Lock className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/60 pointer-events-none" />
            </div>
            <p className="text-[11px] text-muted-foreground">
              This invitation is designated for this specific email address and cannot be changed.
            </p>
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <User className="size-3.5 text-muted-foreground" />
                <span>First Name</span>
              </label>
              <Input
                type="text"
                placeholder="John"
                {...register("first_name")}
              />
              {errors.first_name && (
                <p className="text-[11px] text-destructive">
                  {errors.first_name.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <User className="size-3.5 text-muted-foreground" />
                <span>Last Name</span>
              </label>
              <Input
                type="text"
                placeholder="Doe"
                {...register("last_name")}
              />
              {errors.last_name && (
                <p className="text-[11px] text-destructive">
                  {errors.last_name.message}
                </p>
              )}
            </div>
          </div>

          {/* Phone Number */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Phone className="size-3.5 text-muted-foreground" />
              <span>Phone Number</span>
            </label>
            <Input
              type="tel"
              placeholder="+1234567890"
              {...register("phone_number")}
            />
            {errors.phone_number && (
              <p className="text-[11px] text-destructive">
                {errors.phone_number.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Lock className="size-3.5 text-muted-foreground" />
              <span>Password</span>
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••••"
                {...register("password")}
                className="pr-9"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-[11px] text-destructive">{errors.password.message}</p>
            )}
          </div>

          {/* Password Confirmation */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Lock className="size-3.5 text-muted-foreground" />
              <span>Confirm Password</span>
            </label>
            <div className="relative">
              <Input
                type={showConfirm ? "text" : "password"}
                placeholder="••••••••••••"
                {...register("password_confirmation")}
                className="pr-9"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((prev) => !prev)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            {errors.password_confirmation && (
              <p className="text-[11px] text-destructive">
                {errors.password_confirmation.message}
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-2 pt-2">
          <Button
            type="submit"
            disabled={isSubmitting || acceptMutation.isPending}
            className="w-full font-semibold gap-2"
          >
            <span>
              {isSubmitting || acceptMutation.isPending
                ? "Accepting Invitation..."
                : "Accept Invitation & Join"}
            </span>
            <ArrowRight className="size-4" />
          </Button>

          <div className="text-center text-xs text-muted-foreground mt-2">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-primary hover:underline"
            >
              Sign In
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}

export function AcceptInvitationForm() {
  return (
    <Suspense
      fallback={
        <Card className="w-full max-w-lg p-8 text-center text-xs text-muted-foreground">
          Loading invitation...
        </Card>
      }
    >
      <AcceptInvitationFormContent />
    </Suspense>
  );
}

